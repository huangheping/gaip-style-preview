// Component CSS/geometry check, not a full source-page acceptance test.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:650}});
  await page.setContent('<main style="padding:32px"><div class="gaip-learning-v11" id="filter"></div><p>独立共享多选</p><div id="multi" style="width:320px"></div><p>弹窗清除图标基准</p><div class="gaip-modal-controls"><button class="gaip-mc-clear" type="button" aria-label="清除内容"></button></div></main>');
  for(const file of ['web/umi.c6286171.css','shared/styles/global-font.css','shared/styles/global-modal.css','shared/styles/modal-controls.css','shared/styles/global-multi-select.css','shared/styles/global-filter-bar.css', 'shared/styles/global-date-picker.css','features/learning-center/learning-v11.css']){
   let css=read(file).replace(/url\((['"]?)([^)'"?#]+)(?:[?#][^)'"\s]*)?\1\)/g,(match,q,url)=>{
    if(!url.endsWith('.svg'))return match;const asset=path.resolve(root,path.dirname(file),url);return fs.existsSync(asset)?'url("data:image/svg+xml;base64,'+fs.readFileSync(asset).toString('base64')+'")':match;
   });await page.addStyleTag({content:css});
  }
  for(const f of ['shared/scripts/global-multi-select.js','shared/scripts/global-filter-bar.js'])await page.addScriptTag({content:read(f)});
  await page.evaluate(()=>{
   window.__GAIP_FILTER_BAR__.mount(document.querySelector('#filter'),{fields:[{key:'q',type:'search',label:'课程搜索',defaultValue:'测试课程'},{key:'groups',type:'multiSelect',label:'学习群组',options:['香港业务','新加坡业务'],defaultValue:['香港业务']}],actions:{reset:false,more:false}});
   window.__GAIP_MULTI_SELECT__.mount(document.querySelector('#multi'),{options:['香港业务'],value:['香港业务']});
  });
  const targets=['.gaip-filter-bar__clear','#filter .gaipMultiSelect__clear','#multi .gaipMultiSelect__clear','.gaip-modal-controls .gaip-mc-clear'];
  for(const target of targets){
   const el=page.locator(target);await el.focus();
   const r=await el.evaluate(e=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e),p=getComputedStyle(e,'::before');return {w:b.width,h:b.height,size:s.backgroundImage==='none'?p.backgroundSize:s.backgroundSize,image:s.backgroundImage==='none'?p.backgroundImage:s.backgroundImage,font:s.fontSize};});
   assert.equal(r.w,24,target+' click width');assert.equal(r.h,24,target+' click height');assert.equal(r.size,'16px 16px',target+' graphic size');assert.match(r.image,/data:image\/svg\+xml;base64/);
   if(target.includes('gaipMultiSelect'))assert.equal(r.font,'0px','text × must not overlay SVG');
  }
  if(process.env.CLEAR_ICON_SCREENSHOT)await page.screenshot({path:process.env.CLEAR_ICON_SCREENSHOT});
  await page.locator('.gaip-filter-bar__clear').click();assert.equal(await page.locator('#filter input[type="search"]').inputValue(),'');
  await page.locator('#filter .gaipMultiSelect__control').focus();await page.locator('#filter .gaipMultiSelect__clear').click();assert.equal(await page.locator('#filter .gaipMultiSelect__tag').count(),0);
  await page.locator('#multi .gaipMultiSelect__control').focus();await page.locator('#multi .gaipMultiSelect__clear').click();assert.equal(await page.locator('#multi .gaipMultiSelect__tag').count(),0);
  console.log('PASS Chromium clear icons: same SVG, 16px graphic/24px target in search, filter multi, standalone multi and modal baseline; no text overlay; clear actions intact.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
