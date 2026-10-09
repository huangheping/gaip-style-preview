'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.GAIP_ACCEPTANCE_OUTPUT||path.join(root,'outputs/learning-dialogs-browser')),results=[];
fs.mkdirSync(path.join(out,'browser'),{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
const page=await browser.newPage({viewport:{width:1440,height:980}}),errors=[],missing=[];
page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>{if(r.url().startsWith('file:'))missing.push(r.url());});
try{
 const entry=process.env.GAIP_BROWSER_ENTRY||'channels/learning-center/index.html';
 await page.goto(pathToFileURL(path.join(root,entry)).href);
 if(entry!=='channels/learning-center/index.html'){
  await page.locator('[data-gaip-channel="learning"] a').click();
 }
 results.push({entry});
 await page.locator('.gaip-learning-grid').waitFor();await page.evaluate(()=>document.fonts.ready);
 const session=await page.locator('html').getAttribute('data-gaip-document-session');
 for(const management of ['课程管理','学情管理']){
  await page.getByRole('button',{name:management,exact:true}).click();
  const trigger=page.locator('[data-lc="logs"]');await trigger.waitFor();
  for(let i=0;i<2;i++){
   await trigger.click(); const dialog=page.locator('dialog[open]').last();await dialog.waitFor();
   assert.match(await dialog.innerText(),/操作日志/);
   if(i===0)await page.screenshot({path:path.join(out,'browser',management+'日志.png')});
   if(i===0)await dialog.locator('[data-log-close]').click();else await page.keyboard.press('Escape');
   await dialog.waitFor({state:'hidden'});
   assert.equal(await trigger.evaluate(el=>el===document.activeElement),true,'closing returns focus to log trigger');
  }
  results.push(management+': log opens, button closes, reopens, Escape closes, focus restored');
  await page.getByRole('button',{name:'返回学习中心',exact:true}).click();await page.locator('.gaip-learning-grid').waitFor();
 }
 await page.getByRole('button',{name:'直播管理',exact:true}).click();
 const before=await page.evaluate(()=>localStorage.getItem('gaip-learning-live-v12'));
 for(let i=0;i<2;i++){
  await page.locator('[data-live-new]').click();const dialog=page.locator('dialog.lc-live-editor[open]');await dialog.waitFor();
  if(i===0)await page.screenshot({path:path.join(out,'browser/live-editor.png')});
  if(i===0){
   await dialog.locator('[data-live-save]').click();
   assert.ok(await dialog.locator('[aria-invalid="true"]').count(),'blank draft uses shared field feedback');
   await dialog.locator('#live-name').fill('未保存的验收草稿');
   await dialog.locator('[data-live-cancel]').click();
   const discard=page.locator('dialog[data-gaip-modal-id="learning-live-discard"][open]');await discard.waitFor();
   await discard.getByRole('button',{name:'取消',exact:true}).click();await discard.waitFor({state:'hidden'});
   assert.equal(await dialog.locator('#live-name').inputValue(),'未保存的验收草稿');
   await dialog.locator('[data-live-cancel]').click();await discard.waitFor();
   await discard.getByRole('button',{name:'放弃修改',exact:true}).click();
  }else await page.keyboard.press('Escape');
  await dialog.waitFor({state:'hidden'});
 }
 assert.equal(await page.evaluate(()=>localStorage.getItem('gaip-learning-live-v12')),before);
 await page.locator('[data-live-back]').click();await page.locator('.gaip-learning-grid').waitFor();
 await page.locator('.ant-layout-sider').getByText('产品中心',{exact:true}).click();await page.getByText('了解详情',{exact:true}).first().waitFor();
 assert.equal(await page.locator('html').getAttribute('data-gaip-document-session'),session);
 results.push('live editor: required feedback, discard cancel/confirm, reopen and Escape preserve storage; return and product click succeeds without reload');
 const baseline=JSON.parse(fs.readFileSync(path.join(root,'outputs/standardization/20260922/browser/baseline-errors.json')));
 assert.equal(browser.version(),baseline.browser);assert.deepEqual(errors.filter(e=>!baseline.errors.includes(e)),[]);assert.deepEqual(missing,[]);
 console.log('PASS',JSON.stringify(results));
}finally{fs.writeFileSync(path.join(out,'learning-dialog-results.json'),JSON.stringify({results,errors,missing},null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
