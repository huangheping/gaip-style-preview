(function () {
  'use strict';

  window.__GAIP_GLOBAL_COMPONENTS__ = [
    {
      id:'icons', name:'图标', category:'基础样式', status:'现有图标盘点 · 风格待定', previewKind:'iconCatalog',
      description:'排列项目现有图标，按用途、频道和来源检索；原尺寸与放大轮廓并列，保留同用途的不同版本，供统一风格时比较。',
      api:'window.__GAIP_ICON_CATALOG__.mount(root)', trigger:'组件目录专用预览',
      sources:[{label:'盘点规则',path:'docs/icon-catalog-spec.md',href:'../docs/icon-catalog-spec.md'},{label:'盘点生成器',path:'scripts/build-icon-catalog.cjs',href:'../scripts/build-icon-catalog.cjs'}],
      usages:['正式频道及共享组件：源码来源逐项列于图标卡片','新风格与使用规则：待确认后收录标准图标库'], updatedAt:'2026-09-30'
    },
    {
      id:'status-tags', name:'状态标签', category:'基础样式', status:'首个业务场景接入', previewKind:'statusTags',
      description:'用于卡片和详情摘要的只读业务状态；与表格紧凑标签分开，当前提供成功和待处理两种语义。',
      api:'data-gaip-status-tag="success|warning"', trigger:'业务显式标记，不自动接管普通文字',
      sources:[{label:'共享样式',path:'components/status-tag/global-status-tag.css',href:'../components/status-tag/global-status-tag.css?v=20261008-1'},{label:'接入说明',path:'components/status-tag/README.md',href:'../components/status-tag/README.md'},{label:'设计规范',path:'docs/status-tag-spec.md',href:'../docs/status-tag-spec.md'}],
      usages:['方案中心 · 我的方案记录：已归属 / 待确认客户归属'], updatedAt:'2026-10-08'
    },
    {
      id:'carousel-controls',name:'轮播切换',category:'导航与切换',status:'两频道共用',
      description:'活动中心同款圆形箭头，搭配圆点与选中胶囊指示点；单组隐藏，支持手动循环切换。内容布局与自动播放由业务决定。',
      api:'window.__GAIP_CAROUSEL_CONTROLS__.mount(root, options)',trigger:'显式挂载',previewKind:'carouselControls',
      sources:[{label:'共享脚本',path:'components/carousel-controls/global-carousel-controls.js',href:'../components/carousel-controls/global-carousel-controls.js?v=20260930-local-icons-3'},{label:'共享样式',path:'components/carousel-controls/global-carousel-controls.css',href:'../components/carousel-controls/global-carousel-controls.css?v=20261008-icon-standard-1'},{label:'接入规范',path:'docs/carousel-controls-spec.md',href:'../docs/carousel-controls-spec.md'}],
      usages:['活动中心：原 Banner（保留原生指示器与轮播）','学习中心：直播卡片按组切换'],updatedAt:'2026-09-22'
    },
    {
      id:'underline-tabs',name:'下划线 Tab',category:'导航与切换',status:'五频道统一',
      description:'统一字号、颜色、间距与静态下划线；支持数量、禁用项及键盘切换。页面位置与业务切换由页面负责。',
      api:'window.__GAIP_TABS__.mount(root, config)',trigger:'新组件显式挂载；六处既有Tab通过同源适配器接入',previewKind:'underlineTabs',
      sources:[
        {label:'共享脚本',path:'components/tabs/global-tabs.js',href:'../components/tabs/global-tabs.js'},
        {label:'共享样式',path:'components/tabs/global-tabs.css',href:'../components/tabs/global-tabs.css'},
        {label:'接入规范',path:'docs/tabs-spec.md',href:'../docs/tabs-spec.md'}
      ],usages:['产品中心：产品分类（保留数量）、29产品详情','配置中心：组织架构渠道','学习中心：学员/课程学习统计','薄荷入职引导：顶部章节切换（保留学习进度与解锁限制）','方案中心：全部方案 / 我的方案记录'],updatedAt:'2026-10-08'
    },
    {
      id: 'date-picker', name: '日期选择器', category: '筛选与选择', status: '统一共享',
      description: '统一使用 Ant Design 日历样式，选择条保留现有规范；支持单个日期、日期范围及弹窗日期字段。',
      api: 'window.__GAIP_DATE_PICKER__.mount(panel, options)', trigger: '由现有日期选择条打开', previewKind: 'datePicker',
      sources: [
        {label:'共享脚本',path:'components/date-picker/global-date-picker.js',href:'../components/date-picker/global-date-picker.js'},
        {label:'共享样式',path:'components/date-picker/global-date-picker.css',href:'../components/date-picker/global-date-picker.css?v=20260930-local-icons-3'},
        {label:'接入规范',path:'docs/date-picker-spec.md',href:'../docs/date-picker-spec.md'}
      ],
      usages: ['普通弹窗：日期与日期时间字段', '学习中心课程管理：共享筛选栏日期组件'], updatedAt: '2026-09-09'
    },
    {
      id: 'global-table', name: '全局表格', category: '表格与分页', status: '多场景已接入',
      description: '统一表头、操作按钮和分页。内容少时自然收拢，达到可用高度后数据区域独立滚动。以下列出完整表格组件的使用位置，仅统一标签的旧表格不计入；“更多”菜单目前在课程管理试用，与本预览共用交互。',
      api: 'window.__GAIP_TABLE__.mount(root, config)', trigger: '显式挂载', previewKind: 'globalTable',
      sources: [
        {label:'共享脚本',path:'components/table/global-table.js',href:'../components/table/global-table.js?v=20260929-course-menu-1'},
        {label:'共享样式',path:'components/table/global-table.css',href:'../components/table/global-table.css?v=20261009-action-hover-1'},
        {label:'接入规范',path:'docs/table-spec.md',href:'../docs/table-spec.md'}
      ],
      usages: [
        {
          "label": "学习中心 · 课程管理：课程列表",
          "links": [
            {
              "label": "查看页面",
              "href": "../channels/learning-center/index.html#/workspace?gaip-channel=learning&gaip-learning-view=manage"
            }
          ]
        },
        {
          "label": "学习中心 · 直播管理：Banner 列表（不分页）",
          "links": [
            {
              "label": "查看页面",
              "href": "../channels/learning-center/index.html#/workspace?gaip-channel=learning&gaip-learning-view=live"
            }
          ]
        },
        {
          "label": "学习中心 · 学情管理：学员学习统计、课程学习统计",
          "links": [
            {
              "label": "学员统计",
              "href": "../channels/learning-center/index.html#/workspace?gaip-channel=learning&gaip-learning-view=stats&gaip-learning-tab=users"
            },
            {
              "label": "课程统计",
              "href": "../channels/learning-center/index.html#/workspace?gaip-channel=learning&gaip-learning-view=stats&gaip-learning-tab=courses"
            }
          ]
        },
        {
          "label": "学习中心 · 学情管理：学员学习详情、课程学习详情弹窗",
          "links": [
            {
              "label": "学员详情",
              "href": "./弹窗预览.html?embed=learning-study-detail"
            },
            {
              "label": "课程详情",
              "href": "./弹窗预览.html?embed=learning-course-study-detail"
            }
          ]
        },
        {
          "label": "学习中心 · 课程管理 / 直播管理：课程与直播操作日志（同一日志表格）",
          "links": [
            {
              "label": "查看弹窗",
              "href": "./弹窗预览.html?embed=learning-course-log"
            }
          ]
        },
        {
          "label": "学习中心 · 学情管理：学情操作日志弹窗",
          "links": [
            {
              "label": "查看弹窗",
              "href": "./弹窗预览.html?embed=learning-study-log"
            }
          ]
        },
        {
          "label": "活动中心：报名记录弹窗（不分页，活动主列表未接入）",
          "links": [
            {
              "label": "查看弹窗",
              "href": "./弹窗预览.html?embed=activity-record"
            }
          ]
        },
        {
          "label": "配置中心 · 组织架构：操作日志弹窗（成员列表未接入）",
          "links": [
            {
              "label": "查看弹窗",
              "href": "./弹窗预览.html?embed=config-organization-log"
            }
          ]
        },
        {
          "label": "共享操作日志：弹窗版已接入；配置中心页面内联版未接入",
          "links": [
            {
              "label": "查看弹窗",
              "href": "./弹窗预览.html?embed=operation-log"
            }
          ]
        },
        {
          "label": "组件目录：少量数据、长列表、宽表、空态、加载中、错误及更多操作演示",
          "links": [
            {
              "label": "查看演示",
              "href": "#global-table",
              "sameTab": true
            }
          ]
        }
      ], updatedAt: '2026-09-29'
    },
    {
      id: 'table-tags', parentId: 'global-table', name: '表格标签', category: '表格与分页', status: '全局统一 · 六种基础色＋推荐色',
      description: '按业务含义统一颜色，保留组织架构的紧凑尺寸。提供尺寸说明、宽窄列组合示例，并按频道、页面／表格和字段展示实际标签，支持搜索与颜色筛选。',
      api: 'window.__GAIP_TABLE_TAG__.create(text, options) / createGroup(items, options)', trigger: '共享表格 tag()；旧表格原节点适配', previewKind: 'tableTags',
      sources: [
        {label:'文案与分类',path:'components/table/global-table-tag.js',href:'./table/global-table-tag.js'},
        {label:'语义色与尺寸',path:'components/table/global-table-tag.css',href:'./table/global-table-tag.css'},
        {label:'使用来源登记',path:'components/table-tag-sources.js',href:'./table-tag-sources.js?v=20261008-icon-sizing-1'},
        {label:'当前规范',path:'docs/table-tag-spec.md',href:'../docs/table-tag-spec.md'},
        {label:'保留的 v1 方案',path:'docs/table-tag-color-mapping-v1.md',href:'../docs/table-tag-color-mapping-v1.md'}
      ],
      usages: ['组织架构 / 线索 / 活动表格', '课程 / 直播 / 学情表格', '公告 / 财富值表格', '组织 / 课程 / 直播 / 共享操作日志'], updatedAt: '2026-09-29'
    },
    {
      id: 'filter-bar', name: '可配置筛选栏', category: '筛选与选择', status: '首版接入',
      description: '统一单选、输入框直接搜索的组织树下拉、折叠式多选、开关、搜索、日期/数字范围、查询与重置；按页面配置显隐，更多筛选可收起。',
      api: 'window.__GAIP_FILTER_BAR__.mount(root, config)', trigger: '显式挂载，不自动接管旧页面', previewKind: 'filterBar',
      sources: [
        {label:'全局脚本',path:'components/filter-bar/global-filter-bar.js',href:'../components/filter-bar/global-filter-bar.js'},
        {label:'全局样式',path:'components/filter-bar/global-filter-bar.css',href:'../components/filter-bar/global-filter-bar.css?v=20261001-merge-1'},
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
          path: 'components/ai-notice/global-ai-notice.js',
          href: '../components/ai-notice/global-ai-notice.js'
        },
        {
          label: '全局样式',
          path: 'components/ai-notice/global-ai-notice.css',
          href: '../components/ai-notice/global-ai-notice.css'
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
          path: 'components/multi-select/global-multi-select.js',
          href: '../components/multi-select/global-multi-select.js'
        },
        {
          label: '全局样式',
          path: 'components/multi-select/global-multi-select.css',
          href: '../components/multi-select/global-multi-select.css?v=20261002-collapse-1'
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
          path: 'components/poster-share/global-poster-share.js',
          href: '../components/poster-share/global-poster-share.js'
        },
        {
          label: '全局样式',
          path: 'components/poster-share/global-poster-share.css',
          href: '../components/poster-share/global-poster-share.css'
        },
        {
          label: '独立组件项目',
          path: 'components/海报分享/index.html',
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
      trigger: 'components/弹窗预览.html',
      previewKind: 'modalCatalog',
      sources: [
        {
          label: '预览页面',
          path: 'components/弹窗预览.html',
          href: './弹窗预览.html'
        },
        {
          label: '运行时注册器',
          path: 'shared/scripts/modal-registry.js',
          href: '../shared/scripts/modal-registry.js'
        },
        {
          label: '自动索引',
          path: 'components/弹窗自动索引.generated.js',
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
  ].concat(window.__GAIP_UPLOAD_COMPONENTS__ || []);
}());
