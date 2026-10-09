// Actual registered sources in isolated documents; not a whole-channel visual acceptance.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const ctx={window:{}};vm.createContext(ctx);
for(const f of ['shared/scripts/modal-registry.js','components/弹窗源登记.js','components/弹窗自动索引.generated.js'])vm.runInContext(read(f),ctx);
const ids=['operation-log','config-organization-log','learning-course-log','learning-study-log'];
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const id of ids){
  const entry=ctx.window.__GAIP_MODAL_REGISTRY__.get(id),p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));await p.setContent('<button id="origin">来源入口</button>');
  await p.evaluate(()=>{window.__GAIP_CONFIG_DIALOG_PREVIEW__=true;});
  const styles=[...new Set([...(entry.styles||[]).map(x=>x.split('?')[0]),'shared/styles/global-font.css','components/modal/global-modal.css','components/modal/global-modal-position.css','components/modal/global-modal-mask.css','components/table/global-table.css'])];
  for(const f of styles)await p.addStyleTag({content:read(f).replace(/url\(["']?([^"')]+)["']?\)/g,(all,url)=>{
   if(/^(data:|https?:|#)/.test(url))return all;
   const file=path.resolve(root,path.dirname(f),url.split('?')[0]);if(!fs.existsSync(file))return all;
   const mime={'.ttf':'font/ttf','.svg':'image/svg+xml','.png':'image/png'}[path.extname(file)];
   return mime?'url("data:'+mime+';base64,'+fs.readFileSync(file).toString('base64')+'")':all;
  })});
  const scripts=[...new Set(['components/modal/global-modal.js','components/modal/global-modal-position.js',...(entry.scripts||[]).map(x=>x.split('?')[0])])];
  for(const f of scripts)await p.evaluate(({source,url})=>{Object.defineProperty(document,'currentScript',{configurable:true,value:{src:url}});window.eval(source);},{source:read(f),url:'file://'+path.join(root,f)});
  if(id==='learning-study-log')await p.evaluate(()=>{for(let i=0;i<25;i++)window.__GAIP_LEARNING_DATA__.log('导出学情',null,'学情回归记录 '+i);});
  async function open(){await p.locator('#origin').focus();await p.evaluate(invoke=>{const keys=invoke.path.split('.');const method=keys.pop();const owner=keys.reduce((o,k)=>o[k],window);owner[method](...(invoke.args||[]));},entry.invoke);await p.locator('dialog.gaip-info-modal[open]').waitFor();}
  for(const width of [1440,640,390]){
   await p.setViewportSize({width,height:1000});await open();const d=p.locator('dialog.gaip-info-modal[open]');
   const geometry=await d.evaluate(el=>{
    const box=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    const title=el.querySelector('.gaip-modal__title'),surface=el.querySelector('.gaip-info__surface')||el,body=el.querySelector('.gaip-info__body'),close=el.querySelector('.gaip-modal__close');
    const style=getComputedStyle(title),head=el.querySelector('th'),scroll=el.querySelector('.gaip-table__scroll');
    return {dialog:box(el),surface:box(surface),body:box(body),title:box(title),close:box(close),font:style.fontSize,weight:style.fontWeight,padding:getComputedStyle(surface).paddingLeft,header:getComputedStyle(head).backgroundColor,scroll:box(scroll),page:box(el.querySelector('.gaip-table__pagination')),closeGlyph:getComputedStyle(close,'::before').maskImage||getComputedStyle(close,'::before').webkitMaskImage};
   });
   assert.equal(Math.round(geometry.dialog.width),width>640?1200:width-24,id+' width');
   assert.equal(geometry.font,'18px',id+' title size');assert.equal(geometry.weight,'700',id+' title weight');
   assert.equal(geometry.padding,width>640?'24px':'16px',id+' inset');
   assert.equal(Math.round(geometry.close.width),32,id+' close target');
   assert.ok(geometry.closeGlyph.includes('data:image/svg'),id+' shared close glyph');
   assert.deepEqual(await d.locator('.gaip-modal__close').evaluate(el=>{const s=getComputedStyle(el,'::before');return [s.content,s.width,s.height,s.backgroundColor];}),['""','16px','16px','rgba(47, 54, 64, 0.68)'],id+' visible close glyph');
   assert.ok(geometry.body.x>=geometry.dialog.x+15&&geometry.body.right<=geometry.dialog.right-15,id+' body inset');
   assert.ok(geometry.page.bottom<=geometry.dialog.bottom-15,id+' pagination visible');
   assert.ok(geometry.scroll.height>80,id+' useful scroll viewport');
   assert.ok(geometry.dialog.y>=0&&geometry.dialog.bottom<=1000,id+' vertical bounds');
   assert.equal(geometry.header,'rgb(248, 245, 243)',id+' shared table header');
   const contract=await d.evaluate(el=>{
    const host=el.querySelector('.gaip-table'),band=host.querySelector('.gaip-table__head-band'),sc=host.querySelector('.gaip-table__scroll'),pager=host.querySelector('.gaip-table__pagination');
    return {outside:!sc.contains(band)&&!sc.contains(pager),gap:sc.getBoundingClientRect().top-band.getBoundingClientRect().bottom,bandWidth:band.getBoundingClientRect().width,hostWidth:host.clientWidth,flex:getComputedStyle(sc).flexGrow,corner:getComputedStyle(band).backgroundColor};
   });
   assert.equal(contract.outside,true,id+' visual header and pager outside scroll');
   assert.ok(Math.abs(contract.gap)<1,id+' scrollbar starts below header');
   assert.ok(Math.abs(contract.bandWidth-contract.hostWidth)<2,id+' header includes scrollbar corner');
   assert.equal(contract.corner,'rgb(248, 245, 243)',id+' header corner color');
   assert.equal(contract.flex,'0',id+' short rows never forced to fill body');
   const before=await d.locator('.gaip-table__head-band').boundingBox();
   await d.locator('.gaip-table__scroll').evaluate(el=>{el.scrollTop=100;el.scrollLeft=180;});
   await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   assert.deepEqual(await d.locator('.gaip-table__head-band').boundingBox(),before,id+' header fixed during vertical scroll');
   const alignment=await d.evaluate(el=>{
    const heads=[...el.querySelectorAll('.gaip-table__head th')],cells=[...el.querySelectorAll('.gaip-table__scroll tbody tr:first-child td')];
    if(cells.length!==heads.length)return [];
    return heads.map((h,i)=>Math.abs(h.getBoundingClientRect().left-cells[i].getBoundingClientRect().left));
   });
   assert.ok(alignment.every(n=>n<1),id+' horizontal header/data alignment');
   await d.locator('.gaip-table__scroll').evaluate(el=>{el.scrollTop=0;el.scrollLeft=0;});
   if(width===1440)await d.screenshot({path:'/tmp/'+id+'-information.png'});
   await d.locator('.gaip-modal__close').click();assert.equal(await p.locator('dialog[open]').count(),0);
   assert.equal(await p.locator('dialog.gaip-info-modal:visible').count(),0,id+' closed host hidden');
  }
  await p.setViewportSize({width:1440,height:1000});await open();
  const active=p.locator('dialog.gaip-info-modal[open]');
  if(id==='operation-log'){
   await active.locator('[data-table-action="next"]').click();assert.equal(await active.locator('[aria-current="page"]').textContent(),'2');
   await active.locator('input[name="query"]').fill('__no_match__');
   await active.locator('.gaip-table__empty').waitFor();assert.equal(await active.locator('[data-log-export]').isDisabled(),true);
   await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   assert.ok(await active.evaluate(el=>el.querySelector('.gaip-table').getBoundingClientRect().bottom<el.querySelector('.gaip-info__body').getBoundingClientRect().bottom-40),'empty table contracts');
   await active.getByRole('button',{name:'重置',exact:true}).click();await active.locator('.gaip-log-person').first().waitFor();
   assert.equal(await active.locator('[aria-current="page"]').textContent(),'1');
   assert.equal(await active.locator('[data-log-export]').isDisabled(),false);
  }
  if(id==='config-organization-log'){
   const first=await active.locator('tbody tr').first().textContent();
   await active.locator('[data-table-action="next"]').click();assert.equal(await active.locator('[aria-current="page"]').textContent(),'2');
   assert.notEqual(await active.locator('tbody tr').first().textContent(),first);
   await active.locator('[data-table-action="previous"]').click();assert.equal(await active.locator('tbody tr').first().textContent(),first);
  }
  if(id==='learning-study-log'){
   assert.equal(await active.locator('tbody tr').count(),10);
   await active.getByRole('button',{name:'下一页',exact:true}).click();
   await active.locator('input[type="search"]').fill('__no_match__');
   await active.locator('.gaip-table__empty').waitFor();
   await active.getByRole('button',{name:'重置',exact:true}).click();
   await active.locator('tbody tr').filter({hasText:'导出学情'}).first().waitFor();
   assert.equal(await active.locator('tbody tr').count(),10);
  }
  const tableTotal=await active.evaluate(el=>window.__GAIP_TABLE__.get(el.querySelector('.gaip-table')).getState().total);
  await active.getByRole('combobox',{name:'每页条数'}).click();
  await active.getByRole('option',{name:'20 条/页',exact:true}).click();
  assert.equal(await active.locator('tbody tr').count(),Math.max(1,Math.min(20,tableTotal)),id+' shared page-size selection');
  await active.getByRole('combobox',{name:'每页条数'}).click();
  await p.keyboard.press('Escape');
  assert.equal(await active.locator('.gaip-table-size-popup').count(),0,id+' picker Escape');
  assert.equal(await p.locator('dialog[open]').count(),1,id+' picker Escape preserves dialog');
  const populatedHeight=(await active.boundingBox()).height;
  await active.evaluate(el=>window.__GAIP_TABLE__.get(el.querySelector('.gaip-table')).setRows([],true));
  await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  assert.ok(await active.evaluate((el,id)=>{
   const table=el.querySelector('.gaip-table'),body=el.querySelector('.gaip-info__body'),sc=el.querySelector('.gaip-table__scroll'),pager=el.querySelector('.gaip-table__pagination');
   const gap=body.getBoundingClientRect().bottom-table.getBoundingClientRect().bottom;
   return (id==='learning-study-log'?Math.abs(gap)<2:gap>40)&&Math.abs(pager.getBoundingClientRect().top-sc.getBoundingClientRect().bottom)<1;
  },id),id+' empty rows shrink naturally; pager follows rows');
  if(id==='learning-study-log'){
   assert.ok((await active.boundingBox()).height<populatedHeight-40,'46 empty shell contracts too');
   await active.evaluate(el=>window.__GAIP_TABLE__.get(el.querySelector('.gaip-table')).setRows(Array.from({length:60},(_,i)=>({at:'2026-09-29',action:'导出学情',operator:'测试',account:'demo',course:'长课程名称'.repeat(20),details:'记录 '+i})),true));
   await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const scroll=active.locator('.gaip-table__scroll'),header=await active.locator('.gaip-table__head-band').boundingBox();
   assert.ok(await scroll.evaluate(el=>el.scrollHeight>el.clientHeight),'46 long rows create scrolling');
   await scroll.evaluate(el=>el.scrollTop=el.scrollHeight);
   assert.ok(await scroll.evaluate(el=>el.scrollTop>0&&Math.abs(el.scrollHeight-el.clientHeight-el.scrollTop)<2),'46 reaches bottom');
   assert.deepEqual(await active.locator('.gaip-table__head-band').boundingBox(),header,'46 header remains fixed');
   assert.ok((await active.boundingBox()).height<=801,'46 remains capped');
  }
  await active.getByRole('combobox',{name:'每页条数'}).click();
  await active.locator('.gaip-modal__close').click();
  assert.equal(await p.locator('.gaip-table-size-popup').count(),0,id+' close destroys page-size portal');
  await open();await p.keyboard.press('Escape');assert.equal(await p.locator('dialog[open]').count(),0);
  assert.deepEqual(errors,[],id+' runtime errors');console.log('PASS '+id+': actual-source frame/table geometry, desktop/narrow, close/reopen/Escape');await p.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
