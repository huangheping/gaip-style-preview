// Actual read-only React source, isolated services. DOM tests, not pixel QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
async function main() {
  const errors = [], requests = [];
  let dictionaryData = {};
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { if (!/getComputedStyle.*pseudoElt/.test(e.message)) errors.push(e.message); });
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://gaip.test/#/clues', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window, d = w.document, tick = () => new Promise(r => w.setTimeout(r, 35));
  w.matchMedia = () => ({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  w.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} };
  const computed = w.getComputedStyle.bind(w); w.getComputedStyle = el => computed(el);
  try {
    const runtime = read('web/umi.0b0663b5.js'), boot = runtime.indexOf('var __webpack_exports__={};');
    assert.ok(boot > 0);
    w.eval(runtime.slice(0, boot) + 'window.__req=__webpack_require__;})();');
    for (const name of fs.readdirSync(path.join(root,'web')).filter(n=>n.endsWith('.async.js'))) w.eval(read('web/'+name));
    const req = w.__req, original = req.m[92237].toString();
    assert.ok(original.includes('return Ll'));
    req.m[92237] = w.eval('(' + original.replace('return Ll','return En') + ')');
    req.m[92016] = module => { module.exports = {
      useModel: () => ({dictionaryData}),
      request: async (url, options) => { requests.push({url, options}); return {code:'20000',data:{}}; }
    }; };
    req.m[49704] = module => { module.exports = { Wi: async () => ({code:'20000',data:{filePath:'local-test.png',fileStorageId:'test'}}) }; };
    const React = req(67294), ReactDOM = req(73935), Terminal = req(92237).default;
    w.eval(read('shared/scripts/global-modal.js')); w.eval(read('shared/scripts/global-date-picker.js')); w.eval(read('shared/scripts/modal-controls.js'));
    const api = w.__GAIP_MODAL_CONTROLS__;
    for (const variant of ['converted','closed','closed-empty-options']) {
      const mode = variant === 'converted' ? 'converted' : 'closed';
      const before = requests.length;
      dictionaryData = variant === 'closed-empty-options' ? {gaipClueCloseReason:{}} : {};
      let successes=0, closes=0;
      const props={open:true,mode,lead:{clueCode:'test',contactName:'测试客户',version:1},onClose:()=>closes++,onSuccess:()=>successes++};
      ReactDOM.render(React.createElement(Terminal, props),d.querySelector('#root'));
      await tick(); await tick();
      const dialog=d.querySelector('.ant-modal'), area=dialog.querySelector('textarea'), parent=area.parentElement;
      w.__GAIP_MODAL_COMPONENT__.adoptForm(dialog); api.scan();
      const save=dialog.querySelector('.btnConvert___P7Srn, .btnClose___llxYq');
      const messages=()=>[...dialog.querySelectorAll('[data-gaip-modal-part="field-error"]')];
      assert.equal(messages().length,mode==='closed'?3:2);
      assert.ok(messages().every(n=>n.hidden));
      save.click(); await tick();
      assert.equal(requests.length, before, 'invalid attempt never reaches business request');
      if (variant === 'closed-empty-options') {
        assert.equal(d.activeElement, dialog.querySelector('.sel___BcaOJ input'), 'missing reason receives first-error focus');
        assert.equal(messages().filter(n=>!n.hidden).length,3);
        dictionaryData = {gaipClueCloseReason:{OTHER:'其他原因'}};
        ReactDOM.render(React.createElement(Terminal, props),d.querySelector('#root'));await tick();await tick();
        assert.ok(messages()[0].hidden,'real option/default update clears the reason error');
      } else assert.equal(d.activeElement,area,'first empty field receives focus');
      assert.equal(dialog.querySelector('.errorBar___Y__NS'),null,'no duplicate bottom error bar');
      assert.equal(messages().filter(n=>!n.hidden).length,2,'description and evidence errors shown together');
      const set=Object.getOwnPropertyDescriptor(w.HTMLTextAreaElement.prototype,'value').set;
      set.call(area,'补充说明');area.dispatchEvent(new w.Event('input',{bubbles:true}));await tick();
      assert.equal(area.parentElement,parent,'React textarea is not moved');
      assert.equal(messages().filter(n=>!n.hidden).length,1,'correcting text preserves evidence error');
      const input=dialog.querySelector('input[type="file"]');
      Object.defineProperty(input,'files',{configurable:true,value:Array.from({length:4},(_,i)=>new w.File(['test'],'test'+i+'.png',{type:'image/png'}))});
      input.dispatchEvent(new w.Event('change',{bubbles:true}));await tick();await tick();
      assert.equal(dialog.querySelectorAll('.previewItem___ARNp7').length,4);
      assert.ok(messages().every(n=>n.hidden),'original file reader update clears evidence error');
      for(let i=0;i<4;i++){dialog.querySelector('.removeIcon___A9kHf').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));await tick();}
      save.click();await tick();
      assert.equal(d.activeElement,dialog.querySelector('.uploadBtn___WBpgy').closest('.field___liuLu'),'evidence focus survives upload button replacement');
      const again=dialog.querySelector('input[type="file"]');
      Object.defineProperty(again,'files',{configurable:true,value:[new w.File(['test'],'ok.png',{type:'image/png'})]});
      again.dispatchEvent(new w.Event('change',{bubbles:true}));await tick();await tick();
      save.click();await tick();await tick();
      assert.equal(successes,1,'valid attempt delegates original submit once');
      assert.equal(requests.length,before+1);
      dialog.querySelector('.btnCancel___JnnA7').click();await tick();assert.equal(closes,1);
      ReactDOM.unmountComponentAtNode(d.querySelector('#root'));await tick();
      assert.equal(d.querySelector('[data-gaip-modal-part="field-error"]'),null);
      console.log('PASS: 20 '+variant+' real source: inline required feedback, correction, upload/remove/re-add, focus, valid original submit and unmount');
    }
    assert.deepEqual(errors,[]);
  } finally { w.__GAIP_MODAL_CONTROLS__?.destroy(); w.close(); }
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
