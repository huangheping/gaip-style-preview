(function () {
  'use strict';

  var components = Array.isArray(window.__GAIP_GLOBAL_COMPONENTS__)
    ? window.__GAIP_GLOBAL_COMPONENTS__
    : [];

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderNavigation() {
    var nav = document.getElementById('componentNav');
    nav.innerHTML = components.map(function (component, index) {
      return '<a class="catalogNavItem' + (index === 0 ? ' isActive' : '') + '" href="#' + escapeHtml(component.id) + '">' +
        '<span>' + escapeHtml(component.name) + '</span>' +
        '<small>' + escapeHtml(component.category) + '</small>' +
      '</a>';
    }).join('');
  }

  function renderSources(sources) {
    return sources.map(function (source) {
      return '<a class="componentSource" href="' + escapeHtml(source.href) + '" target="_blank">' +
        '<span>' + escapeHtml(source.label) + '</span>' +
        '<code>' + escapeHtml(source.path) + '</code>' +
      '</a>';
    }).join('');
  }

  function renderUsages(usages) {
    return usages.map(function (usage) {
      return '<li>' + escapeHtml(usage) + '</li>';
    }).join('');
  }

  function renderPreview(component) {
    if (component.previewKind === 'multiSelect') {
      return '<div class="componentPreviewBand componentPreviewBand--interactive">' +
        '<div class="componentPreviewCopy">' +
          '<span>真实组件预览</span>' +
          '<strong>活动发起方</strong>' +
          '<p>点击选择器查看选中、折叠、清空和下拉状态。</p>' +
        '</div>' +
        '<div class="componentLivePreview">' +
          '<div data-gaip-multi-select-demo></div>' +
        '</div>' +
      '</div>';
    }

    return '<div class="componentPreviewBand">' +
      '<div>' +
        '<span>真实组件预览</span>' +
        '<strong>重要提示</strong>' +
        '<p>打开当前项目正在使用的 AI 内容声明弹窗。</p>' +
      '</div>' +
      '<button class="componentPreviewButton" type="button" data-preview-action="' + escapeHtml(component.previewAction) + '">打开预览</button>' +
    '</div>';
  }

  function renderComponent(component) {
    return '<article class="componentEntry' + (component.previewKind === 'multiSelect' ? ' componentEntry--interactive' : '') + '" id="' + escapeHtml(component.id) + '">' +
      '<header class="componentEntryHeader">' +
        '<div>' +
          '<span class="componentCategory">' + escapeHtml(component.category) + '</span>' +
          '<h2>' + escapeHtml(component.name) + '</h2>' +
          '<p>' + escapeHtml(component.description) + '</p>' +
        '</div>' +
        '<span class="componentState">' + escapeHtml(component.status) + '</span>' +
      '</header>' +
      renderPreview(component) +
      '<div class="componentDetails">' +
        '<section>' +
          '<h3>调用入口</h3>' +
          '<dl>' +
            '<dt>JavaScript</dt><dd><code>' + escapeHtml(component.api) + '</code></dd>' +
            '<dt>声明式触发</dt><dd><code>' + escapeHtml(component.trigger) + '</code></dd>' +
          '</dl>' +
        '</section>' +
        '<section>' +
          '<h3>项目使用位置</h3>' +
          '<ul class="componentUsageList">' + renderUsages(component.usages) + '</ul>' +
        '</section>' +
      '</div>' +
      '<footer class="componentEntryFooter">' +
        '<div class="componentSources">' + renderSources(component.sources) + '</div>' +
        '<span>更新于 ' + escapeHtml(component.updatedAt) + '</span>' +
      '</footer>' +
    '</article>';
  }

  function renderCatalog() {
    var catalog = document.getElementById('componentCatalog');
    var usageCount = components.reduce(function (total, component) {
      return total + component.usages.length;
    }, 0);

    catalog.innerHTML = components.length
      ? components.map(renderComponent).join('')
      : '<div class="catalogEmpty">暂未登记全局组件</div>';

    document.getElementById('componentCount').textContent = components.length;
    document.getElementById('summaryComponentCount').textContent = components.length;
    document.getElementById('summaryUsageCount').textContent = usageCount;

    document.querySelectorAll('[data-gaip-multi-select-demo]').forEach(function (root) {
      if (!window.__GAIP_MULTI_SELECT__) return;
      window.__GAIP_MULTI_SELECT__.mount(root, {
        placeholder: '请选择活动发起方',
        maxVisible: 2,
        value: ['solution', 'brand', 'customer', 'advisor'],
        options: [
          { value: 'solution', label: '产品解决方案中心' },
          { value: 'brand', label: '品牌与市场中心' },
          { value: 'customer', label: '客户与业务发展中心' },
          { value: 'advisor', label: '顾问发展中心' },
          { value: 'investment', label: '投资产品中心' }
        ]
      });
    });
  }

  function runPreview(action) {
    if (action === 'showAiNotice' && window.__GAIP_AI_NOTICE__) {
      window.__GAIP_AI_NOTICE__.show();
    }
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-preview-action]');
    if (button) runPreview(button.getAttribute('data-preview-action'));

    var navItem = event.target.closest('.catalogNavItem');
    if (navItem) {
      document.querySelectorAll('.catalogNavItem').forEach(function (item) {
        item.classList.toggle('isActive', item === navItem);
      });
    }
  });

  renderNavigation();
  renderCatalog();
}());
