'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
(async function () {
const root = path.resolve(__dirname, '..');
const dom = new JSDOM('<!doctype html><nav class="ant-breadcrumb"></nav><section id="page"><header class="gaip-learning-header"><button data-learning-action="学情管理">学情管理</button><button data-learning-action="课程管理">课程管理</button></header></section>', { url: 'https://local.example/channels/learning-center/index.html#/workspace?gaip-channel=learning', runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window, host = w.document.querySelector('#page');
// Track persistent shared observers/frames so JSDOM teardown cannot schedule work after close.
const observers = [], frames = new Set(), NativeObserver = w.MutationObserver;
w.MutationObserver = class extends NativeObserver { constructor(callback) { super(callback); observers.push(this); } };
const raf = w.requestAnimationFrame.bind(w), caf = w.cancelAnimationFrame.bind(w);
w.requestAnimationFrame = callback => { const id = raf(time => { frames.delete(id); callback(time); }); frames.add(id); return id; };
w.cancelAnimationFrame = id => { frames.delete(id); caf(id); };
w.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
w.HTMLElement.prototype.scrollIntoView = function () {};
w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
for (const file of ['shared/assets/icons/local-icons.generated.js', 'shared/config/channels.js', 'shared/scripts/global-breadcrumb.js', 'components/modal/global-modal.js', 'components/multi-select/global-multi-select.js', 'components/date-picker/global-date-picker.js', 'shared/scripts/organization-store.js', 'components/organization-tree/organization-tree.js', 'components/filter-bar/global-filter-bar.js', 'channels/learning-center/learning-data.js', 'components/table/global-table.js', 'channels/learning-center/learning-app.js']) {
  Object.defineProperty(w.document, 'currentScript', { configurable: true, value: { src: 'https://local.example/' + file } });
  w.eval(fs.readFileSync(path.join(root, file), 'utf8'));
}
const D = w.__GAIP_LEARNING_DATA__, A = w.__GAIP_LEARNING_APP__;
const original = JSON.stringify(D.state());
const click = selector => { const el = w.document.querySelector(selector); assert.ok(el, selector); el.click(); };
const filter = (key, value) => { const el = host.querySelector('[data-filter-key="' + key + '"] input, [data-filter-key="' + key + '"] select'); if (el.type === 'checkbox') el.checked = value; else el.value = value; el.dispatchEvent(new w.Event('change', { bubbles: true })); };
const search = value => { w.__GAIP_FILTER_BAR__.get(host.querySelector('.lc-manage-filter-slot')).setValue({q:value}); };
const rows = () => Array.from(host.querySelectorAll('tbody tr'));
const initialHostMarkup = host.innerHTML;
A.mount(host);
assert.equal(host.querySelector('.gaip-learning-header').parentElement, host.querySelector('.gaip-learning-scroll'), 'the whole learning header shares the course scroll container');
assert.equal(host.querySelector('.gaip-learning-header').nextElementSibling, host.querySelector('[data-live-cards]'), 'header precedes live content in the same flow');
assert.equal(host.querySelector('.gaip-learning-grid').parentElement, host.querySelector('.gaip-learning-header').parentElement, 'courses and header scroll together');
click('[data-learning-action="课程管理"]');
assert.ok(host.querySelector('.lc-manage'));
assert.equal(host.querySelectorAll('.lc-manage h2').length, 0, 'no standalone course-management title row');
assert.deepEqual(Array.from(host.querySelectorAll('.lc-manage-header [data-lc]'), n => n.dataset.lc), ['list','logs','create']);
assert.equal(host.querySelector('.lc-manage').getAttribute('aria-label'), '课程管理');
await new Promise(resolve => setTimeout(resolve, 50));
assert.equal(w.document.querySelector('.ant-breadcrumb [aria-current="page"]').textContent, '课程管理');
click('[data-gaip-breadcrumb-action="channel-parent"]');
assert.equal(host.dataset.learningView, 'list');
await new Promise(resolve => setTimeout(resolve, 50));
assert.equal(w.document.querySelector('.ant-breadcrumb [aria-current="page"]').textContent, '学习中心');
click('[data-learning-action="课程管理"]');
assert.deepEqual(Array.from(host.querySelectorAll('.gaip-table__head th'), n => n.textContent), ['课程名称','状态','学习群组','必修','课节数','创建时间','最近更新','操作']);
assert.deepEqual(Array.from(host.querySelectorAll('.gaip-filter-bar__field'), n => n.dataset.filterKey), ['q','group','status','required']);
assert.equal(host.querySelector('[data-filter-key="group"]').dataset.type, 'multiSelect');
assert.equal(host.querySelector('[data-gaip-filter-action="more"]').hidden, true);
assert.equal(host.querySelector('[data-filter-key="required"] input').getAttribute('role'), 'switch');
assert.ok(host.querySelector('[data-lc="logs"]'));
assert.ok(host.querySelector('[data-lc="create"]'));
assert.equal(host.querySelector('.lc-table-scroll').tabIndex, 0);
for (const row of rows()) {
  const actions = Array.from(row.querySelectorAll('[data-lc]'));
  const c = D.course(actions[0].dataset.id), cells = row.cells;
  assert.deepEqual(actions.map(n => n.dataset.lc), c.status === 'draft' ? ['edit','preview-course','more'] : ['edit','more']);
  assert.ok(cells[0].textContent.includes(c.title));
  assert.equal(cells[0].querySelector('strong').title, c.title);
  assert.equal(!!cells[0].querySelector('.gaip-table__tag--highlight'), !!c.featured);
  assert.ok(cells[1].querySelector('.gaip-table__tag--' + (c.status === 'published' ? 'success' : 'neutral')));
  assert.equal(cells[2].textContent, c.groups.includes('all') ? '全部' : c.groups.join('、'));
  assert.equal(cells[3].textContent, c.required ? '是' : '否');
  assert.equal(cells[4].textContent, String(c.lessons.length));
  assert.ok(cells[5].textContent.length > 4);
  assert.equal(cells[6].querySelector('small').textContent, c.updatedBy);
  const more = actions.at(-1); more.click();
  const panel = w.document.querySelector('[data-course-action-panel]');
  const publish = panel.querySelector('[data-lc="publish"]'), remove = panel.querySelector('[data-lc="delete"]');
  assert.equal(panel.hidden, false); assert.equal(panel.parentElement, w.document.body);
  assert.equal(publish.textContent, c.status === 'published' ? '下架' : '上架');
  assert.equal(remove.disabled, c.status !== 'draft');
  assert.equal(panel.querySelector('[data-course-delete-hint]').hidden, !remove.disabled);
  if (remove.disabled) {
    remove.click(); assert.equal(w.document.querySelector('dialog[open]'), null);
    publish.dispatchEvent(new w.KeyboardEvent('keydown', {key:'End', bubbles:true}));
    assert.equal(w.document.activeElement, publish, 'keyboard skips disabled delete');
  }
  publish.dispatchEvent(new w.KeyboardEvent('keydown', {key:'Escape', bubbles:true}));
  assert.equal(panel.hidden, true); assert.equal(w.document.activeElement, more);
}
const manageFilters = w.__GAIP_FILTER_BAR__.get(host.querySelector('.lc-manage-filter-slot'));
const selectedGroups = ['香港业务','新加坡业务'];
click('[data-filter-key="group"] [role="combobox"]');
for (const group of selectedGroups) {
  click('[data-filter-key="group"] [data-value="' + group + '"]');
  assert.equal(host.querySelector('[data-filter-key="group"] [role="combobox"]').getAttribute('aria-expanded'), 'true', 'multi-select stays open after table update');
}
assert.deepEqual(Array.from(manageFilters.getValues().group), selectedGroups);
const matching = Array.from(D.state().courses).filter(c => selectedGroups.some(g => c.groups.includes(g))).sort((a,b) => ['published','draft','offline'].indexOf(a.status)-['published','draft','offline'].indexOf(b.status)||b.updatedAt.localeCompare(a.updatedAt));
assert.deepEqual(rows().map(row => row.querySelector('[data-lc="edit"]').dataset.id), matching.slice(0,10).map(c => c.id), 'group matches OR, without duplicates');
if (matching.length > 10) {
  click('[data-table-action="next"]');
  assert.deepEqual(rows().map(row => row.querySelector('[data-lc="edit"]').dataset.id), matching.slice(10,20).map(c => c.id));
}
manageFilters.setValue({group:['all']});
assert.ok(rows().every(row => row.cells[2].textContent === '全部'));
manageFilters.reset();
assert.deepEqual(Array.from(manageFilters.getValues().group), []);
filter('status', 'published'); filter('required', true);
assert.ok(rows().every(row => row.cells[1].textContent === '已上架' && row.cells[3].textContent === '是'));
manageFilters.setValue({group:['all']});
assert.ok(rows().every(row => row.cells[2].textContent === '全部'));
click('[data-gaip-filter-action="reset"]');
search(D.course('c1').title);
assert.equal(rows().length, 1); assert.equal(rows()[0].querySelector('[data-lc="edit"]').dataset.id, 'c1');
search('不存在的课程-空结果');
assert.equal(rows()[0].cells[0].colSpan, 8); assert.match(rows()[0].textContent, /暂无符合条件/);
click('[data-gaip-filter-action="reset"]');
assert.equal(host.querySelector('[data-filter-key="q"] input').value, '');
assert.equal(host.querySelector('[data-filter-key="status"] select').value, '');
assert.equal(host.querySelector('[data-filter-key="required"] input').checked, false);
click('[data-lc="more"][data-id="c1"]');
click('[data-lc="publish"][data-id="c1"]');
assert.ok(w.document.querySelector('dialog[open]')); click('dialog [data-modal-cancel]');
assert.equal(D.course('c1').status, 'published');
assert.equal(w.document.activeElement, host.querySelector('[data-lc="more"][data-id="c1"]'), 'cancel restores More trigger');
// Draft actions retain the real confirmation; cancel and menu dismissal do not write data.
filter('status', 'draft');
const draftMore = host.querySelector('[data-lc="more"]');
assert.deepEqual(Array.from(draftMore.closest('tr').querySelectorAll('[data-lc]'), n => n.dataset.lc), ['edit','preview-course','more']);
draftMore.click();
const coursePanel = w.document.querySelector('[data-course-action-panel]');
click('[data-course-action-panel] [data-lc="delete"]');
assert.ok(w.document.querySelector('dialog[open]')); click('dialog [data-modal-cancel]');
assert.equal(w.document.activeElement, draftMore);
draftMore.click(); w.dispatchEvent(new w.Event('scroll')); assert.equal(coursePanel.hidden, true);
draftMore.click(); host.querySelector('[data-lc="logs"]').dispatchEvent(new w.MouseEvent('pointerdown', {bubbles:true}));
assert.equal(coursePanel.hidden, true);
draftMore.click(); manageFilters.reset(); await Promise.resolve();
assert.equal(coursePanel.hidden, true, 'filter rerender closes stale row menu');
click('[data-lc="edit"][data-id="c1"]');
assert.ok(host.querySelector('.lc-editor')); assert.ok(!host.querySelector('.lc-manage'));
assert.equal(w.document.querySelector('[data-course-action-panel]'), null, 'leaving management removes portal');
assert.ok(host.querySelector('[data-field="description"]')); assert.equal(host.querySelectorAll('[data-edit-lesson]').length, 12);
click('[data-lc="leave-editor"]'); click('[data-lc="create"]');
assert.ok(host.querySelector('[data-field="title"]')); click('[data-lc="leave-editor"]');
const managerNode=host.querySelector('.lc-manage-results'), managerTable=w.__GAIP_TABLE__.get(managerNode);
const retainedFilters=w.__GAIP_FILTER_BAR__.get(host.querySelector('.lc-manage-filter-slot'));retainedFilters.setValue({status:'published'});
const retainedValues=JSON.stringify(retainedFilters.getValues());
managerTable.setPage(2); const managerState=managerTable.getState();
host.querySelector('[data-lc="logs"]').focus();
click('[data-lc="logs"]');
assert.equal(host.dataset.learningView,'manage');
const logDialog=w.document.querySelector('[data-gaip-modal-id="learning-course-log"]');
assert.ok(logDialog.open); assert.equal(logDialog.dataset.gaipModalCategory,'information');
assert.ok(w.__GAIP_TABLE__.get(logDialog.querySelector('.lc-course-log-table')));
assert.deepEqual(Array.from(logDialog.querySelectorAll('.gaip-table__head th'),n=>n.textContent),['操作项目','分类','操作对象','变更字段','变更前','变更后','操作人','操作时间','IP']);
click('[data-log-close]');assert.equal(w.document.querySelector('[data-gaip-modal-id="learning-course-log"]'),null);
assert.equal(host.querySelector('.lc-manage-results'),managerNode);assert.deepEqual(managerTable.getState(),managerState);
assert.equal(JSON.stringify(retainedFilters.getValues()),retainedValues);
assert.equal(w.document.activeElement,host.querySelector('[data-lc="logs"]'));
click('[data-lc="logs"]');click('[data-log-close]');
click('[data-lc="list"]'); click('[data-learning-action="学情管理"]');
assert.ok(!host.querySelector('.lc-manage')); assert.ok(host.textContent.includes('累计学习时长')); assert.ok(host.querySelector('[data-lc="export"]'));
assert.equal(JSON.stringify(D.state()), original, 'listing, filtering, canceled actions and navigation must not mutate Mock data');
// Enough rows to verify pagination still composes with live filters.
for (let i = 0; i < 13; i++) { let c = D.newCourse(); c.title = '分页演示' + i; c.description = '演示'; c.image = D.course('c1').image; c.groups = ['all']; c.required = false; D.save(c); }
click('[data-lc="list"]'); click('[data-learning-action="课程管理"]'); search('分页演示');
assert.equal(rows().length, 10); click('[data-lc="more"]'); click('[data-table-action="next"]'); assert.equal(rows().length, 3);
assert.equal(w.document.querySelector('[data-course-action-panel]').hidden, true, 'pagination closes row menu');
filter('status', 'draft'); assert.equal(rows().length, 10, 'filter changes return to page one');
const style = w.document.createElement('style'); style.textContent = fs.readFileSync(path.join(root, 'channels/learning-center/learning-center.css'), 'utf8') + fs.readFileSync(path.join(root, 'components/table/global-table.css'), 'utf8'); w.document.head.appendChild(style);
for (const th of host.querySelectorAll('thead th:first-child, thead th:last-child')) assert.equal(w.getComputedStyle(th).position, 'sticky');
assert.equal(w.getComputedStyle(host.querySelector('.lc-row-actions')).display, 'flex');
A.destroy();
for (const file of ['components/carousel-controls/global-carousel-controls.js', 'channels/learning-center/learning-live-data.js', 'channels/learning-center/learning-live.js']) {
  Object.defineProperty(w.document, 'currentScript', { configurable: true, value: { src: 'https://local.example/' + file } });
  w.eval(fs.readFileSync(path.join(root, file), 'utf8'));
}
// Usage links must land on the requested view without invoking edit or write actions.
const beforeLinkedViews = JSON.stringify(D.state());
for (const [query, selector] of [
  ['gaip-channel=learning&gaip-learning-view=manage', '.lc-manage'],
  ['gaip-channel=learning&gaip-learning-view=live', '[data-live-table]'],
  ['gaip-channel=learning&gaip-learning-view=stats&gaip-learning-tab=users', '[data-lc="stats-tab"][data-id="users"][aria-selected="true"]'],
  ['gaip-channel=learning&gaip-learning-view=stats&gaip-learning-tab=courses', '[data-lc="stats-tab"][data-id="courses"][aria-selected="true"]'],
  ['gaip-channel=learning&gaip-learning-view=edit', '.gaip-learning-header'],
  ['gaip-channel=news&gaip-learning-view=manage', '.gaip-learning-header']
]) {
  host.innerHTML = initialHostMarkup;
  w.history.replaceState(null, '', '#/workspace?' + query);
  A.mount(host);
  assert.ok(host.querySelector(selector), 'direct entry: ' + query);
  A.destroy();
}
const originalAdmin = D.admin;
D.admin = () => false;
host.innerHTML = initialHostMarkup;
w.history.replaceState(null, '', '#/workspace?gaip-channel=learning&gaip-learning-view=manage');
A.mount(host);
assert.equal(host.querySelector('.lc-manage'), null, 'direct entry preserves management permission checks');
A.destroy(); D.admin = originalAdmin;
assert.equal(JSON.stringify(D.state()), beforeLinkedViews, 'direct entries do not modify course or study data');
w.history.replaceState(null, '', '#/workspace?gaip-channel=learning');
host.remove();
// The channel lifecycle must not clear the manager breadcrumb on a subsequent sync.
w.document.body.insertAdjacentHTML('beforeend', '<header class="header___tcVAl"></header><aside class="ant-layout-sider"></aside><div id="root"></div>');
w.scrollTo = function () {};
w.eval(fs.readFileSync(path.join(root, 'channels/learning-center/templates.generated.js'), 'utf8'));
w.eval(fs.readFileSync(path.join(root, 'channels/learning-center/learning-center.js'), 'utf8'));
w.__GAIP_LEARNING_CENTER__.open(); click('[data-learning-action="课程管理"]');
w.__GAIP_LEARNING_CENTER__.sync();
await new Promise(resolve => setTimeout(resolve, 100));
assert.equal(w.document.querySelector('.ant-breadcrumb [aria-current="page"]').textContent, '课程管理');
click('.lc-manage-header [data-lc="logs"]');
await new Promise(resolve => setTimeout(resolve, 50));
assert.equal(w.document.querySelector('.ant-breadcrumb [aria-current="page"]').textContent, '课程管理', 'log modal preserves underlying manager breadcrumb');
click('[data-log-close]');
await new Promise(resolve => setTimeout(resolve, 50));
assert.equal(w.document.querySelector('.ant-breadcrumb [aria-current="page"]').textContent, '课程管理');
w.__GAIP_LEARNING_CENTER__.closeForNavigation('/clues'); w.location.hash = '#/clues';
await new Promise(resolve => setTimeout(resolve, 50));
assert.ok(!w.document.querySelector('.ant-breadcrumb').textContent.includes('课程管理'));
observers.forEach(observer => observer.disconnect()); frames.forEach(id => caf(id));
w.close();
console.log('PASS course-management trial: all fields/actions preserved, filter/order/paging/confirm/editor/study isolation, no unintended Mock writes. DOM/CSS only; visual layout awaits browser review.');
})().catch(error => { console.error(error); process.exitCode = 1; });
