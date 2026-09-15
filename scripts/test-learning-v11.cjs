'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
(async function () {
const root = path.resolve(__dirname, '..');
const dom = new JSDOM('<!doctype html><body><section id="page"><header class="gaip-learning-header"><button data-learning-action="学情管理">学情管理</button><button data-learning-action="课程管理">课程管理</button></header></section></body>', { url: 'https://local.example/学习中心.html', runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window;
w.TextEncoder = TextEncoder;
w.HTMLElement.prototype.scrollIntoView = function () {};
w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
function load(file) { Object.defineProperty(w.document, 'currentScript', { configurable: true, value: { src: 'https://local.example/' + file } }); w.eval(fs.readFileSync(path.join(root, file), 'utf8')); }
load('shared/scripts/global-modal.js');
load('shared/scripts/operation-log-xlsx.js');
load('shared/scripts/organization-store.js');load('shared/scripts/organization-tree.js');load('features/learning-center/learning-data.js');
const D = w.__GAIP_LEARNING_DATA__;
const c = D.course('c1');
assert.equal(D.active(c).length, 12);
assert.equal(c.lessons.filter(l => l.type === 'pdf').length, 1);
assert.equal(c.lessons.filter(l => l.type === 'audio').length, 1);
let s = D.openSession('c1','c1l1');
assert.throws(() => D.progress(s, 90, true), /不支持拖动/);
D.progress(s, 180, false); assert.equal(D.record(c,c.lessons[0]).progress,100);
s = D.openSession('c1','c1l1'); assert.equal(s.position,0); D.progress(s,20,true);assert.equal(D.record(c,c.lessons[0]).progress,100);assert.equal(D.record(c,c.lessons[0]).highWater,180);
const optional = D.course('c2'), ol = optional.lessons[0]; s=D.openSession(optional.id,ol.id);D.progress(s,90,true);assert.equal(D.record(optional,ol).progress,50);D.progress(s,18,true);assert.equal(D.record(optional,ol).progress,10);assert.equal(D.record(optional,ol).highWater,90);
const pdf=optional.lessons[2];s=D.openSession(optional.id,pdf.id);D.progress(s,90,false);assert.equal(D.record(optional,pdf).progress,0);D.progress(s,180,false);assert.equal(D.record(optional,pdf).progress,100);
let draft = D.newCourse();draft.title='测试课程';draft.description='用于业务回归';draft.image='assets/learning/course-01-arkos.jpg';draft.groups=['all'];draft.required=true;
draft=D.save(draft);assert.equal(draft.lessons.length,0);assert.throws(()=>D.publish(draft.id,true),/至少/);
let l=D.newLesson();assert.equal(l.type,null);l.type='video';l.title='测'.repeat(100);l.file={name:'mock.mp4',mock:true};draft.lessons.push(l);draft=D.save(draft);
const before=JSON.stringify(D.state().records);s=D.openSession(draft.id,l.id);D.progress(s,180,true);assert.equal(JSON.stringify(D.state().records),before);assert.equal(D.course(draft.id).status,'draft');
let bad=D.clone(draft);bad.title='测'.repeat(101);assert.throws(()=>D.save(bad),/100/);bad=D.clone(draft);bad.lessons[0].title='测'.repeat(101);assert.throws(()=>D.save(bad),/100/);
D.publish(draft.id,true);draft=D.clone(D.course(draft.id));assert.equal(draft.lessons[0].status,'published');
bad=D.clone(draft);bad.lessons[0].type='pdf';assert.throws(()=>D.save(bad),/类型/);bad=D.clone(draft);bad.lessons=[];assert.throws(()=>D.save(bad),/不能删除/);bad=D.clone(draft);bad.groups=['香港业务'];assert.throws(()=>D.save(bad),/不能缩小/);
s=D.openSession(draft.id,l.id);D.progress(s,180,false);assert.equal(D.summary(D.course(draft.id)).status,'已完成');
let newL=D.newLesson();newL.type='video';newL.title='新增课节';newL.file={name:'mock.mp4',mock:true};draft.lessons.push(newL);draft=D.save(draft);assert.equal(draft.lessons[1].status,'offline');assert.equal(D.summary(D.course(draft.id)).status,'已完成');
D.publishLesson(draft.id,newL.id,true);assert.equal(D.summary(D.course(draft.id)).status,'学习中');
D.publishLesson(draft.id,newL.id,false);assert.equal(D.summary(D.course(draft.id)).status,'已完成');assert.equal(D.record(D.course(draft.id),l).progress,100);
assert.throws(()=>D.publishLesson(draft.id,l.id,false),/至少保留/);assert.equal(D.course(draft.id).status,'published');D.publish(draft.id,false);assert.ok(D.history(D.course(draft.id),'u1').completion.firstAt);
D.publish(draft.id,true);assert.equal(D.active(D.course(draft.id)).length,2);assert.equal(D.summary(D.course(draft.id)).status,'学习中');
const logCount=D.state().logs.length;D.publish(draft.id,false);assert.equal(D.state().logs.length,logCount+1);D.publish(draft.id,true);
// Current session continues after visibility change; entry/handout use live access checks.
s=D.openSession(draft.id,l.id);D.publish(draft.id,false);D.progress(s,40,false);assert.throws(()=>D.openSession(draft.id,l.id),/下架/);
D.publish(draft.id,true);const access=D.openCourseAccess(draft.id);D.publish(draft.id,false);assert.ok(D.openSession(draft.id,newL.id,access),'already open course can continue another active lesson');D.closeAccess(access);assert.throws(()=>D.openSession(draft.id,newL.id,access),/下架/);
// Scoped roles and all-users group (including no group).
D.setUser('u6');assert.ok(D.availableCourses().some(x=>x.groups.includes('all')));assert.ok(!D.availableCourses().some(x=>x.status==='draft'));assert.throws(()=>D.save(D.newCourse()),/权限/);
D.setUser('u4');assert.ok(D.scopeUsers().every(u=>D.matchesOrg(u,'1:department-2')));assert.throws(()=>D.remove('c7'),/权限/);
D.setUser('u3');assert.ok(!D.availableCourses().some(x=>x.status==='draft'));assert.throws(()=>D.scopeUsers(),/权限/);
D.setUser('u1');
// Independent lesson save does not save unrelated lesson edits.
let ed=D.clone(D.course('c1'));const originalSecond=ed.lessons[1].title;ed.lessons[0].title='独立保存的名称';ed.lessons[1].title='尚未保存名称';D.save(ed,ed.lessons[0].id);assert.equal(D.course('c1').lessons[1].title,originalSecond);
D.saveOrder('c1',D.course('c1').lessons.map(x=>x.id).reverse());assert.equal(D.course('c1').lessons.at(-1).title,'独立保存的名称');assert.equal(D.record(D.course('c1'),D.course('c1').lessons.at(-1)).progress,100);
// DOM behavior, event delegation, shared confirmation lifecycle.
load('shared/scripts/global-multi-select.js');
load('shared/scripts/global-date-picker.js'); load('shared/scripts/global-filter-bar.js');
load('shared/scripts/global-table.js');load('features/learning-center/learning-app.js');const A=w.__GAIP_LEARNING_APP__,host=w.document.getElementById('page');A.mount(host);
function click(selector) { const node=w.document.querySelector(selector);assert.ok(node,selector);node.click(); }
click('[data-learning-action="课程管理"]');assert.ok(host.querySelector('main[aria-label="课程管理"]'));click('[data-lc="create"]');assert.ok(host.querySelector('[data-field="title"]').maxLength===100);
function fill(selector,value) {const el=host.querySelector(selector);el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}));}
fill('[data-field="title"]','新的草稿');click('[data-lc="leave-editor"]');assert.equal(w.document.querySelectorAll('dialog[open]').length,1);assert.ok(w.document.querySelector('dialog').textContent.includes('放弃修改并离开'));click('dialog .gaip-modal__close');assert.equal(w.document.querySelectorAll('dialog').length,0);assert.equal(host.querySelector('[data-field="title"]').value,'新的草稿');
click('[data-lc="save-course"]');assert.equal(host.querySelector('#lc-course-description').getAttribute('aria-invalid'),'true');assert.equal(host.querySelector('[data-field="title"]').value,'新的草稿');
fill('[data-field="description"]','描述');click('[data-lc="sample-cover"]');click('[data-editor-groups] [data-value="all"]');click('[data-course-boolean="required"][value="false"]');click('[data-lc="save-draft-return"]');assert.ok(D.state().courses.some(x=>x.title==='新的草稿'&&x.lessons.length===0));assert.equal(host.dataset.learningView,'manage');
click('[data-lc="edit"][data-id="c1"]');const one=host.querySelector('[data-field="title"][data-lesson]');const savedId=one.dataset.lesson;fill('[data-field="title"][data-lesson="'+savedId+'"]','只保存这一节');click('[data-lc="save-lesson"][data-id="'+savedId+'"]');assert.equal(A.canLeave(),true,'single saved lesson alone must not leave a phantom dirty state');click('[data-lc="move-down"][data-id="'+savedId+'"]');assert.equal(A.canLeave(),false);click('[data-lc="save-order"]');assert.equal(A.canLeave(),true,'saved order alone must be clean');click('[data-lc="leave-editor"]');
click('[data-lc="list"]');click('[data-learning-action="学情管理"]');assert.ok(host.textContent.includes('累计学习时长'));click('[data-lc="stats-detail"]');assert.ok(w.document.querySelector('.lc-study-detail-modal[open]'));click('[data-close]');click('[data-lc="stats-tab"][data-id="courses"]');assert.ok(host.textContent.includes('应学人数'));click('[data-lc="stats-detail"]');assert.ok(w.document.querySelector('.lc-study-detail-modal').textContent.includes('首次完成'));click('[data-close]');
click('[data-lc="list"]');click('[data-lc="course"][data-id="c2"]');click('[data-lc="lesson"][data-id="c2l1"]');assert.ok(host.querySelector('.lc-watermark'));const seek=host.querySelector('[data-seek]');assert.equal(seek.disabled,false);seek.value='90';seek.dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(D.record(D.course('c2'),D.course('c2').lessons[0]).progress,50);
click('[data-lc="detail"]');click('[data-lc="lesson"][data-id="c2l3"]');assert.equal(host.querySelectorAll('.lc-pdf-page').length,4);assert.equal(host.querySelectorAll('iframe').length,0);click('[data-lc="zoom-in"]');assert.equal(host.querySelector('[data-zoom]').textContent,'120%');
// PDF requires actual loaded pages and bottom scroll, never a initial render completion.
const scroll=host.querySelector('.lc-pdf-scroll');assert.ok(scroll);assert.equal(host.querySelectorAll('.lc-pdf-page .lc-watermark').length,4);
delete D.state().records['u1/c2/c2l3'];
Object.defineProperties(scroll,{scrollHeight:{value:5000,configurable:true},clientHeight:{value:800,configurable:true}});
scroll.scrollTop=4200;scroll.dispatchEvent(new w.Event('scroll'));assert.equal(D.record(D.course('c2'),pdf).progress,0,'unloaded pages cannot complete');
host.querySelectorAll('.lc-pdf-page img').forEach(img=>{Object.defineProperties(img,{complete:{value:true},naturalWidth:{value:935}});});
scroll.scrollTop=1000;scroll.dispatchEvent(new w.Event('scroll'));assert.equal(D.record(D.course('c2'),pdf).progress,0,'middle of document cannot complete');
scroll.scrollTop=4200;scroll.dispatchEvent(new w.Event('scroll'));assert.equal(D.record(D.course('c2'),pdf).progress,100,'loaded document bottom completes');
A.destroy();assert.equal(w.document.querySelectorAll('dialog').length,0);
// Pure OOXML export has a configurable sheet title and confidential print header/footer.
const blob=w.__GAIP_OPERATION_LOG_XLSX__.build([['姓名','进度'],['测试',100]],{sheetName:'学情统计',confidential:true});assert.ok(blob.size>0);
const bytes=await new Promise((resolve,reject)=>{const reader=new w.FileReader();reader.onload=()=>resolve(new Uint8Array(reader.result));reader.onerror=reject;reader.readAsArrayBuffer(blob);});
const xml=new TextDecoder().decode(bytes);assert.ok(xml.includes('name="学情统计"'));assert.ok(xml.includes('<oddHeader>&amp;C机密文件</oddHeader>'));assert.ok(xml.includes('<oddFooter>'));assert.ok(xml.includes('autoFilter ref="A1:B2"'));
// Real lifecycle must initialize the replacement app and cleanly leave/re-enter.
host.remove();w.document.body.insertAdjacentHTML('afterbegin','<header class="header___tcVAl"></header><aside class="ant-layout-sider"></aside><div id="root"></div>');w.scrollTo=()=>{};
load('features/learning-center/learning-center.js');w.__GAIP_LEARNING_CENTER__.open();assert.equal(w.location.hash,'#/workspace?gaip-channel=learning');assert.equal(w.document.querySelectorAll('[data-gaip-learning-overlay]').length,1);assert.ok(w.document.querySelector('[data-lc="course"]'));w.__GAIP_LEARNING_CENTER__.open();assert.equal(w.document.querySelectorAll('[data-gaip-learning-overlay]').length,1);w.__GAIP_LEARNING_CENTER__.closeForNavigation('/clues');assert.equal(w.document.querySelectorAll('[data-gaip-learning-overlay]').length,0);assert.ok(!w.document.documentElement.classList.contains('gaip-learning-scroll-lock'));
w.__GAIP_LEARNING_CENTER__.open();click('[data-learning-action="课程管理"]');click('[data-lc="create"]');const unsaved=w.document.querySelector('[data-field="title"]');unsaved.value='跨 Hash 未保存';unsaved.dispatchEvent(new w.Event('input',{bubbles:true}));
w.history.replaceState(null,'','#/clues');w.__GAIP_LEARNING_CENTER__.sync();await new Promise(resolve=>setTimeout(resolve,45));assert.ok(w.location.hash.includes('gaip-channel=learning'),'history leave restores URL until confirmed');assert.ok(w.document.querySelector('dialog[open]'));click('dialog .gaip-modal__close');assert.ok(w.document.querySelector('[data-field="title"]'));
w.history.replaceState(null,'','#/clues');w.__GAIP_LEARNING_CENTER__.sync();await new Promise(resolve=>setTimeout(resolve,45));w.document.querySelector('dialog [data-learning-discard]').click();assert.equal(w.location.hash,'#/clues');assert.equal(w.document.querySelectorAll('[data-gaip-learning-overlay]').length,0);
load('shared/config/channels.js');const registered=w.__GAIP_CHANNEL_CONFIG__.list.find(x=>x.key==='learning');assert.ok(registered.assets.scripts.find(x=>x.includes('learning-data.js')));assert.ok(registered.assets.scripts.findIndex(x=>x.includes('learning-data.js'))<registered.assets.scripts.findIndex(x=>x.includes('learning-app.js')));for(const file of registered.assets.styles.concat(registered.assets.scripts))assert.ok(fs.existsSync(path.join(root,file.split('?')[0])),file);
const source=fs.readFileSync(path.join(root,'features/learning-center/learning-app.js'),'utf8');assert.ok(!/fetch\(|XMLHttpRequest|<video|<audio/.test(source));
console.log('PASS learning V1.1: domain rules, permission scope, preview isolation, lifecycle, editor, stats, reader, export. DOM-only; not a browser visual test.');
dom.window.close();
})().catch(error=>{console.error(error);process.exitCode=1;});
