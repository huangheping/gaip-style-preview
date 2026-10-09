/* @gaip-markup-cache:start */
// Generated from the owned templates/markup-*.html; run npm run build:templates.
var __gaipMarkup_c5ef867ad8 = (function () {
  var templates = {"catalogMarkup-1":"<article class=\"gaip-proposal-card\"><img class=\"gaip-proposal-cover\" src=\"{{gaip:0}}\" alt=\"{{gaip:1}}封面\" loading=\"lazy\"><div class=\"gaip-proposal-card-copy\"><h3>{{gaip:2}}</h3><p>{{gaip:3}}</p></div><button type=\"button\" class=\"gaip-proposal-generate\" data-template-id=\"{{gaip:4}}\" data-template-index=\"{{gaip:5}}\"><img src=\"./shared/assets/icons/business/ai-agent/跳出Icon.svg\" alt=\"\" aria-hidden=\"true\"><span>生成方案</span></button></article>","categoryMarkup-2":"<button type=\"button\" class=\"gaip-record-category is-active\" data-category=\"all\"><span>全部</span><span class=\"gaip-record-count\">{{gaip:0}}</span></button>","categoryMarkup-3":"<button type=\"button\" class=\"gaip-record-category\" data-category=\"{{gaip:0}}\"><span>{{gaip:1}}</span><span class=\"gaip-record-count\">{{gaip:2}}</span></button>","appMarkup-4":"<div class=\"gaip-proposal-app\" data-gaip-proposal-redesign=\"true\"><section class=\"gaip-proposal-hero\" aria-labelledby=\"gaip-proposal-title\"><h1 id=\"gaip-proposal-title\">方案中心 AI</h1><p>选择合适的方案，按提示补充信息，生成结果自动归档</p></section><nav class=\"gaip-proposal-tabs\" aria-label=\"方案中心视图\"><button type=\"button\" class=\"gaip-proposal-tab is-active\" data-tab=\"catalog\" aria-selected=\"true\">全部方案<span class=\"gaip-tabs-quantity\">（<span class=\"gaip-tabs-count\">{{gaip:0}}</span>）</span></button><button type=\"button\" class=\"gaip-proposal-tab\" data-tab=\"records\" aria-selected=\"false\">我的方案记录</button></nav><section class=\"gaip-proposal-panel gaip-proposal-catalog\" data-panel=\"catalog\"><header class=\"gaip-proposal-section-head\"><h2>选择方案</h2><p>选择后，再关联客户并补充需求。</p></header><div class=\"gaip-proposal-grid\">{{gaip:1}}</div></section><section class=\"gaip-proposal-panel gaip-record-layout\" data-panel=\"records\" hidden><aside class=\"gaip-record-sidebar\" aria-label=\"方案类型筛选\">{{gaip:2}}</aside><div class=\"gaip-record-main\"><div class=\"gaip-record-toolbar\"><div class=\"gaip-record-statuses\" aria-label=\"记录状态筛选\"><button type=\"button\" class=\"gaip-record-status is-active\" data-status=\"all\">全部（{{gaip:3}}）</button><button type=\"button\" class=\"gaip-record-status\" data-status=\"pending\">待确认客户归属（<span data-pending-count>{{gaip:4}}</span>）</button></div><label class=\"gaip-record-search\"><span class=\"gaip-static-7f0a8dafaf\">客户及方案搜索</span><img src=\"./shared/assets/icons/forms/shared/modal-search.svg\" alt=\"\" aria-hidden=\"true\"><input type=\"search\" placeholder=\"客户搜索及方案搜索\" autocomplete=\"off\" data-record-search></label></div><div class=\"gaip-record-summary\"><img src=\"./shared/assets/icons/business/ai-agent/做方案.svg\" alt=\"\" aria-hidden=\"true\"><span>共有 <strong data-record-total>{{gaip:5}}</strong> 个方案</span></div><div class=\"gaip-record-list\" aria-live=\"polite\"></div></div></section><div class=\"gaip-owner-overlay\" data-owner-modal hidden></div><div class=\"gaip-owner-confirm-overlay\" data-unlink-confirm hidden></div><div class=\"gaip-file-overlay\" data-file-modal hidden></div><button type=\"button\" class=\"btnNewCustomer___Rsj8E gaip-global-new-customer-bridge\" data-global-new-client-bridge tabindex=\"-1\" aria-hidden=\"true\"></button><div class=\"gaip-proposal-toast\" role=\"status\" aria-live=\"polite\"></div></div>","renderRecords-5":"<div class=\"gaip-record-empty\">没有找到符合当前筛选条件的方案记录</div>","renderRecords-6":"<article class=\"gaip-record-card{{gaip:0}}\" data-record-id=\"{{gaip:1}}\"><div><h3>{{gaip:2}}</h3><div class=\"gaip-record-meta\"><span class=\"gaip-record-id\">方案ID：{{gaip:3}}</span>{{gaip:4}}<span class=\"gaip-record-owner-status\" data-gaip-status-tag=\"{{gaip:5}}\">{{gaip:6}}</span></div></div><div class=\"gaip-record-side\"><time class=\"gaip-record-date\">{{gaip:7}}</time><div class=\"gaip-record-actions\"><button type=\"button\" class=\"gaip-record-action{{gaip:8}}\" data-action=\"owner\">{{gaip:9}}</button><button type=\"button\" class=\"gaip-record-action\" data-action=\"source\">来源对话</button><button type=\"button\" class=\"gaip-record-action is-primary\" data-action=\"file\">查看方案</button></div></div></article>","renderRecords-7":"<span class=\"gaip-record-client\">客户：{{gaip:0}}</span>","customerOptionsMarkup-8":"<li class=\"gaip-owner-empty\">没有找到匹配的客户</li>","customerOptionsMarkup-9":"<li><button type=\"button\" class=\"gaip-owner-option{{gaip:0}}\" data-owner-client-id=\"{{gaip:1}}\" aria-pressed=\"{{gaip:2}}\"><span class=\"gaip-owner-option-name\">{{gaip:3}}</span>{{gaip:4}}</button></li>","customerOptionsMarkup-10":"<img src=\"./shared/assets/icons/status/ai-agent/步骤完成.svg\" alt=\"已选择\">","openUnlinkConfirm-11":"<section class=\"ant-modal css-10wz6x1 css-var-r0 ant-modal-css-var gaip-owner-confirm-dialog\" role=\"alertdialog\" aria-modal=\"true\"><div class=\"ant-modal-content\"><button type=\"button\" class=\"ant-modal-close\" data-unlink-close><span class=\"ant-modal-close-x\"></span></button><div class=\"ant-modal-header\"><div class=\"ant-modal-title\">暂不关联客户</div></div><div class=\"ant-modal-body\"></div><div class=\"ant-modal-footer\"><button type=\"button\" class=\"ant-btn ant-btn-default\" data-unlink-cancel><span>取消</span></button><button type=\"button\" class=\"ant-btn ant-btn-primary\" data-unlink-confirm-button><span>确认暂不关联</span></button></div></div></section>","openOwnerModal-12":"<section class=\"gaip-owner-dialog\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"gaip-owner-title\" aria-describedby=\"gaip-owner-subtitle\"><header class=\"gaip-owner-header\"><h2 id=\"gaip-owner-title\">{{gaip:0}}</h2><div class=\"gaip-owner-subtitle\" id=\"gaip-owner-subtitle\" title=\"{{gaip:1}}\">{{gaip:2}}</div><button type=\"button\" class=\"gaip-owner-close\" data-owner-close aria-label=\"关闭\"><img src=\"./shared/assets/icons/third-party/ant-design/close-outlined.svg\" alt=\"\"></button></header><div class=\"gaip-owner-search-row\"><label class=\"gaip-owner-search\"><span class=\"gaip-static-7f0a8dafaf\">搜索客户姓名或ID</span><img src=\"./shared/assets/icons/forms/shared/modal-search.svg\" alt=\"\"><input type=\"search\" data-owner-search placeholder=\"搜索客户姓名或ID\" autocomplete=\"off\"></label><span class=\"gaip-owner-new-copy\">没有找到？ <button type=\"button\" class=\"gaip-owner-link\" data-owner-new-client>新建客户</button></span></div><ul class=\"gaip-owner-list\" data-owner-list>{{gaip:3}}</ul><footer class=\"gaip-owner-footer\">{{gaip:4}}<button type=\"button\" class=\"gaip-owner-button\" data-owner-cancel>取消</button><button type=\"button\" class=\"gaip-owner-button is-primary\" data-owner-save disabled>{{gaip:5}}</button></footer></section>","openOwnerModal-13":"<button type=\"button\" class=\"gaip-owner-unlink\" data-owner-unlink>暂不关联客户</button>","attachmentListMarkup-14":"<li class=\"gaip-file-group\"><button type=\"button\" class=\"gaip-file-group-row{{gaip:0}}\" data-file-group-id=\"{{gaip:1}}\" aria-expanded=\"{{gaip:2}}\"><img class=\"gaip-file-type-icon\" src=\"./shared/assets/icons/business/proposal-center/icon-pdf-file.svg\" alt=\"PDF文件\"><span class=\"gaip-file-name-wrap\"><span class=\"gaip-file-name-line\"><span class=\"gaip-file-name\" title=\"{{gaip:3}}\">{{gaip:4}}</span></span><span class=\"gaip-file-version-meta\">{{gaip:5}} · {{gaip:6}}</span></span>{{gaip:7}}</button>{{gaip:8}}</li>","attachmentListMarkup-15":"<span class=\"gaip-file-history-toggle\" aria-hidden=\"true\"><span>›</span></span>","attachmentListMarkup-16":"<span></span>","attachmentListMarkup-17":"<ul class=\"gaip-file-versions\" aria-label=\"{{gaip:0}}历史版本\">{{gaip:1}}</ul>","attachmentListMarkup-18":"<li><button type=\"button\" class=\"gaip-file-version-row{{gaip:0}}\" data-file-version-id=\"{{gaip:1}}\" data-file-version-group-id=\"{{gaip:2}}\"><span>{{gaip:3}} 历史版本</span><span class=\"gaip-file-version-time\">{{gaip:4}}</span></button></li>","filePreviewMarkup-19":"<article class=\"gaip-file-paper\" aria-label=\"{{gaip:0}}内容预览\"><div class=\"gaip-file-paper-kicker\">GLORY · GAIP AI 方案附件</div><h4>{{gaip:1}}</h4><p class=\"gaip-file-paper-subtitle\">{{gaip:2}} · {{gaip:3}} · {{gaip:4}}</p><section class=\"gaip-file-paper-section\"><h5>方案摘要</h5><p>{{gaip:5}}。本文件由 AI Agent 结合方案目标、当前对话上下文与已补充的客户信息整理生成。</p></section><section class=\"gaip-file-paper-section\"><h5>核心分析</h5><div class=\"gaip-file-paper-highlight\"><div class=\"gaip-file-paper-stat\"><strong>需求匹配</strong><span>已根据对话需求完成要点梳理</span></div><div class=\"gaip-file-paper-stat\"><strong>路径比较</strong><span>按优先级展示可执行选项</span></div><div class=\"gaip-file-paper-stat\"><strong>持续迭代</strong><span>新对话产出将归档为新版本</span></div></div></section><section class=\"gaip-file-paper-section\"><h5>方案要点</h5><ul><li>{{gaip:6}}</li><li>建议在客户沟通前确认目标优先级与时间边界。</li><li>若后续对话出现新信息，AI Agent 可重新判断是否生成更新附件。</li></ul></section></article>","renderFileDialog-20":"<section class=\"gaip-file-dialog\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"gaip-file-title\" tabindex=\"-1\"><header class=\"gaip-file-dialog-header\"><div class=\"gaip-file-dialog-title\"><h2 id=\"gaip-file-title\">{{gaip:0}}</h2><div class=\"gaip-file-dialog-meta\"><span>方案ID：{{gaip:1}}</span>{{gaip:2}}<span class=\"gaip-file-dialog-status{{gaip:3}}\">{{gaip:4}}</span></div></div><button type=\"button\" class=\"gaip-file-close\" data-file-close aria-label=\"关闭附件预览\"><img src=\"./shared/assets/icons/third-party/ant-design/close-outlined.svg\" alt=\"\"></button></header><div class=\"gaip-file-dialog-body\"><aside class=\"gaip-file-sidebar\" aria-label=\"方案附件列表\"><div class=\"gaip-file-sidebar-head\"><h3>附件（{{gaip:5}}）</h3><button type=\"button\" class=\"gaip-file-download\" data-file-download-all title=\"打包下载全部附件\"><img src=\"./shared/assets/icons/third-party/ant-design/download-outlined.svg\" alt=\"\">下载全部</button></div><ul class=\"gaip-file-groups\">{{gaip:6}}</ul></aside><section class=\"gaip-file-preview\" aria-label=\"附件内容预览\"><div class=\"gaip-file-preview-head\"><span class=\"gaip-file-preview-title\" title=\"{{gaip:7}}\">{{gaip:8}} · {{gaip:9}}</span><button type=\"button\" class=\"gaip-file-download\" data-file-download-current><img src=\"./shared/assets/icons/third-party/ant-design/download-outlined.svg\" alt=\"\">下载文件</button></div><div class=\"gaip-file-preview-stage\">{{gaip:10}}</div></section></div></section>","renderFileDialog-21":"<span class=\"gaip-file-dialog-client\">客户：{{gaip:0}}</span>","createPreviewRoot-22":"<div class=\"gaip-owner-overlay\" data-owner-modal hidden></div><div class=\"gaip-owner-confirm-overlay\" data-unlink-confirm hidden></div><div class=\"gaip-file-overlay\" data-file-modal hidden></div><div class=\"gaip-proposal-toast\" data-proposal-toast></div>"};
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

      var templates = [
        {
          id: 'bermuda-fna',
          name: '百慕大-离岸保险 FNA（财务需求分析）问卷与产品配置',
          description: '百慕大及离岸保险FNA问卷与产品配置',
          cover: './channels/proposal-center/assets/images/bermuda-fna-cover.jpg'
        },
        {
          id: 'hongkong-fna',
          name: '香港保险FNA问卷生成与产品配置方案',
          description: '香港保险FNA问卷生成与产品配置方案 Skill v2',
          cover: './channels/proposal-center/assets/images/hongkong-fna-cover.jpg'
        },
        {
          id: 'usa-insurance-ppt',
          name: '美国保险配置方案PPT（中国客户专用）',
          description: '基于FNA信息生成美国保险配置方案PPT',
          cover: './channels/proposal-center/assets/images/usa-insurance-ppt-cover.jpg'
        },
        {
          id: 'singapore-insurance',
          name: '新加坡保险计划书对比分析方案',
          description: '对比分析新加坡保险计划书并形成建议',
          cover: './channels/proposal-center/assets/images/singapore-insurance-cover.jpg'
        },
        {
          id: 'china-insurance-insight',
          name: 'GLORY国内保险方向洞察',
          description: '基于客户KYC判断国内外保险配置方向',
          cover: './channels/proposal-center/assets/images/china-insurance-insight-cover.jpg'
        }
      ];

      var customers = [
        { id: 'hhp6932', name: '黄鹤平', code: 'hhp6932' },
        { id: 'hb16932', name: '韩彬', code: 'hb16932' },
        { id: 'gqc24321', name: '顾秋诚', code: 'gqc24321' },
        { id: 'C20260001', name: '陈思远', code: 'C20260001' },
        { id: 'C20260002', name: '周雅宁', code: 'C20260002' },
        { id: 'C20260003', name: '林嘉衡', code: 'C20260003' },
        { id: 'C20260004', name: '许安然', code: 'C20260004' },
        { id: 'C20260005', name: '赵子睿', code: 'C20260005' },
        { id: 'C20260006', name: '宋嘉禾', code: 'C20260006' },
        { id: 'C20260007', name: '顾承泽', code: 'C20260007' }
      ];

      var records = [
        { id: 6931, templateId: 'bermuda-fna', creator: '黄鹤平 hhp6932', clientId: 'hb16932', date: '2026-08-05 15:20', status: 'linked' },
        { id: 6930, templateId: 'bermuda-fna', creator: '陈思远 C20260001', clientId: null, date: '2026-08-04 11:36', status: 'pending' },
        { id: 6928, templateId: 'hongkong-fna', creator: '周雅宁 C20260002', clientId: 'C20260002', date: '2026-08-03 09:48', status: 'linked' },
        { id: 6924, templateId: 'usa-insurance-ppt', creator: '林嘉衡 C20260003', clientId: null, date: '2026-08-02 17:12', status: 'pending' },
        { id: 6921, templateId: 'singapore-insurance', creator: '许安然 C20260004', clientId: 'C20260004', date: '2026-08-01 14:05', status: 'linked' },
        { id: 6917, templateId: 'hongkong-fna', creator: '赵子睿 C20260005', clientId: null, date: '2026-07-31 16:42', status: 'pending' },
        { id: 6912, templateId: 'usa-insurance-ppt', creator: '宋嘉禾 C20260006', clientId: 'C20260006', date: '2026-07-30 10:18', status: 'linked' },
        { id: 6908, templateId: 'bermuda-fna', creator: '顾承泽 C20260007', clientId: null, date: '2026-07-29 13:26', status: 'pending' }
      ];

      var attachmentCollections = {
        '6931': [
          {
            id: 'identity-plan',
            name: '身份规划书.pdf',
            versions: [
              { id: 'v3', label: 'v3', time: '今天 15:42', generatedAt: '2026-08-13 15:42', note: '已根据当前对话补充家庭成员路径与执行节点' },
              { id: 'v2', label: 'v2', time: '今天 14:18', generatedAt: '2026-08-13 14:18', note: '已补充不同身份路径的时间与成本对比' },
              { id: 'v1', label: 'v1', time: '08-12 18:06', generatedAt: '2026-08-12 18:06', note: '首次生成的家庭身份规划初稿' }
            ]
          },
          {
            id: 'fna-analysis',
            name: '离岸保险FNA分析.pdf',
            versions: [
              { id: 'v2', label: 'v2', time: '今天 15:18', generatedAt: '2026-08-13 15:18', note: '调整了现金流压力情景与保障缺口测算' },
              { id: 'v1', label: 'v1', time: '08-12 17:35', generatedAt: '2026-08-12 17:35', note: '基于问卷信息形成的FNA分析初稿' }
            ]
          },
          {
            id: 'configuration',
            name: '产品配置建议书.pdf',
            versions: [
              { id: 'v1', label: 'v1', time: '08-12 18:22', generatedAt: '2026-08-12 18:22', note: '按需求优先级整理的产品配置建议' }
            ]
          }
        ]
      };

      var state = {
        tab: 'catalog',
        category: 'all',
        status: 'all',
        search: '',
        ownerRecordId: null,
        ownerOriginalClientId: null,
        ownerSelectedClientId: null,
        ownerQuery: '',
        fileRecordId: null,
        fileGroupId: null,
        fileVersionId: null,
        fileExpandedGroups: {}
      };
      var toastTimer = 0;

      function escapeHtml(value) {
        return String(value == null ? '' : value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function getTemplate(id) {
        return templates.find(function (item) { return item.id === id; }) || templates[0];
      }

      function catalogMarkup() {
        return templates.map(function (item, index) {
          return __gaipMarkup_c5ef867ad8("catalogMarkup-1", [('' + (escapeHtml(item.cover))), ('' + (escapeHtml(item.name))), ('' + (escapeHtml(item.name))), ('' + (escapeHtml(item.description))), ('' + (escapeHtml(item.id))), ('' + (index))]);
        }).join('');
      }

      function categoryCounts() {
        return records.reduce(function (counts, record) {
          counts[record.templateId] = (counts[record.templateId] || 0) + 1;
          return counts;
        }, {});
      }

      function categoryMarkup() {
        var counts = categoryCounts();
        var ids = [];
        records.forEach(function (record) {
          if (ids.indexOf(record.templateId) === -1) ids.push(record.templateId);
        });
        return [__gaipMarkup_c5ef867ad8("categoryMarkup-2", [('' + (records.length))])]
          .concat(ids.map(function (id) {
            var item = getTemplate(id);
            return __gaipMarkup_c5ef867ad8("categoryMarkup-3", [('' + (escapeHtml(id))), ('' + (escapeHtml(item.name))), ('' + (counts[id] || 0))]);
          })).join('');
      }

      function appMarkup() {
        return __gaipMarkup_c5ef867ad8("appMarkup-4", [('' + (templates.length)), ('' + (catalogMarkup())), ('' + (categoryMarkup())), ('' + (records.length)), ('' + (records.length)), ('' + (records.length))]);
      }

      function filteredRecords() {
        var keyword = state.search.trim().toLowerCase();
        return records.filter(function (record) {
          var item = getTemplate(record.templateId);
          var categoryMatches = state.category === 'all' || record.templateId === state.category;
          var statusMatches = state.status === 'all' || record.status === state.status;
          var linkedClient = customers.find(function (customer) { return customer.id === record.clientId; });
          var searchMatches = !keyword || [item.name, item.description, record.creator, linkedClient && linkedClient.name, linkedClient && linkedClient.code, String(record.id)].join(' ').toLowerCase().indexOf(keyword) >= 0;
          return categoryMatches && statusMatches && searchMatches;
        });
      }

      function renderRecords(root) {
        var list = root.querySelector('.gaip-record-list');
        var result = filteredRecords();
        var pending = records.filter(function (record) { return record.status === 'pending'; }).length;
        root.querySelectorAll('[data-pending-count]').forEach(function (node) { node.textContent = pending; });
        root.querySelector('[data-record-total]').textContent = result.length;
        if (!result.length) {
          list.innerHTML = __gaipMarkup_c5ef867ad8("renderRecords-5");
          return;
        }
        list.innerHTML = result.map(function (record) {
          var item = getTemplate(record.templateId);
          var linked = record.status === 'linked';
          var linkedClient = customers.find(function (customer) { return customer.id === record.clientId; });
          return __gaipMarkup_c5ef867ad8("renderRecords-6", [('' + (linked ? ' is-linked' : '')), ('' + (record.id)), ('' + (escapeHtml(item.name))), ('' + (record.id)), ('' + (linkedClient ? __gaipMarkup_c5ef867ad8("renderRecords-7", [('' + (escapeHtml(linkedClient.name)))]) : '')), ('' + (linked ? 'success' : 'warning')), ('' + (linked ? '已归属' : '待确认客户归属')), ('' + (escapeHtml(record.date))), ('' + (linked ? '' : ' is-attention')), ('' + (linked ? '修改归属' : '确认归属'))]);
        }).join('');
      }

      function showToast(root, message) {
        var toast = root.querySelector('.gaip-proposal-toast');
        window.clearTimeout(toastTimer);
        toast.textContent = message;
        toast.classList.add('is-visible');
        toastTimer = window.setTimeout(function () { toast.classList.remove('is-visible'); }, 2200);
      }

      function getOwnerRecord() {
        return records.find(function (record) { return String(record.id) === String(state.ownerRecordId); }) || null;
      }

      function customerOptionsMarkup() {
        var keyword = state.ownerQuery.trim().toLowerCase();
        var result = customers.filter(function (customer) {
          return !keyword || (customer.name + ' ' + customer.code).toLowerCase().indexOf(keyword) >= 0;
        });
        if (!result.length) return __gaipMarkup_c5ef867ad8("customerOptionsMarkup-8");
        return result.map(function (customer) {
          var selected = String(customer.id) === String(state.ownerSelectedClientId);
          return __gaipMarkup_c5ef867ad8("customerOptionsMarkup-9", [('' + (selected ? ' is-selected' : '')), ('' + (escapeHtml(customer.id))), ('' + (selected ? 'true' : 'false')), ('' + (escapeHtml(customer.name))), ('' + (selected ? __gaipMarkup_c5ef867ad8("customerOptionsMarkup-10") : ''))]);
        }).join('');
      }

      function ownerSelectionChanged(record) {
        if (!state.ownerSelectedClientId) return false;
        if (record.status !== 'linked') return true;
        return String(state.ownerSelectedClientId) !== String(state.ownerOriginalClientId);
      }

      function updateOwnerDialog(root) {
        var modal = root.querySelector('[data-owner-modal]');
        var record = getOwnerRecord();
        var list = modal && modal.querySelector('[data-owner-list]');
        var primary = modal && modal.querySelector('[data-owner-save]');
        if (!modal || !record) return;
        if (list) list.innerHTML = customerOptionsMarkup();
        if (primary) primary.disabled = !ownerSelectionChanged(record);
      }

      function scrollOwnerSelectionIntoView(root) {
        var modal = root.querySelector('[data-owner-modal]');
        var list = modal && modal.querySelector('[data-owner-list]');
        var selected = list && list.querySelector('.gaip-owner-option.is-selected');
        var listRect;
        var selectedRect;
        var selectedTop;
        if (!list || !selected) return;
        listRect = list.getBoundingClientRect();
        selectedRect = selected.getBoundingClientRect();
        selectedTop = selectedRect.top - listRect.top + list.scrollTop;
        list.scrollTop = Math.max(0, selectedTop - (list.clientHeight - selectedRect.height) / 2);
      }

      function closeOwnerModal(root) {
        var modal = root.querySelector('[data-owner-modal]');
        var confirm = root.querySelector('[data-unlink-confirm]');
        if (modal) {
          modal.hidden = true;
          modal.innerHTML = '';
        }
        if (confirm) {
          confirm.hidden = true;
          confirm.innerHTML = '';
        }
        document.body.classList.remove('gaip-proposal-scroll-locked');
        state.ownerRecordId = null;
        state.ownerOriginalClientId = null;
        state.ownerSelectedClientId = null;
        state.ownerQuery = '';
        if (root.__gaipOwnerLastTrigger && document.contains(root.__gaipOwnerLastTrigger)) root.__gaipOwnerLastTrigger.focus();
        root.__gaipOwnerLastTrigger = null;
      }

      function saveOwnerSelection(root) {
        var record = getOwnerRecord();
        var wasLinked;
        if (!record || !ownerSelectionChanged(record)) return;
        wasLinked = record.status === 'linked';
        record.clientId = state.ownerSelectedClientId;
        record.status = 'linked';
        renderRecords(root);
        closeOwnerModal(root);
        showToast(root, wasLinked ? '客户归属已修改' : '客户归属已确认');
      }

      function openUnlinkConfirm(root) {
        var overlay = root.querySelector('[data-unlink-confirm]');
        var record = getOwnerRecord();
        var dialog;
        var cancel;
        if (!overlay || !record || record.status !== 'linked') return;
        if (!window.__GAIP_MODAL_COMPONENT__) throw new Error('解除关联确认缺少共享弹窗组件');
        overlay.innerHTML =
          __gaipMarkup_c5ef867ad8("openUnlinkConfirm-11");
        dialog = overlay.querySelector('.gaip-owner-confirm-dialog');
        window.__GAIP_MODAL_COMPONENT__.setConfirmState(dialog, {
          type: 'confirm',
          title: '暂不关联客户',
          message: '确认暂不关联任何客户？',
          description: '确认后，方案记录将变为“待确认客户归属”，不会删除方案文件，也不会修改方案内容。',
          cancelLabel: '取消',
          confirmLabel: '确认暂不关联'
        });
        overlay.hidden = false;
        cancel = function () {
          overlay.hidden = true;
          overlay.innerHTML = '';
          var unlinkButton = root.querySelector('[data-owner-unlink]');
          if (unlinkButton) unlinkButton.focus();
        };
        overlay.querySelector('[data-unlink-cancel]').onclick = cancel;
        overlay.querySelector('[data-unlink-close]').onclick = cancel;
        overlay.querySelector('[data-unlink-confirm-button]').onclick = function () {
          record.clientId = null;
          record.status = 'pending';
          renderRecords(root);
          closeOwnerModal(root);
          showToast(root, '已暂不关联客户，方案记录变为待确认客户归属');
        };
        overlay.querySelector('[data-unlink-cancel]').focus();
      }

      var globalCustomerDrawerRoot = null;
      var globalCustomerDrawerHost = null;

      function renderGlobalCustomerDrawer(open, root) {
        var webpackRequire = window.__GAIP_WEBPACK_REQUIRE__;
        if (open) {
          document.body.setAttribute('data-gaip-global-customer-open', 'true');
        } else {
          window.setTimeout(function () {
            document.body.setAttribute('data-gaip-global-customer-open', 'false');
          }, 320);
        }
        if (!webpackRequire) {
          showToast(root, '新建客户组件加载中，请稍后再试');
          return false;
        }

        var React = webpackRequire(67294);
        var ReactDOM = webpackRequire(20745);
        var CreateCustomerDrawer = webpackRequire(1462).Z;
        if (!globalCustomerDrawerHost) {
          globalCustomerDrawerHost = document.createElement('div');
          globalCustomerDrawerHost.setAttribute('data-gaip-global-customer-drawer-host', 'true');
          document.body.appendChild(globalCustomerDrawerHost);
          globalCustomerDrawerRoot = ReactDOM.createRoot(globalCustomerDrawerHost);
        }

        function closeDrawer() {
          renderGlobalCustomerDrawer(false, root);
          var newLink = root.querySelector('[data-owner-new-client]');
          if (newLink) newLink.focus();
        }

        function saveCustomer(customer) {
          var code = String(customer && customer.clientId || ('C' + String(Date.now()).slice(-8))).trim();
          var name = String(customer && customer.name || '').trim();
          var ownerModal = root.querySelector('[data-owner-modal]');
          var ownerModalOpen = ownerModal && !ownerModal.hidden;
          if (!code || !name) return;
          if (!customers.some(function (entry) { return entry.id === code; })) {
            customers.unshift({ id: code, name: name, code: code });
          }
          if (ownerModalOpen) {
            state.ownerSelectedClientId = code;
            state.ownerQuery = '';
            var search = root.querySelector('[data-owner-search]');
            if (search) search.value = '';
            updateOwnerDialog(root);
          }
          renderGlobalCustomerDrawer(false, root);
          showToast(root, ownerModalOpen ? '客户已创建，请确认关联' : '客户已创建');
        }

        globalCustomerDrawerRoot.render(React.createElement(CreateCustomerDrawer, {
          open: open,
          handleClose: closeDrawer,
          handleSave: saveCustomer
        }));
        return true;
      }

      function openNewClientModal(root) {
        renderGlobalCustomerDrawer(true, root);
      }

      function openOwnerModal(root, record, trigger) {
        var modal = root.querySelector('[data-owner-modal]');
        var item = getTemplate(record.templateId);
        var linked = record.status === 'linked' && !!record.clientId;
        if (!modal) return;
        root.__gaipOwnerLastTrigger = trigger || null;
        state.ownerRecordId = record.id;
        state.ownerOriginalClientId = linked ? record.clientId : null;
        state.ownerSelectedClientId = linked ? record.clientId : null;
        state.ownerQuery = '';
        modal.innerHTML =
          __gaipMarkup_c5ef867ad8("openOwnerModal-12", [('' + (linked ? '修改客户归属' : '待确认客户归属')), ('' + (escapeHtml(item.name))), ('' + (escapeHtml(item.name))), ('' + (customerOptionsMarkup())), ('' + (linked ? __gaipMarkup_c5ef867ad8("openOwnerModal-13") : '')), ('' + (linked ? '确认修改' : '确认关联'))]);
        modal.hidden = false;
        document.body.classList.add('gaip-proposal-scroll-locked');

        modal.querySelector('[data-owner-close]').onclick = function () { closeOwnerModal(root); };
        modal.querySelector('[data-owner-cancel]').onclick = function () { closeOwnerModal(root); };
        modal.querySelector('[data-owner-save]').onclick = function () { saveOwnerSelection(root); };
        modal.querySelector('[data-owner-new-client]').onclick = function () { openNewClientModal(root); };
        if (linked) modal.querySelector('[data-owner-unlink]').onclick = function () { openUnlinkConfirm(root); };
        modal.querySelector('[data-owner-search]').oninput = function (event) {
          state.ownerQuery = event.target.value;
          updateOwnerDialog(root);
        };
        modal.onclick = function (event) {
          var option = event.target.closest('[data-owner-client-id]');
          if (!option) return;
          state.ownerSelectedClientId = option.getAttribute('data-owner-client-id');
          updateOwnerDialog(root);
        };
        window.requestAnimationFrame(function () {
          scrollOwnerSelectionIntoView(root);
          modal.querySelector('[data-owner-search]').focus({ preventScroll: true });
        });
      }

      function getFileRecord() {
        return records.find(function (record) { return String(record.id) === String(state.fileRecordId); }) || null;
      }

      function getAttachmentGroups(record) {
        var item;
        if (!record) return [];
        if (attachmentCollections[String(record.id)]) return attachmentCollections[String(record.id)];
        item = getTemplate(record.templateId);
        return [
          {
            id: 'proposal-main-' + record.id,
            name: item.name.replace(/[\s（(].*$/, '') + '方案书.pdf',
            versions: [
              { id: 'v2', label: 'v2', time: record.date.slice(5), generatedAt: record.date, note: '结合当前对话更新的完整方案版本' },
              { id: 'v1', label: 'v1', time: record.date.slice(5), generatedAt: record.date, note: 'AI Agent 首次生成的方案附件' }
            ]
          },
          {
            id: 'proposal-summary-' + record.id,
            name: '方案要点摘要.pdf',
            versions: [
              { id: 'v1', label: 'v1', time: record.date.slice(5), generatedAt: record.date, note: '从完整方案中整理的核心结论与后续行动建议' }
            ]
          }
        ];
      }

      function getSelectedAttachment() {
        var record = getFileRecord();
        var groups = getAttachmentGroups(record);
        var group = groups.find(function (entry) { return entry.id === state.fileGroupId; }) || groups[0];
        var version = group && group.versions.find(function (entry) { return entry.id === state.fileVersionId; });
        if (!version && group) version = group.versions[0];
        return { record: record, groups: groups, group: group, version: version };
      }

      function attachmentListMarkup(groups) {
        return groups.map(function (group) {
          var current = group.versions[0];
          var expanded = !!state.fileExpandedGroups[group.id];
          var selectedGroup = group.id === state.fileGroupId;
          var history = group.versions.slice(1);
          return __gaipMarkup_c5ef867ad8("attachmentListMarkup-14", [('' + (selectedGroup && state.fileVersionId === current.id ? ' is-selected' : '')), ('' + (escapeHtml(group.id))), ('' + (history.length ? String(expanded) : 'false')), ('' + (escapeHtml(group.name))), ('' + (escapeHtml(group.name))), ('' + (escapeHtml(current.label))), ('' + (escapeHtml(current.time))), ('' + (history.length ? __gaipMarkup_c5ef867ad8("attachmentListMarkup-15") : __gaipMarkup_c5ef867ad8("attachmentListMarkup-16"))), ('' + (history.length && expanded ? __gaipMarkup_c5ef867ad8("attachmentListMarkup-17", [('' + (escapeHtml(group.name))), ('' + (history.map(function (version) {
              return __gaipMarkup_c5ef867ad8("attachmentListMarkup-18", [('' + (selectedGroup && state.fileVersionId === version.id ? ' is-selected' : '')), ('' + (escapeHtml(version.id))), ('' + (escapeHtml(group.id))), ('' + (escapeHtml(version.label))), ('' + (escapeHtml(version.time)))]);
            }).join('')))]) : ''))]);
        }).join('');
      }

      function filePreviewMarkup(selection) {
        var item = getTemplate(selection.record.templateId);
        var client = customers.find(function (customer) { return customer.id === selection.record.clientId; });
        var title = selection.group.name.replace(/\.pdf$/i, '');
        return __gaipMarkup_c5ef867ad8("filePreviewMarkup-19", [('' + (escapeHtml(selection.group.name))), ('' + (escapeHtml(title))), ('' + (escapeHtml(selection.version.label))), ('' + (escapeHtml(selection.version.generatedAt))), ('' + (escapeHtml(client ? client.name : '待确认客户归属'))), ('' + (escapeHtml(selection.version.note))), ('' + (escapeHtml(item.description)))]);
      }

      function renderFileDialog(root, focusSelector) {
        var modal = root.querySelector('[data-file-modal]');
        var selection = getSelectedAttachment();
        var linkedClient;
        var statusLabel;
        if (!modal || !selection.record || !selection.group || !selection.version) return;
        linkedClient = customers.find(function (customer) { return customer.id === selection.record.clientId; });
        statusLabel = selection.record.status === 'linked' ? '已归属' : '待确认客户归属';
        modal.innerHTML =
          __gaipMarkup_c5ef867ad8("renderFileDialog-20", [('' + (escapeHtml(getTemplate(selection.record.templateId).name))), ('' + (selection.record.id)), ('' + (linkedClient ? __gaipMarkup_c5ef867ad8("renderFileDialog-21", [('' + (escapeHtml(linkedClient.name)))]) : '')), ('' + (selection.record.status === 'linked' ? '' : ' is-pending')), ('' + (statusLabel)), ('' + (selection.groups.length)), ('' + (attachmentListMarkup(selection.groups))), ('' + (escapeHtml(selection.group.name))), ('' + (escapeHtml(selection.group.name))), ('' + (escapeHtml(selection.version.label))), ('' + (filePreviewMarkup(selection)))]);
        modal.hidden = false;
        if (focusSelector) {
          window.requestAnimationFrame(function () {
            var target = modal.querySelector(focusSelector);
            if (target) target.focus();
          });
        }
        if (window.__GAIP_MODAL_COMPONENT__) window.__GAIP_MODAL_COMPONENT__.scanInformation(modal);
      }

      function openFileModal(root, record, trigger) {
        var groups = getAttachmentGroups(record);
        if (!groups.length) {
          showToast(root, '当前方案暂无附件');
          return;
        }
        root.__gaipFileLastTrigger = trigger || null;
        state.fileRecordId = record.id;
        state.fileGroupId = groups[0].id;
        state.fileVersionId = groups[0].versions[0].id;
        state.fileExpandedGroups = {};
        if (groups[0].versions.length > 1) state.fileExpandedGroups[groups[0].id] = true;
        document.body.classList.add('gaip-proposal-scroll-locked');
        renderFileDialog(root, '.gaip-file-dialog');
      }

      function closeFileModal(root) {
        var modal = root.querySelector('[data-file-modal]');
        if (modal) {
          modal.hidden = true;
          modal.innerHTML = '';
        }
        document.body.classList.remove('gaip-proposal-scroll-locked');
        state.fileRecordId = null;
        state.fileGroupId = null;
        state.fileVersionId = null;
        state.fileExpandedGroups = {};
        if (root.__gaipFileLastTrigger && document.contains(root.__gaipFileLastTrigger)) root.__gaipFileLastTrigger.focus();
        root.__gaipFileLastTrigger = null;
      }

      function createPdfBytes(selection) {
        var encoder = new TextEncoder();
        var title = 'GAIP Proposal Attachment - ' + selection.version.label;
        var stream = 'BT\n/F1 18 Tf\n72 760 Td\n(' + title.replace(/[()\\]/g, '') + ') Tj\n0 -32 Td\n/F1 11 Tf\n(Generated: ' + selection.version.generatedAt + ') Tj\n0 -24 Td\n(Record ID: ' + selection.record.id + ') Tj\nET';
        var objects = [
          '<< /Type /Catalog /Pages 2 0 R >>',
          '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
          '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
          '<< /Length ' + encoder.encode(stream).length + ' >>\nstream\n' + stream + '\nendstream',
          '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
        ];
        var pdf = '%PDF-1.4\n';
        var offsets = [0];
        objects.forEach(function (object, index) {
          offsets.push(encoder.encode(pdf).length);
          pdf += (index + 1) + ' 0 obj\n' + object + '\nendobj\n';
        });
        var xrefOffset = encoder.encode(pdf).length;
        pdf += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
        offsets.slice(1).forEach(function (offset) { pdf += String(offset).padStart(10, '0') + ' 00000 n \n'; });
        pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';
        return encoder.encode(pdf);
      }

      function crc32(bytes) {
        var crc = -1;
        var i;
        var j;
        for (i = 0; i < bytes.length; i += 1) {
          crc ^= bytes[i];
          for (j = 0; j < 8; j += 1) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
        }
        return (crc ^ -1) >>> 0;
      }

      function makeZipBlob(entries) {
        var encoder = new TextEncoder();
        var local = [];
        var central = [];
        var localOffset = 0;
        function u16(target, value) { target.push(value & 255, (value >>> 8) & 255); }
        function u32(target, value) { target.push(value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255); }
        entries.forEach(function (entry) {
          var name = encoder.encode(entry.name);
          var data = entry.data;
          var crc = crc32(data);
          var start = local.length;
          u32(local, 0x04034b50); u16(local, 20); u16(local, 0x0800); u16(local, 0); u16(local, 0); u16(local, 0);
          u32(local, crc); u32(local, data.length); u32(local, data.length); u16(local, name.length); u16(local, 0);
          Array.prototype.push.apply(local, name); Array.prototype.push.apply(local, data);
          u32(central, 0x02014b50); u16(central, 20); u16(central, 20); u16(central, 0x0800); u16(central, 0); u16(central, 0); u16(central, 0);
          u32(central, crc); u32(central, data.length); u32(central, data.length); u16(central, name.length); u16(central, 0); u16(central, 0); u16(central, 0); u16(central, 0); u32(central, 0); u32(central, localOffset);
          Array.prototype.push.apply(central, name);
          localOffset += local.length - start;
        });
        var end = [];
        u32(end, 0x06054b50); u16(end, 0); u16(end, 0); u16(end, entries.length); u16(end, entries.length); u32(end, central.length); u32(end, local.length); u16(end, 0);
        return new Blob([new Uint8Array(local.concat(central, end))], { type: 'application/zip' });
      }

      function saveBlob(blob, name) {
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      }

      function downloadCurrentAttachment(root) {
        var selection = getSelectedAttachment();
        var bytes;
        if (!selection.group || !selection.version) return;
        bytes = createPdfBytes(selection);
        saveBlob(new Blob([bytes], { type: 'application/pdf' }), selection.group.name.replace(/\.pdf$/i, '_' + selection.version.label + '.pdf'));
        showToast(root, '已下载：' + selection.group.name + ' ' + selection.version.label);
      }

      function downloadAllAttachments(root) {
        var selection = getSelectedAttachment();
        var entries = selection.groups.map(function (group) {
          var current = { record: selection.record, group: group, version: group.versions[0] };
          return { name: group.name.replace(/\.pdf$/i, '_' + group.versions[0].label + '.pdf'), data: createPdfBytes(current) };
        });
        saveBlob(makeZipBlob(entries), '方案' + selection.record.id + '_全部附件.zip');
        showToast(root, '已打包下载 ' + entries.length + ' 个附件');
      }

      function setNativeTextareaValue(textarea, value) {
        var setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
        if (setter && setter.set) setter.set.call(textarea, value);
        else textarea.value = value;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
      }

      function selectTemplateInsideAgent(item, index, tries) {
        var modal = document.querySelector('.agentModal___Nxp06');
        var attempt = tries || 0;
        if (!modal) {
          if (attempt < 24) window.setTimeout(function () { selectTemplateInsideAgent(item, index, attempt + 1); }, 120);
          return;
        }

        if (modal.getAttribute('data-proposal-center-preparing') !== item.id) {
          modal.setAttribute('data-proposal-center-preparing', item.id);
          var newSession = modal.querySelector('.gaip-agent-new-session');
          if (newSession) newSession.click();
        }

        var skillToggle = modal.querySelector('.skillToggle___OpRvz');
        if (skillToggle && skillToggle.getAttribute('aria-pressed') !== 'true') {
          skillToggle.click();
          window.setTimeout(function () { selectTemplateInsideAgent(item, index, attempt + 1); }, 180);
          return;
        }

        var options = Array.prototype.slice.call(modal.querySelectorAll('.gaip-agent-option[data-plan-id]'));
        if (!options.length) {
          if (attempt < 24) window.setTimeout(function () { selectTemplateInsideAgent(item, index, attempt + 1); }, 140);
          return;
        }

        var selected = options[index % options.length];
        var selectedId = selected.getAttribute('data-plan-id');
        selected.click();
        window.setTimeout(function () {
          var chosen = modal.querySelector('.gaip-agent-option[data-plan-id="' + selectedId + '"]');
          var text = chosen && chosen.querySelector('.gaip-agent-option-text');
          var tagText = modal.querySelector('.gaip-agent-plan-tag .text___u9Ggi');
          var textarea = modal.querySelector('textarea.textarea___GMXtD');
          if (text) text.textContent = item.name;
          if (tagText) tagText.textContent = item.name;
          if (textarea) setNativeTextareaValue(textarea, '请生成「' + item.name + '」，并结合当前对话上下文给出方案重点。');
          modal.removeAttribute('data-proposal-center-preparing');
        }, 80);
      }

      function openAgent(item, index, trigger, root) {
        var floatButton = document.querySelector('.globalButton___DVYbX');
        var floatRect;
        var openEvent;
        if (!floatButton) {
          showToast(root, 'AI Agent 尚未加载，请稍后再试');
          return;
        }
        if (trigger) {
          trigger.disabled = true;
          trigger.querySelector('span').textContent = '正在打开';
        }
        floatRect = floatButton.getBoundingClientRect();
        openEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
          button: 0,
          clientX: floatRect.left + floatRect.width / 2,
          clientY: floatRect.top + floatRect.height / 2,
          screenX: floatRect.left + floatRect.width / 2,
          screenY: floatRect.top + floatRect.height / 2
        });
        floatButton.dispatchEvent(openEvent);
        window.setTimeout(function () { selectTemplateInsideAgent(item, index, 0); }, 60);
        window.setTimeout(function () {
          if (trigger) {
            trigger.disabled = false;
            trigger.querySelector('span').textContent = '生成方案';
          }
        }, 900);
      }

      function bindApp(root) {
        root.addEventListener('click', function (event) {
          var tab = event.target.closest('.gaip-proposal-tab');
          var generate = event.target.closest('.gaip-proposal-generate');
          var category = event.target.closest('.gaip-record-category');
          var status = event.target.closest('.gaip-record-status');
          var action = event.target.closest('.gaip-record-action');
          var newClientBridge = event.target.closest('[data-global-new-client-bridge]');
          var fileClose = event.target.closest('[data-file-close]');
          var fileGroup = event.target.closest('[data-file-group-id]');
          var fileVersion = event.target.closest('[data-file-version-id]');
          var fileDownloadCurrent = event.target.closest('[data-file-download-current]');
          var fileDownloadAll = event.target.closest('[data-file-download-all]');

          if (fileClose || event.target.matches('[data-file-modal]')) {
            closeFileModal(root);
            return;
          }

          if (fileDownloadCurrent) {
            downloadCurrentAttachment(root);
            return;
          }

          if (fileDownloadAll) {
            downloadAllAttachments(root);
            return;
          }

          if (fileVersion) {
            state.fileGroupId = fileVersion.getAttribute('data-file-version-group-id');
            state.fileVersionId = fileVersion.getAttribute('data-file-version-id');
            renderFileDialog(root, '[data-file-version-id="' + state.fileVersionId + '"][data-file-version-group-id="' + state.fileGroupId + '"]');
            return;
          }

          if (fileGroup) {
            var fileSelection = getSelectedAttachment();
            var selectedFileGroup = fileSelection.groups.find(function (entry) { return entry.id === fileGroup.getAttribute('data-file-group-id'); });
            if (!selectedFileGroup) return;
            state.fileGroupId = selectedFileGroup.id;
            state.fileVersionId = selectedFileGroup.versions[0].id;
            if (selectedFileGroup.versions.length > 1) state.fileExpandedGroups[selectedFileGroup.id] = !state.fileExpandedGroups[selectedFileGroup.id];
            renderFileDialog(root, '[data-file-group-id="' + state.fileGroupId + '"]');
            return;
          }

          if (newClientBridge) {
            openNewClientModal(root);
            return;
          }

          if (tab) {
            state.tab = tab.getAttribute('data-tab');
            root.querySelectorAll('.gaip-proposal-tab').forEach(function (button) {
              var active = button === tab;
              button.classList.toggle('is-active', active);
              button.setAttribute('aria-selected', active ? 'true' : 'false');
            });
            root.querySelectorAll('.gaip-proposal-panel').forEach(function (panel) {
              panel.hidden = panel.getAttribute('data-panel') !== state.tab;
            });
            if (state.tab === 'records') renderRecords(root);
            return;
          }

          if (generate) {
            var item = getTemplate(generate.getAttribute('data-template-id'));
            openAgent(item, Number(generate.getAttribute('data-template-index') || 0), generate, root);
            return;
          }

          if (category) {
            state.category = category.getAttribute('data-category');
            root.querySelectorAll('.gaip-record-category').forEach(function (button) { button.classList.toggle('is-active', button === category); });
            renderRecords(root);
            return;
          }

          if (status) {
            state.status = status.getAttribute('data-status');
            root.querySelectorAll('.gaip-record-status').forEach(function (button) { button.classList.toggle('is-active', button === status); });
            renderRecords(root);
            return;
          }

          if (action) {
            var card = action.closest('[data-record-id]');
            var record = records.find(function (entry) { return String(entry.id) === card.getAttribute('data-record-id'); });
            var item = record && getTemplate(record.templateId);
            var kind = action.getAttribute('data-action');
            if (!record || !item) return;
            if (kind === 'owner') {
              openOwnerModal(root, record, action);
            } else if (kind === 'source') {
              openAgent(item, templates.indexOf(item), null, root);
            } else if (kind === 'file') {
              openFileModal(root, record, action);
            }
          }
        });

        var search = root.querySelector('[data-record-search]');
        search.addEventListener('input', function () {
          state.search = search.value;
          renderRecords(root);
        });

        root.addEventListener('keydown', function (event) {
          if (event.key !== 'Escape') return;
          var confirm = root.querySelector('[data-unlink-confirm]');
          var owner = root.querySelector('[data-owner-modal]');
          var file = root.querySelector('[data-file-modal]');
          if (file && !file.hidden) {
            closeFileModal(root);
            return;
          }
          if (confirm && !confirm.hidden) {
            confirm.hidden = true;
            confirm.innerHTML = '';
            return;
          }
          if (owner && !owner.hidden) closeOwnerModal(root);
        });
      }

      function mount() {
        var container = document.querySelector('[data-gaip-region="channel-page"][data-gaip-page="proposal"]');
        if (!container || container.querySelector('[data-gaip-proposal-redesign="true"]')) return false;
        container.innerHTML = appMarkup();
        bindApp(container);
        renderRecords(container);
        return true;
      }

      function createPreviewRoot() {
        var root = document.createElement('div');
        root.className = 'gaip-proposal-app';
        root.innerHTML = __gaipMarkup_c5ef867ad8("createPreviewRoot-22");
        return root;
      }

      function createOwnerDialogPreview() {
        var root = createPreviewRoot();
        var record = records.find(function (entry) { return entry.status === 'linked'; }) || records[0];
        openOwnerModal(root, record, null);
        document.body.classList.remove('gaip-proposal-scroll-locked');
        return root.querySelector('[data-owner-modal]');
      }

      function createUnlinkConfirmPreview() {
        var root = createPreviewRoot();
        var record = records.find(function (entry) { return entry.status === 'linked'; }) || records[0];
        openOwnerModal(root, record, null);
        openUnlinkConfirm(root);
        document.body.classList.remove('gaip-proposal-scroll-locked');
        return root.querySelector('[data-unlink-confirm]');
      }

      function createFileDialogPreview() {
        var root = createPreviewRoot();
        var record = records[0];
        openFileModal(root, record, null);
        document.body.classList.remove('gaip-proposal-scroll-locked');
        return root.querySelector('[data-file-modal]');
      }

      window.__GAIP_PROPOSAL_PREVIEW__ = {
        createOwnerDialog: createOwnerDialogPreview,
        createUnlinkConfirm: createUnlinkConfirmPreview,
        createFileDialog: createFileDialogPreview
      };

      function scheduleMount() {
        window.requestAnimationFrame(function () {
          if (mount()) return;
          window.setTimeout(mount, 300);
        });
      }

      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleMount);
      else scheduleMount();

      var applicationRoot = document.getElementById('root');
      if (applicationRoot) new MutationObserver(function () { mount(); }).observe(applicationRoot, { childList: true, subtree: true });
    }());
