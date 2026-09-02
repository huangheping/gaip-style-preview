(function () {
  'use strict';

  window.__GAIP_GLOBAL_COMPONENTS__ = [
    {
      id: 'ai-content-notice',
      name: 'AI 内容重要提示',
      category: '提示与确认',
      status: '已启用',
      description: '统一展示 AI 内容使用声明、风险提示和确认操作。',
      api: 'window.__GAIP_AI_NOTICE__.show(options)',
      trigger: 'data-gaip-ai-notice-trigger',
      previewAction: 'showAiNotice',
      sources: [
        {
          label: '全局脚本',
          path: 'shared/scripts/global-ai-notice.js',
          href: '../shared/scripts/global-ai-notice.js'
        },
        {
          label: '全局样式',
          path: 'shared/styles/global-ai-notice.css',
          href: '../shared/styles/global-ai-notice.css'
        }
      ],
      usages: [
        'AI Agent：底部 AI 风险提示的“点击查看详情”',
        '资讯中心：文章详情底部声明的“查看详情”'
      ],
      updatedAt: '2026-08-26'
    },
    {
      id: 'responsive-multi-select',
      name: '折叠式多选下拉',
      category: '筛选与选择',
      status: '已收录',
      description: '大号多选选择器；空间不足时保留前两项，并用“+ N ...”汇总其余选项。',
      api: 'window.__GAIP_MULTI_SELECT__.mount(root, options)',
      trigger: 'data-gaip-multi-select',
      previewKind: 'multiSelect',
      sources: [
        {
          label: '全局脚本',
          path: 'shared/scripts/global-multi-select.js',
          href: '../shared/scripts/global-multi-select.js'
        },
        {
          label: '全局样式',
          path: 'shared/styles/global-multi-select.css',
          href: '../shared/styles/global-multi-select.css'
        }
      ],
      usages: [
        '活动中心：活动发起方多选筛选的视觉与交互标准',
        '其他频道：需要多项筛选并折叠已选标签的场景'
      ],
      updatedAt: '2026-08-26'
    },
    {
      id: 'poster-share',
      name: '文章海报分享',
      category: '分享与导出',
      status: '已启用',
      description: '统一展示文章海报模板、个人名片设置、精细预览和高清 PNG 导出。',
      api: 'window.__GAIP_POSTER_SHARE__.open(article)',
      trigger: 'data-gaip-poster-share-trigger',
      previewAction: 'showPosterShare',
      previewKind: 'posterShare',
      sources: [
        {
          label: '全局脚本',
          path: 'shared/scripts/global-poster-share.js',
          href: '../shared/scripts/global-poster-share.js'
        },
        {
          label: '全局样式',
          path: 'shared/styles/global-poster-share.css',
          href: '../shared/styles/global-poster-share.css'
        },
        {
          label: '独立组件项目',
          path: '全局组件/海报分享/index.html',
          href: './海报分享/index.html'
        }
      ],
      usages: [
        '资讯中心：列表与文章详情的“分享”入口',
        '全局组件目录：真实海报数据与模板预览'
      ],
      updatedAt: '2026-08-27'
    },
    {
      id: 'modal-catalog',
      name: '真实弹窗预览',
      category: '弹窗与确认',
      status: '自动同步',
      description: '集中查看当前项目可由真实源打开的业务弹窗；新增源登记后，数量和预览项自动同步。',
      api: 'window.__GAIP_MODAL_SOURCE_CATALOG__',
      trigger: '全局组件/弹窗预览.html',
      previewKind: 'modalCatalog',
      sources: [
        {
          label: '预览页面',
          path: '全局组件/弹窗预览.html',
          href: './弹窗预览.html'
        },
        {
          label: '运行时注册器',
          path: 'shared/scripts/modal-registry.js',
          href: '../shared/scripts/modal-registry.js'
        },
        {
          label: '自动索引',
          path: '全局组件/弹窗自动索引.generated.js',
          href: './弹窗自动索引.generated.js'
        }
      ],
      usages: [
        '全局组件目录：查看弹窗数量和进入集中预览',
        '弹窗样式维护：对照真实源统一标题、间距、按钮、遮罩与滚动'
      ],
      updatedAt: '2026-09-02'
    }
  ];
}());
