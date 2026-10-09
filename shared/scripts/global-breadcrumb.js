/* @gaip-markup-cache:start */
// Generated from the owned templates/markup-*.html; run npm run build:templates.
var __gaipMarkup_e817834a30 = (function () {
  var templates = {"createItem-1":"<a href=\"{{gaip:0}}\" data-gaip-breadcrumb-link=\"{{gaip:1}}\">{{gaip:2}}</a>","createItem-2":"<button type=\"button\" data-gaip-breadcrumb-action=\"{{gaip:0}}\">{{gaip:1}}</button>","createItem-3":"<span{{gaip:0}}>{{gaip:1}}</span>","createItem-4":"<li class=\"{{gaip:0}}\"><span class=\"ant-breadcrumb-link\">{{gaip:1}}</span></li>","createMarkup-5":"<ol>{{gaip:0}}</ol>","createMarkup-6":"<li class=\"ant-breadcrumb-separator\" aria-hidden=\"true\">/</li>"};
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

  var channelConfig = window.__GAIP_CHANNEL_CONFIG__;
  var detailState = {};
  var observer = null;
  var rafId = 0;

  if (!channelConfig) return;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function routePath() {
    return (location.hash || '#/workspace')
      .replace(/^#/, '')
      .split('?')[0]
      .replace(/\/+$/, '') || '/workspace';
  }

  function requestedVirtualChannel() {
    var rawHash = location.hash || '';
    var queryIndex = rawHash.indexOf('?');
    var key = window.__GAIP_PAGE_OVERRIDE__ || '';
    var channel;
    if (!key && queryIndex >= 0) {
      key = new URLSearchParams(rawHash.slice(queryIndex + 1)).get('gaip-channel') || '';
    }
    channel = key && channelConfig.getByKey(key);
    return channel && channel.virtual ? channel : null;
  }

  function currentChannel() {
    var path;
    var exact;
    var virtualChannel = requestedVirtualChannel();
    if (virtualChannel) return virtualChannel;
    path = routePath();
    exact = channelConfig.getByRoute(path);
    if (exact) return exact;

    return channelConfig.list.find(function (channel) {
      return !channel.virtual && path.indexOf(channel.route + '/') === 0;
    }) || null;
  }

  function createItem(item, isCurrent) {
    var content;
    var currentAttribute = isCurrent ? ' aria-current="page"' : '';
    var itemClass = 'ant-breadcrumb-item' +
      (isCurrent ? ' gaip-breadcrumb-item--current' : '');

    if (item.href) {
      content = __gaipMarkup_e817834a30("createItem-1", [('' + (escapeHtml(item.href))), ('' + (escapeHtml(item.key || ''))), ('' + (escapeHtml(item.label)))]);
    } else if (item.action) {
      content = __gaipMarkup_e817834a30("createItem-2", [('' + (escapeHtml(item.action))), ('' + (escapeHtml(item.label)))]);
    } else {
      content = __gaipMarkup_e817834a30("createItem-3", [('' + (currentAttribute)), ('' + (escapeHtml(item.label)))]);
    }

    return __gaipMarkup_e817834a30("createItem-4", [('' + (itemClass)), ('' + (content))]);
  }

  function createMarkup(items) {
    return __gaipMarkup_e817834a30("createMarkup-5", [('' + (items.map(function (item, index) {
      var markup = createItem(item, index === items.length - 1);
      if (index === items.length - 1) return markup;
      return markup +
        __gaipMarkup_e817834a30("createMarkup-6");
    }).join('')))]);
  }

  function bindActions(breadcrumb, detail, channel) {
    var workspace = channelConfig.getByKey('workspace');
    var rootLink = breadcrumb.querySelector(
      '[data-gaip-breadcrumb-link="workspace"]'
    );
    var parentButton = breadcrumb.querySelector(
      '[data-gaip-breadcrumb-action="channel-parent"]'
    );

    if (rootLink && channel && channel.virtual) {
      rootLink.addEventListener('click', function (event) {
        var virtualApis = window.__GAIP_VIRTUAL_CHANNELS__ || {};
        var virtualApi = virtualApis[channel.key] ||
          (channel.key === 'learning' ? window.__GAIP_LEARNING_CENTER__ : null);
        var targetHash = '#' + workspace.route;
        event.preventDefault();

        if (virtualApi && typeof virtualApi.closeForNavigation === 'function') {
          virtualApi.closeForNavigation(workspace.route);
        }
        if (location.hash !== targetHash) location.hash = targetHash;
        scheduleRender();
      });
    }

    if (!parentButton || !detail || typeof detail.onParentClick !== 'function') return;
    parentButton.addEventListener('click', detail.onParentClick);
  }

  function render() {
    var breadcrumb;
    var channel;
    var workspace;
    var detail;
    var items;
    var signature;
    var currentMarker;

    rafId = 0;
    breadcrumb = document.querySelector('.ant-breadcrumb');
    channel = currentChannel();
    if (!breadcrumb || !channel) return;

    workspace = channelConfig.getByKey('workspace');
    detail = detailState[channel.key] || null;
    items = [];

    if (channel.key === 'workspace') {
      items.push({ key: workspace.key, label: workspace.label });
    } else {
      items.push({
        key: workspace.key,
        label: workspace.label,
        href: '#' + workspace.route
      });
      items.push({
        key: channel.key,
        label: channel.label,
        action: detail && detail.onParentClick ? 'channel-parent' : ''
      });
    }

    if (detail) items.push({ label: detail.label });

    signature = items.map(function (item) {
      return [item.key || '', item.label, item.href || '', item.action || ''].join(':');
    }).join('|');
    currentMarker = breadcrumb.querySelector('[aria-current="page"]');

    if (breadcrumb.getAttribute('data-gaip-breadcrumb-signature') === signature &&
        currentMarker &&
        currentMarker.textContent.trim() === items[items.length - 1].label) {
      return;
    }

    breadcrumb.setAttribute('aria-label', '面包屑');
    breadcrumb.setAttribute('data-gaip-breadcrumb-managed', 'true');
    breadcrumb.setAttribute('data-gaip-breadcrumb-channel', channel.key);
    breadcrumb.setAttribute('data-gaip-breadcrumb-signature', signature);
    breadcrumb.innerHTML = createMarkup(items);
    bindActions(breadcrumb, detail, channel);
  }

  function scheduleRender() {
    if (rafId) return;
    rafId = requestAnimationFrame(render);
  }

  window.__GAIP_BREADCRUMB__ = {
    refresh: scheduleRender,
    setDetail: function (pageKey, label, onParentClick) {
      detailState[pageKey] = {
        label: label,
        onParentClick: onParentClick
      };
      scheduleRender();
    },
    clearDetail: function (pageKey) {
      delete detailState[pageKey];
      scheduleRender();
    }
  };

  window.addEventListener('hashchange', scheduleRender);
  window.addEventListener('popstate', scheduleRender);
  window.addEventListener('gaip:learning-change', scheduleRender);
  window.addEventListener('gaip:wealth-change', scheduleRender);
  window.addEventListener('gaip:news-change', scheduleRender);

  observer = new MutationObserver(scheduleRender);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  scheduleRender();
})();
