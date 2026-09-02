(function () {
  'use strict';
  var config = window.__GAIP_CHANNEL_CONFIG__.getByKey('config');
  var views = config.views, frame = 0, page, mountedView, logPanel;
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
  var departments = departmentSets[0], departmentSequence = 0, departmentMenu, menuTrigger, dismissMenu;
  var currentOperatorRole = 'super-admin';
  var adminRoleAssignments = {};
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
  function sourceRow(html) {
    var template = document.createElement('template');
    template.innerHTML = '<table><tbody>' + html + '</tbody></table>';
    return template.content.querySelector('tr');
  }
  function sourceMarkup(html) { return html; }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
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
  function filtered() {
    return members.filter(function (m) {
      return m.channel === state.channel && (state.department === 'all' || m.department === state.department) &&
        (m.name + ' ' + m.account).toLowerCase().includes(state.query.toLowerCase());
    });
  }
  function renderTree() {
    closeDepartmentMenu();
    departments = departmentSets[state.channel];
    var tree = page.querySelector('[data-config-tree]');
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
    var currentMembers = members.filter(function (member) { return member.channel === state.channel && member.department === id; });
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
      row.querySelector('.editBtn___jN6Rq').dataset.edit = m.id;
      row.querySelector('.moreBtn___LI6Xo').dataset.more = m.id;
      row.querySelectorAll('[data-edit], [data-more]').forEach(function (el) { el.setAttribute('role', 'button'); el.tabIndex = 0; });
      tbody.appendChild(row);
    });
    if (!list.length) tbody.innerHTML = '<tr><td colspan="7" class="emptyState___B87_m">暂无数据</td></tr>';
    page.querySelector('[data-config-summary]').textContent = '共 ' + list.length + ' 条，第 ' + state.page + ' / ' + pages + ' 页';
    page.querySelector('[data-config-current]').textContent = state.page;
    ['prev', 'next'].forEach(function (key) {
      var button = page.querySelector('[data-config-' + key + ']');
      button.disabled = key === 'prev' ? state.page === 1 : state.page === pages;
      button.parentElement.classList.toggle('ant-pagination-disabled', button.disabled);
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
    var currentMembers = members.filter(function (item) { return item.channel === state.channel && item.department === state.department; });
    var editorRoleState = adminRoleState(state.department, currentMembers);
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
    var target = event.target.closest('[data-config-channel], [data-department], [data-collapse], [data-config-prev], [data-config-next], [data-config-add], [data-edit], [data-more], [data-config-admin], [data-config-export], [data-config-clear], [data-config-log]');
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
      dropdown.innerHTML = '<ul class="ant-dropdown-menu" role="menu"><li class="ant-dropdown-menu-item ant-dropdown-menu-item-danger" role="menuitem"><span class="trashIcon___hWpPp"></span><span>删除</span></li></ul>';
      var rect = target.getBoundingClientRect(); dropdown.style.top = rect.bottom + 'px'; dropdown.style.left = Math.min(rect.left, innerWidth - 100) + 'px';
      dropdown.querySelector('li').addEventListener('click', function () { members = members.filter(function (m) { return m.id !== Number(target.dataset.more); }); dropdown.remove(); renderMembers(); }); page.appendChild(dropdown);
    }
    else if (target.hasAttribute('data-config-admin')) dialogController.openDepartment(state.department, 'admin', target);
    else if (target.hasAttribute('data-config-export')) exportMembers();
    else if (target.hasAttribute('data-config-clear')) { state.query = ''; page.querySelector('input[aria-label="搜索成员"]').value = ''; syncMemberSearchClear(); renderMembers(); }
    else if (target.hasAttribute('data-config-log')) window.__GAIP_OPERATION_LOG__.show();
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
    renderOrganization();
  }
  dialogController = {
    openMember: function (id) {
      ensureDialogPreviewHost();
      return editMember(id);
    },
    openDepartment: function (id, action, trigger) {
      ensureDialogPreviewHost();
      return editDepartment(id, action, trigger);
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
