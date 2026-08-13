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

  function learningRequested() {
    var rawHash = location.hash || '';
    var queryIndex = rawHash.indexOf('?');
    if (window.__GAIP_PAGE_OVERRIDE__ === 'learning') return true;
    if (queryIndex < 0) return false;
    return new URLSearchParams(rawHash.slice(queryIndex + 1))
      .get('gaip-channel') === 'learning';
  }

  function currentChannel() {
    var path;
    var exact;
    if (learningRequested()) return channelConfig.getByKey('learning');
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
      content = '<a href="' + escapeHtml(item.href) +
        '" data-gaip-breadcrumb-link="' + escapeHtml(item.key || '') + '">' +
        escapeHtml(item.label) + '</a>';
    } else if (item.action) {
      content = '<button type="button" data-gaip-breadcrumb-action="' +
        escapeHtml(item.action) + '">' + escapeHtml(item.label) + '</button>';
    } else {
      content = '<span' + currentAttribute + '>' + escapeHtml(item.label) + '</span>';
    }

    return '<li class="' + itemClass + '">' +
      '<span class="ant-breadcrumb-link">' + content + '</span>' +
      '</li>';
  }

  function createMarkup(items) {
    return '<ol>' + items.map(function (item, index) {
      var markup = createItem(item, index === items.length - 1);
      if (index === items.length - 1) return markup;
      return markup +
        '<li class="ant-breadcrumb-separator" aria-hidden="true">/</li>';
    }).join('') + '</ol>';
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
        var learningApi = window.__GAIP_LEARNING_CENTER__;
        var targetHash = '#' + workspace.route;
        event.preventDefault();

        if (learningApi && typeof learningApi.closeForNavigation === 'function') {
          learningApi.closeForNavigation(workspace.route);
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

  observer = new MutationObserver(scheduleRender);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  scheduleRender();
})();
