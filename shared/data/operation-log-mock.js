(function () {
  'use strict';

  // 展示数据，不采集用户操作；账号与 TEST-NET IP 均为虚构。
  var people = [
    { name: '林予安', account: 'demo_ops01', ip: '192.0.2.10' },
    { name: '陈知行', account: 'demo_editor02', ip: '192.0.2.20' },
    { name: '周明悦', account: 'demo_advisor03', ip: '192.0.2.30' }
  ];
  var scenarios = [
    {
      module: '公告管理', type: '新增', content: '九月平台服务安排',
      before: null,
      after: {
        '简体中文标题': '九月平台服务安排',
        '繁體中文標題': '九月平台服務安排',
        'English title': 'September platform service schedule',
        '展示开始时间': '2026-09-01 09:00:00',
        '展示结束时间': '2026-09-07 23:59:59'
      }
    },
    {
      module: '公告管理', type: '编辑', content: '【新功能】线索中心上线，欢迎体验',
      before: { '繁體中文標題': '【新功能】線索中心上線，歡迎體驗', '展示结束时间': '2026-08-31 23:59:59' },
      after: { '繁體中文標題': '【新功能】線索中心上線，立即探索全新客戶跟進體驗', '展示结束时间': '2026-09-07 23:59:59' }
    },
    {
      module: '资讯中心', type: '查看',
      content: '资讯标题：全球市场周报：汇率变化与资产配置观察\n原文链接：https://example.com/market-weekly\n资讯日期：2026-08-31\n内容摘要：本期聚焦主要市场动态、汇率变化与长期资产配置。关注经济数据、市场波动与客户需求的变化，帮助顾问梳理日常沟通要点。此条为本地展示用模拟资讯，并非真实新闻或投资建议。',
      before: null, after: null
    },
    {
      module: '公告管理', type: '删除', content: '夏日客户交流活动开启，点击查看详情',
      before: {
        '简体中文标题': '夏日客户交流活动开启，点击查看详情',
        '繁體中文標題': '夏日客戶交流活動開啟，點擊查看詳情',
        'English title': 'Summer client event is now open',
        '展示开始时间': '2026-08-24 16:00:00',
        '展示结束时间': '2026-08-31 15:59:59'
      }, after: null
    },
    {
      module: '资讯中心', type: '编辑', content: '晨间必读：本周市场关注要点',
      before: { '资讯标题': '本周市场关注要点', '分类': '市场动态', '状态': '草稿' },
      after: { '资讯标题': '晨间必读：本周市场关注要点', '分类': '市场动态', '状态': '已发布' }
    },
    {
      module: '资讯中心', type: '新增', content: '顾问服务：客户沟通资料更新',
      before: null, after: { '资讯标题': '顾问服务：客户沟通资料更新', '分类': '服务指南', '资讯日期': '2026-08-28' }
    },
    {
      module: '资讯中心', type: '删除', content: '已过期活动资讯归档',
      before: { '资讯标题': '八月线上分享会报名提醒', '状态': '已过期' }, after: null
    },
    {
      module: '公告管理', type: '查看', content: '查看公告：平台使用指引与常见问题',
      before: null, after: null
    }
  ];

  window.__GAIP_OPERATION_LOG_DATA__ = Array.from({ length: 28 }, function (_, i) {
    var source = scenarios[i % scenarios.length];
    var person = people[i % people.length];
    var day = String(31 - Math.floor(i / 4)).padStart(2, '0');
    return {
      id: 'mock-log-' + (i + 1),
      time: '2026-08-' + day + ' ' + ['17:11:16', '15:32:02', '11:10:46', '09:10:38'][i % 4],
      name: person.name, account: person.account, ip: person.ip,
      module: source.module, type: source.type, content: source.content,
      before: source.before, after: source.after
    };
  });
}());
