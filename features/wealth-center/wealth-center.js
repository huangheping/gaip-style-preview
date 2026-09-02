(function () {
  'use strict';

  var mock = window.__GAIP_WEALTH_MOCK__;
  var syncFrame = 0;
  var boundsFrame = 0;
  var originalTitle = '';
  var state = {
    workbenchFilter: 'all',
    workbenchFiles: mock ? mock.workbench.files.slice() : [],
    submitted: false,
    recordMonth: 'all',
    recordResult: 'all',
    selectedRecord: 0,
    wealthRange: 'month',
    wealthType: 'all',
    wealthSearch: '',
    drawerFile: null,
    dialog: ''
  };

  if (!mock) return;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function money(value) {
    return 'HK$' + Number(value || 0).toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function sum(list, key) {
    return list.reduce(function (total, item) {
      return total + Number(item[key] || 0);
    }, 0);
  }

  function currentView() {
    var query = (location.hash || '').split('?')[1] || '';
    var view = new URLSearchParams(query).get('gaip-view') || 'import-workbench';
    return ['import-workbench', 'import-records', 'my-wealth'].indexOf(view) >= 0
      ? view
      : 'import-workbench';
  }

  function viewLabel(view) {
    return {
      'import-workbench': '导入工作台',
      'import-records': '导入记录',
      'my-wealth': '我的财富值'
    }[view] || '导入工作台';
  }

  function wealthHash(view) {
    return '#/workspace?gaip-channel=wealth&gaip-view=' + (view || 'import-workbench');
  }

  function statusClass(value) {
    if (/失败|错误|作废/.test(value)) return 'danger';
    if (/预警|待核对|待提交|创建失败/.test(value)) return 'warning';
    if (/已提交|已核对|通过|已发放/.test(value)) return 'success';
    if (/历史/.test(value)) return 'blue';
    return 'neutral';
  }

  function tag(value, tone) {
    return '<span class="gaip-wealth-tag gaip-wealth-tag--' +
      escapeHtml(tone || statusClass(value)) + '">' + escapeHtml(value) + '</span>';
  }

  function icon(name) {
    var paths = {
      check: '<path d="m5 12 4 4L19 6"/>',
      upload: '<path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M5 14v5h14v-5"/>',
      search: '<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
      settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>'
    };
    return '<svg class="gaip-wealth-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || '') + '</svg>';
  }

  function workbenchFileRows(files) {
    if (!files.length) {
      return '<tr><td colspan="10"><div class="gaip-wealth-empty">暂无符合条件的文件</div></td></tr>';
    }
    return files.map(function (file) {
      return '<tr>' +
        '<td><strong class="gaip-wealth-cell-main">' + escapeHtml(file.name) + '</strong><small>' + escapeHtml(file.id) + ' · ' + escapeHtml(file.rule) + '</small></td>' +
        '<td>' + tag(file.type, file.type === '-' ? 'neutral' : 'warning') + '</td>' +
        '<td>' + escapeHtml(file.template) + '</td>' +
        '<td>' + escapeHtml(file.installment) + '</td>' +
        '<td>' + file.sourceRows + '</td>' +
        '<td>' + file.details + '</td>' +
        '<td><strong>' + money(file.amount) + '</strong></td>' +
        '<td>' + tag(file.result) + '</td>' +
        '<td><span class="gaip-wealth-issue gaip-wealth-issue--' + statusClass(file.result) + '">' + escapeHtml(file.issues.join('；') || '-') + '</span></td>' +
        '<td><button class="gaip-wealth-link" type="button" data-action="file-detail" data-file-id="' + escapeHtml(file.id) + '">详情</button></td>' +
      '</tr>';
    }).join('');
  }

  function renderWorkbench() {
    var allFiles = state.workbenchFiles;
    var files = allFiles.filter(function (file) {
      if (state.workbenchFilter === 'pass') return file.result === '通过';
      if (state.workbenchFilter === 'warning') return file.result === '预警';
      if (state.workbenchFilter === 'fail') return file.result === '失败';
      return true;
    });
    var valid = allFiles.filter(function (file) { return file.result !== '失败'; });
    var passed = allFiles.filter(function (file) { return file.result === '通过'; });
    var warnings = allFiles.filter(function (file) { return file.result === '预警'; });
    var failed = allFiles.filter(function (file) { return file.result === '失败'; });
    var summary = [
      [valid.length, '有效文件', '共 ' + allFiles.length + ' 个待校验文件'],
      [valid.length, '可入库文件', passed.length + ' 成功，' + warnings.length + ' 有告警'],
      [failed.length, '失败文件', failed.length ? '需修正文件名或模板' : '暂无失败文件'],
      [sum(valid, 'sourceRows'), '源数据行', '成功解析的数据行'],
      [sum(valid, 'details'), '生成明细', '可生成的财富值明细'],
      [money(sum(valid, 'amount')), '待入库财富值', '仅统计可提交的数据']
    ];

    return '<div class="gaip-wealth-workbench">' +
      '<header class="gaip-wealth-page-header"><div><h1>导入工作台</h1><p>批次 ' + escapeHtml(mock.workbench.batchId) + ' · 文件名决定财富值类型和分期</p></div></header>' +
      '<section class="gaip-wealth-workflow" aria-label="导入流程"><ol>' +
        [['✓', '上传文件', '已上传 ' + allFiles.length + ' 个文件', 'done'], ['✓', '结构识别', 'P01-P06 自动匹配', 'done'], ['3', '校验结果', '确认错误与警告', 'active'], ['4', '提交入库', '只提交通过文件', '']].map(function (step) {
          return '<li class="gaip-wealth-step gaip-wealth-step--' + step[3] + '"><span class="gaip-wealth-step-index">' + step[0] + '</span><span><strong>' + step[1] + '</strong><small>' + step[2] + '</small></span></li>';
        }).join('') +
      '</ol></section>' +
      '<section class="gaip-wealth-panel gaip-wealth-batch-panel"><header class="gaip-wealth-panel-head"><div><h2>批次设置</h2><p>批次月份提交后不可修改。</p></div>' + tag(state.submitted ? '已提交' : '待提交', state.submitted ? 'success' : 'neutral') + '</header>' +
        '<div class="gaip-wealth-batch-body"><div class="gaip-wealth-month-card"><span>财富值月份</span><div class="gaip-wealth-month-value"><strong>2026</strong><em>年</em><strong>08</strong><em>月</em></div><small>当前财富值月份</small></div>' +
          '<button class="gaip-wealth-upload-zone" type="button" data-action="simulate-upload">' + icon('upload') + '<strong>拖入或选择 .xlsx 文件</strong><span>本地 Mock 上传：单文件不超过 20MB，单批次最多 50 个。</span></button></div>' +
        '<div class="gaip-wealth-notice">' + icon('info') + '<span>类型和分期以文件名为正式来源；Excel 内的月份及“是否发放”不参与财富值计算。</span></div>' +
      '</section>' +
      '<section class="gaip-wealth-panel gaip-wealth-result-panel"><header class="gaip-wealth-panel-head gaip-wealth-result-head"><div><h2>校验结果</h2><p>临时文件已检查，不计入成功或失败数据</p></div>' +
        '<div class="gaip-wealth-page-actions"><div class="gaip-wealth-filter-buttons">' +
          [['all', '全部', allFiles.length], ['pass', '可导入', valid.length], ['warning', '预警', warnings.length], ['fail', '失败', failed.length]].map(function (item) {
            return '<button type="button" data-workbench-filter="' + item[0] + '" class="' + (state.workbenchFilter === item[0] ? 'is-active' : '') + '">' + item[1] + ' ' + item[2] + '</button>';
          }).join('') + '</div><button class="gaip-wealth-primary" type="button" data-action="submit-import"' + (state.submitted ? ' disabled' : '') + '>' + (state.submitted ? '已提交' : '提交 ' + valid.length + ' 个文件') + '</button></div></header>' +
        '<div class="gaip-wealth-summary">' + summary.map(function (item, index) {
          return '<div><strong class="' + (index === 5 ? 'is-money' : '') + '">' + escapeHtml(item[0]) + '</strong><span>' + item[1] + '</span><small>' + item[2] + '</small></div>';
        }).join('') + '</div>' +
        '<div class="gaip-wealth-table-scroll"><table class="gaip-wealth-table"><thead><tr><th>文件</th><th>类型</th><th>模板</th><th>期次</th><th>源行</th><th>明细</th><th>财富值 HKD</th><th>结果</th><th>问题</th><th>操作</th></tr></thead><tbody>' + workbenchFileRows(files) + '</tbody></table></div>' +
      '</section>' +
    '</div>';
  }

  function recordRows(records) {
    return records.map(function (record) {
      var index = mock.records.indexOf(record);
      return '<tr class="' + (state.selectedRecord === index ? 'is-selected' : '') + '" data-action="select-record" data-record-index="' + index + '">' +
        '<td><strong class="gaip-wealth-cell-main">' + record.id + '</strong></td>' +
        '<td>' + tag(record.type, record.type === '历史导入' ? 'blue' : 'warning') + '</td>' +
        '<td>' + record.month + '</td><td>' + tag(record.batchStatus) + '</td><td>' + tag(record.monthStatus) + '</td>' +
        '<td>' + record.importedAt + '</td><td>' + record.operator + '</td><td>' + record.fileCount + '</td>' +
        '<td><span class="gaip-wealth-delta gaip-wealth-delta--positive">' + record.success + '</span> / <span class="gaip-wealth-delta gaip-wealth-delta--negative">' + record.failed + '</span></td>' +
        '<td>' + record.details + '</td><td><strong>' + money(record.amount) + '</strong></td>' +
        '<td><span class="gaip-wealth-action-cell"><button type="button" class="gaip-wealth-link" data-action="select-record" data-record-index="' + index + '">查看文件</button><button type="button" class="gaip-wealth-link" data-action="review-record" data-record-index="' + index + '">核对</button></span></td>' +
      '</tr>';
    }).join('');
  }

  function recordFileRows(record) {
    if (!record || !record.files.length) {
      return '<tr><td colspan="10"><div class="gaip-wealth-empty">该批次暂无可展示的文件明细</div></td></tr>';
    }
    return record.files.map(function (file) {
      return '<tr><td><strong class="gaip-wealth-cell-main">' + escapeHtml(file.name) + '</strong><small>' + file.id + ' · 当前生效</small></td>' +
        '<td>' + file.template + '</td><td>' + tag(file.type, file.type === '-' ? 'neutral' : 'warning') + '</td><td>' + file.installment + '</td>' +
        '<td>' + tag(file.result) + '</td><td>1</td><td>' + file.details + '</td><td><strong>' + money(file.amount) + '</strong></td>' +
        '<td><span class="gaip-wealth-issue gaip-wealth-issue--' + statusClass(file.result) + '">' + escapeHtml(file.issues.join('；') || '-') + '</span></td>' +
        '<td><button class="gaip-wealth-link" type="button" data-action="file-detail" data-file-id="' + file.id + '">详情</button></td></tr>';
    }).join('');
  }

  function renderRecords() {
    var months = ['all'].concat(mock.records.map(function (item) { return item.month; }).filter(function (item, index, list) { return list.indexOf(item) === index; }));
    var records = mock.records.filter(function (record) {
      var monthMatch = state.recordMonth === 'all' || record.month === state.recordMonth;
      var resultMatch = state.recordResult === 'all' ||
        (state.recordResult === 'success' && record.batchStatus === '已提交') ||
        (state.recordResult === 'pending' && /待/.test(record.batchStatus + record.monthStatus)) ||
        (state.recordResult === 'fail' && /失败/.test(record.batchStatus + record.monthStatus));
      return monthMatch && resultMatch;
    });
    var selected = mock.records[state.selectedRecord] || mock.records[0];

    return '<div class="gaip-wealth-records"><header class="gaip-wealth-page-header gaip-wealth-page-header--row"><div><h1>导入记录</h1><p>同一财富值月份可有多个批次；按批次追踪文件、尝试次数和当前生效版本</p></div>' +
      '<div class="gaip-wealth-page-actions"><button class="gaip-wealth-secondary" type="button" data-action="keyword-settings">' + icon('settings') + '保司关键词</button><button class="gaip-wealth-primary" type="button" data-action="new-import">' + icon('upload') + '新建导入</button></div></header>' +
      '<section class="gaip-wealth-panel"><div class="gaip-wealth-filters">' +
        '<label>财富值月份<select data-record-filter="month">' + months.map(function (month) { return '<option value="' + escapeHtml(month) + '"' + (state.recordMonth === month ? ' selected' : '') + '>' + (month === 'all' ? '全部月份' : month) + '</option>'; }).join('') + '</select></label>' +
        '<label>批次结果<select data-record-filter="result"><option value="all">全部结果</option><option value="success"' + (state.recordResult === 'success' ? ' selected' : '') + '>已提交</option><option value="pending"' + (state.recordResult === 'pending' ? ' selected' : '') + '>待处理</option><option value="fail"' + (state.recordResult === 'fail' ? ' selected' : '') + '>失败</option></select></label>' +
        '<button class="gaip-wealth-primary" type="button">' + icon('search') + '查询</button></div>' +
        '<div class="gaip-wealth-table-scroll"><table class="gaip-wealth-table gaip-wealth-record-table"><thead><tr><th>批次编号</th><th>批次类型</th><th>财富值月份</th><th>批次状态</th><th>月份状态</th><th>导入时间</th><th>操作人</th><th>文件</th><th>成功 / 失败</th><th>明细</th><th>导入财富值 HKD</th><th>操作</th></tr></thead><tbody>' + (records.length ? recordRows(records) : '<tr><td colspan="12"><div class="gaip-wealth-empty">暂无符合条件的批次</div></td></tr>') + '</tbody></table></div>' +
        '<footer class="gaip-wealth-pagination"><span>共 ' + records.length + ' 条</span><button type="button" disabled>‹</button><button type="button" class="is-current">1</button><button type="button">›</button><span>10 条/页</span></footer>' +
      '</section>' +
      '<section class="gaip-wealth-panel gaip-wealth-record-detail"><header class="gaip-wealth-panel-head"><div><h2>' + selected.id + ' 批次文件</h2><p>' + selected.month + ' · ' + selected.fileCount + ' 个文件 · 当前生效文件优先展示</p></div><button class="gaip-wealth-secondary" type="button" data-action="mock-download">失败清单</button></header>' +
        '<div class="gaip-wealth-table-scroll"><table class="gaip-wealth-table"><thead><tr><th>文件及版本</th><th>模板</th><th>识别类型</th><th>期次</th><th>结果</th><th>尝试</th><th>明细</th><th>财富值 HKD</th><th>问题</th><th>操作</th></tr></thead><tbody>' + recordFileRows(selected) + '</tbody></table></div>' +
      '</section>' +
    '</div>';
  }

  function renderMyWealth() {
    var data = mock.myWealth;
    var details = data.details.filter(function (item) {
      var rangeMatch = state.wealthRange === 'all' || item.date.indexOf('2026-08') === 0;
      var typeMatch = state.wealthType === 'all' || item.type === state.wealthType;
      var search = state.wealthSearch.trim().toLowerCase();
      var searchMatch = !search || (item.product + item.orderNo + item.client).toLowerCase().indexOf(search) >= 0;
      return rangeMatch && typeMatch && searchMatch;
    });
    var types = data.breakdown.map(function (item) { return item.label; });

    return '<div class="gaip-wealth-my"><section class="gaip-wealth-overview"><div class="gaip-wealth-overview-stats">' +
      '<div class="gaip-wealth-big-stat"><span>本月已发财富值</span><strong><em>HK$</em>' + Math.round(data.monthAmount).toLocaleString('zh-CN') + '</strong><div><small>' + data.monthCount + ' 笔明细</small><small>' + data.month + '</small><small class="gaip-wealth-currency-chip"><img src="assets/wealth-center/hkd-currency.svg" alt="" aria-hidden="true">港币</small></div></div>' +
      '<div class="gaip-wealth-stat-divider"></div><div class="gaip-wealth-big-stat"><span>累计已发</span><strong><em>HK$</em>' + Math.round(data.totalAmount).toLocaleString('zh-CN') + '</strong><div><small>' + data.totalCount + ' 笔明细</small></div></div></div>' +
      '<div class="gaip-wealth-breakdown"><header><span>财富值构成（本月）</span><b>共' + data.monthCount + '笔</b></header><div>' + data.breakdown.map(function (item) {
        return '<article><p><span>' + item.label + '</span><strong>' + money(item.amount) + '</strong></p><i style="--wealth-progress:' + item.progress + '%"></i></article>';
      }).join('') + '</div></div></section>' +
      '<main class="gaip-wealth-content-card"><div class="gaip-wealth-my-filters"><div class="gaip-wealth-range-tabs"><button type="button" data-wealth-range="month" class="' + (state.wealthRange === 'month' ? 'is-active' : '') + '">08月明细（' + data.monthCount + '）</button><button type="button" data-wealth-range="all" class="' + (state.wealthRange === 'all' ? 'is-active' : '') + '">全部明细</button></div>' +
        '<div class="gaip-wealth-my-actions"><select data-wealth-type><option value="all">全部类型</option>' + types.map(function (type) { return '<option value="' + type + '"' + (state.wealthType === type ? ' selected' : '') + '>' + type + '</option>'; }).join('') + '</select><label class="gaip-wealth-search">' + icon('search') + '<input type="search" data-wealth-search placeholder="搜索产品或订单" value="' + escapeHtml(state.wealthSearch) + '"></label></div></div>' +
        '<div class="gaip-wealth-table-scroll gaip-wealth-my-table"><table class="gaip-wealth-table"><thead><tr><th>发放日期</th><th>财富值单号</th><th>财富值类型</th><th>产品 / 事项</th><th>客户</th><th>财富值 HKD</th><th>状态</th></tr></thead><tbody>' + (details.length ? details.map(function (item) {
          return '<tr><td>' + item.date + '</td><td><strong class="gaip-wealth-cell-main">' + item.orderNo + '</strong></td><td>' + tag(item.type, 'blue') + '</td><td>' + item.product + '</td><td>' + item.client + '</td><td><strong>' + money(item.amount) + '</strong></td><td>' + tag(item.status) + '</td></tr>';
        }).join('') : '<tr><td colspan="7"><div class="gaip-wealth-empty gaip-wealth-empty--large"><span>暂无明细</span><small>调整筛选条件后再试</small></div></td></tr>') + '</tbody></table></div>' +
      '</main></div>';
  }

  function drawerMarkup() {
    var file = state.drawerFile;
    if (!file) return '';
    return '<div class="gaip-wealth-drawer-layer" role="presentation" data-action="close-drawer"><aside class="gaip-wealth-drawer" role="dialog" aria-modal="true" aria-labelledby="gaipWealthDrawerTitle" data-drawer-panel>' +
      '<header><h2 id="gaipWealthDrawerTitle">文件识别详情</h2><button type="button" aria-label="关闭" data-action="close-drawer">×</button></header><div class="gaip-wealth-drawer-body">' +
      '<section class="gaip-wealth-drawer-file">' + tag(file.result) + '<h3>' + escapeHtml(file.name) + '</h3><p>' + file.id + ' · V1</p></section>' +
      '<dl>' + [['财富值类型', file.type], ['物理模板', file.template], ['文件名期次', file.installment], ['源行 / 明细', file.sourceRows + ' / ' + file.details], ['财富值 HKD', money(file.amount)], ['解析规则', file.rule]].map(function (row) { return '<div><dt>' + row[0] + '</dt><dd>' + row[1] + '</dd></div>'; }).join('') + '</dl>' +
      '<section class="gaip-wealth-validation gaip-wealth-validation--' + statusClass(file.result) + '"><strong>' + (file.issues.length ? '存在校验' + (file.result === '失败' ? '错误' : '预警') : '校验已通过') + '</strong><p>' + escapeHtml(file.issues.join('\n') || '文件结构与数据内容均符合导入规则。') + '</p></section>' +
      '</div></aside></div>';
  }

  function dialogMarkup() {
    if (!state.dialog) return '';
    if (state.dialog === 'keywords') {
      return '<div class="gaip-wealth-modal-layer" role="presentation" data-action="close-dialog"><section class="gaip-wealth-modal" role="dialog" aria-modal="true" aria-labelledby="gaipKeywordTitle" data-dialog-panel><header><h2 id="gaipKeywordTitle">保司关键词</h2><button type="button" aria-label="关闭" data-action="close-dialog">×</button></header><div class="gaip-wealth-modal-body"><p class="gaip-wealth-callout">用于本地演示文件名中的保司识别规则，不会提交到服务器。</p><label>关键词<input value="AIA"></label><label>关键词<input value="FWD"></label><label>关键词<input value="Manulife"></label></div><footer><button class="gaip-wealth-secondary" type="button" data-action="close-dialog">取消</button><button class="gaip-wealth-primary" type="button" data-action="save-keywords">保存</button></footer></section></div>';
    }
    return '';
  }

  function renderPage(page) {
    var view = currentView();
    var viewRoot = page.querySelector('.gaip-wealth-view');
    if (!viewRoot) return;
    viewRoot.innerHTML = view === 'import-records' ? renderRecords() : (view === 'my-wealth' ? renderMyWealth() : renderWorkbench());
    page.querySelector('.gaip-wealth-layer-root').innerHTML = drawerMarkup() + dialogMarkup();
    page.setAttribute('data-gaip-wealth-view', view);
    updateBreadcrumb(view);
    document.title = viewLabel(view) + ' - GAIP 本地原样版';
    window.dispatchEvent(new CustomEvent('gaip:wealth-view-change', { detail: { view: view } }));
  }

  function createPage() {
    var page = document.createElement('section');
    page.className = 'gaip-wealth-page';
    page.setAttribute('data-gaip-page-root', 'wealth');
    page.setAttribute('data-gaip-wealth-overlay', 'true');
    page.innerHTML = '<div class="gaip-wealth-view"></div><div class="gaip-wealth-layer-root"></div><div class="gaip-wealth-toast" role="status" aria-live="polite"></div>';
    page.addEventListener('click', handleClick);
    page.addEventListener('change', handleChange);
    page.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        state.drawerFile = null;
        state.dialog = '';
        renderPage(page);
      }
      if (event.key === 'Enter' && event.target.matches('[data-wealth-search]')) {
        state.wealthSearch = event.target.value;
        renderPage(page);
      }
    });
    return page;
  }

  function allFiles() {
    return state.workbenchFiles.concat(mock.records.reduce(function (files, record) {
      return files.concat(record.files || []);
    }, []));
  }

  function showToast(message) {
    var toast = document.querySelector('.gaip-wealth-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2200);
  }

  function handleClick(event) {
    var button = event.target.closest('button, [data-action]');
    var action = button && button.getAttribute('data-action');
    var page = event.currentTarget;
    var fileId;
    if (event.target.closest('[data-drawer-panel], [data-dialog-panel]') && !button) return;
    if (!button) return;

    if (button.hasAttribute('data-workbench-filter')) {
      state.workbenchFilter = button.getAttribute('data-workbench-filter');
      renderPage(page);
      return;
    }
    if (button.hasAttribute('data-wealth-range')) {
      state.wealthRange = button.getAttribute('data-wealth-range');
      renderPage(page);
      return;
    }
    if (action === 'file-detail') {
      fileId = button.getAttribute('data-file-id');
      state.drawerFile = allFiles().find(function (file) { return file.id === fileId; }) || null;
      renderPage(page);
    } else if (action === 'close-drawer') {
      if (button.classList.contains('gaip-wealth-drawer-layer') && event.target !== button) return;
      state.drawerFile = null;
      renderPage(page);
    } else if (action === 'keyword-settings') {
      state.dialog = 'keywords';
      renderPage(page);
    } else if (action === 'close-dialog') {
      if (button.classList.contains('gaip-wealth-modal-layer') && event.target !== button) return;
      state.dialog = '';
      renderPage(page);
    } else if (action === 'save-keywords') {
      state.dialog = '';
      renderPage(page);
      showToast('关键词已保存至本地 Mock');
    } else if (action === 'simulate-upload') {
      showToast('本地 Mock：文件选择与解析流程已就绪');
    } else if (action === 'submit-import') {
      state.submitted = true;
      renderPage(page);
      showToast('已在本地 Mock 中提交 2 个可导入文件');
    } else if (action === 'new-import') {
      openView('import-workbench');
    } else if (action === 'select-record') {
      state.selectedRecord = Number(button.getAttribute('data-record-index')) || 0;
      renderPage(page);
    } else if (action === 'review-record') {
      state.selectedRecord = Number(button.getAttribute('data-record-index')) || 0;
      renderPage(page);
      showToast('已切换至该批次的本地核对明细');
    } else if (action === 'mock-download') {
      showToast('本地 Mock：失败清单已生成');
    }
  }

  function handleChange(event) {
    var page = event.currentTarget;
    if (event.target.matches('[data-record-filter="month"]')) state.recordMonth = event.target.value;
    if (event.target.matches('[data-record-filter="result"]')) state.recordResult = event.target.value;
    if (event.target.matches('[data-wealth-type]')) state.wealthType = event.target.value;
    if (event.target.matches('[data-wealth-search]')) state.wealthSearch = event.target.value;
    renderPage(page);
  }

  function updateBreadcrumb(view) {
    var breadcrumb = window.__GAIP_BREADCRUMB__;
    if (!breadcrumb) return;
    if (view === 'import-workbench') breadcrumb.clearDetail('wealth');
    else breadcrumb.setDetail('wealth', viewLabel(view), function () { openView('import-workbench'); });
    breadcrumb.refresh();
  }

  function updateBounds() {
    var page = document.querySelector('.gaip-wealth-page[data-gaip-wealth-overlay="true"]');
    var header = document.querySelector('[class*="header___tcVAl"]');
    var sidebar = document.querySelector('.ant-layout-sider');
    var headerRect;
    var sidebarRect;
    boundsFrame = 0;
    if (!page || !header || !sidebar) return;
    headerRect = header.getBoundingClientRect();
    sidebarRect = sidebar.getBoundingClientRect();
    page.style.top = Math.max(0, Math.round(headerRect.height)) + 'px';
    page.style.left = Math.max(0, Math.round(sidebarRect.width)) + 'px';
    page.style.width = Math.max(1180, window.innerWidth - Math.round(sidebarRect.width)) + 'px';
    page.style.height = Math.max(0, window.innerHeight - Math.round(headerRect.height)) + 'px';
  }

  function scheduleBounds() {
    if (boundsFrame) return;
    boundsFrame = requestAnimationFrame(updateBounds);
  }

  function wealthRequested() {
    var query = (location.hash || '').split('?')[1] || '';
    return window.__GAIP_PAGE_OVERRIDE__ === 'wealth' ||
      new URLSearchParams(query).get('gaip-channel') === 'wealth';
  }

  function notify(open) {
    window.dispatchEvent(new CustomEvent('gaip:wealth-change', { detail: { open: open, view: currentView() } }));
    if (typeof window.__GAIP_APPLY_STRUCTURE_NAMES__ === 'function') window.__GAIP_APPLY_STRUCTURE_NAMES__();
  }

  function mount() {
    var header = document.querySelector('[class*="header___tcVAl"]');
    var sidebar = document.querySelector('.ant-layout-sider');
    var page = document.querySelector('.gaip-wealth-page[data-gaip-wealth-overlay="true"]');
    if (!header || !sidebar) return false;
    if (!page) {
      page = createPage();
      document.body.appendChild(page);
    }
    if (!originalTitle) originalTitle = document.title;
    document.documentElement.classList.add('gaip-wealth-scroll-lock');
    document.body.setAttribute('data-gaip-page', 'wealth');
    document.body.setAttribute('data-gaip-page-label', '财富值中心');
    renderPage(page);
    scheduleBounds();
    notify(true);
    return true;
  }

  function unmount() {
    var page = document.querySelector('.gaip-wealth-page[data-gaip-wealth-overlay="true"]');
    if (page) page.remove();
    document.documentElement.classList.remove('gaip-wealth-scroll-lock');
    if (originalTitle) {
      document.title = originalTitle;
      originalTitle = '';
    }
    if (document.body.getAttribute('data-gaip-page') === 'wealth') {
      document.body.removeAttribute('data-gaip-page');
      document.body.removeAttribute('data-gaip-page-label');
    }
    if (window.__GAIP_BREADCRUMB__) window.__GAIP_BREADCRUMB__.clearDetail('wealth');
    notify(false);
  }

  function openView(view) {
    var nextHash = wealthHash(view);
    if (window.__GAIP_LEARNING_CENTER__ && window.__GAIP_LEARNING_CENTER__.isOpen()) {
      window.__GAIP_LEARNING_CENTER__.closeForNavigation('/workspace');
    }
    if (location.hash !== nextHash) {
      history.pushState({ gaipChannel: 'wealth', gaipView: view }, '', location.pathname + location.search + nextHash);
    }
    mount();
  }

  function closeForNavigation() {
    if (window.__GAIP_PAGE_OVERRIDE__ === 'wealth') window.__GAIP_PAGE_OVERRIDE__ = '';
    unmount();
  }

  function sync() {
    syncFrame = 0;
    if (wealthRequested()) mount();
    else unmount();
  }

  function scheduleSync() {
    if (syncFrame) return;
    syncFrame = requestAnimationFrame(sync);
  }

  function nodeFromMarkup(markup) {
    var template = document.createElement('template');
    template.innerHTML = markup.trim();
    return template.content.firstElementChild;
  }

  function createFileDrawer(file) {
    var previous = state.drawerFile;
    state.drawerFile = file || state.workbenchFiles[0] || null;
    var node = nodeFromMarkup(drawerMarkup());
    state.drawerFile = previous;
    return node;
  }

  function createKeywordDialog() {
    var previous = state.dialog;
    state.dialog = 'keywords';
    var node = nodeFromMarkup(dialogMarkup());
    state.dialog = previous;
    return node;
  }

  var api = {
    open: openView,
    closeForNavigation: closeForNavigation,
    isOpen: function () { return !!document.querySelector('.gaip-wealth-page[data-gaip-wealth-overlay="true"]'); },
    currentView: currentView,
    sync: scheduleSync,
    createFileDrawer: createFileDrawer,
    createKeywordDialog: createKeywordDialog
  };
  window.__GAIP_WEALTH_CENTER__ = api;
  window.__GAIP_VIRTUAL_CHANNELS__ = window.__GAIP_VIRTUAL_CHANNELS__ || {};
  window.__GAIP_VIRTUAL_CHANNELS__.wealth = api;

  function start() {
    var root = document.getElementById('root');
    if (root) {
      new MutationObserver(function () {
        if (wealthRequested()) scheduleSync();
        if (api.isOpen()) scheduleBounds();
      }).observe(root, { childList: true, subtree: true });
    }
    window.addEventListener('resize', scheduleBounds);
    window.addEventListener('hashchange', scheduleSync);
    window.addEventListener('popstate', scheduleSync);
    scheduleSync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
