const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});try{
const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.setContent('<body></body>');
// Use the real channel header, including its title, subtitle and permission buttons.
const channelSource=read('features/learning-center/learning-center.js');
const pageFactory=channelSource.slice(channelSource.indexOf('  function createLearningPage()'),channelSource.indexOf('  function currentBaseHash()'));
await p.evaluate(source=>{const page=new Function(source+'; return createLearningPage();')();page.id='page';document.body.append(page);},pageFactory);
await p.evaluate(()=>{const storage={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v}});});
// Keep existing empty/single/multiple-state assertions independent of the shipped example batch.
if(!process.env.LIVE_MOCK_SEED)await p.evaluate(()=>localStorage.setItem('gaip-learning-live-v12',JSON.stringify({version:1,banners:[],logs:[],mockBatches:{'live-examples-20260916':true}})));
await p.route('https://local.example/assets/learning/**',route=>{const filename=path.basename(new URL(route.request().url()).pathname),asset=path.join(root,'assets/learning',filename);return fs.existsSync(asset)?route.fulfill({body:fs.readFileSync(asset),contentType:filename.endsWith('.svg')?'image/svg+xml':'image/jpeg'}):route.abort();});
for(const f of ['shared/styles/global-carousel-controls.css','shared/styles/global-font.css','shared/styles/global-modal.css','shared/styles/global-modal-position.css','shared/styles/global-modal-mask.css','shared/styles/global-page-form.css','shared/styles/global-multi-select.css','shared/styles/global-filter-bar.css','shared/styles/global-table.css','shared/styles/global-date-picker.css','shared/styles/modal-controls.css','features/learning-center/learning-center.css','features/learning-center/learning-v11.css','features/learning-center/learning-live.css'])await p.addStyleTag({content:read(f)});
for(const f of ['shared/scripts/global-carousel-controls.js','shared/scripts/global-modal.js','shared/scripts/global-modal-position.js','shared/scripts/global-multi-select.js','shared/scripts/global-date-picker.js','shared/scripts/modal-controls.js','shared/scripts/global-filter-bar.js','shared/scripts/global-table.js','features/learning-center/learning-data.js','features/learning-center/learning-live-data.js','features/learning-center/learning-live.js','features/learning-center/learning-app.js'])await p.evaluate(({s,f})=>{Object.defineProperty(document,'currentScript',{configurable:true,value:{src:'https://local.example/'+f}});window.eval(s);},{s:read(f),f});
const originalHeaderHeight=(await p.locator('.gaip-learning-header').boundingBox()).height;
const originalData=await p.evaluate(()=>JSON.stringify({courses:__GAIP_LEARNING_DATA__.state().courses,records:__GAIP_LEARNING_DATA__.state().records,logs:__GAIP_LEARNING_DATA__.state().logs}));
// Even a previously saved learner identity should start as local preview administrator.
await p.evaluate(()=>{window.__GAIP_LEARNING_DATA__.setUser('u2');window.__GAIP_LEARNING_APP__.mount(document.querySelector('#page'));});
assert.equal(await p.evaluate(()=>window.__GAIP_LEARNING_DATA__.user().id),'u1');
assert.equal(await p.locator('.lc-demo,[data-profile]').count(),0);
assert.equal(await p.locator('.lc-live-banner').count(),0,'home uses horizontal cards, not the previous carousel');
assert.equal(await p.locator('[data-learning-action="直播管理"]:visible').count(),1);
assert.equal((await p.locator('.gaip-learning-header').boundingBox()).height,originalHeaderHeight);
assert.equal(await p.evaluate(()=>JSON.stringify({courses:__GAIP_LEARNING_DATA__.state().courses,records:__GAIP_LEARNING_DATA__.state().records,logs:__GAIP_LEARNING_DATA__.state().logs})),originalData,'home restoration preserves course and learning data');
const switchPreview=async id=>p.evaluate(({id,source})=>{window.__GAIP_LEARNING_APP__.destroy();window.__GAIP_LEARNING_DATA__.setUser(id);const old=document.querySelector('#page'),next=new Function(source+'; return createLearningPage();')();next.id='page';old.replaceWith(next);window.__GAIP_LEARNING_APP__.mount(next);},{id,source:pageFactory});
if(process.env.LIVE_MOCK_SEED){
  assert.equal(await p.locator('[data-learning-action]:visible').count(),3);
  const before=await p.evaluate(()=>JSON.stringify(__GAIP_LEARNING_LIVE_DATA__.list()));
  assert.equal(JSON.parse(before).length,8,'live examples retained, not deleted');
  const title=await p.locator('.gaip-learning-title').boundingBox(),header=await p.locator('.gaip-learning-header').boundingBox();
  assert.equal(title.x-header.x,24,'original left title inset');
  assert.equal(await p.locator('.lc-live-card').count(),2);
  assert.equal(await p.locator('.lc-live-card-title').first().textContent(),'GLORY产品及服务说明会预告：全球视野 · 传承洞察');
  assert.equal(await p.locator('.lc-live-card-summary').first().textContent(),'每周四早八点不见不散');
  await p.waitForFunction(()=>Array.from(document.querySelectorAll('.lc-live-card-label-icon')).every(n=>n.complete&&n.naturalWidth===14));
  assert.deepEqual(await p.locator('.lc-live-card-label').first().evaluate(n=>({background:getComputedStyle(n).backgroundColor,color:getComputedStyle(n).color})),{background:'rgb(17, 17, 17)',color:'rgb(239, 206, 136)'});
  assert.match(read('assets/learning/live-video-label.svg'),/fill="#EFCE88"/,'icon uses exact requested gold');
  assert.equal(await p.locator('.gaip-carousel-dots').count(),1);
  assert.equal(await p.locator('.lc-live-courses-heading').isVisible(),true);
  const hoverStyles=async(selector,image)=>{
    await p.locator(selector).first().hover();await p.waitForTimeout(400);
    return p.locator(selector).first().evaluate((el,img)=>{const s=getComputedStyle(el),i=getComputedStyle(el.querySelector(img));return {background:s.backgroundColor,shadow:s.boxShadow,transform:s.transform,transition:s.transition,imageTransform:i.transform,imageTransition:i.transition};},image);
  };
  const courseHover=await hoverStyles('.gaip-course-card','.gaip-course-image');
  const liveHover=await hoverStyles('.lc-live-card','.lc-live-card-cover img');
  assert.deepEqual(liveHover,courseHover,'live and course hover use identical visual rules');
  assert.equal(await p.locator('.lc-live-card').first().evaluate(n=>getComputedStyle(n).borderColor),'rgb(229, 231, 231)','no special green border');
  await p.screenshot({path:'/tmp/gaip-learning-live-hover.png'});
  await p.mouse.move(0,0);await p.keyboard.press('Tab');
  const focusStyles=async selector=>{
    await p.locator(selector).first().focus();await p.waitForTimeout(400);
    assert.equal(await p.locator(selector).first().evaluate(n=>n.matches(':focus-visible')),true);
    return p.locator(selector).first().evaluate(n=>({shadow:getComputedStyle(n).boxShadow,transform:getComputedStyle(n).transform}));
  };
  assert.deepEqual(await focusStyles('.lc-live-card'),await focusStyles('.gaip-course-card'),'keyboard focus feedback matches');
  await p.evaluate(()=>document.activeElement.blur());await p.waitForTimeout(400);
  for(const width of [1920,1440,900,480,320]) {
    await p.setViewportSize({width,height:1000});
    assert.equal(await p.locator('.lc-live-cards').evaluate(n=>n.scrollWidth>n.clientWidth+1),false,'cards fit '+width);
    assert.equal(await p.locator('.lc-live-section').evaluate(n=>Array.from(n.querySelectorAll('.gaip-carousel-arrow')).some(b=>{const r=b.getBoundingClientRect(),s=n.closest('.gaip-learning-scroll').getBoundingClientRect();return r.left<s.left||r.right>s.right;})),false,'edge arrows stay inside scroll viewport '+width);
    assert.equal(await p.locator('.gaip-learning-header').evaluate(n=>{const r=n.getBoundingClientRect();return Array.from(n.querySelectorAll('h1,p,button')).filter(el=>!el.hidden).some(el=>{const b=el.getBoundingClientRect();return b.top<r.top-1||b.bottom>r.bottom+1||b.right>r.right+1;});}),false,'visible header content not clipped '+width);
    const cards=await p.locator('.lc-live-card').all();
    const first=await cards[0].boundingBox(),second=await cards[1].boundingBox();
    if(width>=900){const cover=await cards[0].locator('.lc-live-card-cover').boundingBox();assert.ok(Math.abs(cover.width-(first.width-34)*.46)<1,'larger cover is 46% of card content');}
    if(width>=1440)assert.equal(first.y,second.y,'two columns on wide content');
    else assert.ok(second.y>first.y,'narrow content stacks cards');
    if(width===1440||width===480)await p.screenshot({path:'/tmp/gaip-learning-live-cards-'+width+'.png'});
  }
  await p.setViewportSize({width:1440,height:1000});
  await p.getByRole('button',{name:'下一组',exact:true}).click();
  assert.equal(await p.locator('.lc-live-card').count(),1);
  assert.equal(await p.evaluate(()=>document.activeElement.dataset.carouselControl),'next','paging preserves control focus');
  assert.equal(await p.locator('.gaip-carousel-dot[aria-current="true"]').getAttribute('data-carousel-index'),'1');
  await p.screenshot({path:'/tmp/gaip-learning-live-last-group.png'});
  await p.getByRole('button',{name:'下一组',exact:true}).click();
  assert.equal(await p.locator('.lc-live-card').count(),2,'last group wraps to first');
  await p.getByRole('button',{name:'切换到第 2 组',exact:true}).click();
  assert.equal(await p.locator('.lc-live-card').count(),1,'indicator click changes group');
  await p.keyboard.press('Space');
  assert.equal(await p.locator('.lc-live-card').count(),1,'current indicator activation is a no-op');
  await p.getByRole('button',{name:'上一组',exact:true}).click();
  // Status updates must not rebuild cards or steal keyboard focus.
  const liveId='live-demo-20260916-pathway',statusCard=p.locator('[data-live-card="'+liveId+'"]');
  await statusCard.focus();
  await p.evaluate(id=>{window.realNow=Date.now;Date.now=()=>Date.parse(__GAIP_LEARNING_LIVE_DATA__.get(id).liveStartAt)-60000;},liveId);
  await p.waitForTimeout(1200);
  assert.match(await statusCard.locator('.lc-live-card-status').textContent(),/距开播/);
  await p.evaluate(id=>{Date.now=()=>Date.parse(__GAIP_LEARNING_LIVE_DATA__.get(id).liveStartAt)+1;},liveId);
  await p.waitForTimeout(1200);
  assert.equal(await statusCard.locator('.lc-live-card-status').textContent(),'直播中');
  assert.equal(await p.evaluate(()=>document.activeElement.dataset.liveCard),liveId);
  await p.evaluate(()=>Date.now=window.realNow);
  await switchPreview('u2');
  assert.equal(await p.locator('[data-learning-action]:visible').count(),0);
  assert.equal((await p.locator('.gaip-learning-header').boundingBox()).height,originalHeaderHeight);
  assert.equal(await p.locator('.lc-live-banner').count(),0);
  assert.ok(await p.locator('.lc-live-card').count()>0,'learner still sees permitted live cards without management buttons');
  await switchPreview('u1');
  assert.equal(await p.evaluate(()=>JSON.stringify(__GAIP_LEARNING_LIVE_DATA__.list())),before);
  await p.evaluate(()=>{const L=__GAIP_LEARNING_LIVE_DATA__;L.visible().slice(1).forEach(b=>L.offline(b.id));});
  assert.equal(await p.locator('.lc-live-card').count(),1);
  const card=await p.locator('.lc-live-card').boundingBox(),section=await p.locator('.lc-live-section').boundingBox();
  assert.ok(Math.abs(card.width-(section.width-24)/2)<1,'single card keeps double-column width');
  assert.ok(Math.abs(card.x-section.x)<1,'single card stays left aligned');
  const poster=await p.locator('.lc-live-card-cover').boundingBox();assert.ok(Math.abs(poster.width/poster.height-750/320)<.02);
  assert.equal(await p.locator('.gaip-carousel-dots').count(),0);
  await p.screenshot({path:'/tmp/gaip-learning-live-single.png'});
  await p.setViewportSize({width:480,height:1000});
  const narrowCard=await p.locator('.lc-live-card').boundingBox(),narrowSection=await p.locator('.lc-live-section').boundingBox();
  assert.ok(Math.abs(narrowCard.width-narrowSection.width)<1,'single card follows shared narrow-screen layout');
  await p.setViewportSize({width:1440,height:1000});
  const headerBefore=await p.locator('.gaip-learning-header').boundingBox();
  await p.locator('.gaip-learning-scroll').evaluate(n=>n.scrollTop=250);
  assert.deepEqual(await p.locator('.gaip-learning-header').boundingBox(),headerBefore,'live area scrolls, header unchanged');
  await p.evaluate(()=>{const L=__GAIP_LEARNING_LIVE_DATA__;L.offline(L.visible()[0].id);});
  assert.equal(await p.locator('.lc-live-section').isVisible(),false);
  assert.equal(await p.locator('.lc-live-courses-heading').isVisible(),false);
  assert.equal((await p.locator('.gaip-learning-header').boundingBox()).height,originalHeaderHeight);
  await p.locator('.gaip-learning-scroll').evaluate(n=>n.scrollTop=0);
  await p.screenshot({path:'/tmp/gaip-learning-live-empty.png'});
  await p.locator('[data-learning-action="课程管理"]').click();
  assert.ok(await p.locator('tbody tr').count()>0);
  await p.evaluate(()=>window.__GAIP_LEARNING_APP__.destroy());assert.deepEqual(errors,[]);
  console.log('PASS live cards: single/double/empty/paging, countdown transition, permissions, data preservation, unchanged fixed header, 320–1920px');return;
}
// Live module stays available for later work; test it in isolation, not through the withdrawn home entry.
await p.evaluate(()=>{
  const A=__GAIP_LEARNING_APP__,L=__GAIP_LEARNING_LIVE__,host=document.querySelector('#page');A.destroy();
  window.testOpenLiveManager=function(){
    if(window.testLiveCleanup)window.testLiveCleanup();
    window.testLiveCleanup=L.mountManager(host,{logs:A.openCourseLog,back:function(){
      window.testLiveCleanup();host.innerHTML='<div class="lc-live-banner"></div>';
      window.testLiveCleanup=L.mountCarousel(host.querySelector('.lc-live-banner'));
    }});
  };
});
await p.evaluate(()=>window.testOpenLiveManager());assert.equal(await p.locator('[data-live-table] nav').count(),0);
await p.locator('[data-live-new]').click();assert.equal(await p.locator('.lc-live-editor').isVisible(),true);
assert.equal(await p.locator('[data-live-field="content"]').isVisible(),false);
assert.equal(await p.locator('.lc-live-editor .gaip-modal__form-header').count(),1);
assert.equal(await p.locator('[data-live-save]').evaluate(n=>n.classList.contains('gaip-modal__button--primary')),true);
assert.equal(await p.locator('[name="live-type"]').first().evaluate(n=>getComputedStyle(n).height),'16px');
assert.equal(await p.locator('#live-startAt').evaluate(n=>n.classList.contains('gaip-native-date')),true);
assert.equal(await p.locator('#live-liveStartAt').evaluate(n=>n.classList.contains('gaip-native-date')),true,'actual start uses shared date control');
await p.locator('#live-liveStartAt').click();await p.locator('.gaip-native-popup .gaip-date-panel').waitFor({timeout:4000});await p.keyboard.press('Escape');
await p.locator('#live-startAt').scrollIntoViewIfNeeded();await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
await p.locator('#live-startAt').click();await p.locator('.gaip-native-popup .gaip-date-panel').waitFor({timeout:4000});await p.keyboard.press('Escape');
assert.equal(await p.locator('.lc-live-editor').isVisible(),true,'calendar Escape must not close editor');
await p.locator('[data-live-save]').click();assert.equal(await p.locator('#live-name').getAttribute('aria-invalid'),'true');
await p.locator('#live-name').fill('直播浏览器测试');await p.locator('[name="live-type"][value="url"]').check();await p.locator('#live-content').fill('https://example.com/live-test');
await p.locator('#live-publicTitle').fill('面向学员的直播标题');await p.locator('#live-summary').fill('本地展示简介');
await p.locator('#live-image').setInputFiles({name:'Banner.jpg',mimeType:'image/jpeg',buffer:fs.readFileSync(path.join(root,'assets/learning/course-01-arkos.jpg'))});await p.locator('.lc-live-image-slot img').waitFor();
await p.locator('#live-groups [role="combobox"]').click();await p.locator('#live-groups [data-value="all"]').click();await p.keyboard.press('Escape');
// Set the real datetime inputs and dispatch their normal value event; calendar is shared.
await p.evaluate(()=>{for(const [key,delta] of [['startAt',300000],['endAt',3600000],['liveStartAt',1800000]]){const n=document.querySelector('#live-'+key),d=new Date(Date.now()+delta);n.value=new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,16);n.dispatchEvent(new Event('input',{bubbles:true}));n.dispatchEvent(new Event('change',{bubbles:true}));}});
await p.locator('.lc-live-editor .ant-modal-body').evaluate(n=>n.scrollTop=0);
await p.screenshot({path:'/tmp/gaip-live-editor.png'});
for(const width of [1440,480]){await p.setViewportSize({width,height:1000});assert.equal(await p.locator('.lc-live-editor').evaluate(n=>n.scrollWidth>n.clientWidth+1),false);if(width===480)await p.screenshot({path:'/tmp/gaip-live-editor-mobile.png'});}
await p.setViewportSize({width:1440,height:1000});await p.locator('[data-live-save]').click();await p.locator('.lc-live-editor').waitFor({state:'detached'});
assert.equal(await p.evaluate(()=>__GAIP_LEARNING_LIVE_DATA__.list()[0].publicTitle),'面向学员的直播标题');
assert.ok(await p.evaluate(()=>Date.parse(__GAIP_LEARNING_LIVE_DATA__.list()[0].liveStartAt)>Date.now()));
await p.locator('[data-live-table] tbody').getByRole('button',{name:'上架',exact:true}).click();await p.locator('[name="live-publish-mode"][value="now"]').check();await p.getByRole('button',{name:'确认上架',exact:true}).click();
assert.match(await p.locator('[data-live-table] tbody').textContent(),/已上架/);
await p.locator('.lc-live-url').click();assert.equal(await p.locator('.lc-live-url-value').textContent(),'https://example.com/live-test');await p.keyboard.press('Escape');assert.equal(await p.locator('.lc-live-url-value').count(),0);
await p.screenshot({path:'/tmp/gaip-live-manager.png'});
await p.locator('[data-live-back]').click();assert.equal(await p.locator('.lc-live-banner').isVisible(),true);assert.equal(await p.locator('.lc-live-arrow').count(),0);
assert.ok(await p.locator('.lc-live-banner img').evaluate(n=>n.complete&&n.naturalWidth>0));
const r=await p.locator('.lc-live-banner').boundingBox();assert.ok(Math.abs(r.width/r.height-750/320)<0.01);
await p.screenshot({path:'/tmp/gaip-live-banner.png'});
await p.evaluate(()=>{const L=window.__GAIP_LEARNING_LIVE_DATA__,b=L.list()[0],n=L.fresh();Object.assign(n,{name:'第二场',image:b.image,type:'url',content:'https://example.com/second',groups:['all'],startAt:new Date(Date.now()+300000).toISOString(),endAt:b.endAt});L.save(n);L.publish(n.id,'now');});
assert.equal(await p.locator('.lc-live-arrow').count(),2);assert.equal(await p.locator('.lc-live-dot').count(),2);
await p.getByRole('button',{name:'下一张直播 Banner'}).click();const label=await p.locator('.lc-live-banner-link').getAttribute('aria-label');await p.waitForTimeout(3200);assert.notEqual(await p.locator('.lc-live-banner-link').getAttribute('aria-label'),label);
await p.evaluate(()=>window.testOpenLiveManager());await p.locator('[data-live-log]').click();assert.match(await p.locator('.lc-course-log-table').textContent(),/操作项目/);assert.match(await p.locator('.lc-course-log-table').textContent(),/直播 Banner/);await p.locator('[data-log-close]').click();
await p.locator('[data-live-new]').click();await p.locator('#live-name').fill('未保存');await p.locator('[data-live-cancel]').click();await p.getByRole('button',{name:'放弃修改',exact:true}).click();assert.equal(await p.locator('dialog[open]').count(),0);
await p.evaluate(()=>{if(window.testLiveCleanup)window.testLiveCleanup();window.__GAIP_LEARNING_APP__.destroy();});
const pagination=await p.evaluate(()=>{const host=document.createElement('section');document.body.append(host);const rows=Array.from({length:31},(_,i)=>({name:'条目'+i})),T=window.__GAIP_TABLE__;let t=T.mount(host,{columns:[{key:'name',label:'名称'}],rows,pagination:false});const all=host.querySelectorAll('tbody tr').length,noPager=!host.querySelector('nav');t.destroy();t=T.mount(host,{columns:[{key:'name',label:'名称'}],rows});const defaults=host.querySelectorAll('tbody tr').length,pager=!!host.querySelector('nav');t.destroy();host.remove();return {all,noPager,defaults,pager};});
assert.deepEqual(pagination,{all:31,noPager:true,defaults:10,pager:true});assert.deepEqual(errors,[]);console.log('live Chromium UI: shared form/calendar/list/logs, publish, carousel, URL popup, close, pagination opt-in, 480/1440px PASS');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
