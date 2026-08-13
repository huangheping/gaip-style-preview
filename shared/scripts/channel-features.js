(function () {
  'use strict';

  var config = window.__GAIP_CHANNEL_CONFIG__;
  var scriptUrl = document.currentScript && document.currentScript.src;
  var root = scriptUrl ? new URL('../../', scriptUrl) : new URL('./', location.href);
  var loaded = Object.create(null);

  if (!config) return;

  // 此脚本在 Umi 主包之后执行，统一暴露改版模块可能需要的运行时。
  self.webpackChunk = self.webpackChunk || [];
  self.webpackChunk.push([['gaip-channel-feature-bridge'], {}, function (webpackRequire) {
    window.__GAIP_WEBPACK_REQUIRE__ = webpackRequire;
  }]);

  function assetUrl(path) {
    return new URL(path, root).href;
  }

  function loadStyle(path, channelKey) {
    var url = assetUrl(path);
    var link;
    if (loaded[url] || document.querySelector('link[href="' + url + '"]')) return;
    loaded[url] = true;
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.setAttribute('data-gaip-feature', channelKey);
    document.head.appendChild(link);
  }

  function loadScript(path, channelKey) {
    var url = assetUrl(path);
    var script;
    if (loaded[url] || document.querySelector('script[src="' + url + '"]')) return;
    loaded[url] = true;
    script = document.createElement('script');
    script.src = url;
    script.async = false;
    script.setAttribute('data-gaip-feature', channelKey);
    script.addEventListener('error', function () {
      document.documentElement.setAttribute('data-gaip-feature-error', channelKey);
    }, { once: true });
    document.head.appendChild(script);
  }

  // Hash 路由不会重新读取另一个 HTML，因此所有频道改版资源必须在当前
  // 文档中可用。统一预加载后，任意入口都能保持 Umi 的无刷新切换。
  config.list.forEach(function (channel) {
    var assets = channel.assets || {};
    (assets.styles || []).forEach(function (path) {
      loadStyle(path, channel.key);
    });
    (assets.scripts || []).forEach(function (path) {
      loadScript(path, channel.key);
    });
  });

  document.documentElement.setAttribute('data-gaip-channel-features', 'ready');
})();
