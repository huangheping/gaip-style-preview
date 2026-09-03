(function () {
  'use strict';

  /* iframe 会把 <base> 指回项目根目录；资源路径统一从根目录解析。 */
  var font = 'shared/styles/global-font.css';
  var umi = 'web/umi.c6286171.css';
  var configStyles = [umi, font, 'features/config-center/ant-source.css?v=20260831-1', 'features/config-center/config-center-content.css?v=20260903-23', 'features/config-center/config-center.css?v=20260902-8'];
  var configScripts = ['shared/config/channels.js?v=20260903-44', 'features/config-center/source-markup.js?v=20260902-1', 'features/config-center/config-center.js?v=20260903-34'];

  var entries = [
    {
      id: 'ai-notice', title: 'AI 内容重要提示', channel: '共享组件', type: 'modal', status: 'ready', height: 720,
      source: 'window.__GAIP_AI_NOTICE__.show()',
      invoke: { path: '__GAIP_AI_NOTICE__.show', args: [] },
      styles: [umi, font, 'shared/styles/global-ai-notice.css'],
      scripts: ['shared/scripts/global-ai-notice.js']
    },
    {
      id: 'poster-share', title: '文章海报分享', channel: '资讯中心 / 共享组件', type: 'modal', status: 'ready', height: 900,
      source: 'window.__GAIP_POSTER_SHARE__.open(article)',
      invoke: { path: '__GAIP_POSTER_SHARE__.open', args: [{ id:'source-preview', title:'全球资金重估 AI 投资周期，美元利率窗口进入观察期', summary:'主要市场继续围绕 AI 资本开支、美元利率路径和能源价格重新定价。', category:'宏观经济', tags:['AI投资','美元趋势'], date:'2026-09-01 09:12', score:94, slot:'晨间快讯', featured:true }] },
      styles: [umi, font, 'shared/styles/global-poster-share.css'],
      scripts: ['shared/scripts/global-poster-share.js']
    },
    {
      id: 'operation-log', title: '操作日志', channel: '配置中心 / 共享组件', type: 'modal', status: 'ready', height: 900,
      source: 'window.__GAIP_OPERATION_LOG__.show()',
      invoke: { path: '__GAIP_OPERATION_LOG__.show', args: [] },
      styles: [umi, font, 'shared/styles/global-operation-log.css'],
      scripts: ['shared/data/operation-log-mock.js', 'shared/scripts/operation-log-xlsx.js', 'shared/scripts/global-operation-log.js']
    },
    {
      id: 'agent-main', title: 'GAIP Agent 助手主面板', channel: '全局 AI Agent', type: 'modal', status: 'excluded',
      source: 'AI Agent/AI Agent本地Mock.js',
      reason: '用户明确要求 GAIP Agent 助手主面板不进入弹窗预览。'
    },
    {
      id: 'proposal-owner', title: '方案客户归属', channel: '方案中心', type: 'modal', status: 'ready', height: 760,
      source: 'window.__GAIP_PROPOSAL_PREVIEW__.createOwnerDialog()',
      invoke: { path: '__GAIP_PROPOSAL_PREVIEW__.createOwnerDialog', args: [] }, resultMode: 'append',
      styles: [umi, font, 'features/proposal-center/proposal-center.css'],
      scripts: ['features/proposal-center/proposal-center.js']
    },
    {
      id: 'proposal-unlink', title: '方案解除关联确认', channel: '方案中心', type: 'confirm', status: 'ready', height: 520,
      source: 'window.__GAIP_PROPOSAL_PREVIEW__.createUnlinkConfirm()',
      invoke: { path: '__GAIP_PROPOSAL_PREVIEW__.createUnlinkConfirm', args: [] }, resultMode: 'append',
      styles: [umi, font, 'features/proposal-center/proposal-center.css'],
      scripts: ['features/proposal-center/proposal-center.js']
    },
    {
      id: 'proposal-file', title: '方案附件预览', channel: '方案中心', type: 'modal', status: 'ready', height: 900,
      source: 'window.__GAIP_PROPOSAL_PREVIEW__.createFileDialog()',
      invoke: { path: '__GAIP_PROPOSAL_PREVIEW__.createFileDialog', args: [] }, resultMode: 'append',
      styles: [umi, font, 'features/proposal-center/proposal-center.css'],
      scripts: ['features/proposal-center/proposal-center.js']
    },
    {
      id: 'activity-signup', title: '活动报名信息', channel: '活动中心', type: 'modal', status: 'ready', height: 820,
      source: 'window.__GAIP_ACTIVITY_SYNC__.createSignupModal()',
      invoke: { path: '__GAIP_ACTIVITY_SYNC__.createSignupModal', args: ['兑现之年 · 全球配置新程'] }, resultMode: 'append-open-class', openClass: 'is-open',
      styles: [umi, font, 'features/activity/activity-sync.css'],
      scripts: ['features/activity/activity-sync.js']
    },
    {
      id: 'wealth-file', title: '文件识别详情', channel: '财富值中心', type: 'drawer', status: 'excluded',
      source: 'window.__GAIP_WEALTH_CENTER__.createFileDrawer()', reason: '用户明确抽屉不进入弹窗预览。'
    },
    {
      id: 'wealth-keyword', title: '保司关键词设置', channel: '财富值中心', type: 'modal', status: 'ready', height: 640,
      source: 'window.__GAIP_WEALTH_CENTER__.createKeywordDialog()',
      invoke: { path: '__GAIP_WEALTH_CENTER__.createKeywordDialog', args: [] }, resultMode: 'append',
      styles: [umi, font, 'features/wealth-center/wealth-center.css'],
      scripts: ['features/wealth-center/mock-data.js', 'features/wealth-center/wealth-center.js']
    },
    {
      id: 'news-article', title: '资讯文章详情', channel: '资讯中心', type: 'modal', status: 'ready', height: 900,
      source: 'window.__GAIP_NEWS_CENTER__.createArticleModal()',
      invoke: { path: '__GAIP_NEWS_CENTER__.createArticleModal', args: [] }, resultMode: 'append',
      styles: [umi, font, 'features/news-center/news-baseline.css', 'features/news-center/news-center.css'],
      scripts: ['features/news-center/mock-data.js', 'features/news-center/news-center.js']
    },
    {
      id: 'config-member', title: '配置中心成员编辑', channel: '配置中心', type: 'modal', status: 'ready', height: 900,
      source: 'window.__GAIP_CONFIG_DIALOGS__.openMember(1)', previewMode: 'config-dialog',
      invoke: { path: '__GAIP_CONFIG_DIALOGS__.openMember', args: [1] },
      styles: configStyles, scripts: configScripts
    },
    {
      id: 'config-department', title: '部门名称编辑', channel: '配置中心', type: 'modal', status: 'ready', height: 620,
      source: 'window.__GAIP_CONFIG_DIALOGS__.openDepartment("department-18", "rename")', previewMode: 'config-dialog',
      invoke: { path: '__GAIP_CONFIG_DIALOGS__.openDepartment', args: ['department-18', 'rename'] },
      styles: configStyles, scripts: configScripts
    },
    {
      id: 'config-delete', title: '删除部门确认', channel: '配置中心', type: 'confirm', status: 'ready', height: 520,
      source: 'window.__GAIP_CONFIG_DIALOGS__.openDepartment("department-18", "delete")', previewMode: 'config-dialog',
      invoke: { path: '__GAIP_CONFIG_DIALOGS__.openDepartment', args: ['department-18', 'delete'] },
      styles: configStyles, scripts: configScripts
    },
    {
      id: 'config-admin', title: '设置管理员', channel: '配置中心', type: 'modal', status: 'ready', height: 900,
      source: 'window.__GAIP_CONFIG_DIALOGS__.openDepartment("all", "admin")', previewMode: 'config-dialog',
      invoke: { path: '__GAIP_CONFIG_DIALOGS__.openDepartment', args: ['all', 'admin'] },
      styles: configStyles, scripts: configScripts
    },
    { id: 'agent-history', title: '审核历史记录', channel: 'AI Agent 子页面', type: 'drawer', status: 'excluded', source: 'web/p__agents__riskAccess__index.8e2d8091.async.js', reason: '用户明确抽屉不进入弹窗预览。' },
    { id: 'agent-session-rename', title: '编辑对话名称', channel: 'AI Agent 助手', type: 'modal', status: 'ready', height: 820, previewMode: 'route-trigger', route: '/workspace', source: '登录.html#/workspace → AI Agent 入口 → 更多操作 → 修改名称' },
    { id: 'agent-close-confirm', title: '回复中关闭确认', channel: 'AI Agent', type: 'confirm', status: 'excluded', source: 'AI Agent/AI Agent本地Mock.js', reason: '当前正式入口已把右上角关闭改为最小化，回复中不再产生该确认框。' },
    { id: 'clues-assign', title: '分配线索', channel: '线索中心 · 列表', type: 'modal', status: 'ready', height: 900, previewMode: 'route-trigger', route: '/clues', source: '登录.html#/clues → 首条线索 → 分配' },
    { id: 'clues-terminal', title: '标记转化 / 标记关闭', channel: '线索中心 · 列表', type: 'modal', status: 'ready', height: 900, previewMode: 'route-trigger', route: '/clues', source: '登录.html#/clues → 首条线索 → 转化' },
    { id: 'clues-detail', title: '线索详情', channel: '线索中心 · 详情', type: 'modal', status: 'ready', height: 900, previewMode: 'route-trigger', route: '/clues', source: '登录.html#/clues → 详情' },
    { id: 'clues-create', title: '新增线索', channel: '线索中心 · 列表', type: 'modal', status: 'ready', height: 900, previewMode: 'route-trigger', route: '/clues', source: '登录.html#/clues → 新增线索' },
    { id: 'customer-editor', title: '新建 / 修改客户', channel: '客户中心360', type: 'drawer', status: 'excluded', source: 'web/978.e5ccf054.chunk.css', reason: '用户明确抽屉不进入弹窗预览。' },
    { id: 'customer-profile', title: '完善客户资料', channel: '客户中心360 · 客户画像', type: 'drawer', status: 'excluded', source: 'web/978.e5ccf054.chunk.css', reason: '用户明确抽屉不进入弹窗预览。' },
    { id: 'customer-intro', title: '编辑客户资料介绍', channel: '客户中心360 · 客户画像', type: 'modal', status: 'ready', height: 900, previewMode: 'route-trigger', route: '/customer', source: '登录.html#/customer → 客户资料介绍 → 编辑' },
    { id: 'customer-meeting', title: '新增 / 编辑沟通纪要', channel: '客户中心360 · 沟通纪要', type: 'modal', status: 'ready', height: 900, previewMode: 'route-trigger', route: '/customer', source: '登录.html#/customer → 沟通纪要 → 新增沟通纪要' },
    { id: 'customer-meeting-delete', title: '删除沟通纪要确认', channel: '客户中心360 · 沟通纪要', type: 'confirm', status: 'ready', height: 820, previewMode: 'route-trigger', route: '/customer', source: '登录.html#/customer → 沟通纪要 → 删除' },
    { id: 'customer-delete', title: '删除客户确认', channel: '客户中心360 · 客户详情', type: 'confirm', status: 'ready', height: 820, previewMode: 'route-trigger', route: '/customer', source: '登录.html#/customer → 删除客户' },
    { id: 'customer-proposal-detail', title: '历史方案详情', channel: '客户中心360 · 历史方案', type: 'modal', status: 'ready', height: 900, previewMode: 'route-trigger', route: '/customer', source: '登录.html#/customer → 历史方案 → 查看详情' },
    { id: 'activity-record', title: '报名记录', channel: '活动中心 · 我的报名', type: 'modal', status: 'ready', height: 900, previewMode: 'route-trigger', route: '/activity', source: '登录.html#/activity → 我的报名 → 报名记录' },
    { id: 'activity-detail', title: '活动详情', channel: '活动中心 · 活动列表', type: 'drawer', status: 'excluded', source: 'web/p__dashboard__activity__index.1198cb77.async.js', reason: '用户明确抽屉不进入弹窗预览。' },
    { id: 'product-detail', title: '产品详情', channel: '产品中心 · 产品列表', type: 'modal', status: 'ready', height: 900, previewMode: 'route-trigger', route: '/product', source: '登录.html#/product → 产品卡片' },
    { id: 'product-expert', title: '业务线对接专家', channel: '产品中心 · 产品列表', type: 'modal', status: 'ready', height: 900, previewMode: 'route-trigger', route: '/product', source: '登录.html#/product → 联系产品专家' },
    { id: 'product-attachment', title: '产品附件浮层', channel: '产品中心 · 产品详情', type: 'popover', status: 'excluded', source: 'web/p__dashboard__product__index.5ead150d.async.js', reason: '源码中的“产品附件”是产品详情弹窗内的 m5 内容区，不是独立弹层。' },
    { id: 'policy-bind', title: '选择要绑定的客户', channel: '保单列表', type: 'modal', status: 'excluded', source: 'web/p__policy__index.109db1c0.async.js', reason: '当前保单卡片组件接收 onBind 但没有渲染或调用绑定入口，页面不可达。' },
    { id: 'proposal-delete', title: '删除方案确认', channel: '方案中心', type: 'confirm', status: 'excluded', source: 'web/p__proposal__index.0e756085.async.js', reason: '旧 Umi 方案列表已被当前方案中心记录页替换；当前删除能力不再存在。' },
    { id: 'solution-type', title: '选择方案类型', channel: '方案中心 · 新建方案', type: 'modal', status: 'excluded', source: 'web/978.0b8a0670.async.js', reason: '当前方案中心已改为调用 Agent 生成，不再打开旧快速方案流程。' },
    { id: 'identity-questionnaire', title: '身份规划问卷', channel: '方案中心 · 身份方案', type: 'modal', status: 'excluded', source: 'web/978.0b8a0670.async.js', reason: '仅属于已被当前方案中心替换的旧快速方案流程。' },
    { id: 'trust-questionnaire', title: '海外家族信托诊断问卷', channel: '方案中心 · 信托方案', type: 'modal', status: 'excluded', source: 'web/978.0b8a0670.async.js', reason: '仅属于已被当前方案中心替换的旧快速方案流程。' },
    { id: 'premium-questionnaire', title: '保费融资资格预审', channel: '方案中心 · 保费融资', type: 'modal', status: 'excluded', source: 'web/978.0b8a0670.async.js', reason: '仅属于已被当前方案中心替换的旧快速方案流程。' },
    { id: 'solution-loading', title: 'AI 方案生成中', channel: '方案中心 · 生成流程', type: 'modal', status: 'excluded', source: 'web/978.0b8a0670.async.js', reason: '旧生成流程已由 GAIP Agent 的真实处理状态取代。' },
    { id: 'application-upload', title: '申请文件上传', channel: '方案中心 · 申请文件', type: 'drawer', status: 'excluded', source: 'web/978.e5ccf054.chunk.css', reason: '用户明确抽屉不进入弹窗预览。' },
    { id: 'induction-complete', title: '完成入职引导', channel: '薄荷入职引导', type: 'modal', status: 'ready', height: 820, previewMode: 'route-trigger', route: '/induction', source: '登录.html#/induction → 已完成状态' },
    { id: 'news-off-shelf', title: '确认下架资讯', channel: '资讯中心 · 内容管理', type: 'confirm', status: 'excluded', source: 'web/p__news__index.f64a0a2e.async.js', reason: '当前本地资讯中心没有内容管理/下架入口，该分包也不在现行路由表中。' },
    { id: 'account-switch', title: '检测到账号已切换', channel: '全局框架', type: 'modal', status: 'ready', height: 820, previewMode: 'route-trigger', route: '/workspace', source: '登录.html#/workspace → 正式 AccountChangeWatcher' }
  ];

  if (!window.__GAIP_MODAL_REGISTRY__) throw new Error('请先加载 shared/scripts/modal-registry.js');
  window.__GAIP_MODAL_REGISTRY__.registerMany(entries, { origin: 'baseline-catalog' });
}());
