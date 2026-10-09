'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
 try{
  for(const entry of ['wealth-center','workspace']){
   const page=await browser.newPage({viewport:{width:1440,height:980}}),missing=[],errors=[];
   page.on('requestfailed',r=>{if(r.url().startsWith('file:'))missing.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
   await page.goto(pathToFileURL(path.join(root,'channels',entry,'index.html')).href);
   await page.locator('[data-wealth-menu-toggle]').waitFor();
   const session=await page.locator('html').getAttribute('data-gaip-document-session');
   if(entry==='workspace')await page.locator('[data-wealth-menu-toggle]').click();
   await page.locator('[data-wealth-view="my-wealth"] a').click();
   await page.locator('[data-wealth-search]').waitFor();
   assert.ok(await page.locator('[data-wealth-progress]').count());
   await page.locator('[data-wealth-view="import-records"] a').click();
   await page.locator('[data-action="keyword-settings"]').click();
   const keywords=page.locator('.gaip-wealth-modal[role="dialog"]');await keywords.waitFor();
   assert.equal(await keywords.locator('input').first().inputValue(),'AIA');
   await keywords.getByRole('button',{name:'取消',exact:true}).click();await keywords.waitFor({state:'hidden'});
   await page.locator('[data-action="keyword-settings"]').click();await keywords.waitFor();
   await keywords.getByRole('button',{name:'取消',exact:true}).click();await keywords.waitFor({state:'hidden'});
   await page.locator('.gaip-config-toggle').click();
   await page.locator('a[data-config-view="announcement-management"]').click();
   await page.locator('.gaip-announcement-table tbody tr').first().waitFor();
   assert.equal(await page.locator('.gaip-announcement-table tbody tr').count(),10);
   for(let i=0;i<2;i++){
    await page.locator('.gaip-announcement-create').click();
    const dialog=page.locator('.gaip-announcement-dialog[open]');await dialog.waitFor();
    assert.equal(await dialog.locator('textarea[data-announcement-autosize]').count(),3);
    await dialog.getByRole('button',{name:'取消',exact:true}).click();await dialog.waitFor({state:'hidden'});
   }
   assert.equal(await page.locator('html').getAttribute('data-gaip-document-session'),session);
   await page.evaluate(()=>document.fonts.ready);
   const baseline=JSON.parse(fs.readFileSync(path.join(root,'outputs/standardization/20260922/browser/baseline-errors.json'),'utf8'));
   assert.deepEqual(errors.filter(e=>!baseline.errors.includes(e)),[]);assert.deepEqual(missing,[]);
   await page.close();
  }
  console.log('PASS file://: wealth data, subviews, keyword close/reopen; announcement data and create/cancel/reopen; two entries, no reload, missing resources or new page errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
