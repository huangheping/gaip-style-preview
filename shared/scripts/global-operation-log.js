(function () {
  'use strict';
  if (window.__GAIP_OPERATION_LOG__) return;
  var script = document.currentScript;
  var rootUrl = new URL('../../', script.src);
  var panelSequence = 0;
  function createController(inlineHost) {
  var idPrefix = inlineHost ? 'gaip-log-page-' + (++panelSequence) + '-' : 'gaip-log-';
  var dialog, form, previousFocus;
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
    if (!value) return '<span class="gaip-log-number">-</span>';
    var text = textValue(value);
    var long = text.length > 80 || text.split('\n').length >= 4;
    var content = typeof value === 'string' ? value.split('\n').map(function (line) {
      return '<p>' + escapeHtml(line) + '</p>';
    }).join('') : Object.keys(value).map(function (key) {
      return '<p><span class="gaip-log-field">' + escapeHtml(key) + '：</span>' +
        '<span>' + escapeHtml(value[key]) + '</span></p>';
    }).join('');
    return '<div id="' + id + '" class="gaip-log-copy' + (long ? ' is-collapsed' : '') + '">' + content +
      '</div>' + (long ? '<button type="button" class="gaip-log-text-button gaip-log-expand" aria-expanded="false" aria-controls="' +
      id + '" data-log-expand>展开全部</button>' : '');
  }
  function render() {
    var f = filters(), records = filtered(f), total = records.length;
    var pages = Math.max(1, Math.ceil(total / pageSize));
    page = Math.max(1, Math.min(page, pages));
    var start = (page - 1) * pageSize;
    dialog.querySelector('tbody').innerHTML = records.slice(start, start + pageSize).map(function (r, i) {
      return '<tr><td class="gaip-log-number">' + (start + i + 1) + '</td><td class="gaip-log-time">' +
        escapeHtml(r.time.replace(/-/g, '/')) + '</td><td><span class="gaip-log-person">' + escapeHtml(r.name) +
        '</span><span>' + escapeHtml(r.account) + '</span><span class="gaip-log-ip">' + escapeHtml(r.ip) +
        '</span></td><td>' + escapeHtml(r.module) + '</td><td><span class="gaip-log-tag" data-type="' +
        escapeHtml(r.type) + '">' + escapeHtml(r.type) + '</span></td><td>' +
        copyCell(r.content, idPrefix + 'content-' + i) + '</td><td>' +
        copyCell(r.before, idPrefix + 'before-' + i) + '</td><td>' +
        copyCell(r.after, idPrefix + 'after-' + i) + '</td></tr>';
    }).join('') || '<tr><td colspan="8" class="gaip-log-empty"><strong>' +
      (invalidDate(f) ? '请检查操作时间范围' : '暂无匹配的操作日志') +
      '</strong>' + (invalidDate(f) ? '开始日期不能晚于结束日期。' : '试试调整筛选条件，或点击“重置”查看全部模拟记录。') + '</td></tr>';
    dialog.querySelector('[data-log-summary]').textContent = '共 ' + total + ' 条，第 ' + (total ? page : 0) + ' / ' + (total ? pages : 0) + ' 页';
    dialog.querySelector('[data-log-current]').textContent = total ? page : '—';
    dialog.querySelector('[data-log-prev]').disabled = page <= 1;
    dialog.querySelector('[data-log-next]').disabled = page >= pages;
    dialog.querySelector('[data-log-export]').disabled = total === 0;
    form.elements.start.setAttribute('aria-invalid', String(invalidDate(f)));
    form.elements.end.setAttribute('aria-invalid', String(invalidDate(f)));
    message(invalidDate(f) ? '开始日期不能晚于结束日期，请重新选择。' :
      '本地模拟数据 · 时间倒序', invalidDate(f));
    dialog.querySelector('.gaip-log-table-wrap').scrollTop = 0;
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
    dialog = document.createElement(inlineHost ? 'section' : 'dialog');
    dialog.className = 'gaip-log-dialog';
    dialog.id = inlineHost ? idPrefix + 'panel' : 'gaip-operation-log';
    dialog.setAttribute('aria-labelledby', 'gaip-log-title');
    dialog.setAttribute('aria-describedby', 'gaip-log-description');
    dialog.innerHTML =
      '<header class="gaip-log-header"><div><div class="gaip-log-title"><h2 id="gaip-log-title">操作日志</h2>' +
      '<span class="gaip-log-mock">本地模拟数据</span></div><p id="gaip-log-description">查看公告管理与资讯中心的操作记录；仅用于样式预览，不是真实审计日志。</p></div>' +
      '<div class="gaip-log-actions"><button type="button" class="gaip-log-button gaip-log-export" data-log-export>' +
      '<img alt="" src="' + asset('全局组件/海报分享/assets/gaip-icon-download.svg') + '">导出 Excel</button>' +
      '<button type="button" class="gaip-log-close" aria-label="关闭操作日志" autofocus data-log-close><img alt="" src="' +
      asset('全局组件/海报分享/assets/gaip-icon-close.svg') + '"></button></div></header>' +
      '<form class="gaip-log-filters"><div class="gaip-log-filter-row">' +
      '<select name="module" aria-label="功能模块"><option value="">全部模块</option><option>公告管理</option><option>资讯中心</option></select>' +
      '<select name="type" aria-label="操作类型"><option value="">全部操作类型</option><option>新增</option><option>编辑</option><option>删除</option><option>查看</option></select>' +
      '</div><div class="gaip-log-filter-row"><div class="gaip-log-dates"><label for="gaip-log-start">操作时间</label>' +
      '<input type="date" id="gaip-log-start" name="start" aria-label="操作开始日期"><span>至</span>' +
      '<input type="date" name="end" aria-label="操作结束日期"></div>' +
      '<input type="search" class="gaip-log-search" name="query" aria-label="姓名、域账号或操作内容" placeholder="请输入姓名/域账号/操作内容">' +
      '<button type="button" class="gaip-log-text-button" data-log-reset>重置</button></div></form>' +
      '<div class="gaip-log-feedback" role="status" aria-live="polite"></div>' +
      '<div class="gaip-log-table-wrap" tabindex="0" role="region" aria-label="操作日志表格，可横向滚动">' +
      '<table class="gaip-log-table"><colgroup>' +
      [4, 12, 13, 8, 7, 18, 19, 19].map(function (width) { return '<col style="width:' + width + '%">'; }).join('') +
      '</colgroup><thead><tr>' + columns.map(function (c) { return '<th scope="col">' + c + '</th>'; }).join('') +
      '</tr></thead><tbody></tbody></table></div>' +
      '<footer class="gaip-log-footer"><div class="gaip-log-footer-left"><span data-log-summary></span>' +
      '<select aria-label="每页条数"><option value="10">10 条/页</option><option value="20">20 条/页</option><option value="50">50 条/页</option></select></div>' +
      '<nav class="gaip-log-pages" aria-label="日志分页"><button type="button" class="gaip-log-button" data-log-prev>上一页</button>' +
      '<span class="gaip-log-page-current" aria-current="page" data-log-current>1</span>' +
      '<button type="button" class="gaip-log-button" data-log-next>下一页</button></nav></footer>';
    if (inlineHost) {
      dialog.classList.add('gaip-log-inline');
      dialog.querySelector('[data-log-close]').remove();
      ['title', 'description', 'start'].forEach(function (key) {
        dialog.querySelector('#gaip-log-' + key).id = idPrefix + key;
      });
      dialog.querySelector('label').htmlFor = idPrefix + 'start';
      dialog.setAttribute('aria-labelledby', idPrefix + 'title');
      dialog.setAttribute('aria-describedby', idPrefix + 'description');
    }
    (inlineHost || document.body).appendChild(dialog);
    form = dialog.querySelector('form');
    dialog.querySelectorAll('.gaip-log-dates input[type="date"]').forEach(function (input) {
      input.addEventListener('click', function () {
        if (typeof input.showPicker !== 'function') return;
        try { input.showPicker(); } catch (error) { /* 浏览器已打开原生选择器时无需重复处理。 */ }
      });
    });
    form.addEventListener('submit', function (event) { event.preventDefault(); page = 1; render(); });
    form.addEventListener('input', function () { page = 1; render(); });
    form.addEventListener('change', function () { page = 1; render(); });
    dialog.querySelector('.gaip-log-footer select').addEventListener('change', function (event) {
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
      }
    });
    // 原生 dialog 提供顶层遮罩、背景 inert 和焦点循环；Esc 与关闭按钮走同一清理路径。
    dialog.addEventListener('cancel', function (event) { event.preventDefault(); hide(); });
    dialog.addEventListener('close', function () {
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
    document.documentElement.classList.add('gaip-log-scroll-lock');
    var trigger = document.querySelector('[data-config-log]');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
  }
  function hide() { if (dialog && dialog.open) dialog.close(); }
  if (inlineHost) {
    makeDialog();
    render();
    return { destroy: function () { dialog.remove(); } };
  }
  var api = { show: show, hide: hide, mount: createController };
  document.querySelectorAll('.gaip-log-trigger').forEach(function (button) { button.remove(); });
  window.addEventListener('hashchange', hide);
  return api;
  }
  window.__GAIP_OPERATION_LOG__ = createController(null);
}());
