(function () {
  'use strict';
  if (window.__GAIP_TABLE__) return;
  var instances = new WeakMap(), sequence = 0;
  function el(tag, cls, text) { var node = document.createElement(tag); if (cls) node.className = cls; if (text != null) node.textContent = text; return node; }
  // Static labels for table cells; text is never interpreted as HTML.
  function tag(text, options) {
    var tone = options && options.tone;
    if (['neutral', 'success', 'highlight'].indexOf(tone) < 0) tone = 'neutral';
    return el('span', 'gaip-table__tag gaip-table__tag--' + tone, text);
  }
  function button(text, action, disabled) { var node = el('button', 'gaip-table__button', text); node.type = 'button'; node.dataset.tableAction = action; node.disabled = !!disabled; return node; }
  function mount(root, options) {
    if (instances.has(root)) instances.get(root).destroy();
    var config = options || {}, columns = config.columns || [], rows = config.rows || [];
    var page = 1, size = config.pageSize || 10, state = 'ready', destroyed = false, frame = 0;
    var picker = null, pickerTrigger = null, pickerId = 'gaip-table-size-' + (++sequence);
    var sizes = config.pageSizes || [10, 20, 50];
    if (!sizes.includes(size)) sizes = [size].concat(sizes);
    root.classList.add('gaip-table');
    var scroll = el('div', 'gaip-table__scroll' + (config.scrollClass ? ' ' + config.scrollClass : ''));
    scroll.tabIndex = 0; scroll.setAttribute('role', 'region'); scroll.setAttribute('aria-label', (config.title || '数据') + '，可滚动查看');
    var table = el('table', 'gaip-table__table' + (config.tableClass ? ' ' + config.tableClass : ''));
    table.dataset.rowVerticalAlign = config.rowVerticalAlign === 'top' ? 'top' : 'middle';
    table.setAttribute('aria-label', config.title || '数据列表');
    if (config.minWidth) table.style.minWidth = config.minWidth + 'px';
    var colgroup = el('colgroup'), head = el('thead'), heading = el('tr'), body = el('tbody');
    function cellStyle(cell, col) {
      if (col.align) cell.style.textAlign = col.align;
      if (col.fixed) {
        cell.dataset.fixed = col.fixed; cell.style.setProperty('--fixed-offset', (col.offset || 0) + 'px');
        var fixedColumns = columns.filter(function (c) { return c.fixed === col.fixed; });
        if (col === (col.fixed === 'left' ? fixedColumns[fixedColumns.length - 1] : fixedColumns[0])) cell.dataset.fixedEdge = col.fixed;
      }
    }
    columns.forEach(function (col, i) {
      var width = el('col'); if (col.width) width.style.width = col.width + 'px'; colgroup.appendChild(width);
      var th = el('th'); th.scope = 'col'; cellStyle(th, col);
      th.textContent = col.label;
      heading.appendChild(th);
    });
    head.appendChild(heading); table.append(colgroup, head, body); scroll.appendChild(table);
    // Keep real column headers in the data table for assistive technology.
    // A presentation-only copy sits outside the vertical scrolling viewport.
    var headerBand = el('div', 'gaip-table__head-band'), headerViewport = el('div', 'gaip-table__head');
    headerBand.appendChild(headerViewport);
    var headerTable = table.cloneNode(false); headerTable.removeAttribute('aria-label'); headerTable.setAttribute('aria-hidden', 'true');
    headerTable.append(colgroup.cloneNode(true), head.cloneNode(true)); headerViewport.appendChild(headerTable);
    head.classList.add('gaip-table__semantic-head');
    var pager = el('nav', 'gaip-table__pagination'); pager.setAttribute('aria-label', '分页');
    var total = el('span', 'gaip-table__total'); total.setAttribute('role', 'status'); total.setAttribute('aria-live', 'polite');
    var controls = el('div', 'gaip-table__page-controls');
    pager.append(total, controls); root.replaceChildren(headerBand, scroll);
    if (config.pagination !== false) root.appendChild(pager);
    function totalPages() { return config.pagination === false ? 1 : Math.max(1, Math.ceil(rows.length / size)); }
    function drawBody() {
      body.replaceChildren(); root.setAttribute('aria-busy', String(state === 'loading'));
      if (state !== 'ready' || !rows.length) {
        var tr = el('tr'), td = el('td', 'gaip-table__empty'); td.colSpan = Math.max(1, columns.length);
        var message = el('div', '', state === 'loading' ? '正在加载…' : state === 'error' ? '加载失败，请重试' : (config.emptyText || '暂无数据'));
        message.setAttribute('role', state === 'error' ? 'alert' : 'status'); td.appendChild(message);
        if (state === 'error' && config.onRetry) td.appendChild(button('重新加载', 'retry'));
        tr.appendChild(td); body.appendChild(tr); return;
      }
      (config.pagination === false ? rows : rows.slice((page - 1) * size, page * size)).forEach(function (row, index) {
        var tr = el('tr');
        columns.forEach(function (col) {
          var td = el('td'); cellStyle(td, col);
          // renderHTML is reserved for application-owned, escaped templates. Data fields use textContent.
          if (col.renderHTML) td.innerHTML = col.renderHTML(row, index);
          else { var value = col.render ? col.render(row, index) : row[col.key]; if (value instanceof window.Node) td.appendChild(value); else td.textContent = value == null ? '—' : String(value); }
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
    }
    function drawPager() {
      if (config.pagination === false) return;
      var pages = totalPages(), disabled = state !== 'ready';
      total.textContent = '共 ' + rows.length + ' 条';
      controls.replaceChildren();
      var label = el('div', 'gaip-table__size'), trigger = button(size + ' 条/页', 'size', disabled);
      trigger.classList.add('gaip-table__size-trigger'); trigger.dataset.tableSize = ''; trigger.id = pickerId + '-trigger';
      trigger.setAttribute('role', 'combobox'); trigger.setAttribute('aria-label', '每页条数'); trigger.setAttribute('aria-haspopup', 'listbox'); trigger.setAttribute('aria-expanded', 'false'); trigger.setAttribute('aria-controls', pickerId);
      var icon = el('span', 'gaip-table__size-icon'); icon.setAttribute('aria-hidden', 'true'); trigger.appendChild(icon); label.appendChild(trigger);
      if (pages > 1) {
      var prev = button('‹', 'previous', disabled || page <= 1); prev.setAttribute('aria-label', '上一页'); controls.appendChild(prev);
      }
      var visible = new Set([1, pages, page - 1, page, page + 1]);
      if (pages <= 5) for (var i = 1; i <= pages; i++) visible.add(i);
      var last = 0;
      Array.from(visible).filter(function (n) { return n >= 1 && n <= pages; }).sort(function (a, b) { return a - b; }).forEach(function (n) {
        if (last && n - last > 1) { var dots = el('span', 'gaip-table__ellipsis', '…'); dots.setAttribute('aria-hidden', 'true'); controls.appendChild(dots); }
        var b = button(n, 'page', disabled); b.dataset.page = n; b.setAttribute('aria-label', '第 ' + n + ' 页');
        if (n === page) { b.setAttribute('aria-current', 'page'); b.classList.add('is-current'); } controls.appendChild(b); last = n;
      });
      if (pages > 1) {
      var next = button('›', 'next', disabled || page >= pages); next.setAttribute('aria-label', '下一页'); controls.appendChild(next);
      }
      controls.appendChild(label);
    }
    function draw(resetScroll) {
      page = Math.max(1, Math.min(page, totalPages()));
      var active = document.activeElement, focusKey = active && root.contains(active) ? { action: active.dataset.tableAction, page: active.dataset.page, size: active.hasAttribute('data-table-size') } : null;
      closePicker(false); drawBody(); drawPager();
      if (resetScroll) scroll.scrollTop = 0;
      if (focusKey && !root.contains(active)) {
        var replacement = focusKey.size ? controls.querySelector('[data-table-size]') : Array.from(controls.querySelectorAll('button')).find(function (b) { return b.dataset.tableAction === focusKey.action && b.dataset.page === focusKey.page && !b.disabled; });
        if (!replacement) replacement = controls.querySelector('[aria-current="page"]') || controls.querySelector('[data-table-size]');
        if (replacement) replacement.focus({ preventScroll: true });
      }
      schedule();
    }
    function changePage(n) { if (state !== 'ready') return; page = Math.max(1, Math.min(n, totalPages())); draw(true); if (config.onChange) config.onChange({ page: page, pageSize: size }); }
    function onClick(event) {
      var b = event.target.closest('[data-table-action]'); if (!b || !root.contains(b) || b.disabled) return;
      var action = b.dataset.tableAction;
      if (action === 'next') changePage(page + 1); else if (action === 'previous') changePage(page - 1); else if (action === 'page') changePage(Number(b.dataset.page));
      else if (action === 'size') { if (picker) closePicker(false); else openPicker(b); }
      else if (action === 'retry') config.onRetry(api);

    }
    function closePicker(restore) {
      if (!picker) return;
      var trigger = pickerTrigger; picker.remove(); picker = null; pickerTrigger = null;
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      document.removeEventListener('pointerdown', pickerOutside, true); document.removeEventListener('focusin', pickerFocus, true); window.removeEventListener('scroll', positionPicker, true);
      if (restore && trigger && trigger.isConnected) trigger.focus({ preventScroll: true });
    }
    function pickerOutside(event) { if (picker && !picker.contains(event.target) && !pickerTrigger.contains(event.target)) closePicker(false); }
    function pickerFocus(event) { if (picker && !picker.contains(event.target) && event.target !== pickerTrigger) closePicker(false); }
    function positionPicker() {
      if (!picker) return;
      if (!pickerTrigger.isConnected || !pickerTrigger.getClientRects().length) return closePicker(false);
      var r = pickerTrigger.getBoundingClientRect(), gap = 6;
      var availableBelow = window.innerHeight - r.bottom - gap - 8, availableAbove = r.top - gap - 8;
      var below = availableBelow >= Math.min(200, sizes.length * 36 + 8) || availableBelow >= availableAbove;
      picker.style.maxHeight = Math.max(36, below ? availableBelow : availableAbove) + 'px';
      picker.style.width = Math.min(Math.max(112, r.width), window.innerWidth - 16) + 'px';
      picker.style.left = Math.max(8, Math.min(r.left, window.innerWidth - picker.offsetWidth - 8)) + 'px';
      picker.style.top = Math.max(8, below ? r.bottom + gap : r.top - picker.offsetHeight - gap) + 'px';
      picker.dataset.placement = below ? 'bottom' : 'top';
    }
    function openPicker(trigger) {
      if (state !== 'ready') return;
      closePicker(false); pickerTrigger = trigger;
      picker = el('div', 'gaip-table-size-popup'); picker.id = pickerId; picker.setAttribute('role', 'listbox'); picker.setAttribute('aria-label', '每页条数');
      sizes.forEach(function (n) {
        var option = el('button', 'gaip-table-size-popup__option', n + ' 条/页'); option.type = 'button'; option.tabIndex = -1; option.setAttribute('role', 'option'); option.setAttribute('aria-selected', String(n === size));
        option.addEventListener('click', function () { closePicker(false); size = n; changePage(1); controls.querySelector('[data-table-size]').focus({ preventScroll: true }); }); picker.appendChild(option);
      });
      var dialog = trigger.closest('dialog[open]');
      (dialog || document.body).appendChild(picker);
      // A body portal is inert behind a modal; keep ownership inside its dialog
      // and use the top layer so centered transforms do not offset viewport coordinates.
      if (dialog && typeof picker.showPopover === 'function') {
        picker.setAttribute('popover', 'manual'); picker.style.margin = '0'; picker.style.inset = 'auto'; picker.showPopover();
      }
      trigger.setAttribute('aria-expanded', 'true'); positionPicker();
      picker.addEventListener('keydown', function (event) {
        var options = Array.from(picker.children), index = options.indexOf(document.activeElement);
        if (event.key === 'Escape') { event.preventDefault(); closePicker(true); }
        else if (event.key === 'Tab') closePicker(true);
        else if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) { event.preventDefault(); var next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length; options[next].focus(); }
      });
      picker.querySelector('[aria-selected="true"]').focus({ preventScroll: true });
      document.addEventListener('pointerdown', pickerOutside, true); document.addEventListener('focusin', pickerFocus, true); window.addEventListener('scroll', positionPicker, true);
    }
    function onKeydown(event) {
      if (event.target.hasAttribute('data-table-size') && ['ArrowDown','ArrowUp'].includes(event.key)) { event.preventDefault(); openPicker(event.target); }
    }
    function layout() {
      frame = 0; if (destroyed || !root.isConnected || !root.getClientRects().length) { closePicker(false); return; }
      var boundary = typeof config.boundary === 'function' ? config.boundary() : config.boundary;
      var bottom = window.innerHeight - (config.bottomGap == null ? 24 : config.bottomGap);
      if (boundary) { var r = boundary.getBoundingClientRect(), style = getComputedStyle(boundary); bottom = Math.min(bottom, r.bottom - (parseFloat(style.paddingBottom) || 0) - (parseFloat(style.borderBottomWidth) || 0)); }
      // Extremely short viewports retain a usable body; the containing page may scroll in that case.
      var maximum = Math.max(headerBand.offsetHeight + pager.offsetHeight + 100, Math.floor(bottom - root.getBoundingClientRect().top));
      if (root.style.maxHeight !== maximum + 'px') root.style.maxHeight = maximum + 'px';
      // Match the data table's width and reserve only its native vertical scrollbar gutter.
      headerViewport.style.marginRight = Math.max(0, scroll.offsetWidth - scroll.clientWidth) + 'px';
      headerTable.style.width = table.getBoundingClientRect().width + 'px';
      updateEdges(); positionPicker();
    }
    function updateEdges() {
      headerViewport.scrollLeft = scroll.scrollLeft;
      root.classList.toggle('has-hidden-left', scroll.scrollLeft > 1);
      root.classList.toggle('has-hidden-right', scroll.scrollWidth - scroll.clientWidth - scroll.scrollLeft > 1);
    }
    scroll.addEventListener('scroll', updateEdges, { passive: true });
    function schedule() { if (!destroyed && !frame) frame = requestAnimationFrame(layout); }
    root.addEventListener('click', onClick); root.addEventListener('keydown', onKeydown); window.addEventListener('resize', schedule);
    var observer = window.ResizeObserver ? new ResizeObserver(schedule) : null;
    if (observer) { observer.observe(root); observer.observe(headerViewport); observer.observe(scroll); observer.observe(pager); observer.observe(table); for (var ancestor = root.parentElement; ancestor; ancestor = ancestor.parentElement) { observer.observe(ancestor); Array.from(ancestor.children).forEach(function (child) { observer.observe(child); }); } }
    var api = {
      setRows: function (next, resetPage) { rows = next || []; if (resetPage) page = 1; draw(true); },
      setState: function (next) { state = next; draw(false); },
      setPage: changePage,
      getState: function () { return { page: page, pageSize: size, total: rows.length, state: state }; },
      refresh: schedule,
      destroy: function () { if (destroyed) return; destroyed = true; closePicker(false); cancelAnimationFrame(frame); if (observer) observer.disconnect(); window.removeEventListener('resize', schedule); scroll.removeEventListener('scroll', updateEdges); root.removeEventListener('click', onClick); root.removeEventListener('keydown', onKeydown); root.replaceChildren(); root.classList.remove('gaip-table', 'has-hidden-left', 'has-hidden-right'); root.style.removeProperty('max-height'); root.removeAttribute('aria-busy'); instances.delete(root); }
    };
    instances.set(root, api); draw(false); return api;
  }
  window.__GAIP_TABLE__ = { tag: tag, mount: mount, get: function (root) { return instances.get(root); } };
}());
