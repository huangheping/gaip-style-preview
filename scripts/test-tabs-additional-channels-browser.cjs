const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});try{
 const p=await browser.newPage({viewport:{width:1400,height:800}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 // Real source structures: React div chapters, native proposal buttons; no DOM replacement.
 await p.setContent('<div class="chapterTabs___nqSpI"><div class="chapterTabList___bQyho"><div class="chapterTab___f0dZr tabPassed___HZWJ4">章节一</div><div class="chapterTab___f0dZr tabActive___RmAMI">章节二</div><div class="chapterTab___f0dZr tabLocked___pmXab">章节三</div></div><div class="progressArea___bT5Nv">学习进度</div></div><div class="sectionTabs___AgR2r"><div class="sectionTab___Koi6V tabActive___RmAMI">小节一</div></div><nav class="gaip-proposal-tabs"><button class="gaip-proposal-tab is-active" aria-selected="true">全部方案<span class="gaip-tabs-quantity">（<span class="gaip-tabs-count">24</span>）</span></button><button class="gaip-proposal-tab" aria-selected="false">我的方案记录</button></nav>');
 const files=['shared/styles/global-font.css','web/p__induction__index.ec144457.chunk.css','features/proposal-center/proposal-center.css','shared/styles/global-tabs.css'];
 for(const f of files)await p.addStyleTag({content:read(f)});
 await p.evaluate(()=>{
  window.originalChapter=document.querySelector('.chapterTab___f0dZr');window.chapterClicks=0;window.lockedClicks=0;
  document.querySelector('.chapterTabList___bQyho').addEventListener('click',e=>{const n=e.target.closest('.chapterTab___f0dZr');if(!n)return;if(n.classList.contains('tabLocked___pmXab')){window.lockedClicks++;return;}window.chapterClicks++;n.parentNode.querySelectorAll('.chapterTab___f0dZr').forEach(b=>b.classList.toggle('tabActive___RmAMI',b===n));});
  document.querySelector('.gaip-proposal-tabs').addEventListener('click',e=>{const n=e.target.closest('button');if(!n)return;n.parentNode.querySelectorAll('button').forEach(b=>{b.classList.toggle('is-active',b===n);b.setAttribute('aria-selected',b===n);});});
 });
 await p.addScriptTag({content:read('shared/scripts/global-tabs.js')});
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
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
