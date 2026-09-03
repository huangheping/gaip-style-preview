(function () {
  'use strict';
  var config = window.__GAIP_CHANNEL_CONFIG__.getByKey('config');
  var views = config.views, frame = 0, page, mountedView, logPanel, organizationLogDialog, organizationLogTrigger, bulkImportDialog, bulkImportTrigger, bulkImportState, adjustNodeDialog, adjustNodeTrigger, adjustNodeState, configToastTimer;
  var dialogPreviewMode = !!window.__GAIP_CONFIG_DIALOG_PREVIEW__, dialogController;
  var menuOpen = false, oldTitle = '', contentHost, hiddenContent = [];
  var state = { channel: 0, department: 'all', query: '', page: 1 };
  var source = window.__GAIP_CONFIG_SOURCE__;
  var channels = ['薄荷经纪人', 'Glory品牌顾问', '外部机构渠道', '线上渠道', '小仓', '荣耀经纪人'];
  var departmentSets = channels.map(function () {
    var parents = [];
    return source.departments.map(function (item) {
      var department = Object.assign({}, item, { parent: item.depth ? parents[item.depth - 1] : null });
      parents[item.depth] = item.id;
      return department;
    });
  });
  var levelThreeMockDepartments = [
    { id: 'mock-level-3-east', name: '华东业务组', depth: 3, parent: 'department-2' },
    { id: 'mock-level-3-institution', name: '机构服务组', depth: 3, parent: 'department-2' },
    { id: 'mock-level-3-key-account', name: '重点客户支持与运营组', depth: 3, parent: 'department-2' },
    { id: 'mock-level-3-follow-up', name: '区域客户跟进组', depth: 3, parent: 'department-2' }
  ];
  departmentSets.forEach(function (set) {
    set.splice.apply(set, [4, 0].concat(levelThreeMockDepartments.map(function (item) { return Object.assign({}, item); })));
  });
  var departments = departmentSets[0], departmentSequence = 0, departmentMenu, menuTrigger, dismissMenu;
  var currentOperatorRole = 'super-admin';
  var adminRoleAssignments = {
    '0:all': { commission: 1, clueAdmin: [1], clueFollower: [2] },
    '0:department-3': { commission: 1, clueAdmin: [1], clueFollower: [] },
    '0:department-4': { commission: null, clueAdmin: [], clueFollower: [2] },
    '0:mock-level-3-east': { commission: null, clueAdmin: [], clueFollower: [] },
    '0:mock-level-3-institution': { commission: 7, clueAdmin: [], clueFollower: [] },
    '0:mock-level-3-key-account': { commission: null, clueAdmin: [8], clueFollower: [] },
    '0:mock-level-3-follow-up': { commission: null, clueAdmin: [], clueFollower: [9] }
  };
  var treeTemplate = document.createElement('template'); treeTemplate.innerHTML = source.tree;
  var rowTemplates = {};
  treeTemplate.content.querySelectorAll('[data-department]').forEach(function (row) { rowTemplates[row.dataset.department] = row; });
  var leafTemplate = treeTemplate.content.querySelector('.ant-tree-switcher-noop').closest('[data-department]');
  var switcherMarkup = rowTemplates.all.querySelector('.ant-tree-switcher').innerHTML;
  var collapsed = {};
  var members = source.rows.map(function (html, i) {
    var row = sourceRow(html);
    return {
      id: i + 1, name: '示例成员' + String(i + 1).padStart(2, '0'), account: 'demo_' + String(i + 1).padStart(3, '0'), channel: 0, department: 'all', html: html,
      phone: row.children[2].textContent.trim().replace(/^-$/, ''), email: row.children[3].textContent.trim().replace(/^-$/, ''),
      admin: !!row.querySelector('.tagAdmin___YTyPD'), licensed: !!row.querySelector('.tagLicensed___m8J7I'),
      regions: Array.from(row.querySelectorAll('.tagRegion___z0DNJ')).map(function (el) { return el.textContent; }),
      referrer: row.querySelector('.tagInternal___EhJFS') ? 1 : row.querySelector('.tagExternal___fibsK') ? 2 : 0
    };
  });
  for (var mockMemberNumber = members.length + 1; mockMemberNumber <= 24; mockMemberNumber++) {
    var mockRow = sourceRow(source.rows[(mockMemberNumber - 1) % source.rows.length]);
    var mockAdminBadge = mockRow.querySelector('.tagAdmin___YTyPD');
    if (mockAdminBadge) mockAdminBadge.remove();
    members.push({
      id: mockMemberNumber,
      name: '示例成员' + String(mockMemberNumber).padStart(2, '0'),
      account: 'demo_' + String(mockMemberNumber).padStart(3, '0'),
      channel: 0,
      department: 'all',
      html: mockRow.outerHTML,
      phone: '****' + String(1000 + mockMemberNumber).slice(-4),
      email: mockMemberNumber % 3 === 0 ? 'demo' + mockMemberNumber + '@example.com' : '',
      admin: false,
      licensed: !!mockRow.querySelector('.tagLicensed___m8J7I'),
      regions: Array.from(mockRow.querySelectorAll('.tagRegion___z0DNJ')).map(function (el) { return el.textContent; }),
      referrer: mockRow.querySelector('.tagInternal___EhJFS') ? 1 : mockRow.querySelector('.tagExternal___fibsK') ? 2 : 0
    });
  }
  [
    [1, 'department-3', true],
    [2, 'department-4', true],
    [3, 'mock-level-3-east', false],
    [4, 'department-8', false],
    [5, 'department-9', false],
    [6, 'mock-level-3-east', true],
    [7, 'mock-level-3-institution', false],
    [8, 'mock-level-3-key-account', false],
    [9, 'mock-level-3-follow-up', false],
    [10, 'department-3', false], [11, 'mock-level-3-east', false],
    [12, 'department-4', false], [13, 'department-4', false],
    [14, 'department-8', false], [15, 'department-9', false],
    [16, 'department-10', false], [17, 'department-10', false],
    [18, 'department-3', false], [19, 'department-3', false],
    [20, 'department-8', false], [21, 'department-9', false],
    [22, 'mock-level-3-east', false], [23, 'mock-level-3-institution', false],
    [24, 'mock-level-3-key-account', false]
  ].forEach(function (assignment) {
    var member = members.find(function (item) { return item.id === assignment[0]; });
    if (!member) return;
    member.department = assignment[1];
    member.admin = assignment[2];
    updateAdminBadge(member);
  });
  channels.slice(1).forEach(function (channelName, offset) {
    var channelIndex = offset + 1;
    ['department-3', 'department-4', 'mock-level-3-east', 'mock-level-3-follow-up'].forEach(function (departmentId, memberOffset) {
      var memberId = 25 + offset * 4 + memberOffset;
      var mockRow = sourceRow(source.rows[(offset + memberOffset) % source.rows.length]);
      var mockAdminBadge = mockRow.querySelector('.tagAdmin___YTyPD');
      if (mockAdminBadge) mockAdminBadge.remove();
      members.push({
        id: memberId,
        name: channelName + '示例成员' + (memberOffset + 1),
        account: 'channel_demo_' + channelIndex + '_' + (memberOffset + 1),
        channel: channelIndex,
        department: departmentId,
        html: mockRow.outerHTML,
        phone: '****' + String(2000 + memberId).slice(-4),
        email: 'channel' + channelIndex + '_' + (memberOffset + 1) + '@example.com',
        admin: false,
        licensed: false,
        regions: [],
        referrer: 0
      });
    });
  });
  function sourceRow(html) {
    var template = document.createElement('template');
    template.innerHTML = '<table><tbody>' + html + '</tbody></table>';
    return template.content.querySelector('tr');
  }
  function sourceMarkup(html) { return html; }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var organizationLogRecords = (function () {
    var operators = [
      ['本地预览用户', 'demo_admin'], ['示例管理员', 'demo_manager'], ['组织管理员', 'demo_org_admin']
    ];
    var actions = [
      ['设置管理员', '角色：无', '角色：组织架构管理员'],
      ['编辑成员', '手机号：****0000', '手机号：****3307'],
      ['新增成员', '-', '成员：示例成员25'],
      ['修改成员身份', '身份：人管', '身份：人管、佣金'],
      ['新增部门', '-', '部门：客户服务一部'],
      ['修改部门', '部门名称：测试1部', '部门名称：客户服务一部'],
      ['调整节点', '所属节点：测试部门', '所属节点：研发部'],
      ['删除成员', '成员：示例成员12', '-']
    ];
    var paths = ['薄荷经纪人/测试部门/测试1部', '薄荷经纪人/研发部', 'Glory品牌顾问/顾问一部', '外部机构渠道/合作机构', '线上渠道/线上顾问', '小仓/运营组', '荣耀经纪人/经纪人团队'];
    var records = Array.from({ length: 24 }, function (_, index) {
      var operator = operators[index % operators.length], action = actions[index % actions.length];
      var day = String(2 - Math.floor(index / 12)).padStart(2, '0');
      var hour = String(17 - Math.floor((index % 12) / 2)).padStart(2, '0');
      var minute = String((index * 7) % 60).padStart(2, '0');
      return {
        id: index + 1,
        createdDt: '2026-09-' + day + ' ' + hour + ':' + minute + ':00',
        operatorName: operator[0], createdBy: operator[1], operateType: action[0],
        channelTab: channels[index % channels.length], nodeSource: paths[index % paths.length],
        operatorSource: index % 3 === 0 ? '成员编辑' : index % 3 === 1 ? '组织树' : '角色设置',
        updateBefore: action[1], updateAfter: action[2]
      };
    });
    records.unshift({
      id: 'export-members', createdDt: '2026-09-02 18:20:00', operatorName: '本地预览用户', createdBy: 'demo_admin',
      operateType: '导出成员名单', channelTab: 'Glory品牌顾问', nodeSource: 'Glory品牌顾问/销售中心', operatorSource: '成员导出',
      updateBefore: '—', updateAfter: '导出节点「Glory品牌顾问 / 销售中心」及其所有子节点成员名单，共 36 条'
    });
    return records;
  })();

  function organizationLogPath(path) {
    return String(path || '-').split('/').map(function (part, index) {
      return '<div class="nodePathItem___gCQoW">' + (index ? '<span class="nodePathPrefix___OG6Mm">└</span>' : '') + '<span>' + escapeHtml(part) + '</span></div>';
    }).join('');
  }
  function organizationLogChange(record) {
    return '<div class="changeCell___R8IRq"><div class="changeBefore___h4ODc">' + escapeHtml(record.updateBefore || '-') + '</div><div class="changeAfter___zedCG"><span class="changePrefix___njIZM">└</span><span>' + escapeHtml(record.updateAfter || '-') + '</span></div></div>';
  }
  function renderOrganizationOperationLog(pageNumber) {
    if (!organizationLogDialog) return;
    var pageSize = 10, totalPages = Math.ceil(organizationLogRecords.length / pageSize);
    var currentPage = Math.max(1, Math.min(totalPages, Number(pageNumber) || 1));
    organizationLogDialog.dataset.currentPage = String(currentPage);
    var rows = organizationLogRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(function (record) {
      return '<tr class="ant-table-row ant-table-row-level-0">' +
        '<td class="ant-table-cell">' + escapeHtml(record.createdDt) + '</td>' +
        '<td class="ant-table-cell"><div>' + escapeHtml(record.operatorName) + '</div><div class="subText___LYU2f">' + escapeHtml(record.createdBy) + '</div></td>' +
        '<td class="ant-table-cell"><span class="ant-tag organizationLogType___d8KpQ">' + escapeHtml(record.operateType) + '</span></td>' +
        '<td class="ant-table-cell">' + escapeHtml(record.channelTab) + '</td>' +
        '<td class="ant-table-cell"><div class="nodePath___leilu">' + organizationLogPath(record.nodeSource) + '</div></td>' +
        '<td class="ant-table-cell">' + escapeHtml(record.operatorSource) + '</td>' +
        '<td class="ant-table-cell">' + organizationLogChange(record) + '</td></tr>';
    }).join('');
    organizationLogDialog.querySelector('tbody').innerHTML = rows;
    var input = organizationLogDialog.querySelector('[data-organization-log-page]');
    input.value = String(currentPage);
    input.setAttribute('aria-valuenow', String(currentPage));
    organizationLogDialog.querySelector('[data-organization-log-pages]').textContent = String(totalPages);
    var previous = organizationLogDialog.querySelector('[data-organization-log-prev]');
    var next = organizationLogDialog.querySelector('[data-organization-log-next]');
    previous.disabled = currentPage === 1; next.disabled = currentPage === totalPages;
    previous.classList.toggle('pageArrowDisabled___m6h14', previous.disabled);
    next.classList.toggle('pageArrowDisabled___m6h14', next.disabled);
  }
  function closeOrganizationOperationLog() {
    if (!organizationLogDialog) return;
    if (organizationLogDialog.open) organizationLogDialog.close();
    else { organizationLogDialog.remove(); organizationLogDialog = null; }
  }

  function closeBulkImportDialog() {
    if (!bulkImportDialog) return;
    if (bulkImportDialog.open) bulkImportDialog.close();
    else { bulkImportDialog.remove(); bulkImportDialog = null; }
  }

  function closeAdjustNodeDialog() {
    if (!adjustNodeDialog) return;
    if (adjustNodeDialog.open) adjustNodeDialog.close();
    else { adjustNodeDialog.remove(); adjustNodeDialog = null; adjustNodeState = null; }
  }

  function formatLogTime(date) {
    function two(value) { return String(value).padStart(2, '0'); }
    return date.getFullYear() + '-' + two(date.getMonth() + 1) + '-' + two(date.getDate()) + ' ' + two(date.getHours()) + ':' + two(date.getMinutes()) + ':' + two(date.getSeconds());
  }

  function showConfigToast(message) {
    if (!page) return;
    var existing = page.querySelector('[data-config-toast]');
    if (existing) existing.remove();
    clearTimeout(configToastTimer);
    var toast = document.createElement('div');
    toast.className = 'gaip-config-toast';
    toast.setAttribute('data-config-toast', '');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = '<span class="gaip-config-toast-icon" aria-hidden="true">✓</span><span>' + escapeHtml(message) + '</span>';
    page.appendChild(toast);
    configToastTimer = setTimeout(function () { if (toast.isConnected) toast.remove(); }, 2600);
  }

  function adjustNodeVisibleDepartments() {
    var query = adjustNodeState.query.trim().toLowerCase();
    return departmentSets[adjustNodeState.channel].filter(function (department) {
      return !query || bulkDepartmentPath(adjustNodeState.channel, department.id).toLowerCase().includes(query);
    });
  }

  function renderAdjustNodeOptions() {
    if (!adjustNodeDialog || !adjustNodeState) return;
    var list = adjustNodeDialog.querySelector('[data-adjust-node-tree]');
    var visible = adjustNodeVisibleDepartments();
    list.innerHTML = visible.length ? visible.map(function (department) {
      var current = department.id === adjustNodeState.currentDepartment;
      var selected = department.id === adjustNodeState.targetDepartment;
      var name = department.id === 'all' ? channels[adjustNodeState.channel] : department.name;
      return '<div class="gaip-adjust-node-row' + (selected ? ' is-selected' : '') + (current ? ' is-current' : '') + '" role="treeitem" aria-selected="' + selected + '" style="--adjust-node-depth:' + department.depth + '">' +
        '<button type="button" class="gaip-adjust-node-option" data-adjust-node-option="' + escapeHtml(department.id) + '"' + (current ? ' disabled aria-disabled="true"' : '') + '>' +
        '<span class="gaip-adjust-node-radio" aria-hidden="true"></span><span class="gaip-adjust-node-folder" aria-hidden="true"></span>' +
        '<span class="gaip-adjust-node-copy"><strong>' + escapeHtml(name) + '</strong><small>' + escapeHtml(bulkDepartmentPath(adjustNodeState.channel, department.id)) + '</small></span>' +
        (current ? '<span class="gaip-adjust-node-current">当前节点</span>' : '') + '</button></div>';
    }).join('') : '<div class="gaip-adjust-node-empty">未找到匹配的组织节点</div>';
    var selectedPath = adjustNodeDialog.querySelector('[data-adjust-node-selected-path]');
    selectedPath.textContent = adjustNodeState.targetDepartment ? bulkDepartmentPath(adjustNodeState.channel, adjustNodeState.targetDepartment) : '请选择目标节点';
    selectedPath.classList.toggle('is-placeholder', !adjustNodeState.targetDepartment);
    var confirm = adjustNodeDialog.querySelector('[data-adjust-node-confirm]');
    confirm.disabled = !adjustNodeState.targetDepartment;
    adjustNodeDialog.querySelector('[data-adjust-node-error]').hidden = true;
  }

  function clearMemberNodeRoles(member, oldDepartment) {
    var roles = adminRoleAssignments[member.channel + ':' + oldDepartment];
    if (!roles) return;
    if (roles.commission === member.id) roles.commission = null;
    roles.clueAdmin = roles.clueAdmin.filter(function (memberId) { return memberId !== member.id; });
    roles.clueFollower = roles.clueFollower.filter(function (memberId) { return memberId !== member.id; });
  }

  function applyMemberNodeAdjustment() {
    if (!adjustNodeState || !adjustNodeState.targetDepartment) return;
    var member = members.find(function (item) { return item.id === adjustNodeState.memberId; });
    if (!member) return;
    var oldDepartment = member.department;
    var targetDepartment = adjustNodeState.targetDepartment;
    if (oldDepartment === targetDepartment) return;
    var oldPath = bulkDepartmentPath(member.channel, oldDepartment);
    var targetPath = bulkDepartmentPath(member.channel, targetDepartment);
    var removedOrganizationAdmin = !!member.admin;
    clearMemberNodeRoles(member, oldDepartment);
    if (member.admin) { member.admin = false; updateAdminBadge(member); }
    member.department = targetDepartment;
    organizationLogRecords.unshift({
      id: 'adjust-node-' + Date.now(),
      createdDt: formatLogTime(new Date()),
      operatorName: '本地预览用户',
      createdBy: 'demo_admin',
      operateType: '调整节点',
      channelTab: channels[member.channel],
      nodeSource: oldPath.replace(/ \/ /g, '/'),
      operatorSource: '手动',
      updateBefore: '成员：' + member.name + '（' + member.account + '）；所属节点：' + oldPath + (removedOrganizationAdmin ? '；组织架构管理员：是' : ''),
      updateAfter: '成员：' + member.name + '（' + member.account + '）；所属节点：' + targetPath + (removedOrganizationAdmin ? '；原节点管理员身份：已取消' : '')
    });
    state.page = 1;
    closeAdjustNodeDialog();
    if (mountedView === 'organization' && page && page.querySelector('tbody')) renderMembers();
    showConfigToast('已将 ' + member.name + ' 调整至 ' + targetPath);
  }

  function openAdjustNodeDialog(memberId, trigger) {
    closeAdjustNodeDialog();
    var member = members.find(function (item) { return item.id === Number(memberId); }) || members[0];
    if (!member) return null;
    adjustNodeTrigger = trigger || document.activeElement;
    adjustNodeState = { memberId: member.id, channel: member.channel, currentDepartment: member.department, targetDepartment: '', query: '' };
    var currentPath = bulkDepartmentPath(member.channel, member.department);
    var dialog = document.createElement('dialog');
    adjustNodeDialog = dialog;
    dialog.className = 'ant-modal css-10wz6x1 gaip-adjust-node-dialog';
    dialog.setAttribute('aria-label', '调整节点');
    dialog.innerHTML = '<div class="ant-modal-content"><header class="gaip-adjust-node-header"><h2>调整节点</h2><button type="button" class="gaip-adjust-node-close" data-adjust-node-close aria-label="关闭调整节点弹窗">×</button></header>' +
      '<div class="gaip-adjust-node-body"><div class="gaip-adjust-member-summary"><div><span>员工姓名</span><strong>' + escapeHtml(member.name) + '</strong></div><div><span>域账号</span><strong>' + escapeHtml(member.account) + '</strong></div></div>' +
      '<div class="gaip-adjust-current-node"><span>当前节点</span><strong>' + escapeHtml(currentPath) + '</strong></div>' +
      '<section class="gaip-adjust-target-section"><div class="gaip-adjust-target-heading"><label><span aria-hidden="true">*</span> 目标节点</label><strong data-adjust-node-selected-path class="is-placeholder">请选择目标节点</strong></div>' +
      '<label class="gaip-adjust-node-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5"></circle><path d="m16 16 4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg><input type="search" data-adjust-node-search aria-label="搜索目标节点" placeholder="搜索节点名称或路径"><button type="button" data-adjust-node-search-clear aria-label="清除目标节点搜索" hidden>×</button></label>' +
      '<div class="gaip-adjust-node-tree" role="tree" aria-label="当前渠道组织节点" data-adjust-node-tree></div><p class="gaip-adjust-node-error" data-adjust-node-error role="alert" hidden>请选择目标节点</p></section></div>' +
      '<footer class="gaip-adjust-node-footer"><button type="button" class="ant-btn gaip-adjust-button is-secondary" data-adjust-node-close>取消</button><button type="button" class="ant-btn gaip-adjust-button is-primary" data-adjust-node-confirm disabled>确认调整</button></footer>' +
      '<div class="gaip-adjust-confirm-layer" data-adjust-admin-warning hidden><div class="gaip-adjust-confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="gaip-adjust-warning-title"><div class="gaip-adjust-warning-icon" aria-hidden="true">!</div><div><h3 id="gaip-adjust-warning-title">确认调整管理员节点？</h3><p>该员工当前为【' + escapeHtml(currentPath) + '】节点管理员，调整节点后将取消其原节点管理员身份，且不会自动成为目标节点管理员，是否确认调整？</p></div><div class="gaip-adjust-warning-actions"><button type="button" class="ant-btn gaip-adjust-button is-secondary" data-adjust-warning-cancel>取消</button><button type="button" class="ant-btn gaip-adjust-button is-primary" data-adjust-warning-confirm>确认调整</button></div></div></div></div>';
    dialog.addEventListener('click', function (event) {
      var option = event.target.closest('[data-adjust-node-option]');
      if (option && !option.disabled) { adjustNodeState.targetDepartment = option.dataset.adjustNodeOption; renderAdjustNodeOptions(); return; }
      if (event.target.closest('[data-adjust-node-close]')) closeAdjustNodeDialog();
      else if (event.target.closest('[data-adjust-node-search-clear]')) {
        var input = dialog.querySelector('[data-adjust-node-search]'); input.value = ''; adjustNodeState.query = ''; event.target.closest('button').hidden = true; renderAdjustNodeOptions(); input.focus();
      } else if (event.target.closest('[data-adjust-node-confirm]')) {
        if (!adjustNodeState.targetDepartment) { dialog.querySelector('[data-adjust-node-error]').hidden = false; return; }
        if (member.admin) { dialog.querySelector('[data-adjust-admin-warning]').hidden = false; dialog.querySelector('[data-adjust-warning-cancel]').focus(); }
        else applyMemberNodeAdjustment();
      } else if (event.target.closest('[data-adjust-warning-cancel]')) {
        dialog.querySelector('[data-adjust-admin-warning]').hidden = true; dialog.querySelector('[data-adjust-node-confirm]').focus();
      } else if (event.target.closest('[data-adjust-warning-confirm]')) applyMemberNodeAdjustment();
    });
    dialog.addEventListener('input', function (event) {
      if (!event.target.matches('[data-adjust-node-search]')) return;
      adjustNodeState.query = event.target.value;
      dialog.querySelector('[data-adjust-node-search-clear]').hidden = !event.target.value;
      renderAdjustNodeOptions();
    });
    dialog.addEventListener('cancel', function (event) {
      event.preventDefault();
      var warning = dialog.querySelector('[data-adjust-admin-warning]');
      if (!warning.hidden) { warning.hidden = true; dialog.querySelector('[data-adjust-node-confirm]').focus(); }
      else closeAdjustNodeDialog();
    });
    dialog.addEventListener('close', function () {
      dialog.remove();
      if (adjustNodeDialog === dialog) adjustNodeDialog = null;
      adjustNodeState = null;
      if (adjustNodeTrigger && adjustNodeTrigger.isConnected) adjustNodeTrigger.focus();
      adjustNodeTrigger = null;
    }, { once: true });
    page.appendChild(dialog);
    renderAdjustNodeOptions();
    dialog.showModal();
    return dialog;
  }

  function bulkDepartmentPath(channelIndex, departmentId) {
    var set = departmentSets[channelIndex] || departmentSets[0], path = [], current = set.find(function (item) { return item.id === departmentId; }) || set[0];
    while (current) {
      path.unshift(current.name);
      current = set.find(function (item) { return item.id === current.parent; });
    }
    path[0] = channels[channelIndex];
    return path.join(' / ');
  }

  function bulkImportCollapsedMap() {
    var channelKey = String(bulkImportState.channel), set = departmentSets[bulkImportState.channel];
    if (!bulkImportState.collapsedByChannel[channelKey]) {
      var collapsedMap = {};
      set.forEach(function (item) {
        if (item.depth > 0 && set.some(function (candidate) { return candidate.parent === item.id; })) collapsedMap[item.id] = true;
      });
      var selected = set.find(function (item) { return item.id === bulkImportState.department; });
      while (selected && selected.parent) {
        delete collapsedMap[selected.parent];
        selected = set.find(function (item) { return item.id === selected.parent; });
      }
      bulkImportState.collapsedByChannel[channelKey] = collapsedMap;
    }
    return bulkImportState.collapsedByChannel[channelKey];
  }

  function bulkImportVisibleDepartments() {
    var set = departmentSets[bulkImportState.channel], query = bulkImportState.nodeQuery.trim().toLowerCase(), collapsedMap = bulkImportCollapsedMap();
    if (query) {
      var visibleIds = {};
      set.forEach(function (item) {
        var name = item.depth ? item.name : channels[bulkImportState.channel];
        if (name.toLowerCase().indexOf(query) === -1) return;
        var current = item;
        while (current) {
          visibleIds[current.id] = true;
          current = set.find(function (candidate) { return candidate.id === current.parent; });
        }
      });
      return set.filter(function (item) { return visibleIds[item.id]; });
    }
    return set.filter(function (item) {
      var parentId = item.parent;
      while (parentId) {
        if (collapsedMap[parentId]) return false;
        var parent = set.find(function (candidate) { return candidate.id === parentId; });
        parentId = parent && parent.parent;
      }
      return true;
    });
  }

  function bulkImportDepartmentTreeMarkup() {
    var set = departmentSets[bulkImportState.channel], collapsedMap = bulkImportCollapsedMap(), visible = bulkImportVisibleDepartments();
    if (!visible.length) return '<div class="gaip-bulk-node-empty">未找到匹配的目标节点</div>';
    return visible.map(function (item) {
      var name = item.depth ? item.name : channels[bulkImportState.channel];
      var hasChildren = set.some(function (candidate) { return candidate.parent === item.id; });
      var expanded = !collapsedMap[item.id] || !!bulkImportState.nodeQuery;
      return '<div class="gaip-bulk-node-row' + (item.id === bulkImportState.department ? ' is-selected' : '') + '" role="treeitem" aria-level="' + (item.depth + 1) + '" aria-selected="' + (item.id === bulkImportState.department) + '"' + (hasChildren ? ' aria-expanded="' + expanded + '"' : '') + ' style="--bulk-node-depth:' + item.depth + '">' +
        (hasChildren ? '<button type="button" class="gaip-bulk-node-toggle" data-bulk-node-toggle="' + escapeHtml(item.id) + '" aria-label="' + (expanded ? '收起' : '展开') + escapeHtml(name) + '" aria-expanded="' + expanded + '"><span aria-hidden="true"></span></button>' : '<span class="gaip-bulk-node-toggle-placeholder" aria-hidden="true"></span>') +
        '<button type="button" class="gaip-bulk-node-option" data-bulk-department-option="' + escapeHtml(item.id) + '" title="' + escapeHtml(name) + '"><span class="gaip-bulk-node-folder" aria-hidden="true"></span><span class="gaip-bulk-node-name">' + escapeHtml(name) + '</span><span class="gaip-bulk-node-check" aria-hidden="true">✓</span></button></div>';
    }).join('');
  }

  function updateBulkImportDepartmentTree() {
    if (!bulkImportDialog || bulkImportState.step !== 1) return;
    var tree = bulkImportDialog.querySelector('[data-bulk-node-tree]');
    if (tree) tree.innerHTML = bulkImportDepartmentTreeMarkup();
    var path = bulkImportDialog.querySelector('[data-bulk-path] strong');
    if (path) path.textContent = bulkDepartmentPath(bulkImportState.channel, bulkImportState.department);
    var clear = bulkImportDialog.querySelector('[data-bulk-search-clear]');
    if (clear) clear.hidden = !bulkImportState.nodeQuery;
  }

  function bulkImportMockRows() {
    return [
      { row: 2, enteredName: '批量示例成员01', account: 'bulk_demo_101', uaName: '批量示例成员01', regions: '香港、新加坡', referrer: '内部', admin: '是', valid: true, reason: '-' },
      { row: 3, enteredName: '批量示例成员02', account: 'bulk_demo_102', uaName: '批量示例成员02', regions: '美国', referrer: '无', admin: '否', valid: true, reason: '-' },
      { row: 4, enteredName: '已存在成员', account: 'demo_001', uaName: '示例成员01', regions: '大陆', referrer: '外部', admin: '否', valid: false, reason: '该成员已存在于当前渠道' },
      { row: 5, enteredName: '未知账号成员', account: 'not_found_001', uaName: '-', regions: '香港', referrer: '内部', admin: '否', valid: false, reason: '未查询到有效 UA 用户' },
      { row: 6, enteredName: '离职成员', account: 'former_001', uaName: '离职示例用户', regions: '新加坡', referrer: '无', admin: '否', valid: false, reason: '该账号已离职或处于停用状态' },
      { row: 7, enteredName: '地区填写错误', account: 'bulk_demo_107', uaName: '地区填写错误', regions: '英国', referrer: '无', admin: '否', valid: false, reason: '持牌地区必须按模板选项填写' },
      { row: 8, enteredName: '文件内重复成员', account: 'bulk_demo_101', uaName: '批量示例成员01', regions: '香港', referrer: '内部', admin: '否', valid: false, reason: '域账号在文件内重复' },
      { row: 9, enteredName: '-', account: '-', uaName: '-', regions: '-', referrer: '无', admin: '否', valid: false, reason: '域账号和用户姓名至少填写一项' },
      { row: 10, enteredName: '选项填写错误', account: 'bulk_demo_110', uaName: '选项填写错误', regions: '百慕大', referrer: '其他', admin: '管理员', valid: false, reason: '转介绍人或管理员选项不符合模板' },
      { row: 11, enteredName: '重复渠道成员', account: 'demo_002', uaName: '示例成员02', regions: '香港', referrer: '无', admin: '否', valid: false, reason: '该成员已存在于当前渠道' },
      { row: 12, enteredName: '无效账号示例', account: 'not_found_002', uaName: '-', regions: '美国', referrer: '内部', admin: '否', valid: false, reason: '未查询到有效 UA 用户' },
      { row: 13, enteredName: '停用账号示例', account: 'former_002', uaName: '停用示例用户', regions: '大陆', referrer: '无', admin: '否', valid: false, reason: '该账号已离职或处于停用状态' },
      { row: 14, enteredName: '地区格式错误', account: 'bulk_demo_114', uaName: '地区格式错误', regions: '中国香港', referrer: '无', admin: '否', valid: false, reason: '持牌地区必须按模板选项填写' },
      { row: 15, enteredName: '文件重复账号', account: 'bulk_demo_102', uaName: '批量示例成员02', regions: '美国', referrer: '无', admin: '否', valid: false, reason: '域账号在文件内重复' },
      { row: 16, enteredName: '-', account: '-', uaName: '-', regions: '-', referrer: '外部', admin: '否', valid: false, reason: '域账号和用户姓名至少填写一项' },
      { row: 17, enteredName: '管理员选项错误', account: 'bulk_demo_117', uaName: '管理员选项错误', regions: '新加坡', referrer: '内部', admin: '超级管理员', valid: false, reason: '转介绍人或管理员选项不符合模板' },
      { row: 18, enteredName: '转介绍选项错误', account: 'bulk_demo_118', uaName: '转介绍选项错误', regions: '百慕大', referrer: '推荐', admin: '否', valid: false, reason: '转介绍人或管理员选项不符合模板' },
      { row: 19, enteredName: '空白域账号示例', account: '-', uaName: '-', regions: '香港', referrer: '无', admin: '否', valid: false, reason: '未查询到有效 UA 用户' }
    ];
  }

  function bulkImportAssetUrl(fileName) {
    var script = document.querySelector('script[src*="features/config-center/config-center.js"]');
    return script ? new URL('./assets/' + fileName, script.src).href : './features/config-center/assets/' + fileName;
  }

  function bulkImportTemplateUrl() {
    return bulkImportAssetUrl('批量人员导入模板.xlsx');
  }

  function bulkImportIcon(kind) {
    if (kind === 'success') return '<span class="gaip-bulk-check" aria-hidden="true">✓</span>';
    if (kind === 'partial') return '<svg class="gaip-bulk-warning" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 6.75v6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1.15" fill="currentColor"/></svg>';
    var template = document.createElement('template');
    template.innerHTML = sourceMarkup(source.toolbar);
    var icon = template.content.querySelector('[data-config-export] .ant-btn-icon svg').cloneNode(true);
    icon.removeAttribute('width'); icon.removeAttribute('height'); icon.setAttribute('aria-hidden', 'true');
    return icon.outerHTML;
  }

  function bulkImportSearchIcon(kind) {
    var template = document.createElement('template');
    template.innerHTML = sourceMarkup(source.toolbar);
    var selector = kind === 'clear' ? '.ant-input-clear-icon svg' : '.searchIcon___p0zF2';
    var icon = template.content.querySelector(selector).cloneNode(true);
    var title = icon.querySelector('title');
    if (title) title.remove();
    icon.removeAttribute('width'); icon.removeAttribute('height'); icon.setAttribute('aria-hidden', 'true');
    return icon.outerHTML;
  }

  function bulkImportAttachmentIcon() {
    return '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5.2 8.8 9.7 4.3a2.15 2.15 0 0 1 3.05 3.05L7.3 12.8a3.3 3.3 0 0 1-4.67-4.67l5.4-5.4" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function bulkImportSummary(label, value, tone) {
    return '<div class="gaip-bulk-summary is-' + tone + '"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(value) + '</strong></div>';
  }

  function renderBulkImportStep() {
    if (!bulkImportDialog || !bulkImportState) return;
    var body = bulkImportDialog.querySelector('[data-bulk-body]'), footer = bulkImportDialog.querySelector('[data-bulk-footer]');
    var resultPreviewControl = bulkImportDialog.querySelector('[data-bulk-result-preview-control]');
    bulkImportDialog.querySelectorAll('[data-bulk-step]').forEach(function (step) {
      var number = Number(step.dataset.bulkStep), active = number === bulkImportState.step, complete = number < bulkImportState.step;
      step.classList.toggle('is-active', active); step.classList.toggle('is-complete', complete);
      step.setAttribute('aria-current', active ? 'step' : 'false');
    });
    body.classList.toggle('is-validation-step', bulkImportState.step === 2);
    body.classList.toggle('is-result-step', bulkImportState.step === 3);
    footer.classList.toggle('is-result-step', bulkImportState.step === 3);
    resultPreviewControl.hidden = bulkImportState.step !== 3;
    resultPreviewControl.querySelectorAll('[data-bulk-result-preview]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.bulkResultPreview === bulkImportState.resultPreview));
    });
    if (bulkImportState.step === 1) {
      var channelOptions = channels.map(function (name, index) {
        return '<option value="' + index + '"' + (index === bulkImportState.channel ? ' selected' : '') + '>' + escapeHtml(name) + '</option>';
      }).join('');
      body.innerHTML = '<section class="gaip-bulk-section gaip-bulk-location-section" aria-labelledby="bulk-target-title"><div class="gaip-bulk-section-heading gaip-bulk-target-heading"><h3 id="bulk-target-title">选择导入范围</h3><div class="gaip-bulk-current-target" data-bulk-path><span>当前目标：</span><strong>' + escapeHtml(bulkDepartmentPath(bulkImportState.channel, bulkImportState.department)) + '</strong></div></div><div class="gaip-bulk-field-label">渠道</div><label class="gaip-bulk-channel-select"><select aria-label="导入渠道" data-bulk-channel-select>' + channelOptions + '</select><span class="gaip-bulk-select-arrow" aria-hidden="true"></span></label><div class="gaip-bulk-node-heading"><span class="gaip-bulk-field-label">目标节点</span><label class="gaip-bulk-node-search">' + bulkImportSearchIcon('search') + '<input type="search" value="' + escapeHtml(bulkImportState.nodeQuery) + '" placeholder="搜索目标节点" aria-label="搜索目标节点" data-bulk-node-search><button type="button" data-bulk-search-clear aria-label="清除节点搜索"' + (bulkImportState.nodeQuery ? '' : ' hidden') + '>' + bulkImportSearchIcon('clear') + '</button></label></div><div class="gaip-bulk-node-tree" role="tree" aria-label="目标节点" data-bulk-node-tree>' + bulkImportDepartmentTreeMarkup() + '</div></section>' +
        '<section class="gaip-bulk-section gaip-bulk-upload-section" aria-labelledby="bulk-file-title"><div class="gaip-bulk-section-heading gaip-bulk-upload-heading"><h3 id="bulk-file-title">上传识别导入</h3><button type="button" class="gaip-bulk-sample" data-bulk-sample>使用示例文件预览完整流程</button></div><div class="gaip-bulk-upload-content"><div class="gaip-bulk-upload-picker"><label class="gaip-bulk-upload-button" data-bulk-dropzone aria-label="上传 Excel 文件"><input type="file" accept=".xlsx,.xls" data-bulk-file><span class="gaip-bulk-upload-icon"><img src="' + escapeHtml(bulkImportAssetUrl('bulk-import-upload.svg')) + '" alt="" aria-hidden="true"></span><span>上传文件</span></label><span class="gaip-bulk-upload-limit">文件大小不得超过10MB，支持 .xlsx、.xls</span></div>' + (bulkImportState.fileName ? '<div class="gaip-bulk-upload-file" data-bulk-upload-file><span class="gaip-bulk-attachment-icon">' + bulkImportAttachmentIcon() + '</span><span>' + escapeHtml(bulkImportState.fileName) + '</span></div>' : '') + '<div class="gaip-bulk-file-error" data-bulk-file-error' + (bulkImportState.fileError ? '' : ' hidden') + '>' + escapeHtml(bulkImportState.fileError || '') + '</div></div><div class="gaip-bulk-template-bar"><a class="gaip-bulk-template-link" href="' + escapeHtml(bulkImportTemplateUrl()) + '" download="批量人员导入模板.xlsx"><span class="gaip-bulk-template-icon"><img src="' + escapeHtml(bulkImportAssetUrl('bulk-import-template-xlsx.svg')) + '" alt="" aria-hidden="true"></span><span class="gaip-bulk-template-copy"><strong>下载导入模板</strong><small>请勿修改表头；单次最多导入 100 人</small></span></a></div></section>';
      footer.innerHTML = '<button type="button" class="ant-btn gaip-bulk-button is-secondary" data-bulk-close>取消</button><button type="button" class="ant-btn gaip-bulk-button is-primary" data-bulk-validate' + (bulkImportState.fileName ? '' : ' disabled') + '>开始校验</button>';
    } else if (bulkImportState.step === 2) {
      var validCount = bulkImportState.rows.filter(function (item) { return item.valid; }).length;
      var invalidCount = bulkImportState.rows.length - validCount;
      var rows = bulkImportState.rows.map(function (item) {
        return '<tr class="' + (item.valid ? 'is-valid' : 'is-invalid') + '"><td>' + item.row + '</td><td>' + escapeHtml(item.enteredName) + '</td><td>' + escapeHtml(item.account) + '</td><td>' + escapeHtml(item.uaName) + '</td><td>' + escapeHtml(item.regions) + '</td><td>' + escapeHtml(item.referrer) + '</td><td>' + escapeHtml(item.admin) + '</td><td><span class="gaip-bulk-status">' + (item.valid ? bulkImportIcon('success') + '可导入' : '校验失败') + '</span></td><td class="gaip-bulk-reason">' + escapeHtml(item.reason) + '</td></tr>';
      }).join('');
      body.innerHTML = '<div class="gaip-bulk-validation-bar"><div class="gaip-bulk-validation-target"><span>目标节点</span><strong>' + escapeHtml(bulkDepartmentPath(bulkImportState.channel, bulkImportState.department)) + '</strong></div><div class="gaip-bulk-validation-meta"><span>共 ' + bulkImportState.rows.length + ' 人</span><span class="is-success">可导入 ' + validCount + ' 人</span><span class="is-error">失败 ' + invalidCount + ' 人</span><span class="gaip-bulk-validation-note">失败行不影响其余成员导入，可下载失败明细后修正</span></div></div><div class="gaip-bulk-table-wrap"><table class="gaip-bulk-table"><thead><tr><th>Excel 行</th><th>用户姓名 / 备注</th><th>域账号</th><th>UA 姓名</th><th>持牌地区</th><th>转介绍人</th><th>管理员</th><th>校验状态</th><th>失败原因</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
      footer.innerHTML = '<button type="button" class="ant-btn gaip-bulk-button is-secondary" data-bulk-back>上一步</button><button type="button" class="ant-btn gaip-bulk-button gaip-bulk-footer-download is-secondary" data-bulk-download-fail><span class="ant-btn-icon gaip-bulk-result-action-icon">' + bulkImportIcon('download') + '</span><span>下载失败明细</span></button><button type="button" class="ant-btn gaip-bulk-button gaip-bulk-confirm-button is-primary" data-bulk-confirm aria-label="确认导入 ' + validCount + ' 名成员"><span>确认导入</span><span class="gaip-bulk-button-count" aria-hidden="true">' + validCount + '人</span></button>';
    } else {
      var isAllSuccessPreview = bulkImportState.resultPreview === 'success';
      var importedCount = isAllSuccessPreview ? bulkImportState.rows.length : bulkImportState.rows.filter(function (item) { return item.valid; }).length;
      var failedCount = bulkImportState.rows.length - importedCount;
      var resultActions = '<div class="gaip-bulk-result-actions">' + (failedCount ? '<button type="button" class="ant-btn gaip-bulk-button is-primary" data-bulk-download-fail><span class="ant-btn-icon gaip-bulk-result-action-icon">' + bulkImportIcon('download') + '</span><span>下载失败明细</span></button>' : '') + '<button type="button" class="ant-btn gaip-bulk-button is-link" data-bulk-again>继续导入</button></div>';
      var resultSummary = bulkImportSummary('文件总数', bulkImportState.rows.length + ' 人', 'neutral') + bulkImportSummary('成功导入', importedCount + ' 人', 'success') + (failedCount ? bulkImportSummary('导入失败', failedCount + ' 人', 'error') : '');
      var resultCopy = isAllSuccessPreview ? '全部成员已成功导入。' : '有效成员已导入，失败记录未写入成员列表。';
      var resultNote = isAllSuccessPreview ? '全部成员均已生成“新增成员”组织架构操作记录，可继续发起下一次导入。' : '成功成员会分别生成“新增成员”组织架构操作记录。下载失败明细并修正后，可继续发起下一次导入。';
      body.innerHTML = '<div class="gaip-bulk-result"><span class="gaip-bulk-result-icon ' + (isAllSuccessPreview ? 'is-success' : 'is-partial') + '">' + bulkImportIcon(isAllSuccessPreview ? 'success' : 'partial') + '</span><h3>' + (isAllSuccessPreview ? '批量导入已完成' : '导入完成，部分失败') + '</h3><p>' + resultCopy + '</p>' + resultActions + '<section class="gaip-bulk-result-card" aria-label="导入结果详情"><div class="gaip-bulk-result-target"><span>导入节点</span><strong>' + escapeHtml(bulkDepartmentPath(bulkImportState.channel, bulkImportState.department)) + '</strong></div><div class="gaip-bulk-summary-grid' + (failedCount ? '' : ' is-success-only') + '">' + resultSummary + '</div><div class="gaip-bulk-result-note">' + resultNote + '</div></section></div>';
      footer.innerHTML = '';
    }
  }

  function showBulkImportReturnConfirm() {
    if (!bulkImportDialog || bulkImportDialog.querySelector('[data-bulk-confirm-layer]')) return;
    var layer = document.createElement('div');
    layer.className = 'gaip-bulk-confirm-layer'; layer.setAttribute('data-bulk-confirm-layer', '');
    layer.innerHTML = '<div class="gaip-bulk-confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="bulk-return-title"><h3 id="bulk-return-title">返回重新选择？</h3><p>返回后当前文件和校验结果将被清空，需要重新上传。</p><div><button type="button" class="ant-btn gaip-bulk-button is-secondary" data-bulk-return-cancel>取消</button><button type="button" class="ant-btn gaip-bulk-button is-primary" data-bulk-return-confirm>确认返回</button></div></div>';
    bulkImportDialog.querySelector('.ant-modal-content').appendChild(layer);
    layer.querySelector('[data-bulk-return-cancel]').focus();
  }

  function resetBulkImportState() {
    bulkImportState = { step: 1, channel: state.channel, department: state.department, nodeQuery: '', collapsedByChannel: {}, fileName: '', fileError: '', rows: bulkImportMockRows(), imported: false, resultPreview: 'partial' };
  }

  function setBulkImportFile(file) {
    if (!file) return;
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      bulkImportState.fileName = '';
      bulkImportState.fileError = '请上传 .xlsx 或 .xls 格式文件';
    } else if (file.size > 10 * 1024 * 1024) {
      bulkImportState.fileName = '';
      bulkImportState.fileError = '文件大小不能超过 10MB';
    } else {
      bulkImportState.fileName = file.name;
      bulkImportState.fileError = '';
    }
    renderBulkImportStep();
  }

  function bulkImportDragHasFiles(event) {
    var transfer = event.dataTransfer;
    if (!transfer) return false;
    if (transfer.files && transfer.files.length) return true;
    var types = transfer.types;
    if (!types || !types.length) return false;
    return Array.prototype.some.call(types, function (type) { return type === 'Files'; });
  }

  function addBulkImportMembers() {
    if (bulkImportState.imported) return;
    var importedAt = '2026-09-02 19:30:00';
    bulkImportState.rows.filter(function (row) { return row.valid; }).forEach(function (item, index) {
      var recordId = Math.max.apply(null, [0].concat(members.map(function (member) { return member.id; }))) + 1;
      members.push({ id: recordId, name: item.uaName, account: item.account, channel: bulkImportState.channel, department: bulkImportState.department, html: source.rows[2], phone: '****' + String(2101 + index), email: '', admin: item.admin === '是', licensed: item.regions !== '-', regions: item.regions === '-' ? [] : item.regions.split('、'), referrer: item.referrer === '内部' ? 1 : item.referrer === '外部' ? 2 : 0 });
      organizationLogRecords.unshift({
        id: 'bulk-import-' + item.account, createdDt: importedAt, operatorName: '本地预览用户', createdBy: 'demo_admin',
        operateType: '新增成员', channelTab: channels[bulkImportState.channel], nodeSource: bulkDepartmentPath(bulkImportState.channel, bulkImportState.department).replace(/ \/ /g, '/'),
        operatorSource: '批量导入', updateBefore: '-', updateAfter: '成员：' + item.uaName + '（' + item.account + '）'
      });
    });
    bulkImportState.imported = true;
    if (bulkImportState.channel === state.channel && bulkImportState.department === state.department && mountedView === 'organization') renderMembers();
  }

  function downloadBulkImportFailures() {
    var rows = [['Excel 行', '用户姓名 / 备注', '域账号', '失败原因']].concat(bulkImportState.rows.filter(function (row) { return !row.valid; }).map(function (row) { return [row.row, row.enteredName, row.account, row.reason]; }));
    var content = rows.map(function (row) { return row.map(function (cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join('\t'); }).join('\n');
    var link = document.createElement('a'), url = URL.createObjectURL(new Blob(['\ufeff' + content], { type: 'application/vnd.ms-excel;charset=utf-8' }));
    link.href = url; link.download = '批量导入失败明细.xls'; link.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
  }

  function openBulkImportDialog(trigger) {
    closeBulkImportDialog();
    bulkImportTrigger = trigger || document.activeElement;
    resetBulkImportState();
    var dialog = document.createElement('dialog'); bulkImportDialog = dialog;
    dialog.className = 'ant-modal css-10wz6x1 gaip-bulk-import-dialog';
    dialog.setAttribute('aria-label', '批量导入成员');
    dialog.innerHTML = '<div class="ant-modal-content"><header class="gaip-bulk-modal-header"><h2>批量导入成员</h2><button type="button" class="gaip-bulk-close" data-bulk-close aria-label="关闭批量导入成员"><span aria-hidden="true">×</span></button></header><ol class="gaip-bulk-steps" aria-label="批量导入进度"><li data-bulk-step="1"><span>1</span><strong>选择导入范围</strong></li><li data-bulk-step="2"><span>2</span><strong>校验并确认</strong></li><li data-bulk-step="3"><span>3</span><strong>导入结果</strong></li></ol><div class="gaip-bulk-modal-body" data-bulk-body></div><footer class="gaip-bulk-modal-footer" data-bulk-footer></footer><div class="gaip-bulk-drop-overlay" data-bulk-drop-overlay role="status" aria-live="polite" aria-hidden="true"><div class="gaip-bulk-drop-message"><span class="gaip-bulk-drop-icon" aria-hidden="true"><img src="' + escapeHtml(bulkImportAssetUrl('bulk-import-upload.svg')) + '" alt=""></span><strong>松开以上传并识别文件</strong><small>支持 .xlsx、.xls，单个文件不超过 10MB</small></div></div></div><div class="gaip-bulk-result-preview" data-bulk-result-preview-control hidden><span>结果预览</span><div role="group" aria-label="切换导入结果预览"><button type="button" data-bulk-result-preview="partial" aria-pressed="true">部分失败</button><button type="button" data-bulk-result-preview="success" aria-pressed="false">全部成功</button></div></div>';
    var bulkDragDepth = 0;
    function clearBulkImportDragState() {
      bulkDragDepth = 0;
      dialog.classList.remove('is-dragging-file');
      var overlay = dialog.querySelector('[data-bulk-drop-overlay]');
      if (overlay) overlay.setAttribute('aria-hidden', 'true');
    }
    function showBulkImportDragState() {
      dialog.classList.add('is-dragging-file');
      var overlay = dialog.querySelector('[data-bulk-drop-overlay]');
      if (overlay) overlay.setAttribute('aria-hidden', 'false');
    }
    dialog.addEventListener('click', function (event) {
      var target = event.target.closest('[data-bulk-close],[data-bulk-sample],[data-bulk-validate],[data-bulk-back],[data-bulk-download-fail],[data-bulk-confirm],[data-bulk-again],[data-bulk-result-preview],[data-bulk-return-cancel],[data-bulk-return-confirm],[data-bulk-department-option],[data-bulk-node-toggle],[data-bulk-search-clear]');
      if (!target) return;
      if (target.hasAttribute('data-bulk-close')) closeBulkImportDialog();
      else if (target.hasAttribute('data-bulk-sample')) { bulkImportState.fileName = '组织成员批量导入示例.xlsx'; bulkImportState.fileError = ''; renderBulkImportStep(); }
      else if (target.hasAttribute('data-bulk-validate') && !target.disabled) { bulkImportState.step = 2; renderBulkImportStep(); }
      else if (target.hasAttribute('data-bulk-back')) showBulkImportReturnConfirm();
      else if (target.hasAttribute('data-bulk-return-cancel')) target.closest('[data-bulk-confirm-layer]').remove();
      else if (target.hasAttribute('data-bulk-return-confirm')) { target.closest('[data-bulk-confirm-layer]').remove(); resetBulkImportState(); renderBulkImportStep(); }
      else if (target.hasAttribute('data-bulk-download-fail')) downloadBulkImportFailures();
      else if (target.hasAttribute('data-bulk-confirm')) { addBulkImportMembers(); bulkImportState.step = 3; renderBulkImportStep(); }
      else if (target.hasAttribute('data-bulk-again')) { resetBulkImportState(); renderBulkImportStep(); }
      else if (target.hasAttribute('data-bulk-result-preview')) { bulkImportState.resultPreview = target.dataset.bulkResultPreview; renderBulkImportStep(); }
      else if (target.hasAttribute('data-bulk-department-option')) { bulkImportState.department = target.dataset.bulkDepartmentOption; updateBulkImportDepartmentTree(); }
      else if (target.hasAttribute('data-bulk-node-toggle')) {
        var collapsedMap = bulkImportCollapsedMap(), nodeId = target.dataset.bulkNodeToggle;
        collapsedMap[nodeId] = !collapsedMap[nodeId]; updateBulkImportDepartmentTree();
      }
      else if (target.hasAttribute('data-bulk-search-clear')) {
        bulkImportState.nodeQuery = '';
        var searchInput = bulkImportDialog.querySelector('[data-bulk-node-search]');
        if (searchInput) { searchInput.value = ''; searchInput.focus(); }
        updateBulkImportDepartmentTree();
      }
    });
    dialog.addEventListener('change', function (event) {
      if (event.target.matches('[data-bulk-channel-select]')) {
        var nextChannel = Number(event.target.value);
        if (nextChannel !== bulkImportState.channel) {
          bulkImportState.channel = nextChannel; bulkImportState.department = 'all'; bulkImportState.nodeQuery = '';
          renderBulkImportStep();
        }
      } else if (event.target.matches('[data-bulk-file]')) {
        var file = event.target.files && event.target.files[0];
        setBulkImportFile(file);
      }
    });
    dialog.addEventListener('input', function (event) {
      if (!event.target.matches('[data-bulk-node-search]')) return;
      bulkImportState.nodeQuery = event.target.value;
      updateBulkImportDepartmentTree();
    });
    dialog.addEventListener('dragenter', function (event) {
      if (bulkImportState.step !== 1 || !bulkImportDragHasFiles(event)) return;
      event.preventDefault();
      bulkDragDepth += 1;
      showBulkImportDragState();
    });
    dialog.addEventListener('dragover', function (event) {
      if (bulkImportState.step !== 1 || !bulkImportDragHasFiles(event)) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
      showBulkImportDragState();
    });
    dialog.addEventListener('dragleave', function (event) {
      if (bulkImportState.step !== 1 || !bulkImportDragHasFiles(event)) return;
      event.preventDefault();
      bulkDragDepth = Math.max(0, bulkDragDepth - 1);
      if (!bulkDragDepth) clearBulkImportDragState();
    });
    dialog.addEventListener('drop', function (event) {
      if (bulkImportState.step !== 1 || !bulkImportDragHasFiles(event)) return;
      event.preventDefault();
      clearBulkImportDragState();
      var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      setBulkImportFile(file);
    });
    dialog.addEventListener('dragend', clearBulkImportDragState);
    dialog.addEventListener('cancel', function (event) { event.preventDefault(); closeBulkImportDialog(); });
    dialog.addEventListener('close', function () {
      dialog.remove(); if (bulkImportDialog === dialog) bulkImportDialog = null;
      bulkImportState = null;
      if (bulkImportTrigger && bulkImportTrigger.isConnected) bulkImportTrigger.focus();
      bulkImportTrigger = null;
    }, { once: true });
    page.appendChild(dialog); renderBulkImportStep(); dialog.showModal();
    return dialog;
  }
  /* @gaip-modal
  {
    "id": "config-organization-log",
    "title": "组织架构操作日志",
    "channel": "配置中心 / 组织架构",
    "type": "modal",
    "status": "ready",
    "height": 900,
    "after": "config-admin",
    "source": "window.__GAIP_CONFIG_DIALOGS__.openOrganizationLog()",
    "previewMode": "config-dialog",
    "invoke": { "path": "__GAIP_CONFIG_DIALOGS__.openOrganizationLog", "args": [] },
    "styles": [
      "web/umi.c6286171.css",
      "shared/styles/global-font.css",
      "features/config-center/ant-source.css",
      "features/config-center/config-center-content.css",
      "features/config-center/config-center.css"
    ],
    "scripts": [
      "shared/config/channels.js?v=20260903-51",
      "features/config-center/source-markup.js?v=20260902-1",
      "features/config-center/config-center.js?v=20260903-38"
    ]
  }
  */
  /* @gaip-modal
  {
    "id": "config-bulk-import-members",
    "title": "批量导入成员",
    "channel": "配置中心 / 组织架构",
    "type": "modal",
    "status": "ready",
    "height": 900,
    "after": "config-organization-log",
    "source": "window.__GAIP_CONFIG_DIALOGS__.openBulkImport()",
    "previewMode": "config-dialog",
    "invoke": { "path": "__GAIP_CONFIG_DIALOGS__.openBulkImport", "args": [] },
    "styles": [
      "web/umi.c6286171.css",
      "shared/styles/global-font.css",
      "features/config-center/ant-source.css",
      "features/config-center/config-center-content.css",
      "features/config-center/config-center.css"
    ],
    "scripts": [
      "shared/config/channels.js?v=20260903-51",
      "features/config-center/source-markup.js?v=20260902-1",
      "features/config-center/config-center.js?v=20260903-38"
    ]
  }
  */
  /* @gaip-modal
  {
    "id": "config-adjust-member-node",
    "title": "调整节点",
    "channel": "配置中心 / 组织架构",
    "type": "modal",
    "status": "ready",
    "height": 780,
    "after": "config-bulk-import-members",
    "source": "window.__GAIP_CONFIG_DIALOGS__.openAdjustNode(1)",
    "previewMode": "config-dialog",
    "invoke": { "path": "__GAIP_CONFIG_DIALOGS__.openAdjustNode", "args": [1] },
    "styles": [
      "web/umi.c6286171.css",
      "shared/styles/global-font.css",
      "features/config-center/ant-source.css",
      "features/config-center/config-center-content.css",
      "features/config-center/config-center.css"
    ],
    "scripts": [
      "shared/config/channels.js?v=20260903-51",
      "features/config-center/source-markup.js?v=20260902-1",
      "features/config-center/config-center.js?v=20260903-38"
    ]
  }
  */
  function openOrganizationOperationLog(trigger) {
    closeOrganizationOperationLog();
    organizationLogTrigger = trigger || document.activeElement;
    var dialog = document.createElement('dialog');
    organizationLogDialog = dialog;
    dialog.className = 'ant-modal css-10wz6x1 operateLogModal___ea4sh gaip-organization-log-dialog';
    dialog.setAttribute('aria-label', '组织架构操作日志');
    dialog.innerHTML = '<div class="ant-modal-content"><div class="ant-modal-body"><header class="modalHeader___Wsw0V"><h2 class="modalTitle___VpG1S">操作日志</h2><button type="button" class="closeIcon___zxceU" data-organization-log-close aria-label="关闭操作日志"><span role="img" aria-hidden="true" class="anticon anticon-close"><svg viewBox="64 64 896 896" focusable="false" width="1em" height="1em" fill="currentColor"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7a16 16 0 0 0-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1a16 16 0 0 0 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg></span></button></header><div class="modalBody___wVPfn"><div class="ant-table-wrapper logTable___m61B9"><div class="ant-table ant-table-fixed-header"><div class="ant-table-container"><div class="ant-table-content"><table style="min-width:960px"><thead class="ant-table-thead"><tr><th class="ant-table-cell" style="width:120px">时间</th><th class="ant-table-cell" style="width:120px">操作人</th><th class="ant-table-cell" style="width:120px">操作类型</th><th class="ant-table-cell" style="width:130px">渠道</th><th class="ant-table-cell">节点路径</th><th class="ant-table-cell" style="width:96px">来源</th><th class="ant-table-cell">变更前 / 变更后</th></tr></thead><tbody class="ant-table-tbody"></tbody></table></div></div></div></div><div class="paginationWrap___GPhUS"><button type="button" class="pageArrow___j26JA" data-organization-log-prev aria-label="上一页">‹</button><span class="pageInput___CXjOu"><input type="number" min="1" class="pageInputInner___qJqBD" data-organization-log-page aria-label="当前页"></span><span class="pageSeparator___XiRN6">/</span><span class="pageTotal___CJfoR" data-organization-log-pages></span><button type="button" class="pageArrow___j26JA" data-organization-log-next aria-label="下一页">›</button></div></div></div></div>';
    var organizationLogTable = dialog.querySelector('table');
    var organizationLogColumns = document.createElement('colgroup');
    organizationLogColumns.innerHTML = '<col style="width:150px"><col style="width:120px"><col style="width:112px"><col style="width:128px"><col style="width:220px"><col style="width:96px"><col style="width:280px">';
    organizationLogTable.style.minWidth = '1106px';
    organizationLogTable.prepend(organizationLogColumns);
    dialog.addEventListener('click', function (event) {
      if (event.target.closest('[data-organization-log-close]')) closeOrganizationOperationLog();
      else if (event.target.closest('[data-organization-log-prev]')) renderOrganizationOperationLog(Number(dialog.dataset.currentPage) - 1);
      else if (event.target.closest('[data-organization-log-next]')) renderOrganizationOperationLog(Number(dialog.dataset.currentPage) + 1);
    });
    dialog.addEventListener('change', function (event) {
      if (event.target.matches('[data-organization-log-page]')) renderOrganizationOperationLog(event.target.value);
    });
    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && event.target.matches('[data-organization-log-page]')) { event.preventDefault(); renderOrganizationOperationLog(event.target.value); }
    });
    dialog.addEventListener('cancel', function (event) { event.preventDefault(); closeOrganizationOperationLog(); });
    dialog.addEventListener('close', function () {
      dialog.remove();
      if (organizationLogDialog === dialog) organizationLogDialog = null;
      if (organizationLogTrigger && organizationLogTrigger.isConnected) organizationLogTrigger.focus();
      organizationLogTrigger = null;
    }, { once: true });
    page.appendChild(dialog);
    renderOrganizationOperationLog(1);
    dialog.showModal();
  }
  function adminRoleKey(id) { return state.channel + ':' + id; }
  function adminRoleState(id, currentMembers) {
    var key = adminRoleKey(id), validIds = currentMembers.map(function (member) { return member.id; });
    if (!adminRoleAssignments[key]) adminRoleAssignments[key] = { commission: null, clueAdmin: [], clueFollower: [] };
    var roles = adminRoleAssignments[key];
    if (!validIds.includes(roles.commission)) roles.commission = null;
    roles.clueAdmin = roles.clueAdmin.filter(function (memberId) { return validIds.includes(memberId); });
    roles.clueFollower = roles.clueFollower.filter(function (memberId) { return validIds.includes(memberId) && !roles.clueAdmin.includes(memberId); });
    return roles;
  }
  function canConfigureAdminRole(role) {
    if (currentOperatorRole === 'super-admin') return true;
    if (currentOperatorRole === 'organization-admin') return role === 'organization' || role === 'commission';
    return currentOperatorRole === 'clue-admin' && role === 'clue-follower';
  }
  function memberIdentityRoles(member) {
    var departmentMembers = members.filter(function (item) {
      return item.channel === member.channel && item.department === member.department;
    });
    var roles = adminRoleState(member.department, departmentMembers);
    var identities = [];
    if (member.admin) identities.push({ key: 'organization', label: '人管' });
    if (roles.commission === member.id) identities.push({ key: 'commission', label: '佣金' });
    if (roles.clueAdmin.includes(member.id)) identities.push({ key: 'clue-admin', label: '线索管理' });
    if (roles.clueFollower.includes(member.id)) identities.push({ key: 'clue-follower', label: '线索跟进' });
    return identities;
  }
  function createMemberIdentityCell(member) {
    var cell = document.createElement('td');
    cell.className = 'ant-table-cell memberIdentityCell___u7N4q';
    var identities = memberIdentityRoles(member);
    if (!identities.length) {
      cell.classList.add('is-empty');
      cell.textContent = '-';
      return cell;
    }
    var tags = document.createElement('div');
    tags.className = 'memberIdentityTags___f8Q2m';
    identities.forEach(function (identity) {
      var tag = document.createElement('span');
      tag.className = 'memberIdentityTag___v3J6p is-' + identity.key;
      tag.textContent = identity.label;
      tags.appendChild(tag);
    });
    cell.appendChild(tags);
    return cell;
  }
  function departmentPath(department) {
    var path = [], current = department;
    while (current) {
      path.unshift(current.name);
      current = departments.find(function (item) { return item.id === current.parent; });
    }
    return path.join(' / ');
  }
  function isDepartmentCollapsed(department) {
    var key = state.channel + ':' + department.id;
    return Object.prototype.hasOwnProperty.call(collapsed, key) ? collapsed[key] : department.depth > 0;
  }
  function params() { return new URLSearchParams((location.hash || '').split('?')[1] || ''); }
  function requested() { return params().get('gaip-channel') === config.key; }
  function view() { var key = params().get('gaip-view'); return views.some(function (v) { return v.key === key; }) ? key : views[0].key; }
  function hash(key) { return '#' + config.route + '?' + config.query + '&gaip-view=' + key; }
  function bounds() {
    if (!page) return;
    var header = document.querySelector('[data-gaip-region="app-header"], [class*="header___tcVAl"]');
    var sidebar = document.querySelector('.ant-layout-sider');
    page.style.top = (header ? header.getBoundingClientRect().bottom : 56) + 'px';
    page.style.left = (sidebar ? sidebar.getBoundingClientRect().right : 208) + 'px';
  }
  function restoreUnderlyingContent() {
    hiddenContent.forEach(function (record) {
      if (!record.element) return;
      record.element.inert = record.inert;
      if (record.hadAriaHidden) record.element.setAttribute('aria-hidden', record.ariaHidden);
      else record.element.removeAttribute('aria-hidden');
    });
    hiddenContent = [];
    contentHost = null;
  }
  function preserveGlobalEntry(element) {
    return element.matches('[class*="globalButton___"], [data-gaip-region="ai-assistant-entry"]');
  }
  function mountIntoContent(main) {
    if (!main) return;
    if (contentHost && contentHost !== main) restoreUnderlyingContent();
    contentHost = main;
    if (page.parentElement !== main) main.appendChild(page);
    Array.from(main.children).forEach(function (element) {
      if (element === page || preserveGlobalEntry(element) || hiddenContent.some(function (record) { return record.element === element; })) return;
      hiddenContent.push({
        element: element,
        inert: !!element.inert,
        hadAriaHidden: element.hasAttribute('aria-hidden'),
        ariaHidden: element.getAttribute('aria-hidden')
      });
      element.inert = true;
      element.setAttribute('aria-hidden', 'true');
    });
  }
  function closeForNavigation() {
    if (!page) return;
    closeDepartmentMenu();
    closeOrganizationOperationLog();
    closeBulkImportDialog();
    closeAdjustNodeDialog();
    clearTimeout(configToastTimer);
    if (logPanel) { logPanel.destroy(); logPanel = null; }
    page.remove(); page = null; mountedView = null;
    restoreUnderlyingContent();
    document.documentElement.classList.remove('gaip-config-open');
    if (oldTitle) { document.title = oldTitle; oldTitle = ''; }
    if (document.body.getAttribute('data-gaip-page') === config.key) {
      document.body.removeAttribute('data-gaip-page');
      document.body.removeAttribute('data-gaip-page-label');
    }
    if (window.__GAIP_BREADCRUMB__) window.__GAIP_BREADCRUMB__.clearDetail(config.key);
  }
  function open(key) {
    var apis = window.__GAIP_VIRTUAL_CHANNELS__ || {};
    Object.keys(apis).forEach(function (name) { if (name !== config.key && apis[name].isOpen()) apis[name].closeForNavigation('/workspace'); });
    if (window.__GAIP_LEARNING_CENTER__ && window.__GAIP_LEARNING_CENTER__.isOpen()) window.__GAIP_LEARNING_CENTER__.closeForNavigation('/workspace');
    window.__GAIP_PAGE_OVERRIDE__ = '';
    menuOpen = true;
    if (location.hash !== hash(key)) location.hash = hash(key);
    schedule();
  }
  function decorateExpandableMenu(group) {
    var toggle = group.querySelector('.gaip-config-toggle');
    var title = toggle.querySelector('.ant-pro-base-menu-inline-item-title');
    var icon = toggle.querySelector('.ant-pro-base-menu-inline-item-icon');
    var originalIcon = icon.querySelector('.gaip-config-original-icon');
    var label = toggle.querySelector('.ant-pro-base-menu-inline-item-text');
    var caret = toggle.querySelector('.ant-menu-submenu-arrow');
    var submenu = group.querySelector('.ant-menu-sub');
    group.classList.add('gaip-main-menu-group');
    toggle.classList.add('gaip-main-menu-parent');
    toggle.setAttribute('data-gaip-main-menu-toggle', '');
    title.classList.add('gaip-main-menu-title');
    icon.classList.add('gaip-main-menu-leading-icon');
    originalIcon.innerHTML = '<img src="./features/config-center/assets/organization.svg" alt="" aria-hidden="true">';
    label.classList.add('gaip-main-menu-label');
    caret.classList.add('gaip-main-menu-caret');
    caret.innerHTML = '<svg class="gaip-main-menu-caret-icon" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m2.5 4.25 3.5 3.5 3.5-3.5" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    submenu.classList.add('gaip-main-menu-submenu');
  }
  function ensureMenu() {
    var menu = document.querySelector('.ant-layout-sider .ant-menu-root');
    if (!menu) return;
    var group = menu.querySelector('.gaip-config-menu');
    if (!group) {
      group = document.createElement('li');
      group.className = source.navClass;
      group.setAttribute('role', 'none');
      group.setAttribute('data-gaip-channel', config.key);
      group.innerHTML = sourceMarkup(source.nav);
      decorateExpandableMenu(group);
      views.forEach(function (v) {
        var template = document.createElement('template');
        template.innerHTML = sourceMarkup(source.navItem);
        var item = template.content.firstElementChild;
        var link = item.querySelector('a');
        link.href = hash(v.key); link.dataset.configView = v.key;
        link.querySelector('.ant-pro-base-menu-inline-item-text').textContent = v.label;
        item.removeAttribute('data-menu-id'); item.tabIndex = -1;
        item.setAttribute('role', 'none'); link.setAttribute('role', 'menuitem');
        group.querySelector('ul').appendChild(item);
      });
      menu.appendChild(group);
      group.addEventListener('click', function (event) {
        var link = event.target.closest('[data-config-view]');
        if (link) { event.preventDefault(); open(link.getAttribute('data-config-view')); }
        else if (event.target.closest('.gaip-config-toggle')) {
          event.preventDefault();
          event.stopPropagation();
          menuOpen = !menuOpen;
          updateMenu(group);
        }
      });
      group.addEventListener('keydown', function (event) {
        var toggle = event.target.closest('.gaip-config-toggle');
        if (toggle && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); toggle.click(); }
        if (event.key === 'Escape') { menuOpen = false; updateMenu(group); group.querySelector('.gaip-config-toggle').focus(); }
      });
    }
    if (!menu.hasAttribute('data-config-leave-bound')) {
      menu.setAttribute('data-config-leave-bound', 'true');
      menu.addEventListener('click', function (event) {
        if (requested() && !event.target.closest('.gaip-config-menu') && !event.target.closest('[data-gaip-main-menu-toggle]')) closeForNavigation();
      }, true);
    }
    updateMenu(group);
  }
  function updateMenu(group) {
    group.classList.toggle('is-current', requested());
    group.classList.toggle('is-open', menuOpen);
    group.classList.toggle('ant-menu-submenu-open', menuOpen);
    group.classList.toggle('ant-menu-submenu-selected', requested());
    group.querySelector('.gaip-config-toggle').setAttribute('aria-expanded', String(menuOpen));
    group.querySelector('ul').hidden = !menuOpen;
    group.querySelector('ul').setAttribute('aria-hidden', String(!menuOpen));
    if (requested()) Array.from(group.parentElement.querySelectorAll('.ant-menu-item-selected')).forEach(function (item) { if (!group.contains(item)) { item.classList.remove('ant-menu-item-selected'); item.setAttribute('aria-selected', 'false'); } });
    group.querySelectorAll('[data-config-view]').forEach(function (link) {
      var selected = requested() && link.getAttribute('data-config-view') === view();
      link.closest('li').classList.toggle('ant-menu-item-selected', selected);
      if (selected) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
  }
  function departmentContainsMember(channelIndex, departmentId, memberDepartmentId) {
    if (departmentId === 'all') return true;
    var set = departmentSets[channelIndex] || [];
    var current = set.find(function (department) { return department.id === memberDepartmentId; });
    while (current) {
      if (current.id === departmentId) return true;
      current = set.find(function (department) { return department.id === current.parent; });
    }
    return false;
  }
  function membersInDepartment(channelIndex, departmentId) {
    return members.filter(function (member) {
      return member.channel === channelIndex && departmentContainsMember(channelIndex, departmentId, member.department);
    });
  }
  function filtered() {
    return membersInDepartment(state.channel, state.department).filter(function (member) {
      return (member.name + ' ' + member.account).toLowerCase().includes(state.query.toLowerCase());
    });
  }
  function renderTree() {
    closeDepartmentMenu();
    departments = departmentSets[state.channel];
    var tree = page.querySelector('[data-config-tree]');
    if (!tree) return;
    var scrollTop = tree.scrollTop;
    tree.innerHTML = sourceMarkup(source.tree).replace(/^<div[^>]*>|<\/div>$/g, '');
    var holder = tree.querySelector('.ant-tree-list-holder-inner');
    holder.replaceChildren();
    var hiddenBelow = -1;
    departments.forEach(function (department) {
      var id = department.id, depth = department.depth;
      var row = (rowTemplates[id] || leafTemplate).cloneNode(true);
      row.dataset.department = id; row.dataset.depth = depth;
      row.querySelector('.ant-tree-indent').innerHTML = '<span class="ant-tree-indent-unit"></span>'.repeat(depth);
      var name = id === 'all' ? channels[state.channel] : department.name;
      var label = row.querySelector('.treeNodeName___mtuTp'); label.textContent = label.title = name;
      var children = departments.some(function (item) { return item.parent === id; });
      var toggle = row.querySelector('.ant-tree-switcher');
      var isCollapsed = children && isDepartmentCollapsed(department);
      toggle.className = 'ant-tree-switcher ' + (children ? (isCollapsed ? 'ant-tree-switcher_close' : 'ant-tree-switcher_open') : 'ant-tree-switcher-noop');
      toggle.innerHTML = children ? switcherMarkup : '';
      toggle.removeAttribute('data-collapse'); toggle.removeAttribute('role'); toggle.removeAttribute('tabindex'); toggle.removeAttribute('aria-label');
      if (hiddenBelow >= 0 && depth <= hiddenBelow) hiddenBelow = -1;
      row.hidden = hiddenBelow >= 0;
      if (!row.hidden && isCollapsed) hiddenBelow = depth;
      row.classList.toggle('ant-tree-treenode-selected', id === state.department);
      row.classList.toggle('ant-tree-treenode-switcher-open', children && !isCollapsed);
      var content = row.querySelector('.ant-tree-node-content-wrapper');
      content.classList.toggle('ant-tree-node-selected', id === state.department);
      row.querySelector('.treeNodeExpandWrap___vbCMf').classList.toggle('treeNodeExpandWrapVisible___eLe9e', id === state.department);
      var more = row.querySelector('.treeNodeExpand___UwfRZ');
      more.dataset.departmentMenu = id; more.tabIndex = 0; more.setAttribute('role', 'button');
      more.setAttribute('aria-label', name + '部门操作'); more.setAttribute('aria-haspopup', 'menu'); more.setAttribute('aria-expanded', 'false');
      if (children) {
        toggle.dataset.collapse = id;
        row.setAttribute('aria-expanded', String(!isCollapsed));
        toggle.setAttribute('role', 'button'); toggle.tabIndex = 0;
        toggle.setAttribute('aria-label', '展开或收起' + name);
      } else row.removeAttribute('aria-expanded');
      holder.appendChild(row);
    });
    tree.scrollTop = scrollTop;
  }
  function closeDepartmentMenu(restoreFocus) {
    if (!departmentMenu) return;
    departmentMenu.remove(); departmentMenu = null;
    document.removeEventListener('click', dismissMenu);
    page.removeEventListener('scroll', dismissMenu, true);
    window.removeEventListener('resize', dismissMenu);
    if (menuTrigger && menuTrigger.isConnected) {
      menuTrigger.setAttribute('aria-expanded', 'false');
      if (restoreFocus) menuTrigger.focus({ preventScroll: true });
    }
    menuTrigger = null;
  }
  function showDepartmentMenu(trigger, focusMenu) {
    var same = menuTrigger === trigger;
    closeDepartmentMenu();
    if (same) return;
    menuTrigger = trigger;
    departmentMenu = document.createElement('div');
    departmentMenu.className = 'ant-dropdown css-10wz6x1 css-var-r0 ant-dropdown-css-var gaip-department-menu';
    departmentMenu.innerHTML = source.departmentUi.menu;
    if (trigger.dataset.departmentMenu === 'all') departmentMenu.querySelectorAll('[data-department-action="rename"],[data-department-action="delete"]').forEach(function (item) { item.remove(); });
    departmentMenu.querySelector('ul').setAttribute('aria-label', '部门操作');
    page.appendChild(departmentMenu);
    var rect = trigger.getBoundingClientRect(), box = departmentMenu.getBoundingClientRect();
    departmentMenu.style.left = Math.max(8, Math.min(rect.left, innerWidth - box.width - 8)) + 'px';
    departmentMenu.style.top = (rect.bottom + box.height + 4 < innerHeight ? rect.bottom + 4 : Math.max(8, rect.top - box.height - 4)) + 'px';
    trigger.setAttribute('aria-expanded', 'true');
    departmentMenu.addEventListener('click', function (event) {
      event.stopPropagation();
      var item = event.target.closest('[data-department-action]');
      if (!item) return;
      var id = trigger.dataset.departmentMenu, action = item.dataset.departmentAction;
      closeDepartmentMenu(); dialogController.openDepartment(id, action, trigger);
    });
    departmentMenu.addEventListener('keydown', function (event) {
      var items = Array.from(departmentMenu.querySelectorAll('[role="menuitem"]'));
      var index = items.indexOf(document.activeElement);
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeDepartmentMenu(true); }
      else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault(); items[(index + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
      } else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (items.includes(event.target)) event.target.click(); }
      else if (event.key === 'Tab') closeDepartmentMenu();
    });
    dismissMenu = function (event) {
      if (event.type === 'click' && (trigger.contains(event.target) || departmentMenu && departmentMenu.contains(event.target))) return;
      closeDepartmentMenu();
    };
    document.addEventListener('click', dismissMenu);
    page.addEventListener('scroll', dismissMenu, true);
    window.addEventListener('resize', dismissMenu);
    if (focusMenu) departmentMenu.querySelector('[role="menuitem"]').focus({ preventScroll: true });
  }
  function updateAdminBadge(member) {
    var row = sourceRow(member.html), badge = row.querySelector('.tagAdmin___YTyPD');
    if (!member.admin && badge) badge.remove();
    if (member.admin && !badge) row.querySelector('.nameCell___QnGoz').appendChild(sourceRow(source.rows[0]).querySelector('.tagAdmin___YTyPD').cloneNode(true));
    member.html = row.outerHTML;
  }
  function editDepartment(id, action, trigger) {
    var department = departments.find(function (item) { return item.id === id; });
    if (!department || id === 'all' && (action === 'rename' || action === 'delete')) return;
    var dialog = window.__GAIP_CONFIG_DIALOG_FACTORY__.createDepartmentDialog(action);
    var title = action === 'delete' ? '删除部门' : action === 'admin' ? '设置管理员' : action === 'rename' ? '修改部门名称' : '添加子部门';
    dialog.setAttribute('aria-label', title);
    if (action === 'delete') dialog.querySelector('.ant-modal-title').textContent = title;
    var error = document.createElement('p'); error.className = 'gaip-department-error'; error.setAttribute('role', 'alert'); error.hidden = true;
    var body = dialog.querySelector('.ant-modal-body'), input = body.querySelector('input'), save = dialog.querySelector('[data-department-save]');
    var currentMembers = membersInDepartment(state.channel, id);
    if (action === 'admin') {
      var roleState = adminRoleState(id, currentMembers);
      var roleConfigs = [
        { key: 'organization', type: 'checkbox', selected: function (member) { return member.admin; } },
        { key: 'commission', type: 'checkbox', exclusive: true, selected: function (member) { return roleState.commission === member.id; } },
        { key: 'clue-admin', type: 'checkbox', selected: function (member) { return roleState.clueAdmin.includes(member.id); } },
        { key: 'clue-follower', type: 'checkbox', selected: function (member) { return roleState.clueFollower.includes(member.id); } }
      ];
      body.querySelector('[data-admin-node-path]').textContent = departmentPath(department);
      var roleTabs = Array.from(body.querySelectorAll('[data-admin-role-tab]'));
      function activateAdminRole(roleKey, shouldFocus) {
        roleTabs.forEach(function (tab) {
          var active = tab.dataset.adminRoleTab === roleKey;
          tab.classList.toggle('is-active', active);
          tab.setAttribute('aria-selected', String(active));
          tab.tabIndex = active ? 0 : -1;
          if (active && shouldFocus) tab.focus({ preventScroll: true });
        });
        body.querySelectorAll('[data-admin-role-panel]').forEach(function (panel) {
          var active = panel.dataset.adminRolePanel === roleKey;
          panel.hidden = !active;
          panel.classList.toggle('is-active', active);
        });
      }
      roleTabs.forEach(function (tab, index) {
        tab.addEventListener('click', function () { activateAdminRole(tab.dataset.adminRoleTab, false); });
        tab.addEventListener('keydown', function (event) {
          var targetIndex = index;
          if (event.key === 'ArrowDown') targetIndex = (index + 1) % roleTabs.length;
          else if (event.key === 'ArrowUp') targetIndex = (index + roleTabs.length - 1) % roleTabs.length;
          else if (event.key === 'Home') targetIndex = 0;
          else if (event.key === 'End') targetIndex = roleTabs.length - 1;
          else return;
          event.preventDefault();
          activateAdminRole(roleTabs[targetIndex].dataset.adminRoleTab, true);
        });
      });
      function syncAdminRoles() {
        roleConfigs.forEach(function (role) {
          var panel = body.querySelector('[data-admin-role-panel="' + role.key + '"]');
          var selected = Array.from(panel.querySelectorAll('input:checked'));
          panel.querySelectorAll('.adminMemberCard___2fWc8').forEach(function (card) {
            var input = card.querySelector('input'), type = input.type, control = input.parentElement;
            card.classList.toggle('is-selected', input.checked);
            card.classList.toggle('ant-checkbox-wrapper-checked', type === 'checkbox' && input.checked);
            card.classList.toggle('ant-radio-wrapper-checked', type === 'radio' && input.checked);
            control.classList.toggle('ant-checkbox-checked', type === 'checkbox' && input.checked);
            control.classList.toggle('ant-radio-checked', type === 'radio' && input.checked);
            var disabled = !canConfigureAdminRole(role.key) || !!(role.exclusive && selected.length && !input.checked);
            input.disabled = disabled;
            control.classList.toggle('ant-checkbox-disabled', disabled && type === 'checkbox');
            control.classList.toggle('ant-radio-disabled', disabled && type === 'radio');
            card.classList.toggle('ant-checkbox-wrapper-disabled', disabled && type === 'checkbox');
            card.classList.toggle('ant-radio-wrapper-disabled', disabled && type === 'radio');
          });
          body.querySelector('[data-admin-role-count="' + role.key + '"]').textContent = '已选 ' + selected.length + ' 人';
        });
      }
      roleConfigs.forEach(function (role) {
        var panel = body.querySelector('[data-admin-role-panel="' + role.key + '"]');
        var list = panel.querySelector('[data-admin-role-list]');
        var enabled = canConfigureAdminRole(role.key);
        var roleLabel = body.querySelector('[data-admin-role-tab="' + role.key + '"] strong').textContent;
        panel.classList.toggle('is-disabled', !enabled);
        panel.setAttribute('aria-disabled', String(!enabled));
        var roleTab = body.querySelector('[data-admin-role-tab="' + role.key + '"]');
        roleTab.classList.toggle('is-readonly', !enabled);
        if (!enabled) roleTab.setAttribute('aria-description', '当前角色仅可查看');
        currentMembers.forEach(function (member) {
          var t = document.createElement('template'); t.innerHTML = source.departmentUi.adminRow;
          var card = t.content.firstElementChild, choice = card.querySelector('input');
          var control = choice.parentElement, choiceInner = control.lastElementChild;
          card.querySelector('.memberName___en782').textContent = member.name;
          card.querySelector('.memberAccount___ZQ6PA').textContent = member.account;
          choice.type = role.type;
          card.classList.toggle('ant-checkbox-wrapper', role.type === 'checkbox');
          card.classList.toggle('ant-checkbox-css-var', role.type === 'checkbox');
          card.classList.toggle('ant-radio-wrapper', role.type === 'radio');
          card.classList.toggle('ant-radio-css-var', role.type === 'radio');
          control.classList.toggle('ant-checkbox', role.type === 'checkbox');
          control.classList.toggle('ant-radio', role.type === 'radio');
          choice.className = role.type === 'radio' ? 'ant-radio-input' : 'ant-checkbox-input';
          choiceInner.className = role.type === 'radio' ? 'ant-radio-inner' : 'ant-checkbox-inner';
          choice.name = 'admin-role-' + state.channel + '-' + id + '-' + role.key;
          choice.checked = role.selected(member);
          choice.disabled = !enabled;
          control.classList.toggle('ant-checkbox-disabled', !enabled && role.type === 'checkbox');
          control.classList.toggle('ant-radio-disabled', !enabled && role.type === 'radio');
          card.classList.toggle('ant-checkbox-wrapper-disabled', !enabled && role.type === 'checkbox');
          card.classList.toggle('ant-radio-wrapper-disabled', !enabled && role.type === 'radio');
          choice.dataset.adminRole = role.key;
          choice.dataset.adminMember = member.id;
          choice.setAttribute('aria-label', member.name + (role.key === 'commission' ? '设为' : '设置') + roleLabel);
          choice.addEventListener('change', function () {
            if (choice.checked && role.exclusive) {
              panel.querySelectorAll('input').forEach(function (otherChoice) { if (otherChoice !== choice) otherChoice.checked = false; });
            }
            if (choice.checked && (role.key === 'clue-admin' || role.key === 'clue-follower')) {
              var opposite = role.key === 'clue-admin' ? 'clue-follower' : 'clue-admin';
              var other = body.querySelector('[data-admin-role="' + opposite + '"][data-admin-member="' + member.id + '"]');
              if (other) other.checked = false;
            }
            syncAdminRoles();
          });
          list.appendChild(card);
        });
      });
      syncAdminRoles();
      activateAdminRole('organization', false);
      if (!currentMembers.length) {
        body.querySelector('.adminRoleWorkspace___u4P8e').hidden = true;
        body.querySelector('[data-admin-empty]').hidden = false;
        save.disabled = true;
      }
    } else if (action === 'delete') {
      var blocked = departments.some(function (item) { return item.parent === id; }) || currentMembers.length;
      body.textContent = blocked ? '该部门包含子部门或成员，请先处理后再删除。' : '确认删除部门“' + department.name + '”？';
      save.disabled = !!blocked;
    } else {
      input.value = action === 'rename' ? department.name : ''; input.required = true;
      input.setAttribute('aria-label', action === 'rename' ? '部门名称' : '子部门名称');
      var clear = body.querySelector('.ant-input-clear-icon');
      function inputChanged() { error.hidden = true; clear.classList.toggle('ant-input-clear-icon-hidden', !input.value); }
      input.addEventListener('input', inputChanged); inputChanged();
      clear.addEventListener('click', function () { input.value = ''; inputChanged(); input.focus(); });
      input.addEventListener('keydown', function (event) { if (event.key === 'Enter') { event.preventDefault(); save.click(); } });
    }
    body.appendChild(error);
    dialog.querySelectorAll('[data-department-cancel]').forEach(function (button) { button.addEventListener('click', function () { dialog.close(); }); });
    dialog.addEventListener('close', function () {
      dialog.remove();
      if (!page) return;
      var buttons = Array.from(page.querySelectorAll('[data-department-menu]'));
      var returnTarget = buttons.find(function (el) { return el.dataset.departmentMenu === id; }) || buttons.find(function (el) { return el.dataset.departmentMenu === department.parent; });
      if (returnTarget) returnTarget.focus({ preventScroll: true }); else if (trigger && trigger.isConnected) trigger.focus({ preventScroll: true });
    });
    save.addEventListener('click', function () {
      if (action === 'admin') {
        dialog.querySelectorAll('[data-admin-role="organization"]').forEach(function (checkbox) {
          var member = currentMembers.find(function (item) { return item.id === Number(checkbox.dataset.adminMember); });
          member.admin = checkbox.checked; updateAdminBadge(member);
        });
        var commissionChoice = dialog.querySelector('[data-admin-role="commission"]:checked');
        adminRoleAssignments[adminRoleKey(id)] = {
          commission: commissionChoice ? Number(commissionChoice.dataset.adminMember) : null,
          clueAdmin: Array.from(dialog.querySelectorAll('[data-admin-role="clue-admin"]:checked')).map(function (choice) { return Number(choice.dataset.adminMember); }),
          clueFollower: Array.from(dialog.querySelectorAll('[data-admin-role="clue-follower"]:checked')).map(function (choice) { return Number(choice.dataset.adminMember); })
        };
      } else if (action === 'delete') {
        if (save.disabled) return;
        departments.splice(departments.indexOf(department), 1);
        if (state.department === id) state.department = department.parent || 'all';
      } else {
        var name = input.value.trim(), parent = action === 'add' ? id : department.parent;
        var duplicate = departments.some(function (item) { return item.id !== id && item.parent === parent && item.name === name; });
        if (!name || duplicate) { error.textContent = !name ? '请输入部门名称' : '同级部门名称已存在'; error.hidden = false; input.focus(); return; }
        if (action === 'rename') department.name = name;
        else {
          var index = departments.indexOf(department) + 1;
          while (index < departments.length && departments[index].depth > department.depth) index++;
          departments.splice(index, 0, { id: 'local-department-' + (++departmentSequence), name: name, parent: id, depth: department.depth + 1 });
          collapsed[state.channel + ':' + id] = false;
        }
      }
      renderTree(); renderMembers(); dialog.close();
    });
    page.appendChild(dialog); dialog.showModal();
    if (input && action !== 'admin' && action !== 'delete') input.focus();
    return dialog;
  }
  function renderMembers() {
    var list = filtered(), pages = Math.max(1, Math.ceil(list.length / 10));
    state.page = Math.min(state.page, pages);
    var tbody = page.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    list.slice((state.page - 1) * 10, state.page * 10).forEach(function (m) {
      var template = document.createElement('template'); template.innerHTML = '<table><tbody>' + sourceMarkup(m.html) + '</tbody></table>';
      var row = template.content.querySelector('tr');
      row.querySelector('.nameCell___QnGoz').firstElementChild.textContent = m.name;
      row.children[1].textContent = m.account;
      if (m.phone !== undefined) (row.children[2].firstElementChild || row.children[2]).textContent = m.phone || '-';
      if (m.email !== undefined) {
        var emailCell = row.children[3].firstElementChild || row.children[3];
        emailCell.textContent = m.email || '-'; emailCell.title = row.children[3].title = m.email || '';
      }
      row.children[0].after(createMemberIdentityCell(m));
      row.querySelector('.editBtn___jN6Rq').dataset.edit = m.id;
      row.querySelector('.moreBtn___LI6Xo').dataset.more = m.id;
      row.querySelectorAll('[data-edit], [data-more]').forEach(function (el) { el.setAttribute('role', 'button'); el.tabIndex = 0; });
      tbody.appendChild(row);
    });
    if (!list.length) tbody.innerHTML = '<tr><td colspan="8" class="emptyState___B87_m">暂无数据</td></tr>';
    page.querySelector('[data-config-summary]').textContent = '共 ' + list.length + ' 条，第 ' + state.page + ' / ' + pages + ' 页';
    page.querySelector('[data-config-current]').textContent = state.page;
    ['prev', 'next'].forEach(function (key) {
      var button = page.querySelector('[data-config-' + key + ']');
      button.disabled = key === 'prev' ? state.page === 1 : state.page === pages;
      button.tabIndex = button.disabled ? -1 : 0;
      button.parentElement.classList.toggle('ant-pagination-disabled', button.disabled);
      button.parentElement.setAttribute('aria-disabled', String(button.disabled));
    });
    page.querySelector('[data-config-export]').disabled = !list.length;
  }
  function bindTableScrollState() {
    var table = page.querySelector('.ant-table');
    var scroller = page.querySelector('.ant-table-content');
    if (!table || !scroller) return;
    function update() {
      var maxScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
      table.classList.toggle('ant-table-ping-left', scroller.scrollLeft > 1);
      table.classList.toggle('ant-table-ping-right', scroller.scrollLeft < maxScrollLeft - 1);
    }
    scroller.addEventListener('scroll', update, { passive: true });
    update();
    requestAnimationFrame(update);
  }
  function insertAdminToolbarButton() {
    var toolbar = page.querySelector('.mainHeader___QGD6D');
    var actions = toolbar.querySelector('.headerRight___Fe2zg');
    var exportButton = toolbar.querySelector('[data-config-export]');
    var menuTemplate = document.createElement('template');
    menuTemplate.innerHTML = source.departmentUi.menu;
    var sourceIcon = menuTemplate.content.querySelector('[data-department-action="admin"] > svg');
    var button = exportButton.cloneNode(true);
    button.removeAttribute('data-config-export');
    button.setAttribute('data-config-admin', '');
    button.setAttribute('aria-label', '设置管理员');
    button.classList.add('gaip-config-admin-button');
    button.querySelector('.ant-btn-icon').replaceChildren(sourceIcon.cloneNode(true));
    button.lastElementChild.textContent = '设置管理员';
    toolbar.insertBefore(button, actions);
  }
  function insertBulkImportButton(actions) {
    var logButton = actions.querySelector('[data-config-log]');
    var uploadIcon = document.createElement('img');
    uploadIcon.src = bulkImportAssetUrl('bulk-import-upload.svg');
    uploadIcon.alt = '';
    uploadIcon.setAttribute('aria-hidden', 'true');
    var button = logButton.cloneNode(true);
    button.removeAttribute('data-config-log');
    button.setAttribute('data-config-bulk-import', '');
    button.setAttribute('aria-label', '批量导入成员');
    button.classList.add('gaip-config-bulk-import-button');
    button.querySelector('.ant-btn-icon').replaceChildren(uploadIcon);
    button.lastElementChild.textContent = '批量导入成员';
    actions.insertBefore(button, logButton);
  }
  function syncMemberSearchClear() {
    var input = page.querySelector('input[aria-label="搜索成员"]');
    var clear = page.querySelector('[data-config-clear]');
    if (!input || !clear) return;
    var focused = input === document.activeElement || input.closest('.searchInput___VaHgy').contains(document.activeElement);
    clear.classList.toggle('ant-input-clear-icon-hidden', !input.value && !focused);
  }
  function renderOrganization() {
    closeDepartmentMenu();
    page.innerHTML = '<div class="pageContainer___QCUaw gaip-config-original">' + sourceMarkup(source.header) +
      '<div class="content___r0pMd">' + sourceMarkup(source.tree) + '<div class="main___CWrje">' + sourceMarkup(source.toolbar) + sourceMarkup(source.table) + '</div></div></div>';
    var organizationHeader = page.querySelector('.pageContainer___QCUaw > .header___Vhyog');
    var organizationHeaderActions = organizationHeader.querySelector('.headerRight___Fe2zg');
    var memberSearch = page.querySelector('.mainHeader___QGD6D .searchWrap___gp0a3');
    organizationHeader.insertBefore(memberSearch, organizationHeaderActions);
    insertBulkImportButton(organizationHeaderActions);
    insertAdminToolbarButton();
    page.querySelectorAll('[data-config-channel]').forEach(function (tab) {
      var selected = Number(tab.dataset.configChannel) === state.channel;
      tab.classList.toggle('tabActive___H5olV', selected); tab.setAttribute('aria-selected', String(selected));
    });
    var searchInput = page.querySelector('input[aria-label="搜索成员"]');
    var searchClear = page.querySelector('[data-config-clear]');
    searchInput.value = state.query;
    searchClear.setAttribute('aria-label', '清除搜索内容');
    syncMemberSearchClear();
    renderTree(); renderMembers(); bindTableScrollState();
  }
  function normalizeOperationLogExport() {
    var button = page.querySelector('.gaip-log-inline [data-log-export]');
    if (!button) return;
    var template = document.createElement('template');
    template.innerHTML = sourceMarkup(source.toolbar);
    var sourceButton = template.content.querySelector('[data-config-export]');
    button.replaceChildren(
      sourceButton.querySelector('.ant-btn-icon').cloneNode(true),
      sourceButton.lastElementChild.cloneNode(true)
    );
    button.classList.add('exportBtn___RDhet', 'gaip-config-log-export');
    button.setAttribute('aria-label', '导出Excel');
  }
  function editMember(id) {
    var member = members.find(function (m) { return m.id === id; });
    var dialog = window.__GAIP_CONFIG_DIALOG_FACTORY__.createMemberDialog();
    dialog.setAttribute('aria-label', member ? '编辑成员' : '添加成员');
    dialog.querySelector('.ant-modal-title').textContent = member ? '编辑成员' : '添加成员';
    var memberFooter = dialog.querySelector('.footer___UhMLM');
    dialog.querySelector('.ant-modal-content').appendChild(memberFooter);
    if (member) {
      var adjustButton = document.createElement('button');
      adjustButton.type = 'button';
      adjustButton.className = 'ant-btn css-10wz6x1 css-var-r0 ant-btn-default ant-btn-color-default ant-btn-variant-outlined memberAdjustNodeBtn___Sr4Qe';
      adjustButton.setAttribute('data-editor-adjust-node', '');
      adjustButton.textContent = '调整节点';
      memberFooter.prepend(adjustButton);
    }
    var account = dialog.querySelector('#domainAccount'), nameInput = dialog.querySelector('#userName');
    account.value = member ? member.account : ''; nameInput.value = member ? member.name : '';
    account.disabled = nameInput.disabled = !!member;
    [account, nameInput].forEach(function (input) { input.classList.toggle('ant-input-disabled', !!member); });
    var phone = dialog.querySelector('#mobilePhone'), email = dialog.querySelector('#userEmail');
    phone.value = member ? member.phone || '' : ''; email.value = member ? member.email || '' : '';
    var previousFocus = document.activeElement;
    dialog.addEventListener('close', function () { dialog.remove(); if (previousFocus && previousFocus.isConnected) previousFocus.focus(); });
    dialog.querySelectorAll('[data-editor-cancel]').forEach(function (button) { button.addEventListener('click', function () { dialog.close(); }); });
    dialog.querySelectorAll('.ant-input-clear-icon').forEach(function (button) { button.addEventListener('click', function () { var input = button.closest('.ant-input-affix-wrapper').querySelector('input'); input.value = ''; }); });
    var editorDepartment = member ? member.department : state.department;
    var currentMembers = members.filter(function (item) { return item.channel === state.channel && item.department === editorDepartment; });
    var editorRoleState = adminRoleState(editorDepartment, currentMembers);
    var organizationRole = dialog.querySelector('#isAdmin'), commissionRole = dialog.querySelector('#isCommissionOwner');
    var currentClueRole = member && editorRoleState.clueAdmin.includes(member.id) ? 'clue-admin' : member && editorRoleState.clueFollower.includes(member.id) ? 'clue-follower' : 'none';
    organizationRole.checked = !!(member && member.admin);
    organizationRole.disabled = !canConfigureAdminRole('organization');
    commissionRole.checked = !!(member && editorRoleState.commission === member.id);
    commissionRole.disabled = !canConfigureAdminRole('commission') || !!(editorRoleState.commission && (!member || editorRoleState.commission !== member.id));
    dialog.querySelectorAll('input[name="clueRole"]').forEach(function (input) {
      input.checked = input.value === currentClueRole;
      input.disabled = input.value === 'clue-admin' ? !canConfigureAdminRole('clue-admin') : input.value === 'clue-follower' ? !canConfigureAdminRole('clue-follower') : !(canConfigureAdminRole('clue-admin') || canConfigureAdminRole('clue-follower'));
    });
    dialog.querySelectorAll('input[name="licenseTypeCode"]').forEach(function (input, i) { input.value = i; input.checked = i === (member && member.licensed ? 0 : 1); });
    dialog.querySelectorAll('input[name="referrerType"]').forEach(function (input, i) { input.value = i; input.checked = i === (member ? member.referrer : 0); });
    dialog.querySelectorAll('#licenseType .ant-checkbox-wrapper').forEach(function (label) {
      var input = label.querySelector('input');
      input.checked = !!(member && member.regions.includes(label.textContent.trim()));
    });
    function syncChoices() {
      dialog.querySelectorAll('input[type="checkbox"],input[type="radio"]').forEach(function (input) {
        var type = input.type === 'radio' ? 'radio' : 'checkbox';
        var control = input.closest('.ant-' + type), label = input.closest('label');
        control.classList.toggle('ant-' + type + '-checked', input.checked);
        control.classList.toggle('ant-' + type + '-disabled', input.disabled);
        label.classList.toggle('ant-' + type + '-wrapper-checked', input.checked);
        label.classList.toggle('ant-' + type + '-wrapper-disabled', input.disabled);
      });
    }
    dialog.addEventListener('change', syncChoices);
    account.addEventListener('input', function () { account.setCustomValidity(''); });
    syncChoices();
    var adjustMemberButton = dialog.querySelector('[data-editor-adjust-node]');
    if (adjustMemberButton) adjustMemberButton.addEventListener('click', function () {
      dialog.close();
      dialogController.openAdjustNode(member.id, previousFocus);
    });
    dialog.querySelector('[data-editor-save]').addEventListener('click', function () {
      if (!account.value.trim() || !nameInput.value.trim()) { account.required = nameInput.required = true; account.reportValidity(); nameInput.reportValidity(); return; }
      if (!member && members.some(function (m) { return m.account === account.value.trim(); })) { account.setCustomValidity('域账号已存在'); account.reportValidity(); return; }
      var record = member || { id: Math.max.apply(null, [0].concat(members.map(function (m) { return m.id; }))) + 1, channel: state.channel, department: state.department, html: source.rows[2] };
      Object.assign(record, {
        name: nameInput.value.trim(), account: account.value.trim(), phone: phone.value.trim(), email: email.value.trim(),
        admin: organizationRole.checked,
        licensed: dialog.querySelectorAll('input[name="licenseTypeCode"]')[0].checked,
        regions: Array.from(dialog.querySelectorAll('#licenseType .ant-checkbox-wrapper')).filter(function (label) { return label.querySelector('input').checked; }).map(function (label) { return label.textContent.trim(); }),
        referrer: Number(dialog.querySelector('input[name="referrerType"]:checked').value)
      });
      if (!member) members.push(record);
      if (!commissionRole.disabled) {
        if (commissionRole.checked) editorRoleState.commission = record.id;
        else if (editorRoleState.commission === record.id) editorRoleState.commission = null;
      }
      var selectedClueRole = dialog.querySelector('input[name="clueRole"]:checked').value;
      editorRoleState.clueAdmin = editorRoleState.clueAdmin.filter(function (memberId) { return memberId !== record.id; });
      editorRoleState.clueFollower = editorRoleState.clueFollower.filter(function (memberId) { return memberId !== record.id; });
      if (selectedClueRole === 'clue-admin') editorRoleState.clueAdmin.push(record.id);
      else if (selectedClueRole === 'clue-follower') editorRoleState.clueFollower.push(record.id);
      // 原站标签结构保持不变；仅在本地更新字段和选择项。
      var row = sourceRow(record.html), referenceRow = sourceRow(source.rows[0]);
      var admin = row.querySelector('.tagAdmin___YTyPD');
      if (!record.admin && admin) admin.remove();
      if (record.admin && !admin) row.querySelector('.nameCell___QnGoz').appendChild(referenceRow.querySelector('.tagAdmin___YTyPD').cloneNode(true));
      var license = row.querySelector('.licenseCell___BqdK0');
      if (license) {
        var badge = referenceRow.querySelector('.tagLicensed___m8J7I');
        license.innerHTML = record.licensed ? badge.outerHTML + record.regions.map(function (region) { return '<span class="tagRegion___z0DNJ">' + escapeHtml(region) + '</span>'; }).join('') : sourceRow(source.rows[2]).querySelector('.licenseCell___BqdK0').innerHTML;
      }
      row.children[5].innerHTML = record.referrer ? sourceRow(source.rows[record.referrer === 1 ? 0 : 3]).children[5].innerHTML : '-';
      record.html = row.outerHTML;
      dialog.close(); renderMembers();
    });
    page.appendChild(dialog); dialog.showModal();
    return dialog;
  }
  function exportMembers() {
    var rows = [['姓名', '域账号', '部门']].concat(filtered().map(function (m) { return [m.name, m.account, departments.find(function (d) { return d.id === m.department; }).name]; }));
    var url = URL.createObjectURL(window.__GAIP_OPERATION_LOG_XLSX__.build(rows)), link = document.createElement('a');
    link.href = url; link.download = '组织成员_本地模拟数据.xlsx'; link.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
  }
  function handleClick(event) {
    var departmentTrigger = event.target.closest('[data-department-menu]');
    if (departmentTrigger) { event.stopPropagation(); showDepartmentMenu(departmentTrigger, event.detail === 0); return; }
    var target = event.target.closest('[data-config-channel], [data-department], [data-collapse], [data-config-prev], [data-config-next], [data-config-add], [data-edit], [data-more], [data-config-admin], [data-config-export], [data-config-clear], [data-config-bulk-import], [data-config-log]');
    if (!target) return;
    if (event.target.closest('[data-collapse]')) {
      var collapseId = event.target.closest('[data-collapse]').dataset.collapse;
      var collapseDepartment = departments.find(function (item) { return item.id === collapseId; });
      var key = state.channel + ':' + collapseId;
      collapsed[key] = !isDepartmentCollapsed(collapseDepartment);
      renderTree();
    }
    else if (target.hasAttribute('data-config-channel')) { state.channel = Number(target.dataset.configChannel); state.department = 'all'; state.page = 1; renderOrganization(); }
    else if (target.hasAttribute('data-department')) { state.department = target.dataset.department; state.page = 1; renderTree(); renderMembers(); }
    else if (target.hasAttribute('data-config-prev')) { state.page--; renderMembers(); }
    else if (target.hasAttribute('data-config-next')) { state.page++; renderMembers(); }
    else if (target.hasAttribute('data-config-add')) dialogController.openMember();
    else if (target.hasAttribute('data-edit')) dialogController.openMember(Number(target.dataset.edit));
    else if (target.hasAttribute('data-more')) {
      var existing = page.querySelector('.gaip-config-more'); if (existing) { existing.remove(); return; }
      var dropdown = document.createElement('div'); dropdown.className = 'ant-dropdown gaip-config-more';
      dropdown.innerHTML = '<ul class="ant-dropdown-menu" role="menu" aria-label="成员操作"><li class="ant-dropdown-menu-item" role="menuitem" tabindex="0" data-member-action="adjust"><svg class="gaip-member-menu-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h11m0 0-3-3m3 3-3 3M19 17H8m0 0 3-3m-3 3 3 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg><span>调整节点</span></li><li class="ant-dropdown-menu-item ant-dropdown-menu-item-danger" role="menuitem" tabindex="0" data-member-action="delete"><span class="trashIcon___hWpPp"></span><span>删除</span></li></ul>';
      var rect = target.getBoundingClientRect(); dropdown.style.top = rect.bottom + 'px'; dropdown.style.left = Math.min(rect.left, innerWidth - 100) + 'px';
      dropdown.addEventListener('click', function (menuEvent) {
        var action = menuEvent.target.closest('[data-member-action]');
        if (!action) return;
        var memberId = Number(target.dataset.more);
        dropdown.remove();
        if (action.dataset.memberAction === 'adjust') dialogController.openAdjustNode(memberId, target);
        else { members = members.filter(function (m) { return m.id !== memberId; }); renderMembers(); }
      });
      dropdown.addEventListener('keydown', function (menuEvent) {
        if ((menuEvent.key === 'Enter' || menuEvent.key === ' ') && menuEvent.target.matches('[data-member-action]')) { menuEvent.preventDefault(); menuEvent.target.click(); }
        if (menuEvent.key === 'Escape') { menuEvent.preventDefault(); dropdown.remove(); target.focus(); }
      });
      page.appendChild(dropdown);
    }
    else if (target.hasAttribute('data-config-admin')) dialogController.openDepartment(state.department, 'admin', target);
    else if (target.hasAttribute('data-config-export')) exportMembers();
    else if (target.hasAttribute('data-config-clear')) { state.query = ''; page.querySelector('input[aria-label="搜索成员"]').value = ''; syncMemberSearchClear(); renderMembers(); }
    else if (target.hasAttribute('data-config-bulk-import')) dialogController.openBulkImport(target);
    else if (target.hasAttribute('data-config-log')) openOrganizationOperationLog(target);
  }
  function sync() {
    frame = 0;
    ensureMenu();
    var header = document.querySelector('[data-gaip-region="app-header"], [class*="header___tcVAl"]');
    if (!requested() || !header) { closeForNavigation(); return; }
    if (!page) {
      oldTitle = document.title;
      page = document.createElement('section'); page.className = 'gaip-config-page css-var-r0'; page.setAttribute('data-gaip-page-root', config.key);
      page.addEventListener('click', handleClick);
      page.addEventListener('keydown', function (event) { if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-edit],[data-more],[data-department],[data-collapse],[data-department-menu]')) { event.preventDefault(); event.target.click(); } });
      page.addEventListener('input', function (event) { if (event.target.matches('input[aria-label="搜索成员"]')) { state.query = event.target.value; state.page = 1; syncMemberSearchClear(); renderMembers(); } });
      page.addEventListener('focusin', function (event) { if (event.target.matches('input[aria-label="搜索成员"], [data-config-clear]')) syncMemberSearchClear(); });
      page.addEventListener('focusout', function (event) { if (event.target.matches('input[aria-label="搜索成员"], [data-config-clear]')) requestAnimationFrame(syncMemberSearchClear); });
      document.documentElement.classList.add('gaip-config-open');
    }
    var main = document.querySelector('.ant-pro-layout-content');
    if (main) mountIntoContent(main);
    else if (!page.isConnected) document.body.appendChild(page);
    document.body.setAttribute('data-gaip-page', config.key);
    document.body.setAttribute('data-gaip-page-label', config.label);
    var current = view();
    if (mountedView !== current) {
      closeDepartmentMenu();
      closeOrganizationOperationLog();
      closeBulkImportDialog();
      closeAdjustNodeDialog();
      if (logPanel) { logPanel.destroy(); logPanel = null; }
      page.replaceChildren();
      if (current === 'organization') renderOrganization();
      else if (window.__GAIP_OPERATION_LOG__) {
        logPanel = window.__GAIP_OPERATION_LOG__.mount(page);
        normalizeOperationLogExport();
      }
      else { schedule(); return; }
      mountedView = current;
      var label = views.find(function (v) { return v.key === current; }).label;
      document.title = label + ' - 配置中心 - GAIP';
      if (window.__GAIP_BREADCRUMB__) window.__GAIP_BREADCRUMB__.setDetail(config.key, label);
    }
    bounds();
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(sync); }
  function ensureDialogPreviewHost() {
    if (page) return;
    if (!dialogPreviewMode) throw new Error('配置中心页面尚未挂载');
    page = document.createElement('section');
    page.className = 'gaip-config-page css-var-r0';
    page.setAttribute('data-gaip-page-root', config.key);
    page.setAttribute('data-gaip-dialog-preview-host', '');
    page.style.inset = '0';
    page.addEventListener('click', handleClick);
    document.body.appendChild(page);
  }
  dialogController = {
    openMember: function (id) {
      ensureDialogPreviewHost();
      return editMember(id);
    },
    openDepartment: function (id, action, trigger) {
      ensureDialogPreviewHost();
      return editDepartment(id, action, trigger);
    },
    openOrganizationLog: function (trigger) {
      ensureDialogPreviewHost();
      openOrganizationOperationLog(trigger);
      return organizationLogDialog;
    },
    openBulkImport: function (trigger) {
      ensureDialogPreviewHost();
      return openBulkImportDialog(trigger);
    },
    openAdjustNode: function (memberId, trigger) {
      ensureDialogPreviewHost();
      return openAdjustNodeDialog(memberId, trigger);
    }
  };
  window.__GAIP_CONFIG_DIALOGS__ = dialogController;
  window.__GAIP_VIRTUAL_CHANNELS__ = window.__GAIP_VIRTUAL_CHANNELS__ || {};
  window.__GAIP_VIRTUAL_CHANNELS__.config = { open: open, closeForNavigation: closeForNavigation, isOpen: function () { return !!page; } };
  if (dialogPreviewMode) return;
  window.addEventListener('hashchange', function () { if (requested()) menuOpen = true; schedule(); });
  window.addEventListener('popstate', function () { if (requested()) menuOpen = true; schedule(); });
  window.addEventListener('resize', bounds);
  // 监听 Umi 框架重建，不监听自己渲染的页面内容，避免重绘循环。
  new MutationObserver(schedule).observe(document.getElementById('root'), { childList: true, subtree: true });
  menuOpen = requested(); schedule();
}());
