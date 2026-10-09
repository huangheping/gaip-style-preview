/* @gaip-markup-cache:start */
// Generated from the owned templates/markup-*.html; run npm run build:templates.
var __gaipMarkup_e87e3f1d55 = (function () {
  var templates = {"updateBreadcrumb-1":"<ol><li><span class=\"ant-breadcrumb-link\">首页</span></li><li class=\"ant-breadcrumb-separator\" aria-hidden=\"true\">/</li><li><span class=\"ant-breadcrumb-link\">学习中心</span></li></ol>"};
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
  var syncRafId = 0;
  var boundsRafId = 0;
  var originalBreadcrumbHtml = null;
  var originalTitle = '';
  var lastLearningUrl = '';
  function createLearningPage() {
    var page = document.createElement('section');
    page.className = 'gaip-learning-page pageContainer___learning';
    page.setAttribute('data-gaip-page-root', 'learning');
    page.innerHTML = window.__GAIP_HTML_TEMPLATES__['learning-home'];
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
      __gaipMarkup_e87e3f1d55("updateBreadcrumb-1");
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
