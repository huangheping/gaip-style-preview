/* @gaip-markup-cache:start */
// Generated from the owned templates/markup-*.html; run npm run build:templates.
var __gaipMarkup_2e008a53a1 = (function () {
  var templates = {"copyCell-1":"<span class=\"gaip-log-number\">-</span>","copyCell-2":"<p>{{gaip:0}}</p>","copyCell-3":"<p><span class=\"gaip-log-field\">{{gaip:0}}：</span><span>{{gaip:1}}</span></p>","copyCell-4":"<div id=\"{{gaip:0}}\" class=\"gaip-log-copy{{gaip:1}}\">{{gaip:2}}</div>{{gaip:3}}","copyCell-5":"<button type=\"button\" class=\"gaip-log-text-button gaip-log-expand\" aria-expanded=\"false\" aria-controls=\"{{gaip:0}}\" data-log-expand>展开全部</button>","render-6":"<tr><td class=\"gaip-log-number\">{{gaip:0}}</td><td class=\"gaip-log-time\">{{gaip:1}}</td><td><span class=\"gaip-log-person\">{{gaip:2}}</span><span>{{gaip:3}}</span><span class=\"gaip-log-ip\">{{gaip:4}}</span></td><td>{{gaip:5}}</td><td><span class=\"gaip-log-tag\" data-type=\"{{gaip:6}}\">{{gaip:7}}</span></td><td>{{gaip:8}}</td><td>{{gaip:9}}</td><td>{{gaip:10}}</td></tr>","render-7":"<tr><td colspan=\"8\" class=\"gaip-log-empty\"><strong>{{gaip:0}}</strong>{{gaip:1}}</td></tr>","makeDialog-8":"<div class=\"gaip-log-filter-mount\"></div>","makeDialog-9":"<form class=\"gaip-log-filters\"><div class=\"gaip-log-filter-row\"><select name=\"module\" aria-label=\"功能模块\"><option value=\"\">全部模块</option><option>公告管理</option><option>资讯中心</option></select><select name=\"type\" aria-label=\"操作类型\"><option value=\"\">全部操作类型</option><option>新增</option><option>编辑</option><option>删除</option><option>查看</option></select></div><div class=\"gaip-log-filter-row\"><div class=\"gaip-log-dates\"><label for=\"gaip-log-start\">操作时间</label><input type=\"date\" id=\"gaip-log-start\" name=\"start\" aria-label=\"操作开始日期\"><span>至</span><input type=\"date\" name=\"end\" aria-label=\"操作结束日期\"></div><input type=\"search\" class=\"gaip-log-search\" name=\"query\" aria-label=\"姓名、域账号或操作内容\" placeholder=\"请输入姓名/域账号/操作内容\"><button type=\"button\" class=\"gaip-log-text-button\" data-log-reset>重置</button></div></form>","makeDialog-10":"<header class=\"gaip-log-header\"><div><div class=\"gaip-log-title\"><h2 id=\"gaip-log-title\">操作日志</h2><span class=\"gaip-log-mock\">本地模拟数据</span></div><p id=\"gaip-log-description\">查看公告管理与资讯中心的操作记录；仅用于样式预览，不是真实审计日志。</p></div><div class=\"gaip-log-actions\"><button type=\"button\" class=\"gaip-log-button gaip-log-export\" data-log-export><img alt=\"\" src=\"{{gaip:0}}\">导出 Excel</button><button type=\"button\" class=\"gaip-log-close\" aria-label=\"关闭操作日志\" autofocus data-log-close><img alt=\"\" src=\"{{gaip:1}}\"></button></div></header><div class=\"gaip-log-body\">{{gaip:2}}<div class=\"gaip-log-feedback\" role=\"status\" aria-live=\"polite\"></div>{{gaip:3}}</div>","inlineTable":"<div class=\"gaip-log-table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"操作日志表格，可横向滚动\"><table class=\"gaip-log-table\"><colgroup>{{gaip:0}}</colgroup><thead><tr>{{gaip:1}}</tr></thead><tbody></tbody></table></div><footer class=\"gaip-log-footer\"><div class=\"gaip-log-footer-left\"><span data-log-summary></span><select aria-label=\"每页条数\"><option value=\"10\">10 条/页</option><option value=\"20\">20 条/页</option><option value=\"50\">50 条/页</option></select></div><nav class=\"gaip-log-pages\" aria-label=\"日志分页\"><button type=\"button\" class=\"gaip-log-button\" data-log-prev>上一页</button><span class=\"gaip-log-page-current\" aria-current=\"page\" data-log-current>1</span><button type=\"button\" class=\"gaip-log-button\" data-log-next>下一页</button></nav></footer>","modalTable":"<section class=\"gaip-log-results\" aria-label=\"操作日志表格\"></section>","personCell":"<span class=\"gaip-log-person\">{{gaip:0}}</span><span>{{gaip:1}}</span><span class=\"gaip-log-ip\">{{gaip:2}}</span>","typeCell":"<span class=\"gaip-log-tag\" data-type=\"{{gaip:0}}\">{{gaip:0}}</span>","makeDialog-11":"<col class=\"gaip-log-col-width-{{gaip:0}}\">","makeDialog-12":"<th scope=\"col\">{{gaip:0}}</th>"};
  return function (id, values) {
    if (!Object.prototype.hasOwnProperty.call(templates, id)) throw new Error("Missing HTML template: " + id);
    return templates[id].replace(/\{\{gaip:(\d+)\}\}/g, function (_, index) {
      if (!values || !Object.prototype.hasOwnProperty.call(values, index)) throw new Error("Missing HTML binding: " + id + ":" + index);
      return values[index];
    });
  };
}());
/* @gaip-markup-cache:end */
(function () {
  'use strict';
  if (window.__GAIP_OPERATION_LOG__) return;
  var script = document.currentScript;
  var rootUrl = new URL('../../', script.src);
  var panelSequence = 0;
  function createController(inlineHost) {
  var idPrefix = inlineHost ? 'gaip-log-page-' + (++panelSequence) + '-' : 'gaip-log-';
  var dialog, form, previousFocus, filterBar, sharedTable;
  var page = 1, pageSize = 10;
  var columns = ['序号', '操作时间', '操作人 / IP 地址', '功能模块', '操作类型', '操作内容', '变更前', '变更后'];

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function asset(path) { return escapeHtml(new URL(path, rootUrl).href); }
  function data() {
    return (window.__GAIP_OPERATION_LOG_DATA__ || []).slice().sort(function (a, b) {
      return b.time.localeCompare(a.time);
    });
  }
  function filters() {
    if (filterBar) {
      var values = filterBar.getValues();
      return {
        module: values.module,
        type: values.type,
        start: values.period && values.period[0] || '',
        end: values.period && values.period[1] || '',
        query: String(values.query || '').trim().toLowerCase()
      };
    }
    return {
      module: form.elements.module.value,
      type: form.elements.type.value,
      start: form.elements.start.value,
      end: form.elements.end.value,
      query: form.elements.query.value.trim().toLowerCase()
    };
  }
  function invalidDate(f) { return Boolean(f.start && f.end && f.start > f.end); }
  function filtered(f) {
    if (invalidDate(f)) return [];
    return data().filter(function (record) {
      var date = record.time.slice(0, 10);
      return (!f.module || record.module === f.module) &&
        (!f.type || record.type === f.type) &&
        (!f.start || date >= f.start) && (!f.end || date <= f.end) &&
        (!f.query || (record.name + ' ' + record.account + ' ' + textValue(record.content)).toLowerCase().includes(f.query));
    });
  }
  function message(text, error) {
    var feedback = dialog.querySelector('.gaip-log-feedback');
    feedback.textContent = text;
    feedback.setAttribute('data-error', error ? 'true' : 'false');
  }
  function textValue(value) {
    if (!value) return '-';
    if (typeof value === 'string') return value;
    return Object.keys(value).map(function (key) { return key + '：' + value[key]; }).join('\n');
  }
  function copyCell(value, id) {
    if (!value) return __gaipMarkup_2e008a53a1("copyCell-1");
    var text = textValue(value);
    var long = text.length > 80 || text.split('\n').length >= 4;
    var content = typeof value === 'string' ? value.split('\n').map(function (line) {
      return __gaipMarkup_2e008a53a1("copyCell-2", [('' + (escapeHtml(line)))]);
    }).join('') : Object.keys(value).map(function (key) {
      return __gaipMarkup_2e008a53a1("copyCell-3", [('' + (escapeHtml(key))), ('' + (escapeHtml(value[key])))]);
    }).join('');
    return __gaipMarkup_2e008a53a1("copyCell-4", [('' + (id)), ('' + (long ? ' is-collapsed' : '')), ('' + (content)), ('' + (long ? __gaipMarkup_2e008a53a1("copyCell-5", [('' + (id))]) : ''))]);
  }
  function render() {
    var f = filters(), records = filtered(f), total = records.length;
    if (!inlineHost) {
      mountTable();
      sharedTable.setRows(records.map(function (record, index) { return Object.assign({}, record, { rowNumber: index + 1 }); }), true);
    } else {
      var pages = Math.max(1, Math.ceil(total / pageSize));
      page = Math.max(1, Math.min(page, pages));
      var start = (page - 1) * pageSize;
      dialog.querySelector('tbody').innerHTML = records.slice(start, start + pageSize).map(function (r, i) {
        return __gaipMarkup_2e008a53a1("render-6", [('' + (start + i + 1)), ('' + (escapeHtml(r.time.replace(/-/g, '/')))), ('' + (escapeHtml(r.name))), ('' + (escapeHtml(r.account))), ('' + (escapeHtml(r.ip))), ('' + (escapeHtml(r.module))), ('' + (escapeHtml(r.type))), ('' + (escapeHtml(r.type))), ('' + (copyCell(r.content, idPrefix + 'content-' + i))), ('' + (copyCell(r.before, idPrefix + 'before-' + i))), ('' + (copyCell(r.after, idPrefix + 'after-' + i)))]);
      }).join('') || __gaipMarkup_2e008a53a1("render-7", [('' + (invalidDate(f) ? '请检查操作时间范围' : '暂无匹配的操作日志')), ('' + (invalidDate(f) ? '开始日期不能晚于结束日期。' : '试试调整筛选条件，或点击“重置”查看全部模拟记录。'))]);
      dialog.querySelector('[data-log-summary]').textContent = '共 ' + total + ' 条，第 ' + (total ? page : 0) + ' / ' + (total ? pages : 0) + ' 页';
      dialog.querySelector('[data-log-current]').textContent = total ? page : '—';
      dialog.querySelector('[data-log-prev]').disabled = page <= 1;
      dialog.querySelector('[data-log-next]').disabled = page >= pages;
      dialog.querySelector('.gaip-log-table-wrap').scrollTop = 0;
    }
    dialog.querySelector('[data-log-export]').disabled = total === 0;
    if (!filterBar) {
      form.elements.start.setAttribute('aria-invalid', String(invalidDate(f)));
      form.elements.end.setAttribute('aria-invalid', String(invalidDate(f)));
    }
    message(invalidDate(f) ? '开始日期不能晚于结束日期，请重新选择。' :
      '本地模拟数据 · 时间倒序', invalidDate(f));
  }
  function mountTable() {
    if (sharedTable) return;
    var widths = [60, 150, 160, 100, 90, 220, 220, 220];
    var definitions = [
      { key: 'rowNumber' },
      { key: 'time', render: function (r) { return r.time.replace(/-/g, '/'); } },
      { key: 'name', renderHTML: function (r) { return __gaipMarkup_2e008a53a1('personCell', [escapeHtml(r.name), escapeHtml(r.account), escapeHtml(r.ip)]); } },
      { key: 'module' },
      { key: 'type', renderHTML: function (r) { return __gaipMarkup_2e008a53a1('typeCell', [escapeHtml(r.type)]); } }
    ];
    ['content', 'before', 'after'].forEach(function (key) {
      definitions.push({ key: key, renderHTML: function (r) { return copyCell(r[key], idPrefix + key + '-' + r.rowNumber); } });
    });
    sharedTable = window.__GAIP_TABLE__.mount(dialog.querySelector('.gaip-log-results'), {
      columns: definitions.map(function (column, index) { return Object.assign(column, { label: columns[index], width: widths[index] }); }),
      title: '操作日志',
      rows: [], pageSize: pageSize, minWidth: 1220, rowVerticalAlign: 'top',
      boundary: dialog.querySelector('.gaip-log-body'), bottomGap: 0,
      emptyText: '暂无匹配的操作日志',
      onChange: function (state) { pageSize = state.pageSize; }
    });
  }
  function exportRecords() {
    var records = filtered(filters());
    if (!records.length) return;
    try {
      var rows = [columns].concat(records.map(function (r, i) {
        return [i + 1, r.time, r.name + ' (' + r.account + ')\n' + r.ip, r.module, r.type,
          r.content, textValue(r.before), textValue(r.after)];
      }));
      var blob = window.__GAIP_OPERATION_LOG_XLSX__.build(rows);
      var url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url;
      link.download = '操作日志_模拟数据_' + new Date().toISOString().slice(0, 10) + '.xlsx';
      link.hidden = true;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
      message('已生成 ' + records.length + ' 条筛选结果的 Excel 文件，请在下载列表查看。');
    } catch (error) {
      message('导出失败，请重新打开页面后重试。', true);
    }
  }
  function makeDialog() {
    if (dialog) return;
    var useSharedFilter = Boolean(window.__GAIP_FILTER_BAR__ && window.__GAIP_DATE_PICKER__);
    var filterMarkup = useSharedFilter ? __gaipMarkup_2e008a53a1("makeDialog-8") :
      __gaipMarkup_2e008a53a1("makeDialog-9");
    dialog = document.createElement(inlineHost ? 'section' : 'dialog');
    dialog.className = 'gaip-log-dialog';
    dialog.id = inlineHost ? idPrefix + 'panel' : 'gaip-operation-log';
    dialog.setAttribute('aria-labelledby', 'gaip-log-title');
    dialog.setAttribute('aria-describedby', 'gaip-log-description');
    var tableMarkup = inlineHost ? __gaipMarkup_2e008a53a1('inlineTable', [
      [4, 12, 13, 8, 7, 18, 19, 19].map(function (width) { return __gaipMarkup_2e008a53a1('makeDialog-11', [width]); }).join(''),
      columns.map(function (c) { return __gaipMarkup_2e008a53a1('makeDialog-12', [c]); }).join('')
    ]) : __gaipMarkup_2e008a53a1('modalTable');
    dialog.innerHTML = __gaipMarkup_2e008a53a1('makeDialog-10', [asset('shared/assets/icons/third-party/ant-design/download-outlined.svg'), asset('shared/assets/icons/third-party/ant-design/close-outlined.svg'), filterMarkup, tableMarkup]);
    if (inlineHost) {
      dialog.classList.add('gaip-log-inline');
      dialog.querySelector('[data-log-close]').remove();
      ['title', 'description'].forEach(function (key) {
        dialog.querySelector('#gaip-log-' + key).id = idPrefix + key;
      });
      if (!useSharedFilter) {
        dialog.querySelector('#gaip-log-start').id = idPrefix + 'start';
        dialog.querySelector('label').htmlFor = idPrefix + 'start';
      }
      dialog.setAttribute('aria-labelledby', idPrefix + 'title');
      dialog.setAttribute('aria-describedby', idPrefix + 'description');
    }
    if (!inlineHost) {
      window.__GAIP_MODAL_COMPONENT__.adoptInformation(dialog, {
        surface: dialog, header: '.gaip-log-header', title: '#gaip-log-title', subtitle: '#gaip-log-description',
        body: '.gaip-log-body', close: '[data-log-close]'
      });
      dialog.querySelector('[data-log-export]').classList.add('gaip-modal__button', 'gaip-modal__button--primary');
    }
    (inlineHost || document.body).appendChild(dialog);
    if (useSharedFilter) {
      var filterMount = dialog.querySelector('.gaip-log-filter-mount');
      filterBar = window.__GAIP_FILTER_BAR__.mount(filterMount, {
        label: '操作日志筛选',
        mode: 'instant',
        debounce: 250,
        actions: { more: false, submit: false, reset: true },
        fields: [
          { key: 'module', type: 'select', label: '功能模块', options: [
            { value: '', label: '全部模块' }, { value: '公告管理', label: '公告管理' }, { value: '资讯中心', label: '资讯中心' }
          ] },
          { key: 'type', type: 'select', label: '操作类型', options: [
            { value: '', label: '全部操作类型' }, { value: '新增', label: '新增' }, { value: '编辑', label: '编辑' },
            { value: '删除', label: '删除' }, { value: '查看', label: '查看' }
          ] },
          { key: 'period', type: 'dateRange', label: '操作时间' },
          { key: 'query', type: 'search', label: '搜索', wide: true, placeholder: '请输入姓名/域账号/操作内容' }
        ],
        onChange: function () { page = 1; render(); }
      });
      form = filterMount.querySelector('.gaip-filter-bar');
      form.classList.add('gaip-log-filters', 'gaip-log-filters--shared');
      filterMount.querySelector('[data-filter-key="module"] select').name = 'module';
      filterMount.querySelector('[data-filter-key="type"] select').name = 'type';
      var periodInputs = filterMount.querySelectorAll('[data-filter-key="period"] input[type="date"]');
      periodInputs[0].name = 'start';
      periodInputs[1].name = 'end';
      filterMount.querySelector('[data-filter-key="query"] input[type="search"]').name = 'query';
    } else {
      form = dialog.querySelector('form');
      form.classList.add('gaip-log-filters--legacy');
      dialog.querySelectorAll('.gaip-log-dates input[type="date"]').forEach(function (input) {
        input.addEventListener('click', function (event) {
          if (event.defaultPrevented) return;
          if (typeof input.showPicker !== 'function') return;
          try { input.showPicker(); } catch (error) { /* 浏览器已打开原生选择器时无需重复处理。 */ }
        });
      });
      form.addEventListener('submit', function (event) { event.preventDefault(); page = 1; render(); });
      form.addEventListener('input', function () { page = 1; render(); });
      form.addEventListener('change', function () { page = 1; render(); });
    }
    if (inlineHost) dialog.querySelector('.gaip-log-footer select').addEventListener('change', function (event) {
      pageSize = Number(event.target.value); page = 1; render();
    });
    dialog.addEventListener('click', function (event) {
      var target = event.target;
      if (target.closest('[data-log-close]')) hide();
      else if (target.closest('[data-log-reset]')) { form.reset(); page = 1; render(); }
      else if (target.closest('[data-log-prev]')) { page--; render(); }
      else if (target.closest('[data-log-next]')) { page++; render(); }
      else if (target.closest('[data-log-export]')) exportRecords();
      else if (target.closest('[data-log-expand]')) {
        var button = target.closest('[data-log-expand]');
        var content = document.getElementById(button.getAttribute('aria-controls'));
        var expanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!expanded));
        button.textContent = expanded ? '展开全部' : '收起全部';
        content.classList.toggle('is-collapsed', expanded);
        if (sharedTable) sharedTable.refresh();
      }
    });
    // 原生 dialog 提供顶层遮罩、背景 inert 和焦点循环；Esc 与关闭按钮走同一清理路径。
    dialog.addEventListener('cancel', function (event) { event.preventDefault(); hide(); });
    dialog.addEventListener('close', function () {
      // Native close is queued: a rapid reopen must not destroy the new table.
      if (dialog.open) return;
      if (sharedTable) { sharedTable.destroy(); sharedTable = null; }
      document.documentElement.classList.remove('gaip-log-scroll-lock');
      var trigger = document.querySelector('[data-config-log]');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      if (previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    });
  }
  function show() {
    makeDialog();
    if (dialog.open) return;
    previousFocus = document.activeElement;
    render();
    dialog.showModal();
    sharedTable.refresh();
    document.documentElement.classList.add('gaip-log-scroll-lock');
    var trigger = document.querySelector('[data-config-log]');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
  }
  function hide() {
    if (!dialog || !dialog.open) return;
    if (sharedTable) { sharedTable.destroy(); sharedTable = null; }
    dialog.close();
  }
  if (inlineHost) {
    makeDialog();
    render();
    return { destroy: function () { if (filterBar) filterBar.destroy(); dialog.remove(); } };
  }
  var api = { show: show, hide: hide, mount: createController };
  document.querySelectorAll('.gaip-log-trigger').forEach(function (button) { button.remove(); });
  window.addEventListener('hashchange', hide);
  return api;
  }
  window.__GAIP_OPERATION_LOG__ = createController(null);
}());
