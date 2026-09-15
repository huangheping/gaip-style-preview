// Render the actual read-only customer bundle with its bundled React/Ant.
// Only app boot and backend/model dependencies are isolated in memory.
// This is source-component DOM testing, NOT browser layout/hit-testing.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
async function main() {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', error => { if (!/getComputedStyle.*pseudoElt/.test(error.message)) errors.push(error.message); });
  const dom = new JSDOM('<body><div id="root"></div></body>', { url: 'https://gaip.test/#/customer', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window, d = w.document, tick = () => new Promise(r => w.setTimeout(r, 30));
  w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  w.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  const computed = w.getComputedStyle.bind(w); w.getComputedStyle = el => computed(el);
  try {
    const runtime = read('web/umi.0b0663b5.js');
    const boot = runtime.indexOf('var __webpack_exports__={};');
    assert.ok(boot > 0, 'update harness when source runtime changes');
    w.eval(runtime.slice(0, boot) + 'window.__sourceRequire=__webpack_require__;})();');
    for (const name of fs.readdirSync(path.join(root, 'web')).filter(n => n.endsWith('.async.js'))) w.eval(read('web/' + name));
    const req = w.__sourceRequire;
    const original = req.m[25021].toString();
    assert.ok(original.includes('return yn'));
    req.m[25021] = w.eval('(' + original.replace('return yn', 'return {Intro:vt,Meeting:_a}') + ')');
    req.m[92016] = module => { module.exports = {
      useModel: () => ({ dictionaryData: {} }),
      useRequest: (service, opts = {}) => ({ loading: false, run: (...args) => { opts.onSuccess?.({}); }, data: [] })
    }; };
    const React = req(67294), ReactDOM = req(73935), source = req(25021).default;
    assert.ok(source.Intro && source.Meeting);
    w.eval(read('shared/scripts/global-modal.js')); w.eval(read('shared/scripts/global-date-picker.js')); w.eval(read('shared/scripts/modal-controls.js'));
    for (const [name, Component, props] of [
      ['23', source.Intro, { detail: { bio: '来源正文', name: '', phone: '' }, onClose() {}, onSuccess() {} }],
      ['24', source.Meeting, { initialData: { communicationSummary: '来源纪要' }, onClose() {}, onSave() {}, saving: false }]
    ]) {
      ReactDOM.render(React.createElement(Component, { ...props, open: true }), d.querySelector('#root'));
      await tick(); await tick();
      const dialog = d.querySelector(name === '23' ? '.editIntroModal___beZtT' : '.modal___wKSui');
      assert.ok(dialog, name + ' real source modal rendered');
      w.__GAIP_MODAL_COMPONENT__.scanForms(dialog); w.__GAIP_MODAL_CONTROLS__.scan();
      const area = dialog.querySelector('textarea');
      assert.ok(area, name + ' real Ant textarea rendered');
      const shell = area.closest('.gaip-kit-counted');
      assert.ok(shell, name + ' count shell adopted');
      assert.equal(shell.querySelectorAll('.gaip-mc-resize-handle').length, 1);
      assert.equal(area.maxLength, name === '23' ? 500 : 5000);
      assert.ok(dialog.querySelector('.gaip-modal__form-footer--standard'));
      const count = shell.querySelector('.gaip-kit-count'), handle = shell.querySelector('.gaip-mc-resize-handle');
      const originalParent = area.parentElement, setValue = Object.getOwnPropertyDescriptor(w.HTMLTextAreaElement.prototype, 'value').set;
      if (name === '24') {
        const item = area.closest('.ant-form-item');
        const control = item.querySelector('.ant-form-item-control');
        assert.ok(control.classList.contains('gaip-form-feedback-ant'), 'actual Ant control reserves feedback before validation');
        assert.ok(item.classList.contains('gaip-form-feedback-field'));
        const parent = control.parentNode;
        setValue.call(area, ''); area.dispatchEvent(new w.Event('input', { bubbles: true }));
        await tick(); await tick(); await tick(); await tick();
        assert.ok(control.querySelector('.ant-form-item-explain-error'), 'actual Ant validation creates original error');
        assert.ok(control.querySelector(':scope > .ant-form-item-additional'), 'Ant error occupies its original additional block');
        assert.equal(control.parentNode, parent, 'shared layer never wraps or moves React control');
        assert.equal(item.querySelectorAll('.gaip-form-feedback-ant').length, 1);
        setValue.call(area, '已修正的纪要'); area.dispatchEvent(new w.Event('input', { bubbles: true }));
        await tick(); await tick(); await tick(); await tick();
        assert.equal(control.querySelector('.ant-form-item-explain-error'), null, 'original Ant validation clears the error');
        assert.ok(control.classList.contains('gaip-form-feedback-ant'), 'empty-state reservation survives React validation updates');
      }
      for (const value of ['', '短正文', '长'.repeat(area.maxLength)]) {
        setValue.call(area, value); area.dispatchEvent(new w.Event('input', { bubbles: true })); await tick();
        assert.equal(area.value, value);
        assert.ok(count.textContent.replace(/\s/g, '').startsWith(value.length + '/'), name + ' actual React onChange updates original counter');
        assert.equal(area.parentElement, originalParent);
        assert.equal(shell.querySelectorAll('.gaip-mc-resize-handle').length, 1, 'React rerender retains one handle');
      }
      // DOM has no geometry; explicitly mocked boxes test the drag calculation.
      area.style.height = '200px';
      Object.defineProperty(area, 'offsetHeight', { configurable: true, get: () => parseFloat(area.style.height) });
      area.getBoundingClientRect = () => ({ height: area.offsetHeight });
      handle.dispatchEvent(new w.MouseEvent('pointerdown', { button: 0, clientY: 100, bubbles: true }));
      w.dispatchEvent(new w.MouseEvent('pointermove', { clientY: 160 })); w.dispatchEvent(new w.MouseEvent('pointerup', { clientY: 160 }));
      assert.equal(area.style.height, '260px');
      assert.equal(area.value.length, area.maxLength); assert.equal(count.parentElement.contains(area), false, 'counter does not contain textarea');
      let closes = 0;
      ReactDOM.render(React.createElement(Component, { ...props, open: true, onClose: () => closes++ }), d.querySelector('#root')); await tick();
      dialog.querySelector('.gaip-modal__close').click(); await tick(); assert.equal(closes, 1, 'shared close delegates actual source callback once');
      if (name === '24') {
        ReactDOM.render(React.createElement(Component, { ...props, open: true, saving: true }), d.querySelector('#root')); await tick();
        assert.ok(dialog.querySelector('.gaip-modal__button--primary').disabled, 'actual source saving state is preserved');
      }
      ReactDOM.unmountComponentAtNode(d.querySelector('#root')); await tick();
      assert.equal(d.querySelector('.gaip-mc-resize-handle'), null);
      ReactDOM.render(React.createElement(Component, { ...props, open: true }), d.querySelector('#root')); await tick(); await tick();
      assert.equal(d.querySelectorAll('.gaip-mc-resize-handle').length, 1, 'actual source remount adopts once');
      ReactDOM.unmountComponentAtNode(d.querySelector('#root')); await tick();
      console.log(`PASS: ${name} actual customer + Ant source: empty/short/limit input and counters, drag calculation, shared footer/close, saving, unmount/reopen (DOM only)`);
    }
    assert.deepEqual(errors, [], 'no unhandled source rendering errors');
  } finally { w.__GAIP_MODAL_CONTROLS__?.destroy(); w.close(); }
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
