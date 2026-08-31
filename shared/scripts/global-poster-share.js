(function () {
  'use strict';

  var script = document.currentScript;
  var componentUrl = script && script.src
    ? new URL('../../全局组件/海报分享/index.html?embed=1', script.src).href
    : './全局组件/海报分享/index.html?embed=1';
  var root = null;
  var frame = null;
  var ready = false;
  var currentArticle = null;

  function normalizeArticle(article) {
    article = article || {};
    return {
      id: article.id == null ? '' : String(article.id),
      title: article.title || '企业主传承讨论前置，信托架构更强调治理规则',
      summary: article.summary || '越来越多企业主把家族治理、企业股权和现金流安排同时纳入传承设计，单一资产隔离已不能满足复杂需求。',
      category: article.category || '家族信托',
      tags: Array.isArray(article.tags) ? article.tags.join(' / ') : (article.tags || '受益人安排 / 企业传承'),
      date: article.date || '2026-08-26 21:00',
      score: article.score == null ? '89' : String(article.score),
      slot: article.slot || '夜间深度',
      featured: Boolean(article.featured)
    };
  }

  function sendArticle() {
    if (!ready || !frame || !frame.contentWindow || !currentArticle) return;
    frame.contentWindow.postMessage({
      type: 'gaip-poster-share:update',
      article: currentArticle
    }, window.location.protocol === 'file:' ? '*' : window.location.origin);
  }

  function ensureRoot() {
    if (root) return root;
    root = document.createElement('div');
    root.className = 'gaip-global-poster-share-root';
    root.setAttribute('data-gaip-global-poster-share', 'true');
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML =
      '<div class="gaip-global-poster-share-backdrop" data-gaip-poster-share-backdrop>' +
        '<div class="gaip-global-poster-share-panel" role="dialog" aria-modal="true" aria-label="分享海报" data-gaip-poster-share-panel>' +
          '<iframe class="gaip-global-poster-share-frame" title="GAIP 文章海报分享" data-gaip-poster-share-frame></iframe>' +
          '<div class="gaip-global-poster-share-loading" aria-live="polite">正在加载海报模板...</div>' +
        '</div>' +
      '</div>';
    root.addEventListener('click', function (event) {
      if (event.target.matches('[data-gaip-poster-share-backdrop]')) close();
    });
    frame = root.querySelector('[data-gaip-poster-share-frame]');
    document.body.appendChild(root);
    return root;
  }

  function ensureFrame() {
    ensureRoot();
    if (frame.getAttribute('src')) return;
    ready = false;
    root.classList.add('is-loading');
    frame.setAttribute('src', componentUrl);
  }

  function open(article) {
    currentArticle = normalizeArticle(article);
    ensureFrame();
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('gaip-poster-share-scroll-lock');
    sendArticle();
  }

  function close(options) {
    var wasOpen = Boolean(root && root.classList.contains('is-open'));
    if (root) {
      root.classList.remove('is-open');
      root.setAttribute('aria-hidden', 'true');
    }
    document.documentElement.classList.remove('gaip-poster-share-scroll-lock');
    if (wasOpen && (!options || options.notify !== false)) {
      window.dispatchEvent(new CustomEvent('gaip:poster-share-close'));
    }
  }

  function update(article) {
    currentArticle = normalizeArticle(article);
    sendArticle();
  }

  function handleMessage(event) {
    if (!frame || event.source !== frame.contentWindow || !event.data) return;
    if (event.data.type === 'gaip-poster-share:ready') {
      ready = true;
      if (root) root.classList.remove('is-loading');
      sendArticle();
      return;
    }
    if (event.data.type === 'gaip-poster-share:close') {
      close();
    }
  }

  window.addEventListener('message', handleMessage);
  window.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && root && root.classList.contains('is-open')) close();
  });
  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-gaip-poster-share-trigger]');
    if (trigger) open();
  });

  window.__GAIP_POSTER_SHARE__ = {
    open: open,
    close: close,
    update: update,
    isOpen: function () { return Boolean(root && root.classList.contains('is-open')); }
  };
}());
