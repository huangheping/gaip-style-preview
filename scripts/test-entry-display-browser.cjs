'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'),output=path.join(root,'outputs/standardization/20260922/root-entry-migration/browser');
fs.mkdirSync(output,{recursive:true});
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH}),results=[];
  try {
    const login=await browser.newPage({viewport:{width:1440,height:980}});
    await login.goto(pathToFileURL(path.join(root,'index.html')).href);
    await login.locator('input[type="password"]').waitFor();
    assert.equal(await login.locator('.directory-shell').count(),0,'root index must remain the login page');
    assert.match(new URL(login.url()).hash,/login/);
    await login.screenshot({path:path.join(output,'root-login.png')});
    await login.close();
    for(const entry of ['channels/learning-center/index.html','channels/workspace/index.html']){
      // Fresh isolated context: never read or rewrite the user's browser storage.
      const context=await browser.newContext({viewport:{width:1920,height:1080}}),page=await context.newPage(),errors=[],missing=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('requestfailed',r=>{if(r.url().startsWith('file:'))missing.push(r.url());});
      await page.goto(pathToFileURL(path.join(root,entry)).href);
      if(entry.includes('workspace')){
        await page.locator('[data-gaip-channel="learning"] a').waitFor();
        const session=await page.locator('html').getAttribute('data-gaip-document-session');
        await page.locator('[data-gaip-channel="learning"] a').click();
        await page.locator('.gaip-learning-grid').waitFor();
        assert.equal(await page.locator('html').getAttribute('data-gaip-document-session'),session);
      }
      await page.locator('.gaip-course-image').first().waitFor();
      // Finish font loading before the intentional reload, so it cannot cancel an in-flight font request.
      await page.evaluate(() => document.fonts.ready);
      // Reproduce persisted pre-directory-migration image references.
      const before=await page.evaluate(()=>{
        const keys=['gaip-learning-v11','gaip-learning-live-v12'];
        return keys.map(key=>{
          const data=JSON.parse(localStorage.getItem(key));
          for(const record of data.courses||data.banners||[]) if(record.image)record.image=record.image.replace('channels/learning-center/assets/images/','assets/learning/');
          localStorage.setItem(key,JSON.stringify(data));
          return {key,images:(data.courses||data.banners).map(record=>record.image),records:data.records};
        });
      });
      await page.reload();
      await page.locator('.gaip-learning-grid').waitFor();
      await page.waitForFunction(()=>[...document.querySelectorAll('.gaip-course-image,.lc-live-card-cover img,.gaip-learning-action-icon')].every(i=>i.tagName!=='IMG'||i.complete&&i.naturalWidth>0));
      const display=await page.evaluate(()=>{
        const css=selector=>getComputedStyle(document.querySelector(selector));
        return {columns:css('.gaip-learning-grid').gridTemplateColumns.split(' ').length,header:css('.gaip-learning-header').backgroundColor,buttons:[...document.querySelectorAll('.gaip-learning-action')].map(el=>getComputedStyle(el).backgroundColor),card:css('.lc-live-card').backgroundColor,heading:!!document.querySelector('.lc-live-courses-heading'),summary:!!document.querySelector('.lc-live-card-summary'),images:[...document.querySelectorAll('.gaip-course-image,.lc-live-card-cover img')].map(img=>({src:img.src,loaded:img.naturalWidth>0}))};
      });
      assert.equal(display.columns,3);assert.equal(display.header,'rgb(255, 255, 255)');
      assert.ok(display.buttons.every(color=>color==='rgb(2, 91, 82)'));
      assert.equal(display.card,'rgb(245, 244, 242)');assert.equal(display.heading,false);assert.equal(display.summary,false);
      const after=await page.evaluate(keys=>keys.map(key=>{const data=JSON.parse(localStorage.getItem(key));return {key,images:(data.courses||data.banners).map(record=>record.image),records:data.records};}),before.map(item=>item.key));
      assert.deepEqual(after,before,'rendering compatibility preserves saved images and learning records');
      const baseline=JSON.parse(fs.readFileSync(path.join(root,'outputs/standardization/20260922/browser/baseline-errors.json'),'utf8'));
      assert.deepEqual(errors.filter(error=>!baseline.errors.includes(error)),[]);assert.deepEqual(missing,[]);
      await page.screenshot({path:path.join(output,'learning-'+(entry.includes('workspace')?'cross-entry':'direct')+'.png')});
      results.push({entry,display,errors,missing});await context.close();
    }
    fs.writeFileSync(path.join(output,'entry-display-results.json'),JSON.stringify(results,null,2));
    console.log('PASS: root login restored; learning reference layout and legacy saved covers match across direct/cross-channel entries, without rewriting stored paths or progress.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
