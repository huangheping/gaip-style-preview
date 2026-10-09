'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = path.resolve(__dirname,'..');
const output = path.join(root,'outputs/standardization/20260922/continuation');
fs.mkdirSync(output,{recursive:true});
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
  const records=[];
  try {
    const baseline=JSON.parse(fs.readFileSync(path.join(root,'outputs/standardization/20260922/browser/baseline-errors.json'),'utf8'));
    assert.equal(browser.version(),baseline.browser);
    for(const entry of ['channels/news-center/index.html','channels/workspace/index.html']) {
      const page=await browser.newPage({viewport:{width:1440,height:980}}),errors=[],missing=[];
      page.on('pageerror',error=>errors.push(error.message));
      page.on('requestfailed',request=>{if(request.url().startsWith('file:'))missing.push(request.url());});
      await page.goto(pathToFileURL(path.join(root,entry)).href);
      await page.waitForFunction(()=>window.__GAIP_NEWS_CENTER__);
      const session=await page.evaluate(()=>document.documentElement.dataset.gaipDocumentSession);
      if(entry==='channels/workspace/index.html')await page.locator('[data-gaip-channel="news"] a').click();
      await page.locator('[data-news-search]').waitFor();
      const initialCards=await page.locator('[data-news-card]').count();
      assert.ok(initialCards>0);
      await page.locator('[data-news-open]').first().click();
      const modal=page.locator('[data-news-modal-panel]');
      await modal.waitFor();
      assert.ok(await modal.locator('#gaipNewsModalTitle').innerText());
      assert.equal(await modal.locator('button[data-news-close-modal]').evaluate(button=>document.activeElement===button),true,'opening the modal moves keyboard focus inside');
      await modal.locator('button[data-news-close-modal]').click();
      await modal.waitFor({state:'hidden'});
      assert.equal(await page.evaluate(()=>document.activeElement.hasAttribute('data-news-open')),true,'closing restores focus to the current rendered trigger');
      await page.locator('[data-news-search]').fill('__no_matching_news__');
      await page.locator('[data-news-empty]').waitFor({state:'visible'});
      assert.equal(await page.locator('[data-news-card]').count(),0);
      await page.locator('[data-news-search]').fill('');
      await page.waitForFunction(()=>document.querySelectorAll('[data-news-card]').length>0);
      await page.locator('[data-news-featured]').click();
      assert.equal(await page.locator('[data-news-featured]').getAttribute('aria-checked'),'true');
      await page.locator('[data-news-open]').first().click();
      await modal.waitFor();
      await page.keyboard.press('Escape');
      await modal.waitFor({state:'hidden'});
      assert.equal(await page.evaluate(()=>document.documentElement.dataset.gaipDocumentSession),session);
      assert.deepEqual(errors.filter(error=>!baseline.errors.includes(error)),[]);
      assert.deepEqual(missing,[]);
      records.push({entry,initialCards,errors,missing,passed:true});
      await page.close();
    }
    console.log('PASS: news templates work from two file entries; detail close/reopen/Escape, search/empty/reset, featured filter and same-document navigation.');
  }finally{
    fs.writeFileSync(path.join(output,'news-browser.json'),JSON.stringify({browser:browser.version(),records},null,2));
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
