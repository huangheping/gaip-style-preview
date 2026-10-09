(function () {
  'use strict';

  var channels = [
  {
    "key": "workspace",
    "assets": { "bootstrapScripts": ["shared/scripts/html-view.js?v=20260925-1", "shared/runtime/page-vendor.js?v=20260925-1"], "styles": ["components/status-tag/global-status-tag.css?v=20261008-1", "components/table/global-table-tag.css?v=20261009-draft-solid-1"], "scripts": ["components/table/global-table-tag.js?v=20261009-draft-solid-1"] },
    "label": "工作台总览",
    "route": "/workspace",
    "entry": "channels/workspace/index.html",
    "icon": "workspace",
    "type": "dashboard",
    "directory": "channels/workspace",
    "implementation": "html-views-with-umi-adapter"
  },
  {
    "key": "customer",
    "label": "客户中心360",
    "route": "/customer",
    "entry": "channels/customer/index.html",
    "icon": "customer-360",
    "type": "master-detail",
    "assets": {
      "styles": [
        "components/modal/global-modal.css?v=20261008-product-details-1",
        "channels/customer/customer-center.css?v=20260922-style-separation-1"
      ],
      "scripts": [
        "components/modal/global-modal.js?v=20261008-close-2",
        "channels/customer/customer-center.js?v=20260925-html-structure-1"
      ]
    },
    "directory": "channels/customer",
    "implementation": "html-views-with-umi-adapter"
  },
  {
    "key": "policy",
    "label": "保单列表",
    "route": "/policy",
    "entry": "channels/policy/index.html",
    "icon": "quality-control",
    "type": "catalog",
    "directory": "channels/policy",
    "implementation": "html-views-with-umi-adapter"
  },
  {
    "key": "proposal",
    "label": "方案中心",
    "route": "/proposal",
    "entry": "channels/proposal-center/index.html",
    "icon": "proposal-center",
    "type": "master-detail",
    "assets": {
      "styles": [
        "components/tabs/global-tabs.css?v=20261008-proposal-clean-1",
        "components/modal/global-modal.css?v=20261008-product-details-1",
        "channels/proposal-center/proposal-center.css?v=20261008-typography-1"
      ],
      "scripts": [
        "components/tabs/global-tabs.js?v=20261008-product-details-1",
        "components/modal/global-modal.js?v=20261008-close-2",
        "channels/proposal-center/proposal-center.js?v=20261008-status-tag-1"
      ]
    },
    "directory": "channels/proposal-center",
    "implementation": "html-views-with-umi-adapter"
  },
  {
    "key": "product",
    "label": "产品中心",
    "route": "/product",
    "entry": "channels/product/index.html",
    "icon": "sales-enablement",
    "type": "catalog",
    "assets": {
      "bootstrapScripts": [
        "components/expert-directory/expert-directory.js?v=20260922-style-separation-1"
      ],
      "styles": [
        "components/expert-directory/expert-directory.css?v=20260922-style-separation-1",
        "web/p__dashboard__product__index.48332667.chunk.css?v=20260915-mb-plan-flag-1",
        "channels/product/product-card-logo.css?v=20260915-restore-1",
        "components/tabs/global-tabs.css?v=20261008-proposal-clean-1"
      ],
      "scripts": [
        "components/tabs/global-tabs.js?v=20261008-product-details-1",
        "channels/product/product-card-logo.js?v=20260930-local-icons-3"
      ]
    },
    "directory": "channels/product",
    "implementation": "html-views-with-umi-adapter"
  },
  {
    "key": "activity",
    "label": "活动中心",
    "route": "/activity",
    "entry": "channels/activity/index.html",
    "icon": "activity-center",
    "type": "dashboard",
    "assets": {
      "styles": [
        "components/carousel-controls/global-carousel-controls.css?v=20261008-icon-standard-1",
        "channels/activity/activity-sync.css?v=20260922-style-separation-1"
      ],
      "scripts": [
        "components/carousel-controls/global-carousel-controls.js?v=20260930-local-icons-3",
        "channels/activity/activity-sync.js?v=20260925-html-structure-1"
      ]
    },
    "directory": "channels/activity",
    "implementation": "html-views-with-umi-adapter"
  },
  {
    "key": "news",
    "label": "资讯中心",
    "route": "/workspace",
    "entry": "channels/news-center/index.html",
    "icon": "news-center",
    "type": "dashboard",
    "virtual": true,
    "query": "gaip-channel=news",
    "assets": {
      "styles": [
        "channels/news-center/news-center.css?v=20261008-icon-standard-1"
      ],
      "scripts": [
        "channels/news-center/templates.generated.js?v=20260922-1",
        "channels/news-center/news-center.js?v=20261001-merge-2"
      ]
    },
    "directory": "channels/news-center",
    "implementation": "local-renderer"
  },
  {
    "key": "wealth",
    "label": "财富值中心",
    "route": "/workspace",
    "entry": "channels/wealth-center/index.html",
    "icon": "wealth",
    "type": "operations",
    "virtual": true,
    "query": "gaip-channel=wealth",
    "assets": {
      "styles": [
        "channels/wealth-center/wealth-center.css?v=20261008-icon-standard-1"
      ],
      "scripts": [
        "channels/wealth-center/wealth-center.js?v=20260930-local-icons-3",
        "channels/wealth-center/wealth-nav.js?v=20260930-local-icons-3"
      ]
    },
    "directory": "channels/wealth-center",
    "implementation": "local-renderer"
  },
  {
    "key": "config",
    "label": "配置中心",
    "route": "/workspace",
    "entry": "channels/config-center/index.html",
    "icon": "organization",
    "type": "operations",
    "virtual": true,
    "query": "gaip-channel=config",
    "views": [
      {
        "key": "organization",
        "label": "组织架构"
      },
      {
        "key": "announcement-management",
        "label": "公告管理"
      },
      {
        "key": "operation-log",
        "label": "操作日志"
      }
    ],
    "assets": {
      "styles": [
        "components/tabs/global-tabs.css?v=20261008-proposal-clean-1",
        "channels/config-center/ant-source.css?v=20260930-local-icons-3",
        "channels/config-center/templates.css",
        "channels/config-center/announcement-management.css?v=20261001-merge-3",
        "channels/config-center/config-center-content.css?v=20261008-icon-standard-1", "components/table/global-table.css?v=20261009-action-hover-1",
        "components/modal/global-modal.css?v=20261008-product-details-1",
        "components/filter-bar/global-filter-bar.css?v=20261008-expand-1",
        "channels/config-center/config-center.css?v=20260930-local-icons-3"
      ],
      "scripts": [
        "components/tabs/global-tabs.js?v=20261008-product-details-1",
        "components/modal/global-modal.js?v=20261008-close-2",
        "components/table/global-table.js?v=20260929-course-menu-1",
        "shared/scripts/organization-store.js?v=20260910-org-1",
        "components/organization-tree/organization-tree.js?v=20261001-merge-1",
        "channels/config-center/source-markup.js?v=20261008-expand-1",
        "channels/config-center/announcement-management-view.js?v=20261008-icon-standard-1",
        "channels/config-center/config-center.js?v=20261008-expand-1"
      ]
    },
    "directory": "channels/config-center",
    "implementation": "local-renderer"
  },
  {
    "key": "induction",
    "label": "薄荷入职引导",
    "aliases": [
      "薄荷入职指引"
    ],
    "route": "/induction",
    "entry": "channels/induction/index.html",
    "icon": "induction-guide",
    "type": "guided-learning",
    "assets": {
      "bootstrapScripts": [
        "components/expert-directory/expert-directory.js?v=20260922-style-separation-1",
        "channels/induction/induction-update.js?v=20260925-html-structure-1"
      ],
      "styles": [
        "components/expert-directory/expert-directory.css?v=20260922-style-separation-1",
        "components/tabs/global-tabs.css?v=20261008-proposal-clean-1"
      ],
      "scripts": [
        "components/tabs/global-tabs.js?v=20261008-product-details-1"
      ]
    },
    "directory": "channels/induction",
    "implementation": "html-views-with-umi-adapter"
  },
  {
    "key": "clues",
    "assets": { "styles": ["channels/clues/layout-patch.css?v=20260922-style-separation-1"] },
    "label": "线索中心",
    "route": "/clues",
    "entry": "channels/clues/index.html",
    "icon": "channel-clues",
    "type": "dashboard",
    "directory": "channels/clues",
    "implementation": "html-views-with-umi-adapter"
  },
  {
    "key": "learning",
    "label": "学习中心",
    "route": "/workspace",
    "entry": "channels/learning-center/index.html",
    "icon": "learning",
    "type": "guided-learning",
    "virtual": true,
    "query": "gaip-channel=learning",
    "assets": {
      "styles": [
        "components/carousel-controls/global-carousel-controls.css?v=20261008-icon-standard-1",
        "components/tabs/global-tabs.css?v=20261008-proposal-clean-1",
        "components/date-picker/global-date-picker.css?v=20260930-local-icons-3",
        "components/multi-select/global-multi-select.css?v=20261008-expand-1",
        "components/organization-tree/organization-tree.css?v=20261008-icon-standard-1",
        "components/filter-bar/global-filter-bar.css?v=20261008-expand-1",
        "channels/learning-center/learning-center.css?v=20261009-delete-solid-1",
        "components/modal/global-modal.css?v=20261008-product-details-1",
        "shared/styles/global-page-form.css?v=20260910-feedback-1",
        "components/table/global-table.css?v=20261009-action-hover-1"
      ],
      "scripts": [
        "components/carousel-controls/global-carousel-controls.js?v=20260930-local-icons-3",
        "components/tabs/global-tabs.js?v=20261008-product-details-1",
        "components/date-picker/global-date-picker.js?v=20260909-date-1",
        "components/operation-log/operation-log-xlsx.js?v=20260909-v11",
        "components/multi-select/global-multi-select.js?v=20260925-html-structure-1",
        "components/filter-bar/global-filter-bar.js?v=20260910-tree-combobox-1",
        "shared/scripts/organization-store.js?v=20260910-org-1",
        "components/organization-tree/organization-tree.js?v=20261001-merge-1",
        "channels/learning-center/learning-data.js?v=20260922-asset-paths-1",
        "components/table/global-table.js?v=20260929-course-menu-1",
        "channels/learning-center/learning-live-data.js?v=20261002-live-remock-1",
        "channels/learning-center/learning-live.js?v=20261009-live-delete-1",
        "channels/learning-center/learning-app.js?v=20261009-delete-solid-1",
        "channels/learning-center/templates.generated.js",
        "channels/learning-center/learning-center.js?v=20260930-learning-scroll-1"
      ]
    },
    "directory": "channels/learning-center",
    "implementation": "local-renderer"
  }
];

  var byKey = {};
  var byRoute = {};
  var byLabel = {};

  channels.forEach(function (channel) {
    byKey[channel.key] = channel;
    byLabel[channel.label] = channel;

    if (!channel.virtual) {
      byRoute[channel.route] = channel;
    }

    (channel.aliases || []).forEach(function (alias) {
      byLabel[alias] = channel;
    });
  });

  window.__GAIP_CHANNEL_CONFIG__ = {
    list: channels,
    standaloneEntries: [{id: 'login', directory: 'channels/login', entry: 'channels/login/index.html'}, {id: 'login-video-test', directory: 'channels/login-video-test', entry: 'channels/login-video-test/index.html', localOnly: true}],
    // 仅决定主导航视觉顺序，不改变频道资源加载和原生路由的顺序。
    sidebarOrder: ['workspace', 'clues', 'customer', 'proposal', 'product', 'policy',
      'news', 'activity', 'learning', 'induction', 'wealth', 'config'],
    byKey: byKey,
    byRoute: byRoute,
    byLabel: byLabel,
    getByKey: function (key) {
      return byKey[key] || null;
    },
    getByRoute: function (route) {
      return byRoute[route] || null;
    },
    getByLabel: function (label) {
      return byLabel[label] || null;
    }
  };
})();
