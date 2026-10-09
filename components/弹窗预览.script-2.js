/* @gaip-markup-cache:start */
// Generated from the owned templates/markup-*.html; run npm run build:templates.
var __gaipMarkup_de58466f7e = (function () {
  var templates = {"renderParent-1":"<header class=\"hero\"><div><p class=\"eyebrow\">GAIP · SOURCE-CONNECTED MODAL PREVIEW</p><h1>真实弹窗预览</h1><p class=\"intro\">这里只展示能够调用真实源入口的当前弹窗。每项滚动到可见区域后才创建独立 iframe：共享组件直接调用原控制器，频道弹窗打开正式 Hash 页面并执行真实按钮流程；预览页不保存弹窗 DOM 或视觉样式。</p></div><div class=\"counts\"><div class=\"count\"><span>真实可预览</span><strong>{{gaip:0}}</strong></div><div class=\"count\"><span>待接入</span><strong>{{gaip:1}}</strong></div><div class=\"count\"><span>不进入预览</span><strong>{{gaip:2}}</strong></div></div></header><aside class=\"rule\"><strong>当前约束：</strong>已明确排除的业务主面板和抽屉不展示；已被现行页面替换、页面不可达或并非独立弹层的旧登记项也不生成假预览。其余项目全部调用当前真实源。</aside><section class=\"categoryOverview\"><header class=\"overviewHeading\"><div><h2>分类总览</h2><p>先在这里核对 {{gaip:3}} 个弹窗的归类；编号与下方真实预览一致。</p></div><span class=\"overviewHint\">点击名称可定位到真实弹窗</span></header><div class=\"overviewGrid\" id=\"categoryOverviewGrid\"></div></section><nav class=\"categoryToolbar\" aria-label=\"弹窗用途筛选\">{{gaip:4}}</nav><section><h2 class=\"sectionTitle\">真实源预览</h2><p class=\"sectionIntro\">按交互用途分为三类，原清单编号保持不变。源组件修改结构或 CSS 后，刷新本页即可同步。</p><div id=\"categoryLists\"></div></section>{{gaip:5}}","renderParent-2":"<button class=\"categoryFilter\" type=\"button\" data-category=\"{{gaip:0}}\" aria-pressed=\"false\">{{gaip:1}} {{gaip:2}}</button>","renderParent-3":"<section><h2 class=\"sectionTitle\">待接入真实入口</h2><p class=\"sectionIntro\">这些弹窗已盘点，但在拥有完整 open()/mount() 入口前不展示视觉结果。</p><div class=\"pendingGrid\" id=\"pendingList\"></div></section>","renderParent-4":"<header class=\"overviewCardHeader\"><h3>{{gaip:0}}</h3><span>{{gaip:1}} 个</span></header><ol class=\"overviewList\">{{gaip:2}}</ol>","renderParent-5":"<li><button class=\"overviewLink\" type=\"button\" data-target=\"modal-preview-{{gaip:0}}\"><span class=\"overviewIndex\">{{gaip:1}}</span><span class=\"overviewName\">{{gaip:2}}</span></button></li>","renderParent-6":"<header class=\"categoryHeader\"><div><h2>{{gaip:0}}</h2><p>{{gaip:1}}</p></div><span class=\"categoryTotal\"><strong>{{gaip:2}}</strong> 个弹窗</span></header><div class=\"categoryList\"></div>","renderParent-7":"<header class=\"previewCardHeader\"><div><div class=\"titleRow\"><span class=\"index\">{{gaip:0}}</span><h2>{{gaip:1}}</h2></div><p><span class=\"categoryTag\">{{gaip:2}}</span><span>{{gaip:3}}</span></p></div><code>{{gaip:4}}</code></header><div class=\"frameWrap\" data-load-state=\"idle\"><div class=\"frameStatus\"><span class=\"frameStatusText\">滚动到此处后加载真实弹窗</span><button class=\"frameLoad\" type=\"button\">立即加载</button></div></div>","renderParent-8":"<h3>{{gaip:0}}</h3><p>{{gaip:1}}{{gaip:2}}</p><code>{{gaip:3}}</code>"};
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

      var catalog = window.__GAIP_MODAL_SOURCE_CATALOG__;
      var app = document.getElementById('app');
      var embedId = new URLSearchParams(window.location.search).get('embed');
      var categoryOrder = ['information', 'form', 'confirmation'];
      var categoryMeta = {
        information: { label: '信息展示', description: '详情、预览、记录与系统提示；以阅读和理解信息为主。' },
        form: { label: '表单操作', description: '新建、编辑、选择、配置、分配与导入；需要用户填写或选择。' },
        confirmation: { label: '操作确认', description: '执行操作前的二次确认；删除与解绑等高风险操作由危险状态表达。' }
      };

      function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
          return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character];
        });
      }

      function loadStyle(href) {
        return new Promise(function (resolve, reject) {
          var link = document.createElement('link');
          link.rel = 'stylesheet'; link.href = href; link.onload = resolve;
          link.onerror = function () { reject(new Error('样式加载失败：' + href)); };
          document.head.appendChild(link);
        });
      }

      function loadScript(src) {
        return new Promise(function (resolve, reject) {
          var script = document.createElement('script');
          script.src = src; script.onload = resolve;
          script.onerror = function () { reject(new Error('脚本加载失败：' + src)); };
          document.body.appendChild(script);
        });
      }

      function openEntry(entry) {
        return window.__GAIP_MODAL_REGISTRY__.open(entry.id);
      }

      async function renderEmbed(entry) {
        if (entry.previewMode === 'route-trigger') {
          location.replace('../channels/login/index.html#' + entry.route + '?gaip-popup-preview=' + encodeURIComponent(entry.id));
          return;
        }
        // Keep already declared shared assets anchored to this HTML before <base>
        // changes how later business assets resolve. No preview-only CSS copy.
        document.querySelectorAll('link[href], script[src]').forEach(function (asset) {
          var attribute = asset.tagName === 'LINK' ? 'href' : 'src';
          asset.setAttribute(attribute, new URL(asset.getAttribute(attribute), document.baseURI).href);
        });
        var base = document.createElement('base');
        base.href = '../';
        document.head.insertBefore(base, document.head.firstChild);
        app.className = 'embedStatus';
        app.textContent = '正在从真实源入口加载“' + entry.title + '”…';
        try {
          if (entry.previewMode === 'config-dialog') window.__GAIP_CONFIG_DIALOG_PREVIEW__ = true;
          await Promise.all(entry.styles.map(loadStyle));
          for (var index = 0; index < entry.scripts.length; index += 1) await loadScript(entry.scripts[index]);
          openEntry(entry);
          app.remove();
        } catch (error) {
          app.classList.add('is-error');
          app.textContent = '真实弹窗加载失败：' + error.message;
          throw error;
        }
      }

      function renderParent() {
        var ready = catalog.ready;
        var pending = catalog.pending;
        var excluded = catalog.excluded;
        app.className = 'page';
        app.innerHTML =
          __gaipMarkup_de58466f7e("renderParent-1", [('' + (ready.length)), ('' + (pending.length)), ('' + (excluded.length)), ('' + (ready.length)), ('' + (categoryOrder.map(function (category) { return __gaipMarkup_de58466f7e("renderParent-2", [('' + (category)), ('' + (categoryMeta[category].label)), ('' + (ready.filter(function (entry) { return entry.category === category; }).length))]); }).join(''))), ('' + (pending.length ? __gaipMarkup_de58466f7e("renderParent-3") : ''))]);

        var categoryOverviewGrid = document.getElementById('categoryOverviewGrid');
        var categoryLists = document.getElementById('categoryLists');
        var readyIndex = new Map(ready.map(function (entry, index) { return [entry.id, index + 1]; }));
        var categoryContainers = {};
        categoryOrder.forEach(function (category) {
          var entries = ready.filter(function (entry) { return entry.category === category; });
          var overviewCard = document.createElement('article');
          overviewCard.className = 'overviewCard';
          overviewCard.dataset.category = category;
          overviewCard.innerHTML = __gaipMarkup_de58466f7e("renderParent-4", [('' + (categoryMeta[category].label)), ('' + (entries.length)), ('' + (entries.map(function (entry) { return __gaipMarkup_de58466f7e("renderParent-5", [('' + (escapeHtml(entry.id))), ('' + (String(readyIndex.get(entry.id)).padStart(2, '0'))), ('' + (escapeHtml(entry.title)))]); }).join('')))]);
          categoryOverviewGrid.appendChild(overviewCard);
          var section = document.createElement('section');
          section.className = 'categorySection';
          section.dataset.category = category;
          section.innerHTML = __gaipMarkup_de58466f7e("renderParent-6", [('' + (categoryMeta[category].label)), ('' + (categoryMeta[category].description)), ('' + (entries.length))]);
          categoryLists.appendChild(section);
          categoryContainers[category] = section.querySelector('.categoryList');
        });
        function selectCategory(selected) {
          Array.prototype.forEach.call(document.querySelectorAll('.categoryFilter'), function (candidate) {
            candidate.setAttribute('aria-pressed', candidate.dataset.category === selected ? 'true' : 'false');
          });
          Array.prototype.forEach.call(document.querySelectorAll('.categorySection'), function (section) {
            section.hidden = section.dataset.category !== selected;
          });
        }
        Array.prototype.forEach.call(document.querySelectorAll('.categoryFilter'), function (button) {
          button.addEventListener('click', function () { selectCategory(button.dataset.category); });
        });
        selectCategory(categoryOrder[0]);
        var routeQueue = [];
        var routeActive = 0;
        var routeConcurrency = 3;

        function frameStatus(wrap, message, options) {
          var status = wrap.querySelector('.frameStatus');
          var label = status.querySelector('.frameStatusText');
          var button = status.querySelector('.frameLoad');
          label.textContent = message;
          status.hidden = !!(options && options.hidden);
          status.classList.toggle('is-error', !!(options && options.error));
          button.hidden = !(options && options.showButton);
        }

        function createPreviewFrame(wrap, entry) {
          if (wrap.dataset.loadState !== 'idle') return;
          wrap.dataset.loadState = 'loading';
          frameStatus(wrap, '正在打开真实弹窗…');
          var frame = document.createElement('iframe');
          frame.dataset.popupId = entry.id;
          frame.dataset.previewMode = entry.previewMode || 'source';
          frame.title = entry.title + '真实源预览';
          frame.loading = 'lazy';
          wrap.appendChild(frame);
          if (entry.previewMode === 'route-trigger') {
            frame.dataset.source = '?embed=' + encodeURIComponent(entry.id);
            frame.dataset.queueState = 'queued';
            routeQueue.push(frame);
            pumpRouteQueue();
            return;
          }
          frame.addEventListener('load', function () {
            wrap.dataset.loadState = 'done';
            window.setTimeout(function () { frameStatus(wrap, '', { hidden: true }); }, 120);
          });
          frame.src = '?embed=' + encodeURIComponent(entry.id);
        }

        function pumpRouteQueue() {
          while (routeActive < routeConcurrency && routeQueue.length) {
            var frame = routeQueue.shift();
            routeActive += 1;
            frame.dataset.queueState = 'running';
            frame.src = frame.dataset.source;
            frame._gaipPreviewTimeout = window.setTimeout(function (target) {
              return function () {
                if (target.dataset.queueState !== 'running') return;
                var status = target.parentElement.querySelector('.frameStatus');
                frameStatus(target.parentElement, '真实弹窗未能打开：页面加载超时', { error: true, showButton: true });
                settleRouteFrame(target);
              };
            }(frame), 60000);
          }
        }

        function settleRouteFrame(frame) {
          if (!frame || frame.dataset.queueState !== 'running') return;
          frame.dataset.queueState = 'done';
          frame.parentElement.dataset.loadState = 'done';
          window.clearTimeout(frame._gaipPreviewTimeout);
          routeActive = Math.max(0, routeActive - 1);
          pumpRouteQueue();
        }

        window.addEventListener('message', function (event) {
          var data = event.data;
          if (!data || data.type !== 'gaip-popup-preview') return;
          var frame = Array.prototype.find.call(document.querySelectorAll('iframe'), function (candidate) {
            return candidate.contentWindow === event.source && candidate.dataset.popupId === data.id;
          });
          if (!frame) return;
          var status = frame.parentElement.querySelector('.frameStatus');
          if (!status) return;
          if (data.status === 'opened') {
            frameStatus(frame.parentElement, '', { hidden: true });
            settleRouteFrame(frame);
          } else if (data.status === 'error') {
            frameStatus(frame.parentElement, '真实弹窗未能打开：' + (data.message || '未找到当前页面入口'), { error: true, showButton: true });
            settleRouteFrame(frame);
          }
        });
        var previewObserver = 'IntersectionObserver' in window ? new IntersectionObserver(function (records) {
          records.forEach(function (record) {
            if (!record.isIntersecting) return;
            previewObserver.unobserve(record.target);
            createPreviewFrame(record.target, record.target._gaipEntry);
          });
        }, { rootMargin: '80px 0px' }) : null;
        ready.forEach(function (entry) {
          var article = document.createElement('article');
          article.className = 'previewCard';
          article.id = 'modal-preview-' + entry.id;
          article.dataset.category = entry.category;
          article.innerHTML = __gaipMarkup_de58466f7e("renderParent-7", [('' + (String(readyIndex.get(entry.id)).padStart(2, '0'))), ('' + (escapeHtml(entry.title))), ('' + (categoryMeta[entry.category].label)), ('' + (escapeHtml(entry.channel))), ('' + (escapeHtml(entry.source)))]);
          categoryContainers[entry.category].appendChild(article);
          var wrap = article.querySelector('.frameWrap');
          wrap._gaipEntry = entry;
          wrap.querySelector('.frameLoad').addEventListener('click', function () {
            if (previewObserver) previewObserver.unobserve(wrap);
            if (wrap.dataset.loadState === 'done') {
              var oldFrame = wrap.querySelector('iframe');
              if (oldFrame) oldFrame.remove();
              wrap.dataset.loadState = 'idle';
            }
            createPreviewFrame(wrap, entry);
          });
          if (previewObserver) previewObserver.observe(wrap);
          else if (readyIndex.get(entry.id) === 1) createPreviewFrame(wrap, entry);
        });

        categoryOverviewGrid.addEventListener('click', function (event) {
          var button = event.target.closest('.overviewLink');
          if (!button) return;
          var target = document.getElementById(button.dataset.target);
          if (!target) return;
          selectCategory(target.dataset.category);
          target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
          target.classList.add('is-highlighted');
          window.setTimeout(function () { target.classList.remove('is-highlighted'); }, 1400);
        });

        var pendingList = document.getElementById('pendingList');
        if (pendingList) pending.forEach(function (entry) {
          var item = document.createElement('article');
          item.className = 'pendingItem';
          item.innerHTML = __gaipMarkup_de58466f7e("renderParent-8", [('' + (escapeHtml(entry.title))), ('' + (escapeHtml(entry.channel))), ('' + (entry.reason ? ' · ' + escapeHtml(entry.reason) : ' · 尚未暴露完整真实打开入口。')), ('' + (escapeHtml(entry.source)))]);
          pendingList.appendChild(item);
        });
      }

      if (embedId) {
        var entry = catalog.ready.find(function (candidate) { return candidate.id === embedId; });
        if (!entry) { app.className = 'embedStatus is-error'; app.textContent = '该项目不是可预览弹窗，或已被排除。'; }
        else renderEmbed(entry);
      } else renderParent();
    }());
