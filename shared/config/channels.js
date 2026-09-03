(function () {
  'use strict';

  var channels = [
    {
      key: 'workspace',
      label: '工作台总览',
      route: '/workspace',
      entry: '工作台.html',
      icon: 'workspace',
      type: 'dashboard'
    },
    {
      key: 'customer',
      label: '客户中心360',
      route: '/customer',
      entry: '客户中心360.html',
      icon: 'customer-360',
      type: 'master-detail',
      assets: {
        styles: ['features/customer/customer-center.css?v=20260825-1'],
        scripts: ['features/customer/customer-center.js?v=20260825-1']
      }
    },
    {
      key: 'policy',
      label: '保单列表',
      route: '/policy',
      entry: '保单列表.html',
      icon: 'quality-control',
      type: 'catalog'
    },
    {
      key: 'proposal',
      label: '方案中心',
      route: '/proposal',
      entry: '方案中心.html',
      icon: 'proposal-center',
      type: 'master-detail',
      assets: {
        styles: ['features/proposal-center/proposal-center.css'],
        scripts: ['features/proposal-center/proposal-center.js?v=20260901-1']
      }
    },
    {
      key: 'product',
      label: '产品中心',
      route: '/product',
      entry: '产品中心.html',
      icon: 'sales-enablement',
      type: 'catalog',
      assets: {
        styles: ['web/p__dashboard__product__index.48332667.chunk.css?v=20260831-2']
      }
    },
    {
      key: 'activity',
      label: '活动中心',
      route: '/activity',
      entry: '活动中心.html',
      icon: 'news-center',
      type: 'dashboard'
    },
    {
      key: 'news',
      label: '资讯中心',
      route: '/workspace',
      entry: '资讯中心.html',
      icon: 'news-center',
      type: 'dashboard',
      virtual: true,
      query: 'gaip-channel=news',
      assets: {
        styles: ['features/news-center/news-center.css?v=20260827-1'],
        scripts: [
          'features/news-center/mock-data.js?v=20260826-2',
          'features/news-center/news-center.js?v=20260901-1'
        ]
      }
    },
    {
      key: 'wealth',
      label: '财富值中心',
      route: '/workspace',
      entry: '财富值中心.html',
      icon: 'wealth',
      type: 'operations',
      virtual: true,
      query: 'gaip-channel=wealth',
      assets: {
        styles: ['features/wealth-center/wealth-center.css?v=20260902-2'],
        scripts: [
          'features/wealth-center/mock-data.js?v=20260825-9',
          'features/wealth-center/wealth-center.js?v=20260901-1',
          'features/wealth-center/wealth-nav.js?v=20260901-3'
        ]
      }
    },
    {
      key: 'config',
      label: '配置中心',
      route: '/workspace',
      entry: '配置中心.html',
      icon: 'organization',
      type: 'operations',
      virtual: true,
      query: 'gaip-channel=config',
      views: [
        { key: 'organization', label: '组织架构' },
        { key: 'operation-log', label: '操作日志' }
      ],
      assets: {
        styles: ['features/config-center/ant-source.css?v=20260831-1', 'features/config-center/config-center-content.css?v=20260903-30', 'features/config-center/config-center.css?v=20260902-8'],
        scripts: ['features/config-center/source-markup.js?v=20260902-1', 'features/config-center/config-center.js?v=20260903-39']
      }
    },
    {
      key: 'induction',
      label: '薄荷入职引导',
      aliases: ['薄荷入职指引'],
      route: '/induction',
      entry: '薄荷入职指引.html',
      icon: 'induction-guide',
      type: 'guided-learning'
    },
    {
      key: 'clues',
      label: '线索中心',
      route: '/clues',
      entry: '线索中心.html',
      icon: 'channel-clues',
      type: 'dashboard'
    },
    {
      key: 'learning',
      label: '学习中心',
      route: '/workspace',
      entry: '学习中心.html',
      icon: 'learning',
      type: 'guided-learning',
      virtual: true,
      query: 'gaip-channel=learning'
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
