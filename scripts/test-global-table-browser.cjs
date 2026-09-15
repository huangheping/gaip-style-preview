'use strict';
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'), read=f=>fs.readFileSync(path.join(root,f),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,ignoreDefaultArgs:['--hide-scrollbars'],...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  // Exercise actual file entry and its real stylesheet order.
  await page.goto('file://'+path.join(root,'全局组件/index.html')+'?component=global-table');
  await page.locator('[data-gaip-table-demo] tbody tr').first().waitFor();
  const table=page.locator('[data-gaip-table-demo]');
  assert.equal(await table.locator('[aria-current="page"]').textContent(),'1','single page still displays current page');assert.equal(await table.locator('select').count(),0,'no system selector');
  assert.equal(await table.locator('header, h3, [aria-sort], [data-table-action="sort"]').count(),0,'no internal title row or sorting controls');
  const scrollbar=await table.locator('.gaip-table__scroll').evaluate(n=>({width:getComputedStyle(n).scrollbarWidth,color:getComputedStyle(n).scrollbarColor,global:getComputedStyle(document.body).scrollbarColor}));
  if(await page.evaluate(()=>CSS.supports('scrollbar-color','red blue'))){assert.equal(scrollbar.width,'auto');assert.match(scrollbar.color,/0.18/);assert.match(scrollbar.global,/0.32/,'outside table unchanged');}else{console.log('Scrollbar color unsupported in this Chromium; global rule uses native fallback.');}
  const tagMetrics=await table.locator('.gaip-table__tag').evaluateAll(nodes=>nodes.map(n=>{const s=getComputedStyle(n);return {height:n.getBoundingClientRect().height,padding:s.paddingLeft,radius:s.borderRadius,font:s.fontSize,line:s.lineHeight,text:s.color,bg:s.backgroundColor,tone:n.className};}));
  assert.ok(tagMetrics.length>=4&&tagMetrics.every(t=>t.height===20&&t.padding==='8px'&&t.radius==='3px'&&t.font==='12px'&&t.line==='12px'),'organization tag dimensions are shared');
  assert.ok(tagMetrics.some(t=>t.tone.includes('--success')&&t.bg==='rgb(56, 158, 13)'&&t.text==='rgb(255, 255, 255)'),'course success colors retained');
  assert.ok(tagMetrics.some(t=>t.tone.includes('--highlight')&&t.bg==='rgb(244, 214, 124)'),'course highlight colors retained');
  const safeTag=await page.evaluate(()=>{const tag=window.__GAIP_TABLE__.tag('<img src=x onerror=alert(1)>',{tone:'unknown injected'});return {text:tag.textContent,children:tag.children.length,classes:tag.className};});
  assert.equal(safeTag.text,'<img src=x onerror=alert(1)>');assert.equal(safeTag.children,0);assert.equal(safeTag.classes,'gaip-table__tag gaip-table__tag--neutral');
  const measure=()=>table.evaluate(n=>{let s=n.querySelector('.gaip-table__scroll'),p=n.querySelector('nav'),h=n.querySelector('th');return {root:n.getBoundingClientRect().toJSON(),scroll:s.getBoundingClientRect().toJSON(),pager:p.getBoundingClientRect().toJSON(),head:h.getBoundingClientRect().toJSON(),overflow:s.scrollHeight>s.clientHeight+1};});
  await page.waitForTimeout(150);let m=await measure();assert.equal(m.overflow,false,'short data stays natural');assert.ok(Math.abs(m.pager.top-m.scroll.bottom)<2,'pager immediately follows rows');
  await page.locator('[data-table-demo="long"]').click();await page.waitForTimeout(150);m=await measure();
  assert.equal(m.overflow,true,'long rows internally scroll');assert.ok(m.root.bottom<=977,'table bottom respects viewport gap');
  const original=m;
  await table.locator('.gaip-table__scroll').evaluate(n=>n.scrollTop=600);await page.waitForTimeout(80);m=await measure();
  assert.ok(Math.abs(m.head.bottom-m.scroll.top)<2,'vertical scrollbar starts below the separate header');assert.ok(Math.abs(m.head.top-original.head.top)<1,'header does not move vertically');assert.ok(Math.abs(m.pager.top-original.pager.top)<1,'pagination does not scroll');
  await table.getByRole('button',{name:'下一页',exact:true}).click();assert.equal(await table.locator('tbody tr').count(),36);assert.equal(await table.locator('.gaip-table__scroll').evaluate(n=>n.scrollTop),0);
  await table.getByRole('combobox',{name:'每页条数'}).click();
  assert.equal(await page.getByRole('listbox',{name:'每页条数'}).isVisible(),true);
  const menuRect=await page.getByRole('listbox',{name:'每页条数'}).boundingBox();assert.ok(menuRect.y>=0&&menuRect.y+menuRect.height<=1000,'menu stays in viewport');
  assert.equal(await table.locator('.gaip-table__size-icon').count(),1);
  await page.getByRole('option',{name:'20 条/页',exact:true}).click();assert.equal(await table.locator('tbody tr').count(),20);assert.equal(await table.locator('[aria-current="page"]').textContent(),'1');
  assert.equal(await table.locator('.gaip-table__jump').count(),0);await table.getByRole('button',{name:'第 5 页',exact:true}).click();assert.equal(await table.locator('tbody tr').count(),6);
  await page.locator('[data-table-demo="wide"]').click();await page.waitForTimeout(100);
  assert.equal(await table.evaluate(n=>n.classList.contains('has-hidden-left')),false,'left edge starts without shadow');
  assert.equal(await table.evaluate(n=>n.classList.contains('has-hidden-right')),true,'right hidden content gets a shadow');
  await table.locator('.gaip-table__scroll').evaluate(n=>{n.scrollLeft=100;n.scrollTop=400;});await page.waitForTimeout(180);
  const edges=await table.evaluate(n=>{const l=n.querySelector('[data-fixed-edge="left"]'),r=n.querySelector('[data-fixed-edge="right"]');return {left:getComputedStyle(l,'::after').boxShadow,right:getComputedStyle(r,'::after').boxShadow,leftBorder:getComputedStyle(l).borderRightWidth,rightBorder:getComputedStyle(r).borderLeftWidth};});
  assert.notEqual(edges.left,'none');assert.notEqual(edges.right,'none');assert.equal(edges.leftBorder,'0px');assert.equal(edges.rightBorder,'0px');

  const alignment=await table.evaluate(n=>{const h=Array.from(n.querySelectorAll('.gaip-table__head th')),cells=Array.from(n.querySelector('tbody tr').cells);return h.map((th,i)=>({header:th.getBoundingClientRect().x,body:cells[i].getBoundingClientRect().x,width:th.getBoundingClientRect().width-cells[i].getBoundingClientRect().width}));});
  assert.ok(alignment.every(c=>Math.abs(c.header-c.body)<1&&Math.abs(c.width)<1),'all columns remain aligned after horizontal and vertical scrolling');
  const fixed=await table.evaluate(n=>{const s=n.querySelector('.gaip-table__scroll').getBoundingClientRect(),a=n.querySelector('th:first-child').getBoundingClientRect(),b=n.querySelector('th:last-child').getBoundingClientRect();return {left:a.left-s.left,right:b.right-(s.left+n.querySelector('.gaip-table__scroll').clientLeft+n.querySelector('.gaip-table__scroll').clientWidth)};});
  assert.ok(Math.abs(fixed.left)<2&&Math.abs(fixed.right)<2,'fixed columns remain aligned');
  const band=await table.evaluate(n=>({band:n.querySelector('.gaip-table__head-band').getBoundingClientRect().right,right:n.getBoundingClientRect().right,color:getComputedStyle(n.querySelector('.gaip-table__head-band')).backgroundColor}));assert.ok(Math.abs(band.band-band.right)<2,'header fills through right gutter');assert.equal(band.color,'rgb(248, 245, 243)');
  await table.getByRole('combobox',{name:'每页条数'}).press('ArrowDown');assert.equal(await page.getByRole('option',{name:'50 条/页',exact:true}).getAttribute('aria-selected'),'true');
  if(process.env.TABLE_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.TABLE_SCREENSHOT_DIR,'table-wide.png'),fullPage:true});
  await page.keyboard.press('Escape');assert.equal(await page.getByRole('listbox',{name:'每页条数'}).count(),0);assert.equal(await table.getByRole('combobox',{name:'每页条数'}).evaluate(n=>n===document.activeElement),true);
  await table.getByRole('combobox',{name:'每页条数'}).click();await page.locator('#global-table .componentEntryHeader').click();assert.equal(await page.getByRole('listbox',{name:'每页条数'}).count(),0);

  await table.locator('.gaip-table__scroll').evaluate(n=>n.scrollLeft=n.scrollWidth);await page.waitForTimeout(180);
  assert.equal(await table.evaluate(n=>n.classList.contains('has-hidden-right')),false,'right end clears its shadow');
  await page.locator('[data-table-demo="short"]').click();await page.waitForTimeout(180);
  assert.equal(await table.evaluate(n=>n.classList.contains('has-hidden-left')||n.classList.contains('has-hidden-right')),false,'no overflow means no shadow');
  await page.locator('[data-table-demo="empty"]').click();assert.match(await table.locator('tbody').textContent(),/暂无数据/);
  await page.locator('[data-table-demo="loading"]').click();assert.equal(await table.getAttribute('aria-busy'),'true');assert.equal(await table.getByRole('button',{name:'下一页',exact:true}).isDisabled(),true);
  await page.locator('[data-table-demo="error"]').click();await table.getByRole('button',{name:'重新加载'}).click();assert.equal(await table.locator('tbody tr').count(),50);
  // Switching away and back reflows a previously hidden instance.
  await page.locator('[data-component="filter-bar"]').click();await page.locator('[data-component="global-table"]').click();await page.waitForTimeout(100);m=await measure();assert.ok(m.root.bottom<=977);
  // Load the real course controller in an isolated copy of its page shell.
  await page.goto('about:blank');await page.setContent('<!doctype html><div class="gaip-learning-page" id="page"><header class="gaip-learning-header"><button data-learning-action="学情管理">学情管理</button><button data-learning-action="课程管理">课程管理</button></header></div>');
  for(const f of ['web/umi.c6286171.css','shared/styles/global-font.css','shared/styles/global-multi-select.css','shared/styles/global-filter-bar.css', 'shared/styles/global-date-picker.css','features/learning-center/learning-center.css','features/learning-center/learning-v11.css','shared/styles/global-table.css'])await page.addStyleTag({content:read(f)});
  for(const f of ['shared/scripts/global-modal.js','shared/scripts/global-multi-select.js','shared/scripts/global-date-picker.js', 'shared/scripts/global-filter-bar.js','shared/scripts/global-table.js','features/learning-center/learning-data.js','features/learning-center/learning-app.js'])await page.evaluate(({source,url})=>{Object.defineProperty(document,'currentScript',{configurable:true,value:{src:url}});window.eval(source);},{source:read(f),url:'file://'+path.join(root,f)});
  await page.evaluate(()=>{const D=window.__GAIP_LEARNING_DATA__;for(let i=0;i<65;i++){let c=D.newCourse();c.title='浏览器分页测试 '+i;c.description='测试';c.image=D.course('c1').image;c.groups=['all'];c.required=false;D.save(c);}window.__GAIP_LEARNING_APP__.mount(document.querySelector('#page'));});
  await page.locator('[data-learning-action="课程管理"]').click();
  const manager=page.locator('.lc-manage-results');
  await manager.getByRole('combobox',{name:'每页条数'}).click();await page.getByRole('option',{name:'50 条/页',exact:true}).click();await page.waitForTimeout(150);
  for (const dims of [{width:1440,height:1000},{width:1100,height:760},{width:800,height:760}]){
   await page.setViewportSize(dims);await page.waitForFunction(()=>{const n=document.querySelector('.lc-manage-results'),b=n.closest('main');return n.getBoundingClientRect().bottom<=b.getBoundingClientRect().bottom-23&&b.scrollHeight<=b.clientHeight+2;});
   const r=await manager.evaluate(n=>{const s=n.querySelector('.gaip-table__scroll'),p=n.querySelector('nav'),b=n.closest('main');return {bottom:n.getBoundingClientRect().bottom,boundary:b.getBoundingClientRect().bottom,bodyOverflow:s.scrollHeight>s.clientHeight,pager:p.getBoundingClientRect().bottom,outerOverflow:b.scrollHeight>b.clientHeight+2};});
   assert.ok(r.bodyOverflow);assert.ok(r.bottom<=r.boundary-23,'manager pager remains inside bottom padding '+JSON.stringify({dims,r}));assert.equal(r.outerOverflow,false,'no outer vertical scrollbar');
  }
  if(process.env.TABLE_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.TABLE_SCREENSHOT_DIR,'table-course.png'),fullPage:true});
  // Filter shrink/empty resets paging, preserves the instance, and releases spare height.
  await page.evaluate(()=>window.__GAIP_FILTER_BAR__.get(document.querySelector('.lc-manage-filter-slot')).setValue({q:'浏览器分页测试 64'}));await page.waitForTimeout(100);
  assert.equal(await manager.locator('tbody tr').count(),1);assert.equal(await manager.locator('.gaip-table__scroll').evaluate(n=>n.scrollHeight>n.clientHeight+1),false);
  await manager.getByRole('combobox',{name:'每页条数'}).click();await page.evaluate(()=>window.__GAIP_LEARNING_APP__.destroy());assert.equal(await page.locator('.gaip-table-size-popup').count(),0,'destroy releases portal');
  assert.deepEqual(errors,[]);console.log('PASS real file catalog + isolated real course controller: natural/max height, sticky header/columns, simple pagination/size/state/retry, body-only light scrollbar, header alignment, 1440/1100/800 resize, filter shrink and lifecycle.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
