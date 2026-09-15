// Source business action versus registered preview: text, controls and data isolation.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const cases = ['course-publish','course-offline','course-delete','lesson-publish','lesson-offline','last-lesson-offline','unsaved','lesson-delete'];
for (const scene of cases) {
  const dom = new JSDOM('<body><section id="page"><header class="gaip-learning-header"><button data-learning-action="学情管理">学情管理</button><button data-learning-action="课程管理">课程管理</button></header></section>', { url: 'https://local.example/学习中心.html', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window, d = w.document;
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
  for (const f of ['shared/scripts/global-modal.js','shared/scripts/global-date-picker.js','shared/scripts/global-multi-select.js','shared/scripts/global-filter-bar.js','shared/scripts/global-table.js','features/learning-center/learning-data.js','features/learning-center/learning-app.js','shared/scripts/modal-registry.js','全局组件/弹窗源登记.js','全局组件/弹窗自动索引.generated.js']) {
    Object.defineProperty(d, 'currentScript', { configurable: true, value: { src: 'https://local.example/' + f } });
    w.eval(fs.readFileSync(path.join(root, f), 'utf8'));
  }
  const D = w.__GAIP_LEARNING_DATA__, A = w.__GAIP_LEARNING_APP__, c = D.course('c1');
  D.state().courses = [c]; // Keep target on page 1 regardless of other Mock batches.
  if (scene === 'course-publish') c.status = 'offline';
  if (scene === 'course-delete') { c.status = 'draft'; c.everPublished = false; }
  if (scene === 'lesson-delete') { c.status = 'draft'; c.everPublished = false; c.lessons[0].title = '示例课节'; }
  if (scene === 'lesson-publish') c.lessons[0].status = 'offline';
  if (scene === 'last-lesson-offline') c.lessons.forEach((l,i) => l.status = i ? 'offline' : 'published');
  A.mount(d.querySelector('#page'));
  const click = selector => { const el = d.querySelector(selector); assert.ok(el, scene + ' trigger ' + selector); assert.ok(!el.disabled); el.click(); };
  click('[data-learning-action="课程管理"]');
  if (scene.startsWith('lesson-') || scene === 'last-lesson-offline' || scene === 'unsaved') {
    click('[data-lc="edit"][data-id="c1"]');
    if (scene === 'unsaved') {
      const input = d.querySelector('[data-field="title"]'); input.value += ' 未保存'; input.dispatchEvent(new w.Event('input', { bubbles:true })); click('[data-lc="leave-editor"]');
    } else click('[data-lc="' + (scene === 'lesson-delete' ? 'remove-lesson' : 'lesson-status') + '"][data-id="' + c.lessons[0].id + '"]');
  } else click('[data-lc="' + (scene === 'course-delete' ? 'delete' : 'publish') + '"][data-id="c1"]');
  const describe = dialog => ({ title: dialog.querySelector('.gaip-modal__title').textContent, message: dialog.querySelector('.gaip-modal-confirm__message').textContent, buttons: [...dialog.querySelectorAll('.gaip-modal__footer button')].map(b=>b.textContent) });
  const business = d.querySelector('dialog[open]'); assert.ok(business, scene + ' business dialog');
  const expected = describe(business);
  const danger = ['course-offline','course-delete','lesson-delete','lesson-offline'].includes(scene);
  const expectedButtons = scene === 'last-lesson-offline' ? ['返回','我知道了'] : scene === 'lesson-delete' ? ['取消','删除课节'] : scene === 'unsaved' ? ['放弃修改并离开','保存并离开'] : ['再想想', scene === 'course-delete' ? '删除草稿' : danger ? '确认下架' : '立即上架'];
  assert.deepEqual(expected.buttons, expectedButtons);
  assert.equal(business.classList.contains('gaip-modal--danger'), danger);
  assert.equal(business.querySelectorAll('.gaip-modal__button--danger-outline').length,scene === 'unsaved' ? 1 : 0);
  business.querySelector('.gaip-modal__close').click();
  const state = JSON.stringify(D.state());
  const entry = w.__GAIP_MODAL_REGISTRY__.list().find(x => scene === 'unsaved' ? x.id === 'learning-unsaved-confirm' : x.invoke && x.invoke.path === '__GAIP_LEARNING_APP__.openConfirm' && x.invoke.args[0] === scene);
  assert.ok(entry, scene + ' registered'); assert.equal(entry.category, 'confirmation'); assert.equal(entry.type, 'confirm');
  for (let i = 0; i < 2; i++) {
    const preview = w.__GAIP_MODAL_REGISTRY__.open(entry); assert.deepEqual(describe(preview), expected, scene + ' same business content');
    assert.equal(preview.classList.contains('gaip-modal--danger'), danger);
    assert.equal(preview.querySelectorAll('.gaip-modal__button--danger-outline').length,scene === 'unsaved' ? 1 : 0);
    const buttons = preview.querySelectorAll('.gaip-modal__footer button'); buttons[i].click();
    assert.equal(preview.isConnected, false); assert.equal(JSON.stringify(D.state()), state, scene + ' preview cannot change data');
  }
  assert.equal(w.__GAIP_MODAL_REGISTRY__.get('learning-study-detail').category, 'information');
  assert.equal(w.__GAIP_MODAL_REGISTRY__.get('learning-course-study-detail').status, 'ready');
  A.destroy(); dom.window.close(); console.log('PASS source and preview: ' + scene);
}
