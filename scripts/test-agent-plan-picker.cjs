/* Event dispatch/data regression. Real native Umi interactions are verified separately. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(path.join(__dirname, '../components/ai-agent/AI Agent本地Mock.js'), 'utf8');
const tick = () => new Promise(resolve => setTimeout(resolve, 70));
async function scenario(query, version) {
  const dom = new JSDOM('<section class="agentModal___Nxp06"><div class="modalRenderWrapper___qz3XP"><button class="historyBtn___ElWTU"></button><div id="agentModalContentArea"><div class="chatPanel___qIDO_"><ul class="msgBox___NYtlO"><li class="sentinel___SbISb"></li></ul></div></div><footer><div class="container___jv7uB"><span class="tag___PKl7Z skillTag___g4XXW" id="native-tag">Native skill<span class="close___ZupBD"></span></span></div><textarea class="textarea___GMXtD"></textarea><div class="skillToggle___OpRvz"><svg id="react-owned"></svg><span>技能</span></div></footer></div></section>', {url:'http://localhost/channels/workspace/index.html'+query+'#/workspace', runScripts:'outside-only', pretendToBeVisual:true});
  const w=dom.window,d=w.document;
  try {
    w.fetch=async()=>({json:async()=>({code:'20000',data:[{clientId:1,name:'Test Client',clientCode:'T1'}]})});
    let nativeClicks=0;
    let nativeRemovals=0;
    d.querySelector("#native-tag .close___ZupBD").addEventListener("click",()=>{nativeRemovals++;d.getElementById("native-tag").remove();});
    d.body.addEventListener('click',event=>{if(event.target.closest('.skillToggle___OpRvz')) nativeClicks++;});
    w.eval(source);
    for(let attempt=0;attempt<20 && !d.querySelector('.agentModal___Nxp06').dataset.gaipAgentPlanPicker;attempt++) await tick();
    const button=d.querySelector('.skillToggle___OpRvz');
    assert.equal(d.querySelector('.agentModal___Nxp06').dataset.gaipAgentPlanPicker,version);
    const skills=w.__GAIP_AGENT_MOCK__.dataFor('/api/gaip/agent/chat/skills');
    button.click(); await tick();
    assert.ok(d.getElementById('native-tag'),'Native skill tag remains React-owned');
    if(version==='transition') {
      assert.equal(button.getAttribute('aria-pressed'),'true','Native selected skill uses the shared active button');
      button.querySelector('.gaip-agent-skill-clear').click(); await tick();
      assert.equal(nativeRemovals,1,'Clear X invokes native skill removal');
      assert.equal(nativeClicks,1,'Clear X does not reopen the popover');
      assert.equal(button.getAttribute('aria-pressed'),'false','Clearing native selection restores idle');
      const popup=d.createElement('div');popup.className='ant-popover';
      popup.innerHTML='<div id="native-popup"><div id="skill-popover-content-key"></div></div>';
      button.setAttribute('aria-describedby','native-popup');d.body.append(popup);await tick();
      d.body.addEventListener('mousedown',event=>{if(!event.target.closest('.skillToggle___OpRvz, .ant-popover'))popup.classList.add('ant-popover-hidden');});
      assert.equal(button.getAttribute('aria-pressed'),'true','Native open popover uses the same active style');
      popup.classList.add('ant-popover-hidden');await tick();
      assert.equal(button.getAttribute('aria-pressed'),'false','Outside dismissal clears active state');
      popup.classList.remove('ant-popover-hidden');await tick();
      assert.equal(button.getAttribute('aria-pressed'),'true','Reopening an existing popover restores active state');
      button.querySelector('.gaip-agent-skill-clear').click();await tick();
      assert.equal(button.getAttribute('aria-pressed'),'false','Clear X closes an open or leaving popup without toggling');
      assert.equal(button.onclick,null,'No custom card interceptor in transition');
      assert.equal(nativeClicks,1,'Original delegated popover click is reached');
      assert.ok(d.getElementById('react-owned'),'Native React icon is preserved');
      assert.equal(d.querySelector('.gaip-agent-plan-panel'),null);
      assert.equal(skills.handled,true);assert.equal(skills.data.length,5);
      assert.ok(skills.data.every(item=>item.source==='platform'&&item.skillName&&item.displayName));
      button.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
      assert.equal(nativeClicks,2,'Keyboard reaches the same native click');
      button.classList.add('disabled___nGfbI');
      button.dispatchEvent(new w.KeyboardEvent('keydown',{key:' ',bubbles:true,cancelable:true}));
      assert.equal(nativeClicks,2,'Disabled keyboard does not invoke popover');
    } else {
      assert.equal(nativeClicks,0,'Current card does not also open native popover');
      assert.equal(skills.handled,true,'Shared native skill cache supports later live switching');
      assert.equal(skills.data.length,5);
      assert.equal(d.querySelectorAll('.gaip-agent-option-list-plan button').length,5);
      assert.equal(d.querySelector('.gaip-agent-client-option').disabled,true);
      d.querySelector('.gaip-agent-option-list-plan button').click();
      assert.match(d.querySelector('textarea').value,/请生成/);
      assert.equal(d.querySelector('.gaip-agent-client-option').disabled,false);
      d.querySelector('.gaip-agent-client-option').click();
      assert.match(d.querySelector('textarea').value,/Test Client/);
      button.querySelector('.gaip-agent-skill-clear').click();
      assert.equal(d.querySelector('.gaip-agent-plan-panel'),null);
      assert.equal(d.querySelector('.gaip-agent-plan-tag'),null,'Current clear removes selected plan');
      assert.equal(d.querySelector('textarea').value,'','Current clear removes generated prompt');
      assert.equal(button.getAttribute('aria-pressed'),'false');
    }
    button.classList.remove('disabled___nGfbI');
    const modal=d.querySelector('.agentModal___Nxp06'), originalRows=d.querySelector('.msgBox___NYtlO');
    const input=d.querySelector('textarea');input.value='Keep this draft';
    const switcher=d.querySelector('.gaip-agent-picker-switch');
    const nativePopup=d.querySelector('.ant-popover');
    if(nativePopup){nativePopup.classList.remove('ant-popover-hidden');d.body.addEventListener('mousedown',event=>{if(!event.target.closest('.skillToggle___OpRvz, .ant-popover'))nativePopup.classList.add('ant-popover-hidden');});}
    const clicksBeforeSwitch=nativeClicks;
    switcher.click();await tick();
    assert.equal(modal.dataset.gaipAgentPlanPicker,version==='transition'?'current':'transition');
    assert.equal(input.value,'Keep this draft','Live switch preserves draft');
    if(nativePopup){assert.ok(nativePopup.classList.contains('ant-popover-hidden'),'Open native popover closes when switching');assert.equal(nativeClicks,clicksBeforeSwitch,'Switch must not toggle the closing native popover');}
    assert.equal(d.querySelector('.msgBox___NYtlO'),originalRows,'Live switch preserves conversation nodes');
    assert.equal(d.querySelector('.gaip-agent-plan-panel'),null);
    switcher.click();await tick();
    assert.equal(modal.dataset.gaipAgentPlanPicker,version,'Second click returns to original mode');
    assert.equal(input.value,'Keep this draft');
    assert.equal(w.localStorage.length,0,'Easter egg does not persist a new default');
    console.log('PASS:',query||'default',version);
  } finally { w.close(); }
}
(async()=>{
  await scenario('','transition');
  await scenario('?agentPlanPicker=transition','transition');
  await scenario('?agentPlanPicker=current','current');
  await scenario('?agentPlanPicker=invalid','transition');
})().catch(error=>{console.error(error);process.exitCode=1;});
