(function () {
  'use strict';

  var mock = window.__GAIP_NEWS_MOCK__;
  var syncFrame = 0;
  var boundsFrame = 0;
  var navFrame = 0;
  var originalTitle = '';
  var toastTimer = 0;
  var state = {
    category: '全部',
    featuredOnly: false,
    keyword: '',
    activeArticleId: null,
    shareOpen: false,
    shareArticleId: null
  };

  var cls = {
    pageContainer: 'pageContainer___n3P38',
    pageHeader: 'pageHeader___SFDaB',
    pageTitle: 'pageTitle___nxEXS',
    searchIcon: 'searchIcon___GmGN9',
    pageSubtitle: 'pageSubtitle___aYKdj',
    categoryTabs: 'categoryTabs___RG5Za',
    categoryTab: 'categoryTab___rc9wg',
    categoryTabActive: 'categoryTabActive___LmRA1',
    filterRow: 'filterRow___Ka9qV',
    filterLeft: 'filterLeft___uAdJr',
    featuredLabel: 'featuredLabel___WUEE5',
    filterRight: 'filterRight___y3m_t',
    searchInput: 'searchInput___q6sEI',
    manageBtn: 'manageBtn___q71lL',
    manageBtnIcon: 'manageBtnIcon___Wmu7E',
    dateGroup: 'dateGroup___SX8fi',
    timelineLeft: 'timelineLeft___hbyr8',
    timelineRow: 'timelineRow___qvIaS',
    dateLabelWrap: 'dateLabelWrap____MBPL',
    dateLabel: 'dateLabel___OM5A1',
    weekLabel: 'weekLabel___bn2P1',
    timelineDot: 'timelineDot___Zn5mT',
    articles: 'articles___H5GX6',
    articleCard: 'articleCard___x4eww',
    titleRow: 'titleRow___q7CZe',
    featuredBadge: 'featuredBadge___WLi8B',
    articleTitle: 'articleTitle___aK0_o',
    info: 'info___eWyGA',
    metaRow: 'metaRow____mb7R',
    aiScoreIcon: 'aiScoreIcon___S0eKA',
    aiScore: 'aiScore___DGCxO',
    tagIcon: 'tagIcon___hlLSp',
    tag: 'tag___hx6FF',
    actionBtns: 'actionBtns____L0Qf',
    viewOriginal: 'viewOriginal___PiGcQ',
    shareBtn: 'shareBtn___gthi6',
    btnIcon: 'btnIcon___VmYho',
    summary: 'summary___qgrZn',
    emptyState: 'emptyState___yWDxH',
    noMore: 'noMore___RXyZW',
    disclaimer: 'disclaimer___Xy94R'
  };

  var assets = {
    pageTitle: 'features/news-center/assets/page-title.svg',
    featured: 'features/news-center/assets/featured-ai.svg',
    aiScore: 'features/news-center/assets/ai-score.svg',
    tag: 'features/news-center/assets/tag.svg',
    source: 'features/news-center/assets/source.svg',
    search: 'features/news-center/assets/search.svg',
    manage: 'features/news-center/assets/manage.svg',
    share: 'features/news-center/assets/share.svg?v=20260826-1'
  };

  if (!mock) return;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function icon(name, className) {
    return '<img class="' + escapeHtml(className || '') + '" src="' + assets[name] + '" alt="" aria-hidden="true">';
  }

  function lineIcon(name, className) {
    var paths = {
      close: '<path d="M18 6 6 18M6 6l12 12"/>',
      copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'
    };
    return '<svg class="' + escapeHtml(className || '') + '" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || '') + '</svg>';
  }

  function dayByKey(key) {
    return mock.days.find(function (day) { return day.key === key; }) || mock.days[0];
  }

  function newsHash() {
    return '#/workspace?gaip-channel=news';
  }

  function filteredArticles() {
    var keyword = state.keyword.trim().toLowerCase();
    return mock.articles
      .filter(function (article) {
        return state.category === '全部' || article.category === state.category;
      })
      .filter(function (article) {
        return !state.featuredOnly || article.featured;
      })
      .filter(function (article) {
        var haystack;
        if (!keyword) return true;
        haystack = [
          article.title,
          article.summary,
          article.category,
          article.slot,
          article.tags.join(' ')
        ].join(' ').toLowerCase();
        return haystack.indexOf(keyword) >= 0;
      })
      .sort(function (a, b) {
        var dayDiff = mock.days.findIndex(function (day) { return day.key === a.dateKey; }) -
          mock.days.findIndex(function (day) { return day.key === b.dateKey; });
        if (dayDiff) return dayDiff;
        return a.time > b.time ? -1 : (a.time < b.time ? 1 : 0);
      });
  }

  function groupByDay(list) {
    return list.reduce(function (groups, article) {
      if (!groups[article.dateKey]) groups[article.dateKey] = [];
      groups[article.dateKey].push(article);
      return groups;
    }, {});
  }

  function createPage() {
    var page = document.createElement('section');
    page.className = cls.pageContainer + ' gaip-news-page';
    page.setAttribute('data-gaip-page-root', 'news');
    page.setAttribute('data-gaip-news-overlay', 'true');
    page.innerHTML =
      '<header class="' + cls.pageHeader + '">' +
        '<img class="' + cls.pageTitle + '" src="' + assets.pageTitle + '" alt="资讯中心">' +
        '<span class="' + cls.pageSubtitle + '">每日洞察全网高优情报</span>' +
      '</header>' +
      '<nav class="' + cls.categoryTabs + '" data-news-categories aria-label="资讯分类"></nav>' +
      '<section class="' + cls.filterRow + '" data-gaip-news-filter>' +
        '<div class="' + cls.filterLeft + '">' +
          '<span class="' + cls.featuredLabel + '">只看精选</span>' +
          '<button class="ant-switch ant-switch-small" type="button" role="switch" data-news-featured aria-checked="false" aria-pressed="false">' +
            '<div class="ant-switch-handle"></div>' +
            '<span class="ant-switch-inner"><span class="ant-switch-inner-checked"></span><span class="ant-switch-inner-unchecked"></span></span>' +
          '</button>' +
        '</div>' +
        '<div class="' + cls.filterRight + '">' +
          '<span class="ant-input-affix-wrapper ' + cls.searchInput + '">' +
            '<span class="ant-input-prefix">' + icon('search', cls.searchIcon) + '</span>' +
            '<input class="ant-input" type="search" data-news-search placeholder="搜索标题/摘要/关键字">' +
          '</span>' +
          '<button class="' + cls.manageBtn + '" type="button" data-news-manage>' +
            icon('manage', cls.manageBtnIcon) + '<span>内容管理</span>' +
          '</button>' +
        '</div>' +
      '</section>' +
      '<main data-news-list></main>' +
      '<div class="' + cls.emptyState + '" data-news-empty>暂无数据</div>' +
      '<div class="' + cls.noMore + '" data-news-more>没有更多了</div>' +
      '<div class="' + cls.disclaimer + '">以上资讯为本地 Mock 数据，仅用于页面样式与交互演示。</div>' +
      '<div class="gaip-news-bridge-layer" data-news-layer></div>' +
      '<div class="gaip-news-bridge-toast" role="status" aria-live="polite"></div>';
    page.addEventListener('click', handleClick);
    page.addEventListener('input', handleInput);
    page.addEventListener('keydown', handleKeydown);
    return page;
  }

  function renderCategories(page) {
    var root = page.querySelector('[data-news-categories]');
    root.innerHTML = mock.categories.map(function (category) {
      return '<button class="' + cls.categoryTab + (state.category === category ? ' ' + cls.categoryTabActive : '') +
        '" type="button" data-news-category="' + escapeHtml(category) + '">' + escapeHtml(category) + '</button>';
    }).join('');
  }

  function renderCard(article) {
    return '<article class="' + cls.articleCard + '" data-news-card="' + article.id + '">' +
      '<div class="' + cls.titleRow + '">' +
        (article.featured ? icon('featured', cls.featuredBadge) : '') +
        '<button class="' + cls.articleTitle + ' gaip-news-bridge-title-btn" type="button" data-news-open="' + article.id + '">' +
          escapeHtml(article.title) +
        '</button>' +
      '</div>' +
      '<p class="' + cls.summary + '">' + escapeHtml(article.summary) + '</p>' +
      '<div class="' + cls.info + ' gaip-news-bridge-card-footer">' +
        '<div class="' + cls.metaRow + '">' +
          icon('aiScore', cls.aiScoreIcon) +
          '<span class="' + cls.aiScore + '">AI评分 ' + escapeHtml(article.score) + '</span>' +
          icon('tag', cls.tagIcon) +
          '<span class="' + cls.tag + '">' + escapeHtml(article.category) + '</span>' +
          article.tags.map(function (tag) { return '<span class="' + cls.tag + '">' + escapeHtml(tag) + '</span>'; }).join('') +
        '</div>' +
        '<div class="' + cls.actionBtns + '">' +
          '<button class="' + cls.viewOriginal + '" type="button" data-news-source="' + article.id + '">' + icon('source', cls.btnIcon) + '<span>查看原文</span></button>' +
          '<button class="' + cls.shareBtn + '" type="button" data-news-share="' + article.id + '">' + icon('share', 'gaip-news-bridge-share-icon') + '<span>分享</span></button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function renderList(page) {
    var list = filteredArticles();
    var groups = groupByDay(list);
    var listRoot = page.querySelector('[data-news-list]');
    var empty = page.querySelector('[data-news-empty]');
    var more = page.querySelector('[data-news-more]');
    empty.hidden = list.length !== 0;
    more.hidden = list.length === 0;
    listRoot.innerHTML = mock.days
      .filter(function (day) { return groups[day.key]; })
      .map(function (day) {
        return '<section class="' + cls.dateGroup + '">' +
          '<aside class="' + cls.timelineLeft + '">' +
            '<div class="' + cls.timelineRow + '">' +
              '<div class="' + cls.dateLabelWrap + '">' +
                '<span class="' + cls.dateLabel + '">' + escapeHtml(day.label) + '</span>' +
                '<span class="' + cls.weekLabel + '">' + escapeHtml(day.weekday) + '</span>' +
              '</div>' +
              '<span class="' + cls.timelineDot + '"></span>' +
            '</div>' +
          '</aside>' +
          '<div class="' + cls.articles + '">' + groups[day.key].map(renderCard).join('') + '</div>' +
        '</section>';
      }).join('');
  }

  function renderModal(article) {
    return '<div class="gaip-news-bridge-backdrop" role="presentation" data-news-close-modal>' +
      '<article class="gaip-news-bridge-modal" role="dialog" aria-modal="true" aria-labelledby="gaipNewsModalTitle" data-news-modal-panel>' +
        '<div class="gaip-news-bridge-modal-scroll">' +
          '<header class="' + cls.pageHeader + ' gaip-news-bridge-modal-head">' +
            '<button class="gaip-news-bridge-close" type="button" aria-label="关闭" data-news-close-modal>' + lineIcon('close') + '</button>' +
            '<img class="' + cls.pageTitle + '" src="' + assets.pageTitle + '" alt="资讯中心">' +
            '<span class="' + cls.pageSubtitle + '">' + escapeHtml(article.slot) + '</span>' +
          '</header>' +
          '<div class="' + cls.articleCard + ' gaip-news-bridge-detail-card">' +
            '<div class="gaip-news-bridge-detail-card-head">' +
              '<div class="gaip-news-bridge-detail-main">' +
                '<div class="' + cls.titleRow + '">' +
                  (article.featured ? icon('featured', cls.featuredBadge) : '') +
                  '<h2 id="gaipNewsModalTitle" class="' + cls.articleTitle + ' gaip-news-bridge-detail-title">' + escapeHtml(article.title) + '</h2>' +
                '</div>' +
                '<div class="' + cls.metaRow + '">' +
                  icon('aiScore', cls.aiScoreIcon) +
                  '<span class="' + cls.aiScore + '">AI评分 ' + escapeHtml(article.score) + '</span>' +
                  icon('tag', cls.tagIcon) +
                  '<span class="' + cls.tag + '">' + escapeHtml(article.category) + '</span>' +
                  article.tags.map(function (tag) { return '<span class="' + cls.tag + '">' + escapeHtml(tag) + '</span>'; }).join('') +
                '</div>' +
              '</div>' +
              '<div class="' + cls.actionBtns + ' gaip-news-bridge-detail-actions">' +
                '<button class="' + cls.viewOriginal + '" type="button" data-news-source="' + article.id + '">' + icon('source', cls.btnIcon) + '<span>查看原文</span></button>' +
                '<button class="' + cls.shareBtn + '" type="button" data-news-share="' + article.id + '">' + icon('share', 'gaip-news-bridge-share-icon') + '<span>分享</span></button>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<section class="gaip-news-bridge-detail-body">' +
            '<dl><dt>核心摘要</dt><dd>' + escapeHtml(article.summary) + '</dd></dl>' +
            '<dl><dt>目标客群画像</dt><dd>' + escapeHtml(article.audience) + '</dd></dl>' +
            '<dl><dt>经纪人可用要点</dt><dd><ul>' +
              article.bullets.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') +
            '</ul></dd></dl>' +
            '<dl><dt>建议跟进动作</dt><dd>' + escapeHtml(article.nextAction) + '</dd></dl>' +
            '<div class="gaip-news-bridge-talk">' +
              '<div><strong>微信建议开口话术</strong><button type="button" data-news-copy>复制话术 ' + lineIcon('copy') + '</button></div>' +
              '<p data-news-talk>' + escapeHtml(article.talk) + '</p>' +
            '</div>' +
          '</section>' +
        '</div>' +
        '<div class="gaip-news-bridge-modal-disclaimer">以上内容由 GAIP AI 生成，仅供内部参考；涉及保险、税务、法律事项，请以持牌顾问和官方文件为准。<button type="button" data-gaip-ai-notice-trigger>查看详情</button></div>' +
      '</article>' +
    '</div>';
  }

  function currentPage() {
    return document.querySelector('.gaip-news-page[data-gaip-news-overlay="true"]');
  }

  function detailRoot() {
    var root = document.querySelector('[data-news-global-detail-root]');
    if (root) return root;
    root = document.createElement('div');
    root.className = 'gaip-news-global-detail-root';
    root.setAttribute('data-news-global-detail-root', 'true');
    root.addEventListener('click', function (event) {
      var closeModal = event.target.closest('[data-news-close-modal]');
      var source = event.target.closest('[data-news-source]');
      var share = event.target.closest('[data-news-share]');
      var copy = event.target.closest('[data-news-copy]');
      if (source) {
        openSource(source.getAttribute('data-news-source'));
        return;
      }
      if (share) {
        state.shareArticleId = Number(share.getAttribute('data-news-share'));
        state.shareOpen = true;
        renderShareLayer();
        return;
      }
      if (closeModal && (!event.target.closest('[data-news-modal-panel]') || closeModal.matches('button'))) {
        closeDetailModal();
        return;
      }
      if (copy) copyTalk(root, copy);
    });
    root.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      closeDetailModal();
    });
    document.body.appendChild(root);
    return root;
  }

  function renderDetailLayer() {
    var root = detailRoot();
    var article = activeArticle();
    if (article) {
      root.innerHTML = renderModal(article);
      return;
    }
    if (root.innerHTML) root.innerHTML = '';
  }

  function removeDetailLayer() {
    var root = document.querySelector('[data-news-global-detail-root]');
    if (root) root.remove();
  }

  function closeDetailModal() {
    var page;
    if (!state.activeArticleId) return;
    state.activeArticleId = null;
    renderDetailLayer();
    page = currentPage();
    if (page) renderPage(page);
  }

  function shareArticle() {
    return mock.articles.find(function (article) {
      return article.id === Number(state.shareArticleId);
    }) || activeArticle() || filteredArticles()[0] || mock.articles[0];
  }

  function shareFrameSrc(article) {
    var day = dayByKey(article.dateKey);
    var params = new URLSearchParams();
    params.set('embed', '1');
    params.set('articleId', article.id);
    params.set('title', article.title);
    params.set('summary', article.summary);
    params.set('category', article.category);
    params.set('tags', article.tags.join(' / '));
    params.set('date', day.date + ' ' + article.time);
    params.set('score', article.score);
    params.set('slot', article.slot);
    params.set('featured', String(!!article.featured));
    return '../GAIP文章海报分享弹窗/index.html?' + params.toString();
  }

  function renderShare(article) {
    return '<div class="gaip-news-bridge-backdrop" role="presentation" data-news-close-share>' +
      '<div class="gaip-news-bridge-share" role="dialog" aria-modal="true" aria-label="分享海报" data-news-share-panel data-news-share-article-id="' + escapeHtml(article.id) + '">' +
        '<iframe title="GAIP文章海报分享弹窗" src="' + escapeHtml(shareFrameSrc(article)) + '"></iframe>' +
      '</div>' +
    '</div>';
  }

  function shareRoot() {
    var root = document.querySelector('[data-news-global-share-root]');
    if (root) return root;
    root = document.createElement('div');
    root.className = 'gaip-news-global-share-root';
    root.setAttribute('data-news-global-share-root', 'true');
    root.addEventListener('click', function (event) {
      if (event.target.closest('[data-news-close-share]') && !event.target.closest('[data-news-share-panel]')) {
        closeShareModal();
      }
    });
    document.body.appendChild(root);
    return root;
  }

  function renderShareLayer() {
    var root = shareRoot();
    var article = shareArticle();
    var panel = root.querySelector('[data-news-share-panel]');
    if (state.shareOpen) {
      if (!panel || panel.getAttribute('data-news-share-article-id') !== String(article.id)) {
        root.innerHTML = renderShare(article);
      }
      return;
    }
    if (root.innerHTML) root.innerHTML = '';
  }

  function removeShareLayer() {
    var root = document.querySelector('[data-news-global-share-root]');
    if (root) root.remove();
  }

  function closeShareModal() {
    var page;
    if (!state.shareOpen) return;
    state.shareOpen = false;
    state.shareArticleId = null;
    page = currentPage();
    renderShareLayer();
    if (page) renderPage(page);
  }

  function activeArticle() {
    return mock.articles.find(function (article) {
      return article.id === Number(state.activeArticleId);
    }) || null;
  }

  function renderLayers(page) {
    var article = activeArticle();
    page.querySelector('[data-news-layer]').innerHTML = '';
    renderDetailLayer();
    renderShareLayer();
    if (window.__GAIP_BREADCRUMB__) {
      if (article) {
        window.__GAIP_BREADCRUMB__.setDetail('news', article.title, function () {
          closeDetailModal();
        });
      } else {
        window.__GAIP_BREADCRUMB__.clearDetail('news');
      }
      window.__GAIP_BREADCRUMB__.refresh();
    }
  }

  function renderPage(page) {
    var featured = page.querySelector('[data-news-featured]');
    renderCategories(page);
    renderList(page);
    renderLayers(page);
    page.querySelector('[data-news-search]').value = state.keyword;
    featured.classList.toggle('ant-switch-checked', state.featuredOnly);
    featured.setAttribute('aria-pressed', String(state.featuredOnly));
    featured.setAttribute('aria-checked', String(state.featuredOnly));
    document.title = '资讯中心 - GAIP';
  }

  function showToast(message) {
    var toast = document.querySelector('.gaip-news-bridge-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 1800);
  }

  function openSource(id) {
    var article = mock.articles.find(function (item) { return item.id === Number(id); });
    if (!article) return;
    showToast(article.sourceLabel + '：真实原文链接待接入接口');
  }

  function handleClick(event) {
    var page = event.currentTarget;
    var category = event.target.closest('[data-news-category]');
    var featured = event.target.closest('[data-news-featured]');
    var open = event.target.closest('[data-news-open]');
    var card = event.target.closest('[data-news-card]');
    var source = event.target.closest('[data-news-source]');
    var share = event.target.closest('[data-news-share]');
    var manage = event.target.closest('[data-news-manage]');
    var closeModal = event.target.closest('[data-news-close-modal]');
    var closeShare = event.target.closest('[data-news-close-share]');
    var copy = event.target.closest('[data-news-copy]');

    if (category) {
      state.category = category.getAttribute('data-news-category');
      renderPage(page);
      return;
    }
    if (featured) {
      state.featuredOnly = !state.featuredOnly;
      renderPage(page);
      return;
    }
    if (source) {
      openSource(source.getAttribute('data-news-source'));
      return;
    }
    if (share) {
      state.shareArticleId = Number(share.getAttribute('data-news-share'));
      state.shareOpen = true;
      renderPage(page);
      return;
    }
    if (manage) {
      showToast('本地 Mock 暂不接入内容管理接口');
      return;
    }
    if (open) {
      state.activeArticleId = Number(open.getAttribute('data-news-open'));
      renderPage(page);
      return;
    }
    if (card) {
      state.activeArticleId = Number(card.getAttribute('data-news-card'));
      renderPage(page);
      return;
    }
    if (closeModal && !event.target.closest('[data-news-modal-panel]')) {
      closeDetailModal();
      return;
    }
    if (closeModal && closeModal.matches('button')) {
      closeDetailModal();
      return;
    }
    if (closeShare && !event.target.closest('[data-news-share-panel]')) {
      closeShareModal();
      return;
    }
    if (copy) copyTalk(page, copy);
  }

  function handleInput(event) {
    var page = event.currentTarget;
    if (!event.target.matches('[data-news-search]')) return;
    state.keyword = event.target.value;
    renderPage(page);
  }

  function handleKeydown(event) {
    if (event.key !== 'Escape') return;
    if (state.shareOpen) {
      closeShareModal();
      return;
    }
    if (state.activeArticleId) {
      closeDetailModal();
    }
  }

  function copyTalk(page, button) {
    var textNode = page.querySelector('[data-news-talk]');
    var text = textNode ? textNode.textContent : '';
    var label = button.firstChild;
    function done(message) {
      if (label) label.textContent = message + ' ';
      setTimeout(function () {
        if (label) label.textContent = '复制话术 ';
      }, 1400);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        done('已复制');
      }).catch(function () {
        fallbackCopy(text, done);
      });
      return;
    }
    fallbackCopy(text, done);
  }

  function fallbackCopy(text, done) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'readonly');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      done('已复制');
    } catch (error) {
      done('复制失败');
    }
    textarea.remove();
  }

  function updateBounds() {
    var page = document.querySelector('.gaip-news-page[data-gaip-news-overlay="true"]');
    var header = document.querySelector('[class*="header___tcVAl"]');
    var sidebar = document.querySelector('.ant-layout-sider');
    var headerRect;
    var sidebarRect;
    boundsFrame = 0;
    if (!page || !header || !sidebar) return;
    headerRect = header.getBoundingClientRect();
    sidebarRect = sidebar.getBoundingClientRect();
    page.style.top = Math.max(0, Math.round(headerRect.height)) + 'px';
    page.style.left = Math.max(0, Math.round(sidebarRect.width)) + 'px';
    page.style.width = Math.max(0, window.innerWidth - Math.round(sidebarRect.width)) + 'px';
    page.style.height = Math.max(0, window.innerHeight - Math.round(headerRect.height)) + 'px';
  }

  function scheduleBounds() {
    if (boundsFrame) return;
    boundsFrame = requestAnimationFrame(updateBounds);
  }

  function newsRequested() {
    var query = (location.hash || '').split('?')[1] || '';
    return window.__GAIP_PAGE_OVERRIDE__ === 'news' ||
      new URLSearchParams(query).get('gaip-channel') === 'news';
  }

  function notify(open) {
    window.dispatchEvent(new CustomEvent('gaip:news-change', { detail: { open: open } }));
    if (typeof window.__GAIP_APPLY_STRUCTURE_NAMES__ === 'function') {
      window.__GAIP_APPLY_STRUCTURE_NAMES__();
    }
  }

  function mount() {
    var header = document.querySelector('[class*="header___tcVAl"]');
    var sidebar = document.querySelector('.ant-layout-sider');
    var page = document.querySelector('.gaip-news-page[data-gaip-news-overlay="true"]');
    if (!header || !sidebar) return false;
    if (!page) {
      page = createPage();
      document.body.appendChild(page);
    }
    if (!originalTitle) originalTitle = document.title;
    document.documentElement.classList.add('gaip-news-scroll-lock');
    document.body.setAttribute('data-gaip-page', 'news');
    document.body.setAttribute('data-gaip-page-label', '资讯中心');
    renderPage(page);
    scheduleBounds();
    notify(true);
    return true;
  }

  function unmount() {
    var page = document.querySelector('.gaip-news-page[data-gaip-news-overlay="true"]');
    if (page) page.remove();
    state.activeArticleId = null;
    state.shareOpen = false;
    state.shareArticleId = null;
    removeDetailLayer();
    removeShareLayer();
    document.documentElement.classList.remove('gaip-news-scroll-lock');
    if (originalTitle) {
      document.title = originalTitle;
      originalTitle = '';
    }
    if (document.body.getAttribute('data-gaip-page') === 'news') {
      document.body.removeAttribute('data-gaip-page');
      document.body.removeAttribute('data-gaip-page-label');
    }
    if (window.__GAIP_BREADCRUMB__) window.__GAIP_BREADCRUMB__.clearDetail('news');
    notify(false);
  }

  function openFromNavigation() {
    if (window.__GAIP_LEARNING_CENTER__ && window.__GAIP_LEARNING_CENTER__.isOpen()) {
      window.__GAIP_LEARNING_CENTER__.closeForNavigation('/workspace');
    }
    if (window.__GAIP_WEALTH_CENTER__ && window.__GAIP_WEALTH_CENTER__.isOpen()) {
      window.__GAIP_WEALTH_CENTER__.closeForNavigation('/workspace');
    }
    if (location.hash !== newsHash()) {
      history.pushState({ gaipChannel: 'news' }, '', location.pathname + location.search + newsHash());
    }
    mount();
  }

  function closeForNavigation() {
    if (window.__GAIP_PAGE_OVERRIDE__ === 'news') window.__GAIP_PAGE_OVERRIDE__ = '';
    unmount();
  }

  function sync() {
    syncFrame = 0;
    if (newsRequested()) mount();
    else unmount();
  }

  function scheduleSync() {
    if (syncFrame) return;
    syncFrame = requestAnimationFrame(sync);
  }

  function createNewsMenuItem(menu) {
    var sourceItems = menu.querySelectorAll('li.ant-menu-item');
    var sourceItem = sourceItems.length ? sourceItems[sourceItems.length - 1] : null;
    var item = sourceItem ? sourceItem.cloneNode(true) : document.createElement('li');
    var activity = Array.prototype.slice.call(sourceItems).find(function (candidate) {
      var title = candidate.querySelector('.ant-menu-title-content');
      return title && title.textContent.trim() === '活动中心';
    });
    var learning = menu.querySelector('.gaip-learning-menu-item');

    if (!sourceItem) item.className = 'ant-menu-item ant-menu-item-only-child';
    item.classList.remove('ant-menu-item-selected', 'ant-menu-item-active', 'gaip-learning-menu-item');
    item.classList.add('gaip-news-menu-item');
    item.removeAttribute('data-menu-id');
    item.setAttribute('data-gaip-channel', 'news');
    item.setAttribute('role', 'menuitem');
    item.setAttribute('tabindex', '-1');
    item.setAttribute('aria-selected', 'false');

    if (activity && activity.nextSibling) menu.insertBefore(item, activity.nextSibling);
    else if (learning) menu.insertBefore(item, learning);
    else menu.appendChild(item);
    return item;
  }

  function updateNewsMenuItem(item) {
    if (item.getAttribute('data-gaip-news-structure-ready') !== 'true') {
      item.innerHTML =
        '<span class="ant-menu-title-content" data-gaip-news-title-ready="true">' +
          '<a class="gaip-learning-menu-link" href="' + newsHash() + '">' +
            '<span class="ant-pro-base-menu-inline-item-title gaip-learning-menu-title">' +
              '<span class="ant-pro-base-menu-inline-item-icon gaip-learning-menu-icon" aria-hidden="true">' +
                '<span class="gaip-main-nav-icon" data-gaip-nav-icon="news-center"></span>' +
              '</span>' +
              '<span class="ant-pro-base-menu-inline-item-text ant-pro-base-menu-inline-item-text-has-icon">资讯中心</span>' +
            '</span>' +
          '</a>' +
        '</span>';
      item.setAttribute('data-gaip-news-structure-ready', 'true');
    }
    item.querySelector('a').setAttribute('href', newsHash());
    if (item.getAttribute('data-gaip-news-bound') !== 'true') {
      item.setAttribute('data-gaip-news-bound', 'true');
      item.addEventListener('click', function (event) {
        event.preventDefault();
        openFromNavigation();
        scheduleNav();
      });
    }
  }

  function updateNewsMenuSelected(menu, item) {
    var selected = newsRequested() || !!document.querySelector('.gaip-news-page[data-gaip-news-overlay="true"]');
    if (selected) {
      Array.prototype.forEach.call(menu.querySelectorAll('.ant-menu-item-selected'), function (selectedItem) {
        if (selectedItem !== item) {
          selectedItem.classList.remove('ant-menu-item-selected');
          selectedItem.setAttribute('aria-selected', 'false');
        }
      });
    }
    item.classList.toggle('ant-menu-item-selected', selected);
    item.setAttribute('aria-selected', selected ? 'true' : 'false');
  }

  function bindNewsMenuSwitching(menu) {
    if (menu.getAttribute('data-gaip-news-nav-bound') === 'true') return;
    menu.setAttribute('data-gaip-news-nav-bound', 'true');
    menu.addEventListener('click', function (event) {
      var item;
      if (!newsRequested()) return;
      item = event.target.closest('li.ant-menu-item');
      if (!item || item.classList.contains('gaip-news-menu-item')) return;
      closeForNavigation();
    }, true);
  }

  function ensureNewsMenu() {
    var menu = document.querySelector('.ant-pro-sider-menu .ant-menu, .ant-layout-sider .ant-menu');
    var item;
    navFrame = 0;
    if (!menu) return;
    item = menu.querySelector('.gaip-news-menu-item') || createNewsMenuItem(menu);
    updateNewsMenuItem(item);
    updateNewsMenuSelected(menu, item);
    bindNewsMenuSwitching(menu);
  }

  function scheduleNav() {
    if (navFrame) return;
    navFrame = requestAnimationFrame(ensureNewsMenu);
  }

  function handleMessage(event) {
    if (event.data && event.data.type === 'gaip-news-share-close') {
      closeShareModal();
    }
  }

  var api = {
    open: openFromNavigation,
    closeForNavigation: closeForNavigation,
    isOpen: function () { return !!document.querySelector('.gaip-news-page[data-gaip-news-overlay="true"]'); },
    sync: scheduleSync
  };

  window.__GAIP_NEWS_CENTER__ = api;
  window.__GAIP_VIRTUAL_CHANNELS__ = window.__GAIP_VIRTUAL_CHANNELS__ || {};
  window.__GAIP_VIRTUAL_CHANNELS__.news = api;

  function start() {
    var root = document.getElementById('root');
    if (root) {
      new MutationObserver(function () {
        if (newsRequested()) scheduleSync();
        if (api.isOpen()) scheduleBounds();
        scheduleNav();
      }).observe(root, { childList: true, subtree: true });
    }
    window.addEventListener('resize', scheduleBounds);
    window.addEventListener('message', handleMessage);
    window.addEventListener('hashchange', function () {
      scheduleSync();
      scheduleNav();
    });
    window.addEventListener('popstate', function () {
      scheduleSync();
      scheduleNav();
    });
    scheduleNav();
    scheduleSync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
