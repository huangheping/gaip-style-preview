const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});try{
 const p=await browser.newPage({viewport:{width:1400,height:800}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 // Real source structures: React div chapters, native proposal buttons; no DOM replacement.
 await p.setContent('<div class="chapterTabs___nqSpI"><div class="chapterTabList___bQyho"><div class="chapterTab___f0dZr tabPassed___HZWJ4">章节一</div><div class="chapterTab___f0dZr tabActive___RmAMI">章节二</div><div class="chapterTab___f0dZr tabLocked___pmXab">章节三</div></div><div class="progressArea___bT5Nv">学习进度</div></div><div class="sectionTabs___AgR2r"><div class="sectionTab___Koi6V tabActive___RmAMI">小节一</div></div><nav class="gaip-proposal-tabs"><button class="gaip-proposal-tab is-active" aria-selected="true">全部方案<span class="gaip-tabs-quantity">（<span class="gaip-tabs-count">24</span>）</span></button><button class="gaip-proposal-tab" aria-selected="false">我的方案记录</button></nav>');
 const files=['shared/styles/global-font.css','web/p__induction__index.ec144457.chunk.css','channels/proposal-center/proposal-center.css','components/tabs/global-tabs.css'];
 for(const f of files)await p.addStyleTag({content:read(f)});
 await p.evaluate(()=>{
  window.originalChapter=document.querySelector('.chapterTab___f0dZr');window.chapterClicks=0;window.lockedClicks=0;
  document.querySelector('.chapterTabList___bQyho').addEventListener('click',e=>{const n=e.target.closest('.chapterTab___f0dZr');if(!n)return;if(n.classList.contains('tabLocked___pmXab')){window.lockedClicks++;return;}window.chapterClicks++;n.parentNode.querySelectorAll('.chapterTab___f0dZr').forEach(b=>b.classList.toggle('tabActive___RmAMI',b===n));});
  document.querySelector('.gaip-proposal-tabs').addEventListener('click',e=>{const n=e.target.closest('button');if(!n)return;n.parentNode.querySelectorAll('button').forEach(b=>{b.classList.toggle('is-active',b===n);b.setAttribute('aria-selected',b===n);});});
 });
 await p.addScriptTag({content:read('components/tabs/global-tabs.js')});
 assert.equal(await p.locator('[data-gaip-tabs]').count(),2);
 assert.equal(await p.locator('.sectionTabs___AgR2r [data-gaip-tab]').count(),0,'pill sections are not adapted');
 for(const late of [false,true]){
  if(late)for(const f of files.slice(1,3))await p.addStyleTag({content:read(f)});
  await p.waitForTimeout(250);
  const styles=await p.locator('[data-gaip-tab][aria-selected="true"]').evaluateAll(ns=>ns.map(n=>{const s=getComputedStyle(n),a=getComputedStyle(n,'::after');return {height:s.height,font:s.fontSize,weight:s.fontWeight,color:s.color,line:a.width,transform:a.transform,transition:a.transitionDuration,opacity:a.opacity};}));
  assert.deepEqual(styles[0],styles[1]);assert.equal(styles[0].height,'64px');assert.equal(styles[0].weight,'700');assert.equal(styles[0].line,'71px');assert.equal(styles[0].transition,'0s');assert.equal(styles[0].opacity,'1');
 }
 assert.equal(await p.locator('.gaip-tabs-quantity').evaluate(n=>getComputedStyle(n).fontWeight),'400');
 assert.equal(await p.locator('.gaip-tabs-count').evaluate(n=>getComputedStyle(n).fontWeight),'400');
 const chapters=p.locator('.chapterTab___f0dZr');await chapters.nth(1).focus();await p.keyboard.press('ArrowRight');await p.waitForTimeout(60);
 assert.equal(await chapters.first().getAttribute('aria-selected'),'true','keyboard skips locked chapter');
 assert.equal(await p.evaluate(()=>window.chapterClicks),1);
 await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>window.chapterClicks),2,'div tab supports Enter');
 const lockedRect=await chapters.nth(2).boundingBox();await p.mouse.click(lockedRect.x+lockedRect.width/2,lockedRect.y+lockedRect.height/2);assert.equal(await p.evaluate(()=>window.lockedClicks),1,'original locked-click feedback preserved');
 await chapters.nth(2).evaluate(n=>n.classList.remove('tabLocked___pmXab'));await p.waitForTimeout(60);assert.equal(await chapters.nth(2).getAttribute('aria-disabled'),'false','source unlock resyncs');
 await chapters.first().focus();await p.keyboard.press('End');await p.waitForTimeout(60);assert.equal(await chapters.nth(2).getAttribute('aria-selected'),'true');
 await p.locator('.gaip-proposal-tab').first().focus();await p.keyboard.press('ArrowRight');await p.waitForTimeout(60);assert.equal(await p.locator('.gaip-proposal-tab').nth(1).getAttribute('aria-selected'),'true');
 assert.equal(await p.evaluate(()=>window.originalChapter===document.querySelector('.chapterTab___f0dZr')),true);
 await p.setViewportSize({width:480,height:800});assert.equal(await p.locator('.chapterTabList___bQyho').evaluate(n=>n.scrollWidth>=n.clientWidth),true);
 assert.deepEqual(errors,[]);console.log('PASS induction/proposal source-structure fixtures: equal shared skin, late CSS, count weights, chapter locks/unlock, original nodes/clicks, keyboard and pill isolation. Not full business page acceptance.');
 // Real entries include the proposal border-box reset absent from the fixture.
 for(const entry of ['channels/proposal-center/index.html','channels/workspace/index.html']){
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.goto(pathToFileURL(path.join(root,entry)).href+'#/proposal');
  await page.waitForFunction(()=>document.querySelector('.gaip-proposal-tabs[data-gaip-tabs]'),null,{timeout:20000});
  const identity=await page.evaluate(()=>document.documentElement.dataset.gaipDocumentSession);
  assert.ok(identity);
  for(const width of [1440,480]){
   await page.setViewportSize({width,height:1000});
   for(const index of [0,1]){
    await page.locator('.gaip-proposal-tab').nth(index).click();
    await page.waitForFunction(i=>document.querySelectorAll('.gaip-proposal-tab')[i].getAttribute('aria-selected')==='true',index);
    const metric=await page.locator('.gaip-proposal-tabs').evaluate(r=>{
     const t=r.querySelector('[aria-selected="true"]'),rb=r.getBoundingClientRect(),tb=t.getBoundingClientRect(),a=getComputedStyle(t,'::after'),s=getComputedStyle(t);
     const bottom=tb.bottom-parseFloat(s.borderBottomWidth)-parseFloat(a.bottom),top=bottom-parseFloat(a.height);
     return {height:rb.height,client:r.clientHeight,tabHeight:tb.height,line:parseFloat(a.height),visible:Math.min(bottom,rb.top+r.clientTop+r.clientHeight)-Math.max(top,rb.top+r.clientTop),width:a.width,transition:a.transitionDuration,weight:s.fontWeight,color:s.color,quantity:getComputedStyle(r.querySelector('.gaip-tabs-quantity')).fontWeight};
    });
    assert.deepEqual(metric,{height:64,client:64,tabHeight:64,line:4,visible:4,width:'71px',transition:'0s',weight:'700',color:'rgb(47, 54, 64)',quantity:'400'});
    assert.equal(await page.locator('[data-panel="'+(index?'records':'catalog')+'"]').isVisible(),true);
   }
   await page.locator('.gaip-proposal-tab').nth(1).focus();await page.keyboard.press('ArrowLeft');
   await page.waitForFunction(()=>document.querySelector('.gaip-proposal-tab').getAttribute('aria-selected')==='true');
   assert.equal(await page.locator('[data-panel="catalog"]').isVisible(),true);
  }
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.gaipDocumentSession),identity);
  await page.setViewportSize({width:1440,height:1000});
  if(entry.includes('proposal-center'))await page.locator('.gaip-proposal-tabs').screenshot({path:path.join(root,'design-changes/evidence/proposal-tabs-20261008.png')});
  await page.close();
 }
 console.log('PASS real proposal/workspace entries at 1440/480px: full 4px underline, 64px band, text/quantity, both panels, keyboard and same document.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
