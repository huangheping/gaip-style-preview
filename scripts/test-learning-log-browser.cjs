// Native dialog + real shared table/controller in an isolated document, no online writes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try {
  const p=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.setContent('<section id="page"><header class="gaip-learning-header"><button data-learning-action="学情管理">学情管理</button><button data-learning-action="课程管理">课程管理</button></header></section>');
  // Channel CSS may load before the shared modal defaults: its width must still win.
  for(const f of ['features/learning-center/learning-v11.css','shared/styles/global-font.css','shared/styles/global-modal.css','shared/styles/global-modal-position.css','shared/styles/global-modal-mask.css','shared/styles/global-filter-bar.css','shared/styles/global-table.css'])await p.addStyleTag({content:read(f)});
  for(const f of ['shared/scripts/global-modal.js','shared/scripts/global-modal-position.js','shared/scripts/global-multi-select.js','shared/scripts/global-filter-bar.js','shared/scripts/global-table.js','features/learning-center/learning-data.js','features/learning-center/learning-app.js'])await p.evaluate(({source,url})=>{Object.defineProperty(document,'currentScript',{configurable:true,value:{src:url}});window.eval(source);},{source:read(f),url:'file://'+path.join(root,f)});
  if(process.env.LOG_MOCK_ONLY){
   await p.evaluate(()=>__GAIP_LEARNING_APP__.mount(document.querySelector('#page')));
   await p.locator('[data-learning-action="课程管理"]').click();await p.locator('[data-lc="logs"]').click();
   const d=p.locator('.lc-course-log-modal'),row=d.locator('tbody tr').first();
   assert.match(await row.textContent(),/展开演示 · 双侧长文本/);
   const before=row.locator('td').nth(4),after=row.locator('td').nth(5);
   await before.getByRole('button',{name:'展开全部',exact:true}).waitFor();
   assert.equal(await after.getByRole('button',{name:'展开全部',exact:true}).isVisible(),true);
   await before.getByRole('button',{name:'展开全部',exact:true}).click();
   assert.equal(await row.locator('td').evaluateAll(ns=>ns.every(n=>getComputedStyle(n).verticalAlign==='top')),true);
   assert.equal(await before.locator('button').evaluate(n=>getComputedStyle(n).paddingLeft),'0px');
   assert.ok(await before.evaluate(n=>Math.abs(n.querySelector('button').getBoundingClientRect().left-n.querySelector('.lc-log-value').getBoundingClientRect().left)<1),'toggle and text share left edge');
   assert.equal(await p.locator('.lc-manage-results tbody td').first().evaluate(n=>getComputedStyle(n).verticalAlign),'middle','other table defaults unchanged');
   assert.equal(await after.locator('button').getAttribute('aria-expanded'),'false');
   assert.match(await before.locator('.lc-log-value').textContent(),/\n实践安排/);
   if(process.env.LOG_SCREENSHOT)await d.screenshot({path:process.env.LOG_SCREENSHOT});
   await before.getByRole('button',{name:'收起全部',exact:true}).click();
   assert.ok(await before.locator('.lc-log-value').evaluate(n=>n.clientHeight<=88));
   const shortRow=d.locator('tbody tr').filter({hasText:'展开演示 · 短内容改长内容'});
   assert.equal(await shortRow.locator('td').nth(4).locator('button').isVisible(),false);
   assert.equal(await shortRow.locator('td').nth(5).getByRole('button',{name:'展开全部',exact:true}).isVisible(),true);
   assert.deepEqual(errors,[]);console.log('PASS shipped long-value Mock: first-page entry, independent expansion/collapse, newlines and short/long contrast');return;
  }
  await p.evaluate(()=>{
   const D=window.__GAIP_LEARNING_DATA__;
   D.state().logs=[]; // Isolate pagination fixture; additive Mock migration is tested separately.
   for(let i=0;i<27;i++){const c=D.clone(D.course('c1'));c.description=i===0?'短描述':'示例变更 '+i+'：'+('课程内容与课节说明。'.repeat(8))+'\n第二段说明\n<script>bad()</script>';D.save(c);}
   D.log('导出学情',null,'不属于课程日志');window.__beforeLogs=JSON.stringify(D.state());
   window.__GAIP_LEARNING_APP__.mount(document.querySelector('#page'));
  });
  await p.locator('[data-learning-action="课程管理"]').click();
  await p.evaluate(()=>{window.__managerNode=document.querySelector('.lc-manage-results');window.__GAIP_TABLE__.get(window.__managerNode).setPage(2);});
  const trigger=p.locator('[data-lc="logs"]'),dialog=p.locator('[data-gaip-modal-id="learning-course-log"]');
  await trigger.click();await dialog.waitFor({state:'visible'});
  assert.equal(await dialog.locator('[data-log-close]').evaluate(n=>getComputedStyle(n,'::before').content),'""');
  assert.match(await dialog.locator('[data-log-close]').evaluate(n=>{const style=getComputedStyle(n,'::before');return style.getPropertyValue('mask-image')||style.getPropertyValue('-webkit-mask-image');}),/data:image\/svg/);
  assert.equal(await dialog.locator('tbody tr').count(),10);
  assert.deepEqual(await dialog.locator('.lc-log-action-tag').first().evaluate(n=>{const s=getComputedStyle(n);return {text:n.textContent,size:s.fontSize,radius:s.borderRadius,padding:s.padding,height:s.height,color:s.color,bg:s.backgroundColor};}),{text:'编辑',size:'12px',radius:'3px',padding:'0px 8px',height:'20px',color:'rgb(52, 90, 198)',bg:'rgb(237, 242, 255)'});
  assert.equal(await dialog.locator('.lc-log-action-tag').first().evaluate(n=>{const reference=__GAIP_TABLE__.tag('编辑');n.parentElement.append(reference);const props=['display','height','padding','borderRadius','fontSize','fontWeight','lineHeight','alignItems','verticalAlign','whiteSpace','borderWidth'];const a=getComputedStyle(n),b=getComputedStyle(reference),same=props.every(k=>a[k]===b[k]);reference.remove();return same;}),true,'classification tag inherits shared component geometry');
  assert.deepEqual(await dialog.locator('.gaip-table__head th').allTextContents(),['操作项目','分类','操作对象','变更字段','变更前','变更后','操作人','操作时间','IP']);
  assert.equal(await dialog.locator('input[type="search"], .gaip-filter-bar').count(),0);
  assert.equal(await dialog.evaluate(d=>Math.round(d.getBoundingClientRect().width)),1200);
  assert.match(await dialog.locator('tbody tr').first().textContent(),/课程介绍/);
  assert.match(await dialog.locator('.gaip-table__total').textContent(),/27/);
  assert.equal(await p.locator('#page').getAttribute('data-learning-view'),'manage');
  const firstRow=dialog.locator('tbody tr').first(),before=firstRow.locator('td').nth(4),after=firstRow.locator('td').nth(5);
  await before.getByRole('button',{name:'展开全部',exact:true}).waitFor({state:'visible'});
  assert.ok(await before.locator('.lc-log-value').evaluate(n=>n.clientHeight<=88&&n.scrollHeight>n.clientHeight));
  await before.getByRole('button',{name:'展开全部',exact:true}).click();
  assert.equal(await before.locator('button').getAttribute('aria-expanded'),'true');
  assert.equal(await after.locator('button').getAttribute('aria-expanded'),'false','before/after independently expand');
  assert.match(await before.locator('.lc-log-value').textContent(),/\n第二段说明\n<script>bad\(\)<\/script>/);
  assert.equal(await before.locator('script').count(),0,'long value remains escaped');
  assert.ok(await before.locator('.lc-log-value').evaluate(n=>n.clientHeight>88));
  await before.getByRole('button',{name:'收起全部',exact:true}).click();
  await after.getByRole('button',{name:'展开全部',exact:true}).click();
  assert.equal(await before.locator('button').getAttribute('aria-expanded'),'false');
  await after.getByRole('button',{name:'收起全部',exact:true}).click();
  await dialog.getByRole('combobox',{name:'每页条数'}).click();
  const picker=dialog.locator('.gaip-table-size-popup');await picker.getByRole('option',{name:'20 条/页',exact:true}).click();
  assert.equal(await dialog.locator('tbody tr').count(),20);
  await dialog.getByRole('button',{name:'下一页',exact:true}).click();assert.equal(await dialog.locator('tbody tr').count(),7);
  const short=dialog.locator('.lc-log-value').filter({hasText:/^短描述$/}).first();
  assert.equal(await short.evaluate(n=>n.nextElementSibling.hidden),true,'short text has no expand action');
  await dialog.getByRole('button',{name:'上一页',exact:true}).click();
  for(const dims of [{width:1440,height:1000},{width:900,height:700},{width:480,height:700}]){
   await p.setViewportSize(dims);await p.waitForTimeout(120);
   const m=await dialog.evaluate(d=>{const r=d.getBoundingClientRect(),b=d.querySelector('.lc-course-log-body'),n=d.querySelector('.gaip-table__pagination'),s=d.querySelector('.gaip-table__scroll');return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,pager:n.getBoundingClientRect().bottom,body:b.getBoundingClientRect().bottom,scroll:s.scrollHeight>s.clientHeight};});
   assert.ok(m.x>=0&&m.y>=0&&m.right<=dims.width+1&&m.bottom<=dims.height+1,JSON.stringify(m));
   assert.ok(m.pager<=m.body+1,'pagination stays inside dialog');assert.ok(m.scroll,'only table body scrolls for long logs');
   if(process.env.LOG_SCREENSHOT && dims.width===1440)await p.screenshot({path:process.env.LOG_SCREENSHOT.replace('.png','-desktop.png')});
  }
  if(process.env.LOG_SCREENSHOT)await p.screenshot({path:process.env.LOG_SCREENSHOT});
  await dialog.getByRole('combobox',{name:'每页条数'}).click();await p.keyboard.press('Escape');assert.equal(await dialog.isVisible(),true);assert.equal(await picker.count(),0);
  await p.keyboard.press('Escape');await dialog.waitFor({state:'detached'});assert.equal(await trigger.evaluate(n=>n===document.activeElement),true);
  assert.equal(await p.evaluate(()=>document.querySelector('.lc-manage-results')===window.__managerNode&&window.__GAIP_TABLE__.get(window.__managerNode).getState().page===2),true);
  await trigger.click();await dialog.getByRole('button',{name:'关闭操作日志',exact:true}).click();await dialog.waitFor({state:'detached'});
  assert.equal(await p.evaluate(()=>JSON.stringify(window.__GAIP_LEARNING_DATA__.state())===window.__beforeLogs),true,'viewing logs cannot mutate data');
  await p.evaluate(()=>{__GAIP_LEARNING_DATA__.state().logs=['新增','编辑','删除','上架','下架','上架课节','下架课节'].map((action,i)=>({id:'tag-'+i,at:'2026-09-10T01:00:00Z',action,operator:'模拟用户',account:'mock.admin',ip:'192.0.2.18',changes:[{object:'分类样式测试课程',field:'课程状态',before:'变更前',after:'变更后'}]}));});
  await p.setViewportSize({width:1440,height:1000});await trigger.click();
  assert.deepEqual(await dialog.locator('.lc-log-action-tag').evaluateAll(ns=>ns.map(n=>({label:n.textContent,tone:n.dataset.tone,color:getComputedStyle(n).color,bg:getComputedStyle(n).backgroundColor}))),['新增','编辑','删除','上架','下架','上架课节','下架课节'].map(label=>{const tone=label==='编辑'?'blue':['删除','下架','下架课节'].includes(label)?'red':'green';return {label,tone,color:{green:'rgb(8, 116, 82)',blue:'rgb(52, 90, 198)',red:'rgb(191, 62, 69)'}[tone],bg:{green:'rgb(233, 248, 240)',blue:'rgb(237, 242, 255)',red:'rgb(255, 240, 240)'}[tone]};}));
  if(process.env.LOG_SCREENSHOT)await dialog.screenshot({path:process.env.LOG_SCREENSHOT.replace('.png','-categories.png')});
  await p.evaluate(()=>window.__GAIP_LEARNING_APP__.destroy());await dialog.waitFor({state:'detached'});
  assert.deepEqual(errors,[]);console.log('PASS native log modal: shared nine-column table/no search/paging/detail, width survives stylesheet order, top-layer picker, responsive bounds, Escape/close/reopen/destroy, underlying page retained, no data writes');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
