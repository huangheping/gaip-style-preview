'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), { JSDOM } = require('jsdom');
(async function () {
  const root = path.resolve(__dirname, '..');
  const dom = new JSDOM('<!doctype html><div id="a"></div><div id="b"></div>', { url:'https://local.example/', runScripts:'outside-only', pretendToBeVisual:true });
  const w = dom.window, el = w.document.querySelector('#a');
  const load = file => w.eval(fs.readFileSync(path.join(root,file),'utf8'));
  load('shared/scripts/organization-store.js');load('shared/scripts/organization-tree.js');load('shared/scripts/global-multi-select.js'); load('shared/scripts/global-date-picker.js'); load('shared/scripts/global-filter-bar.js');
  const F = w.__GAIP_FILTER_BAR__, results = [], wait = () => new Promise(r=>setTimeout(r,30));
  const api = F.mount(el, { debounce:10, fields:[
    {key:'q',type:'search',label:'名称'},
    {key:'status',type:'select',label:'状态',options:[{value:'',label:'全部'},{value:'on',label:'已上架'}]},
    {key:'groups',type:'multiSelect',label:'群组',options:['A','B','C','D'],defaultValue:['A','B','C']},
    {key:'required',type:'switch',label:'必修'},
    {key:'period',type:'dateRange',label:'日期范围',advanced:true},
    {key:'count',type:'numberRange',label:'数量范围',min:0,advanced:true},
    {key:'date',type:'date',label:'日期',visible:false}
  ],onChange:v=>results.push(v) });
  const resetButton = el.querySelector('[data-gaip-filter-action="reset"]');
  assert.equal(resetButton.dataset.active,'false','default values do not mark reset active');
  const q = el.querySelector('[data-filter-key="q"] input');
  q.focus(); q.value='中文'; q.dispatchEvent(new w.Event('compositionstart',{bubbles:true})); q.dispatchEvent(new w.Event('input',{bubbles:true}));
  await wait(); assert.equal(results.length,0,'no search while composing');
  q.dispatchEvent(new w.Event('compositionend',{bubbles:true})); await wait(); assert.equal(results.at(-1).q,'中文'); assert.equal(w.document.activeElement,q); assert.equal(resetButton.dataset.active,'true');
  el.querySelector('.gaip-filter-bar__clear').click(); assert.equal(results.at(-1).q,''); assert.equal(w.document.activeElement,q); assert.equal(resetButton.dataset.active,'false');
  const select=el.querySelector('select'); select.value='on'; select.dispatchEvent(new w.Event('change',{bubbles:true})); assert.equal(results.at(-1).status,'on');
  const toggle=el.querySelector('[role="switch"]'); toggle.click(); assert.equal(results.at(-1).required,true); assert.equal(toggle.getAttribute('aria-checked'),'true');
  assert.equal(el.querySelector('.gaipMultiSelect__overflow').textContent,'+ 1 ...');
  const combo=el.querySelector('.gaipMultiSelect [role="combobox"]'); combo.click(); assert.equal(combo.getAttribute('aria-expanded'),'true');
  const optionD=el.querySelector('[data-value="D"]'); optionD.click(); await wait(); assert.deepEqual(Array.from(results.at(-1).groups),['A','B','C','D']); assert.equal(w.document.activeElement.dataset.value,'D');
  assert.equal(optionD.isConnected,true,'clicked option must survive document event bubbling'); assert.equal(combo.getAttribute('aria-expanded'),'true','multi remains open after choice');
  w.document.activeElement.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true})); assert.equal(combo.getAttribute('aria-expanded'),'false'); assert.equal(w.document.activeElement,combo);
  api.setVisible('groups',false); assert.ok(!('groups' in results.at(-1))); assert.equal(el.querySelector('[data-filter-key="groups"]').hidden,true);
  api.setVisible('groups',true); assert.deepEqual(Array.from(api.getValues().groups),[],'unhide does not restore invisible constraints');
  api.setValue({count:['1','5']}); const more=el.querySelector('[data-gaip-filter-action="more"]'); assert.match(more.textContent,/1 项生效/);
  assert.equal(el.querySelector('[data-filter-key="count"]').hidden,true); more.click(); assert.equal(el.querySelector('[data-filter-key="count"]').hidden,false);
  more.click(); assert.deepEqual(Array.from(api.getValues().count),['1','5'],'advanced collapse keeps active filters');
  const n=results.length; api.setValue({count:['5','1']}); assert.equal(results.length,n,'invalid range must not query'); assert.match(el.textContent,/最小值不能大于/);
  api.setValue({count:['1','5'],period:['2026-09-10','2026-09-01']}); assert.match(el.textContent,/开始日期不能晚于/); assert.equal(results.length,n);
  api.reset(); assert.equal(api.getValues().required,false); assert.deepEqual(Array.from(api.getValues().groups),['A','B','C']); assert.equal(resetButton.dataset.active,'false','reset restores neutral button state');
  api.setDisabled('required',true); assert.equal(toggle.disabled,true); const current=results.length; toggle.click(); assert.equal(results.length,current);
  api.setVisible('q',false); assert.equal(q.closest('[data-filter-key]').hidden,true); assert.ok(!('q' in api.getValues()));
  const single=el.querySelector('[data-filter-key="status"] button[role="combobox"]'); single.click();
  assert.equal(select.hidden,true,'native single-select no longer presented');
  el.querySelector('.gaip-filter-bar__options [data-value="on"]').click();assert.equal(single.getAttribute('aria-expanded'),'false');assert.equal(single.textContent,'已上架');
  api.setVisible('date',true);const date=el.querySelector('[data-filter-key="date"] input[type="text"]');assert.equal(date.placeholder,'年/月/日');
  date.click();assert.ok(el.querySelector('.gaip-filter-bar__calendar:not([hidden])'));
  const day=el.querySelector('.gaip-filter-bar__calendar:not([hidden]) [data-date]:not(:disabled)');const dateValue=day.dataset.date;day.click();assert.equal(api.getValues().date,dateValue);assert.equal(date.value,dateValue.replace(/-/g,'/'));
  el.querySelector('[data-filter-key="date"] .gaip-filter-bar__clear').click();assert.equal(api.getValues().date,'');
  date.click();api.setVisible('date',false);assert.equal(el.querySelector('.gaip-filter-bar__calendar:not([hidden])'),null,'hidden controls close their portal');
  const b=w.document.querySelector('#b'), submitted=[], changes=[];
  const second=F.mount(b,{mode:'submit',fields:[{key:'q',type:'search',label:'名称'}],actions:{reset:false,more:false},onChange:v=>changes.push(v),onSubmit:v=>submitted.push(v)});
  second.setValue({q:'待查询'}); assert.equal(changes.length,0); assert.equal(submitted.length,0); assert.ok(!b.querySelector('[data-gaip-filter-action="reset"]'));
  b.querySelector('[data-gaip-filter-action="submit"]').click(); assert.equal(submitted[0].q,'待查询');
  assert.ok(!('date' in api.getValues()),'instances independent');
  api.setVisible('q',true); q.value='取消延时'; q.dispatchEvent(new w.Event('input',{bubbles:true})); const before=results.length; api.destroy(); await wait(); assert.equal(results.length,before); assert.equal(F.get(el),null); assert.equal(el.children.length,0);
  const again=F.mount(b,{fields:[{key:'x',type:'switch',label:'开关'}],actions:{reset:false}}); assert.equal(b.querySelectorAll('form').length,1,'mount disposes previous instance');
  assert.throws(()=>F.mount(b,{fields:[{key:'bad',type:'unknown'}]}),/受支持/); assert.equal(F.get(b),again,'invalid replacement preserves current instance'); again.destroy();
  assert.throws(()=>F.mount(el,{fields:[{key:'x',type:'search'},{key:'x',type:'date'}]}),/唯一/);
  const stateRoot=w.document.createElement('div');w.document.body.appendChild(stateRoot);
  const stateApi=F.mount(stateRoot,{fields:[
    {key:'q',type:'search',label:'搜索'},
    {key:'status',type:'select',label:'状态',options:[{value:'',label:'全部'},{value:'on',label:'已上架'}]},
    {key:'groups',type:'multiSelect',label:'群组',options:['A','B']},
    {key:'required',type:'switch',label:'必修'},
    {key:'date',type:'date',label:'日期'},
    {key:'period',type:'dateRange',label:'日期范围'},
    {key:'count',type:'numberRange',label:'数字范围'}
  ]});
  const stateReset=stateRoot.querySelector('[data-gaip-filter-action="reset"]');
  for(const patch of [{q:'课程'},{status:'on'},{groups:['A']},{required:true},{date:'2026-09-09'},{period:['2026-09-01','']},{count:['1','5']}]){
    stateApi.setValue(patch,{silent:true});assert.equal(stateReset.dataset.active,'true','each supported filter type activates reset');stateApi.reset();assert.equal(stateReset.dataset.active,'false');
  }
  stateApi.setValue({q:'   '},{silent:true});assert.equal(stateReset.dataset.active,'false','search whitespace is not an effective filter');stateApi.destroy();
  // Real catalog consumes the same component (no duplicate preview implementation).
  w.document.body.innerHTML=fs.readFileSync(path.join(root,'全局组件/index.html'),'utf8').match(/<body>([\s\S]*)<\/body>/)[1];
  load('shared/scripts/global-modal.js'); load('全局组件/components-registry.js'); load('全局组件/components-preview.js');
  assert.ok(w.document.querySelector('[data-gaip-filter-demo] .gaip-filter-bar'));
  assert.equal(w.__GAIP_GLOBAL_COMPONENTS__.filter(x=>x.id==='filter-bar').length,1);
  for(const id of ['ai-content-notice','responsive-multi-select','poster-share','modal-catalog']) assert.ok(w.__GAIP_GLOBAL_COMPONENTS__.some(x=>x.id===id),'existing catalog '+id);
  const check=w.document.querySelector('[data-filter-demo-visible="groups"]'); check.checked=false;check.dispatchEvent(new w.Event('change',{bubbles:true}));
  assert.ok(!('groups' in JSON.parse(w.document.querySelector('[data-gaip-filter-output]').textContent)));
  w.document.querySelectorAll('[data-gaip-filter-demo]').forEach(root=>F.get(root).destroy());
  w.close(); console.log('PASS shared filter bar: IME/debounce, select/multi/switch, hide/reset/advanced, range validation, submit mode, cleanup, real catalog reuse. DOM only.');
})().catch(e=>{console.error(e);process.exitCode=1;});
