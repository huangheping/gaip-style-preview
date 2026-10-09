// Real source components and current runtime. Owned callers must close without
// any synthetic animation/transition completion. JSDOM does not hit-test pixels.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..'), read = f => fs.readFileSync(path.join(root, f), 'utf8');

async function run(legacy) {
  const dom = new JSDOM('<button id="underlying">底层入口</button><div id="root"></div>', {
    url: 'https://gaip.test/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: new VirtualConsole()
  });
  const w = dom.window, d = w.document, tick = ms => new Promise(resolve => w.setTimeout(resolve, ms || 100));
  try {
    w.AnimationEvent = w.Event; w.TransitionEvent = w.Event;
    w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
    w.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
    w.scrollTo = () => {};
    const computed = w.getComputedStyle.bind(w); w.getComputedStyle = el => computed(el);
    w.eval(read('shared/assets/icons/local-icons.generated.js'));
    const runtime = read('shared/runtime/umi.0b0663b5.js'), boot = runtime.indexOf('var __webpack_exports__={};');
    assert.ok(boot > 0); w.eval(runtime.slice(0, boot) + 'window.req=__webpack_require__;})();');
    for (const f of fs.readdirSync(path.join(root, 'web')).filter(f => f.endsWith('.async.js'))) w.eval(read('web/' + f));
    const req = w.req, React = req(67294), ReactDOM = req(73935);
    const product = { productCode: 'test', productType: 'insurance', productNameCn: '关闭回归产品', productRegion: 'HK',
      provider: '测试', customerProfile: [], attachments: [], productShowDetail: '<p>产品详情</p>' };
    let requests = 0;
    let deferResponse = false, pendingResponse;
    const noop = () => Promise.resolve([]);
    req.m[92016] = module => { module.exports = {
      useModel: () => ({ dictionaryData: {} }),
      useRequest: (service, options = {}) => ({ loading: false, data: options.manual ? undefined : { pageData: { list: [product] } },
        run: options.onSuccess ? () => { requests++; if (deferResponse) { pendingResponse = () => options.onSuccess(product); }
          else options.onSuccess(product); return Promise.resolve(product); } : noop })
    }; };
    w.eval(read('shared/scripts/html-view.js'));
    for (const f of ['channels/activity/page.js', 'channels/product/page.js', 'channels/induction/page.js']) {
      const chunks = w.webpackChunk; w.webpackChunk = { push: entry => Object.assign(req.m, entry[1]) };
      try {
        const source = read(f);
        // Negative control restores the previous source's dependence on CSS
        // completion; the corrected callers must not need an end-event model.
        w.eval(legacy ? source.replaceAll("transitionName: '',", '').replaceAll("maskTransitionName: '',", '') : source);
      } finally { w.webpackChunk = chunks; }
    }
    // Expose the unchanged source component functions only inside this harness.
    req.m[38957] = w.eval('(' + req.m[38957].toString().replace('return ut', 'return Oa') + ')');
    req.m[89290] = w.eval('(' + req.m[89290].toString().replace('return Ne', 'return Ce') + ')');
    for (const f of ['components/modal/global-modal.js', 'components/modal/global-modal-position.js', 'components/table/global-table.js', 'components/tabs/global-tabs.js']) w.eval(read(f));
    const style = d.createElement('style'); style.textContent = read('channels/product/page.css') + '\n' + read('components/modal/global-modal.css') + '\n' + read('components/tabs/global-tabs.css');
    if (legacy) style.textContent += '\n.ant-modal.gaip-info-modal { animation: none !important; }';
    d.head.appendChild(style);

    // Deliberately NO animationend/transitionend dispatch and no motion shim.
    let underlyingClicks = 0; d.querySelector('#underlying').onclick = () => underlyingClicks++;
    function isClosed(el) { return !el.isConnected || el.closest('.ant-modal-wrap').style.display === 'none'; }
    async function closed(el, label) {
      const deadline = Date.now() + 2500;
      while (!isClosed(el) && Date.now() < deadline) await tick(80);
      await tick(100);
      assert.ok(isClosed(el), label + ': original wrapper must hide or unmount');
      assert.equal(d.querySelectorAll('.ant-modal-mask').length, 0, label + ': mask must be removed');
      d.querySelector('#underlying').click(); assert.ok(underlyingClicks > 0);
      await tick(); assert.ok(isClosed(el), label + ': must not reopen after underlying click');
    }
    function mountProduct() { ReactDOM.render(React.createElement(req(86588).default), d.querySelector('#root')); }
    mountProduct(); await tick();
    const card = d.querySelector('.productCard___AMkTa'); assert.ok(card);
    for (let cycle = 0; cycle < (legacy ? 1 : 2); cycle++) {
      card.click(); await tick(250);
      const modal = d.querySelector('.productModal___bp0hy'); assert.ok(modal);
      if (!legacy) {
        const tabs = modal.querySelector('.tabList___YJKIv');
        // The adapter is scheduled through MutationObserver + rAF; a fixed
        // 250ms sleep can expire under the full suite's CPU load.
        const adoptionDeadline = Date.now() + 2500;
        while (!w.__GAIP_TABS__.get(tabs) && Date.now() < adoptionDeadline) await tick(40);
        assert.ok(w.__GAIP_TABS__.get(tabs), '29 automatic global Tab adoption: ' + (tabs && tabs.outerHTML.slice(0, 700)));
        assert.equal(tabs.getAttribute('role'), 'tablist');
        const buttons = [...tabs.children]; assert.ok(buttons.length >= 2);
        const selectedStyle = w.getComputedStyle(buttons[0]);
        assert.equal(selectedStyle.fontSize, '16px', '29 global Tab font');
        assert.equal(selectedStyle.height, '64px', '29 global Tab row height');
        assert.equal(selectedStyle.padding, '0px 12px', '29 global Tab padding');
        assert.equal(selectedStyle.fontWeight, '700', '29 global Tab selected weight');
        assert.equal(w.getComputedStyle(buttons[1]).fontWeight, '400');
        buttons[1].click(); await tick();
        assert.equal(buttons[1].getAttribute('aria-selected'), 'true');
        assert.equal(buttons[0].getAttribute('aria-selected'), 'false');
        buttons[1].dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Home', bubbles: true })); await tick();
        assert.equal(buttons[0].getAttribute('aria-selected'), 'true');
        assert.equal(d.activeElement, buttons[0]);
        assert.deepEqual([...tabs.children], buttons, '29 original React buttons stay stable');
        buttons.at(-1).click(); await tick();
        assert.equal(buttons.at(-1).getAttribute('aria-selected'), 'true');
        assert.ok(modal.querySelector('.gaipAttachmentTab'), '29 original attachment panel switch remains');
        console.log('PASS 29 global Tab: auto-adoption, click, keyboard, stable source nodes, attachment panel');
      }
      modal.querySelector('.ant-modal-close').click();
      if (legacy) {
        await tick(350); assert.ok(!isClosed(modal), 'negative control: animation:none must reproduce retained modal');
        assert.ok(modal.className.includes('leave-active')); console.log('PASS negative control: original CSS stalls 29 after close'); return;
      }
      await closed(modal, '29 product card cycle ' + cycle); assert.equal(requests, cycle + 1, 'one request per card click');
    }
    // The real product parent used to reopen the modal in request.onSuccess.
    // A late response after X must not restore either surface or mask.
    deferResponse = true;
    card.click(); await tick(150);
    const loadingModal = d.querySelector('.productModal___bp0hy');
    assert.ok(loadingModal, 'detail opens while request is pending');
    loadingModal.querySelector('.ant-modal-close').click(); await closed(loadingModal, '29 pending request close');
    pendingResponse(); await tick(150);
    assert.ok(isClosed(loadingModal), 'late response must not reopen dismissed product');
    assert.equal(d.querySelectorAll('.ant-modal-mask').length, 0);
    deferResponse = false;
    card.click(); await tick(150);
    const reopened = d.querySelector('.productModal___bp0hy'); assert.ok(reopened);
    reopened.querySelector('.ant-modal-close').click(); await closed(reopened, '29 reopen after late response');
    const entry = d.querySelector('.contactExpertBtn___kvnrO');
    for (const method of ['close', 'Escape', 'backdrop']) {
      entry.click(); await tick(200); const modal = d.querySelector('.expertModal___Umr7b'), wrap = modal.closest('.ant-modal-wrap');
      assert.notEqual(wrap.style.display, 'none');
      if (method === 'close') modal.querySelector('.gaip-modal__close').click();
      if (method === 'Escape') wrap.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, which: 27, bubbles: true }));
      if (method === 'backdrop') { wrap.dispatchEvent(new w.MouseEvent('mousedown', { bubbles: true })); wrap.click(); }
      await closed(modal, '30 ' + method);
    }
    ReactDOM.unmountComponentAtNode(d.querySelector('#root')); await tick();
    for (const [label, Component, selector, extra] of [
      ['27', w.__GAIP_MODAL_COMPONENT__.withoutInformationMotion(req(43150).Z, React, req(21532).ZP), '.detailModal___EYATu', { proposalId: null }],
      ['28', req(38957).default, '.gaip-signup-record-dialog', {}],
      ['31', req(89290).default, '.modal___l2z3p', {}]
    ]) {
      let setOpen, closeCalls = 0;
      function Host() { const [open, setter] = React.useState(false); setOpen = setter;
        const close = () => { closeCalls++; setter(false); };
        return React.createElement(Component, { ...extra, open, onClose: close, setOpen: close }); }
      ReactDOM.render(React.createElement(Host), d.querySelector('#root')); await tick();
      for (let cycle = 0; cycle < 2; cycle++) {
        setOpen(true); await tick(200); const modal = d.querySelector(selector); assert.ok(modal);
        modal.querySelector('.gaip-modal__close').click(); await closed(modal, label + ' cycle ' + cycle);
        assert.equal(closeCalls, cycle + 1, label + ': exactly one close callback per cycle');
      }
      ReactDOM.unmountComponentAtNode(d.querySelector('#root')); await tick();
    }
    console.log('PASS 27–31 real source lifecycle without synthetic end events: close, mask cleanup, reopen; 30 X/Escape/backdrop; 29 late response cannot reopen. Browser hit-testing/focus unverified.');
  } finally { w.close(); }
}
run(true).then(() => run(false)).catch(error => { console.error(error); process.exitCode = 1; });
