(function () {
  'use strict';
  var instances = new WeakMap(), nextId = 0;
  var types = ['search', 'select', 'treeSelect', 'multiSelect', 'switch', 'date', 'dateRange', 'numberRange'];
  function node(tag, className, text) { var n = document.createElement(tag); if (className) n.className = className; if (text != null) n.textContent = text; return n; }
  function copy(v) { return Array.isArray(v) ? v.slice() : v; }
  function empty(f) { return /Range$/.test(f.type) || f.type === 'multiSelect' ? [] : f.type === 'switch' ? false : ''; }
  function active(v) { return Array.isArray(v) ? v.some(function (x) { return x !== '' && x != null; }) : v !== '' && v != null && v !== false; }
  function mount(root, config) {
    if (!root) throw new Error('筛选栏缺少挂载节点');
    config = config || {};
    var fields = (config.fields || []).map(function (f) { return Object.assign({}, f); }), keys = new Set();
    fields.forEach(function (f) { if (!f.key || keys.has(f.key) || !types.includes(f.type)) throw new Error('筛选项 key 必须唯一，且 type 必须受支持'); keys.add(f.key); });
    if (fields.some(function (f) { return f.type === 'multiSelect'; }) && !window.__GAIP_MULTI_SELECT__) throw new Error('请先加载全局折叠式多选组件');
    if (instances.has(root)) instances.get(root).destroy();
    var values = {}, adapters = {}, cleaners = [], timer, destroyed = false, expanded = !!config.expanded;
    var id = 'gaip-filter-' + (++nextId), form = node('form', 'gaip-filter-bar'), grid = node('div', 'gaip-filter-bar__fields'), actions = node('div', 'gaip-filter-bar__actions');
    form.noValidate = true; form.setAttribute('aria-label', config.label || '筛选条件');
    // This component owns its controls, icons and popups, including inside modals.
    // Do not let the generic modal/form adapters enhance its native backing inputs again.
    form.setAttribute('data-gaip-modal-controls', 'exclude');
    form.setAttribute('data-gaip-form-field', 'exclude');
    form.dataset.mode = config.mode === 'submit' ? 'submit' : 'instant';
    root.appendChild(form); form.appendChild(grid); form.appendChild(actions);
    fields.forEach(function (f) { values[f.key] = copy(config.values && Object.prototype.hasOwnProperty.call(config.values, f.key) ? config.values[f.key] : f.defaultValue !== undefined ? f.defaultValue : empty(f)); });
    function isVisible(f) { return typeof f.visible === 'function' ? !!f.visible(Object.assign({}, values)) : f.visible !== false; }
    function isDisabled(f) { return typeof f.disabled === 'function' ? !!f.disabled(Object.assign({}, values)) : !!f.disabled; }
    function normalize(f, v) {
      if(f.type==='treeSelect')return treeNodes(f).some(function(n){return n.id===String(v);})?String(v):'';
      if (f.type === 'select' || f.type === 'multiSelect') {
        var options = (f.options || []).map(function (o) { return String(typeof o === 'string' ? o : o.value); });
        if (f.type === 'select') return options.includes(String(v)) ? String(v) : '';
        return Array.from(new Set((Array.isArray(v) ? v : []).map(String))).filter(function (x) { return options.includes(x); });
      }
      if (f.type === 'switch') return v === true;
      if (/Range$/.test(f.type)) return (Array.isArray(v) ? v.slice(0, 2) : []).map(function (part) { var probe = document.createElement('input'); probe.type = f.type === 'dateRange' ? 'date' : 'number'; probe.value = part == null ? '' : part; return probe.value; });
      if (f.type === 'date') { var probe = document.createElement('input'); probe.type = 'date'; probe.value = v || ''; return probe.value; }
      return v == null ? '' : String(v);
    }
    function treeNodes(f){return typeof f.nodes==='function'?f.nodes():f.nodes||[];}
    function getValues() { var result = {}; fields.forEach(function (f) { if (isVisible(f)) { var v = copy(values[f.key]); result[f.key] = f.type === 'search' ? String(v || '').trim() : v; } }); return result; }
    function resetValue(f) { return normalize(f, f.defaultValue !== undefined ? copy(f.defaultValue) : empty(f)); }
    function comparableValue(f, value) { var result = normalize(f, copy(value)); return f.type === 'search' ? String(result || '').trim() : result; }
    function hasResettableChanges() {
      return fields.some(function (f) {
        return isVisible(f) && JSON.stringify(comparableValue(f, values[f.key])) !== JSON.stringify(comparableValue(f, resetValue(f)));
      });
    }
    function emit(reason) {
      clearTimeout(timer); if (destroyed || !validate()) return;
      var data = getValues();
      if (form.dataset.mode === 'instant' && typeof config.onChange === 'function') config.onChange(data, { reason: reason });
      if (reason === 'submit' && typeof config.onSubmit === 'function') config.onSubmit(data);
      if (reason === 'reset' && typeof config.onReset === 'function') config.onReset(data);
      form.dispatchEvent(new CustomEvent('gaip:filter-change', { bubbles: true, detail: { values: data, reason: reason, mode: form.dataset.mode } }));
    }
    function changed(f, v, wait) {
      if (destroyed) return;
      if (isDisabled(f) || !isVisible(f)) { sync(); return; }
      values[f.key] = copy(v); sync();
      clearTimeout(timer);
      if (wait && form.dataset.mode === 'instant') timer = setTimeout(function () { emit('change'); }, config.debounce == null ? 250 : Math.max(0, config.debounce));
      else emit('change');
    }
    function errorText(f) {
      if (!isVisible(f)) return '';
      var v = values[f.key];
      if (/Range$/.test(f.type) && Array.isArray(v) && v[0] !== '' && v[0] != null && v[1] !== '' && v[1] != null) {
        if (f.type === 'numberRange' ? Number(v[0]) > Number(v[1]) : v[0] > v[1]) return f.type === 'dateRange' ? '开始日期不能晚于结束日期' : '最小值不能大于最大值';
      }
      var a = adapters[f.key];
      if (a && a.inputs.some(function (input) { return input.validity && !input.validity.valid; })) return '请输入有效范围内的值';
      return '';
    }
    function validate(focus) {
      var first;
      fields.forEach(function (f) { var a = adapters[f.key], message = errorText(f); a.error.textContent = message; a.error.hidden = !message; a.inputs.forEach(function (input) { input.setAttribute('aria-invalid', message ? 'true' : 'false'); }); if (message && !first) first = a; });
      if (first && focus) { if (first.field.advanced && !expanded) { expanded = true; sync(); } first.inputs[0].focus(); }
      return !first;
    }
    var moreButton, resetButton, openPopup = null;
    function popup(trigger, className, render, options) {
      options=options||{};
      var panel = node('div', 'gaip-filter-bar__popup ' + className), closeTimer;
      panel.id = id + '-popup-' + cleaners.length; panel.hidden = true;
      panel.setAttribute('popover', 'manual'); form.appendChild(panel);
      trigger.setAttribute('aria-expanded', 'false'); trigger.setAttribute('aria-controls', panel.id);
      function close(focus) {
        if (!panel.hidden && panel.hidePopover && panel.matches(':popover-open')) panel.hidePopover();
        panel.hidden = true; trigger.setAttribute('aria-expanded', 'false');
        if (openPopup === api) openPopup = null;
        if(options.onClose)options.onClose();
        if (focus && trigger.isConnected) trigger.focus();
      }
      function position() {
        if (panel.hidden) return;
        if (trigger.closest('[hidden]')) { close(); return; }
        var r = trigger.getBoundingClientRect(), width = className === 'gaip-filter-bar__calendar' ? window.__GAIP_DATE_PICKER__.width : Math.max(r.width, 200);
        width = Math.min(width, window.innerWidth - 24);
        panel.style.width = width + 'px'; panel.style.maxHeight = Math.max(100, window.innerHeight - 24) + 'px';
        panel.style.left = Math.max(12, Math.min(r.left, window.innerWidth - width - 12)) + 'px';
        var height = panel.getBoundingClientRect().height;
        panel.style.top = Math.max(12, Math.min(r.bottom + 4, window.innerHeight - height - 12)) + 'px';
        if (r.bottom + height + 16 > window.innerHeight && r.top - height - 4 >= 12) panel.style.top = (r.top - height - 4) + 'px';
      }
      function open() {
        if (trigger.disabled || trigger.closest('[hidden], .is-disabled')) return;
        if (!panel.hidden) return;
        if (openPopup && openPopup !== api) openPopup.close();
        Object.keys(adapters).forEach(function (key) { if (adapters[key].field.type === 'multiSelect') adapters[key].close(); });
        openPopup = api; render(panel, close); panel.hidden = false;
        if (panel.showPopover) panel.showPopover();
        trigger.setAttribute('aria-expanded', 'true'); position();
        var first = panel.querySelector('[data-popup-autofocus]') || panel.querySelector('[aria-selected="true"]:not(:disabled), [aria-pressed="true"]:not(:disabled), [aria-current="date"]:not(:disabled)') || panel.querySelector('button:not(:disabled)');
        if (first && !options.editable) first.focus({preventScroll:true});
      }
      trigger.addEventListener('click', function () { if (panel.hidden) open(); else if(!options.editable)close(); });
      trigger.addEventListener('keydown', function (ev) {
        if(ev.isComposing||ev.keyCode===229)return;
        if(options.editable&&ev.key==='Escape'&&!panel.hidden){ev.preventDefault();ev.stopPropagation();close(true);return;}
        if ((options.editable?['ArrowDown','ArrowUp','Enter']:['ArrowDown','ArrowUp','Enter',' ']).includes(ev.key)) {
          ev.preventDefault(); open();
          if(options.editable){var rows=panel.querySelectorAll('[role="treeitem"]');var row=rows[ev.key==='ArrowUp'?rows.length-1:0];if(row)row.focus({preventScroll:true});}
        }
      });
      panel.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); close(true); } });
      function outside(ev) { if (!panel.hidden && !panel.contains(ev.target) && !trigger.contains(ev.target)) close(); }
      function focusOut() { clearTimeout(closeTimer); closeTimer = setTimeout(function () { if (!panel.contains(document.activeElement) && document.activeElement !== trigger) close(); }, 0); }
      panel.addEventListener('focusout', focusOut); trigger.addEventListener('focusout', focusOut);
      document.addEventListener('pointerdown', outside, true);
      window.addEventListener('resize', position); window.addEventListener('scroll', position, true);
      cleaners.push(function () { clearTimeout(closeTimer); close(); panel.remove(); document.removeEventListener('pointerdown', outside, true); window.removeEventListener('resize', position); window.removeEventListener('scroll', position, true); });
      var api = {close:close, open:open, position:position}; return api;
    }
    function sync() {
      fields.forEach(function (f) { values[f.key] = normalize(f, values[f.key]); });
      // Hidden-by-config is different from collapsed advanced fields: prune hidden values.
      for (var pass = 0; pass < fields.length; pass++) {
        var removed = false;
        fields.forEach(function (f) { if (!isVisible(f) && active(values[f.key])) { values[f.key] = empty(f); removed = true; } });
        if (!removed) break;
      }
      fields.forEach(function (f) {
        var a = adapters[f.key], visible = isVisible(f), disabled = isDisabled(f);
        a.wrap.hidden = !visible || (!!f.advanced && !expanded);
        a.wrap.classList.toggle('is-disabled', disabled); a.wrap.inert = disabled;
        a.inputs.forEach(function (input) { if ('disabled' in input) input.disabled = disabled; else input.tabIndex = disabled ? -1 : 0; input.setAttribute('aria-disabled', String(disabled)); });
        a.set(values[f.key]); if ((a.wrap.hidden || disabled) && a.close) a.close();
        a.wrap.querySelectorAll('button').forEach(function (button) { button.disabled = disabled; });
      });
      if (moreButton) {
        var advanced = fields.filter(function (f) { return isVisible(f) && f.advanced; });
        var count = advanced.filter(function (f) { return active(values[f.key]); }).length;
        moreButton.hidden = advanced.length === 0;
        moreButton.textContent = (expanded ? '收起筛选' : '更多筛选') + (count ? '（' + count + ' 项生效）' : '');
        moreButton.setAttribute('aria-expanded', String(expanded));
      }
      if (resetButton) {
        var resetActive = hasResettableChanges();
        resetButton.classList.toggle('gaip-filter-bar__button--reset-active', resetActive);
        resetButton.dataset.active = String(resetActive);
      }
      validate();
    }
    fields.forEach(function (f) {
      var wrap = node('div', 'gaip-filter-bar__field'), label = node('label', 'gaip-filter-bar__label', f.label || f.key), body = node('div', 'gaip-filter-bar__control'), error = node('span', 'gaip-filter-bar__error');
      wrap.dataset.filterKey = f.key; wrap.dataset.type = f.type;
      if (f.wide || /Range$/.test(f.type)) wrap.classList.add('gaip-filter-bar__field--wide');
      var fieldId = id + '-' + fields.indexOf(f); label.id = fieldId + '-label'; error.id = fieldId + '-error'; error.hidden = true; error.setAttribute('role', 'alert');
      wrap.appendChild(label); wrap.appendChild(body); wrap.appendChild(error); grid.appendChild(wrap);
      var a = adapters[f.key] = { wrap: wrap, field: f, error: error, inputs: [], set: function () {} };
      function input(type, part) {
        var el = node('input', 'gaip-filter-bar__input'); el.type = type; el.id = fieldId + (part == null ? '' : '-' + part); el.setAttribute('aria-labelledby', label.id); el.setAttribute('aria-describedby', error.id);
        if (part != null) { el.removeAttribute('aria-labelledby'); el.setAttribute('aria-label', (f.label || f.key) + (part ? '结束 / 最大值' : '开始 / 最小值')); }
        ['min','max','step','maxLength'].forEach(function (key) { if (f[key] != null) el[key] = f[key]; });
        a.inputs.push(el); body.appendChild(el); return el;
      }
      function dateInput(part) {
        var source = input('date', part), shell = node('div', 'gaip-filter-bar__date-shell');
        source.hidden = true; source.tabIndex = -1;
        var trigger = node('input', 'gaip-filter-bar__input gaip-filter-bar__date'); trigger.type = 'text'; trigger.readOnly = true;
        trigger.id = source.id + '-trigger'; trigger.placeholder = '年/月/日'; trigger.setAttribute('aria-haspopup','dialog');
        trigger.setAttribute('aria-label', source.getAttribute('aria-label') || f.label || f.key); trigger.setAttribute('aria-describedby',error.id);
        body.appendChild(shell); shell.appendChild(source); shell.appendChild(trigger); a.inputs.splice(a.inputs.indexOf(source),0,trigger);
        var calendar;
        function validDate(value) { var probe = source.cloneNode(); probe.value = value; return probe.value === value && probe.validity.valid; }
        function choose(value, close) { source.value = value; source.dispatchEvent(new Event('change', {bubbles:true})); close(true); }
        var picker = popup(trigger,'gaip-filter-bar__calendar',function(panel,close){
          panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','选择' + (f.label || '日期'));
          if (calendar) calendar.destroy();
          calendar = window.__GAIP_DATE_PICKER__.mount(panel,{value:source.value,isDateEnabled:validDate,onSelect:function(value){choose(value,close);},onLayout:function(){picker.position();}});
        });
        var clear = node('button','gaip-filter-bar__clear'); clear.type='button'; clear.setAttribute('aria-label','清除' + (source.getAttribute('aria-label') || f.label || '日期')); shell.appendChild(clear);
        clear.addEventListener('pointerdown',function(ev){ev.preventDefault();});
        clear.addEventListener('click',function(){if(!trigger.disabled)choose('',picker.close);});
        cleaners.push(function(){if(calendar)calendar.destroy();});
        var oldClose=a.close;a.close=function(){if(oldClose)oldClose();picker.close();};
        return {source:source,set:function(v){source.value=v||'';trigger.value=source.value.replace(/-/g,'/');trigger.title=trigger.value;clear.hidden=!source.value;}};
      }
      if (f.type === 'multiSelect') {
        if (!window.__GAIP_MULTI_SELECT__) throw new Error('请先加载全局折叠式多选组件');
        var selectRoot = node('div', 'gaip-filter-bar__multi'); body.appendChild(selectRoot);
        var focusValue = null;
        selectRoot.addEventListener('click', function (ev) { var option = ev.target.closest('[data-value]'); focusValue = option ? option.dataset.value : null; }, true);
        selectRoot.addEventListener('pointerdown', function () { if (openPopup) openPopup.close(); });
        var multi = window.__GAIP_MULTI_SELECT__.mount(selectRoot, { options: f.options || [], value: values[f.key], placeholder: f.placeholder || '全部', maxVisible: f.maxVisible || 2, onChange: function (value) {
          changed(f, value); if (focusValue != null) { var item = Array.from(selectRoot.querySelectorAll('[data-value]')).find(function (n) { return n.dataset.value === focusValue; }); if (item) item.focus(); }
        } });
        var control = selectRoot.querySelector('[role="combobox"]'); control.id = fieldId; control.setAttribute('aria-labelledby', label.id); a.inputs.push(control);
        a.set = function (value) { if (JSON.stringify(multi.getValue()) !== JSON.stringify(value || [])) multi.setValue(value || []); }; a.close = multi.close;
        var closeTimer;
        selectRoot.addEventListener('focusout', function () { clearTimeout(closeTimer); closeTimer = setTimeout(function () { if (!selectRoot.contains(document.activeElement)) multi.close(); }, 0); });
        cleaners.push(function () { clearTimeout(closeTimer); });
        cleaners.push(multi.destroy);
      } else if(f.type==='treeSelect') {
        if(!window.__GAIP_ORG_TREE__)throw new Error('请先加载共享组织树组件');
        var treeTrigger=node('input','gaip-filter-bar__input gaip-filter-bar__select gaip-filter-bar__tree-input');treeTrigger.type='text';treeTrigger.autocomplete='off';treeTrigger.id=fieldId;treeTrigger.setAttribute('role','combobox');treeTrigger.setAttribute('aria-autocomplete','list');treeTrigger.setAttribute('aria-haspopup','tree');treeTrigger.setAttribute('aria-labelledby',label.id);body.appendChild(treeTrigger);a.inputs.push(treeTrigger);
        var treeClear=node('button','gaip-filter-bar__clear gaip-filter-bar__tree-clear');treeClear.type='button';treeClear.setAttribute('aria-label','清除'+f.label);body.appendChild(treeClear);
        var treeInstance,treeQuery='',treeComposing=false;
        function selectionLabel(){var selected=treeNodes(f).find(function(n){return n.id===values[f.key];});return selected?(selected.path||selected.name):'';}
        function restoreTreeInput(){treeQuery='';treeTrigger.value=selectionLabel();treeTrigger.placeholder=f.placeholder||'全部组织';treeTrigger.title=treeTrigger.value;treeClear.hidden=!values[f.key];}
        var treePopup=popup(treeTrigger,'gaip-filter-bar__tree-popup',function(panel,close){
          if(treeInstance)treeInstance.destroy();panel.replaceChildren();
          treeTrigger.value=treeQuery;treeTrigger.placeholder=selectionLabel()||f.placeholder||'全部组织';
          var all=node('button','gaip-filter-bar__tree-all',f.placeholder||'全部组织');all.type='button';panel.appendChild(all);all.addEventListener('click',function(){changed(f,'');close(true);});
          var treeRoot=node('div');panel.appendChild(treeRoot);
          treeInstance=window.__GAIP_ORG_TREE__.mount(treeRoot,{nodes:treeNodes(f),value:values[f.key],label:f.label,onSelect:function(id){changed(f,id);close(true);}});
          treeInstance.search(treeQuery);
        },{editable:true,onClose:restoreTreeInput});
        function searchTree(){treeQuery=treeTrigger.value;treePopup.open();if(treeInstance)treeInstance.search(treeQuery);treeClear.hidden=!treeQuery&&!values[f.key];treePopup.position();}
        treeTrigger.addEventListener('input',function(){if(!treeComposing)searchTree();});
        treeTrigger.addEventListener('compositionstart',function(){treeComposing=true;});
        treeTrigger.addEventListener('compositionend',function(){treeComposing=false;searchTree();});
        treeClear.addEventListener('click',function(){treePopup.close();changed(f,'');treeTrigger.focus();});
        a.close=treePopup.close;a.set=function(v){if(treeTrigger.getAttribute('aria-expanded')!=='true')restoreTreeInput();if(treeInstance)treeInstance.setValue(v);};
        cleaners.push(function(){if(treeInstance)treeInstance.destroy();});
      } else if (f.type === 'select') {
        var select = node('select', 'gaip-filter-bar__input gaip-filter-bar__select'); select.id = fieldId; select.setAttribute('aria-labelledby', label.id);
        if (!(f.options || []).some(function (o) { return (typeof o === 'string' ? o : o.value) === ''; })) { var all = node('option', '', f.placeholder || '全部'); all.value = ''; select.appendChild(all); }
        (f.options || []).forEach(function (o) { var option = node('option', '', typeof o === 'string' ? o : o.label); option.value = typeof o === 'string' ? o : o.value; select.appendChild(option); });
        select.addEventListener('change', function () { changed(f, select.value); }); body.appendChild(select); a.inputs.push(select);
        select.hidden = true; select.tabIndex = -1;
        var trigger = node('button','gaip-filter-bar__input gaip-filter-bar__select'); trigger.type='button';trigger.id=fieldId+'-trigger';trigger.setAttribute('role','combobox');trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-labelledby',label.id);body.appendChild(trigger);a.inputs.unshift(trigger);
        var single = popup(trigger,'gaip-filter-bar__options',function(panel,close){
          panel.replaceChildren();panel.setAttribute('role','listbox');panel.setAttribute('aria-labelledby',label.id);
          Array.from(select.options).forEach(function(o){var b=node('button','gaip-filter-bar__option',o.label);b.type='button';b.setAttribute('role','option');b.setAttribute('aria-selected',String(o.selected));b.dataset.value=o.value;panel.appendChild(b);b.addEventListener('click',function(){select.value=o.value;select.dispatchEvent(new Event('change',{bubbles:true}));close(true);});});
          panel.onkeydown=function(ev){var items=Array.from(panel.querySelectorAll('[role="option"]')), index=items.indexOf(document.activeElement), next;
            if(ev.key==='ArrowDown')next=(index+1)%items.length;else if(ev.key==='ArrowUp')next=(index-1+items.length)%items.length;else if(ev.key==='Home')next=0;else if(ev.key==='End')next=items.length-1;
            if(next!=null && items[next]){ev.preventDefault();items[next].focus();}
          };
        });a.close=single.close;
        a.set = function (v) { select.value = v == null ? '' : v; trigger.textContent=select.selectedOptions[0] ? select.selectedOptions[0].label : (f.placeholder || '全部'); trigger.title=trigger.textContent; };
      } else if (f.type === 'switch') {
        var line = node('label', 'gaip-filter-bar__switch-line'), toggle = input('checkbox'); toggle.className = 'gaip-filter-bar__switch-input'; toggle.setAttribute('role', 'switch');
        line.appendChild(toggle); line.appendChild(node('span', 'gaip-filter-bar__switch-track')); line.appendChild(node('span', '', f.text || f.label)); body.appendChild(line);
        toggle.addEventListener('change', function () { changed(f, toggle.checked); }); a.set = function (v) { toggle.checked = !!v; toggle.setAttribute('aria-checked', String(!!v)); };
      } else if (f.type === 'date' || f.type === 'dateRange') {
        var firstDate=dateInput(f.type==='dateRange'?0:null), lastDate;
        if(f.type==='dateRange'){body.classList.add('gaip-filter-bar__range');body.appendChild(node('span','gaip-filter-bar__separator','至'));lastDate=dateInput(1);}
        [firstDate,lastDate].filter(Boolean).forEach(function(d){d.source.addEventListener('change',function(){changed(f,lastDate?[firstDate.source.value,lastDate.source.value]:firstDate.source.value);});});
        a.set=function(v){firstDate.set(lastDate?v&&v[0]:v);if(lastDate)lastDate.set(v&&v[1]);};
      } else if (/Range$/.test(f.type)) {
        body.classList.add('gaip-filter-bar__range');
        var start = input(f.type === 'dateRange' ? 'date' : 'number', 0); body.appendChild(node('span', 'gaip-filter-bar__separator', '至')); var end = input(f.type === 'dateRange' ? 'date' : 'number', 1);
        start.placeholder = '最小值'; end.placeholder = '最大值';
        [start,end].forEach(function (el) { el.addEventListener('change', function () { changed(f, [start.value,end.value]); }); });
        a.set = function (v) { start.value = v && v[0] != null ? v[0] : ''; end.value = v && v[1] != null ? v[1] : ''; };
      } else {
        var text = input(f.type === 'date' ? 'date' : 'search'); text.placeholder = f.placeholder || '请输入';
        if (f.type === 'search') {
          body.classList.add('gaip-filter-bar__search'); var composing = false;
          text.addEventListener('compositionstart', function () { composing = true; });
          text.addEventListener('compositionend', function () { composing = false; changed(f, text.value, true); });
          text.addEventListener('input', function () { if (!composing) changed(f, text.value, true); });
          var clear = node('button', 'gaip-filter-bar__clear'); clear.type = 'button'; clear.setAttribute('aria-label', '清空' + (f.label || '搜索')); body.appendChild(clear);
          clear.addEventListener('click', function () { changed(f, ''); text.focus(); });
          a.set = function (v) { text.value = v == null ? '' : v; clear.hidden = !text.value; clear.disabled = isDisabled(f); };
        } else { text.addEventListener('change', function () { changed(f, text.value); }); a.set = function (v) { text.value = v || ''; }; }
      }
      label.htmlFor = a.inputs[0].id;
    });
    function button(text, name, handler) { var b = node('button', 'gaip-filter-bar__button', text); b.type = 'button'; b.dataset.gaipFilterAction = name; b.addEventListener('click', handler); actions.appendChild(b); return b; }
    var actionConfig = config.actions || {};
    if (actionConfig.more !== false) moreButton = button('更多筛选', 'more', function () { expanded = !expanded; sync(); });
    if (actionConfig.submit === true || (config.mode === 'submit' && actionConfig.submit !== false)) { var query = button('查询', 'submit', function () { if (validate(true)) emit('submit'); }); query.classList.add('gaip-filter-bar__button--primary'); }
    function reset() { clearTimeout(timer); fields.forEach(function (f) { values[f.key] = copy(f.defaultValue !== undefined ? f.defaultValue : empty(f)); }); sync(); emit('reset'); }
    if (actionConfig.reset !== false) resetButton = button('重置', 'reset', reset);
    form.addEventListener('submit', function (ev) { ev.preventDefault(); if (validate(true)) emit('submit'); });
    sync();
    var api = {
      getValues: getValues,
      setValue: function (patch, options) { Object.keys(patch).forEach(function (key) { if (keys.has(key)) values[key] = copy(patch[key]); }); sync(); if (!options || !options.silent) emit('change'); },
      setVisible: function (key, visible) { var f = fields.find(function (x) { return x.key === key; }); if (!f) throw new Error('未知筛选项：' + key); f.visible = visible; sync(); emit('visibility'); },
      setDisabled: function (key, disabled) { var f = fields.find(function (x) { return x.key === key; }); if (!f) throw new Error('未知筛选项：' + key); f.disabled = disabled; sync(); },
      refresh: function () { sync(); emit('visibility'); }, reset: reset,
      destroy: function () { destroyed = true; clearTimeout(timer); cleaners.forEach(function (clean) { clean(); }); form.remove(); instances.delete(root); }
    };
    instances.set(root, api); return api;
  }
  window.__GAIP_FILTER_BAR__ = { mount: mount, get: function (root) { return instances.get(root) || null; } };
}());
