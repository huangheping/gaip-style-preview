'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const repo=path.resolve(__dirname,'..'),root=path.resolve(process.env.GAIP_PREVIEW_ROOT||repo);
const output=path.join(repo,'outputs/final-acceptance/20260922/browser');fs.mkdirSync(output,{recursive:true});
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'shared/config/channels.js'),'utf8'),ctx);
const channels=ctx.window.__GAIP_CHANNEL_CONFIG__.list;
const markers={workspace:{text:'今日核心行情'},customer:{text:'客户列表'},policy:{text:'保单号'},proposal:{text:'生成方案'},product:{text:'了解详情'},activity:{text:'本季活动'},news:{selector:'[data-news-card]'},wealth:{selector:'.gaip-wealth-page'},config:{selector:'[data-config-bulk-import]'},induction:{text:'培训'},clues:{selector:'#gaip-clue-toolbar'},learning:{selector:'.gaip-learning-grid'}};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH}),results=[];
 const baseline=JSON.parse(fs.readFileSync(path.join(repo,'outputs/standardization/20260922/browser/baseline-errors.json'),'utf8'));
 assert.equal(browser.version(),baseline.browser);
 async function ready(page,channel){
  await page.waitForFunction(({key,route,marker})=>{
   const hash=location.hash;
   const correct=key==='news'||key==='wealth'||key==='config'||key==='learning'?new URLSearchParams(hash.split('?')[1]||'').get('gaip-channel')===key:hash.split('?')[0]==='#'+route;
   if(!correct)return false;
   if(marker.selector){const el=document.querySelector(marker.selector);return !!el&&el.getBoundingClientRect().height>0;}
   return document.body.innerText.includes(marker.text);
  },{key:channel.key,route:channel.route,marker:markers[channel.key]});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>[...document.images].filter(i=>{const r=i.getBoundingClientRect();return i.getAttribute('src')&&r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;}).every(i=>i.complete));
  const state=await page.evaluate(()=>({hash:location.hash,session:document.documentElement.dataset.gaipDocumentSession,brokenImages:[...document.images].filter(i=>i.getAttribute('src')&&i.complete&&!i.naturalWidth).map(i=>i.src),visibleText:document.body.innerText.slice(-900)}));
  assert.ok(state.session);assert.deepEqual(state.brokenImages,[]);return state;
 }
 function observe(page){
  const log={errors:[],missing:[],documents:0};page.on('pageerror',e=>log.errors.push(e.message));page.on('requestfailed',r=>{if(r.url().startsWith('file:'))log.missing.push({url:r.url(),failure:r.failure()?.errorText});});page.on('request',r=>{if(r.isNavigationRequest()&&r.resourceType()==='document'&&r.frame()===page.mainFrame())log.documents++;});return log;
 }
 function check(log){assert.deepEqual(log.errors.filter(e=>!baseline.errors.includes(e)),[]);assert.deepEqual(log.missing,[]);}
 async function navigate(page,channel){
  if(channel.key==='wealth'){
   const toggle=page.locator('[data-wealth-menu-toggle]');if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();
   await page.locator('[data-wealth-view="import-workbench"] a').click();
  }else if(channel.key==='config'){
   const toggle=page.locator('.gaip-config-toggle');if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();
   await page.locator('a[data-config-view="organization"]').click();
  }else await page.locator('.ant-layout-sider').getByText(channel.label,{exact:true}).first().click();
  return ready(page,channel);
 }
 try{
  for(const channel of channels){
   const page=await browser.newPage({viewport:{width:1440,height:980}}),log=observe(page);
   try{
    await page.goto(pathToFileURL(path.join(root,channel.entry)).href);const before=await ready(page,channel);
    await page.screenshot({path:path.join(output,channel.key+'.png')});
    await page.reload();const after=await ready(page,channel);assert.equal(after.hash,before.hash);check(log);
    results.push({scenario:'direct-and-refresh',channel:channel.key,before,after,...log});console.log('PASS direct + refresh:',channel.key);
   }finally{await page.close();}
  }
  for(const entry of ['index.html','channels/learning-center/index.html']){
   const page=await browser.newPage({viewport:{width:1440,height:980}}),log=observe(page);
   try{
    await page.goto(pathToFileURL(path.join(root,entry)).href);
    if(entry==='index.html'){
     await page.locator('#login-form_domainAccount').fill('local-audit');await page.locator('#login-form_password').fill('local-preview-only');await page.getByRole('button',{name:'立即登录'}).click();
     await ready(page,channels.find(c=>c.key==='workspace'));
    }else await ready(page,channels.find(c=>c.key==='learning'));
    const session=await page.locator('html').getAttribute('data-gaip-document-session'),documents=log.documents;
    for(const channel of channels){const state=await navigate(page,channel);assert.equal(state.session,session);assert.equal(log.documents,documents);results.push({scenario:'navigation',entry,channel:channel.key,hash:state.hash});}
    check(log);results.push({scenario:'journey',entry,...log});console.log('PASS login/cross-channel journey:',entry);
   }finally{await page.close();}
  }
  console.log('PASS final site: 12 direct entries + refresh; local login and second-entry navigation across all channels; no main-document reload, missing local assets or broken loaded images.');
 }finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({browser:browser.version(),root,results},null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
