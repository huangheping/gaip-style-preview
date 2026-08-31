(function () {
  'use strict';

  var assetRoot = './web/homepage/';
  var rotationMs = 8000;
  var rotationTimer = 0;
  var heightFrame = 0;
  var resizeBound = false;

  var marketData = [
    ['USD', '6.7903', 'up', '上涨', '↑'],
    ['GBP', '9.1340', 'down', '下跌', '↓'],
    ['AUD', '4.8459', 'down', '下跌', '↓'],
    ['EUR', '7.9000', 'down', '下跌', '↓'],
    ['JPY', '0.0425', 'flat', '持平', '–'],
    ['MYR', '1.6870', 'down', '下跌', '↓'],
    ['CAD', '5.0221', 'up', '上涨', '↑'],
    ['HKD', '0.8719', 'up', '上涨', '↑'],
    ['NZD', '4.1216', 'down', '下跌', '↓'],
    ['SGD', '5.3118', 'up', '上涨', '↑'],
    ['TRY', '0.1694', 'down', '下跌', '↓']
  ];

  var homeNews = [
    {
      headline: '国际金融中心：“下半世界经济由AI主导…油价、强势美元和高利率成变量”',
      meta: ['宏观经济', 'AI投资', '美元趋势', '原文时间：2024-09-01 09:30'],
      summary: '报道指出，2026年下半年全球经济将格外受AI驱动的复苏周期影响，同时油价、美元与高利率将成为关键变量。',
      takeaway: '提醒客户关注存款收益即将见顶，建议锁定长期固定收益类资产；结合家庭信托、探讨跨周期资产隔离方案。'
    },
    {
      headline: '亚洲市场午盘：主要股指企稳，利率预期成为资金配置主线',
      meta: ['亚洲市场', '利率预期', '资产配置', '原文时间：2026-07-13 12:05'],
      summary: '午盘主要市场波动收窄，资金更关注政策路径与企业盈利的确定性，高股息与投资级债券保持吸引力。',
      takeaway: '与客户检视现金流需求，在保留流动性的同时，分批配置稳定派息和中等久期资产。'
    },
    {
      headline: '下午策略：汇率波动下的跨币种资产管理与风险对冲',
      meta: ['汇率风险', '跨币种配置', '家庭资产', '原文时间：2026-07-13 15:20'],
      summary: '美元指数与主要亚洲货币保持区间震荡，结构性波动仍可能放大跨币种投资组合的短期回撤。',
      takeaway: '先明确客户未来12个月的币种支出，再用分层配置和定期再平衡降低单一币种暴露。'
    },
    {
      headline: '夜间深度：AI基础设施投资热度延续，产业链收益如何传导',
      meta: ['AI基础设施', '产业链', '长期主题', '原文时间：2026-07-13 21:00'],
      summary: '从算力、数据中心到电力供应，AI投资正向更广泛的产业链环节传导，但估值和盈利兑现速度出现分化。',
      takeaway: '将AI作为长期配置主题而非短期交易，通过分散标的、分批建仓和回撤管理控制风险。'
    }
  ];

  function renderMarketItems() {
    return marketData.map(function (item) {
      return '<div class="homeMarketItem">' +
        '<img src="' + assetRoot + 'flag-' + item[0].toLowerCase() + '.svg" alt="' + item[0] + '" width="20" height="20">' +
        '<span class="homeMarketPair">' + item[0] + ' / CNY</span>' +
        '<span class="homeMarketValue ' + item[2] + '">' + item[1] + '<b aria-label="' + item[3] + '">' + item[4] + '</b></span>' +
        '</div>';
    }).join('');
  }

  function createMarket() {
    var section = document.createElement('section');
    var items = renderMarketItems();
    section.className = 'homeMarket';
    section.setAttribute('aria-labelledby', 'homeMarketTitle');
    section.innerHTML =
      '<div class="homeMarketHeading">' +
        '<strong id="homeMarketTitle"><span class="homeMarketTitleToday">今日</span><span class="homeMarketTitleCore">核心行情</span></strong>' +
        '<span class="homeMarketUpdated">更新于 2026年7月13日 14:31</span>' +
      '</div>' +
      '<div class="homeMarketViewport"><div class="homeMarketMarquee">' +
        '<div class="homeMarketTrack">' + items + '</div>' +
        '<div class="homeMarketTrack" aria-hidden="true">' + items + '</div>' +
      '</div></div>';
    return section;
  }

  function tabMarkup(index, label, time, icon) {
    var active = index === 0;
    return '<button type="button" class="homeInfoTab' + (active ? ' is-active' : '') + '" role="tab" aria-selected="' + active + '" data-news-index="' + index + '">' +
      '<span class="homeInfoTabIcon" aria-hidden="true">' +
        '<img class="homeInfoIconActive" src="' + assetRoot + 'news-' + icon + '.svg" alt="" width="40" height="40">' +
        '<img class="homeInfoIconInactive" src="' + assetRoot + 'news-' + icon + '-inactive.svg" alt="" width="40" height="40">' +
        '<svg class="homeInfoTabCountdown" viewBox="0 0 44 44" aria-hidden="true"><circle class="homeInfoTabCountdownTrack" cx="22" cy="22" r="20.5" pathLength="100"></circle><circle class="homeInfoTabCountdownProgress" cx="22" cy="22" r="20.5" pathLength="100"></circle></svg>' +
      '</span>' +
      '<span>' + label + '<small class="homeInfoTabTime">' + time + '</small></span>' +
    '</button>';
  }

  function createInfoCenter() {
    var section = document.createElement('section');
    section.className = 'homeInfoCenter';
    section.setAttribute('aria-labelledby', 'homeInfoTitle');
    section.innerHTML =
      '<header class="homeSectionHeader pannelHeader___uIyRz">' +
        '<div class="homeSectionHeaderLeft">' +
          '<h2 id="homeInfoTitle" class="tit___E3vkN">资讯中心</h2>' +
          '<p class="homeSectionTip">资讯来源于公开网络 AI 检索整理，内容请自行甄别参考</p>' +
        '</div>' +
        '<button type="button" class="homeViewAll">查看全部<svg class="homeViewAllIcon" viewBox="0 0 12 16" width="12" height="16" aria-hidden="true" focusable="false"><path d="m4 4 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '</header>' +
      '<div class="homeInfoBody">' +
        '<div class="homeInfoTabs" role="tablist" aria-label="资讯时段">' +
          tabMarkup(0, '晨间必读', '09-01 09:23', 'morning') +
          tabMarkup(1, '午间谈资', '07-13 12:05', 'noon') +
          tabMarkup(2, '下午茶', '07-13 15:20', 'afternoon') +
          tabMarkup(3, '夜间深度', '07-13 21:00', 'night') +
        '</div>' +
        '<article class="homeInfoArticle" aria-live="polite">' +
          '<img class="homeInfoQuote" src="' + assetRoot + 'news-quote.svg" alt="" width="96" height="96">' +
          '<div class="homeInfoTitleRow"><img src="' + assetRoot + 'news-featured.svg" alt="精选" width="38" height="20"><h3></h3></div>' +
          '<div class="homeInfoMeta"></div>' +
          '<div class="homeInfoSummary"><strong>核心摘要</strong><p></p></div>' +
          '<div class="homeInfoTakeaways"><strong>经纪人可用要点</strong><p></p></div>' +
          '<div class="homeInfoActions">' +
            '<button type="button" class="homeInfoSecondary">查看原文</button>' +
            '<button type="button" class="homeInfoShare" aria-label="分享">' +
              // 原图路径中心约为 (343, 593)，校正视窗留白，保持图形与尺寸不变。
              '<svg viewBox="-169 81 1024 1024" width="18" height="18" aria-hidden="true" focusable="false"><path d="M646.43333336 653.73333332c-16.8 0-30.3 13.6-30.3 30.3l0.2 182-546.3 0.3-0.2-546.4h182.3c16.8 0 30.3-13.6 30.3-30.3S268.83333336 259.33333332 252.03333336 259.33333332H69.73333336c-33.3 0-60.4 27-60.4 60.4V866.33333332c0 33.3 27.1 60.4 60.4 60.4H616.33333336c33.4-0.1 60.4-27.1 60.4-60.4V684.03333332c0.1-16.7-13.5-30.3-30.3-30.3"></path><path d="M616.63333336 259.33333332H464.43333336c-16.8 0-30.3 13.6-30.3 30.3s13.6 30.3 30.3 30.3l109-0.2-251.9 251.9c-11.8 11.9-11.8 31.1 0 42.9 11.9 11.8 31.1 11.8 42.9 0L616.33333336 362.63333332v109.3c0 16.8 13.6 30.3 30.3 30.3s30.3-13.6 30.3-30.3V319.73333332c0.1-33.4-26.9-60.4-60.3-60.4"></path></svg>' +
              '<span>分享</span>' +
            '</button>' +
            '<button type="button" class="homeInfoPrimary">打开详情</button>' +
          '</div>' +
        '</article>' +
      '</div>';
    return section;
  }

  function posterSharePayload(item, index) {
    return {
      id: 'workspace-' + index,
      title: item.headline,
      summary: item.summary,
      category: item.meta[0],
      tags: item.meta.slice(1, 3),
      date: String(item.meta[3] || '').replace(/^原文时间：/, ''),
      slot: ['晨间必读', '午间谈资', '下午茶', '夜间深度'][index] || '',
      featured: true
    };
  }

  function renderMeta(meta) {
    var topics = meta.slice(0, 3).map(function (value) {
      return '<span>' + value + '</span>';
    }).join('<span class="homeInfoMetaDivider" aria-hidden="true">｜</span>');
    return '<img class="homeInfoMetaIcon" src="' + assetRoot + 'tag-news.svg" alt="" width="14" height="14">' +
      '<span class="homeInfoMetaTopics">' + topics + '</span><span>' + meta[3] + '</span>';
  }

  function renderNews(article, item) {
    article.querySelector('.homeInfoTitleRow h3').textContent = item.headline;
    article.querySelector('.homeInfoMeta').innerHTML = renderMeta(item.meta);
    article.querySelector('.homeInfoSummary p').textContent = item.summary;
    article.querySelector('.homeInfoTakeaways p').textContent = item.takeaway;
  }

  function syncArticleHeight(section) {
    var article = section && section.querySelector('.homeInfoArticle');
    var width;
    var probe;
    var maxHeight = 278;
    if (!article || !article.isConnected) return;
    width = article.getBoundingClientRect().width;
    if (!width) return;
    probe = article.cloneNode(true);
    probe.removeAttribute('aria-live');
    probe.setAttribute('aria-hidden', 'true');
    probe.querySelectorAll('[id]').forEach(function (node) { node.removeAttribute('id'); });
    Object.assign(probe.style, {
      position: 'fixed', visibility: 'hidden', pointerEvents: 'none', left: '-10000px', top: '0',
      width: width + 'px', minHeight: '0', height: 'auto', boxSizing: 'border-box', zIndex: '-1'
    });
    document.body.appendChild(probe);
    homeNews.forEach(function (item) {
      renderNews(probe, item);
      maxHeight = Math.max(maxHeight, Math.ceil(probe.getBoundingClientRect().height));
    });
    probe.remove();
    article.style.minHeight = maxHeight + 'px';
  }

  function scheduleHeight(section) {
    window.cancelAnimationFrame(heightFrame);
    heightFrame = window.requestAnimationFrame(function () { syncArticleHeight(section); });
  }

  function initializeInfoCenter(section) {
    var tabs = Array.prototype.slice.call(section.querySelectorAll('.homeInfoTab'));
    var article = section.querySelector('.homeInfoArticle');

    function activate(tab) {
      var item = homeNews[Number(tab.getAttribute('data-news-index') || 0)];
      tabs.forEach(function (candidate) {
        var active = candidate === tab;
        candidate.classList.toggle('is-active', active);
        candidate.classList.remove('is-counting');
        candidate.setAttribute('aria-selected', String(active));
      });
      void tab.offsetWidth;
      tab.classList.add('is-counting');
      section.setAttribute('data-active-news-index', tab.getAttribute('data-news-index') || '0');
      renderNews(article, item);
    }

    function scheduleRotation() {
      window.clearTimeout(rotationTimer);
      if (tabs.length < 2 || !section.isConnected) return;
      rotationTimer = window.setTimeout(function () {
        var activeIndex = tabs.findIndex(function (tab) { return tab.classList.contains('is-active'); });
        activate(tabs[(activeIndex + 1) % tabs.length]);
        scheduleRotation();
      }, rotationMs);
    }

    tabs.forEach(function (tab) {
      function activateFromInteraction() {
        activate(tab);
        scheduleRotation();
      }
      tab.addEventListener('mouseenter', activateFromInteraction);
      tab.addEventListener('focus', activateFromInteraction);
      tab.addEventListener('click', function () { tab.blur(); });
    });
    section.querySelector('.homeInfoShare').addEventListener('click', function (event) {
      var index = Number(section.getAttribute('data-active-news-index') || 0);
      var posterShare = window.__GAIP_POSTER_SHARE__;
      event.currentTarget.blur();
      if (posterShare && typeof posterShare.open === 'function') {
        posterShare.open(posterSharePayload(homeNews[index], index));
      }
    });
    section.querySelectorAll('.homeInfoSecondary, .homeInfoPrimary, .homeViewAll').forEach(function (button) {
      button.addEventListener('click', function () {
        var newsCenter = window.__GAIP_NEWS_CENTER__;
        button.blur();
        if (newsCenter && typeof newsCenter.open === 'function') {
          newsCenter.open();
        }
      });
    });
    activate(tabs[0]);
    syncArticleHeight(section);
    scheduleRotation();
    if (!resizeBound) {
      resizeBound = true;
      window.addEventListener('resize', function () {
        scheduleHeight(document.querySelector('.homeInfoCenter'));
      });
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { scheduleHeight(section); });
    }
  }

  function findFypPanel(column) {
    return Array.prototype.slice.call(column.children).find(function (element) {
      return element.textContent.indexOf('FYP 月度趋势') !== -1;
    });
  }

  function syncMockDeliveryDays(stats) {
    var overview = window.__GAIP_CHANNEL_DATA_MOCK__ &&
      window.__GAIP_CHANNEL_DATA_MOCK__.workspaceOverview;
    var label;
    var value;
    if (!overview || !overview.avgDeliveryDays) return;
    label = Array.prototype.slice.call(stats.querySelectorAll('h5')).find(function (element) {
      return element.textContent.trim() === '平均交付周期';
    });
    value = label && label.nextElementSibling;
    if (value && value.textContent.trim() !== overview.avgDeliveryDays + ' 天') {
      value.textContent = overview.avgDeliveryDays + ' 天';
    }
  }

  function mountWorkspaceUpdates() {
    var stats;
    var panels;
    var firstColumn;
    var market;
    var infoCenter;
    var fypPanel;
    if (location.hash.indexOf('/workspace') === -1) return;
    stats = document.querySelector('.statsRow___qThlc');
    panels = document.querySelector('.panels___HtwQH');
    firstColumn = panels && panels.querySelector('.panelsColumn___NChSr');
    if (!stats || !panels || !firstColumn) return;

    syncMockDeliveryDays(stats);

    market = document.querySelector('.homeMarket');
    if (!market) stats.insertAdjacentElement('afterend', createMarket());

    fypPanel = findFypPanel(firstColumn);
    if (fypPanel) fypPanel.setAttribute('data-gaip-fyp-hidden', 'true');

    infoCenter = firstColumn.querySelector('.homeInfoCenter');
    if (!infoCenter) {
      infoCenter = createInfoCenter();
      firstColumn.insertBefore(infoCenter, firstColumn.firstElementChild);
      initializeInfoCenter(infoCenter);
    }
  }

  function start() {
    var root = document.getElementById('root');
    var observer = new MutationObserver(mountWorkspaceUpdates);
    if (root) observer.observe(root, { childList: true, subtree: true });
    mountWorkspaceUpdates();
    window.addEventListener('hashchange', function () {
      if (location.hash.indexOf('/workspace') === -1) window.clearTimeout(rotationTimer);
      mountWorkspaceUpdates();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}());
