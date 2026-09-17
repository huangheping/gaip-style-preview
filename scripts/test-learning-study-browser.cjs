// Isolated real controller: shared study controls, unchanged scope/export and modal lifecycle.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
// Inline real local SVG assets so isolated CSS has the same icons without file navigation.
const readStyle=f=>read(f).replace(/url\((['"]?)([^)'"\s]+)\1\)/g,(match,quote,url)=>{
 const asset=path.resolve(root,path.dirname(f),url);
 return url.endsWith('.svg')&&fs.existsSync(asset)?'url("data:image/svg+xml;base64,'+fs.readFileSync(asset).toString('base64')+'")':match;
});
const checkTabAnimation=require('./tabs-animation-check.cjs');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})}),chromeMajor=Number((browser.version().match(/\d+/)||['0'])[0]);try{
 const p=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.setContent('<style>body{margin:0}#page{margin-left:212px;height:100vh}</style><section class="gaip-learning-page" id="page"><header class="gaip-learning-header"><button data-learning-action="学情管理">学情管理</button><button data-learning-action="课程管理">课程管理</button></header></section>');
 for(const f of ['shared/styles/global-tabs.css','shared/styles/global-font.css','shared/styles/global-modal.css','shared/styles/modal-controls.css','shared/styles/global-modal-position.css','shared/styles/global-modal-mask.css','shared/styles/global-multi-select.css','shared/styles/organization-tree.css','shared/styles/global-filter-bar.css','shared/styles/global-table.css','features/learning-center/learning-center.css','features/learning-center/learning-v11.css'])await p.addStyleTag({content:readStyle(f)});
 for(const f of ['shared/scripts/global-tabs.js','shared/scripts/global-modal.js','shared/scripts/modal-controls.js','shared/scripts/global-modal-position.js','shared/scripts/global-multi-select.js','shared/scripts/global-filter-bar.js','shared/scripts/global-table.js','shared/scripts/operation-log-xlsx.js','shared/scripts/organization-store.js','shared/scripts/organization-tree.js','features/learning-center/learning-data.js','features/learning-center/learning-app.js'])await p.evaluate(({s,url})=>{Object.defineProperty(document,'currentScript',{configurable:true,value:{src:url}});window.eval(s);},{s:read(f),url:'file://'+path.join(root,f)});
 await p.evaluate(()=>{
  const D=__GAIP_LEARNING_DATA__;for(let i=0;i<24;i++)D.state().users.push({...D.clone(D.state().users[1]),id:'test'+i,name:'分页学员'+i,account:'test.'+i});
  D.state().logs=[];for(let i=0;i<13;i++)D.log('导出学情',null,JSON.stringify({type:i%2?'users':'courses',filters:{q:'长条件演示'.repeat(30)},count:i}));
  D.log('编辑',D.course('c1'),'不应出现在学情日志');window.beforeRead=JSON.stringify(D.state());window.exports=[];
  const build=__GAIP_OPERATION_LOG_XLSX__.build;__GAIP_OPERATION_LOG_XLSX__.build=(rows,opts)=>{window.exports.push(rows);return build(rows,opts);};
  __GAIP_LEARNING_APP__.mount(document.querySelector('#page'));
 });
 await p.locator('[data-learning-action="学情管理"]').click();
 const tabs=p.getByRole('tablist',{name:'统计维度'});
 await p.locator('.lc-stats-tabs[data-gaip-tabs]').waitFor();
 await p.waitForTimeout(220);
 assert.equal(await tabs.evaluate(n=>n.parentElement.classList.contains('lc-stats-header')),true);
 assert.equal(await tabs.getByRole('tab',{selected:true}).textContent(),'学员学习统计');
 assert.equal(await tabs.getByRole('tab',{selected:true}).evaluate(n=>getComputedStyle(n,'::after').width),'71px');
 assert.deepEqual(await tabs.getByRole('tab',{selected:true}).evaluate(n=>[getComputedStyle(n).fontSize,getComputedStyle(n).fontWeight]),['16px','700']);
 await checkTabAnimation(p,'.lc-stats-tabs','[data-id="courses"]');
 await checkTabAnimation(p,'.lc-stats-tabs','[data-id="users"]');
 await tabs.getByRole('tab',{selected:true}).focus();await p.keyboard.press('ArrowRight');
 assert.equal(await tabs.getByRole('tab',{selected:true}).textContent(),'课程学习统计');
 await p.keyboard.press('Home');assert.equal(await tabs.getByRole('tab',{selected:true}).textContent(),'学员学习统计');
 const table=p.locator('.lc-stats-results'),bar=p.locator('.lc-stats-filter-slot');
 const org=bar.locator('[data-filter-key="org"] [role="combobox"]');
 await org.click();const orgPopup=p.locator('.gaip-filter-bar__tree-popup:not([hidden])');
 assert.equal(await org.evaluate(n=>n.tagName),'INPUT');
 assert.equal(await orgPopup.locator('input').count(),0,'tree panel has no duplicate search input');
 assert.equal(await orgPopup.locator('[role="treeitem"]').count(),6,'organization picker initially shows top-level organizations only');
 assert.equal(await orgPopup.locator('[data-node-id="0:all"]').getAttribute('aria-expanded'),'false','top-level organization is collapsed by default');
 assert.equal(await orgPopup.locator('[data-node-id="0:department-1"]').count(),0,'collapsed organization hides its children');
 await org.fill('机构服务组');
 assert.equal(await org.evaluate(n=>n===document.activeElement),true,'typing keeps focus in main input');
 assert.equal(await orgPopup.locator('[role="treeitem"]').count(),24,'search retains matching nodes and their ancestors across six channels');
 assert.match(await orgPopup.textContent(),/Glory品牌顾问/);
 await orgPopup.locator('[data-node-id="1:mock-level-3-institution"] .treeNodeName___mtuTp').click();
 assert.equal(await table.locator('tbody tr').count(),1);assert.match(await table.textContent(),/无群组学员/);
 const selectedOrg=await org.inputValue();assert.match(selectedOrg,/机构服务组/);
 await org.click();await org.fill('没有这个组织');assert.match(await orgPopup.textContent(),/未找到匹配组织/);
 await p.keyboard.press('Escape');assert.equal(await org.getAttribute('aria-expanded'),'false');
 assert.equal(await table.locator('tbody tr').count(),1,'search text itself does not change selected organization');
 assert.equal(await org.inputValue(),selectedOrg,'Escape restores committed organization label');
 await org.click();await org.fill('无匹配');await tabs.getByRole('tab',{selected:true}).click();
 assert.equal(await org.inputValue(),selectedOrg,'outside click discards uncommitted query');
 assert.equal(await bar.getByRole('button',{name:'清除所属组织'}).evaluate(n=>getComputedStyle(n).right),'30px','clear icon does not overlap dropdown arrow');
 await bar.getByRole('button',{name:'清除所属组织'}).click();assert.equal(await org.inputValue(),'');
 await org.click();
 await org.evaluate(n=>{n.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));n.value='机构服务组';n.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true}));n.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',isComposing:true,bubbles:true}));});
 assert.equal(await org.evaluate(n=>n===document.activeElement),true,'IME Enter does not choose a node');
 await org.evaluate(n=>n.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true,data:'机构服务组'})));
 assert.equal(await orgPopup.locator('[role="treeitem"]').count(),24);
 await p.keyboard.press('Escape');
 await bar.getByRole('button',{name:'重置',exact:true}).click();
 await org.click();await org.fill('Glory');
 await orgPopup.locator('[data-node-id="1:all"] .treeNodeName___mtuTp').click();
 assert.equal(await table.locator('tbody tr').count(),10,'parent includes descendants and paginates');
 await org.click();await org.fill('Glory');await p.keyboard.press('ArrowDown');
 assert.equal(await p.evaluate(()=>document.activeElement.getAttribute('role')),'treeitem');
 await p.keyboard.press('Enter');assert.equal(await org.getAttribute('aria-expanded'),'false');assert.match(await org.inputValue(),/Glory/);
 await bar.getByRole('button',{name:'重置',exact:true}).click();
 assert.deepEqual(await table.locator('.gaip-table__head th').allTextContents(),['姓名 / 登录账号','所属组织','累计学习时长','当前必修课程数','必修完成率','学习中课程数','已完成课程数','最后学习时间','操作']);
 assert.equal(await p.locator('.lc-stats').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(255, 255, 255)');
 assert.equal(await p.locator('.lc-manage-header').evaluate(n=>getComputedStyle(n).borderTopWidth),'1px');
 assert.equal(await table.locator('tbody td').first().evaluate(n=>getComputedStyle(n).fontSize),'14px');
 assert.equal(await table.locator('tbody td div').first().evaluate(n=>getComputedStyle(n).color),'rgb(47, 54, 64)');
 assert.equal(await table.locator('tbody tr').count(),10);
 await p.evaluate(()=>{window.keptTable=document.querySelector('.lc-stats-results');window.keptBar=document.querySelector('.lc-stats-filter-slot');__GAIP_TABLE__.get(keptTable).setPage(2);window.keptState=__GAIP_TABLE__.get(keptTable).getState();});
 await p.locator('[data-lc="logs"]').click();const log=p.locator('[data-gaip-modal-id="learning-study-log"]');
 assert.equal(await log.evaluate(n=>Math.round(n.getBoundingClientRect().width)),1200);
 assert.deepEqual(await log.locator('.gaip-table__head th').allTextContents(),['操作时间','操作人 / 账号','IP','操作','课程','变更详情']);
 assert.equal(await log.locator('tbody tr').count(),10);assert.match(await log.locator('.gaip-table__total').textContent(),/13/);
 await log.locator('tbody tr').first().getByRole('button',{name:'展开全部'}).click();
 assert.equal(await log.locator('tbody td').first().evaluate(n=>getComputedStyle(n).verticalAlign),'top');
 await log.getByRole('searchbox').fill('不存在');await p.waitForTimeout(300);assert.match(await log.locator('tbody').textContent(),/暂无/);
 await log.getByRole('button',{name:'重置',exact:true}).click();await p.keyboard.press('Escape');await log.waitFor({state:'detached'});
 assert.equal(await p.evaluate(()=>document.querySelector('.lc-stats-results')===keptTable),true);
 assert.deepEqual(await p.evaluate(()=>__GAIP_TABLE__.get(keptTable).getState()),await p.evaluate(()=>keptState));
 assert.equal(await p.locator('[data-lc="logs"]').evaluate(n=>n===document.activeElement),true);
 await bar.getByRole('searchbox').fill('mock.lin');await p.waitForTimeout(300);assert.equal(await table.locator('tbody tr').count(),1);assert.match(await table.textContent(),/林晓/);
 assert.equal(await p.evaluate(()=>document.querySelector('.lc-stats-filter-slot')===keptBar),true);
 await table.getByRole('button',{name:'详情',exact:true}).click();const detail=p.locator('.lc-study-detail-modal');
 await p.waitForTimeout(120);
 assert.equal(await detail.locator('.gaip-native-trigger,.gaip-mc-text').count(),0,'filter controls must not receive a second modal adapter');
 const filterGeometry=await detail.locator('.lc-study-detail-filter').evaluate(n=>{
  const search=n.querySelector('input[type="search"]'),select=n.querySelector('[data-filter-key="status"] [role="combobox"]'),reset=n.querySelector('.gaip-filter-bar__actions button');
  return {searchHeight:search.getBoundingClientRect().height,selectHeight:select.getBoundingClientRect().height,resetTop:reset.getBoundingClientRect().top,searchTop:search.getBoundingClientRect().top,inputBackground:getComputedStyle(search).backgroundImage};
 });
 assert.equal(filterGeometry.searchHeight,40);assert.equal(filterGeometry.selectHeight,40);
 assert.equal(filterGeometry.resetTop,filterGeometry.searchTop,'reset stays aligned with inputs');
 assert.equal(filterGeometry.inputBackground,'none','only the filter search prefix draws the icon');
 assert.equal(await detail.locator('.gaip-table').count(),1);assert.equal(await detail.locator('.gaip-filter-bar').count(),1);
 assert.match(await detail.locator('.lc-study-summary').textContent(),/林晓.*登录账号.*mock.lin.*所属组织/);
 assert.equal(await detail.evaluate(n=>Math.round(n.getBoundingClientRect().width)),1280);
 const modalStyle=await detail.evaluate(n=>{const box=n.getBoundingClientRect(),surface=getComputedStyle(n.firstElementChild),close=getComputedStyle(n.querySelector('[data-close]'));return {category:n.dataset.gaipModalCategory,centerX:box.x+box.width/2,centerY:box.y+box.height/2,padding:surface.padding,radius:surface.borderRadius,closeWidth:close.width};});
 assert.deepEqual(modalStyle,{category:'information',centerX:800,centerY:500,padding:'24px',radius:'8px',closeWidth:'32px'});
 assert.equal(await detail.evaluate(n=>getComputedStyle(n,'::backdrop').backgroundColor),'rgba(0, 0, 0, 0.45)');
 assert.equal(await detail.locator('tbody td').first().evaluate(n=>getComputedStyle(n).verticalAlign),'top');
 await detail.locator('[data-filter-key="status"] [role="combobox"]').click();
 await p.getByRole('option',{name:'已完成',exact:true}).click();
 assert.equal(await detail.locator('tbody tr').evaluateAll(rs=>rs.every(r=>r.children[4].textContent==='已完成')),true);
 await detail.getByRole('searchbox').fill('不存在');await p.waitForTimeout(300);assert.match(await detail.locator('tbody').textContent(),/暂无/);
 await detail.getByRole('button',{name:'重置',exact:true}).click();
 assert.equal(await detail.locator('[data-filter-key="status"] [role="combobox"]').textContent(),'全部状态');
 assert.ok(await detail.locator('tbody .gaip-table__tag').count());
 await detail.locator('[data-filter-key="status"] [role="combobox"]').click();
 await p.getByRole('option',{name:'学习中',exact:true}).click();
 assert.ok(await detail.locator('tbody tr').count()>0);
 assert.equal(await detail.locator('tbody tr').evaluateAll(rs=>rs.every(r=>r.children[4].textContent==='学习中')),true);
 assert.equal(await detail.locator('tbody td').nth(5).evaluate(n=>getComputedStyle(n).textAlign),'right');
 await detail.getByRole('button',{name:'重置',exact:true}).click();
 if(process.env.STUDY_DETAIL_SCREENSHOT)await p.screenshot({path:process.env.STUDY_DETAIL_SCREENSHOT});
 await detail.locator('[data-close]').click();await detail.waitFor({state:'detached'});
 assert.equal(await table.getByRole('button',{name:'详情',exact:true}).evaluate(n=>n===document.activeElement),true);
 assert.equal(await bar.getByRole('searchbox').inputValue(),'mock.lin','detail close preserves parent filters');
 await table.getByRole('button',{name:'详情',exact:true}).click();await detail.waitFor();await p.keyboard.press('Escape');await detail.waitFor({state:'detached'});
 assert.equal(await p.evaluate(()=>JSON.stringify(__GAIP_LEARNING_DATA__.state())===beforeRead),true,'read interactions do not mutate learning data');
 await p.locator('[data-lc="export"]').click();assert.equal(await p.evaluate(()=>window.exports.at(-1).length),2,'export honors filter, not visible pagination');
 await p.locator('[data-lc="stats-tab"][data-id="courses"]').click();
 assert.equal(await table.locator('.gaip-table__head th').count(),12);
 assert.equal(await bar.getByRole('searchbox').inputValue(),'');
 await p.evaluate(()=>__GAIP_FILTER_BAR__.get(document.querySelector('.lc-stats-filter-slot')).setValue({required:'false',status:'published',group:'香港业务',org:'1:department-2'}));
 assert.equal(await table.locator('tbody tr').evaluateAll(rows=>rows.every(r=>r.children[3].textContent==='否')),true);
 await table.getByRole('button',{name:'详情',exact:true}).first().click();
 assert.equal(await detail.locator('.gaip-table__head th').count(),8);
 await p.waitForTimeout(120);
 assert.equal(await detail.locator('.gaip-native-trigger,.gaip-mc-text').count(),0,'course filters are also owned by the filter component');
 assert.equal(await detail.locator('[data-filter-key="status"] [role="combobox"]').count(),1);
 if(chromeMajor<=119){
  // Chrome 119 has a renderer crash when any manual popover inside a native
  // top-layer dialog closes. The same editable-tree open/search/Escape path is
  // verified above on the main page; newer engines cover the nested path here.
  console.log('NOTE Chrome '+chromeMajor+' skips the nested organization popover; newer engines run the dialog-level interaction.');
 }else{
  await detail.locator('[data-filter-key="org"] [role="combobox"]').click();
  await detail.locator('[data-filter-key="org"] [role="combobox"]').fill('华东');
  assert.equal(await detail.locator('.gaip-mc-text').count(),0,'organization popup search is not re-enhanced');
  await p.keyboard.press('Escape');
  assert.equal(await detail.isVisible(),true,'Escape first closes organization popup, not the dialog');
 }
 assert.ok(await detail.locator('.lc-study-summary h3').textContent());
 assert.match(await detail.locator('.lc-study-summary dl').textContent(),/课程状态.*学习群组.*必修.*精选/);
 assert.equal(await detail.locator('tbody tr').evaluateAll(rows=>rows.every(r=>r.children[1].textContent.startsWith('Glory品牌顾问/测试部门/测试1部'))),true);
 if(process.env.STUDY_COURSE_DETAIL_SCREENSHOT)await p.screenshot({path:process.env.STUDY_COURSE_DETAIL_SCREENSHOT});
 for(const width of [1024,692,480]){
   await p.setViewportSize({width,height:800});await p.waitForTimeout(100);
   assert.equal(await detail.evaluate(n=>n.scrollWidth>n.clientWidth+1),false,'detail has no outer horizontal overflow');
   const bounds=await detail.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+1);
   assert.ok(Math.abs(bounds.x+bounds.width/2-width/2)<1,'detail modal remains horizontally centered');
   assert.ok(Math.abs(bounds.y+bounds.height/2-400)<1,'detail modal remains vertically centered');
   assert.ok(bounds.height<=776,'modal stays within shared safe height');
   assert.equal(await detail.locator('[data-close]').isVisible(),true);
 }
 await p.keyboard.press('Escape');await detail.waitFor({state:'detached'});
 for(const width of [1920,1440,1024,692]){
  await p.setViewportSize({width,height:1000});await p.waitForTimeout(150);
  const box=await p.locator('.lc-stats').evaluate(n=>({overflow:n.scrollWidth>n.clientWidth+1,pager:n.querySelector('.gaip-table__pagination').getBoundingClientRect().bottom,bottom:n.getBoundingClientRect().bottom}));
  assert.equal(box.overflow,false);assert.ok(box.pager<=box.bottom-20,'pager stays inside main at '+width+'px: '+JSON.stringify(box));
  const layout=await tabs.evaluate(n=>{const t=n.getBoundingClientRect(),h=n.parentElement.getBoundingClientRect(),a=n.parentElement.querySelector('.lc-manage-header-actions').getBoundingClientRect();return {center:(t.left+t.right-h.left-h.right)/2,overlap:t.left<a.right&&t.right>a.left&&t.top<a.bottom&&t.bottom>a.top};});
  assert.ok(Math.abs(layout.center)<2,'tabs centered in toolbar');assert.equal(layout.overlap,false,'tabs do not overlap actions');
  await org.click();const popupBox=await orgPopup.boundingBox();assert.ok(popupBox.x>=0&&popupBox.x+popupBox.width<=width,'organization popup stays inside viewport');await p.keyboard.press('Escape');
 }
 await p.setViewportSize({width:1600,height:1000});await p.waitForTimeout(150);
 if(process.env.STUDY_SCREENSHOT){await org.click();await org.fill('华东');await p.screenshot({path:process.env.STUDY_SCREENSHOT});await p.keyboard.press('Escape');}
 await p.evaluate(()=>{__GAIP_LEARNING_APP__.destroy();__GAIP_LEARNING_DATA__.setUser('u4');__GAIP_LEARNING_APP__.openStudyLog();});
 await log.waitFor();assert.match(await log.locator('tbody').textContent(),/暂无/,'study manager cannot see other operators logs');
 await log.locator('[data-log-close]').click();await log.waitFor({state:'detached'});
 await p.evaluate(()=>__GAIP_LEARNING_DATA__.setUser('u2'));await p.evaluate(()=>__GAIP_LEARNING_APP__.openStudyLog());assert.equal(await log.count(),0,'learner cannot open study log');
 assert.equal(await p.locator('.gaip-table-size-popup,.gaip-filter-select-popup').count(),0);
 // Both standalone catalog entries invoke this same modal without mounting a page.
 await p.evaluate(()=>__GAIP_LEARNING_DATA__.setUser('u1'));
 for(const kind of ['users','courses']){
  await p.evaluate(kind=>__GAIP_LEARNING_APP__.openStudyDetail(kind),kind);await detail.waitFor();
  assert.equal(await detail.getAttribute('data-gaip-modal-category'),'information');
  assert.ok(await detail.locator('tbody tr').count());
  await p.keyboard.press('Escape');await detail.waitFor({state:'detached'});
 }
 assert.deepEqual(errors,[]);console.log('PASS study main/detail/log: shared UI, fields, filters, page retention, scope, export, empty state, 1920–692 widths and cleanup');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
