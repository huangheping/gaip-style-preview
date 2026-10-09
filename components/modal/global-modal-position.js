(function (global) {
  'use strict';

  if (global.__GAIP_MODAL_POSITION__) return;

  var placementAttribute = 'data-gaip-modal-placement';
  var candidateSelector = [
    '.ant-modal-wrap',
    'dialog',
    '.gaip-ai-notice-backdrop',
    '.gaip-global-poster-share-backdrop',
    '.gaip-news-bridge-backdrop',
    '.gaip-owner-overlay',
    '.gaip-owner-confirm-overlay',
    '.gaip-file-overlay',
    '.gaip-activity-modal',
    '.gaip-wealth-modal-layer',
    '.gaip-bulk-confirm-layer',
    '.gaip-adjust-confirm-layer'
  ].join(',');

  function isAgentMain(element) {
    if (!element || element.nodeType !== 1) return false;
    return element.matches('.agentModal___Nxp06') ||
      !!element.closest('.agentModal___Nxp06') ||
      !!element.querySelector('.agentModal___Nxp06');
  }

  function isDrawer(element) {
    return element.matches('.ant-drawer, .ant-drawer-wrap, .ant-drawer-root, [class*="drawer" i]') ||
      !!element.closest('.ant-drawer, .ant-drawer-wrap, .ant-drawer-root');
  }

  function adopt(element) {
    if (!element || element.nodeType !== 1) return null;
    if (isAgentMain(element) || isDrawer(element)) {
      element.removeAttribute(placementAttribute);
      return null;
    }
    element.setAttribute(placementAttribute, 'center');
    return element;
  }

  function scan(root) {
    if (!root || root.nodeType !== 1) return [];
    var adopted = [];
    var direct = root.matches(candidateSelector) ? adopt(root) : null;
    if (direct) adopted.push(direct);
    Array.prototype.forEach.call(root.querySelectorAll(candidateSelector), function (element) {
      var result = adopt(element);
      if (result) adopted.push(result);
    });
    var parentWrap = root.closest('.ant-modal-wrap');
    if (parentWrap) adopt(parentWrap);
    return adopted;
  }

  function rescan() {
    return document.documentElement ? scan(document.documentElement) : [];
  }

  var observer = new MutationObserver(function (records) {
    records.forEach(function (record) {
      Array.prototype.forEach.call(record.addedNodes, function (node) {
        if (node.nodeType === 1) scan(node);
      });
      if (record.target && record.target.nodeType === 1) {
        var wrap = record.target.closest('.ant-modal-wrap');
        if (wrap) adopt(wrap);
      }
    });
  });

  function start() {
    rescan();
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  global.__GAIP_MODAL_POSITION__ = {
    version: '1.0.0',
    adopt: adopt,
    rescan: rescan
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
}(window));
