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
    nav.setAttribute('role', 'tablist');
    nav.setAttribute('aria-label', '组件选择');
    nav.innerHTML = components.map(function (component, index) {
      return '<button type="button" role="tab" class="catalogNavItem' + (component.parentId ? ' catalogNavItem--child' : '') + '" id="tab-' + escapeHtml(component.id) + '" data-component="' + escapeHtml(component.id) + '" aria-controls="' + escapeHtml(component.id) + '" aria-selected="false" tabindex="-1">' +
        '<span>' + escapeHtml(component.name) + '</span>' +
        (component.parentId ? '' : '<small>' + escapeHtml(component.category) + '</small>') +
      '</button>';
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

  function previewSurface(content, modifier) {
    return '<div class="componentPreviewSurface' + (modifier ? ' ' + modifier : '') + '" role="region" aria-label="组件预览">' + content + '</div>';
  }

  function renderPreview(component) {
    if(component.previewKind==='underlineTabs')return previewSurface('<div data-gaip-tabs-demo></div><p data-gaip-tabs-demo-status role="status"></p><div data-gaip-tabs-count-demo></div><p>上方为普通切换；下方演示数量与禁用项。支持左右方向键、Home / End。</p>');
    if (component.previewKind === 'datePicker') return '<div class="filterDemo"><p class="filterDemo__note">日历面板统一，选择条沿用现有样式。点击日期可切换年月，也可直接选择今天。</p>' + previewSurface('<div data-gaip-date-demo></div>') + '</div>';

    if (component.previewKind === 'globalTable') return '<div class="tableDemo"><div class="tableDemo__scenarios" role="group" aria-label="表格场景">' +
      [['short','少量数据'],['long','长列表'],['wide','宽表'],['empty','无数据'],['loading','加载中'],['error','加载失败']].map(function (item) { return '<button type="button" data-table-demo="' + item[0] + '" aria-pressed="false">' + item[1] + '</button>'; }).join('') +
      '</div><p class="tableDemo__note" data-table-demo-note></p>' + previewSurface('<div data-gaip-table-demo></div>') + '<p class="tableDemo__feedback" role="status" data-table-demo-feedback></p></div>';

    if (component.previewKind === 'filterBar') {
      return '<div class="filterDemo"><p class="filterDemo__note">以下为页面配置演示，不会修改课程数据。收起更多条件仍然生效；配置隐藏则清除该项条件。</p>' +
        '<p class="filterDemo__note">所属组织：点击输入框展开组织树，也可直接输入组织名称搜索；选中节点后生效，下拉面板内不另设搜索框。</p>' +
        '<div class="filterDemo__toggles"><label><input type="checkbox" data-filter-demo-visible="groups" checked> 展示折叠式多选</label><label><input type="checkbox" data-filter-demo-visible="required" checked> 展示开关</label><label><input type="checkbox" data-filter-demo-visible="org" checked> 展示组织搜索下拉</label></div>' +
        previewSurface('<div data-gaip-filter-demo></div>') + '<details class="filterDemo__values"><summary>查看当前有效条件</summary><pre data-gaip-filter-output aria-live="polite"></pre></details></div>';
    }
    if (component.previewKind === 'modalCatalog') {
      var catalog = window.__GAIP_MODAL_SOURCE_CATALOG__ || { ready: [], pending: [], excluded: [] };
      return '<div class="componentPreviewBand componentPreviewBand--catalog">' +
        '<div class="componentPreviewCopy">' +
          '<span>真实源集中预览</span>' +
          '<strong>业务弹窗目录</strong>' +
          '<p>单独打开预览页面；组件首页不会加载全部弹窗 iframe。</p>' +
        '</div>' +
        '<div class="modalCatalogMetrics" aria-label="弹窗目录状态">' +
          '<span class="modalCatalogMetric"><small>可预览</small><strong>' + catalog.ready.length + '</strong></span>' +
          '<span class="modalCatalogMetric"><small>待接入</small><strong>' + catalog.pending.length + '</strong></span>' +
          '<span class="modalCatalogMetric is-muted"><small>不展示</small><strong>' + catalog.excluded.length + '</strong></span>' +
        '</div>' +
        previewSurface('<a class="componentPreviewButton componentPreviewLink" href="./弹窗预览.html" target="_blank" rel="noopener">打开弹窗预览</a>', 'componentPreviewSurface--launcher') +
      '</div>';
    }

    if (component.previewKind === 'multiSelect') {
      return '<div class="componentPreviewBand componentPreviewBand--interactive">' +
        '<div class="componentPreviewCopy">' +
          '<span>真实组件预览</span>' +
          '<strong>活动发起方</strong>' +
          '<p>点击选择器查看选中、折叠、清空和下拉状态。</p>' +
        '</div>' +
        previewSurface('<div class="componentLivePreview"><div data-gaip-multi-select-demo></div></div>') +
      '</div>';
    }

    if (component.previewKind === 'posterShare') {
      return '<div class="componentPreviewBand">' +
        '<div>' +
          '<span>真实组件预览</span>' +
          '<strong>文章海报分享</strong>' +
          '<p>打开资讯中心正在使用的模板选择、海报预览与保存组件。</p>' +
        '</div>' +
        previewSurface('<button class="componentPreviewButton" type="button" data-preview-action="' + escapeHtml(component.previewAction) + '">打开预览</button>', 'componentPreviewSurface--launcher') +
      '</div>';
    }

    return '<div class="componentPreviewBand">' +
      '<div>' +
        '<span>真实组件预览</span>' +
        '<strong>重要提示</strong>' +
        '<p>打开当前项目正在使用的 AI 内容声明弹窗。</p>' +
      '</div>' +
      previewSurface('<button class="componentPreviewButton" type="button" data-preview-action="' + escapeHtml(component.previewAction) + '">打开预览</button>', 'componentPreviewSurface--launcher') +
    '</div>';
  }

  function renderComponent(component) {
    if (component.previewKind === 'formFrame') {
      return '<article hidden role="tabpanel" aria-labelledby="tab-form-modal-frame" class="componentEntry" id="form-modal-frame">' +
        '<header class="componentEntryHeader"><h2>表单弹窗框架</h2></header>' +
        '<div class="componentPreviewSurface catalogFormStage" role="region" aria-label="组件预览"><div class="ant-modal catalogFormFrame" data-gaip-form-footer="standard">' +
          '<div class="ant-modal-content"><button type="button" class="ant-modal-close" aria-label="关闭示例"></button>' +
          '<div class="ant-modal-header"><h2 class="ant-modal-title">表单标题</h2><p data-gaip-modal-subtitle>副标题用于补充说明本次填写的内容或操作目的。</p></div>' +
          '<div class="ant-modal-body"><div class="catalogFormPlaceholder">内容区域（示意）</div></div>' +
          '<div class="ant-modal-footer"><button type="button" class="ant-btn ant-btn-default" data-frame-cancel>取消</button>' +
          '<button type="button" class="ant-btn ant-btn-primary" data-frame-save>保存</button></div></div></div></div>' +
          '<div class="componentPreviewActions"><button hidden type="button" class="componentPreviewButton" data-frame-restore>重新展示框架</button></div></article>';
    }
    var state = component.status;
    if (component.previewKind === 'modalCatalog' && window.__GAIP_MODAL_SOURCE_CATALOG__) {
      state = window.__GAIP_MODAL_SOURCE_CATALOG__.ready.length + ' 个可预览';
    }
    return '<article hidden role="tabpanel" aria-labelledby="tab-' + escapeHtml(component.id) + '" class="componentEntry' + (component.previewKind === 'multiSelect' ? ' componentEntry--interactive' : '') + '" id="' + escapeHtml(component.id) + '">' +
      '<header class="componentEntryHeader">' +
        '<div>' +
          '<span class="componentCategory">' + escapeHtml(component.category) + '</span>' +
          '<h2>' + escapeHtml(component.name) + '</h2>' +
          '<p>' + escapeHtml(component.description) + '</p>' +
        '</div>' +
        '<span class="componentState">' + escapeHtml(state) + '</span>' +
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
    catalog.innerHTML = components.length
      ? components.map(renderComponent).join('')
      : '<div class="catalogEmpty">暂未登记全局组件</div>';

    document.getElementById('componentCount').textContent = components.length;

    var frame = catalog.querySelector('.catalogFormFrame');
    if (frame && window.__GAIP_MODAL_COMPONENT__) {
      window.__GAIP_MODAL_COMPONENT__.adoptForm(frame);
      var restore = catalog.querySelector('[data-frame-restore]');
      frame.querySelectorAll('.ant-modal-close, [data-frame-cancel], [data-frame-save]').forEach(function (button) {
        button.addEventListener('click', function () { frame.hidden = true; restore.hidden = false; restore.focus(); });
      });
      restore.addEventListener('click', function () { frame.hidden = false; restore.hidden = true; frame.querySelector('.ant-modal-close').focus(); });
    }

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
    if (window.__GAIP_TABLE_PREVIEW__) window.__GAIP_TABLE_PREVIEW__.mount(catalog);
    var tabsDemo=catalog.querySelector('[data-gaip-tabs-demo]');
    if(tabsDemo&&window.__GAIP_TABS__){
      var status=catalog.querySelector('[data-gaip-tabs-demo-status]');status.textContent='当前：学员学习统计';
      window.__GAIP_TABS__.mount(tabsDemo,{label:'统计维度示例',value:'users',items:[{key:'users',label:'学员学习统计'},{key:'courses',label:'课程学习统计'}],onChange:function(value){status.textContent='当前：'+(value==='users'?'学员学习统计':'课程学习统计');}});
      window.__GAIP_TABS__.mount(catalog.querySelector('[data-gaip-tabs-count-demo]'),{label:'数量与禁用示例',items:[{key:'insurance',label:'保险',count:24},{key:'trust',label:'信托',count:0},{key:'disabled',label:'不可用',disabled:true}]});
    }
    var dateDemo = catalog.querySelector('[data-gaip-date-demo]');
    if (dateDemo && window.__GAIP_FILTER_BAR__) window.__GAIP_FILTER_BAR__.mount(dateDemo, {
      label:'日期选择器预览', fields:[{key:'date',type:'date',label:'日期'},{key:'range',type:'dateRange',label:'日期范围'}], actions:{reset:true,more:false}
    });
    var filterDemo = catalog.querySelector('[data-gaip-filter-demo]');
    if (filterDemo && window.__GAIP_FILTER_BAR__) {
      var output = catalog.querySelector('[data-gaip-filter-output]');
      var filterApi = window.__GAIP_FILTER_BAR__.mount(filterDemo, {
        fields: [
          {key:'q',type:'search',label:'课程名称',placeholder:'输入名称，或清空搜索'},
          {key:'status',type:'select',label:'课程状态',options:[{value:'',label:'全部状态'},{value:'published',label:'已上架'},{value:'draft',label:'草稿'}]},
          {key:'groups',type:'multiSelect',label:'学习群组',placeholder:'全部群组',options:['香港业务','新加坡业务','美国业务','总部'],defaultValue:['香港业务','新加坡业务','美国业务']},
          {key:'required',type:'switch',label:'必修属性',text:'只看必修课'},
          {key:'org',type:'treeSelect',label:'所属组织',placeholder:'全部组织',nodes:function(){return window.__GAIP_ORGANIZATION__.nodes().map(function(n){return Object.assign({},n,{path:window.__GAIP_ORGANIZATION__.path(n.id)});});}},
          {key:'date',type:'date',label:'指定日期',advanced:true},
          {key:'period',type:'dateRange',label:'创建日期范围',advanced:true},
          {key:'count',type:'numberRange',label:'课节数量范围',min:0,step:1,advanced:true}
        ],
        onChange:function(values){output.textContent=JSON.stringify(values,null,2);}
      });
      output.textContent=JSON.stringify(filterApi.getValues(),null,2);
      catalog.querySelectorAll('[data-filter-demo-visible]').forEach(function(control){control.addEventListener('change',function(){filterApi.setVisible(control.dataset.filterDemoVisible,control.checked);});});
    }
  }

  function runPreview(action) {
    if (action === 'showAiNotice' && window.__GAIP_AI_NOTICE__) {
      window.__GAIP_AI_NOTICE__.show();
    }
    if (action === 'showPosterShare' && window.__GAIP_POSTER_SHARE__) {
      window.__GAIP_POSTER_SHARE__.open({
        id: 'catalog-preview',
        title: '全球资金重估 AI 投资周期，美元利率窗口进入观察期',
        summary: '主要市场继续围绕 AI 资本开支、美元利率路径和能源价格重新定价，短债收益与权益主题之间的轮动加快。',
        category: '宏观经济',
        tags: ['AI投资', '美元趋势'],
        date: '2026-08-26 09:12',
        score: 94,
        slot: '晨间快讯',
        featured: true
      });
    }
  }

  function selectComponent(id, record) {
    if (!components.length) return;
    var selected = components.find(function (component) { return component.id === id; }) || components[0];
    document.querySelectorAll('[data-gaip-multi-select-demo]').forEach(function (root) {
      var instance = window.__GAIP_MULTI_SELECT__ && window.__GAIP_MULTI_SELECT__.get(root);
      if (instance) instance.close();
    });
    document.querySelectorAll('.componentEntry').forEach(function (entry) { entry.hidden = entry.id !== selected.id; });
    document.querySelectorAll('.catalogNavItem').forEach(function (item) {
      var active = item.dataset.component === selected.id;
      item.classList.toggle('isActive', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    if (record) {
      var url = new URL(location.href);
      url.hash = '';
      url.searchParams.set('component', selected.id);
      history.pushState(null, '', url);
    }
    window.dispatchEvent(new Event('resize'));
  }

  function readSelected() {
    return new URL(location.href).searchParams.get('component') || location.hash.slice(1);
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-preview-action]');
    if (button) runPreview(button.getAttribute('data-preview-action'));

    var navItem = event.target.closest('.catalogNavItem');
    if (navItem) {
      selectComponent(navItem.dataset.component, true);
    }
  });

  renderNavigation();
  renderCatalog();
  selectComponent(readSelected(), false);
  window.addEventListener('popstate', function () { selectComponent(readSelected(), false); });
  document.getElementById('componentNav').addEventListener('keydown', function (event) {
    var tabs = Array.from(this.querySelectorAll('[role="tab"]'));
    var index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') index = (index + 1) % tabs.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') index = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[index].focus();
    selectComponent(tabs[index].dataset.component, true);
  });
}());
