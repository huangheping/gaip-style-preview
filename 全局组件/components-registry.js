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
    }
  ];
}());
