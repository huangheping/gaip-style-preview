(function () {
  'use strict';

  var rafId = 0;
  var channelConfig = window.__GAIP_CHANNEL_CONFIG__;
  var navIconKeys = {};
  var learningIconMarkup =
    '<span class="gaip-main-nav-icon" data-gaip-nav-icon="learning"></span>';
  var channelRoutes = {};

  if (channelConfig) {
    channelConfig.list.forEach(function (channel) {
      var labels = [channel.label].concat(channel.aliases || []);
      labels.forEach(function (label) {
        navIconKeys[label] = channel.icon;
        if (!channel.virtual) channelRoutes[label] = channel.route;
      });
    });
  }

  function isLearningPage() {
    var api = window.__GAIP_LEARNING_CENTER__;
    return window.__GAIP_PAGE_OVERRIDE__ === 'learning' ||
      (api && api.isOpen()) ||
      document.body.getAttribute('data-gaip-page') === 'learning';
  }

  function requestedVirtualChannelKey() {
    var query = (location.hash || '').split('?')[1] || '';
    return new URLSearchParams(query).get('gaip-channel') ||
      window.__GAIP_PAGE_OVERRIDE__ || '';
  }

  function learningHash() {
    var baseHash = (location.hash || '#/workspace').split('?')[0] || '#/workspace';
    return baseHash + '?gaip-channel=learning';
  }

  function createLearningMenuItem(menu) {
    var sourceItems = menu.querySelectorAll('li.ant-menu-item');
    var sourceItem = sourceItems.length ? sourceItems[sourceItems.length - 1] : null;
    var item = sourceItem ? sourceItem.cloneNode(true) : document.createElement('li');

    if (!sourceItem) {
      item.className = 'ant-menu-item ant-menu-item-only-child';
    }

    item.classList.remove('ant-menu-item-selected', 'ant-menu-item-active');
    item.classList.add('gaip-learning-menu-item');
    item.removeAttribute('data-menu-id');
    item.setAttribute('data-gaip-channel', 'learning');
    item.setAttribute('role', 'menuitem');
    item.setAttribute('tabindex', '-1');
    item.setAttribute('aria-selected', 'false');

    menu.appendChild(item);
    return item;
  }

  function updateLearningMenuItem(item) {
    var title;
    var link;

    if (item.getAttribute('data-gaip-learning-structure-ready') !== 'true') {
      item.innerHTML =
        '<span class="ant-menu-title-content" data-gaip-learning-title-ready="true">' +
          '<a class="gaip-learning-menu-link" href="' + learningHash() + '">' +
            '<span class="ant-pro-base-menu-inline-item-title gaip-learning-menu-title">' +
              '<span class="ant-pro-base-menu-inline-item-icon gaip-learning-menu-icon" aria-hidden="true">' + learningIconMarkup + '</span>' +
              '<span class="ant-pro-base-menu-inline-item-text ant-pro-base-menu-inline-item-text-has-icon">学习中心</span>' +
            '</span>' +
          '</a>' +
        '</span>';
      item.setAttribute('data-gaip-learning-structure-ready', 'true');
    }

    title = item.querySelector('.ant-menu-title-content');
    link = title.querySelector('a');
    link.setAttribute('href', learningHash());

    if (item.getAttribute('data-gaip-learning-bound') !== 'true') {
      item.setAttribute('data-gaip-learning-bound', 'true');
      item.addEventListener('click', function (event) {
        var api = window.__GAIP_LEARNING_CENTER__;
        event.preventDefault();
        if (api && typeof api.open === 'function') api.open();
      });
    }
  }

  function updateMainNavigationIcons(menu) {
    Array.prototype.forEach.call(menu.querySelectorAll('li.ant-menu-item'), function (item) {
      var title = item.querySelector('.ant-menu-title-content');
      var label = title && title.textContent.trim();
      var iconKey = navIconKeys[label];
      var icon;

      if (!iconKey) return;

      icon = item.querySelector('.gaip-main-nav-icon');
      if (!icon) {
        icon = item.querySelector('.ant-pro-base-menu-inline-item-icon > span');
      }
      if (!icon) return;

      icon.removeAttribute('style');
      icon.classList.add('gaip-main-nav-icon');
      icon.setAttribute('data-gaip-nav-icon', iconKey);
      icon.setAttribute('aria-hidden', 'true');
    });
  }

  function updateSelectedState(menu, item) {
    var currentPath;
    var matchedRoute;
    var virtualKey = requestedVirtualChannelKey();
    if (virtualKey && virtualKey !== 'learning') return;
    if (isLearningPage()) {
      Array.prototype.forEach.call(menu.querySelectorAll('.ant-menu-item-selected'), function (selectedItem) {
        if (selectedItem === item) return;
        selectedItem.classList.remove('ant-menu-item-selected');
        selectedItem.setAttribute('aria-selected', 'false');
      });
      item.classList.add('ant-menu-item-selected');
      item.setAttribute('aria-selected', 'true');
      return;
    }

    currentPath = (location.hash || '#/workspace')
      .replace(/^#/, '')
      .split('?')[0]
      .replace(/\/+$/, '') || '/workspace';
    matchedRoute = Object.keys(channelRoutes).some(function (label) {
      var route = channelRoutes[label];
      return currentPath === route || currentPath.indexOf(route + '/') === 0;
    });

    Array.prototype.forEach.call(menu.querySelectorAll('li.ant-menu-item'), function (menuItem) {
      var title = menuItem.querySelector('.ant-menu-title-content');
      var label = title && title.textContent.trim();
      var route = label && channelRoutes[label];
      var selected = matchedRoute &&
        (currentPath === route || currentPath.indexOf(route + '/') === 0);

      menuItem.classList.toggle('ant-menu-item-selected', selected);
      menuItem.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
  }

  function bindChannelSwitching(menu) {
    if (menu.getAttribute('data-gaip-learning-nav-bound') === 'true') return;
    menu.setAttribute('data-gaip-learning-nav-bound', 'true');

    menu.addEventListener('click', function (event) {
      var item;
      var title;
      var targetPath;
      var api;
      if (!isLearningPage()) return;

      item = event.target.closest('li.ant-menu-item');
      if (!item || item.classList.contains('gaip-learning-menu-item')) return;

      title = item.querySelector('.ant-menu-title-content');
      targetPath = title && channelRoutes[title.textContent.trim()];
      api = window.__GAIP_LEARNING_CENTER__;
      if (targetPath && api && typeof api.closeForNavigation === 'function') {
        api.closeForNavigation(targetPath);
      }
    }, true);
  }

  function ensureLearningMenu() {
    var menu = document.querySelector('.ant-pro-sider-menu .ant-menu, .ant-layout-sider .ant-menu');
    var item;
    rafId = 0;
    if (!menu) return;

    item = menu.querySelector('.gaip-learning-menu-item') || createLearningMenuItem(menu);
    updateLearningMenuItem(item);
    updateMainNavigationIcons(menu);
    updateSelectedState(menu, item);
    bindChannelSwitching(menu);
  }

  function scheduleEnsure() {
    if (rafId) return;
    rafId = requestAnimationFrame(ensureLearningMenu);
  }

  scheduleEnsure();
  window.addEventListener('hashchange', scheduleEnsure);
  window.addEventListener('popstate', scheduleEnsure);
  window.addEventListener('gaip:learning-change', scheduleEnsure);

  new MutationObserver(scheduleEnsure).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
