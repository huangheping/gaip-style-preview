(function () {
  'use strict';

  if (window.__GAIP_ANNOUNCEMENT_MANAGEMENT__) return;

  var PAGE_SIZE = 10;
  var records = clone(window.__GAIP_ANNOUNCEMENT_MOCK_DATA__ || []);
  var mounted = null;
  var activeDialog = null;
  var activeTitleTooltip = null;
  var activeTitleTarget = null;
  var sequence = records.length + 1;

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function displayTitle(record) { return record.simplified || record.traditional || record.english || '-'; }
  function statusFor(record, nowValue) {
    var now = nowValue ? new Date(nowValue) : new Date();
    var start = new Date(record.start), end = new Date(record.end);
    if (now < start) return { key: 'upcoming', label: '未开始' };
    if (now > end) return { key: 'offline', label: '已下架' };
    return { key: 'active', label: '展示中' };
  }
  function datePart(value) { return String(value || '').slice(0, 10); }
  function timePart(value, fallback) { return String(value || '').slice(11, 19) || fallback; }
  function formatTime(value) { return String(value || '').replace('T', ' '); }
  function recordById(id) { return records.find(function (record) { return record.id === id; }) || null; }
  function closeDialog() { if (activeDialog && activeDialog.open) activeDialog.close(); }
  function announce(text) {
    if (!mounted) return;
    var feedback = mounted.root.querySelector('[data-announcement-feedback]');
    feedback.textContent = text;
    feedback.hidden = false;
    clearTimeout(mounted.feedbackTimer);
    mounted.feedbackTimer = setTimeout(function () { if (feedback.isConnected) feedback.hidden = true; }, 2800);
  }
  function titleLanguages(record) {
    return [
      { label: '简体中文', value: record.simplified },
      { label: '繁體中文', value: record.traditional },
      { label: 'English', value: record.english }
    ].filter(function (item) { return Boolean(item.value); });
  }
  function hideTitleTooltip() {
    if (activeTitleTarget) activeTitleTarget.removeAttribute('aria-describedby');
    if (activeTitleTooltip) activeTitleTooltip.remove();
    activeTitleTooltip = null;
    activeTitleTarget = null;
  }
  function showTitleTooltip(target) {
    var record = recordById(target && target.dataset.announcementTitleTooltip);
    if (!record || activeTitleTarget === target) return;
    hideTitleTooltip();
    var tooltip = document.createElement('div');
    var tooltipId = 'gaip-announcement-title-tooltip-' + record.id;
    tooltip.id = tooltipId;
    tooltip.className = 'ant-tooltip css-10wz6x1 gaip-announcement-title-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.innerHTML = '<div class="ant-tooltip-content"><div class="ant-tooltip-inner">' + titleLanguages(record).map(function (item) {
      return '<div class="gaip-announcement-title-tooltip-row"><small>' + item.label + '</small><p>' + escapeHtml(item.value) + '</p></div>';
    }).join('') + '</div></div>';
    document.body.appendChild(tooltip);
    target.setAttribute('aria-describedby', tooltipId);
    activeTitleTooltip = tooltip;
    activeTitleTarget = target;
    var targetRect = target.getBoundingClientRect();
    var tooltipRect = tooltip.getBoundingClientRect();
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var left = Math.max(16, Math.min(targetRect.left, viewportWidth - tooltipRect.width - 16));
    var top = targetRect.bottom + 8;
    if (top + tooltipRect.height > viewportHeight - 16) top = Math.max(16, targetRect.top - tooltipRect.height - 8);
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }
  function plusIcon() {
    return '<span class="ant-btn-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span>';
  }
  function closeIcon() {
    return '<span role="img" aria-hidden="true" class="anticon anticon-close"><svg viewBox="64 64 896 896"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7a16 16 0 0 0-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1a16 16 0 0 0 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1z"/></svg></span>';
  }
  function paginationIcon(direction) {
    var path = direction === 'left'
      ? 'M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L304 453.4c-32.7 25.6-32.7 75.1 0 100.7l407.1 318.7c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.5-6.1-12.5L369 503.8l348.9-273.1c3.8-2.9 6.1-7.5 6.1-12.4z'
      : 'M765.7 486.8L314.9 134.7A7.9 7.9 0 0 0 302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1a15.95 15.95 0 0 0-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a63.95 63.95 0 0 0 0-100.4z';
    return '<span role="img" aria-hidden="true" class="anticon anticon-' + direction + '"><svg viewBox="64 64 896 896" width="1em" height="1em" focusable="false" fill="currentColor"><path d="' + path + '"></path></svg></span>';
  }
  function paginationItems(page, pages) {
    var tokens = [], index;
    if (pages <= 7) {
      for (index = 1; index <= pages; index++) tokens.push(index);
      return tokens;
    }
    if (page <= 4) return [1, 2, 3, 4, 5, 'next', pages];
    if (page >= pages - 3) return [1, 'prev', pages - 4, pages - 3, pages - 2, pages - 1, pages];
    return [1, 'prev', page - 2, page - 1, page, page + 1, page + 2, 'next', pages];
  }
  function renderPagination(page, pages, total) {
    var items = paginationItems(page, pages).map(function (token) {
      if (token === 'prev' || token === 'next') {
        var backwards = token === 'prev';
        var destination = backwards ? Math.max(1, page - 5) : Math.min(pages, page + 5);
        var label = backwards ? '向前跳 5 页' : '向后跳 5 页';
        return '<li title="' + label + '" class="ant-pagination-jump-' + token + ' gaip-announcement-page-jump"><button type="button" class="ant-pagination-item-link" data-announcement-page="' + destination + '" aria-label="' + label + '"><span class="ant-pagination-item-container"><span class="ant-pagination-item-ellipsis" aria-hidden="true">•••</span></span></button></li>';
      }
      return '<li title="' + token + '" class="ant-pagination-item ant-pagination-item-' + token +
        (token === page ? ' ant-pagination-item-active' : '') + '"><a rel="nofollow" data-announcement-page="' + token +
        '" aria-label="第 ' + token + ' 页"' + (token === page ? ' aria-current="page"' : '') + '>' + token + '</a></li>';
    }).join('');
    return '<ul class="ant-pagination ant-pagination-end ant-table-pagination css-10wz6x1 css-var-r0 gaip-announcement-pagination" aria-label="公告分页">' +
      '<li class="ant-pagination-total-text">共 ' + total + ' 条，第 ' + (total ? page : 0) + ' / ' + (total ? pages : 0) + ' 页</li>' +
      '<li title="上一页" class="ant-pagination-prev' + (page <= 1 ? ' ant-pagination-disabled' : '') + '" aria-disabled="' + (page <= 1) + '"><button type="button" class="ant-pagination-item-link" data-announcement-page="' +
      Math.max(1, page - 1) + '" aria-label="上一页"' + (page <= 1 ? ' disabled' : '') + '>' + paginationIcon('left') + '</button></li>' + items +
      '<li title="下一页" class="ant-pagination-next' + (page >= pages ? ' ant-pagination-disabled' : '') + '" aria-disabled="' + (page >= pages) + '"><button type="button" class="ant-pagination-item-link" data-announcement-page="' +
      Math.min(pages, page + 1) + '" aria-label="下一页"' + (page >= pages ? ' disabled' : '') + '>' + paginationIcon('right') + '</button></li></ul>';
  }
  function rowMarkup(record, index) {
    var status = statusFor(record), title = displayTitle(record);
    var deleteControl = status.key === 'active'
      ? '<span class="gaip-announcement-disabled-action" title="展示中的公告不可删除"><button type="button" class="ant-btn ant-btn-link ant-btn-dangerous gaip-announcement-action" disabled aria-label="删除公告：' + escapeHtml(title) + '">删除</button></span>'
      : '<button type="button" class="ant-btn ant-btn-link ant-btn-dangerous gaip-announcement-action" data-announcement-delete="' + escapeHtml(record.id) + '">删除</button>';
    return '<tr class="ant-table-row"><td class="ant-table-cell gaip-announcement-index">' + (index + 1) + '</td>' +
      '<td class="ant-table-cell"><span class="gaip-announcement-title-text" tabindex="0" data-announcement-title-tooltip="' + escapeHtml(record.id) + '">' + escapeHtml(title) + '</span></td>' +
      '<td class="ant-table-cell"><time class="gaip-announcement-period" datetime="' + escapeHtml(record.start) + '"><span class="gaip-announcement-period-row"><small>开始</small><span>' + escapeHtml(formatTime(record.start)) + '</span></span><span class="gaip-announcement-period-row"><small>结束</small><span>' + escapeHtml(formatTime(record.end)) + '</span></span></time></td>' +
      '<td class="ant-table-cell"><span class="ant-tag gaip-announcement-status is-' + status.key + '">' + status.label + '</span></td>' +
      '<td class="ant-table-cell"><div class="gaip-announcement-actions"><button type="button" class="ant-btn ant-btn-link gaip-announcement-action" data-announcement-edit="' + escapeHtml(record.id) + '">编辑</button>' + deleteControl + '</div></td></tr>';
  }
  function renderPage(instance) {
    hideTitleTooltip();
    var pages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
    instance.page = Math.max(1, Math.min(instance.page, pages));
    var start = (instance.page - 1) * PAGE_SIZE;
    var pageRecords = records.slice(start, start + PAGE_SIZE);
    var body = pageRecords.length ? pageRecords.map(function (record, index) { return rowMarkup(record, index); }).join('') :
      '<tr><td colspan="5" class="ant-table-cell"><div class="ant-empty gaip-announcement-empty"><span class="gaip-announcement-empty-icon" aria-hidden="true"><svg viewBox="0 0 64 48"><path d="M8 13h48v27H8z"/><path d="M16 8h32l8 5H8z"/><path d="M23 26h18"/></svg></span><p class="ant-empty-description">暂无公告，点击右上角新建</p></div></td></tr>';
    instance.root.innerHTML = '<section class="gaip-announcement-page" aria-labelledby="gaip-announcement-title"><header class="gaip-announcement-header"><div><h1 id="gaip-announcement-title">公告管理</h1><p>管理 GAIP 工作台与官网展示的公告内容</p></div><button type="button" class="ant-btn ant-btn-primary css-10wz6x1 gaip-announcement-create" data-announcement-create>' + plusIcon() + '<span>新建公告</span></button></header>' +
      '<div class="ant-message gaip-announcement-feedback" data-announcement-feedback role="status" aria-live="polite" hidden></div>' +
      '<div class="ant-table-wrapper gaip-announcement-table-wrap"><div class="ant-table ant-table-fixed-header"><div class="ant-table-container"><div class="ant-table-content"><table class="gaip-announcement-table"><colgroup><col style="width:8%"><col style="width:38%"><col style="width:29%"><col style="width:12%"><col style="width:13%"></colgroup><thead class="ant-table-thead"><tr><th class="ant-table-cell" scope="col">序号</th><th class="ant-table-cell" scope="col">标题</th><th class="ant-table-cell" scope="col">生效时间段</th><th class="ant-table-cell" scope="col">状态</th><th class="ant-table-cell" scope="col">操作</th></tr></thead><tbody class="ant-table-tbody">' + body + '</tbody></table></div></div></div>' +
      renderPagination(instance.page, pages, records.length) + '</div></section>';
  }
  function mount(host) {
    if (mounted) mounted.destroy();
    var root = document.createElement('div');
    root.className = 'gaip-announcement-mount';
    host.appendChild(root);
    var instance = { root: root, page: 1, feedbackTimer: 0 };
    root.addEventListener('click', function (event) {
      var target = event.target.closest('[data-announcement-create],[data-announcement-edit],[data-announcement-delete],[data-announcement-page]');
      if (!target) return;
      if (target.hasAttribute('data-announcement-create')) openForm('create', null, target);
      else if (target.hasAttribute('data-announcement-edit')) openForm('edit', recordById(target.dataset.announcementEdit), target);
      else if (target.hasAttribute('data-announcement-delete')) openDelete(target.dataset.announcementDelete, target);
      else if (!target.disabled) { instance.page = Number(target.dataset.announcementPage); renderPage(instance); }
    });
    root.addEventListener('mouseover', function (event) {
      var target = event.target.closest('[data-announcement-title-tooltip]');
      if (target && root.contains(target)) showTitleTooltip(target);
    });
    root.addEventListener('mouseout', function (event) {
      var target = event.target.closest('[data-announcement-title-tooltip]');
      if (target && !target.contains(event.relatedTarget)) hideTitleTooltip();
    });
    root.addEventListener('focusin', function (event) {
      var target = event.target.closest('[data-announcement-title-tooltip]');
      if (target) showTitleTooltip(target);
    });
    root.addEventListener('focusout', function (event) {
      var target = event.target.closest('[data-announcement-title-tooltip]');
      if (target && !target.contains(event.relatedTarget)) hideTitleTooltip();
    });
    instance.destroy = function () {
      clearTimeout(instance.feedbackTimer);
      hideTitleTooltip();
      closeDialog();
      root.remove();
      if (mounted === instance) mounted = null;
    };
    mounted = instance;
    renderPage(instance);
    return instance;
  }
  function markErrors(form, errors) {
    var titleError = form.querySelector('[data-announcement-title-error]');
    var periodError = form.querySelector('[data-announcement-period-error]');
    titleError.textContent = errors.title || '';
    titleError.hidden = !errors.title;
    periodError.textContent = errors.period || '';
    periodError.hidden = !errors.period;
    form.querySelector('[data-announcement-title-group]').classList.toggle('is-error', Boolean(errors.title));
    form.querySelector('[data-announcement-period-group]').classList.toggle('is-error', Boolean(errors.period));
  }
  function values(form) {
    return {
      simplified: form.elements.simplified.value.trim(),
      traditional: form.elements.traditional.value.trim(),
      english: form.elements.english.value.trim(),
      startDate: form.elements.startDate.value,
      startTime: form.elements.startTime.value || '09:00:00',
      endDate: form.elements.endDate.value,
      endTime: form.elements.endTime.value || '23:59:59'
    };
  }
  function validate(value) {
    var errors = {};
    if (!value.simplified && !value.traditional && !value.english) errors.title = '请至少填写一种语言标题';
    if (!value.startDate || !value.endDate) errors.period = '请填写完整的展示时间段';
    else if (new Date(value.endDate + 'T' + value.endTime) <= new Date(value.startDate + 'T' + value.startTime)) errors.period = '结束时间必须晚于开始时间';
    return errors;
  }
  function inputMarkup(name, label, placeholder, value) {
    var escaped = escapeHtml(value || '');
    return '<label class="ant-form-item ant-form-item-vertical css-var-r0 ant-form-css-var css-10wz6x1 gaip-announcement-field"><span class="gaip-announcement-label">' + label + '</span><span class="ant-input-textarea ant-input-textarea-show-count gaip-announcement-input-wrap"><textarea class="ant-input ant-input-outlined css-10wz6x1 css-var-r0 ant-input-css-var gaip-announcement-title-input" name="' + name + '" maxlength="100" rows="1" data-announcement-autosize placeholder="' + placeholder + '">' + escaped + '</textarea><small data-count-for="' + name + '">' + String(value || '').length + '/100</small></span></label>';
  }
  function resizeTitleInput(input) {
    if (!input) return;
    input.style.height = 'auto';
    var contentHeight = input.scrollHeight || 48;
    input.style.height = Math.min(Math.max(contentHeight, 48), 112) + 'px';
    input.style.overflowY = contentHeight > 112 ? 'auto' : 'hidden';
  }
  function timeRow(label, prefix, value, defaultTime) {
    return '<div class="gaip-announcement-time-group"><span class="gaip-announcement-time-label">' + label + '时间</span><div class="gaip-announcement-time-controls"><input class="ant-input ant-input-outlined css-10wz6x1 css-var-r0 ant-input-css-var" type="date" name="' + prefix + 'Date" aria-label="' + label + '日期" value="' + escapeHtml(datePart(value)) + '"><input class="ant-input ant-input-outlined css-10wz6x1 css-var-r0 ant-input-css-var" type="time" step="1" name="' + prefix + 'Time" aria-label="' + label + '时间" value="' + escapeHtml(timePart(value, defaultTime)) + '"></div></div>';
  }
  function showDialog(dialog, trigger) {
    closeDialog();
    activeDialog = dialog;
    var previousFocus = trigger || document.activeElement;
    document.body.appendChild(dialog);
    dialog.addEventListener('cancel', function (event) { event.preventDefault(); dialog.close(); });
    dialog.addEventListener('close', function () {
      dialog.remove();
      if (activeDialog === dialog) activeDialog = null;
      if (previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    }, { once: true });
    dialog.showModal();
    return dialog;
  }
  function openForm(mode, record, trigger) {
    if (mode === 'edit' && !record) record = records[0] || null;
    var editing = mode === 'edit' && record;
    var dialog = document.createElement('dialog');
    dialog.className = 'ant-modal css-10wz6x1 css-var-r0 ant-modal-css-var formModal____MTrk gaip-announcement-dialog';
    dialog.setAttribute('aria-labelledby', 'gaip-announcement-dialog-title');
    var formId = 'gaip-announcement-' + (editing ? 'edit' : 'create') + '-form';
    dialog.innerHTML = '<div class="ant-modal-content"><button type="button" class="ant-modal-close gaip-announcement-modal-close" aria-label="关闭"><span class="ant-modal-close-x">' + closeIcon() + '</span></button><div class="ant-modal-header gaip-announcement-modal-header"><div class="ant-modal-title" id="gaip-announcement-dialog-title">' + (editing ? '编辑公告' : '新建公告') + '</div></div>' +
      '<div class="ant-modal-body gaip-announcement-modal-body"><form id="' + formId + '" class="ant-form ant-form-vertical css-var-r0 ant-form-css-var css-10wz6x1 gaip-announcement-form" novalidate><section class="gaip-announcement-form-section" data-announcement-title-group><div class="gaip-announcement-section-heading"><h3>公告标题配置 <span aria-hidden="true">*</span></h3><p>至少填写一种语言版本；未填写的语言环境不会展示该公告。</p></div>' +
      inputMarkup('simplified', '简体中文', '请输入简体中文公告标题', editing ? record.simplified : '') +
      inputMarkup('traditional', '繁體中文', '請輸入繁體中文公告標題', editing ? record.traditional : '') +
      inputMarkup('english', 'English', 'Enter announcement title', editing ? record.english : '') +
      '<p class="ant-form-item-explain-error gaip-announcement-form-error" data-announcement-title-error role="alert" hidden></p></section>' +
      '<section class="gaip-announcement-form-section" data-announcement-period-group><div class="gaip-announcement-section-heading"><h3>展示时间段 <span aria-hidden="true">*</span></h3><p>状态由开始和结束时间自动计算，不支持人工修改。</p></div><div class="gaip-announcement-time-grid">' +
      timeRow('开始', 'start', editing ? record.start : '', '09:00:00') + '<span class="gaip-announcement-time-separator" aria-hidden="true">~</span>' + timeRow('结束', 'end', editing ? record.end : '', '23:59:59') +
      '</div><p class="ant-form-item-explain-error gaip-announcement-form-error" data-announcement-period-error role="alert" hidden></p></section></form></div>' +
      '<div class="ant-modal-footer footer___UhMLM gaip-announcement-modal-footer"><button type="button" class="ant-btn css-10wz6x1 css-var-r0 ant-btn-default ant-btn-color-default ant-btn-variant-outlined" data-announcement-cancel><span>取消</span></button><button type="submit" form="' + formId + '" class="ant-btn css-10wz6x1 css-var-r0 ant-btn-primary ant-btn-color-primary ant-btn-variant-solid"><span>保存</span></button></div></div>';
    var form = dialog.querySelector('form');
    dialog.querySelector('[data-announcement-cancel]').addEventListener('click', function () { dialog.close(); });
    dialog.querySelector('.gaip-announcement-modal-close').addEventListener('click', function () { dialog.close(); });
    form.addEventListener('input', function (event) {
      if (event.target.matches('[data-announcement-autosize]')) {
        form.querySelector('[data-count-for="' + event.target.name + '"]').textContent = event.target.value.length + '/100';
        resizeTitleInput(event.target);
      }
      markErrors(form, {});
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = values(form), errors = validate(value);
      markErrors(form, errors);
      if (errors.title || errors.period) {
        var invalid = form.querySelector('.is-error input, .is-error textarea');
        if (invalid) invalid.focus();
        return;
      }
      var saved = {
        id: editing ? record.id : 'announcement-local-' + sequence++,
        simplified: value.simplified,
        traditional: value.traditional,
        english: value.english,
        start: value.startDate + 'T' + value.startTime,
        end: value.endDate + 'T' + value.endTime
      };
      if (editing) records[records.indexOf(record)] = saved;
      else records.unshift(saved);
      if (mounted) { mounted.page = 1; renderPage(mounted); }
      dialog.close();
      announce(editing ? '公告已更新' : '公告已创建');
    });
    showDialog(dialog, trigger);
    form.querySelectorAll('[data-announcement-autosize]').forEach(resizeTitleInput);
    return dialog;
  }
  function openDelete(id, trigger) {
    var record = recordById(id) || records.find(function (item) { return statusFor(item).key !== 'active'; });
    if (!record || statusFor(record).key === 'active') return null;
    var title = displayTitle(record);
    var dialog = document.createElement('dialog');
    dialog.className = 'ant-modal css-10wz6x1 css-var-r0 ant-modal-css-var gaip-announcement-dialog gaip-announcement-confirm';
    dialog.setAttribute('aria-labelledby', 'gaip-announcement-delete-title');
    dialog.innerHTML = '<div class="ant-modal-content"><button type="button" class="ant-modal-close gaip-announcement-modal-close" aria-label="关闭"><span class="ant-modal-close-x">' + closeIcon() + '</span></button><div class="ant-modal-header gaip-announcement-modal-header"><div class="ant-modal-title" id="gaip-announcement-delete-title">确认删除该公告？</div></div><div class="ant-modal-body gaip-announcement-confirm-body"><span class="gaip-announcement-warning" aria-hidden="true">!</span><div><strong>“' + escapeHtml(title) + '”</strong><p>删除后不可恢复，请确认是否继续。</p></div></div><div class="ant-modal-footer footer___UhMLM gaip-announcement-modal-footer"><button type="button" class="ant-btn css-10wz6x1 css-var-r0 ant-btn-default ant-btn-color-default ant-btn-variant-outlined cancelBtn___H8rvL" data-announcement-cancel><span>取消</span></button><button type="button" class="ant-btn css-10wz6x1 css-var-r0 ant-btn-primary ant-btn-color-error ant-btn-variant-solid ant-btn-dangerous confirmBtn___LDHYN" data-announcement-confirm-delete><span>确认删除</span></button></div></div>';
    dialog.querySelector('[data-announcement-cancel]').addEventListener('click', function () { dialog.close(); });
    dialog.querySelector('.gaip-announcement-modal-close').addEventListener('click', function () { dialog.close(); });
    dialog.querySelector('[data-announcement-confirm-delete]').addEventListener('click', function () {
      records = records.filter(function (item) { return item.id !== record.id; });
      if (mounted) renderPage(mounted);
      dialog.close();
      announce('公告已删除');
    });
    return showDialog(dialog, trigger);
  }

  /* @gaip-modal
  {
    "id": "config-announcement-create",
    "title": "新建公告",
    "channel": "配置中心 / 公告管理",
    "type": "modal",
    "status": "ready",
    "height": 800,
    "after": "config-adjust-member-node",
    "source": "window.__GAIP_ANNOUNCEMENT_MANAGEMENT__.openCreate()",
    "invoke": { "path": "__GAIP_ANNOUNCEMENT_MANAGEMENT__.openCreate", "args": [] },
    "styles": ["web/umi.c6286171.css", "shared/styles/global-font.css", "features/config-center/ant-source.css", "features/config-center/config-center-content.css?v=20260903-32", "features/config-center/announcement-management.css"],
    "scripts": ["features/config-center/announcement-management-data.js?v=20260903-2", "features/config-center/announcement-management-view.js?v=20260903-6"]
  }
  */
  /* @gaip-modal
  {
    "id": "config-announcement-edit",
    "title": "编辑公告",
    "channel": "配置中心 / 公告管理",
    "type": "modal",
    "status": "ready",
    "height": 800,
    "after": "config-announcement-create",
    "source": "window.__GAIP_ANNOUNCEMENT_MANAGEMENT__.openEdit()",
    "invoke": { "path": "__GAIP_ANNOUNCEMENT_MANAGEMENT__.openEdit", "args": [] },
    "styles": ["web/umi.c6286171.css", "shared/styles/global-font.css", "features/config-center/ant-source.css", "features/config-center/config-center-content.css?v=20260903-32", "features/config-center/announcement-management.css"],
    "scripts": ["features/config-center/announcement-management-data.js?v=20260903-2", "features/config-center/announcement-management-view.js?v=20260903-6"]
  }
  */
  /* @gaip-modal
  {
    "id": "config-announcement-delete",
    "title": "删除公告确认",
    "channel": "配置中心 / 公告管理",
    "type": "confirm",
    "status": "ready",
    "height": 520,
    "after": "config-announcement-edit",
    "source": "window.__GAIP_ANNOUNCEMENT_MANAGEMENT__.openDelete()",
    "invoke": { "path": "__GAIP_ANNOUNCEMENT_MANAGEMENT__.openDelete", "args": [] },
    "styles": ["web/umi.c6286171.css", "shared/styles/global-font.css", "features/config-center/ant-source.css", "features/config-center/config-center-content.css?v=20260903-32", "features/config-center/announcement-management.css"],
    "scripts": ["features/config-center/announcement-management-data.js?v=20260903-2", "features/config-center/announcement-management-view.js?v=20260903-6"]
  }
  */

  window.__GAIP_ANNOUNCEMENT_MANAGEMENT__ = {
    mount: mount,
    openCreate: function (trigger) { return openForm('create', null, trigger); },
    openEdit: function (id, trigger) { return openForm('edit', recordById(id), trigger); },
    openDelete: openDelete,
    statusFor: statusFor,
    paginationItems: paginationItems,
    getRecords: function () { return clone(records); },
    reset: function () { records = clone(window.__GAIP_ANNOUNCEMENT_MOCK_DATA__ || []); if (mounted) { mounted.page = 1; renderPage(mounted); } }
  };
}());
