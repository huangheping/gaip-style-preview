(function () {
  'use strict';

  window.__GAIP_GLOBAL_COMPONENTS__ = [
    {
      id:'carousel-controls',name:'轮播切换',category:'导航与切换',status:'两频道共用',
      description:'活动中心同款圆形箭头与短条指示点；单组隐藏，支持手动循环切换。内容布局与自动播放由业务决定。',
      api:'window.__GAIP_CAROUSEL_CONTROLS__.mount(root, options)',trigger:'显式挂载',previewKind:'carouselControls',
      sources:[{label:'共享脚本',path:'shared/scripts/global-carousel-controls.js',href:'../shared/scripts/global-carousel-controls.js'},{label:'共享样式',path:'shared/styles/global-carousel-controls.css',href:'../shared/styles/global-carousel-controls.css'},{label:'接入规范',path:'docs/carousel-controls-spec.md',href:'../docs/carousel-controls-spec.md'}],
      usages:['活动中心：原 Banner（保留原生指示器与轮播）','学习中心：直播卡片按组切换'],updatedAt:'2026-09-17'
    },
    {
      id:'underline-tabs',name:'下划线 Tab',category:'导航与切换',status:'五频道统一',
      description:'统一字号、颜色、间距与静态下划线；支持数量、禁用项及键盘切换。页面位置与业务切换由页面负责。',
      api:'window.__GAIP_TABS__.mount(root, config)',trigger:'新组件显式挂载；五处既有Tab通过同源适配器接入',previewKind:'underlineTabs',
      sources:[
        {label:'共享脚本',path:'shared/scripts/global-tabs.js',href:'../shared/scripts/global-tabs.js'},
        {label:'共享样式',path:'shared/styles/global-tabs.css',href:'../shared/styles/global-tabs.css'},
        {label:'接入规范',path:'docs/tabs-spec.md',href:'../docs/tabs-spec.md'}
      ],usages:['产品中心：产品分类（保留数量）','配置中心：组织架构渠道','学习中心：学员/课程学习统计','薄荷入职引导：顶部章节切换（保留学习进度与解锁限制）','方案中心：全部方案 / 我的方案记录'],updatedAt:'2026-09-15'
    },
    {
      id: 'date-picker', name: '日期选择器', category: '筛选与选择', status: '统一共享',
      description: '统一使用 Ant Design 日历样式，选择条保留现有规范；支持单个日期、日期范围及弹窗日期字段。',
      api: 'window.__GAIP_DATE_PICKER__.mount(panel, options)', trigger: '由现有日期选择条打开', previewKind: 'datePicker',
      sources: [
        {label:'共享脚本',path:'shared/scripts/global-date-picker.js',href:'../shared/scripts/global-date-picker.js'},
        {label:'共享样式',path:'shared/styles/global-date-picker.css',href:'../shared/styles/global-date-picker.css'},
        {label:'接入规范',path:'docs/date-picker-spec.md',href:'../docs/date-picker-spec.md'}
      ],
      usages: ['普通弹窗：日期与日期时间字段', '学习中心课程管理：共享筛选栏日期组件'], updatedAt: '2026-09-09'
    },
    {
      id: 'global-table', name: '全局表格', category: '表格与分页', status: '课程管理已接入',
      description: '统一表头、操作按钮和分页。内容少时自然收拢，达到可用高度后数据区域独立滚动。',
      api: 'window.__GAIP_TABLE__.mount(root, config)', trigger: '显式挂载', previewKind: 'globalTable',
      sources: [
        {label:'共享脚本',path:'shared/scripts/global-table.js?v=20260916-no-pagination-1',href:'../shared/scripts/global-table.js?v=20260916-no-pagination-1'},
        {label:'共享样式',path:'shared/styles/global-table.css',href:'../shared/styles/global-table.css'},
        {label:'接入规范',path:'docs/table-spec.md',href:'../docs/table-spec.md'}
      ],
      usages: ['学习中心：课程管理', '组件目录：少量数据、长列表、宽表及数据状态'], updatedAt: '2026-09-09'
    },
    {
      id: 'filter-bar', name: '可配置筛选栏', category: '筛选与选择', status: '首版接入',
      description: '统一单选、输入框直接搜索的组织树下拉、折叠式多选、开关、搜索、日期/数字范围、查询与重置；按页面配置显隐，更多筛选可收起。',
      api: 'window.__GAIP_FILTER_BAR__.mount(root, config)', trigger: '显式挂载，不自动接管旧页面', previewKind: 'filterBar',
      sources: [
        {label:'全局脚本',path:'shared/scripts/global-filter-bar.js',href:'../shared/scripts/global-filter-bar.js'},
        {label:'全局样式',path:'shared/styles/global-filter-bar.css',href:'../shared/styles/global-filter-bar.css'},
        {label:'配置与交互规范',path:'docs/filter-bar-spec.md',href:'../docs/filter-bar-spec.md'}
      ],
      usages: ['学习中心：课程管理与学情管理（组织树同源）', '其他页面按需求显式配置，未批量替换'], updatedAt: '2026-09-10'
    },
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
    },
    {
      id: 'form-modal-frame',
      parentId: 'modal-catalog',
      name: '表单弹窗框架',
      category: '真实弹窗预览',
      previewKind: 'formFrame',
      usages: []
    }
  ];
}());
