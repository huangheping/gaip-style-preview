(function () {
  'use strict';

  var observer = null;
  var rafId = 0;

  var regionLabels = {
    'app-shell': '应用框架',
    'app-header': '全局顶栏',
    'brand': '品牌标识',
    'breadcrumb': '面包屑',
    'user-actions': '用户操作区',
    'app-sidebar': '主导航侧栏',
    'primary-nav': '主导航',
    'app-main': '主内容区',
    'channel-page': '频道页面',
    'page-header': '频道页头',
    'page-hero': '主视觉区',
    'page-nav': '频道导航',
    'section-nav': '分区导航',
    'page-actions': '页面操作区',
    'filter-toolbar': '筛选工具栏',
    'metric-overview': '指标概览',
    'page-content': '页面内容',
    'content-sidebar': '内容侧栏',
    'content-main': '内容主体',
    'ai-assistant-entry': 'AI 助手入口'
  };

  var pageNames = {
    workspace: '工作台总览',
    customer: '客户中心360',
    policy: '保单列表',
    proposal: '方案中心',
    product: '产品中心',
    activity: '活动中心',
    induction: '薄荷入职指引',
    clues: '线索中心',
    learning: '学习中心'
  };

  var pageRegions = {
    workspace: [
      ['page-hero', '[class*="banner___"]'],
      ['page-actions', '[class*="bannerActions___"]'],
      ['metric-overview', '[class*="statsRow___"]'],
      ['page-content', '[class*="panels___"]']
    ],
    customer: [
      ['content-sidebar', '[class*="customerList___"]'],
      ['page-actions', '[class*="sidebarHeader___"]'],
      ['content-main', '[class*="mainContent___"]']
    ],
    policy: [
      ['page-hero', '[class*="banner___"]'],
      ['page-actions', '[class*="bannerActions___"]'],
      ['page-content', '[class*="mainContent___"]']
    ],
    proposal: [
      ['page-hero', '[class*="banner___"]'],
      ['page-actions', '[class*="bannerActions___"]'],
      ['page-content', '[class*="mainContent___"]'],
      ['content-sidebar', '[class*="sidebar___"]'],
      ['content-main', '[class*="mainProduct___"], [class*="emptyWrap___pbf5I"]']
    ],
    product: [
      ['page-nav', '[class*="filterTab___"]'],
      ['page-content', '[class*="productArea___"]'],
      ['filter-toolbar', '[class*="filterRegion___"]'],
      ['content-sidebar', '[class*="promotionSidebar___"]'],
      ['content-main', '[class*="resultWrap___"]']
    ],
    activity: [
      ['page-hero', '[class*="carousel___"]'],
      ['metric-overview', '[class*="activityList___"]'],
      ['page-content', '[class*="details___"]'],
      ['content-sidebar', '[class*="activityTypeList___"]'],
      ['filter-toolbar', '[class*="searchForm___"]'],
      ['content-main', '.ant-table-wrapper']
    ],
    induction: [
      ['page-header', '[class*="modHeader___"]'],
      ['page-nav', '[class*="chapterTabList___"]'],
      ['section-nav', '[class*="sectionTabs___"]'],
      ['page-content', '[class*="contentArea___"]']
    ],
    clues: [
      ['page-hero', '[class*="topSection___"]'],
      ['page-header', '[class*="pageHeader___"]'],
      ['page-actions', '#gaip-clue-toolbar'],
      ['metric-overview', '[class*="statCards___"]'],
      ['page-nav', '[class*="tabBar___"]'],
      ['filter-toolbar', '[class*="filterArea___"]'],
      ['page-content', '[class*="tableCard___"]']
    ],
    learning: [
      ['page-header', '.gaip-learning-header'],
      ['page-actions', '.gaip-learning-actions'],
      ['page-content', '.gaip-learning-scroll'],
      ['content-main', '.gaip-learning-grid']
    ]
  };

  function getPageKey() {
    var rawHash = location.hash || '';
    var queryIndex = rawHash.indexOf('?');
    if (queryIndex >= 0 &&
        new URLSearchParams(rawHash.slice(queryIndex + 1)).get('gaip-channel') === 'learning') {
      return 'learning';
    }

    if (window.__GAIP_PAGE_OVERRIDE__ && pageNames[window.__GAIP_PAGE_OVERRIDE__]) {
      return window.__GAIP_PAGE_OVERRIDE__;
    }

    var path = (location.hash || '#/workspace')
      .replace(/^#/, '')
      .split('?')[0]
      .replace(/\/+$/, '');

    var keys = Object.keys(pageNames);
    for (var index = 0; index < keys.length; index += 1) {
      if (path === '/' + keys[index] || path.indexOf('/' + keys[index] + '/') === 0) {
        return keys[index];
      }
    }
    return '';
  }

  function find(root, selector) {
    if (!root || !selector) return null;
    if (root.matches && root.matches(selector)) return root;
    return root.querySelector(selector);
  }

  function mark(element, region) {
    if (!element || !region) return;

    var previousRegion = element.getAttribute('data-gaip-region');
    if (previousRegion && previousRegion !== region) {
      element.classList.remove('gaip-region--' + previousRegion);
    }

    element.setAttribute('data-gaip-region', region);
    element.setAttribute('data-gaip-region-label', regionLabels[region] || region);
    element.classList.add('gaip-region', 'gaip-region--' + region);
  }

  function unmark(element) {
    var region;
    if (!element) return;
    region = element.getAttribute('data-gaip-region');
    if (region) element.classList.remove('gaip-region--' + region);
    element.classList.remove('gaip-region');
    element.removeAttribute('data-gaip-region');
    element.removeAttribute('data-gaip-region-label');
  }

  function markGlobalRegions() {
    var shell = document.querySelector('.ant-pro-layout');
    var header = document.querySelector('[class*="header___tcVAl"]');
    var sidebar = document.querySelector('.ant-layout-sider');
    var main = document.querySelector('.ant-pro-layout-content');

    mark(shell, 'app-shell');
    mark(header, 'app-header');
    mark(sidebar, 'app-sidebar');
    mark(main, 'app-main');

    if (header) {
      mark(find(header, '[class*="logo___q3nh1"]'), 'brand');
      mark(find(header, '.ant-breadcrumb'), 'breadcrumb');
      mark(find(header, '[class*="right___fv3yS"]'), 'user-actions');
    }

    if (sidebar) {
      mark(find(sidebar, '.ant-pro-sider-menu') || find(sidebar, '.ant-menu'), 'primary-nav');
    }

    mark(document.querySelector('[class*="globalButton___"]'), 'ai-assistant-entry');
    return main;
  }

  function markPageRegions(main, pageKey) {
    if (!main || !pageKey) return;

    var channelPage;
    if (pageKey === 'learning') {
      Array.prototype.forEach.call(
        main.querySelectorAll('[data-gaip-region="channel-page"]'),
        unmark
      );
      channelPage = document.querySelector('[data-gaip-page-root="learning"]');
    } else {
      channelPage = find(main, '[class*="pageContainer___"], [data-gaip-page-root]');
    }
    if (!channelPage) return;

    mark(channelPage, 'channel-page');
    channelPage.setAttribute('data-gaip-page', pageKey);
    channelPage.setAttribute('data-gaip-page-label', pageNames[pageKey]);

    var definitions = pageRegions[pageKey] || [];
    definitions.forEach(function (definition) {
      var region = definition[0];
      var selector = definition[1];
      mark(find(channelPage, selector), region);
    });
  }

  function applyStructureNames() {
    rafId = 0;

    var pageKey = getPageKey();
    if (pageKey) {
      document.body.setAttribute('data-gaip-page', pageKey);
      document.body.setAttribute('data-gaip-page-label', pageNames[pageKey]);
    } else {
      document.body.removeAttribute('data-gaip-page');
      document.body.removeAttribute('data-gaip-page-label');
    }

    var main = markGlobalRegions();
    markPageRegions(main, pageKey);
  }

  function scheduleApply() {
    if (rafId) return;
    rafId = requestAnimationFrame(applyStructureNames);
  }

  scheduleApply();
  window.addEventListener('hashchange', scheduleApply);

  observer = new MutationObserver(scheduleApply);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.__GAIP_APPLY_STRUCTURE_NAMES__ = scheduleApply;
  window.__GAIP_REGION_LABELS__ = Object.assign({}, regionLabels);
})();
