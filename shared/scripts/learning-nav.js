(function () {
  'use strict';

  var rafId = 0;
  var learningIconMarkup =
    '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<line x1="9" y1="4" x2="9" y2="9.25" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"></line>' +
      '<line x1="12" y1="5.5" x2="12" y2="7.75" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"></line>' +
      '<path d="M3 14.125V2.875A1.875 1.875 0 014.875 1h9.375a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H4.875a1.875 1.875 0 110-3.75H15" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"></path>' +
      '<line x1="6" y1="5.5" x2="6" y2="7.75" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"></line>' +
    '</svg>';
  var channelRoutes = {
    '工作台总览': '/workspace',
    '客户中心360': '/customer',
    '保单列表': '/policy',
    '方案中心': '/proposal',
    '产品中心': '/product',
    '活动中心': '/activity',
    '薄荷入职引导': '/induction',
    '薄荷入职指引': '/induction',
    '线索中心': '/clues'
  };
  function isLearningPage() {
    var api = window.__GAIP_LEARNING_CENTER__;
    return window.__GAIP_PAGE_OVERRIDE__ === 'learning' ||
      (api && api.isOpen()) ||
      document.body.getAttribute('data-gaip-page') === 'learning';
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
    var icon = item.querySelector('.ant-menu-item-icon');
    var title = item.querySelector('.ant-menu-title-content');
    var link;

    if (!icon) {
      icon = document.createElement('span');
      item.insertBefore(icon, item.firstChild);
    }
    icon.className = 'ant-menu-item-icon gaip-learning-menu-icon';
    icon.removeAttribute('style');
    icon.setAttribute('aria-hidden', 'true');
    if (icon.getAttribute('data-gaip-learning-icon-ready') !== 'true') {
      icon.innerHTML = learningIconMarkup;
      icon.setAttribute('data-gaip-learning-icon-ready', 'true');
    }

    if (!title) {
      title = document.createElement('span');
      title.className = 'ant-menu-title-content';
      item.appendChild(title);
    }

    link = title.querySelector('a');
    if (!link) {
      title.textContent = '';
      link = document.createElement('a');
      title.appendChild(link);
    }
    link.setAttribute('href', learningHash());
    if (link.textContent !== '学习中心') link.textContent = '学习中心';

    if (item.getAttribute('data-gaip-learning-bound') !== 'true') {
      item.setAttribute('data-gaip-learning-bound', 'true');
      item.addEventListener('click', function (event) {
        var api = window.__GAIP_LEARNING_CENTER__;
        event.preventDefault();
        if (api && typeof api.open === 'function') api.open();
      });
    }
  }

  function updateSelectedState(menu, item) {
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

    item.classList.remove('ant-menu-item-selected');
    item.setAttribute('aria-selected', 'false');
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
