const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const previewDir = path.join(root, '全局组件');
const html = fs.readFileSync(path.join(previewDir, 'index.html'), 'utf8');
// DOM-only test: no resource loader, network, or browser navigation.
const dom = new JSDOM(html, { url: 'https://preview.invalid/全局组件/index.html', runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window;
w.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
try {
  for (const script of w.document.querySelectorAll('script[src]')) {
    const file = path.resolve(previewDir, script.getAttribute('src').split('?')[0]);
    w.eval(fs.readFileSync(file, 'utf8'));
  }
  const doc = w.document;
  const style = doc.createElement('style');
  style.textContent = fs.readFileSync(path.join(previewDir, 'components-preview.css'), 'utf8');
  doc.head.appendChild(style);
  assert.equal(doc.querySelector('.catalogSummary'), null, '重复概览应从DOM移除');
  assert.doesNotMatch(html, /summaryComponentCount|summaryUsageCount|组件数量|当前使用位置|组件来源/);
  const tabs = [...doc.querySelectorAll('.catalogNavItem[role="tab"]')];
  assert.equal(tabs.length, w.__GAIP_GLOBAL_COMPONENTS__.length, '保留所有已登记组件');
  for (const tab of tabs) {
    tab.click();
    const entry = doc.getElementById(tab.getAttribute('aria-controls'));
    assert.equal(doc.querySelectorAll('.componentEntry:not([hidden])').length, 1);
    assert.equal(entry.hidden, false);
    assert.equal(tab.getAttribute('aria-selected'), 'true');
    assert.equal(new URL(w.location.href).searchParams.get('component'), entry.id);
    assert.equal(entry.querySelectorAll('.componentPreviewSurface').length, entry.id === 'underline-tabs' ? 2 : 1, entry.id + ' 每组示例有独立预览卡片');
    const surface = entry.querySelector('.componentPreviewSurface');
    assert.equal(w.getComputedStyle(surface).backgroundColor, 'rgb(255, 255, 255)');
    assert.equal(w.getComputedStyle(entry).backgroundColor, 'rgba(0, 0, 0, 0)');
    assert.equal(w.getComputedStyle(surface).overflow, 'visible', '目录展示卡片不裁切组件下拉面板');
    for (const node of entry.querySelectorAll('.componentEntryHeader, .componentDetails, .componentEntryFooter, .filterDemo__note, .filterDemo__toggles, .filterDemo__values, .tableDemo__scenarios, .tableDemo__note, .tableDemo__feedback, .modalCatalogMetrics, [data-frame-restore]')) {
      assert.equal(node.closest('.componentPreviewSurface'), null, '说明及配置必须位于白卡外：' + node.className);
    }
  }
  for (const selector of ['[data-gaip-tabs-demo]', '[data-gaip-tabs-count-demo]', '[data-gaip-table-demo]', '[data-gaip-filter-demo]', '[data-gaip-date-demo]', '[data-gaip-multi-select-demo]', '.catalogFormFrame']) {
    const host = doc.querySelector(selector);
    assert.ok(host.closest('.componentPreviewSurface'), selector + ' 位于白卡内');
    assert.ok(host.children.length, selector + ' 已挂载真实组件');
  }
  const sharedTabs = doc.querySelector('[data-gaip-tabs-demo]');
  assert.equal(doc.querySelector('[data-gaip-tabs-demo-status]').closest('.componentPreviewSurface'), null, 'Tab状态文字在白卡外');
  assert.equal(doc.querySelector('.tabsDemo__help').closest('.componentPreviewSurface'), null, '键盘说明在白卡外');
  assert.notEqual(sharedTabs.closest('.componentPreviewSurface'), doc.querySelector('[data-gaip-tabs-count-demo]').closest('.componentPreviewSurface'));
  sharedTabs.children[1].click();
  assert.equal(sharedTabs.children[1].getAttribute('aria-selected'), 'true');
  assert.equal(doc.querySelector('[data-gaip-tabs-demo-status]').textContent, '当前：课程学习统计');
  assert.ok(doc.querySelector('[data-gaip-tabs-count-demo] button:disabled'));
  for (const scenario of doc.querySelectorAll('[data-table-demo]')) {
    scenario.click();
    assert.equal(scenario.getAttribute('aria-pressed'), 'true', '卡片外的场景切换仍可用');
    assert.ok(doc.querySelector('[data-gaip-table-demo]').children.length);
  }
  const filterToggle = doc.querySelector('[data-filter-demo-visible="groups"]');
  filterToggle.click();
  assert.equal(filterToggle.checked, false);
  filterToggle.click();
  assert.equal(filterToggle.checked, true);
  const frame = doc.querySelector('.catalogFormFrame');
  const restore = doc.querySelector('[data-frame-restore]');
  frame.querySelector('[data-frame-cancel]').click();
  assert.equal(frame.hidden, true);
  assert.equal(restore.hidden, false);
  restore.click();
  assert.equal(frame.hidden, false);
  assert.equal(restore.hidden, true);
  let notice = 0, poster = 0;
  w.__GAIP_AI_NOTICE__.show = () => notice++;
  w.__GAIP_POSTER_SHARE__.open = () => poster++;
  doc.querySelector('[data-preview-action="showAiNotice"]').click();
  doc.querySelector('[data-preview-action="showPosterShare"]').click();
  assert.equal(notice, 1);
  assert.equal(poster, 1);
  assert.equal(doc.querySelectorAll('iframe').length, 0, '首页不加载全部业务弹窗');
  tabs[0].focus();
  tabs[0].dispatchEvent(new w.KeyboardEvent('keydown', { key: 'End', bubbles: true }));
  assert.equal(doc.activeElement, tabs.at(-1));
  w.history.replaceState(null, '', '?component=' + tabs[0].dataset.component);
  w.dispatchEvent(new w.PopStateEvent('popstate'));
  assert.equal(doc.getElementById(tabs[0].dataset.component).hidden, false);
  console.log('component preview layout: all ' + tabs.length + ' tabs, card separation, real mounts, scenario controls, form restore and launch delegation passed (DOM only)');
} finally {
  w.close();
}
