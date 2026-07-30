(function () {
  'use strict';

  var scriptUrl = document.currentScript && document.currentScript.src;
  var entryRoot = scriptUrl
    ? new URL('../../', scriptUrl)
    : new URL('./', location.href);
  var routeEntries = {
    '/workspace': '工作台.html',
    '/customer': '客户中心360.html',
    '/policy': '保单列表.html',
    '/proposal': '方案中心.html',
    '/product': '产品中心.html',
    '/activity': '活动中心.html',
    '/induction': '薄荷入职指引.html',
    '/clues': '线索中心.html'
  };
  var documentSession = [
    Date.now().toString(36),
    Math.random().toString(36).slice(2)
  ].join('-');
  var syncFrame = 0;

  function hashRoute() {
    return (location.hash || '')
      .replace(/^#/, '')
      .split('?')[0]
      .replace(/\/+$/, '') || '/';
  }

  function learningRequested() {
    var query = (location.hash || '').split('?')[1] || '';
    return new URLSearchParams(query).get('gaip-channel') === 'learning'
      || window.__GAIP_PAGE_OVERRIDE__ === 'learning'
      || document.body.getAttribute('data-gaip-page') === 'learning';
  }

  function entryFile() {
    if (learningRequested()) return '学习中心.html';
    return routeEntries[hashRoute()] || null;
  }

  function syncEntryPath() {
    var file = entryFile();
    var targetUrl;
    if (!file) return;

    targetUrl = new URL(file, entryRoot);
    targetUrl.search = location.search;
    targetUrl.hash = location.hash;

    if (location.pathname === targetUrl.pathname) {
      document.documentElement.setAttribute('data-gaip-entry-sync', 'ready');
      return;
    }

    try {
      history.replaceState(history.state, document.title, targetUrl.href);
      document.documentElement.setAttribute('data-gaip-entry-sync', 'ready');
    } catch (error) {
      // file:// 预览可能不允许跨文件名 replaceState；频道 Hash 路由仍可无刷新切换。
      document.documentElement.setAttribute('data-gaip-entry-sync', 'unsupported');
    }
  }

  function scheduleEntrySync() {
    if (syncFrame) return;
    syncFrame = requestAnimationFrame(function () {
      syncFrame = 0;
      syncEntryPath();
    });
  }

  function observeHistoryChanges() {
    ['pushState', 'replaceState'].forEach(function (methodName) {
      var original = history[methodName];
      if (original.__gaipEntrySyncWrapped) return;

      function observedHistoryChange() {
        var result = original.apply(this, arguments);
        scheduleEntrySync();
        return result;
      }

      observedHistoryChange.__gaipEntrySyncWrapped = true;
      history[methodName] = observedHistoryChange;
    });
  }

  document.documentElement.setAttribute('data-gaip-entry-root', entryRoot.href);
  document.documentElement.setAttribute('data-gaip-document-session', documentSession);
  window.__GAIP_CHANNEL_ENTRY_ROOT__ = entryRoot.href;

  observeHistoryChanges();
  window.addEventListener('hashchange', scheduleEntrySync);
  window.addEventListener('popstate', scheduleEntrySync);
  window.addEventListener('gaip:learning-change', scheduleEntrySync);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncEntryPath, { once: true });
  } else {
    syncEntryPath();
  }
})();
