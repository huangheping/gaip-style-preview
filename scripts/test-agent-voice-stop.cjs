/* State/data regression; no microphone/ASR and no real canvas rendering. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync('components/ai-agent/AI Agent本地Mock.js','utf8');
const tick = () => new Promise(r => setTimeout(r,70));
(async()=>{
 const dom = new JSDOM('<div class="ant-modal-root"><div class="ant-modal-mask"></div><div class="ant-modal-wrap"><section class="agentModal___Nxp06"><div class="modalRenderWrapper___qz3XP"><div id="agentModalContentArea"><div class="chatPanel___qIDO_" data-gaip-empty-session="true"><ul class="msgBox___NYtlO"><li>Existing message</li></ul></div></div><div class="inputRow___Sqmy8"><textarea class="textarea___GMXtD"></textarea><button class="sendBtn___m_z0G">Send</button></div><img class="closeIcon___X96Lj"></div></section></div></div>',{url:'http://localhost/channels/workspace/index.html#/workspace',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document;const observers=[];
 const NativeObserver=w.MutationObserver;
 w.MutationObserver=class extends NativeObserver {constructor(cb){super(cb);observers.push(this);}};
 w.ReadableStream=ReadableStream;w.Response=Response;w.TextEncoder=TextEncoder;
 w.HTMLCanvasElement.prototype.getContext=()=>null;
 w.eval(source);await tick();
 const modal=d.querySelector('.agentModal___Nxp06'),input=d.querySelector('textarea');
 assert.equal(d.querySelector('.chatPanel___qIDO_').hasAttribute('data-gaip-empty-session'),false,'nonempty history clears a stale empty-session marker');
 let at=0,id=0;const timers=new Map();
 w.setTimeout=(fn,ms)=>{timers.set(++id,{fn,time:at+(ms||0)});return id;};
 w.clearTimeout=id=>timers.delete(id);
 const advance=(ms)=>{const end=at+ms;for(;;){const next=[...timers].filter(([,t])=>t.time<=end).sort((a,b)=>a[1].time-b[1].time)[0];if(!next)break;timers.delete(next[0]);at=next[1].time;next[1].fn();}at=end;};
 const mock=w.__GAIP_AGENT_MOCK__;
 const make=()=>mock.fetch('/api/gaip/agent/chat/send',{body:JSON.stringify({sessionId:10001,message:'Test'})});
 try {
  const res=await make();const reader=res.body.getReader();
  let text='';const draining=(async()=>{for(;;){const r=await reader.read();if(r.done)break;text+=new TextDecoder().decode(r.value);}})();
  assert.equal(modal.dataset.gaipAgentGenerating,'true');
  assert.equal(modal.querySelector('.gaip-agent-stop').hidden,false);
  advance(280); // during the long reasoning delay
  modal.querySelector('.gaip-agent-stop').click();mock.stop();await draining;
  assert.ok(text.includes('[DONE]'));assert.ok(text.includes('已停止生成。'));
  assert.ok(!text.includes('客户需求概览'),'stop does not wait for or emit the remaining answer');
  assert.equal(modal.dataset.gaipAgentGenerating,'false');
  const history=mock.dataFor('/api/gaip/agent/chat/session/10001').data.messages;
  assert.equal(history.at(-1).content,'已停止生成。','history no longer invents a complete answer after stopping');
  advance(20000);assert.equal(modal.dataset.gaipAgentGenerating,'false');
  const second=await make();const rd=second.body.getReader();let partial='';
  const drain2=(async()=>{for(;;){const r=await rd.read();if(r.done)break;partial+=new TextDecoder().decode(r.value);}})();
  advance(10400);mock.stop();await drain2;
  assert.ok(partial.includes('我已收到你的消息'));assert.ok(!partial.includes('建议沟通路径'));
  const stored=mock.dataFor('/api/gaip/agent/chat/session/10001').data.messages.at(-1).content;
  assert.ok(stored.startsWith('我已收到你的消息'));assert.ok(!stored.includes('建议沟通路径'));
  const third=await make();const rc=third.body.getReader();let complete='';
  const drain3=(async()=>{for(;;){const r=await rc.read();if(r.done)break;complete+=new TextDecoder().decode(r.value);}})();
  advance(12000);await drain3;assert.ok(complete.includes('建议沟通路径'),'a new generation completes after a stop');
  const abort=new w.AbortController();const response=await mock.fetch('/api/gaip/agent/chat/send',{body:'{}',signal:abort.signal});
  const ar=response.body.getReader();abort.abort();while(!(await ar.read()).done){}assert.equal(modal.dataset.gaipAgentGenerating,'false');
  const cancelled=await make();await cancelled.body.cancel();assert.equal(modal.dataset.gaipAgentGenerating,'false');
  console.log('PASS: immediate stop, partial/history preservation, next send, AbortSignal and reader cancel');

  input.value='已有文字';modal.querySelector('.voiceBtn___6P10L').click();await tick();
  assert.equal(modal.dataset.gaipAgentVoice,'recording');
  modal.querySelector('.voiceBtn___6P10L').click();assert.equal(modal.dataset.gaipAgentVoice,'recognizing');
  advance(800);await tick();
  assert.equal(input.value,'已有文字 请帮我整理一份家庭保障方案。');
  assert.equal(modal.dataset.gaipAgentVoice,'idle');
  let sends=0;input.value='';d.querySelector('.sendBtn___m_z0G:not(.gaip-agent-stop):not(.gaip-agent-voice-send)').addEventListener('click',()=>sends++);
  modal.querySelector('.voiceBtn___6P10L').click();modal.querySelector('.gaip-agent-voice-send').click();advance(800);await tick();
  assert.equal(sends,1,'direct voice send reaches the original native send once');
  modal.querySelector('.voiceBtn___6P10L').click();input.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
  assert.equal(modal.dataset.gaipAgentVoice,'idle');
  modal.querySelector('.voiceBtn___6P10L').click();modal.querySelector('.voiceBtn___6P10L').click();const saved=input.value;
  modal.querySelector('.closeIcon___X96Lj').click();advance(800);await tick();
  assert.equal(input.value,saved,'minimize cancels a pending mock transcript');
  assert.equal(modal.querySelectorAll('.voiceBtn___6P10L').length,1);
  assert.equal(modal.querySelectorAll('.gaip-agent-stop').length,1);
  console.log('PASS: mock transcription appends, direct send, Escape/minimize cancellation and single mounts');
 } finally {observers.forEach(x=>x.disconnect());w.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
