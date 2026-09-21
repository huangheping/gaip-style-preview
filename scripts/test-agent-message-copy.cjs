const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const dom = new JSDOM('<section class="agentModal___Nxp06"><div class="modalRenderWrapper___qz3XP"><ul id="messages"></ul></div></section>', {url:'http://localhost',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,d=w.document;
const tick=()=>new Promise(resolve=>setTimeout(resolve,60));
(async()=>{
 try {
  let copied='';
  Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async text=>{copied=text}},configurable:true});
  w.eval(fs.readFileSync(path.join(__dirname,'../AI Agent/AI Agent本地Mock.js'),'utf8'));
  await tick();
  d.querySelector('#messages').innerHTML='<li class="msgRow___wswRS msgUser___WR23E"><div class="msgBubble___W9da6"><pre class="userPre___VegVA">我的问题\n第二行</pre><ul><li>附件.pdf</li></ul></div></li><li class="msgRow___wswRS msgAi___JN4kV"><div>推理内容</div><div class="aiContent___cP6kY"><p>第一段</p><p>第二段</p><div class="codeHeader___bcofg">JS<button>复制代码</button></div><pre>example()</pre></div></li><li class="msgRow___wswRS msgUser___WR23E"><pre class="userPre___VegVA"></pre><ul><li>仅附件.pdf</li></ul></li>';
  await tick();
  assert.equal(d.querySelectorAll('.gaip-agent-message-copy').length,2);
  const own=d.querySelector('[aria-label="复制我的消息"]');own.click();await tick();
  assert.equal(copied,'我的问题\n第二行');
  assert.equal(own.getAttribute('aria-label'),'已复制');
  assert.equal(d.querySelector('.gaip-agent-copy-notice').textContent,'消息已复制');
  assert.match(own.querySelector('img').getAttribute('src'),/复制成功/);
  const ai=d.querySelector('[aria-label="复制回答"]');ai.click();await tick();
  assert.equal(copied,'第一段\n第二段\nexample()');
  assert.equal(d.querySelector('.gaip-agent-copy-notice').textContent,'回答已复制');
  await new Promise(resolve=>setTimeout(resolve,2050));
  assert.equal(own.getAttribute('aria-label'),'复制我的消息');
  assert.match(own.querySelector('img').getAttribute('src'),/复制文本/);
  // Failed clipboard and failed fallback must not show the success artwork.
  w.navigator.clipboard.writeText=async()=>{throw Error('denied')};d.execCommand=()=>false;
  own.click();await tick();
  assert.equal(own.getAttribute('aria-label'),'复制我的消息');
  assert.equal(d.querySelectorAll('textarea').length,0);
  assert.match(d.querySelector('.gaip-agent-copy-error').textContent,/复制失败/);
  d.execCommand=()=>true;own.click();await tick();assert.equal(own.getAttribute('aria-label'),'已复制');
  const row=own.closest('li');row.querySelector('pre').textContent='';await tick();
  assert.equal(row.querySelector('.gaip-agent-message-copy'),null);
  console.log('PASS: async message mounting, own/AI copy scope, success reset, failure/fallback and empty attachment-only messages');
 } finally {w.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
