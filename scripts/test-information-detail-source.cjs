// Source-component DOM contracts only. JSDOM does not verify visual geometry.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..'), read = f => fs.readFileSync(path.join(root, f), 'utf8');
async function main() {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://gaip.test/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
  const w = dom.window, d = w.document, tick = () => new Promise(r => w.setTimeout(r, 80));
  try {
    w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
    w.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
    const computed = w.getComputedStyle.bind(w); w.getComputedStyle = el => computed(el);
    w.eval(read('shared/assets/icons/local-icons.generated.js'));
    const runtime = read('shared/runtime/umi.0b0663b5.js'), boot = runtime.indexOf('var __webpack_exports__={};');
    assert.ok(boot > 0); w.eval(runtime.slice(0, boot) + 'window.req=__webpack_require__;})();');
    for (const f of fs.readdirSync(path.join(root, 'web')).filter(f => f.endsWith('.async.js'))) w.eval(read('web/' + f));
    const req = w.req;
    let rows = [];
    req.m[92016] = module => { module.exports = { useModel: () => ({ dictionaryData: {} }), useRequest: (service, options = {}) => ({
      loading: false, data: [], run: () => { options.onSuccess?.(rows); return Promise.resolve(rows); }
    }) }; };
    w.eval(read('shared/scripts/html-view.js'));
    for (const f of ['channels/activity/page.js', 'channels/product/page.js']) {
      const chunks = w.webpackChunk; w.webpackChunk = { push: entry => Object.assign(req.m, entry[1]) };
      try { w.eval(read(f)); } finally { w.webpackChunk = chunks; }
    }
    const source = req.m[38957].toString(); assert.ok(source.includes('return ut'));
    req.m[38957] = w.eval('(' + source.replace('return ut', 'return {Records:Oa}') + ')');
    const React = req(67294), ReactDOM = req(73935), Records = req(38957).default.Records;
    for (const f of ['components/modal/global-modal.js', 'components/table/global-table.js']) w.eval(read(f));
    const longName = '全球资产配置与财富传承活动'.repeat(30);
    for (const count of [0, 1, 50, 200, 1]) {
      ReactDOM.unmountComponentAtNode(d.querySelector('#root'));
      rows = Array.from({ length: count }, (_, i) => ({ createdDt: '2026-09-29 12:00', activityName: i === 0 ? longName : '活动 ' + i, name: '' }));
      ReactDOM.render(React.createElement(Records, { open: true, setOpen() {} }), d.querySelector('#root'));
      await tick(); await tick();
      const modal = d.querySelector('.gaip-signup-record-dialog.gaip-info-modal'); assert.ok(modal);
      assert.equal(modal.dataset.gaipInfoVariant, 'table');
      assert.equal(modal.querySelectorAll('.gaip-table__scroll tbody tr').length, count || 1, 'empty state occupies one table row');
      if (!count) assert.ok(modal.querySelector('.gaip-table__empty'));
      assert.equal(modal.querySelectorAll('.gaip-table__pagination').length, 0);
      assert.equal(modal.querySelectorAll('.gaip-table__head th').length, 3);
      assert.ok(modal.querySelector(':scope > div > .gaip-info__surface > .gaip-info__body .gaip-table__scroll'));
      if (count) {
        assert.equal(modal.querySelectorAll('.gaip-table__scroll tbody tr:first-child td')[1].textContent, longName);
        const cols = modal.querySelectorAll('.gaip-table__scroll col');
        assert.equal(cols[1].style.width, '', 'activity name takes remaining width');
      }
      console.log('PASS 28 actual source DOM: ' + count + ' records, full names, no pagination');
    }
    ReactDOM.unmountComponentAtNode(d.querySelector('#root'));
    // Mount the actual product page, then use its own entry and state binding.
    ReactDOM.render(React.createElement(req(86588).default), d.querySelector('#root'));
    await tick();
    const entry = d.querySelector('.contactExpertBtn___kvnrO');
    assert.ok(entry, 'actual product entry'); entry.click(); await tick(); await tick();
    const expert = d.querySelector('.expertModal___Umr7b.gaip-info-modal'); assert.ok(expert);
    assert.equal(expert.dataset.gaipInfoVariant, 'experts');
    const wrapper = [...expert.children].find(el => [...el.children].some(child => child.classList.contains('gaip-info__surface')));
    assert.ok(wrapper, expert.outerHTML.slice(0, 1800));
    assert.ok(wrapper.querySelector('.gaip-info__body.gaip-product-expert-body'));
    assert.ok(wrapper.querySelector('.expertDockList___b2p5o'));
    assert.ok([...expert.children].some(el => el !== wrapper), 'focus sentinel remains separate');
    const css = read('components/modal/global-modal.css');
    assert.match(css, /variant="experts"\] > div:has\(> \.gaip-info__surface\)\s*\{[^}]*height: 100%;[^}]*min-height: 0/s);
    assert.match(css, /variant="experts"\] \.gaip-info__body\s*\{[^}]*flex: 1 1 0;[^}]*overflow: auto/s);
    assert.match(css, /variant="experts"\] \.gaip-info__body\s*\{[^}]*margin-right: calc\(-1 \* var\(--gaip-modal-space\)\) !important;[^}]*padding-right: var\(--gaip-modal-space\) !important/s);
    assert.match(css, /variant="experts"\] \.contentPlaceholder___XqavN\s*\{[^}]*min-width: 0 !important;[^}]*overflow: visible !important/s);
    assert.match(css, /variant="experts"\] \.expertDockIcon___I57ZG\s*\{ top: 0 !important; \}/);
    assert.ok(expert.querySelector('.contentPlaceholder___XqavN .expertDockIcon___I57ZG'), 'clipping correction targets actual source icons');
    assert.match(css, /\.ant-modal\.gaip-info-modal\[data-gaip-info-variant="table"\]\s*\{[^}]*height: auto !important;[^}]*max-height: min\(800px/s);
    expert.querySelector('.gaip-modal__close').click(); await tick();
    console.log('PASS 30 actual product entry, Ant focus wrapper, source expert content and shared scroll CSS contract');
    ReactDOM.unmountComponentAtNode(d.querySelector('#root'));
    w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
    w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
    for (const f of ['components/multi-select/global-multi-select.js', 'components/filter-bar/global-filter-bar.js', 'shared/scripts/organization-store.js', 'channels/learning-center/learning-data.js', 'channels/learning-center/learning-app.js']) {
      Object.defineProperty(d, 'currentScript', { configurable: true, value: { src: 'https://gaip.test/' + f } });
      w.eval(read(f));
    }
    const D = w.__GAIP_LEARNING_DATA__, A = w.__GAIP_LEARNING_APP__;
    // CSS cascade check only; JSDOM does not measure the rendered text position.
    const tableStyle = d.createElement('style'); tableStyle.textContent = read('components/table/global-table.css'); d.head.appendChild(tableStyle);
    const reference = d.createElement('section'); d.body.appendChild(reference);
    const referenceTable = w.__GAIP_TABLE__.mount(reference, { columns: [{ key: 'name', label: '名称' }], rows: [] });
    const referenceEmpty = w.getComputedStyle(reference.querySelector('.gaip-table__empty'));
    assert.equal(referenceEmpty.verticalAlign, 'middle'); assert.equal(referenceEmpty.textAlign, 'center');
    for (const count of [0, 1, 25]) {
      D.state().logs = [];
      for (let i = 0; i < count; i++) D.log('导出学情', null, '学情长记录 ' + i + '内容'.repeat(150));
      const snapshot = JSON.stringify(D.state());
      const dialog = A.openStudyLog(); await tick();
      assert.equal(dialog.dataset.gaipModalId, 'learning-study-log');
      const table = w.__GAIP_TABLE__.get(dialog.querySelector('.gaip-table'));
      assert.equal(table.getState().total, count);
      assert.equal(dialog.querySelectorAll('tbody tr').length, Math.max(1, Math.min(10, count)));
      assert.ok(dialog.querySelector('.gaip-table__pagination'), '46 keeps its existing pagination');
      if (count > 10) { table.setPage(2); assert.equal(table.getState().page, 2); }
      const search = dialog.querySelector('input[type="search"]');
      search.value = '__no_match__'; search.dispatchEvent(new w.Event('input', { bubbles: true }));
      await new Promise(r => w.setTimeout(r, 300)); // shared search debounce is 250ms
      assert.equal(table.getState().total, 0, '46 filtering still works');
      const emptyStyle = w.getComputedStyle(dialog.querySelector('.gaip-table__empty'));
      assert.equal(emptyStyle.verticalAlign, referenceEmpty.verticalAlign, '46 empty uses preview alignment');
      assert.equal(emptyStyle.textAlign, referenceEmpty.textAlign, '46 empty shares horizontal alignment');
      for (const state of ['loading', 'error']) {
        table.setState(state);
        const statusStyle = w.getComputedStyle(dialog.querySelector('.gaip-table__empty'));
        assert.equal(statusStyle.verticalAlign, 'middle', state + ' stays centered');
        assert.equal(statusStyle.textAlign, 'center', state + ' shares horizontal alignment');
      }
      table.setState('ready');
      dialog.querySelector('[data-gaip-filter-action="reset"]').click(); await tick();
      assert.equal(table.getState().total, count, '46 reset restores rows');
      if (count) assert.equal(w.getComputedStyle(dialog.querySelector('tbody td')).verticalAlign, 'top', '46 populated rows stay top-aligned');
      dialog.querySelector('[data-log-close]').click();
      assert.equal(dialog.isConnected, false, '46 original close destroys dialog');
      assert.equal(JSON.stringify(D.state()), snapshot, 'view/filter/page/close do not change source data');
      console.log('PASS 46 actual source: ' + count + ' records, filter/reset, pagination, close/reopen');
    }
    referenceTable.destroy(); reference.remove(); tableStyle.remove();
    assert.match(css, /\.gaip-modal\.gaip-info-modal\[data-gaip-modal-id="learning-study-log"\]\s*\{[^}]*height: auto !important;[^}]*max-height: min\(800px/s);
    assert.match(read('channels/learning-center/learning-app.js'), /boundary: study \? undefined : dialog.querySelector\('\.lc-course-log-body'\)/);
    console.log('NOT VERIFIED: pixel geometry, scroll reachability and visual appearance (no browser execution).');
  } finally { w.close(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
