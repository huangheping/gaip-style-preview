// Actual source components in isolated documents. No business-page navigation,
// production requests, preview copies, or writes to the read-only web baseline.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const runtime=read('web/umi.0b0663b5.js'),boot=runtime.indexOf('var __webpack_exports__={};');
assert.ok(boot>0);
const bundles=fs.readdirSync(path.join(root,'web')).filter(f=>f.endsWith('.async.js')).map(f=>read('web/'+f)).join('\n');
function css(f){return read(f).replace(/url\(["']?([^"')]+)["']?\)/g,(all,url)=>{
 if(/^(data:|https?:|#)/.test(url))return all;
 const file=path.resolve(root,path.dirname(f),url.split('?')[0]);if(!fs.existsSync(file))return all;
 const mime={'.ttf':'font/ttf','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'}[path.extname(file)];
 return mime?'url("data:'+mime+';base64,'+fs.readFileSync(file).toString('base64')+'")':all;
});}
const specs=[['06','.gaip-file-dialog','attachment'],['27','.detailModal___EYATu','document'],['28','.gaip-signup-record-dialog','table'],['29','.productModal___bp0hy','product'],['30','.expertModal___Umr7b','experts'],['31','.modal___l2z3p','result']];
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const [id,selector,variant] of specs.filter(s=>!process.env.INFORMATION_IDS||process.env.INFORMATION_IDS.split(',').includes(s[0]))){
  const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));await p.setContent('<div id="root"></div>');
  // Font/source assets can use their ordinary file names without serving a page.
  await p.route('**/*',route=>route.abort());
  for(const f of ['web/umi.9b3d91aa.css', 'shared/styles/global-font.css'].filter(f=>fs.existsSync(path.join(root,f))))await p.addStyleTag({content:css(f)});
  const sourceStyles={
   '06':['channels/proposal-center/proposal-center.css'],
   '27':['web/978.e5ccf054.chunk.css'],
   '28':['channels/activity/page.css'],
   '29':['channels/product/page.css'],
   '30':['web/106.89b4424f.chunk.css','channels/product/page.css'],
   '31':['channels/induction/page.css']
  };
  // Match the baseline main CSS name without hardcoding a stale hash.
  const umiCss=fs.readdirSync(path.join(root,'web')).find(f=>/^umi\..*\.css$/.test(f));
  await p.addStyleTag({content:css('web/'+umiCss)});
  for(const f of [...sourceStyles[id],'shared/styles/global-font.css','components/modal/global-modal.css','components/modal/global-modal-position.css','components/modal/global-modal-mask.css','components/table/global-table.css'])await p.addStyleTag({content:css(f)});
  await p.addScriptTag({content:read('shared/scripts/html-view.js')});
  if(id!=='06'){
   await p.addScriptTag({content:runtime.slice(0,boot)+'window.__sourceRequire=__webpack_require__;})();'});
   await p.addScriptTag({content:bundles});
   await p.evaluate(()=>{
    const req=window.__sourceRequire;
    window.fixture={rows:[],detail:{proposalContent:'## 来源方案\n\n'+('正文内容。\n\n'.repeat(80))},loading:false};
    window.closeCount=0;window.requestCount=0;window.navigation=[];
    req.m[92016]=module=>{module.exports={history:{push:p=>window.navigation.push(p)},useModel:()=>({dictionaryData:{}}),useRequest:(service,options={})=>({
     loading:window.fixture.loading,data:window.fixture.detail,
     run:(...args)=>{window.requestCount++;if(window.fixture.reject)return Promise.reject(new Error('fixture failure'));options.onSuccess?.(window.fixture.rows);return Promise.resolve(window.fixture.rows);}
    })};};
    const register=window.__GAIP_HTML_VIEW__.register;
    window.__sourceViews={};window.__GAIP_HTML_VIEW__.register=views=>{Object.assign(window.__sourceViews,views);register(views);};
   });
   for(const f of ['channels/activity/page.js','channels/product/page.js','channels/induction/page.js'])await p.evaluate(source=>{
    const chunks=self.webpackChunk;self.webpackChunk={push:entry=>Object.assign(window.__sourceRequire.m,entry[1])};
    try{window.eval(source)}finally{self.webpackChunk=chunks}
   },read(f));
   await p.evaluate(()=>{
    const req=window.__sourceRequire;
    for(const [id,from,to] of [[38957,'return ut','return {Records:Oa,Table:SignupRecordTable}'],[86588,'return ma','return {Detail:ra}'],[89290,'return Ne','return {Complete:Ce}']]){
     const code=req.m[id].toString();if(!code.includes(from))throw new Error('Source harness needs update '+id);
     req.m[id]=window.eval('('+code.replace(from,to)+')');
    }
    window.React=req(67294);window.ReactDOM=req(73935);
    window.sources={record:req(38957).default.Records,product:req(86588).default.Detail,complete:req(89290).default.Complete,document:req(43150).Z};
    function find(node){if(node.component==='expertModalType')return node;for(const child of node.children||[]){const found=find(child);if(found)return found;}}
    const expert=Object.values(window.__sourceViews).map(find).find(Boolean);
    if(!expert)throw new Error('Missing actual expert template');
    window.__GAIP_HTML_VIEW__.register({'test-actual-expert':expert});
    window.renderSource=function(id,options={}){
     const close=()=>window.closeCount++,R=window.React;
     let content;
     if(id==='27')content=R.createElement(window.sources.document,{open:true,proposalId:'fixture',onClose:close});
     if(id==='28')content=R.createElement(window.sources.record,{open:true,record:options.record,setOpen:close});
     if(id==='29')content=R.createElement(window.sources.product,{open:true,onClose:close,loading:options.loading,productDetail:options.empty?null:{productNameCn:'产品名称',productNameEn:'Product',productCode:'TEST',productType:'INSURANCE',productShowDetail:'<h2>产品特点</h2>'+('<p>产品正文与说明。</p>'.repeat(80)),...options.detail}});
     if(id==='30')content=window.__GAIP_HTML_VIEW__.render('test-actual-expert',req(85893),{
      expertModalType:()=>req(17788).Z,closeBtnType:()=>req(97937).Z,closeBtnProps:()=>({onClick:close}),
      componentType3:()=>req(99803).Z,componentProps2:()=>({activeChapter:4,activeSection:1,sectionData:req(23856).Lg[4].sections[1],hideTitle:true}),
      expertModalProps:()=>({open:true,title:'业务线对接专家',footer:null,centered:true,closeIcon:false,classNames:{body:'gaip-product-expert-body'}})
     });
     if(id==='31')content=R.createElement(window.sources.complete,{open:true,onClose:close});
     window.ReactDOM.render(content,document.querySelector('#root'));
    };
   });
  }
  for(const f of ['components/modal/global-modal.js','components/modal/global-modal-position.js','components/table/global-table.js'])await p.addScriptTag({content:read(f)});
  if(id==='06'){
   await p.locator('#root').evaluate(el=>{el.dataset.gaipRegion='channel-page';el.dataset.gaipPage='proposal'});
   await p.addScriptTag({content:read('channels/proposal-center/proposal-center.js')});
  }
  async function mount(options={}){
   if(id==='06'){
    await p.locator('[data-tab="records"]').click();
    await p.locator('[data-action="file"]').first().click();
   }
   else await p.evaluate(({id,options})=>window.renderSource(id,options),{id,options});
   await p.locator(selector+'.gaip-info-modal').waitFor();
   await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const images=await p.locator(selector+' img').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('src')));
   for(const src of new Set(images)){
    if(!src||/^(data:|https?:)/.test(src))continue;
    const rel=src.replace(/^\.\//,''),file=[path.join(root,rel),path.join(root,'web',rel)].find(f=>fs.existsSync(f));
    if(!file)continue;
    const type={'.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'}[path.extname(file)];
    if(type)await p.locator(selector+' img').evaluateAll((nodes,{src,data})=>nodes.filter(n=>n.getAttribute('src')===src).forEach(n=>n.src=data),{src,data:'data:'+type+';base64,'+fs.readFileSync(file).toString('base64')});
   }
  }
  await p.evaluate(()=>{if(window.fixture)window.fixture.rows=Array.from({length:50},(_,i)=>({createdDt:'2026-09-29 12:00',activityName:'报名活动 '+i,name:''}));});
  await mount();
  for(const width of [1440,640,390]){
   await p.setViewportSize({width,height:1000});await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const g=await p.locator(selector).evaluate(el=>{
    const box=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    const surface=el.querySelector('.gaip-info__surface')||el,title=el.querySelector('.gaip-modal__title'),close=el.querySelector('.gaip-modal__close'),body=el.querySelector('.gaip-info__body');
    return {dialog:box(el),body:box(body),padding:getComputedStyle(surface).paddingLeft,title:title&&[getComputedStyle(title).fontSize,getComputedStyle(title).fontWeight],close:box(close),variant:el.dataset.gaipInfoVariant};
   });
   assert.equal(g.variant,variant,id+' variant');assert.ok(g.dialog.x>=0&&g.dialog.right<=width+1,id+' horizontal bounds '+JSON.stringify(g));
   const preferred={'06':1080,'27':1200,'28':800,'29':1200,'30':1080,'31':608}[id];
   assert.equal(Math.round(g.dialog.width),width<=640?width-24:Math.min(preferred,width-48),id+' shared width tier');
   assert.ok(g.dialog.y>=0&&g.dialog.bottom<=1001,id+' vertical bounds '+JSON.stringify(g));
   assert.equal(g.padding,width>640?'24px':'16px',id+' shared padding');
   if(id!=='31')assert.deepEqual(g.title,['18px','700'],id+' shared title');
   assert.equal(g.close.width,32,id+' shared close');assert.ok(g.body.height>80,id+' usable content');
   assert.deepEqual(await p.locator(selector+' .gaip-modal__close').evaluate(el=>{const s=getComputedStyle(el,'::before');return [s.display,s.width,s.height]}),['block','16px','16px'],id+' visible shared glyph');
   assert.ok(g.close.right>g.dialog.right-48,id+' close aligned to right edge');
   assert.ok(await p.locator(selector+' .gaip-modal__close').evaluate(el=>{
    const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return hit===el||el.contains(hit);
   }),id+' close hit target is not covered');
   assert.ok(g.body.bottom<=g.dialog.bottom+1,id+' content stays inside');
   if(id!=='31')assert.equal(Math.round(await p.locator(selector).evaluate(el=>el.querySelector('.gaip-info__body').getBoundingClientRect().top-el.querySelector('.gaip-info__header').getBoundingClientRect().bottom)),20,id+' one header/body gap');
   if(width===1440)await p.locator(selector).screenshot({path:'/tmp/information-detail-'+id+'.png'});
  }
  if(id==='28'){
   await p.setViewportSize({width:1440,height:1000});
   const heights=[];
   for(const count of [1,50,200,1]){
    await p.evaluate(count=>{window.ReactDOM.unmountComponentAtNode(document.querySelector('#root'));window.fixture.rows=Array.from({length:count},(_,i)=>({createdDt:'2026-09-29 12:00',activityName:'全球资产配置与财富传承活动'.repeat(i===0?10:1),name:''}));},count);
    await mount();await p.waitForFunction(({selector,count})=>document.querySelectorAll(selector+' .gaip-table__scroll tbody tr').length===count,{selector,count});
    await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const geometry=await p.locator(selector).evaluate(el=>{const s=el.querySelector('.gaip-table__scroll');return {height:el.getBoundingClientRect().height,client:s.clientHeight,scroll:s.scrollHeight};});
    heights.push(geometry.height);
    assert.equal(await p.locator(selector+' .gaip-table__pagination').count(),0);
    assert.equal(await p.locator(selector+' tbody tr:first-child td').nth(1).textContent(),'全球资产配置与财富传承活动'.repeat(10));
    if(count>1){assert.ok(geometry.scroll>geometry.client,'28 many rows have a scroll range');await p.locator(selector+' .gaip-table__scroll').evaluate(el=>el.scrollTop=el.scrollHeight);assert.ok(await p.locator(selector+' .gaip-table__scroll').evaluate(el=>el.scrollTop>0),'28 scroll reaches later rows');}
   }
   assert.ok(heights[0]<heights[1]-50,'28 few rows must not retain the large shell');
   assert.ok(Math.abs(heights[1]-heights[2])<2,'28 row growth is capped');
   assert.ok(Math.abs(heights[0]-heights[3])<2,'28 shrinks again');
   await p.evaluate(()=>{window.ReactDOM.unmountComponentAtNode(document.querySelector('#root'));window.fixture.rows=Array.from({length:50},(_,i)=>({activityName:'活动 '+i}));});await mount();
   assert.equal(await p.locator(selector+' .gaip-table__scroll tbody tr').count(),50,'no pagination added');
   assert.equal(await p.locator(selector+' .gaip-table__head th').count(),3,'three original columns');
   const head=await p.locator(selector+' .gaip-table__head-band').boundingBox();
   await p.locator(selector+' .gaip-table__scroll').evaluate(el=>{el.scrollTop=200;el.scrollLeft=100});
   assert.deepEqual(await p.locator(selector+' .gaip-table__head-band').boundingBox(),head,'fixed table header');
   for(const reject of [false,true]){
    await p.evaluate(reject=>{window.ReactDOM.unmountComponentAtNode(document.querySelector('#root'));window.fixture.rows=[];window.fixture.reject=reject},reject);
    await mount();await p.locator(selector+(reject?' [role="alert"]':' .gaip-table__empty')).waitFor();
   }
   await p.evaluate(()=>{window.fixture.reject=false;window.fixture.rows=[{activityName:'重试成功'}]});
   await p.getByRole('button',{name:'重新加载',exact:true}).click();await p.getByText('重试成功',{exact:true}).waitFor();
  }
  if(id==='30'){
   const body=p.locator(selector+' .gaip-info__body'),header=p.locator(selector+' .gaip-info__header');
   const before=await header.boundingBox();
   assert.ok(await body.evaluate(el=>el.scrollHeight>el.clientHeight),'30 actual expert content overflows its bounded body');
   await body.evaluate(el=>el.scrollTop=el.scrollHeight);
   assert.ok(await body.evaluate(el=>el.scrollTop>0 && Math.abs(el.scrollHeight-el.clientHeight-el.scrollTop)<2),'30 can reach the bottom');
   assert.deepEqual(await header.boundingBox(),before,'30 title remains fixed while body scrolls');
  }
  if(id==='29'){
   for(const options of [{loading:true},{empty:true},{}]){await mount(options);assert.equal(await p.locator(selector+' .gaip-modal__close').count(),1,'close persists in loading/empty/content');}
   await p.getByRole('button',{name:'产品附件',exact:true}).click();await p.locator(selector+' .gaipAttachmentTab').waitFor();
   await p.getByRole('button',{name:'产品特点',exact:true}).click();await p.locator(selector+' .body___RjGkG').getByText('产品正文与说明。').first().waitFor();
  }
  if(id!=='06'){
   await p.locator(selector+' .gaip-modal__close').click();assert.equal(await p.evaluate(()=>window.closeCount),1,id+' original close callback');
   if(id==='31'){await p.getByRole('button',{name:'创建客户'}).click();assert.deepEqual(await p.evaluate(()=>window.navigation),['/customer']);}
   await p.evaluate(()=>window.ReactDOM.unmountComponentAtNode(document.querySelector('#root')));assert.equal(await p.locator(selector).count(),0,id+' unmount');
   await mount();assert.equal(await p.locator(selector+' .gaip-modal__close').count(),1,id+' reopen single adapter');
  }else{
   const versions=p.locator(selector+' [data-file-version-id]');
   if(await versions.count()>1){await versions.nth(1).click();assert.equal(await p.locator(selector+' .gaip-modal__close').count(),1,'06 version rerender adopts once');}
   await p.locator(selector+' [data-file-close]').click();assert.equal(await p.locator(selector).isVisible(),false,'06 close hides overlay');
   await mount();assert.equal(await p.locator(selector+' .gaip-modal__close').count(),1,'06 actual source reopen');
  }
  assert.deepEqual(errors,[],id+' runtime errors');console.log('PASS '+id+': actual-source isolated browser geometry/close/lifecycle at 1440,640,390');await p.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
