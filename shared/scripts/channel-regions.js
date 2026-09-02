(function () {
  'use strict';

  var observer = null;
  var rafId = 0;
  var script = document.currentScript;
  var sidebarHubImageUrl = script && script.src
    ? new URL('../assets/sidebar-hub.7ade03a1.png', script.src).href
    : './shared/assets/sidebar-hub.7ade03a1.png';

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

  var channelConfig = window.__GAIP_CHANNEL_CONFIG__;
  var pageNames = {};

  if (channelConfig) {
    channelConfig.list.forEach(function (channel) {
      pageNames[channel.key] = channel.label;
    });
  }

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
    ],
    news: [
      ['page-header', '.pageHeader___SFDaB'],
      ['page-nav', '.categoryTabs___RG5Za'],
      ['filter-toolbar', '.filterRow___Ka9qV'],
      ['page-content', '[data-news-list]'],
      ['content-main', '.articles___H5GX6']
    ],
    config: [
      ['page-header', '.header___Vhyog, .gaip-log-header'],
      ['page-nav', '[role="tablist"]'],
      ['content-sidebar', '.sidebar___zkFeC'],
      ['content-main', '.main___CWrje, .gaip-log-inline'],
      ['filter-toolbar', '.mainHeader___QGD6D, .gaip-log-filters']
    ],
    wealth: [
      ['page-header', '.gaip-wealth-page-header, .gaip-wealth-overview'],
      ['page-nav', '.gaip-wealth-subnav'],
      ['page-actions', '.gaip-wealth-page-actions'],
      ['filter-toolbar', '.gaip-wealth-filters'],
      ['metric-overview', '.gaip-wealth-summary, .gaip-wealth-overview'],
      ['page-content', '.gaip-wealth-view'],
      ['content-main', '.gaip-wealth-panel, .gaip-wealth-content-card']
    ]
  };

  function getPageKey() {
    var rawHash = location.hash || '';
    var queryIndex = rawHash.indexOf('?');
    if (queryIndex >= 0) {
      var virtualKey = new URLSearchParams(rawHash.slice(queryIndex + 1)).get('gaip-channel');
      var virtualChannel = virtualKey && channelConfig && channelConfig.getByKey(virtualKey);
      if (virtualChannel && virtualChannel.virtual) return virtualChannel.key;
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

  function syncSidebarHub(sidebar) {
    var image;
    var link;
    var footer;
    if (!sidebar) return;

    image = sidebar.querySelector('img[alt="GLORY百宝箱"]');
    link = image && image.closest('a');
    footer = image && image.closest('[class*="layoutMenuFooter___"]');
    if (!image || !link) return;

    image.classList.add('gaip-sidebar-hub-image');
    link.classList.add('gaip-sidebar-hub-link');
    if (footer) footer.classList.add('gaip-sidebar-hub');
    if (image.src !== sidebarHubImageUrl) image.src = sidebarHubImageUrl;
  }

  function syncSidebarNavScroll(sidebar) {
    var menu;
    var scroll;
    if (!sidebar) return;
    menu = sidebar.querySelector('.ant-pro-sider-menu, .ant-menu-root');
    scroll = menu && menu.parentElement;
    if (!scroll || !scroll.parentElement || !scroll.parentElement.classList.contains('ant-layout-sider-children')) return;
    scroll.classList.add('gaip-sidebar-nav-scroll');
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
      syncSidebarNavScroll(sidebar);
      syncSidebarHub(sidebar);
    }

    mark(document.querySelector('[class*="globalButton___"]'), 'ai-assistant-entry');
    return main;
  }

  function markPageRegions(main, pageKey) {
    if (!main || !pageKey) return;

    var channelPage;
    var channel = channelConfig && channelConfig.getByKey(pageKey);
    if (channel && channel.virtual) {
      Array.prototype.forEach.call(
        main.querySelectorAll('[data-gaip-region="channel-page"]'),
        unmark
      );
      channelPage = document.querySelector('[data-gaip-page-root="' + pageKey + '"]');
    } else {
      channelPage = find(main, '[class*="pageContainer___"], [data-gaip-page-root]');
    }
    if (!channelPage) return;

    mark(channelPage, 'channel-page');
    channelPage.setAttribute('data-gaip-page', pageKey);
    channelPage.setAttribute('data-gaip-page-label', pageNames[pageKey]);
    if (channel) channelPage.setAttribute('data-gaip-page-type', channel.type);

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
      var channel = channelConfig && channelConfig.getByKey(pageKey);
      document.body.setAttribute('data-gaip-page', pageKey);
      document.body.setAttribute('data-gaip-page-label', pageNames[pageKey]);
      if (channel) document.body.setAttribute('data-gaip-page-type', channel.type);
    } else {
      document.body.removeAttribute('data-gaip-page');
      document.body.removeAttribute('data-gaip-page-label');
      document.body.removeAttribute('data-gaip-page-type');
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
