(function () {
  'use strict';
  // Preview-only provenance, reviewed against current renderers and their data.
  // Keep vocabulary, colors and icons in the shared tag factory.
  var locations = [
    {channel:'配置中心',page:'组织架构 · 成员列表',field:'姓名（管理员标记）',labels:['管理员'],source:'channels/config-center/config-center.js'},
    {channel:'配置中心',page:'组织架构 · 成员列表',field:'身份',labels:['人管','佣金','线索管理','线索跟进'],source:'channels/config-center/config-center.js'},
    {channel:'配置中心',page:'组织架构 · 成员列表',field:'持牌身份',labels:['持牌','不持牌','新加坡','美国','百慕大','香港'],source:'channels/config-center/templates/table.html'},
    {channel:'配置中心',page:'组织架构 · 成员列表',field:'转介绍人',labels:['内部转介绍人','外部转介绍人'],source:'channels/config-center/templates/table.html'},
    {channel:'线索中心',page:'线索列表',field:'线索类型',labels:['客户业务','渠道合作','经纪人招募'],source:'channels/clues/page.js'},
    {channel:'线索中心',page:'线索列表',field:'规划方向',labels:['身份规划','资产配置','财富传承','保险规划','税务规划','子女教育'],source:'channels/clues/page.js'},
    {channel:'线索中心',page:'线索列表',field:'状态',labels:['待分配','待跟进','跟进中','已转化','已关闭'],source:'channels/clues/page.js'},
    {channel:'活动中心',page:'活动列表',field:'状态',labels:['筹备中','报名中','报名结束','进行中','活动结束'],source:'channels/activity/page.js'},
    {channel:'财富值中心',page:'导入工作台 · 文件列表',field:'类型',labels:['上线奖','保险财富值'],source:'channels/wealth-center/wealth-center.js'},
    {channel:'财富值中心',page:'导入工作台 · 文件列表',field:'结果',labels:['通过','预警','失败'],source:'channels/wealth-center/wealth-center.js'},
    {channel:'财富值中心',page:'导入记录 · 批次列表',field:'批次类型',labels:['历史导入','补充导入'],source:'channels/wealth-center/wealth-center.js'},
    {channel:'财富值中心',page:'导入记录 · 批次列表',field:'批次状态',labels:['待提交','已提交','解析失败'],source:'channels/wealth-center/wealth-center.js'},
    {channel:'财富值中心',page:'导入记录 · 批次列表',field:'月份状态',labels:['待核对','已核对','创建失败'],source:'channels/wealth-center/wealth-center.js'},
    {channel:'财富值中心',page:'导入记录 · 批次文件明细',field:'识别类型',labels:['上线奖','保险财富值','移民财富值'],source:'channels/wealth-center/wealth-center.js'},
    {channel:'财富值中心',page:'导入记录 · 批次文件明细',field:'结果',labels:['通过','预警','失败'],source:'channels/wealth-center/wealth-center.js'},
    {channel:'财富值中心',page:'我的财富值 · 明细列表',field:'财富值类型',labels:['上线奖','保险财富值','移民财富值','补发财富值'],source:'channels/wealth-center/wealth-center.js'},
    {channel:'财富值中心',page:'我的财富值 · 明细列表',field:'状态',labels:['已发放'],source:'channels/wealth-center/wealth-center.js'},
    {channel:'配置中心',page:'公告管理 · 公告列表',field:'状态',labels:['未开始','展示中','已下架'],source:'channels/config-center/announcement-management-view.js'},
    {channel:'学习中心',page:'课程管理 · 课程列表',field:'课程名称（精选标记）',labels:['精选'],source:'channels/learning-center/learning-app.js'},
    {channel:'学习中心',page:'课程管理 · 课程列表',field:'状态',labels:['草稿','已上架','已下架'],source:'channels/learning-center/learning-app.js'},
    {channel:'学习中心',page:'直播管理 · Banner 列表',field:'Banner 状态',labels:['草稿','已上架','已下架'],source:'channels/learning-center/learning-live.js'},
    {channel:'学习中心',page:'学情管理 · 课程学习统计',field:'状态',labels:['已上架','已下架'],source:'channels/learning-center/learning-app.js'},
    {channel:'学习中心',page:'学情管理 · 学员学习详情',field:'课程状态',labels:['已上架','已下架'],source:'channels/learning-center/learning-app.js'},
    {channel:'学习中心',page:'学情管理 · 学员学习详情',field:'学习状态',labels:['未学习','学习中','已完成'],source:'channels/learning-center/learning-app.js'},
    {channel:'学习中心',page:'学情管理 · 课程学习详情',field:'学习状态',labels:['未学习','学习中','已完成'],source:'channels/learning-center/learning-app.js'},
    {channel:'学习中心',page:'课程与直播操作日志 · 课程',field:'分类',labels:['新增','编辑','删除','上架','下架','上架课节','下架课节'],source:'channels/learning-center/learning-app.js'},
    {channel:'学习中心',page:'课程与直播操作日志 · 直播 Banner',field:'分类',labels:['新增','编辑','删除','上架','下架'],source:'channels/learning-center/learning-live-data.js'},
    {channel:'配置中心',page:'操作日志 · 公告管理',field:'操作类型',labels:['新增','编辑','删除','查看'],source:'components/operation-log/operation-log-mock.js'},
    {channel:'配置中心',page:'操作日志 · 资讯中心',field:'操作类型',labels:['新增','编辑','删除','查看'],source:'components/operation-log/operation-log-mock.js'},
    {channel:'配置中心',page:'组织架构 · 操作日志',field:'操作类型',labels:['新增成员','新增部门','编辑成员','修改成员身份','修改部门','设置管理员','调整节点','删除成员','导出成员名单'],source:'channels/config-center/config-center.js'}
  ];
  var byLabel = Object.create(null);
  locations.forEach(function (location) {
    location.labels.forEach(function (label) {
      if (!byLabel[label]) byLabel[label] = [];
      byLabel[label].push(location);
    });
    Object.freeze(location.labels); Object.freeze(location);
  });
  Object.keys(byLabel).forEach(function (label) { Object.freeze(byLabel[label]); });
  window.__GAIP_TABLE_TAG_SOURCES__ = Object.freeze(byLabel);
  window.__GAIP_TABLE_TAG_LOCATIONS__ = Object.freeze(locations);
}());
