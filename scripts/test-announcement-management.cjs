const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const source = file => fs.readFileSync(path.join(root, file), 'utf8');

function installDialog(window) {
  window.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
    this.setAttribute('open', '');
  };
  window.HTMLDialogElement.prototype.close = function () {
    if (!this.open) return;
    this.open = false;
    this.removeAttribute('open');
    this.dispatchEvent(new window.Event('close'));
  };
}

function setField(form, name, value) {
  const input = form.elements.namedItem(name);
  input.value = value;
  input.dispatchEvent(new input.ownerDocument.defaultView.Event('input', { bubbles: true }));
}

function submit(form) {
  form.dispatchEvent(new form.ownerDocument.defaultView.Event('submit', { bubbles: true, cancelable: true }));
}

const dom = new JSDOM('<!doctype html><html><body><main id="host"></main></body></html>', {
  url: 'file://' + root + '/配置中心.html#/workspace?gaip-channel=config&gaip-view=announcement-management',
  runScripts: 'outside-only',
  pretendToBeVisual: true
});
const w = dom.window;
const d = w.document;
installDialog(w);
w.eval(source('shared/scripts/global-modal.js'));
w.eval(source('features/config-center/announcement-management-data.js'));
w.eval(source('features/config-center/announcement-management-view.js'));

const api = w.__GAIP_ANNOUNCEMENT_MANAGEMENT__;
assert.ok(api, 'announcement management controller is available');
assert.equal(api.statusFor({ start: '2026-09-01T09:00:00', end: '2026-09-05T23:59:59' }, '2026-09-03T12:00:00').label, '展示中');
assert.equal(api.statusFor({ start: '2026-09-10T09:00:00', end: '2026-09-20T23:59:59' }, '2026-09-03T12:00:00').label, '未开始');
assert.equal(api.statusFor({ start: '2026-08-01T09:00:00', end: '2026-08-31T23:59:59' }, '2026-09-03T12:00:00').label, '已下架');
assert.deepEqual(Array.from(api.paginationItems(1, 24)), [1, 2, 3, 4, 5, 'next', 24], 'long pagination keeps the opening range and last page');
assert.deepEqual(Array.from(api.paginationItems(12, 24)), [1, 'prev', 10, 11, 12, 13, 14, 'next', 24], 'long pagination keeps the current neighborhood and both jump controls');
assert.deepEqual(Array.from(api.paginationItems(24, 24)), [1, 'prev', 20, 21, 22, 23, 24], 'long pagination keeps the first page and closing range');

const instance = api.mount(d.querySelector('#host'));
assert.equal(d.querySelectorAll('.gaip-announcement-table tbody tr').length, 10, 'first page contains ten rows');
assert.equal(d.querySelector('.gaip-announcement-table tbody tr td').textContent.trim(), '1', 'sequence starts at one');
assert.match(d.querySelector('.gaip-announcement-table tbody tr').textContent, /开始2026-09-01 01:00:00结束2026-09-08 15:59:59/, 'effective period uses aligned start and end rows');
assert.ok(d.querySelector('.gaip-announcement-page .ant-table'), 'list reuses the global Ant table contract');
assert.ok(d.querySelector('.gaip-announcement-create.ant-btn.ant-btn-primary'), 'create action reuses the global button contract');
assert.match(d.querySelector('.gaip-announcement-table tbody').textContent, /香港辦公室假期服務安排/, 'traditional title is used when simplified Chinese is blank');
assert.match(d.querySelector('.gaip-announcement-table tbody').textContent, /Client portal security update/, 'English title is used when both Chinese titles are blank');
assert.ok(d.querySelector('.gaip-announcement-pagination.ant-table-pagination.ant-pagination-end'), 'pagination reuses the global Ant table pagination contract');
assert.match(d.querySelector('.ant-pagination-total-text').textContent, /共 18 条，第 1 \/ 2 页/);
assert.ok(d.querySelector('[aria-label="上一页"] .anticon-left'), 'previous action uses the global icon-only treatment');
assert.ok(d.querySelector('[aria-label="下一页"] .anticon-right'), 'next action uses the global icon-only treatment');
assert.ok(d.querySelector('.ant-pagination-item-active [aria-current="page"]'));
assert.equal(d.querySelector('[aria-label="第一页"]'), null, 'announcement list does not add a custom first-page control');
const longRecord = api.getRecords().find(record => record.id === 'announcement-100-character');
assert.ok(longRecord, 'the 100-character multilingual title mock is available');
assert.equal(longRecord.simplified.length, 100);
assert.equal(longRecord.traditional.length, 100);
assert.equal(longRecord.english.length, 100);
const longTitleNode = d.querySelector('[data-announcement-title-tooltip="announcement-100-character"]');
assert.ok(longTitleNode, 'the current-language 100-character title is rendered in the first-page table');
assert.equal(longTitleNode.textContent.length, 100, 'the full title remains available to the ellipsis and hover treatment');
longTitleNode.dispatchEvent(new w.MouseEvent('mouseover', { bubbles: true }));
const titleTooltip = d.querySelector('.gaip-announcement-title-tooltip');
assert.ok(titleTooltip, 'hovering a truncated title opens the project tooltip');
assert.match(titleTooltip.textContent, /简体中文/);
assert.match(titleTooltip.textContent, /繁體中文/);
assert.match(titleTooltip.textContent, /English/);
assert.ok(titleTooltip.textContent.includes(longRecord.simplified));
assert.ok(titleTooltip.textContent.includes(longRecord.traditional));
assert.ok(titleTooltip.textContent.includes(longRecord.english));
longTitleNode.dispatchEvent(new w.MouseEvent('mouseout', { bubbles: true }));
assert.equal(d.querySelector('.gaip-announcement-title-tooltip'), null, 'title tooltip closes after hover leaves');

d.querySelector('[data-announcement-page="2"]').click();
assert.equal(d.querySelectorAll('.gaip-announcement-table tbody tr').length, 8, 'second page contains remaining rows');
assert.equal(d.querySelector('.gaip-announcement-table tbody tr td').textContent.trim(), '1', 'sequence restarts at one on each page');

let dialog = api.openCreate();
assert.ok(dialog.matches('.ant-modal.gaip-announcement-dialog'));
assert.ok(dialog.matches('.formModal____MTrk.ant-modal-css-var'), 'form modal reuses the project modal component classes');
assert.ok(dialog.querySelector('.ant-modal-header .ant-modal-title'));
assert.ok(dialog.querySelector('.ant-modal-body'));
assert.ok(dialog.querySelector('.ant-modal-footer.footer___UhMLM'));
assert.ok(dialog.querySelector('.ant-form.ant-form-vertical'));
assert.ok(dialog.querySelector(':scope > .ant-modal-content > .ant-modal-body > form'), 'form stays inside the independently scrolling body');
assert.ok(dialog.querySelector(':scope > .ant-modal-content > .ant-modal-footer'), 'footer stays outside the form and body');
assert.equal(dialog.querySelector('.ant-modal-footer [type="submit"]').getAttribute('form'), dialog.querySelector('form').id, 'footer submit remains connected to the body form');
assert.ok(dialog.querySelector('.ant-input'));
assert.equal(dialog.querySelectorAll('textarea[data-announcement-autosize]').length, 3, 'all title fields use auto-growing textareas');
let form = dialog.querySelector('form');
submit(form);
assert.equal(form.querySelector('[data-announcement-title-error]').textContent, '请至少填写一种语言标题');
assert.equal(form.querySelector('[data-announcement-period-error]').textContent, '请填写完整的展示时间段');

setField(form, 'simplified', '新增公告示例');
setField(form, 'startDate', '2026-10-10');
setField(form, 'startTime', '09:00:00');
setField(form, 'endDate', '2026-10-09');
setField(form, 'endTime', '23:59:59');
submit(form);
assert.equal(form.querySelector('[data-announcement-period-error]').textContent, '结束时间必须晚于开始时间');

setField(form, 'endDate', '2026-10-12');
submit(form);
assert.equal(api.getRecords().length, 19, 'valid create adds a record');
assert.equal(api.getRecords()[0].simplified, '新增公告示例', 'new record is inserted first');
assert.match(d.querySelector('.ant-pagination-total-text').textContent, /第 1 \/ 2 页/, 'create returns the list to page one');

dialog = api.openEdit('announcement-001');
form = dialog.querySelector('form');
assert.equal(form.elements.namedItem('simplified').value, '系统将于本周六凌晨进行维护升级');
setField(form, 'simplified', '系统维护升级时间调整');
submit(form);
assert.equal(api.getRecords().find(record => record.id === 'announcement-001').simplified, '系统维护升级时间调整', 'edit updates the current record');

assert.equal(api.openDelete('announcement-001'), null, 'an active announcement cannot open the delete confirmation');
const activeRow = Array.from(d.querySelectorAll('.gaip-announcement-table tbody tr')).find(row => row.textContent.includes('系统维护升级时间调整'));
assert.ok(activeRow.querySelector('button[disabled]'));
assert.equal(activeRow.querySelector('.gaip-announcement-disabled-action').title, '展示中的公告不可删除');

dialog = api.openDelete('announcement-007');
assert.ok(dialog && dialog.querySelector('[data-announcement-confirm-delete]'), 'an offline announcement can open delete confirmation');
assert.ok(dialog.classList.contains('gaip-modal--confirm'));
assert.ok(dialog.classList.contains('gaip-modal--danger'));
assert.equal(dialog.querySelector('.gaip-modal-confirm__description').textContent.trim(), '删除后不可恢复。');
assert.ok(dialog.querySelector('.gaip-modal__close svg'), 'delete confirmation uses the shared close icon');
dialog.querySelector('[data-announcement-confirm-delete]').click();
assert.equal(api.getRecords().some(record => record.id === 'announcement-007'), false, 'confirmed delete removes an offline record');

const css = source('features/config-center/announcement-management.css');
assert.match(css, /gaip-announcement-page\s*\{[\s\S]*border-top:\s*1px solid rgba\(47, 54, 64, \.12\)/, 'announcement content starts with the shared channel divider');
assert.match(css, /gaip-announcement-table \.ant-table-thead\s*\{[\s\S]*position:\s*sticky/);
assert.match(css, /gaip-announcement-modal-header\.ant-modal-header\s*\{[\s\S]*padding:\s*24px 64px 24px 24px/);
assert.match(css, /gaip-announcement-modal-body > \.gaip-announcement-form\s*\{[\s\S]*padding:\s*0 24px 24px/, 'form keeps 24px horizontal breathing room while the scrollbar stays at the modal edge');
assert.match(css, /ant-modal-footer\.gaip-announcement-modal-footer\s*\{[\s\S]*min-height:\s*72px/);
assert.match(css, /gaip-announcement-modal-footer \.ant-btn\s*\{[\s\S]*min-width:\s*88px;[\s\S]*height:\s*40px/);
assert.match(css, /ant-pagination-prev svg,[\s\S]*width:\s*14px;[\s\S]*height:\s*14px/);
assert.match(css, /gaip-announcement-action\.ant-btn\[disabled\][\s\S]*cursor:\s*not-allowed/);
assert.match(css, /var\(--ant-color-error,\s*#ff4d4f\)/, 'danger actions use the global Ant error color token');
assert.match(css, /gaip-announcement-time-controls\s*\{[\s\S]*grid-template-columns:/, 'date and time controls share one row inside each range endpoint');
assert.match(css, /input\[type="date"\][\s\S]*background-size:\s*20px 20px/, 'date and time controls use one visible icon size');
assert.match(css, /announcement-calendar\.svg/);
assert.match(css, /announcement-clock\.svg/);
assert.match(css, /gaip-announcement-title-input\.ant-input\s*\{[\s\S]*max-height:\s*112px/, 'long titles grow until the controlled maximum height');
assert.match(css, /gaip-announcement-title-tooltip\.ant-tooltip\s*\{[\s\S]*width:\s*min\(520px/, 'multilingual title tooltip has a controlled desktop width');

const channelsDom = new JSDOM('<!doctype html>', { runScripts: 'outside-only' });
channelsDom.window.eval(source('shared/config/channels.js'));
const config = channelsDom.window.__GAIP_CHANNEL_CONFIG__.getByKey('config');
assert.deepEqual(Array.from(config.views, view => view.key), ['organization', 'announcement-management', 'operation-log']);
assert.ok(config.assets.styles.some(asset => asset.includes('announcement-management.css')));
assert.ok(config.assets.scripts.some(asset => asset.includes('announcement-management-view.js')));

instance.destroy();
dom.window.close();
channelsDom.window.close();
console.log('PASS: announcement list, title fallback, automatic status, pagination, create/edit/delete rules, modal contracts and channel registration.');
