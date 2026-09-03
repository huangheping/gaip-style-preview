(function () {
  'use strict';

  if (window.__GAIP_ANNOUNCEMENT_MOCK_DATA__) return;

  function exactly100(seed) {
    var value = '';
    while (value.length < 100) value += seed;
    return value.slice(0, 100);
  }

  window.__GAIP_ANNOUNCEMENT_MOCK_DATA__ = [
    {
      id: 'announcement-001',
      simplified: '系统将于本周六凌晨进行维护升级',
      traditional: '系統將於本週六凌晨進行維護升級',
      english: 'System maintenance scheduled for Saturday',
      start: '2026-09-01T01:00:00',
      end: '2026-09-08T15:59:59'
    },
    {
      id: 'announcement-002',
      simplified: '【新功能】线索中心已上线，欢迎体验',
      traditional: '【新功能】線索中心已上線，歡迎體驗',
      english: 'The new lead center is now available',
      start: '2026-08-19T01:00:00',
      end: '2026-09-13T15:59:59'
    },
    {
      id: 'announcement-100-character',
      simplified: exactly100('【百字标题展示示例】本公告用于检查标题达到一百字时的列表省略、悬停全文和编辑输入框自动增高效果。'),
      traditional: exactly100('【百字標題展示示例】本公告用於檢查標題達到一百字時的列表省略、懸停全文和編輯輸入框自動增高效果。'),
      english: exactly100('One hundred character title example for list truncation, full hover text, and auto-growing editor. '),
      start: '2026-09-21T09:30:00',
      end: '2026-10-18T18:30:00'
    },
    {
      id: 'announcement-003',
      simplified: '九月客户服务活动安排及报名说明',
      traditional: '',
      english: 'September client service events',
      start: '2026-09-02T09:00:00',
      end: '2026-09-18T23:59:59'
    },
    {
      id: 'announcement-004',
      simplified: '渠道专属：第三季度考核规则更新说明',
      traditional: '渠道專屬：第三季度考核規則更新說明',
      english: '',
      start: '2026-08-23T01:00:00',
      end: '2026-09-08T15:59:59'
    },
    {
      id: 'announcement-005',
      simplified: 'MINZ 专属：新客户回访话术模板已更新',
      traditional: '',
      english: '',
      start: '2026-08-23T01:00:00',
      end: '2026-09-08T15:59:59'
    },
    {
      id: 'announcement-006',
      simplified: '【未开始示例】年度峰会预告',
      traditional: '【未開始示例】年度峰會預告',
      english: 'Annual summit preview',
      start: '2026-09-10T09:00:00',
      end: '2026-09-20T23:59:59'
    },
    {
      id: 'announcement-007',
      simplified: '【已下架示例】八月服务时间调整通知',
      traditional: '',
      english: '',
      start: '2026-08-01T09:00:00',
      end: '2026-08-31T23:59:59'
    },
    {
      id: 'announcement-008',
      simplified: '',
      traditional: '香港辦公室假期服務安排',
      english: 'Hong Kong office holiday service arrangement',
      start: '2026-09-16T09:00:00',
      end: '2026-09-19T23:59:59'
    },
    {
      id: 'announcement-009',
      simplified: '',
      traditional: '',
      english: 'Client portal security update',
      start: '2026-07-15T09:00:00',
      end: '2026-07-22T23:59:59'
    },
    {
      id: 'announcement-010',
      simplified: '顾问学习中心九月课程更新',
      traditional: '顧問學習中心九月課程更新',
      english: '',
      start: '2026-09-05T09:00:00',
      end: '2026-09-30T23:59:59'
    },
    {
      id: 'announcement-011',
      simplified: '产品资料下载服务短时维护',
      traditional: '',
      english: 'Product material service maintenance',
      start: '2026-06-12T01:00:00',
      end: '2026-06-12T06:00:00'
    },
    {
      id: 'announcement-012',
      simplified: '国庆假期客户服务时间安排',
      traditional: '國慶假期客戶服務時間安排',
      english: 'National Day holiday service arrangement',
      start: '2026-09-25T09:00:00',
      end: '2026-10-08T23:59:59'
    },
    {
      id: 'announcement-013',
      simplified: '客户中心数据看板升级说明',
      traditional: '',
      english: '',
      start: '2026-05-01T09:00:00',
      end: '2026-05-15T23:59:59'
    },
    {
      id: 'announcement-014',
      simplified: '合规培训考试开放通知',
      traditional: '合規培訓考試開放通知',
      english: '',
      start: '2026-09-07T09:00:00',
      end: '2026-09-28T23:59:59'
    },
    {
      id: 'announcement-015',
      simplified: '财富值中心数据更新时间调整',
      traditional: '',
      english: 'Wealth center data refresh schedule',
      start: '2026-04-12T09:00:00',
      end: '2026-04-18T23:59:59'
    },
    {
      id: 'announcement-016',
      simplified: '新加坡办公室系统升级预告',
      traditional: '',
      english: 'Singapore office system upgrade',
      start: '2026-10-02T01:00:00',
      end: '2026-10-02T06:00:00'
    },
    {
      id: 'announcement-017',
      simplified: '服务条款历史版本归档通知',
      traditional: '',
      english: '',
      start: '2026-03-01T09:00:00',
      end: '2026-03-31T23:59:59'
    }
  ];
}());
