/* Code-only DOM tests; not a replacement for native dialog/browser visual QA.
   Install jsdom in a temporary directory, then set NODE_PATH to its node_modules. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const tick = () => new Promise(resolve => setTimeout(resolve, 60));

async function main() {
  const html = '<!doctype html><html><body><main id="root"><header class="header___tcVAl"><div class="right___fv3yS">' +
    '<button class="gaip-log-trigger">旧日志入口</button><span class="date___mF83s">2026年08月31日</span><div class="userInfo___Kwuov">本地预览用户</div>' +
    '</div></header><input id="retained-value" value="未提交内容"></main></body></html>';
  const dom = new JSDOM(html, {
    url: 'file://' + root + '/工作台.html#/workspace',
    runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window, d = w.document;
  const style = d.createElement('style');
  style.textContent = read('shared/styles/channel-foundation.css') + '\n' + read('shared/styles/global-operation-log.css');
  d.head.appendChild(style);
  let blob, download;
  const observers = [];
  const NativeObserver = w.MutationObserver;
  w.MutationObserver = class extends NativeObserver {
    constructor(callback) { super(callback); observers.push(this); }
  };
  w.TextEncoder = TextEncoder;
  w.Blob = Blob;
  w.URL.createObjectURL = value => { blob = value; return 'blob:local-test'; };
  w.URL.revokeObjectURL = () => {};
  w.HTMLAnchorElement.prototype.click = function () { download = this.download; };
  let datePickerCalls = 0;
  w.HTMLInputElement.prototype.showPicker = function () { datePickerCalls++; };
  // jsdom doesn't implement the native dialog top layer; test only our lifecycle.
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new w.Event('close'));
  };
  const loaded = [
    'shared/data/operation-log-mock.js',
    'shared/scripts/operation-log-xlsx.js',
    'shared/scripts/global-operation-log.js'
  ];
  for (const file of loaded) {
    Object.defineProperty(d, 'currentScript', {
      configurable: true, value: { src: 'file://' + path.join(root, file) }
    });
    w.eval(read(file));
  }
  const find = selector => d.querySelector(selector);
  const text = selector => find(selector).textContent;
  const click = selector => find(selector).click();
  const set = (name, value) => {
    const input = find('[name="' + name + '"]');
    input.value = value;
    input.dispatchEvent(new w.Event('input', { bubbles: true }));
  };
  const initialUrl = w.location.href;
  const originalRoot = find('#root');
  assert.equal(d.querySelectorAll('.gaip-log-trigger').length, 0);
  assert.equal(find('.right___fv3yS').firstElementChild.className, 'date___mF83s');
  assert.equal(find('.date___mF83s').nextElementSibling.className, 'userInfo___Kwuov');
  for (const selector of ['.date___mF83s', '.userInfo___Kwuov']) {
    const computed = w.getComputedStyle(find(selector));
    assert.equal(computed.height, '32px');
    assert.equal(computed.alignItems, 'center');
  }
  assert.equal(w.getComputedStyle(find('.right___fv3yS')).gap, '20px');
  assert.equal(w.getComputedStyle(find('.userInfo___Kwuov')).position, 'relative');
  assert.equal(w.getComputedStyle(find('.userInfo___Kwuov')).marginLeft, '28px');
  const dividerSelector = '.header___tcVAl .right___fv3yS .userInfo___Kwuov::before';
  const foundationRules = Array.from(d.styleSheets[0].cssRules);
  const divider = foundationRules.find(rule => rule.selectorText === dividerSelector).style;
  assert.equal(divider.width, '1px');
  assert.equal(divider.height, '20px');
  assert.equal(divider.left, '-24px');
  assert.equal(divider.top, '50%');
  assert.equal(divider.position, 'absolute');
  assert.equal(divider.getPropertyValue('pointer-events'), 'none');
  const compactHeader = foundationRules.find(rule => rule.conditionText === '(max-width: 1000px)' &&
    Array.from(rule.cssRules).some(child => child.selectorText === dividerSelector));
  assert.equal(Array.from(compactHeader.cssRules).find(rule => rule.selectorText === dividerSelector).style.left, '-16px');
  assert.equal(Array.from(compactHeader.cssRules).find(rule => rule.selectorText === '.header___tcVAl .right___fv3yS .userInfo___Kwuov').style.getPropertyValue('margin-left'), '20px');
  w.__GAIP_OPERATION_LOG__.show();
  assert.equal(find('dialog').open, true);
  // Reuse the baseline Ant Design geometry, rather than drawing lookalike icons.
  const baselineIcons = read('web/umi.0b0663b5.js');
  for (const name of ['down', 'search', 'calendar']) {
    const end = baselineIcons.indexOf('name:"' + name + '",theme:"outlined"');
    assert.ok(end > 0);
    const definition = baselineIcons.slice(baselineIcons.lastIndexOf('icon:{', end), end);
    const iconDoc = new w.DOMParser().parseFromString(read('shared/assets/control-' + name + '.svg'), 'image/svg+xml');
    assert.equal(iconDoc.querySelector('parsererror'), null);
    assert.equal(iconDoc.documentElement.getAttribute('viewBox'), definition.match(/viewBox:"([^"]+)"/)[1]);
    assert.equal(iconDoc.querySelector('path').getAttribute('d'), definition.match(/d:"([^"]+)"/)[1]);
  }
  for (const select of d.querySelectorAll('.gaip-log-filters select, .gaip-log-footer select')) {
    const css = w.getComputedStyle(select);
    assert.ok(css.backgroundImage.includes('control-down.svg'));
    assert.equal(css.paddingRight, '36px');
    assert.equal(css.appearance, 'none');
  }
  const searchStyle = w.getComputedStyle(find('.gaip-log-search'));
  assert.ok(searchStyle.backgroundImage.includes('control-search.svg'));
  assert.equal(searchStyle.paddingLeft, '36px');
  assert.equal(find('.gaip-log-search').placeholder, '请输入姓名/域账号/操作内容');
  assert.equal(find('.gaip-log-search').getAttribute('aria-label'), '姓名、域账号或操作内容');
  const focusRule = foundationRules.find(rule => rule.selectorText && rule.selectorText.includes('.gaip-log-footer select:focus'));
  assert.ok(focusRule.selectorText.includes('.gaip-log-filters input:focus'));
  assert.ok(focusRule.selectorText.includes('.gaip-log-filters select:focus'));
  assert.equal(focusRule.style.getPropertyValue('border-color'), 'var(--log-brand)');
  assert.equal(focusRule.style.outline, 'none');
  assert.equal(focusRule.style.getPropertyValue('box-shadow'), 'none');
  const invalidRule = foundationRules.find(rule => rule.selectorText === '.gaip-log-filters input[aria-invalid="true"]');
  assert.equal(invalidRule.style.getPropertyValue('border-color'), '#b63d3d');
  const dateRules = foundationRules.find(rule => rule.conditionText === 'selector(input::-webkit-calendar-picker-indicator)');
  assert.ok(dateRules);
  const dateInputRule = Array.from(dateRules.cssRules).find(rule => rule.selectorText === '.gaip-log-dates input[type="date"]');
  assert.ok(dateInputRule.style.getPropertyValue('background-image').includes('control-calendar.svg'));
  assert.equal(dateInputRule.style.getPropertyValue('padding-right'), '36px');
  const dateIndicatorRule = Array.from(dateRules.cssRules).find(rule => rule.selectorText.includes('::-webkit-calendar-picker-indicator'));
  assert.equal(dateIndicatorRule.style.opacity, '0');
  assert.notEqual(dateIndicatorRule.style.display, 'none');
  assert.notEqual(dateIndicatorRule.style.getPropertyValue('pointer-events'), 'none');
  assert.equal(w.getComputedStyle(find('[name="start"]')).cursor, 'pointer');
  find('[name="start"]').click();
  find('[name="end"]').click();
  assert.equal(datePickerCalls, 2, 'clicking either date field should open its picker');
  const tableHeaderRule = foundationRules.find(rule => rule.selectorText === '.gaip-log-table th');
  assert.equal(tableHeaderRule.style.getPropertyValue('white-space'), 'nowrap');
  assert.equal(find('dialog').getAttribute('aria-labelledby'), 'gaip-log-title');
  assert.equal(d.querySelectorAll('tbody tr').length, 10);
  assert.match(text('[data-log-summary]'), /共 28 条，第 1 \/ 3 页/);
  assert.equal(w.location.href, initialUrl);
  assert.equal(find('#root'), originalRoot);
  click('[data-log-next]');
  assert.equal(text('tbody td'), '11');
  click('[data-log-next]');
  assert.equal(d.querySelectorAll('tbody tr').length, 8);
  assert.equal(find('[data-log-next]').disabled, true);
  click('[data-log-prev]');
  assert.equal(text('tbody td'), '11');
  const pageSize = find('.gaip-log-footer select');
  pageSize.value = '20';
  pageSize.dispatchEvent(new w.Event('change', { bubbles: true }));
  assert.equal(d.querySelectorAll('tbody tr').length, 20);
  assert.match(text('[data-log-summary]'), /第 1 \/ 2 页/);
  set('module', '公告管理');
  set('type', '编辑');
  assert.equal(d.querySelectorAll('tbody tr').length, 4);
  assert.equal(d.querySelectorAll('.gaip-log-changed').length, 0);
  set('start', '2026-08-31');
  set('end', '2026-08-31');
  assert.equal(d.querySelectorAll('tbody tr').length, 1);
  set('query', ' DEMO_EDITOR02 ');
  assert.match(text('[data-log-summary]'), /共 1 条/);
  set('query', '不存在');
  assert.match(text('tbody'), /暂无匹配/);
  assert.equal(find('[data-log-export]').disabled, true);
  set('start', '2026-09-01');
  assert.match(text('.gaip-log-feedback'), /开始日期不能晚于结束日期/);
  assert.equal(find('[name="start"]').getAttribute('aria-invalid'), 'true');
  click('[data-log-reset]');
  assert.equal(find('[name="query"]').value, '');
  assert.match(text('[data-log-summary]'), /共 28 条/);
  assert.equal(find('[name="start"]').getAttribute('aria-invalid'), 'false');
  set('query', '查看原文');
  assert.match(text('[data-log-summary]'), /共 4 条/);
  assert.match(text('tbody'), /资讯标题：全球市场周报：汇率变化与资产配置观察/);
  assert.match(text('tbody'), /原文链接：https:\/\/example\.com\/market-weekly/);
  assert.match(text('tbody'), /资讯日期：2026-08-31/);
  assert.match(text('tbody'), /查看：查看原文\/查看详情/);
  const contentCopy = find('tbody td:nth-child(6) .gaip-log-copy');
  const contentExpand = find('tbody td:nth-child(6) [data-log-expand]');
  assert.equal(contentCopy.querySelectorAll(':scope > p').length, 4);
  assert.equal(contentCopy.classList.contains('is-collapsed'), true);
  assert.equal(contentExpand.textContent, '展开全部');
  contentExpand.click();
  assert.equal(contentCopy.classList.contains('is-collapsed'), false);
  assert.equal(contentExpand.textContent, '收起全部');
  contentExpand.click();
  assert.equal(contentCopy.classList.contains('is-collapsed'), true);
  assert.equal(contentExpand.textContent, '展开全部');
  click('[data-log-reset]');
  const expand = find('[data-log-expand]');
  expand.click();
  assert.equal(expand.getAttribute('aria-expanded'), 'true');
  assert.equal(expand.textContent, '收起全部');
  assert.equal(d.getElementById(expand.getAttribute('aria-controls')).classList.contains('is-collapsed'), false);
  expand.click();
  assert.equal(expand.getAttribute('aria-expanded'), 'false');
  assert.equal(expand.textContent, '展开全部');
  set('module', '资讯中心');
  click('[data-log-export]');
  assert.match(download, /^操作日志_模拟数据_.*\.xlsx$/);
  assert.match(text('.gaip-log-feedback'), /已生成 13 条/);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const view = new DataView(bytes.buffer);
  assert.equal(view.getUint32(0, true), 0x04034b50);
  const files = new Map();
  let offset = 0;
  while (view.getUint32(offset, true) === 0x04034b50) {
    const size = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const start = offset + 30 + nameLength + extraLength;
    const name = new TextDecoder().decode(bytes.slice(offset + 30, offset + 30 + nameLength));
    files.set(name, new TextDecoder().decode(bytes.slice(start, start + size)));
    let crc = 0xffffffff;
    for (const byte of bytes.slice(start, start + size)) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    assert.equal((crc ^ 0xffffffff) >>> 0, view.getUint32(offset + 14, true));
    offset = start + size;
  }
  assert.equal(files.size, 6);
  for (const [name, xml] of files) {
    const parsed = new w.DOMParser().parseFromString(xml, 'application/xml');
    assert.equal(parsed.querySelector('parsererror'), null, name);
  }
  const sheet = new w.DOMParser().parseFromString(files.get('xl/worksheets/sheet1.xml'), 'application/xml');
  assert.equal(sheet.querySelectorAll('row').length, 14); // Header + all 13 matching records.
  assert.equal(sheet.querySelectorAll('f').length, 0);
  assert.equal(sheet.querySelectorAll('c').length, 14 * 8);
  assert.equal(sheet.querySelector('autoFilter').getAttribute('ref'), 'A1:H14');
  assert.equal(sheet.querySelector('row[r="2"] c[r="D2"]').textContent, '资讯中心');
  assert.ok(files.get('xl/worksheets/sheet1.xml').includes('查看：查看原文/查看详情'));
  assert.ok(files.get('xl/worksheets/sheet1.xml').includes('资讯标题：全球市场周报：汇率变化与资产配置观察'));
  assert.ok(files.get('xl/worksheets/sheet1.xml').includes('原文链接：https://example.com/market-weekly'));
  assert.ok(files.get('xl/worksheets/sheet1.xml').includes('资讯日期：2026-08-31'));
  assert.ok(!files.get('xl/worksheets/sheet1.xml').includes('并非真实新闻或投资建议'));
  click('[data-log-close]');
  assert.equal(find('dialog').open, false);
  assert.equal(d.documentElement.classList.contains('gaip-log-scroll-lock'), false);
  assert.equal(find('#retained-value').value, '未提交内容');
  w.__GAIP_OPERATION_LOG__.show();
  assert.equal(find('[name="module"]').value, '资讯中心');
  const cancel = new w.Event('cancel', { cancelable: true });
  find('dialog').dispatchEvent(cancel);
  assert.equal(find('dialog').open, false);
  assert.equal(cancel.defaultPrevented, true);
  // Global header stays free of log triggers across Hash changes and header replacements.
  for (const route of ['#/customer', '#/policy', '#/workspace?gaip-channel=learning']) {
    w.location.hash = route;
    await tick();
    assert.equal(find('#root'), originalRoot);
    assert.equal(d.querySelectorAll('.gaip-log-trigger').length, 0);
    w.__GAIP_OPERATION_LOG__.show();
    assert.equal(find('dialog').open, true);
    click('[data-log-close]');
  }
  const header = find('.right___fv3yS');
  header.innerHTML = '<span class="date___mF83s">日期</span><div class="userInfo___Kwuov">用户</div>';
  await tick();
  assert.equal(d.querySelectorAll('.gaip-log-trigger').length, 0);
  w.location.hash = '#/user/login';
  await tick();
  assert.equal(find('.gaip-log-trigger'), null);
  w.location.hash = '#/workspace';
  await tick();
  assert.equal(d.querySelectorAll('.gaip-log-trigger').length, 0);
  w.__GAIP_OPERATION_LOG__.show();
  // A mounted page and the existing modal must have independent filters and IDs.
  const host = d.createElement('main');
  d.body.appendChild(host);
  const inline = w.__GAIP_OPERATION_LOG__.mount(host);
  assert.equal(host.querySelector('dialog'), null);
  assert.equal(host.querySelector('[data-log-close]'), null);
  assert.equal(host.querySelectorAll('tbody tr').length, 10);
  const modalModuleBefore = find('dialog [name="module"]').value;
  const pageModule = host.querySelector('[name="module"]');
  pageModule.value = '资讯中心';
  pageModule.dispatchEvent(new w.Event('input', { bubbles: true }));
  assert.ok([...host.querySelectorAll('tbody tr')].every(row => row.children[3].textContent === '资讯中心'));
  assert.equal(find('dialog [name="module"]').value, modalModuleBefore);
  const ids = [...d.querySelectorAll('[id]')].map(node => node.id);
  assert.equal(new Set(ids).size, ids.length, 'modal/page IDs must be unique');
  assert.equal(host.querySelector('label').htmlFor, host.querySelector('[name="start"]').id);
  const pageExpand = host.querySelector('[data-log-expand]');
  if (pageExpand) {
    pageExpand.click();
    assert.equal(pageExpand.getAttribute('aria-expanded'), 'true');
    assert.equal(d.getElementById(pageExpand.getAttribute('aria-controls')).classList.contains('is-collapsed'), false);
  }
  inline.destroy();
  assert.equal(host.children.length, 0);
  assert.equal(find('dialog').open, true, 'destroying page must preserve modal');
  host.remove();
  click('[data-log-close]');
  header.remove();
  await tick();
  // Root shells all load exactly one copy in the correct data/export/UI order.
  for (const entry of fs.readdirSync(root).filter(file => file.endsWith('.html') && file !== 'index-login-video-test.html')) {
    const source = read(entry);
    assert.ok(source.includes('global-operation-log.css?v=20260903-1'), entry + ': latest inline log CSS');
    assert.ok(source.includes('operation-log-mock.js?v=20260903-2'), entry + ': latest inline log mock');
    assert.ok(source.includes('global-operation-log.js?v=20260903-2'), entry + ': top trigger removed');
    let previous = -1;
    for (const resource of ['shared/styles/global-operation-log.css', ...loaded]) {
      assert.equal(source.split(resource).length - 1, 1, entry + ': ' + resource);
      assert.ok(fs.existsSync(path.join(root, resource)));
      assert.ok(source.indexOf(resource) > previous, entry);
      previous = source.indexOf(resource);
    }
  }
  // No network APIs, persistence, or full-page navigation in the feature.
  for (const file of loaded) {
    assert.doesNotMatch(read(file), /\bfetch\s*\(|XMLHttpRequest|localStorage|location\.(href|assign|replace)\s*[=(]/);
    new vm.Script(read(file), { filename: file });
  }
  observers.forEach(observer => observer.disconnect());
  await tick();
  w.close();
  console.log('PASS: no global trigger, retained log controller/page, filters, XLSX, lifecycle and all root shells.');
  console.log('NOT VERIFIED: native dialog focus/top-layer, actual Umi transitions and browser visual layout.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
