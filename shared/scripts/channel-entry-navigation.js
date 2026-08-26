(function () {
  'use strict';

  var scriptUrl = document.currentScript && document.currentScript.src;
  var entryRoot = scriptUrl
    ? new URL('../../', scriptUrl)
    : new URL('./', location.href);
  var channelConfig = window.__GAIP_CHANNEL_CONFIG__;
  var routeEntries = {};
  var documentSession = [
    Date.now().toString(36),
    Math.random().toString(36).slice(2)
  ].join('-');
  var syncFrame = 0;

  if (channelConfig) {
    channelConfig.list.forEach(function (channel) {
      if (!channel.virtual) routeEntries[channel.route] = channel.entry;
    });
  }

  function hashRoute() {
    return (location.hash || '')
      .replace(/^#/, '')
      .split('?')[0]
      .replace(/\/+$/, '') || '/';
  }

  function requestedVirtualChannel() {
    var query = (location.hash || '').split('?')[1] || '';
    var requestedKey = new URLSearchParams(query).get('gaip-channel') ||
      window.__GAIP_PAGE_OVERRIDE__ ||
      document.body.getAttribute('data-gaip-page');
    var channel = requestedKey && channelConfig && channelConfig.getByKey(requestedKey);
    return channel && channel.virtual ? channel : null;
  }

  function entryFile() {
    var virtualChannel = requestedVirtualChannel();
    if (virtualChannel) return virtualChannel.entry;
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
  window.addEventListener('gaip:wealth-change', scheduleEntrySync);
  window.addEventListener('gaip:news-change', scheduleEntrySync);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncEntryPath, { once: true });
  } else {
    syncEntryPath();
  }
})();
