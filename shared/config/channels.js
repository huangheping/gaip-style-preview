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
      type: 'master-detail'
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
      type: 'master-detail'
    },
    {
      key: 'product',
      label: '产品中心',
      route: '/product',
      entry: '产品中心.html',
      icon: 'sales-enablement',
      type: 'catalog'
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
