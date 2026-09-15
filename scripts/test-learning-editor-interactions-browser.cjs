// Real browser regression for nested scrolling, card pointer drag and lesson deletion.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.setContent('<section id="page"><header class="gaip-learning-header"><button data-learning-action="学情管理">学情管理</button><button data-learning-action="课程管理">课程管理</button></header></section>');
 for(const f of ['shared/styles/global-font.css','shared/styles/global-modal.css','shared/styles/global-modal-position.css','shared/styles/global-multi-select.css','shared/styles/global-filter-bar.css','shared/styles/global-table.css','features/learning-center/learning-center.css','features/learning-center/learning-v11.css','shared/styles/global-page-form.css'])await p.addStyleTag({content:read(f)});
 for(const f of ['shared/scripts/global-modal.js','shared/scripts/global-multi-select.js','shared/scripts/global-filter-bar.js','shared/scripts/global-table.js','features/learning-center/learning-data.js','features/learning-center/learning-app.js'])await p.evaluate(({s,url})=>{Object.defineProperty(document,'currentScript',{configurable:true,value:{src:url}});window.eval(s);},{s:read(f),url:'file://'+path.join(root,f)});
 await p.evaluate(()=>{const D=window.__GAIP_LEARNING_DATA__;D.state().courses=[D.course('c1')];window.__GAIP_LEARNING_APP__.mount(document.querySelector('#page'));});
 await p.locator('[data-learning-action="课程管理"]').click();await p.locator('[data-lc="edit"]').click();
 // Bound the actual scroll owner as in the SPA; earlier tests only had document scrolling.
 await p.addStyleTag({content:'.lc-editor{height:760px;flex:none}'});
 const ids=await p.locator('[data-edit-lesson]').evaluateAll(ns=>ns.map(n=>n.dataset.editLesson));
 const card=id=>p.locator('[data-edit-lesson="'+id+'"]');
 const scroll=()=>p.locator('.lc-editor').evaluate(n=>n.scrollTop);
 const persisted=()=>p.evaluate(()=>window.__GAIP_LEARNING_DATA__.course('c1').lessons.map(l=>l.id));
 const order=()=>p.locator('.lc-edit-lessons > [data-edit-lesson]').evaluateAll(ns=>ns.map(n=>n.dataset.editLesson));
 async function position(id,offset=70){await card(id).evaluate((n,off)=>{const e=n.closest('.lc-editor');e.scrollTop+=n.getBoundingClientRect().top-e.getBoundingClientRect().top-off;},offset);await p.evaluate(()=>window.scrollTo(0,0));}
 await position(ids[5]);
 await card(ids[5]).locator('[data-lc="save-lesson"]').scrollIntoViewIfNeeded();
 const before=await scroll();assert.ok(before>500);await p.locator('.lc-editor').evaluate(n=>n.dataset.testIdentity='retained');
 await card(ids[5]).locator('[data-lc="save-lesson"]').click();assert.ok(Math.abs(await scroll()-before)<=1,'save must retain nested scroll');
 assert.equal(await p.locator('.lc-editor').getAttribute('data-test-identity'),'retained','do not replace the scroll owner');
 assert.equal(await p.evaluate(()=>document.activeElement.dataset.lc),'save-lesson','save restores the triggering button focus');
 await card(ids[5]).locator('[data-upload="handout"]').setInputFiles({name:'滚动测试.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 mock')});assert.ok(Math.abs(await scroll()-before)<=1,'upload must retain scroll');
 await card(ids[5]).locator('[data-lc="remove-handout"]').click();assert.ok(Math.abs(await scroll()-before)<=1,'remove handout must retain scroll');
 await position(ids[5]);const top=await card(ids[5]).evaluate(n=>n.getBoundingClientRect().top);
 await card(ids[5]).locator('[data-lc="move-down"]').click();assert.ok(Math.abs(await card(ids[5]).evaluate(n=>n.getBoundingClientRect().top)-top)<=1,'moving a card retains its viewport anchor');
 await card(ids[5]).locator('[data-lc="move-up"]').click();assert.deepEqual(await order(),ids);
 // Start on card 7, move above card 6. Entire card follows the pointer; real data is unchanged until save order.
 await position(ids[5],55);
 let h=await card(ids[6]).locator('[data-drag]').boundingBox(),target=await card(ids[5]).boundingBox();
 await p.mouse.move(h.x+h.width/2,h.y+h.height/2);await p.mouse.down();await p.mouse.move(h.x+h.width/2+14,h.y+h.height/2-30,{steps:5});
 assert.equal(await p.locator('.lc-lesson-drag-layer').count(),1);assert.equal(await p.locator('.is-drag-source').count(),1);assert.equal(await p.locator('.lc-lesson-drag-layer .lc-lesson-edit-body').count(),1);
 await p.mouse.move(target.x+70,target.y+25,{steps:12});assert.equal(await p.locator('.lc-lesson-drop-marker').isVisible(),true);
 assert.deepEqual(await order(),ids,'do not reorder during pointer movement');assert.deepEqual(await persisted(),ids);
 if(process.env.DRAG_SCREENSHOT)await p.screenshot({path:process.env.DRAG_SCREENSHOT});
 await p.mouse.up();let swapped=ids.slice();[swapped[5],swapped[6]]=[swapped[6],swapped[5]];assert.deepEqual(await order(),swapped);
 assert.equal(await p.locator('.lc-lesson-drag-layer').count(),0);assert.equal(await p.locator('.lc-lesson-drop-marker').count(),0);assert.deepEqual(await persisted(),ids);
 // Escape and release outside the list both cancel; no lingering global drag layer.
 await position(ids[6]);h=await card(ids[6]).locator('[data-drag]').boundingBox();
 await p.mouse.move(h.x+12,h.y+12);await p.mouse.down();await p.mouse.move(h.x+30,h.y+70);await p.keyboard.press('Escape');await p.mouse.up();assert.deepEqual(await order(),swapped);assert.equal(await p.locator('.lc-lesson-drag-layer').count(),0);
 await p.mouse.move(h.x+12,h.y+12);await p.mouse.down();await p.mouse.move(5,h.y+50,{steps:8});assert.equal(await p.locator('.lc-lesson-drop-marker').isVisible(),false);await p.mouse.up();assert.deepEqual(await order(),swapped);
 // Edge scrolling uses the real nested scroll container.
 await position(ids[6]);h=await card(ids[6]).locator('[data-drag]').boundingBox();const eb=await p.locator('.lc-editor').boundingBox(),edgeStart=await scroll();
 await p.mouse.move(h.x+12,h.y+12);await p.mouse.down();await p.mouse.move(h.x+40,eb.y+eb.height-12,{steps:15});await p.waitForTimeout(160);assert.ok(await scroll()>edgeStart,'edge drag scrolls the editor');await p.keyboard.press('Escape');await p.mouse.up();assert.deepEqual(await order(),swapped);
 await p.locator('[data-lc="save-order"]').click();assert.deepEqual(await persisted(),swapped);
 // New lesson remains local until save; cancel/X/Esc preserve content and scroll.
 await p.locator('[data-lc="add-lesson"]').click();const extra=await p.locator('.lc-edit-lessons > [data-edit-lesson]').last().getAttribute('data-edit-lesson');
 await card(extra).locator('[data-field="title"]').fill('待删除课节 <测试>');await card(extra).locator('[data-lesson-type="pdf"]').check();const localTop=await scroll();
 await card(extra).locator(".lc-upload-demo summary").first().click();await card(extra).locator('[data-lc="sample-content"]').click();assert.ok(Math.abs(await scroll()-localTop)<=1,'sample update keeps scroll');
 for(const close of ['取消','Escape','X']){
  await card(extra).locator('[data-lc="remove-lesson"]').click();const opened=await scroll();const dialog=p.locator('dialog[open]');assert.ok((await dialog.textContent()).includes('待删除课节 <测试>'));
  if(close==='Escape')await p.keyboard.press('Escape');else if(close==='X')await dialog.locator('.gaip-modal__close').click();else await dialog.getByRole('button',{name:close,exact:true}).click();
  assert.equal(await card(extra).count(),1);assert.equal(await card(extra).locator('[data-field="title"]').inputValue(),'待删除课节 <测试>');assert.ok(Math.abs(await scroll()-opened)<=1);assert.equal(await p.evaluate(()=>document.activeElement.dataset.lc),'remove-lesson');
 }
 await card(extra).locator('[data-lc="remove-lesson"]').click();if(process.env.DELETE_SCREENSHOT)await p.screenshot({path:process.env.DELETE_SCREENSHOT});await p.locator('dialog').getByRole('button',{name:'删除课节',exact:true}).click();assert.equal(await card(extra).count(),0);assert.deepEqual(await persisted(),swapped);
 assert.equal(await card(ids[0]).locator('[data-lc="remove-lesson"]').isDisabled(),true,'existing published lessons stay protected');
 // A previously saved draft lesson is only removed from stored data by saving the course.
 await p.locator('[data-lc="save-course"]').first().click();await p.locator('[data-lc="leave-editor"]').first().click();
 await p.evaluate(()=>{const c=window.__GAIP_LEARNING_DATA__.course('c1');c.status='draft';c.everPublished=false;});
 await p.locator('[data-lc="edit"][data-id="c1"]').click();await position(ids[5]);await card(ids[5]).locator('[data-lc="remove-lesson"]').click();await p.locator('dialog').getByRole('button',{name:'删除课节',exact:true}).click();
 assert.equal(await card(ids[5]).count(),0);assert.equal((await persisted()).includes(ids[5]),true,'confirm only edits the draft');
 await p.locator('[data-lc="save-course"]').first().click();assert.equal((await persisted()).includes(ids[5]),false,'course save commits deletion');
 await p.evaluate(()=>window.__GAIP_LEARNING_APP__.destroy());assert.equal(await p.locator('.lc-lesson-drag-layer').count(),0);assert.deepEqual(errors,[]);
 console.log('PASS nested scroll/focus, local upload/type/sample, anchored move, full-card pointer drag/drop/cancel/outside/autoscroll/save, delete confirm cancel/X/Esc/name/guard');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
