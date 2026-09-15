(function (w) {
  'use strict';
  if (w.__GAIP_MODAL_CONTROLS__) return;
  var roots = '.ant-modal, dialog, .gaip-owner-dialog, .gaip-activity-modal__panel, .gaip-wealth-modal, .gaip-ai-notice, .gaip-news-bridge-modal, .gaip-global-poster-share-panel, .gaip-file-dialog';
  var excluded = '.ant-drawer, .ant-drawer-root, .agentModal___Nxp06, [data-gaip-modal-controls="exclude"]';
  var antPanels = '.ant-select-dropdown, .ant-picker-dropdown, .ant-cascader-dropdown, .ant-tree-select-dropdown';
  var nativeSources = new Map(), boundSelects = new WeakSet(), sequence = 0, active = null, pending = null, observer = null, stopped = false;
  var clears = new Map(), resizeObserver = null;
  var resizeHandles = new Map();
  var invalidBatches = new Map(), invalidTimer = null;
  var terminalValidation = new Map();
  // Reveal only inside this form's scroll chain. Never scroll the page or move
  // React nodes; include the field's help/error line whenever it fits.
  function revealInvalidField(field) {
    var root = rootOf(field);
    if (stopped || !root || !root.matches('.gaip-modal-form') || !visible(root) || !visible(field) || field.matches(':disabled')) return false;
    var control = nativeSources.get(field) || field;
    if (w.getComputedStyle(control).display === 'none') return false;
    control.focus({ preventScroll: true });
    var block = field.closest('.ant-form-item, .gaip-activity-modal__field, .gaip-announcement-form-section, .field___liuLu') || control;
    for (var parent = control.parentElement; parent && root.contains(parent); parent = parent.parentElement) {
      if (!/(auto|scroll)/.test(w.getComputedStyle(parent).overflowY) || parent.scrollHeight <= parent.clientHeight) continue;
      var box = parent.getBoundingClientRect(), target = block.getBoundingClientRect();
      var scale = parent.offsetHeight ? box.height / parent.offsetHeight : 1;
      if (!scale || !parent.clientHeight) continue;
      var top = box.top + parent.clientTop * scale, bottom = top + parent.clientHeight * scale;
      if (target.height > bottom - top) target = control.getBoundingClientRect();
      if (target.top < top) parent.scrollTop += (target.top - top) / scale;
      else if (target.bottom > bottom) parent.scrollTop += (target.bottom - bottom) / scale;
    }
    return true;
  }
  function queueInvalid(event) {
    var field = event.target, root = rootOf(field);
    if (stopped || !root || !root.matches('.gaip-modal-form') || !visible(root)) return;
    if (!invalidBatches.has(root)) invalidBatches.set(root, field);
    if (invalidTimer !== null) return;
    invalidTimer = w.setTimeout(function () {
      invalidTimer = null;
      invalidBatches.forEach(function (first) { revealInvalidField(first); });
      invalidBatches.clear();
    }, 0);
  }
  // Compatibility adapter for the read-only clue terminal React source. The
  // original submit/upload handlers still run after these field checks pass.
  function adoptTerminalValidation(root) {
    if (!root.matches('.gaip-modal-form') || !w.__GAIP_MODAL_COMPONENT__) return;
    var submit = root.querySelector('.btnConvert___P7Srn, .btnClose___llxYq');
    var area = root.querySelector('textarea.textarea___Rf4rJ');
    if (!submit || !area || !visible(root)) return;
    var reason = root.querySelector('.sel___BcaOJ'), state = terminalValidation.get(root);
    if (state && state.area === area && state.submit === submit && state.reason === reason) { if (state.attempted) state.validate(false); return; }
    if (state) state.destroy();
    var upload = root.querySelector('.uploadBtn___WBpgy');
    if (!upload) return;
    var uploadField = upload.closest('.field___liuLu'), reasonInput = reason && reason.querySelector('input');
    var previousTab = uploadField.getAttribute('tabindex'); uploadField.setAttribute('tabindex', '-1');
    var fields = [];
    function field(container, control, read) {
      var feedback = w.__GAIP_MODAL_COMPONENT__.createFieldFeedback(container, control);
      fields.push({ control: control, feedback: feedback, read: read });
    }
    if (reason && reasonInput) field(reason.closest('.field___liuLu'), reasonInput, function () {
      return reason.querySelector('.ant-select-selection-item') ? '' : '请选择关闭原因';
    });
    field(area.closest('.field___liuLu'), area, function () {
      return area.value.trim() ? '' : submit.matches('.btnConvert___P7Srn') ? '请填写转化说明' : '请填写关闭说明';
    });
    field(uploadField, uploadField, function () {
      return uploadField.querySelector('.previewItem___ARNp7') ? '' : '请至少上传一张截图凭证';
    });
    state = { area: area, submit: submit, reason: reason, attempted: false, validate: function (focus) {
      var first = null;
      fields.forEach(function (item) { var message = item.read(); item.feedback.set(message); if (message && !first) first = item.control; });
      if (focus && first) revealInvalidField(first);
      return !first;
    }, destroy: function () {
      root.removeEventListener('click', onClick, true);
      root.removeEventListener('input', onInput);
      fields.forEach(function (item) { item.feedback.destroy(); });
      if (previousTab === null) uploadField.removeAttribute('tabindex'); else uploadField.setAttribute('tabindex', previousTab);
      terminalValidation.delete(root);
    } };
    function onClick(event) {
      if (!submit.contains(event.target) || submit.disabled) return;
      state.attempted = true;
      if (!state.validate(true)) { event.preventDefault(); event.stopImmediatePropagation(); }
    }
    function onInput() { if (state.attempted) state.validate(false); }
    root.addEventListener('click', onClick, true); root.addEventListener('input', onInput);
    terminalValidation.set(root, state);
    w.__GAIP_MODAL_COMPONENT__.adoptForm(root);
  }
  function releaseResize(el, state) {
    if (state.stop) state.stop();
    state.handle.remove();
    state.shell.classList.remove('gaip-mc-resize-host');
    el.classList.remove('gaip-mc-resize-source');
    resizeHandles.delete(el);
  }
  function enhanceResize(el) {
    if (el.tagName !== 'TEXTAREA') return;
    var shell = el.closest('.gaip-kit-counted, [data-gaip-modal-part~="resizable-textarea"]'), state = resizeHandles.get(el);
    if (!shell || el.hasAttribute('data-announcement-autosize') || el.style.resize === 'none') {
      if (state) releaseResize(el, state);
      return;
    }
    if (state && (!state.handle.isConnected || state.shell !== shell)) { releaseResize(el, state); state = null; }
    if (!state && w.getComputedStyle(el).resize === 'none') return;
    if (!state) {
      var handle = document.createElement('button'); handle.type = 'button';
      handle.className = 'gaip-mc-resize-handle';
      handle.setAttribute('aria-label', '调整输入框高度（上下方向键）');
      handle.title = '拖动调整高度，或使用上下方向键';
      state = { shell: shell, handle: handle, stop: null };
      resizeHandles.set(el, state); shell.appendChild(handle);
      function blocked() { return el.matches(':disabled') || el.readOnly || !visible(el); }
      function height() { return el.offsetHeight || parseFloat(w.getComputedStyle(el).height) || 60; }
      function setHeight(value) {
        var min = parseFloat(w.getComputedStyle(el).minHeight) || 42;
        var max = parseFloat(w.getComputedStyle(el).maxHeight) || Infinity;
        el.style.height = Math.round(Math.max(min, Math.min(max, value))) + 'px';
      }
      handle.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); });
      handle.addEventListener('keydown', function (e) {
        if (!['ArrowUp', 'ArrowDown'].includes(e.key) || blocked()) return;
        e.preventDefault(); e.stopPropagation();
        setHeight(height() + (e.key === 'ArrowDown' ? 1 : -1) * (e.shiftKey ? 40 : 10));
      });
      handle.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 || blocked()) return;
        e.preventDefault(); e.stopPropagation(); handle.focus({ preventScroll: true });
        if (state.stop) state.stop();
        var startY = e.clientY, startHeight = height();
        var scale = el.offsetHeight ? el.getBoundingClientRect().height / el.offsetHeight : 1;
        function move(event) {
          if (event.pointerId !== e.pointerId) return;
          if (blocked()) { stop(); return; }
          setHeight(startHeight + (event.clientY - startY) / (scale || 1));
        }
        function end(event) { if (event.pointerId === e.pointerId) stop(); }
        function stop() {
          w.removeEventListener('pointermove', move); w.removeEventListener('pointerup', end);
          w.removeEventListener('pointercancel', end); w.removeEventListener('blur', stop); state.stop = null;
        }
        state.stop = stop;
        w.addEventListener('pointermove', move); w.addEventListener('pointerup', end);
        w.addEventListener('pointercancel', end); w.addEventListener('blur', stop);
      });
    }
    add(shell, 'gaip-mc-resize-host'); add(el, 'gaip-mc-resize-source');
    var disabled = el.matches(':disabled') || el.readOnly;
    if (state.handle.disabled !== disabled) state.handle.disabled = disabled;
    if (disabled && state.stop) state.stop();
  }
  function rootOf(el) { var r = el && el.closest && el.closest(roots); return r && !el.closest(excluded) ? r : null; }
  function visible(el) {
    if (!el || !el.isConnected) return false;
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      if (n.hidden || n.getAttribute('aria-hidden') === 'true' || n.style.display === 'none' || n.matches('dialog:not([open]), .ant-select-dropdown-hidden, .ant-picker-dropdown-hidden')) return false;
    }
    return true;
  }
  function add(el, cls) { if (!el.classList.contains(cls)) el.classList.add(cls); }
  function valueState(el) { var state = el.value ? 'filled' : 'empty'; if (el.getAttribute('data-gaip-value-state') !== state) el.setAttribute('data-gaip-value-state', state); }
  function label(el) {
    return el.getAttribute('aria-label') || (el.labels && el.labels[0] && el.labels[0].textContent.trim()) || el.title || '请选择';
  }
  function emit(el) {
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function placeClear(el, state) {
    if (state.inline || !state.generated || !el.isConnected) return;
    var r = el.getBoundingClientRect(), h = state.host.getBoundingClientRect();
    var sx = state.host.offsetWidth && h.width / state.host.offsetWidth || 1;
    var sy = state.host.offsetHeight && h.height / state.host.offsetHeight || sx;
    var left = (r.right - h.left) / sx + state.host.scrollLeft - state.host.clientLeft - 36;
    var top = (r.top - h.top + r.height / 2) / sy + state.host.scrollTop - state.host.clientTop - 12;
    if (state.button.style.left !== left + 'px') state.button.style.left = left + 'px';
    if (state.button.style.top !== top + 'px') state.button.style.top = top + 'px';
  }
  function syncClear(el) {
    var state = clears.get(el); if (!state) return;
    var hidden = !el.value || el.matches(':disabled') || el.readOnly;
    if (state.generated && state.button.hidden !== hidden) state.button.hidden = hidden;
    state.button.classList.toggle('gaip-mc-clear-unavailable', hidden);
    placeClear(el, state);
  }
  function enhanceClear(el, shell) {
    // Text and date fields share the existing clear affordance. Numbers retain spinners.
    if (el.tagName !== 'INPUT' || !/^(text|email|tel|url|password|search|date|datetime-local)$/.test(el.type)) return;
    var previous = clears.get(el);
    if (previous && previous.button.isConnected && previous.host.contains(el)) { syncClear(el); return; }
    if (previous) releaseClear(el, previous);
    var host = shell || el.parentElement;
    var existing = shell && shell.querySelector('.ant-input-clear-icon, [data-bulk-search-clear], [data-adjust-node-search-clear]');
    var button = existing || document.createElement('button');
    var state = { host: host, button: button, generated: !existing, inline: !!shell };
    add(button, 'gaip-mc-clear');
    if (!existing) {
      button.type = 'button'; button.setAttribute('aria-label', '清除' + (el.getAttribute('aria-label') || el.placeholder || '内容'));
      button.classList.add(shell ? 'gaip-mc-clear-inline' : 'gaip-mc-clear-overlay');
      if (!shell) { add(host, 'gaip-mc-clear-host'); if (!/^(date|datetime-local)$/.test(el.type)) add(el, 'gaip-mc-clearable'); }
      host.appendChild(button);
      button.addEventListener('pointerdown', function (e) { e.preventDefault(); });
      button.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        if (el.matches(':disabled') || el.readOnly) return;
        if (active && active.source === el) closeNative(false);
        setValue(el, ''); syncClear(el); el.focus({ preventScroll: true });
      });
    } else {
      state.originalAttributes = ['tabindex', 'role', 'aria-label'].map(function (name) { return [name, button.getAttribute(name)]; });
      button.tabIndex = 0;
      if (!button.getAttribute('aria-label')) button.setAttribute('aria-label', '清除内容');
      if (button.tagName !== 'BUTTON') {
        button.setAttribute('role', 'button');
        state.onClearKey = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); button.click(); } };
        button.addEventListener('keydown', state.onClearKey);
      }
      // Let the source clear handler run first; some legacy handlers do not emit input/change.
      state.afterSourceClear = function (e) {
        if (el.matches(':disabled') || el.readOnly) { e.preventDefault(); e.stopImmediatePropagation(); return; }
        queueMicrotask(function () { if (!stopped) { valueState(el); syncClear(el); } });
      };
      button.addEventListener('click', state.afterSourceClear, true);
    }
    clears.set(el, state);
    if (resizeObserver && state.generated && !state.inline) { resizeObserver.observe(el); resizeObserver.observe(host); }
    syncClear(el);
  }
  function releaseClear(el, state) {
    if (resizeObserver) resizeObserver.unobserve(el);
    if (state.generated) state.button.remove();
    else {
      state.button.removeEventListener('click', state.afterSourceClear, true);
      if (state.onClearKey) state.button.removeEventListener('keydown', state.onClearKey);
      state.originalAttributes.forEach(function (item) { if (item[1] === null) state.button.removeAttribute(item[0]); else state.button.setAttribute(item[0], item[1]); });
      state.button.classList.remove('gaip-mc-clear', 'gaip-mc-clear-unavailable');
    }
    el.classList.remove('gaip-mc-clearable'); clears.delete(el);
    if (!state.host.querySelector('.gaip-mc-clear-overlay')) {
      state.host.classList.remove('gaip-mc-clear-host');
      if (resizeObserver) resizeObserver.unobserve(state.host);
    }
  }
  function syncSelect(el) {
    var button = nativeSources.get(el); if (!button) return;
    var text = Array.prototype.filter.call(el.options, function (o) { return o.selected; }).map(function (o) { return o.label; }).join('、') || '请选择';
    if (button.textContent !== text) button.textContent = text;
    if (button.disabled !== el.disabled) button.disabled = el.disabled;
    valueState(el);
    if (button.dataset.gaipValueState !== el.dataset.gaipValueState) button.dataset.gaipValueState = el.dataset.gaipValueState;
    if (button.getAttribute('aria-label') !== label(el)) button.setAttribute('aria-label', label(el));
    var invalid = el.getAttribute('aria-invalid');
    if (invalid && button.getAttribute('aria-invalid') !== invalid) button.setAttribute('aria-invalid', invalid);
    else if (!invalid && button.hasAttribute('aria-invalid')) button.removeAttribute('aria-invalid');
  }
  function enhanceSelect(el) {
    if (nativeSources.has(el)) { syncSelect(el); return; }
    var button = document.createElement('button'); button.type = 'button';
    button.className = 'gaip-native-trigger'; button.setAttribute('role', 'combobox');
    button.setAttribute('aria-haspopup', 'dialog'); button.setAttribute('aria-expanded', 'false');
    button.__originalTab = el.getAttribute('tabindex');
    el.insertAdjacentElement('afterend', button); add(el, 'gaip-native-source'); el.tabIndex = -1;
    nativeSources.set(el, button); syncSelect(el);
    button.addEventListener('click', function () { openNative(el, button); });
    button.addEventListener('keydown', function (e) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].indexOf(e.key) >= 0) { e.preventDefault(); openNative(el, button); }
    });
    if (!boundSelects.has(el)) {
      boundSelects.add(el);
      el.addEventListener('change', function () { syncSelect(el); });
      el.addEventListener('invalid', function (e) {
        var current = nativeSources.get(el);
        if (!current || stopped) return;
        e.preventDefault();
        if (rootOf(el) && rootOf(el).matches('.gaip-modal-form')) queueInvalid(e);
        else current.focus();
      });
    }
  }
  function adopt(root) {
    if (!root || root.closest(excluded)) return;
    add(root, 'gaip-modal-controls');
    root.querySelectorAll('select, input, textarea').forEach(function (el) {
      if (rootOf(el) !== root || el.closest('.gaip-modal-popup, [data-gaip-form-field="exclude"]')) return;
      valueState(el);
      if (el.tagName === 'SELECT' && !el.closest('.ant-select, .ant-picker')) enhanceSelect(el);
      if (el.matches('input[type="date"], input[type="time"], input[type="datetime-local"]') && !el.closest('.ant-picker')) {
        add(el, 'gaip-native-date'); if(el.type !== 'time') enhanceClear(el); if (el.getAttribute('aria-haspopup') !== 'dialog') el.setAttribute('aria-haspopup', 'dialog');
      }
      if ((el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' && /^(text|email|tel|url|password|number|search)$/.test(el.type)) && !el.closest('.ant-select, .ant-picker, .ant-input-number')) {
        add(el, 'gaip-mc-text'); add(el, 'gaip-form-control');
        var shell = el.tagName === 'INPUT' && el.closest('.ant-input-affix-wrapper, .gaip-owner-search, .gaip-bulk-node-search, .gaip-adjust-node-search');
        if (shell) { add(shell, 'gaip-mc-input-shell'); add(shell, 'gaip-form-input-shell'); add(el, 'gaip-mc-inner'); add(el, 'gaip-form-control--inner'); }
        if (root.classList.contains('gaip-modal-form')) {
          if (el.type === 'search' && shell) add(shell, 'gaip-mc-search-shell');
          enhanceClear(el, shell);
          enhanceResize(el);
        }
      }
    });
    adoptTerminalValidation(root);
  }
  function ownPortal(panel) {
    if (!visible(panel)) return null;
    var direct = rootOf(panel); if (direct) return direct;
    var ids = [panel.id]; panel.querySelectorAll('[id]').forEach(function (el) { ids.push(el.id); });
    var found = null;
    document.querySelectorAll('[aria-controls], [aria-owns]').forEach(function (control) {
      if (control.getAttribute('aria-expanded') === 'false' || !visible(control)) return;
      var refs = ((control.getAttribute('aria-controls') || '') + ' ' + (control.getAttribute('aria-owns') || '')).split(/\s+/);
      if (refs.some(function (id) { return id && ids.indexOf(id) >= 0; })) {
        var owner = rootOf(control); if (owner && visible(owner)) found = owner;
      }
    });
    if (found) return found;
    // Only a panel newly opened/changed after an explicit in-modal trigger may inherit.
    if (pending && Date.now() - pending.time < 1500 && visible(pending.owner) &&
        !pending.alreadyVisible.has(panel) && panel.matches(pending.kind)) return pending.owner;
    return null;
  }
  function syncPortals() {
    document.querySelectorAll(antPanels).forEach(function (panel) {
      var owner = ownPortal(panel);
      if (!owner && panel.__gaipOwner && visible(panel.__gaipOwner) && visible(panel) && pending && pending.owner === panel.__gaipOwner) owner = panel.__gaipOwner;
      if (owner) { add(panel, 'gaip-modal-popup'); if(panel.matches('.ant-picker-dropdown') && !panel.querySelector('.ant-picker-time-panel:only-child')) add(panel,'gaip-ant-date-popup'); panel.__gaipOwner = owner; }
      else { if (panel.classList.contains('gaip-modal-popup')) panel.classList.remove('gaip-modal-popup'); if(panel.classList.contains('gaip-ant-date-popup'))panel.classList.remove('gaip-ant-date-popup'); panel.__gaipOwner = null; }
    });
  }
  function arm(trigger) {
    var owner = rootOf(trigger);
    pending = owner ? { owner: owner, trigger: trigger, kind: trigger.matches('.ant-picker') ? '.ant-picker-dropdown' : '.ant-select-dropdown, .ant-cascader-dropdown, .ant-tree-select-dropdown', time: Date.now(), alreadyVisible: new Set(Array.prototype.filter.call(document.querySelectorAll(antPanels), visible)) } : null;
  }
  function scan() {
    if (stopped) return;
    terminalValidation.forEach(function (state, root) { if (!visible(root)) state.destroy(); });
    resizeHandles.forEach(function (state, el) {
      var owner = rootOf(el);
      if (!el.isConnected || !owner || !owner.classList.contains('gaip-modal-form') || el.closest('[data-gaip-form-field="exclude"], .gaip-modal-popup')) releaseResize(el, state);
      else if (!visible(el) && state.stop) state.stop();
    });
    clears.forEach(function (state, el) {
      var owner = rootOf(el);
      if (!el.isConnected || !owner || !owner.classList.contains('gaip-modal-form') && !/^(date|datetime-local)$/.test(el.type)) releaseClear(el, state);
    });
    // A reused native select moved back into a page must regain its native UI.
    nativeSources.forEach(function (proxy, el) {
      if (el.isConnected && rootOf(el)) return;
      if (proxy) { if (proxy.__originalTab === null) el.removeAttribute('tabindex'); else el.setAttribute('tabindex', proxy.__originalTab); proxy.remove(); nativeSources.delete(el); }
      el.classList.remove('gaip-native-source');
    });
    document.querySelectorAll('.gaip-native-date').forEach(function (el) { if (!rootOf(el)) el.classList.remove('gaip-native-date'); });
    document.querySelectorAll(roots).forEach(adopt);
    syncPortals();
    if (active && (!visible(active.owner) || !active.source.isConnected || active.source.disabled)) closeNative(false);
  }
  function closeNative(focus) {
    if (!active) return;
    var a = active; active = null; a.panel.remove();
    a.trigger.setAttribute('aria-expanded', 'false'); a.trigger.removeAttribute('aria-controls');
    if (focus && visible(a.trigger)) a.trigger.focus();
  }
  function position() {
    if (!active) return;
    var r = active.trigger.getBoundingClientRect(), p = active.panel;
    var width = Math.min(active.source.tagName === 'SELECT' ? Math.max(r.width, 220) : active.source.type === 'time' ? 332 : w.__GAIP_DATE_PICKER__.width, Math.max(180, w.innerWidth - 24));
    // Popover top layer uses viewport coordinates even inside a translated dialog.
    // Older engines keep the same owner but need coordinates in its fixed containing block.
    p.style.width = width + 'px';
    p.style.left = '0px'; p.style.top = '0px';
    var origin = p.getBoundingClientRect();
    var sx = active.topLayer ? 1 : (p.offsetWidth && origin.width / p.offsetWidth || 1);
    var sy = active.topLayer ? 1 : (p.offsetHeight && origin.height / p.offsetHeight || sx);
    var ox = active.topLayer ? 0 : origin.left, oy = active.topLayer ? 0 : origin.top;
    p.style.width = width / sx + 'px';
    p.style.left = (Math.max(12, Math.min(r.left, w.innerWidth - width - 12)) - ox) / sx + 'px';
    var below = w.innerHeight - r.bottom - 16, above = r.top - 16;
    var height = Math.min(420, Math.max(below, above, 120));
    p.style.maxHeight = height / sy + 'px';
    var actualHeight = Math.min((p.scrollHeight || 320) * sy, height);
    var top = below >= actualHeight ? r.bottom + 4 : Math.max(12, r.top - actualHeight - 4);
    p.style.top = (top - oy) / sy + 'px';
  }
  function button(parent, text, fn, cls) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = text; b.className = cls || 'gaip-choice-option';
    b.addEventListener('click', fn); parent.appendChild(b); return b;
  }
  function setValue(source, value) {
    var setter = Object.getOwnPropertyDescriptor(source.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype, 'value').set;
    setter.call(source, value); emit(source);
  }
  function valid(source, value) { var copy = source.cloneNode(); copy.value = value; return copy.value === value && copy.checkValidity(); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function renderSelect(a) {
    var panel = a.panel, source = a.source; panel.replaceChildren();
    var list = document.createElement('div'); list.setAttribute('role', 'listbox'); list.setAttribute('aria-label', label(source));
    if (source.multiple) list.setAttribute('aria-multiselectable', 'true'); panel.appendChild(list);
    Array.prototype.forEach.call(source.options, function (o) {
      if (o.hidden) return;
      var b = button(list, o.label, function () {
        if (source.multiple) { o.selected = !o.selected; emit(source); syncSelect(source); renderSelect(a); }
        else { setValue(source, o.value); syncSelect(source); closeNative(true); }
      });
      b.setAttribute('role', 'option'); b.setAttribute('aria-selected', String(o.selected));
      b.disabled = o.disabled || !!o.closest('optgroup[disabled]');
    });
    if (!list.children.length) { var empty = document.createElement('p'); empty.className = 'gaip-control-note'; empty.textContent = '暂无选项'; list.appendChild(empty); }
    if (source.multiple) button(panel, '完成', function () { closeNative(true); }, 'gaip-choice-apply');
    position();
  }
  function renderPicker(a) {
    var p = a.panel, s = a.source; p.replaceChildren();
    var hasDate = s.type !== 'time', hasTime = s.type !== 'date';
    if (hasDate) {
      var calendar = document.createElement('div'); p.appendChild(calendar);
      w.__GAIP_DATE_PICKER__.mount(calendar, {
        value: a.date, month: a.month,
        isDateEnabled: function (value) { return s.type === 'date' ? valid(s,value) : !(s.min && value < s.min.slice(0,10) || s.max && value > s.max.slice(0,10)); },
        onSelect: function (value) { a.date=value; a.month=w.__GAIP_DATE_PICKER__.parse(value); if(s.type==='date'){setValue(s,value);closeNative(true);}else renderPicker(a); },
        onLayout: position
      });
    }
    if (hasTime) {
      var time = document.createElement('div'); time.className = 'gaip-time-columns'; p.appendChild(time);
      var seconds = s.step && s.step !== 'any' && Number(s.step) < 60 || /:\d\d:\d\d/.test(s.value);
      var parts = (a.time || '00:00').split(':');
      ['时', '分'].concat(seconds ? ['秒'] : []).forEach(function (name, index) {
        var col = document.createElement('div'); col.setAttribute('role', 'listbox'); col.setAttribute('aria-label', name); time.appendChild(col);
        for (var i = 0; i < (index === 0 ? 24 : 60); i++) (function (n) {
          var b = button(col, pad(n), function () { parts[index] = pad(n); a.time = parts.slice(0, seconds ? 3 : 2).map(function (v) { return v || '00'; }).join(':'); a.timeFocus = index; renderPicker(a); });
          b.setAttribute('role', 'option'); b.setAttribute('aria-selected', String(Number(parts[index] || 0) === n));
        }(i));
      });
      var value = (hasDate ? a.date + 'T' : '') + a.time;
      var apply = button(p, '确定', function () { if (valid(s, value)) { setValue(s, value); closeNative(true); } }, 'gaip-choice-apply');
      apply.disabled = !valid(s, value);
      if (apply.disabled) { var note = document.createElement('p'); note.className = 'gaip-control-note'; note.textContent = '请选择符合日期范围和时间间隔的值'; p.appendChild(note); }
    }
    if (!hasDate) button(p, '清空', function () { setValue(s, ''); closeNative(true); }, 'gaip-choice-clear');
    position();
    if (a.timeFocus != null) {
      var column = p.querySelectorAll('.gaip-time-columns > div')[a.timeFocus];
      var selected = column && column.querySelector('[aria-selected="true"]');
      if (selected) { selected.focus({ preventScroll: true }); column.scrollTop = Math.max(0, selected.offsetTop - column.offsetTop - 64); }
    }
  }
  function openNative(source, trigger) {
    var owner = rootOf(source); if (!owner || source.matches(':disabled') || source.readOnly) return;
    if (active && active.source === source) { closeNative(true); return; }
    closeNative(false);
    var panel = document.createElement('div'); panel.className = 'gaip-modal-popup gaip-native-popup'; panel.id = 'gaip-control-popup-' + (++sequence);
    if (source.tagName !== 'SELECT' && source.type !== 'time') panel.classList.add('gaip-date-popup');
    panel.setAttribute('data-gaip-form-field', 'exclude');
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', label(source));
    owner.appendChild(panel); trigger.setAttribute('aria-controls', panel.id); trigger.setAttribute('aria-expanded', 'true');
    var date = source.type === 'time' ? '' : source.value.slice(0, 10);
    var today = new Date(), month = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(Number(date.slice(0,4)), Number(date.slice(5,7))-1, 1) : new Date(today.getFullYear(), today.getMonth(), 1);
    active = { owner: owner, source: source, trigger: trigger, panel: panel, month: month, date: date, time: (source.type === 'time' ? source.value : source.value.split('T')[1]) || '00:00' };
    // Remain a descendant for modal focus/inert semantics, but escape overflow and transforms.
    if (typeof panel.showPopover === 'function') {
      panel.setAttribute('popover', 'manual');
      try { panel.showPopover(); active.topLayer = true; }
      catch (_) { panel.removeAttribute('popover'); }
    }
    if (source.tagName === 'SELECT') renderSelect(active); else renderPicker(active);
    var first = panel.querySelector('[aria-selected="true"]:not(:disabled), [aria-pressed="true"]:not(:disabled), button:not(:disabled)'); if (first) first.focus({ preventScroll: true });
  }
  function start() {
    document.addEventListener('invalid', queueInvalid, true);
    if (w.ResizeObserver) resizeObserver = new w.ResizeObserver(function () {
      clears.forEach(function (state, el) { placeClear(el, state); });
    });
    scan();
    var queued = false;
    observer = new MutationObserver(function () { if (!queued) { queued = true; queueMicrotask(function () { queued = false; scan(); }); } });
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class','style','hidden','open','aria-hidden','aria-controls','aria-expanded','disabled','readonly','value','selected','aria-invalid','data-gaip-form-field','data-gaip-modal-part'] });
    document.addEventListener('pointerdown', function (e) {
      if (e.target.matches('.gaip-native-date') && rootOf(e.target) && !e.target.disabled && !e.target.readOnly) e.preventDefault();
      if (active && !active.panel.contains(e.target) && e.target !== active.trigger && e.target !== active.source) closeNative(false);
      if (e.target.closest('.gaip-modal-popup')) return;
      var trigger = e.target.closest('.ant-select, .ant-picker, .ant-cascader'); arm(trigger);
      syncPortals();
    }, true);
    document.addEventListener('focusin', function (e) {
      var trigger = e.target.closest('.ant-select, .ant-picker, .ant-cascader'), owner = rootOf(trigger);
      if (owner && (!pending || pending.trigger !== trigger)) arm(trigger);
      syncPortals();
    });
    document.addEventListener('click', function (e) {
      var el = e.target.closest('.gaip-native-date'); if (el && rootOf(el) && !el.disabled && !el.readOnly) { e.preventDefault(); openNative(el, el); }
    }, true);
    document.addEventListener('keydown', function (e) {
      var antTrigger = e.target.closest && e.target.closest('.ant-select, .ant-picker, .ant-cascader');
      if (antTrigger && ['ArrowDown', 'Enter', ' ', 'F4'].indexOf(e.key) >= 0) arm(antTrigger);
      if (active) {
        if (e.target.closest && e.target.closest('.gaip-date-panel') && ['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','Home','End'].indexOf(e.key)>=0) return;
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeNative(true); return; }
        if (e.key === 'Tab') { closeNative(true); return; }
        if (active.panel.contains(e.target) && ['ArrowDown','ArrowUp','Home','End'].indexOf(e.key) >= 0 && e.target.tagName === 'BUTTON') {
          var items = Array.prototype.slice.call(e.target.parentElement.querySelectorAll('button:not(:disabled)')), at = items.indexOf(e.target);
          var to = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (at + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
          if (items[to]) { e.preventDefault(); items[to].focus(); } return;
        }
      }
      if (e.target.matches('.gaip-native-date') && (e.key === 'ArrowDown' && e.altKey || e.key === 'F4')) { e.preventDefault(); openNative(e.target, e.target); }
    }, true);
    document.addEventListener('scroll', function (e) { if (active && !active.panel.contains(e.target)) closeNative(false); }, true);
    document.addEventListener('reset', function () { queueMicrotask(scan); }, true);
    ['input', 'change'].forEach(function (name) { document.addEventListener(name, function (e) { if (rootOf(e.target) && e.target.matches('input, textarea, select')) { valueState(e.target); syncClear(e.target); } }, true); });
    w.addEventListener('resize', position);
    w.addEventListener('resize', function () { clears.forEach(function (state, el) { placeClear(el, state); }); });
  }
  w.__GAIP_MODAL_CONTROLS__ = { version: '1.1.0', scan: scan, adopt: adopt, openNative: openNative, close: closeNative, rootOf: rootOf, revealInvalidField: revealInvalidField, destroy: function () { stopped = true; terminalValidation.forEach(function (state) { state.destroy(); }); document.removeEventListener('invalid', queueInvalid, true); if (invalidTimer !== null) w.clearTimeout(invalidTimer); invalidTimer = null; invalidBatches.clear(); if (observer) observer.disconnect(); if (resizeObserver) resizeObserver.disconnect(); closeNative(false); clears.forEach(function (state, el) { releaseClear(el, state); }); resizeHandles.forEach(function (state, el) { releaseResize(el, state); }); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
}(window));
