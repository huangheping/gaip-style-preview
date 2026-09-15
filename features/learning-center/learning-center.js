(function () {
  'use strict';
  var syncRafId = 0;
  var boundsRafId = 0;
  var originalBreadcrumbHtml = null;
  var originalTitle = '';
  var lastLearningUrl = '';
  function createLearningPage() {
    var page = document.createElement('section');
    page.className = 'gaip-learning-page pageContainer___learning';
    page.setAttribute('data-gaip-page-root', 'learning');
    page.innerHTML =
      '<div class="gaip-course-list-view">' +
        '<header class="gaip-learning-header">' +
          '<div>' +
            '<h1 class="gaip-learning-title">学习中心</h1>' +
            '<p class="gaip-learning-subtitle">精选行业优质课程，赋能展业技能升级，助力您为客户提供更专业的财富与保障服务</p>' +
          '</div>' +
          '<div class="gaip-learning-actions">' +
            '<button class="gaip-learning-action gaip-learning-action--progress" type="button" data-learning-action="学情管理">' +
              '<svg class="gaip-learning-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                '<path d="M10.6 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v5.6"></path>' +
                '<path d="m14.305 19.53.923-.382"></path>' +
                '<path d="M15 3v7.6"></path>' +
                '<path d="m15.229 16.852-.924-.383"></path>' +
                '<path d="m16.852 15.228-.383-.923"></path>' +
                '<path d="m16.852 20.772-.383.924"></path>' +
                '<path d="m19.148 15.228.383-.923"></path>' +
                '<path d="m19.53 21.696-.382-.924"></path>' +
                '<path d="m20.773 16.852.922-.383"></path>' +
                '<path d="m20.773 19.148.922.383"></path>' +
                '<path d="M9 3v18"></path>' +
                '<circle cx="18" cy="18" r="3"></circle>' +
              '</svg>' +
              '<span>学情管理</span>' +
            '</button>' +
            '<button class="gaip-learning-action gaip-learning-action--course" type="button" data-learning-action="课程管理">' +
              '<svg class="gaip-learning-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                '<path d="M12 17v4"></path>' +
                '<path d="m14.305 7.53.923-.382"></path>' +
                '<path d="m15.228 4.852-.923-.383"></path>' +
                '<path d="m16.852 3.228-.383-.924"></path>' +
                '<path d="m16.852 8.772-.383.923"></path>' +
                '<path d="m19.148 3.228.383-.924"></path>' +
                '<path d="m19.53 9.696-.382-.924"></path>' +
                '<path d="m20.772 4.852.924-.383"></path>' +
                '<path d="m20.772 7.148.924.383"></path>' +
                '<path d="M22 13v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h7"></path>' +
                '<path d="M8 21h8"></path>' +
                '<circle cx="18" cy="6" r="3"></circle>' +
              '</svg>' +
              '<span>课程管理</span>' +
            '</button>' +
          '</div>' +
        '</header>' +
        '<div class="gaip-learning-scroll">' +
          '<div class="gaip-learning-grid">' + '' + '</div>' +
        '</div>' +
      '</div>' +
      '';
    return page;
  }

  function currentBaseHash() {
    var hash = location.hash || '#/workspace';
    return hash.split('?')[0] || '#/workspace';
  }

  function learningRequested() {
    var hash = location.hash || '';
    var queryIndex = hash.indexOf('?');
    if (window.__GAIP_PAGE_OVERRIDE__ === 'learning') return true;
    if (queryIndex < 0) return false;
    return new URLSearchParams(hash.slice(queryIndex + 1)).get('gaip-channel') === 'learning';
  }

  function updateBreadcrumb(force) {
    var controller = window.__GAIP_BREADCRUMB__;
    var breadcrumb = document.querySelector('.ant-breadcrumb');
    if (controller) {
      var app = window.__GAIP_LEARNING_APP__;
      if (app && app.syncBreadcrumb) app.syncBreadcrumb();
      else controller.clearDetail('learning');
      controller.refresh();
      return;
    }
    if (!breadcrumb) return;
    if (originalBreadcrumbHtml === null) originalBreadcrumbHtml = breadcrumb.innerHTML;
    if (!force && breadcrumb.getAttribute('data-gaip-learning') === 'true') return;

    breadcrumb.setAttribute('data-gaip-learning', 'true');
    breadcrumb.innerHTML =
      '<ol>' +
        '<li><span class="ant-breadcrumb-link">首页</span></li>' +
        '<li class="ant-breadcrumb-separator" aria-hidden="true">/</li>' +
        '<li><span class="ant-breadcrumb-link">学习中心</span></li>' +
      '</ol>';
  }

  function restoreBreadcrumb() {
    var controller = window.__GAIP_BREADCRUMB__;
    var breadcrumb = document.querySelector('.ant-breadcrumb');
    if (controller) {
      controller.clearDetail('learning');
      controller.refresh();
      return;
    }
    if (!breadcrumb || originalBreadcrumbHtml === null) return;
    breadcrumb.innerHTML = originalBreadcrumbHtml;
    breadcrumb.removeAttribute('data-gaip-learning');
    originalBreadcrumbHtml = null;
  }

  function updateOverlayBounds() {
    var page = document.querySelector('.gaip-learning-page[data-gaip-learning-overlay="true"]');
    var header = document.querySelector('[class*="header___tcVAl"]');
    var sidebar = document.querySelector('.ant-layout-sider');
    var headerRect;
    var sidebarRect;
    var sidebarWidth;
    var pageWidth;
    boundsRafId = 0;
    if (!page || !header || !sidebar) return;

    headerRect = header.getBoundingClientRect();
    sidebarRect = sidebar.getBoundingClientRect();
    sidebarWidth = Math.max(0, Math.round(sidebarRect.width));
    pageWidth = Math.max(1440, window.innerWidth) - sidebarWidth;
    page.style.top = Math.max(0, Math.round(headerRect.height)) + 'px';
    page.style.left = sidebarWidth + 'px';
    page.style.width = pageWidth + 'px';
    page.style.height = Math.max(0, window.innerHeight - Math.round(headerRect.height)) + 'px';
    page.style.setProperty(
      '--gaip-learning-min-page-width',
      Math.max(0, 1440 - sidebarWidth) + 'px'
    );
  }

  function scheduleBoundsUpdate() {
    if (boundsRafId) return;
    boundsRafId = requestAnimationFrame(updateOverlayBounds);
  }

  function notifyLearningChange(open) {
    window.dispatchEvent(new CustomEvent('gaip:learning-change', {
      detail: { open: open }
    }));
    if (typeof window.__GAIP_APPLY_STRUCTURE_NAMES__ === 'function') {
      window.__GAIP_APPLY_STRUCTURE_NAMES__();
    }
  }

  function lockUnderlyingPageScroll() {
    if (document.documentElement.classList.contains('gaip-learning-scroll-lock')) return;
    document.documentElement.classList.add('gaip-learning-scroll-lock');
    window.scrollTo(window.scrollX, 0);
  }

  function unlockUnderlyingPageScroll() {
    document.documentElement.classList.remove('gaip-learning-scroll-lock');
  }

  function mountLearningCenter() {
    var header = document.querySelector('[class*="header___tcVAl"]');
    var sidebar = document.querySelector('.ant-layout-sider');
    var page = document.querySelector('.gaip-learning-page[data-gaip-learning-overlay="true"]');
    var detailOpen;
    if (!header || !sidebar) return false;

    if (!page) {
      page = createLearningPage();
      page.setAttribute('data-gaip-learning-overlay', 'true');
      document.body.appendChild(page);
      window.__GAIP_LEARNING_APP__.mount(page);
    }

    detailOpen = [
      '.gaip-course-detail-page',
      '.gaip-course-player-page',
      '.gaip-course-reader-page'
    ].some(function (selector) {
      var view = page.querySelector(selector);
      return view && !view.hidden;
    });

    if (!originalTitle) originalTitle = document.title;
    lastLearningUrl = location.href;
    lockUnderlyingPageScroll();
    if (!detailOpen) updateBreadcrumb(true);
    scheduleBoundsUpdate();
    document.title = '学习中心 - GAIP 本地原样版';
    document.body.setAttribute('data-gaip-page', 'learning');
    document.body.setAttribute('data-gaip-page-label', '学习中心');
    notifyLearningChange(true);
    return true;
  }

  function unmountLearningCenter() {
    var page = document.querySelector('.gaip-learning-page[data-gaip-learning-overlay="true"]');
    var toast = document.querySelector('.gaip-learning-toast');
    if (page) { window.__GAIP_LEARNING_APP__.destroy(); page.remove(); }
    if (toast) toast.remove();

    unlockUnderlyingPageScroll();
    restoreBreadcrumb();
    if (originalTitle) {
      document.title = originalTitle;
      originalTitle = '';
    }
    if (document.body.getAttribute('data-gaip-page') === 'learning') {
      document.body.removeAttribute('data-gaip-page');
      document.body.removeAttribute('data-gaip-page-label');
    }
    notifyLearningChange(false);
  }

  function openFromNavigation() {
    var nextHash = currentBaseHash() + '?gaip-channel=learning';
    if (location.hash !== nextHash) {
      history.pushState({ gaipChannel: 'learning' }, '', location.pathname + location.search + nextHash);
    }
    mountLearningCenter();
  }

  function closeForNavigation(targetPath) {
    var baseHash = currentBaseHash();
    if (window.__GAIP_PAGE_OVERRIDE__ === 'learning') {
      window.__GAIP_PAGE_OVERRIDE__ = '';
    }
    if (targetPath && baseHash.replace(/^#/, '') === targetPath && location.hash !== baseHash) {
      history.replaceState(null, '', location.pathname + location.search + baseHash);
    }
    unmountLearningCenter();
  }

  function syncFromLocation() {
    syncRafId = 0;
    if (learningRequested()) {
      mountLearningCenter();
    } else {
      var app = window.__GAIP_LEARNING_APP__;
      if (lastLearningUrl && app && !app.canLeave()) {
        var destination = location.href;
        // Hash history cannot be cancelled. Restore the learning location while
        // the shared three-way confirmation decides whether it may be left.
        history.replaceState(history.state, '', lastLearningUrl);
        window.dispatchEvent(new Event('hashchange'));
        app.requestLeave(function () {
          history.replaceState(null, '', destination);
          unmountLearningCenter();
          window.dispatchEvent(new Event('hashchange'));
        });
        return;
      }
      unmountLearningCenter();
    }
  }

  function scheduleSync() {
    if (syncRafId) return;
    syncRafId = requestAnimationFrame(syncFromLocation);
  }

  window.__GAIP_LEARNING_CENTER__ = {
    open: openFromNavigation,
    closeForNavigation: closeForNavigation,
    isOpen: function () {
      return !!document.querySelector('.gaip-learning-page[data-gaip-learning-overlay="true"]');
    },
    sync: scheduleSync
  };

  function start() {
    var root = document.getElementById('root');
    if (root) {
      new MutationObserver(function () {
        if (learningRequested()) scheduleSync();
        if (window.__GAIP_LEARNING_CENTER__.isOpen()) scheduleBoundsUpdate();
      }).observe(root, { childList: true, subtree: true });
    }

    window.addEventListener('resize', scheduleBoundsUpdate);
    window.addEventListener('popstate', scheduleSync);
    window.addEventListener('hashchange', scheduleSync);
    scheduleSync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
