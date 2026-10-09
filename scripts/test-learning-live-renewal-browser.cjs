'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/learning-live-remock-20261002');
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try {
    await page.goto(pathToFileURL(path.join(root,'channels/learning-center/index.html')).href);
    await page.locator('.lc-live-card').first().waitFor();
    const baselineErrors=errors.slice();
    const original=await page.evaluate(()=>{
      const key='gaip-learning-live-v12',state=JSON.parse(localStorage.getItem(key)),past=Date.now()-86400000;
      for(const suffix of ['arkos','pathway','camp']){
        const b=state.banners.find(x=>x.id==='live-demo-20260916-'+suffix);
        b.startAt=b.publishedAt=new Date(past-86400000).toISOString();b.endAt=new Date(past).toISOString();
        b.status=suffix==='pathway'?'offline':'published';b.updatedBy=suffix==='pathway'?'系统':'示例管理员';
      }
      delete state.mockBatches['live-preview-renewal-20261002'];
      localStorage.setItem(key,JSON.stringify(state));
      return {banners:state.banners,course:localStorage.getItem('gaip-learning-v11')};
    });
    await page.reload();await page.locator('.lc-live-card').first().waitFor();
    await page.waitForFunction(()=>window.__GAIP_LEARNING_LIVE_DATA__.visible().length===3);
    assert.equal(await page.locator('.lc-live-card').count(),2);
    assert.equal(await page.locator('.gaip-carousel-dot').count(),2);
    assert.match(await page.locator('.lc-live-card-status').first().textContent(),/距开播/);
    assert.equal(await page.locator('.lc-live-card-status').nth(1).textContent(),'正在直播中');
    await page.waitForFunction(()=>Array.from(document.querySelectorAll('.lc-live-card-cover img')).every(img=>img.complete&&img.naturalWidth===750));
    fs.mkdirSync(out,{recursive:true});
    await page.screenshot({path:path.join(out,'first-group.png')});
    await page.locator('.lc-live-section').hover();
    await page.getByRole('button',{name:'下一组',exact:true}).click();
    assert.equal(await page.locator('.lc-live-card').count(),1);
    assert.equal(await page.locator('.lc-live-card-title').textContent(),'全球财富研习营');
    await page.locator('.gaip-learning-scroll').evaluate(el=>el.scrollTop=0);
    await page.screenshot({path:path.join(out,'second-group.png')});
    await page.getByRole('button',{name:'切换到第 1 组',exact:true}).click();
    assert.equal(await page.locator('.lc-live-card').count(),2);
    const saved=await page.evaluate(()=>({live:localStorage.getItem('gaip-learning-live-v12'),course:localStorage.getItem('gaip-learning-v11')}));
    assert.equal(saved.course,original.course,'learning data untouched');
    assert.equal(JSON.parse(saved.live).banners.length,original.banners.length,'no banner added');
    for(const b of JSON.parse(saved.live).banners){const old=original.banners.find(x=>x.id===b.id);assert.equal(b.image,old.image);assert.equal(b.publicTitle,old.publicTitle);}
    await page.reload();await page.locator('.lc-live-card').first().waitFor();
    assert.equal(await page.evaluate(()=>localStorage.getItem('gaip-learning-live-v12')),saved.live,'refresh does not repeat renewal');
    assert.deepEqual(errors.filter(message=>!baselineErrors.includes(message)),[],'no new error types after renewal');
    console.log('PASS full file entry: expired Mock renewal, images, countdown/live, arrow and dot paging, reload idempotence, courses and banner count preserved');
  } finally {
    console.log('Page console errors (separate from assertions):',JSON.stringify(errors));
    await browser.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
