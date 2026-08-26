(function () {
  'use strict';

  var frame = 0;
  var views = [
    ['import-workbench', '导入工作台'],
    ['import-records', '导入记录'],
    ['my-wealth', '我的财富值']
  ];

  function queryValue(name) {
    var query = (location.hash || '').split('?')[1] || '';
    return new URLSearchParams(query).get(name) || '';
  }

  function isWealthPage() {
    var api = window.__GAIP_WEALTH_CENTER__;
    return window.__GAIP_PAGE_OVERRIDE__ === 'wealth' ||
      queryValue('gaip-channel') === 'wealth' ||
      (api && api.isOpen());
  }

  function currentView() {
    return queryValue('gaip-view') || 'import-workbench';
  }

  function wealthHash(view) {
    return '#/workspace?gaip-channel=wealth&gaip-view=' + view;
  }

  function createGroup() {
    var group = document.createElement('li');
    group.className = 'ant-menu-submenu ant-menu-submenu-inline gaip-wealth-menu-group';
    group.setAttribute('data-gaip-channel', 'wealth');
    group.setAttribute('role', 'none');
    group.innerHTML =
      '<div class="ant-menu-submenu-title gaip-wealth-menu-parent" role="menuitem" tabindex="0" aria-haspopup="true" aria-expanded="false" data-wealth-menu-toggle>' +
        '<span class="ant-menu-title-content"><span class="ant-pro-base-menu-inline-item-title gaip-wealth-menu-title">' +
          '<span class="ant-pro-base-menu-inline-item-icon gaip-wealth-menu-icon" aria-hidden="true"><svg viewBox="0 0 18 18" fill="none"><path d="M16.5 10.818V16h-15V2h15v4.677" stroke="currentColor" stroke-width="1.3"/><path d="M17.35 6.65v4.7H15a2.343 2.343 0 0 1-1.662-.688A2.343 2.343 0 0 1 12.65 9c0-.649.263-1.236.688-1.662A2.343 2.343 0 0 1 15 6.65h2.35ZM5.5 15.5v-13" stroke="currentColor" stroke-width="1.3"/></svg></span>' +
          '<span class="ant-pro-base-menu-inline-item-text ant-pro-base-menu-inline-item-text-has-icon">财富值中心</span>' +
        '</span></span>' +
        '<span class="ant-menu-submenu-arrow gaip-wealth-menu-caret" aria-hidden="true">' +
          '<svg class="gaip-wealth-menu-caret-icon gaip-wealth-menu-caret-icon--down" viewBox="0 0 12 12" fill="none"><path d="m2.5 4.25 3.5 3.5 3.5-3.5" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '<svg class="gaip-wealth-menu-caret-icon gaip-wealth-menu-caret-icon--up" viewBox="0 0 12 12" fill="none"><path d="m2.5 7.75 3.5-3.5 3.5 3.5" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</span>' +
      '</div>' +
      '<ul class="ant-menu ant-menu-sub ant-menu-inline gaip-wealth-submenu" role="menu" hidden>' + views.map(function (view) {
        return '<li class="ant-menu-item ant-menu-item-only-child gaip-wealth-subitem" role="menuitem" tabindex="-1" data-wealth-view="' + view[0] + '" aria-selected="false"><span class="ant-menu-title-content"><a href="' + wealthHash(view[0]) + '">' + view[1] + '</a></span></li>';
      }).join('') + '</ul>';
    return group;
  }

  function insertGroup(menu, group) {
    var items = menu.querySelectorAll(':scope > li.ant-menu-item');
    var activity = null;
    var induction = null;
    Array.prototype.forEach.call(items, function (item) {
      var title = item.querySelector('.ant-menu-title-content');
      var label = title && title.textContent.trim();
      if (label === '活动中心') activity = item;
      if (label === '薄荷入职引导' || label === '薄荷入职指引') induction = item;
    });
    if (activity && activity.parentNode === menu) activity.insertAdjacentElement('afterend', group);
    else if (induction && induction.parentNode === menu) menu.insertBefore(group, induction);
    else menu.appendChild(group);
  }

  function bindGroup(group) {
    if (group.getAttribute('data-gaip-wealth-bound') === 'true') return;
    group.setAttribute('data-gaip-wealth-bound', 'true');
    group.addEventListener('click', function (event) {
      var toggle = event.target.closest('[data-wealth-menu-toggle]');
      var item = event.target.closest('[data-wealth-view]');
      var api = window.__GAIP_WEALTH_CENTER__;
      if (toggle) {
        event.preventDefault();
        if (!isWealthPage() && api) {
          group.setAttribute('data-wealth-menu-open', 'true');
          api.open('import-workbench');
        } else {
          group.setAttribute('data-wealth-menu-open', toggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
        }
        updateGroup(group);
        return;
      }
      if (item) {
        event.preventDefault();
        group.setAttribute('data-wealth-menu-open', 'true');
        if (api && typeof api.open === 'function') api.open(item.getAttribute('data-wealth-view'));
      }
    });
    group.addEventListener('keydown', function (event) {
      var toggle = event.target.closest('[data-wealth-menu-toggle]');
      if (toggle && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        toggle.click();
      }
    });
  }

  function bindChannelLeaving(menu) {
    if (menu.getAttribute('data-gaip-wealth-leave-bound') === 'true') return;
    menu.setAttribute('data-gaip-wealth-leave-bound', 'true');
    menu.addEventListener('click', function (event) {
      var api;
      if (!isWealthPage() || event.target.closest('.gaip-wealth-menu-group')) return;
      api = window.__GAIP_WEALTH_CENTER__;
      if (api && typeof api.closeForNavigation === 'function') api.closeForNavigation();
    }, true);
  }

  function updateGroup(group) {
    var preference = group.getAttribute('data-wealth-menu-open');
    var open = preference === 'true' || (preference !== 'false' && isWealthPage());
    var view = currentView();
    var toggle = group.querySelector('[data-wealth-menu-toggle]');
    var submenu = group.querySelector('.gaip-wealth-submenu');
    group.classList.toggle('is-current', isWealthPage());
    group.classList.toggle('is-open', open);
    group.classList.toggle('ant-menu-submenu-open', open);
    group.classList.toggle('ant-menu-submenu-selected', isWealthPage());
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    submenu.hidden = !open;

    Array.prototype.forEach.call(group.querySelectorAll('[data-wealth-view]'), function (item) {
      var selected = isWealthPage() && item.getAttribute('data-wealth-view') === view;
      item.classList.toggle('ant-menu-item-selected', selected);
      item.setAttribute('aria-selected', selected ? 'true' : 'false');
    });

    if (isWealthPage()) {
      var menu = group.parentElement;
      Array.prototype.forEach.call(menu.querySelectorAll('.ant-menu-item-selected'), function (item) {
        if (!group.contains(item)) {
          item.classList.remove('ant-menu-item-selected');
          item.setAttribute('aria-selected', 'false');
        }
      });
    }
  }

  function ensureNavigation() {
    var menu = document.querySelector('.ant-pro-sider-menu .ant-menu, .ant-layout-sider .ant-menu');
    var group;
    frame = 0;
    if (!menu) return;
    group = menu.querySelector('.gaip-wealth-menu-group');
    if (!group) {
      group = createGroup();
      insertGroup(menu, group);
    }
    bindGroup(group);
    bindChannelLeaving(menu);
    updateGroup(group);
  }

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(ensureNavigation);
  }

  schedule();
  window.addEventListener('hashchange', schedule);
  window.addEventListener('popstate', schedule);
  window.addEventListener('gaip:wealth-change', schedule);
  window.addEventListener('gaip:wealth-view-change', schedule);
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
