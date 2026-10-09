/* @gaip-markup-cache:start */
// Generated from the owned templates/markup-*.html; run npm run build:templates.
var __gaipMarkup_86da0c9d70 = (function () {
  var templates = {"tag-1":"<span class=\"gaip-wealth-tag gaip-wealth-tag--{{gaip:0}}\">{{gaip:1}}</span>","workbenchFileRows-8":"<tr><td colspan=\"10\"><div class=\"gaip-wealth-empty\">暂无符合条件的文件</div></td></tr>","workbenchFileRows-9":"<tr><td><strong class=\"gaip-wealth-cell-main\">{{gaip:0}}</strong><small>{{gaip:1}} · {{gaip:2}}</small></td><td>{{gaip:3}}</td><td>{{gaip:4}}</td><td>{{gaip:5}}</td><td>{{gaip:6}}</td><td>{{gaip:7}}</td><td><strong>{{gaip:8}}</strong></td><td>{{gaip:9}}</td><td><span class=\"gaip-wealth-issue gaip-wealth-issue--{{gaip:10}}\">{{gaip:11}}</span></td><td><button class=\"gaip-wealth-link\" type=\"button\" data-action=\"file-detail\" data-file-id=\"{{gaip:12}}\">详情</button></td></tr>","renderWorkbench-10":"<div class=\"gaip-wealth-workbench\"><header class=\"gaip-wealth-page-header\"><div><h1>导入工作台</h1><p>批次 {{gaip:0}} · 文件名决定财富值类型和分期</p></div></header><section class=\"gaip-wealth-workflow\" aria-label=\"导入流程\"><ol>{{gaip:1}}</ol></section><section class=\"gaip-wealth-panel gaip-wealth-batch-panel\"><header class=\"gaip-wealth-panel-head\"><div><h2>批次设置</h2><p>批次月份提交后不可修改。</p></div>{{gaip:2}}</header><div class=\"gaip-wealth-batch-body\"><div class=\"gaip-wealth-month-card\"><span>财富值月份</span><div class=\"gaip-wealth-month-value\"><strong>2026</strong><em>年</em><strong>08</strong><em>月</em></div><small>当前财富值月份</small></div><button class=\"gaip-wealth-upload-zone\" type=\"button\" data-action=\"simulate-upload\">{{gaip:3}}<strong>拖入或选择 .xlsx 文件</strong><span>本地 Mock 上传：单文件不超过 20MB，单批次最多 50 个。</span></button></div><div class=\"gaip-wealth-notice\">{{gaip:4}}<span>类型和分期以文件名为正式来源；Excel 内的月份及“是否发放”不参与财富值计算。</span></div></section><section class=\"gaip-wealth-panel gaip-wealth-result-panel\"><header class=\"gaip-wealth-panel-head gaip-wealth-result-head\"><div><h2>校验结果</h2><p>临时文件已检查，不计入成功或失败数据</p></div><div class=\"gaip-wealth-page-actions\"><div class=\"gaip-wealth-filter-buttons\">{{gaip:5}}</div><button class=\"gaip-wealth-primary\" type=\"button\" data-action=\"submit-import\"{{gaip:6}}>{{gaip:7}}</button></div></header><div class=\"gaip-wealth-summary\">{{gaip:8}}</div><div class=\"gaip-wealth-table-scroll\"><table class=\"gaip-wealth-table\"><thead><tr><th>文件</th><th>类型</th><th>模板</th><th>期次</th><th>源行</th><th>明细</th><th>财富值 HKD</th><th>结果</th><th>问题</th><th>操作</th></tr></thead><tbody>{{gaip:9}}</tbody></table></div></section></div>","renderWorkbench-11":"<li class=\"gaip-wealth-step gaip-wealth-step--{{gaip:0}}\"><span class=\"gaip-wealth-step-index\">{{gaip:1}}</span><span><strong>{{gaip:2}}</strong><small>{{gaip:3}}</small></span></li>","renderWorkbench-12":"<button type=\"button\" data-workbench-filter=\"{{gaip:0}}\" class=\"{{gaip:1}}\">{{gaip:2}} {{gaip:3}}</button>","renderWorkbench-13":"<div><strong class=\"{{gaip:0}}\">{{gaip:1}}</strong><span>{{gaip:2}}</span><small>{{gaip:3}}</small></div>","recordRows-14":"<tr class=\"{{gaip:0}}\" data-action=\"select-record\" data-record-index=\"{{gaip:1}}\"><td><strong class=\"gaip-wealth-cell-main\">{{gaip:2}}</strong></td><td>{{gaip:3}}</td><td>{{gaip:4}}</td><td>{{gaip:5}}</td><td>{{gaip:6}}</td><td>{{gaip:7}}</td><td>{{gaip:8}}</td><td>{{gaip:9}}</td><td><span class=\"gaip-wealth-delta gaip-wealth-delta--positive\">{{gaip:10}}</span> / <span class=\"gaip-wealth-delta gaip-wealth-delta--negative\">{{gaip:11}}</span></td><td>{{gaip:12}}</td><td><strong>{{gaip:13}}</strong></td><td><span class=\"gaip-wealth-action-cell\"><button type=\"button\" class=\"gaip-wealth-link\" data-action=\"select-record\" data-record-index=\"{{gaip:14}}\">查看文件</button><button type=\"button\" class=\"gaip-wealth-link\" data-action=\"review-record\" data-record-index=\"{{gaip:15}}\">核对</button></span></td></tr>","recordFileRows-15":"<tr><td colspan=\"10\"><div class=\"gaip-wealth-empty\">该批次暂无可展示的文件明细</div></td></tr>","recordFileRows-16":"<tr><td><strong class=\"gaip-wealth-cell-main\">{{gaip:0}}</strong><small>{{gaip:1}} · 当前生效</small></td><td>{{gaip:2}}</td><td>{{gaip:3}}</td><td>{{gaip:4}}</td><td>{{gaip:5}}</td><td>1</td><td>{{gaip:6}}</td><td><strong>{{gaip:7}}</strong></td><td><span class=\"gaip-wealth-issue gaip-wealth-issue--{{gaip:8}}\">{{gaip:9}}</span></td><td><button class=\"gaip-wealth-link\" type=\"button\" data-action=\"file-detail\" data-file-id=\"{{gaip:10}}\">详情</button></td></tr>","renderRecords-17":"<div class=\"gaip-wealth-records\"><header class=\"gaip-wealth-page-header gaip-wealth-page-header--row\"><div><h1>导入记录</h1><p>同一财富值月份可有多个批次；按批次追踪文件、尝试次数和当前生效版本</p></div><div class=\"gaip-wealth-page-actions\"><button class=\"gaip-wealth-secondary\" type=\"button\" data-action=\"keyword-settings\">{{gaip:0}}保司关键词</button><button class=\"gaip-wealth-primary\" type=\"button\" data-action=\"new-import\">{{gaip:1}}新建导入</button></div></header><section class=\"gaip-wealth-panel\"><div class=\"gaip-wealth-filters\"><label>财富值月份<select data-record-filter=\"month\">{{gaip:2}}</select></label><label>批次结果<select data-record-filter=\"result\"><option value=\"all\">全部结果</option><option value=\"success\"{{gaip:3}}>已提交</option><option value=\"pending\"{{gaip:4}}>待处理</option><option value=\"fail\"{{gaip:5}}>失败</option></select></label><button class=\"gaip-wealth-primary\" type=\"button\">{{gaip:6}}查询</button></div><div class=\"gaip-wealth-table-scroll\"><table class=\"gaip-wealth-table gaip-wealth-record-table\"><thead><tr><th>批次编号</th><th>批次类型</th><th>财富值月份</th><th>批次状态</th><th>月份状态</th><th>导入时间</th><th>操作人</th><th>文件</th><th>成功 / 失败</th><th>明细</th><th>导入财富值 HKD</th><th>操作</th></tr></thead><tbody>{{gaip:7}}</tbody></table></div><footer class=\"gaip-wealth-pagination\"><span>共 {{gaip:8}} 条</span><button type=\"button\" disabled>‹</button><button type=\"button\" class=\"is-current\">1</button><button type=\"button\">›</button><span>10 条/页</span></footer></section><section class=\"gaip-wealth-panel gaip-wealth-record-detail\"><header class=\"gaip-wealth-panel-head\"><div><h2>{{gaip:9}} 批次文件</h2><p>{{gaip:10}} · {{gaip:11}} 个文件 · 当前生效文件优先展示</p></div><button class=\"gaip-wealth-secondary\" type=\"button\" data-action=\"mock-download\">失败清单</button></header><div class=\"gaip-wealth-table-scroll\"><table class=\"gaip-wealth-table\"><thead><tr><th>文件及版本</th><th>模板</th><th>识别类型</th><th>期次</th><th>结果</th><th>尝试</th><th>明细</th><th>财富值 HKD</th><th>问题</th><th>操作</th></tr></thead><tbody>{{gaip:12}}</tbody></table></div></section></div>","renderRecords-18":"<option value=\"{{gaip:0}}\"{{gaip:1}}>{{gaip:2}}</option>","renderRecords-19":"<tr><td colspan=\"12\"><div class=\"gaip-wealth-empty\">暂无符合条件的批次</div></td></tr>","renderMyWealth-20":"<div class=\"gaip-wealth-my\"><section class=\"gaip-wealth-overview\"><div class=\"gaip-wealth-overview-stats\"><div class=\"gaip-wealth-big-stat\"><span>本月已发财富值</span><strong><em>HK$</em>{{gaip:0}}</strong><div><small>{{gaip:1}} 笔明细</small><small>{{gaip:2}}</small><small class=\"gaip-wealth-currency-chip\"><img src=\"shared/assets/icons/brand/wealth-center/hkd-currency.svg\" alt=\"\" aria-hidden=\"true\">港币</small></div></div><div class=\"gaip-wealth-stat-divider\"></div><div class=\"gaip-wealth-big-stat\"><span>累计已发</span><strong><em>HK$</em>{{gaip:3}}</strong><div><small>{{gaip:4}} 笔明细</small></div></div></div><div class=\"gaip-wealth-breakdown\"><header><span>财富值构成（本月）</span><b>共{{gaip:5}}笔</b></header><div>{{gaip:6}}</div></div></section><main class=\"gaip-wealth-content-card\"><div class=\"gaip-wealth-my-filters\"><div class=\"gaip-wealth-range-tabs\"><button type=\"button\" data-wealth-range=\"month\" class=\"{{gaip:7}}\">08月明细（{{gaip:8}}）</button><button type=\"button\" data-wealth-range=\"all\" class=\"{{gaip:9}}\">全部明细</button></div><div class=\"gaip-wealth-my-actions\"><select data-wealth-type><option value=\"all\">全部类型</option>{{gaip:10}}</select><label class=\"gaip-wealth-search\">{{gaip:11}}<input type=\"search\" data-wealth-search placeholder=\"搜索产品或订单\" value=\"{{gaip:12}}\"></label></div></div><div class=\"gaip-wealth-table-scroll gaip-wealth-my-table\"><table class=\"gaip-wealth-table\"><thead><tr><th>发放日期</th><th>财富值单号</th><th>财富值类型</th><th>产品 / 事项</th><th>客户</th><th>财富值 HKD</th><th>状态</th></tr></thead><tbody>{{gaip:13}}</tbody></table></div></main></div>","renderMyWealth-21":"<article><p><span>{{gaip:0}}</span><strong>{{gaip:1}}</strong></p><i data-wealth-progress=\"{{gaip:2}}\"></i></article>","renderMyWealth-22":"<option value=\"{{gaip:0}}\"{{gaip:1}}>{{gaip:2}}</option>","renderMyWealth-23":"<tr><td>{{gaip:0}}</td><td><strong class=\"gaip-wealth-cell-main\">{{gaip:1}}</strong></td><td>{{gaip:2}}</td><td>{{gaip:3}}</td><td>{{gaip:4}}</td><td><strong>{{gaip:5}}</strong></td><td>{{gaip:6}}</td></tr>","renderMyWealth-24":"<tr><td colspan=\"7\"><div class=\"gaip-wealth-empty gaip-wealth-empty--large\"><span>暂无明细</span><small>调整筛选条件后再试</small></div></td></tr>","drawerMarkup-25":"<div class=\"gaip-wealth-drawer-layer\" role=\"presentation\" data-action=\"close-drawer\"><aside class=\"gaip-wealth-drawer\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"gaipWealthDrawerTitle\" data-drawer-panel><header><h2 id=\"gaipWealthDrawerTitle\">文件识别详情</h2><button type=\"button\" aria-label=\"关闭\" data-action=\"close-drawer\">×</button></header><div class=\"gaip-wealth-drawer-body\"><section class=\"gaip-wealth-drawer-file\">{{gaip:0}}<h3>{{gaip:1}}</h3><p>{{gaip:2}} · V1</p></section><dl>{{gaip:3}}</dl><section class=\"gaip-wealth-validation gaip-wealth-validation--{{gaip:4}}\"><strong>{{gaip:5}}</strong><p>{{gaip:6}}</p></section></div></aside></div>","drawerMarkup-26":"<div><dt>{{gaip:0}}</dt><dd>{{gaip:1}}</dd></div>","dialogMarkup-27":"<div class=\"gaip-wealth-modal-layer\" role=\"presentation\" data-action=\"close-dialog\"><section class=\"gaip-wealth-modal\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"gaipKeywordTitle\" data-dialog-panel><header><h2 id=\"gaipKeywordTitle\">保司关键词</h2><button type=\"button\" aria-label=\"关闭\" data-action=\"close-dialog\">×</button></header><div class=\"gaip-wealth-modal-body\"><p class=\"gaip-wealth-callout\">用于本地演示文件名中的保司识别规则，不会提交到服务器。</p><label>关键词<input value=\"AIA\"></label><label>关键词<input value=\"FWD\"></label><label>关键词<input value=\"Manulife\"></label></div><footer><button class=\"gaip-wealth-secondary\" type=\"button\" data-action=\"close-dialog\">取消</button><button class=\"gaip-wealth-primary\" type=\"button\" data-action=\"save-keywords\">保存</button></footer></section></div>","createPage-28":"<div class=\"gaip-wealth-view\"></div><div class=\"gaip-wealth-layer-root\"></div><div class=\"gaip-wealth-toast\" role=\"status\" aria-live=\"polite\"></div>"};
  return function (id, values) {
    if (!Object.prototype.hasOwnProperty.call(templates, id)) throw new Error("Missing HTML template: " + id);
    return templates[id].replace(/\{\{gaip:(\d+)\}\}/g, function (_, index) {
      if (!values || !Object.prototype.hasOwnProperty.call(values, index)) throw new Error("Missing HTML binding: " + id + ":" + index);
      return values[index];
    });
  };
}());
/* @gaip-markup-cache:end */
/* ===== mock-data.js ===== */
(function () {
  'use strict';

  var workbenchFiles = [
    {
      id: 'F-202608-012-001',
      name: 'Minz 台账-8月-谭劲松-上线奖.xlsx',
      type: '上线奖',
      template: 'P01',
      installment: '1/1',
      sourceRows: 4,
      details: 4,
      amount: 16293.70,
      result: '预警',
      rule: 'R-2026.08',
      issues: [
        '第3行：归属人姓名 [tjs] 与系统记录 [谭劲松] 不一致，请确认',
        '第4行：归属人姓名 [谭劲] 与系统记录 [谭劲松] 不一致，请确认'
      ]
    },
    {
      id: 'F-202608-012-002',
      name: 'Minz 台账-8月-客户保单财富值（第2期，共6期）.xlsx',
      type: '保险财富值',
      template: 'P03',
      installment: '2/6',
      sourceRows: 6,
      details: 6,
      amount: 48260.00,
      result: '通过',
      rule: 'R-2026.08',
      issues: []
    },
    {
      id: 'F-202608-012-003',
      name: '未识别类型-8月.xlsx',
      type: '-',
      template: '-',
      installment: '-',
      sourceRows: 0,
      details: 0,
      amount: 0,
      result: '失败',
      rule: '-',
      issues: ['无法从文件名识别财富值类型，请检查文件名是否包含类型关键词']
    }
  ];

  var records = [
    {
      id: 'IMP-202608-012', type: '补充导入', month: '2026年08月',
      batchStatus: '待提交', monthStatus: '待核对', importedAt: '2026-08-25 10:18:36',
      operator: '本地预览用户', fileCount: 3, success: 2, failed: 1, details: 10,
      amount: 64553.70, files: workbenchFiles
    },
    {
      id: 'IMP-202608-010', type: '补充导入', month: '2026年08月',
      batchStatus: '已提交', monthStatus: '已核对', importedAt: '2026-08-24 17:24:05',
      operator: '夏鹤彩', fileCount: 4, success: 3, failed: 1, details: 8,
      amount: 124242.50,
      files: [
        { id: 'F-202608-010-001', name: '保险财富值-AIA-第1期.xlsx', type: '保险财富值', template: 'P02', installment: '1/9', sourceRows: 3, details: 3, amount: 53974.40, result: '通过', rule: 'R-2026.08', issues: [] },
        { id: 'F-202608-010-002', name: '保险财富值-FWD-第2期.xlsx', type: '保险财富值', template: 'P02', installment: '2/9', sourceRows: 2, details: 2, amount: 42318.10, result: '预警', rule: 'R-2026.08', issues: ['第2行：结佣年月与财富值月份不一致'] },
        { id: 'F-202608-010-003', name: '移民佣金-8月.xlsx', type: '移民财富值', template: 'P06', installment: '1/1', sourceRows: 3, details: 3, amount: 27950.00, result: '通过', rule: 'R-2026.08', issues: [] },
        { id: 'F-202608-010-004', name: '001-无法识别.xlsx', type: '-', template: '-', installment: '-', sourceRows: 0, details: 0, amount: 0, result: '失败', rule: '-', issues: ['无法识别财富值类型'] }
      ]
    },
    {
      id: 'IMP-202607-006', type: '历史导入', month: '2026年07月',
      batchStatus: '已提交', monthStatus: '已核对', importedAt: '2026-08-21 14:03:18',
      operator: '本地预览用户', fileCount: 5, success: 5, failed: 0, details: 18,
      amount: 335110.98, files: []
    },
    {
      id: 'IMP-202606-003', type: '历史导入', month: '2026年06月',
      batchStatus: '已提交', monthStatus: '待核对', importedAt: '2026-08-18 09:42:06',
      operator: 'ldaptest02', fileCount: 2, success: 2, failed: 0, details: 7,
      amount: 88640.00, files: []
    },
    {
      id: 'IMP-202605-002', type: '历史导入', month: '2026年05月',
      batchStatus: '解析失败', monthStatus: '创建失败', importedAt: '2026-08-16 11:26:40',
      operator: 'ldaptest02', fileCount: 1, success: 0, failed: 1, details: 0,
      amount: 0, files: []
    },
    {
      id: 'IMP-202604-001', type: '历史导入', month: '2026年04月',
      batchStatus: '已提交', monthStatus: '已核对', importedAt: '2026-08-12 16:10:22',
      operator: '夏鹤彩', fileCount: 3, success: 3, failed: 0, details: 12,
      amount: 179860.20, files: []
    }
  ];

  var wealthDetails = [
    { date: '2026-08-22', orderNo: 'WV-202608-0018', type: '保险财富值', product: '臻享环球医疗保障计划', client: '陈思远', amount: 48260.00, status: '已发放' },
    { date: '2026-08-20', orderNo: 'WV-202608-0016', type: '上线奖', product: '荣耀顾问上线奖励', client: '谭劲松', amount: 16293.70, status: '已发放' },
    { date: '2026-08-16', orderNo: 'WV-202608-0011', type: '保险财富值', product: '亚洲菁英传承计划', client: '周雅宁', amount: 42318.10, status: '已发放' },
    { date: '2026-08-12', orderNo: 'WV-202608-0008', type: '移民财富值', product: '新加坡家族办公室服务', client: '许安然', amount: 27950.00, status: '已发放' },
    { date: '2026-08-05', orderNo: 'WV-202608-0003', type: '补发财富值', product: '2026年07月差额补发', client: '林嘉衡', amount: 8860.00, status: '已发放' },
    { date: '2026-07-28', orderNo: 'WV-202607-0026', type: '保险财富值', product: '隽富多元货币计划', client: '顾明哲', amount: 53974.40, status: '已发放' }
  ];

  window.__GAIP_WEALTH_MOCK__ = {
    workbench: {
      batchId: 'IMP-202608-012',
      month: '2026年08月',
      files: workbenchFiles
    },
    records: records,
    myWealth: {
      month: '2026年08月',
      monthAmount: 143681.80,
      totalAmount: 682436.58,
      monthCount: 5,
      totalCount: 24,
      breakdown: [
        { label: '保险财富值', amount: 90578.10, progress: 63 },
        { label: '上线奖', amount: 16293.70, progress: 11 },
        { label: '补发财富值', amount: 8860.00, progress: 6 },
        { label: '移民财富值', amount: 27950.00, progress: 20 }
      ],
      details: wealthDetails
    }
  };
})();

;

/* ===== wealth-center.js ===== */
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
    return __gaipMarkup_86da0c9d70("tag-1", [('' + (escapeHtml(tone || statusClass(value)))), ('' + (escapeHtml(value)))]);
  }

  function icon(name) {
    return window.__GAIP_LOCAL_ICONS__.markup("wealth/" + (["check", "upload", "search", "info", "settings"].includes(name) ? name : "empty"));
  }

  function workbenchFileRows(files) {
    if (!files.length) {
      return __gaipMarkup_86da0c9d70("workbenchFileRows-8");
    }
    return files.map(function (file) {
      return __gaipMarkup_86da0c9d70("workbenchFileRows-9", [('' + (escapeHtml(file.name))), ('' + (escapeHtml(file.id))), ('' + (escapeHtml(file.rule))), ('' + (tag(file.type, file.type === '-' ? 'neutral' : 'warning'))), ('' + (escapeHtml(file.template))), ('' + (escapeHtml(file.installment))), ('' + (file.sourceRows)), ('' + (file.details)), ('' + (money(file.amount))), ('' + (tag(file.result))), ('' + (statusClass(file.result))), ('' + (escapeHtml(file.issues.join('；') || '-'))), ('' + (escapeHtml(file.id)))]);
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

    return __gaipMarkup_86da0c9d70("renderWorkbench-10", [('' + (escapeHtml(mock.workbench.batchId))), ('' + ([['✓', '上传文件', '已上传 ' + allFiles.length + ' 个文件', 'done'], ['✓', '结构识别', 'P01-P06 自动匹配', 'done'], ['3', '校验结果', '确认错误与警告', 'active'], ['4', '提交入库', '只提交通过文件', '']].map(function (step) {
          return __gaipMarkup_86da0c9d70("renderWorkbench-11", [('' + (step[3])), ('' + (step[0])), ('' + (step[1])), ('' + (step[2]))]);
        }).join(''))), ('' + (tag(state.submitted ? '已提交' : '待提交', state.submitted ? 'success' : 'neutral'))), ('' + (icon('upload'))), ('' + (icon('info'))), ('' + ([['all', '全部', allFiles.length], ['pass', '可导入', valid.length], ['warning', '预警', warnings.length], ['fail', '失败', failed.length]].map(function (item) {
            return __gaipMarkup_86da0c9d70("renderWorkbench-12", [('' + (item[0])), ('' + (state.workbenchFilter === item[0] ? 'is-active' : '')), ('' + (item[1])), ('' + (item[2]))]);
          }).join(''))), ('' + (state.submitted ? ' disabled' : '')), ('' + (state.submitted ? '已提交' : '提交 ' + valid.length + ' 个文件')), ('' + (summary.map(function (item, index) {
          return __gaipMarkup_86da0c9d70("renderWorkbench-13", [('' + (index === 5 ? 'is-money' : '')), ('' + (escapeHtml(item[0]))), ('' + (item[1])), ('' + (item[2]))]);
        }).join(''))), ('' + (workbenchFileRows(files)))]);
  }

  function recordRows(records) {
    return records.map(function (record) {
      var index = mock.records.indexOf(record);
      return __gaipMarkup_86da0c9d70("recordRows-14", [('' + (state.selectedRecord === index ? 'is-selected' : '')), ('' + (index)), ('' + (record.id)), ('' + (tag(record.type, record.type === '历史导入' ? 'blue' : 'warning'))), ('' + (record.month)), ('' + (tag(record.batchStatus))), ('' + (tag(record.monthStatus))), ('' + (record.importedAt)), ('' + (record.operator)), ('' + (record.fileCount)), ('' + (record.success)), ('' + (record.failed)), ('' + (record.details)), ('' + (money(record.amount))), ('' + (index)), ('' + (index))]);
    }).join('');
  }

  function recordFileRows(record) {
    if (!record || !record.files.length) {
      return __gaipMarkup_86da0c9d70("recordFileRows-15");
    }
    return record.files.map(function (file) {
      return __gaipMarkup_86da0c9d70("recordFileRows-16", [('' + (escapeHtml(file.name))), ('' + (file.id)), ('' + (file.template)), ('' + (tag(file.type, file.type === '-' ? 'neutral' : 'warning'))), ('' + (file.installment)), ('' + (tag(file.result))), ('' + (file.details)), ('' + (money(file.amount))), ('' + (statusClass(file.result))), ('' + (escapeHtml(file.issues.join('；') || '-'))), ('' + (file.id))]);
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

    return __gaipMarkup_86da0c9d70("renderRecords-17", [('' + (icon('settings'))), ('' + (icon('upload'))), ('' + (months.map(function (month) { return __gaipMarkup_86da0c9d70("renderRecords-18", [('' + (escapeHtml(month))), ('' + (state.recordMonth === month ? ' selected' : '')), ('' + (month === 'all' ? '全部月份' : month))]); }).join(''))), ('' + (state.recordResult === 'success' ? ' selected' : '')), ('' + (state.recordResult === 'pending' ? ' selected' : '')), ('' + (state.recordResult === 'fail' ? ' selected' : '')), ('' + (icon('search'))), ('' + (records.length ? recordRows(records) : __gaipMarkup_86da0c9d70("renderRecords-19"))), ('' + (records.length)), ('' + (selected.id)), ('' + (selected.month)), ('' + (selected.fileCount)), ('' + (recordFileRows(selected)))]);
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

    return __gaipMarkup_86da0c9d70("renderMyWealth-20", [('' + (Math.round(data.monthAmount).toLocaleString('zh-CN'))), ('' + (data.monthCount)), ('' + (data.month)), ('' + (Math.round(data.totalAmount).toLocaleString('zh-CN'))), ('' + (data.totalCount)), ('' + (data.monthCount)), ('' + (data.breakdown.map(function (item) {
        return __gaipMarkup_86da0c9d70("renderMyWealth-21", [('' + (item.label)), ('' + (money(item.amount))), ('' + (item.progress))]);
      }).join(''))), ('' + (state.wealthRange === 'month' ? 'is-active' : '')), ('' + (data.monthCount)), ('' + (state.wealthRange === 'all' ? 'is-active' : '')), ('' + (types.map(function (type) { return __gaipMarkup_86da0c9d70("renderMyWealth-22", [('' + (type)), ('' + (state.wealthType === type ? ' selected' : '')), ('' + (type))]); }).join(''))), ('' + (icon('search'))), ('' + (escapeHtml(state.wealthSearch))), ('' + (details.length ? details.map(function (item) {
          return __gaipMarkup_86da0c9d70("renderMyWealth-23", [('' + (item.date)), ('' + (item.orderNo)), ('' + (tag(item.type, 'blue'))), ('' + (item.product)), ('' + (item.client)), ('' + (money(item.amount))), ('' + (tag(item.status)))]);
        }).join('') : __gaipMarkup_86da0c9d70("renderMyWealth-24")))]);
  }

  function drawerMarkup() {
    var file = state.drawerFile;
    if (!file) return '';
    return __gaipMarkup_86da0c9d70("drawerMarkup-25", [('' + (tag(file.result))), ('' + (escapeHtml(file.name))), ('' + (file.id)), ('' + ([['财富值类型', file.type], ['物理模板', file.template], ['文件名期次', file.installment], ['源行 / 明细', file.sourceRows + ' / ' + file.details], ['财富值 HKD', money(file.amount)], ['解析规则', file.rule]].map(function (row) { return __gaipMarkup_86da0c9d70("drawerMarkup-26", [('' + (row[0])), ('' + (row[1]))]); }).join(''))), ('' + (statusClass(file.result))), ('' + (file.issues.length ? '存在校验' + (file.result === '失败' ? '错误' : '预警') : '校验已通过')), ('' + (escapeHtml(file.issues.join('\n') || '文件结构与数据内容均符合导入规则。')))]);
  }

  function dialogMarkup() {
    if (!state.dialog) return '';
    if (state.dialog === 'keywords') {
      return __gaipMarkup_86da0c9d70("dialogMarkup-27");
    }
    return '';
  }

  function renderPage(page) {
    var view = currentView();
    var viewRoot = page.querySelector('.gaip-wealth-view');
    if (!viewRoot) return;
    viewRoot.innerHTML = view === 'import-records' ? renderRecords() : (view === 'my-wealth' ? renderMyWealth() : renderWorkbench());
    viewRoot.querySelectorAll('[data-wealth-progress]').forEach(function (bar) {
      bar.style.setProperty('--wealth-progress', Number(bar.dataset.wealthProgress) + '%');
    });
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
    page.innerHTML = __gaipMarkup_86da0c9d70("createPage-28");
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
