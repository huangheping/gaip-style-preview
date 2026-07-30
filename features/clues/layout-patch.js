(function () {
  'use strict';

  var toolbarId = 'gaip-clue-toolbar';
  var rafId = 0;

  function byClassPart(part) {
    return document.querySelector('[class*="' + part + '"]');
  }

  function setLayout(el, styles) {
    Object.keys(styles).forEach(function (key) {
      el.style[key] = styles[key];
    });
  }

  function getTotalText() {
    var mock = window.__GAIP_CLUE_MOCK__;
    if (mock && mock.clues) return String(mock.clues.length);

    var firstStatValue = byClassPart('statValuePrimary___');
    return firstStatValue ? firstStatValue.textContent.trim() : '0';
  }

  function createToolbar() {
    var toolbar = document.createElement('div');
    toolbar.id = toolbarId;
    toolbar.setAttribute('data-gaip-structure-only', 'true');
    setLayout(toolbar, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      padding: '16px 20px 0',
      background: '#fff'
    });

    var summary = document.createElement('div');
    summary.setAttribute('data-gaip-clue-summary', 'true');
    setLayout(summary, {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      minHeight: '48px',
      fontSize: '14px',
      color: '#2f3640'
    });

    var right = document.createElement('div');
    right.setAttribute('data-gaip-clue-toolbar-right', 'true');
    setLayout(right, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '12px',
      flex: '1'
    });

    toolbar.appendChild(summary);
    toolbar.appendChild(right);
    return toolbar;
  }

  function updateSummary(toolbar) {
    var summary = toolbar.querySelector('[data-gaip-clue-summary]');
    if (!summary) return;
    summary.textContent = '共筛选 ' + getTotalText() + ' 条线索';
  }

  function orderButtons(buttonRow) {
    if (!buttonRow) return;
    var children = Array.prototype.slice.call(buttonRow.children);
    var exportBtn = children.find(function (item) { return item.textContent.indexOf('导出') >= 0; });
    var createBtn = children.find(function (item) { return item.textContent.indexOf('新增') >= 0; });
    if (exportBtn && createBtn && exportBtn.nextElementSibling !== createBtn) {
      buttonRow.insertBefore(exportBtn, createBtn);
    }
  }

  function adjustClueStructure() {
    if (location.hash && location.hash.indexOf('/clues') < 0) return;

    var listCard = byClassPart('listCard___');
    var filterArea = byClassPart('filterArea___');
    var tableCard = byClassPart('tableCard___');
    var searchBox = byClassPart('headerRight___');
    var buttonRow = byClassPart('headerBtnRow___');
    if (!listCard || !filterArea || !tableCard || !searchBox || !buttonRow) return;

    var toolbar = document.getElementById(toolbarId) || createToolbar();
    var pageContainer = tableCard.parentElement;
    if (!pageContainer) return;

    if (toolbar.parentElement !== pageContainer || toolbar.nextElementSibling !== tableCard) {
      pageContainer.insertBefore(toolbar, tableCard);
    }

    updateSummary(toolbar);
    orderButtons(buttonRow);

    var right = toolbar.querySelector('[data-gaip-clue-toolbar-right]');
    if (!right) return;

    if (searchBox.parentElement !== right) right.appendChild(searchBox);
    if (buttonRow.parentElement !== right) right.appendChild(buttonRow);

    setLayout(searchBox, {
      maxWidth: '348px',
      width: '348px',
      flex: '0 0 348px'
    });
    setLayout(buttonRow, {
      marginTop: '0',
      flexShrink: '0'
    });
  }

  function scheduleAdjust() {
    if (rafId) return;
    rafId = requestAnimationFrame(function () {
      rafId = 0;
      adjustClueStructure();
    });
  }

  scheduleAdjust();
  window.addEventListener('hashchange', scheduleAdjust);

  var observer = new MutationObserver(scheduleAdjust);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
