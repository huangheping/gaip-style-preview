const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const modalRuntimePath = path.join(root, 'shared/scripts/modal-registry.js');
const registryPath = path.join(root, '全局组件/弹窗源登记.js');
const generatedRegistryPath = path.join(root, '全局组件/弹窗自动索引.generated.js');
const previewPath = path.join(root, '全局组件/弹窗预览.html');
const componentIndexPath = path.join(root, '全局组件/index.html');
const componentRegistryPath = path.join(root, '全局组件/components-registry.js');
const componentPreviewPath = path.join(root, '全局组件/components-preview.js');
const bridgePath = path.join(root, 'shared/scripts/popup-preview-bridge.js');
const localPreviewPath = path.join(root, 'shared/scripts/local-preview.js');
const sharedModalStylePath = path.join(root, 'shared/styles/global-modal.css');
const sharedModalScriptPath = path.join(root, 'shared/scripts/global-modal.js');
const sharedModalMaskStylePath = path.join(root, 'shared/styles/global-modal-mask.css');
const sharedModalPositionStylePath = path.join(root, 'shared/styles/global-modal-position.css');
const sharedModalPositionScriptPath = path.join(root, 'shared/scripts/global-modal-position.js');

execFileSync(process.execPath, [path.join(root, 'scripts/generate-modal-catalog.cjs'), '--check'], {
  cwd: root,
  stdio: 'pipe'
});

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(modalRuntimePath, 'utf8'), context, { filename: modalRuntimePath });
vm.runInContext(fs.readFileSync(registryPath, 'utf8'), context, { filename: registryPath });
vm.runInContext(fs.readFileSync(generatedRegistryPath, 'utf8'), context, { filename: generatedRegistryPath });
const catalog = context.window.__GAIP_MODAL_SOURCE_CATALOG__;

assert.ok(catalog, '弹窗登记表应可执行');
assert.equal(catalog.list.length, 52, '盘点总数应包含调整节点确认及公告管理的新建、编辑与删除弹窗');
assert.equal(catalog.ready.length, 35, '真实可预览项应为 35');
assert.equal(catalog.pending.length, 0, '本轮完成后不得残留待接入项');
assert.equal(catalog.excluded.length, 17, '不进入预览项应为 17');
assert.equal(catalog.excludedDrawers.length, 6, '用户排除的抽屉必须保持 6');
assert.equal(catalog.excludedOther.length, 11, 'Agent 主面板与无效旧登记应为 11');
assert.deepEqual(
  Object.fromEntries(['information', 'form', 'confirmation'].map((category) => [category, catalog.ready.filter((entry) => entry.category === category).length])),
  { information: 13, form: 16, confirmation: 6 },
  '真实弹窗应按信息展示、表单操作和操作确认三类登记'
);
assert.ok(catalog.ready.every((entry) => ['information', 'form', 'confirmation'].includes(entry.category)), '每个可预览弹窗都必须拥有用途分类');

const byId = Object.fromEntries(catalog.list.map((entry) => [entry.id, entry]));
assert.equal(byId['agent-main'].status, 'excluded');
assert.match(byId['agent-main'].reason, /用户明确要求/);
assert.ok(!catalog.ready.some((entry) => entry.id === 'agent-main'), 'Agent 主面板不得进入预览');
assert.equal(byId['agent-session-rename'].status, 'ready');
assert.match(byId['agent-session-rename'].channel, /全局操作/);
assert.ok(catalog.ready.some((entry) => entry.id === 'agent-session-rename'), '具备全局复用性质的编辑对话名称弹窗必须进入预览');
assert.ok(!catalog.ready.some((entry) => ['agent-main', 'agent-history', 'agent-close-confirm'].includes(entry.id)), 'Agent 主面板、审核历史和内部关闭确认不得进入预览');
assert.equal(byId['config-organization-log'].definitionSource, 'features/config-center/config-center.js');
assert.equal(byId['config-organization-log'].invoke.path, '__GAIP_CONFIG_DIALOGS__.openOrganizationLog');
assert.equal(catalog.list[catalog.list.findIndex((entry) => entry.id === 'config-admin') + 1].id, 'config-organization-log', '源登记项应进入配置中心弹窗组');
assert.equal(byId['config-bulk-import-members'].definitionSource, 'features/config-center/config-center.js');
assert.equal(byId['config-bulk-import-members'].invoke.path, '__GAIP_CONFIG_DIALOGS__.openBulkImport');
assert.equal(catalog.list[catalog.list.findIndex((entry) => entry.id === 'config-organization-log') + 1].id, 'config-bulk-import-members', '批量导入应紧随组织架构日志进入配置中心弹窗组');
assert.equal(byId['config-adjust-member-node'].definitionSource, 'features/config-center/config-center.js');
assert.equal(byId['config-adjust-member-node'].invoke.path, '__GAIP_CONFIG_DIALOGS__.openAdjustNode');
assert.deepEqual(Array.from(byId['config-adjust-member-node'].invoke.args), [1]);
assert.equal(catalog.list[catalog.list.findIndex((entry) => entry.id === 'config-bulk-import-members') + 1].id, 'config-adjust-member-node', '调整节点应紧随批量导入进入配置中心弹窗组');
assert.equal(byId['config-adjust-member-node-confirm'].definitionSource, 'features/config-center/config-center.js');
assert.equal(byId['config-adjust-member-node-confirm'].invoke.path, '__GAIP_CONFIG_DIALOGS__.openAdjustNodeConfirmation');
assert.deepEqual(Array.from(byId['config-adjust-member-node-confirm'].invoke.args), [1]);
assert.equal(catalog.list[catalog.list.findIndex((entry) => entry.id === 'config-adjust-member-node') + 1].id, 'config-adjust-member-node-confirm', '管理员节点二次确认应紧随调整节点主弹窗');
assert.equal(byId['config-announcement-create'].definitionSource, 'features/config-center/announcement-management-view.js');
assert.equal(byId['config-announcement-create'].invoke.path, '__GAIP_ANNOUNCEMENT_MANAGEMENT__.openCreate');
assert.equal(byId['config-announcement-edit'].invoke.path, '__GAIP_ANNOUNCEMENT_MANAGEMENT__.openEdit');
assert.equal(byId['config-announcement-delete'].invoke.path, '__GAIP_ANNOUNCEMENT_MANAGEMENT__.openDelete');
assert.equal(catalog.list[catalog.list.findIndex((entry) => entry.id === 'config-announcement-create') + 1].id, 'config-announcement-edit', '公告编辑应紧随新建弹窗');
assert.equal(catalog.list[catalog.list.findIndex((entry) => entry.id === 'config-announcement-edit') + 1].id, 'config-announcement-delete', '公告删除确认应紧随编辑弹窗');

const routeEntries = catalog.ready.filter((entry) => entry.previewMode === 'route-trigger');
assert.equal(routeEntries.length, 15, '加入编辑对话名称后应有 15 个正式页面真实点击预览');
const bridgeSource = fs.readFileSync(bridgePath, 'utf8');
routeEntries.forEach((entry) => {
  assert.match(entry.route, /^\//, `${entry.id} 必须登记 Hash 路由`);
  assert.match(bridgeSource, new RegExp(`['"]${entry.id}['"]\\s*:`), `${entry.id} 必须存在真实点击流程`);
});

catalog.ready.filter((entry) => entry.previewMode !== 'route-trigger').forEach((entry) => {
  assert.equal(typeof entry.invoke?.path, 'string', `${entry.id} 必须登记通用调用入口`);
  assert.ok(Array.isArray(entry.styles) && entry.styles.length, `${entry.id} 必须登记真实 CSS`);
  assert.ok(Array.isArray(entry.scripts) && entry.scripts.length, `${entry.id} 必须登记真实脚本`);
  entry.styles.concat(entry.scripts).forEach((asset) => {
    assert.ok(fs.existsSync(path.join(root, asset.split('?')[0])), `${entry.id} 资源不存在：${asset}`);
  });
});
assert.ok(byId['config-admin'].scripts.includes('features/config-center/config-center.js?v=20260904-52'), '配置中心弹窗预览必须加载当前逻辑版本');
assert.ok(byId['config-delete'].styles.includes('shared/styles/global-modal.css?v=20260904-4'), '删除部门预览必须加载共享弹窗样式');
assert.ok(byId['config-delete'].scripts.includes('shared/scripts/global-modal.js?v=20260904-5'), '删除部门预览必须加载共享弹窗逻辑');

const sharedModalStyleSource = fs.readFileSync(sharedModalStylePath, 'utf8');
const sharedModalScriptSource = fs.readFileSync(sharedModalScriptPath, 'utf8');
const sharedModalMaskStyleSource = fs.readFileSync(sharedModalMaskStylePath, 'utf8');
const sharedModalPositionStyleSource = fs.readFileSync(sharedModalPositionStylePath, 'utf8');
const sharedModalPositionScriptSource = fs.readFileSync(sharedModalPositionScriptPath, 'utf8');
assert.match(sharedModalStyleSource, /--gaip-modal-width:\s*480px/, '确认弹窗默认宽度必须为 480px');
assert.match(sharedModalStyleSource, /\.gaip-modal--complex\s*\{\s*--gaip-modal-width:\s*520px/, '复杂确认弹窗宽度必须为 520px');
assert.match(sharedModalStyleSource, /--gaip-modal-button-height:\s*40px/, '确认弹窗按钮高度必须为 40px');
assert.match(sharedModalStyleSource, /\.gaip-modal--confirm \.gaip-modal__body\s*\{[\s\S]*?overflow:\s*visible/, '确认弹窗正文不得产生独立滚动条');
assert.match(sharedModalStyleSource, /\.gaip-modal \.gaip-modal__button--secondary\s*\{[\s\S]*?order:\s*1/, '取消按钮必须位于左侧');
assert.match(sharedModalStyleSource, /\.gaip-modal \.gaip-modal__button--primary\s*\{[\s\S]*?order:\s*2/, '确认按钮必须位于右侧');
assert.match(sharedModalScriptSource, /options\.type = options\.type \|\| 'confirm'/, '确认弹窗 API 必须自动使用 confirm 类型');
assert.match(sharedModalScriptSource, /options\.size === 'complex'/, '共享弹窗 API 必须支持复杂信息宽度');
assert.match(sharedModalScriptSource, /gaip-modal--blocked/, '共享弹窗 API 必须支持禁止态');
assert.match(sharedModalScriptSource, /normalizeAntConfirm/, '共享弹窗组件必须原生兼容 Ant 系统确认框结构');
assert.match(sharedModalScriptSource, /ensureCloseButton/, '共享弹窗组件必须为无关闭按钮的系统确认框补齐标准关闭控件');
assert.match(sharedModalScriptSource, /normalizeCloseButton/, '共享弹窗组件必须重建统一关闭图标');
assert.match(sharedModalScriptSource, /removeHashedPresentationClasses/, '共享弹窗组件必须移除旧业务哈希样式类的竞争');
assert.match(sharedModalScriptSource, /content\.children/, 'Ant 系统确认框归一化必须优先复用现有 header 与 body');
assert.match(sharedModalScriptSource, /version:\s*'1\.1\.3'/, '共享弹窗组件版本必须为 1.1.3');

assert.match(sharedModalMaskStyleSource, /--gaip-modal-mask-color:\s*rgba\(0,\s*0,\s*0,\s*0\.45\)/, '全局遮罩必须使用统一 45% 黑色');
assert.match(sharedModalMaskStyleSource, /--gaip-modal-mask-duration:\s*160ms/, '全局遮罩动效时长必须为 160ms');
assert.match(sharedModalMaskStyleSource, /dialog::backdrop/, '全局遮罩必须覆盖原生 dialog');
assert.match(sharedModalMaskStyleSource, /\.ant-modal-mask/, '全局遮罩必须覆盖 Ant Modal');
assert.match(sharedModalMaskStyleSource, /\.ant-drawer-mask/, '全局遮罩必须覆盖 Ant Drawer');
[
  'gaip-ai-notice-backdrop',
  'gaip-global-poster-share-backdrop',
  'gaip-news-bridge-backdrop',
  'gaip-owner-overlay',
  'gaip-owner-confirm-overlay',
  'gaip-file-overlay',
  'gaip-activity-modal',
  'gaip-wealth-drawer-layer',
  'gaip-wealth-modal-layer',
  'gaip-bulk-confirm-layer',
  'gaip-adjust-confirm-layer'
].forEach((selector) => {
  assert.match(sharedModalMaskStyleSource, new RegExp(`\\.${selector}`), `全局遮罩必须接管 ${selector}`);
});

const localMaskVisualSources = [
  'shared/styles/global-ai-notice.css',
  'shared/styles/global-poster-share.css',
  'shared/styles/global-operation-log.css',
  'features/news-center/news-center.css',
  'features/proposal-center/proposal-center.css',
  'features/activity/activity-sync.css',
  'features/wealth-center/wealth-center.css',
  'features/config-center/config-center-content.css',
  'features/config-center/announcement-management.css'
].map((relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')).join('\n');
assert.doesNotMatch(localMaskVisualSources, /(?:gaip-log-dialog|gaip-config-editor|gaip-organization-log-dialog|gaip-bulk-import-dialog|gaip-adjust-node-dialog|gaip-announcement-dialog)::backdrop\s*\{/, '业务样式不得继续定义原生 dialog 遮罩');
assert.doesNotMatch(localMaskVisualSources, /rgba\((?:18,\s*32,\s*31,\s*\.4|25,\s*32,\s*38,\s*\.55|31,\s*38,\s*45,\s*\.(?:42|28)|25,\s*29,\s*33,\s*\.78|18,\s*24,\s*27,\s*0\.34|0,\s*0,\s*0,\s*0\.46)\)/, '历史业务遮罩色不得残留');
assert.doesNotMatch(localMaskVisualSources, /rgba\(24,\s*33,\s*38,\s*0\.48\)/, '财富弹窗与抽屉不得保留局部遮罩色');
assert.doesNotMatch(fs.readFileSync(path.join(root, 'features/activity/activity-sync.js'), 'utf8'), /\},\s*180\);/, '活动报名关闭时长必须跟随 160ms 遮罩令牌');

assert.match(sharedModalPositionStyleSource, /--gaip-modal-safe-gap:\s*24px/, '桌面弹窗必须保留 24px 安全边距');
assert.match(sharedModalPositionStyleSource, /--gaip-modal-safe-gap:\s*12px/, '窄屏弹窗必须保留 12px 安全边距');
assert.match(sharedModalPositionStyleSource, /dialog\[data-gaip-modal-placement="center"\]\[open\]/, '原生 dialog 必须由明确定位标记居中');
assert.match(sharedModalPositionStyleSource, /\.ant-modal-wrap\[data-gaip-modal-placement="center"\] > \.ant-modal/, 'Ant Modal 必须清除默认 top 偏移');
assert.match(sharedModalPositionStyleSource, /top:\s*auto\s*!important/, 'Ant Modal 不得保留 top:100px 的默认定位');
assert.match(sharedModalPositionStyleSource, /translate\(-50%,\s*-50%\)/, '原生 dialog 必须以自身中心点定位');
assert.match(sharedModalPositionScriptSource, /new MutationObserver/, '动态新增弹窗必须自动接入定位组件');
assert.match(sharedModalPositionScriptSource, /\.agentModal___Nxp06/, '定位接入器必须识别并排除 GAIP Agent 主面板');
assert.match(sharedModalPositionScriptSource, /isDrawer/, '定位接入器必须排除抽屉');
assert.doesNotMatch(sharedModalPositionScriptSource, /gaip-wealth-drawer-layer/, '财富抽屉不得进入普通弹窗定位候选');

const confirmationImplementationSources = [
  'features/proposal-center/proposal-center.js',
  'features/customer/customer-center.js',
  'features/config-center/config-center.js',
  'features/config-center/announcement-management-view.js'
].map((relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8'));
assert.equal(confirmationImplementationSources.reduce((total, source) => total + (source.match(/\.setConfirmState\(/g) || []).length, 0), 6, '六个操作确认入口必须全部调用共享确认 API');
assert.doesNotMatch(confirmationImplementationSources[0], /data-unlink-close[^>]*>(?:(?!<\/button>)[\s\S])*<svg/, '05 不得复制关闭 SVG');
assert.doesNotMatch(confirmationImplementationSources[1], /data-customer-confirm-close[^>]*>(?:(?!<\/button>)[\s\S])*<svg/, '25 不得复制关闭 SVG');
assert.doesNotMatch(confirmationImplementationSources[2], /data-adjust-warning-cancel[^>]*>(?:(?!<\/button>)[\s\S])*<svg/, '17 不得复制关闭 SVG');
assert.doesNotMatch(confirmationImplementationSources[3], /data-announcement-close[^>]*>(?:(?!<\/button>)[\s\S])*<svg/, '35 不得复制关闭 SVG');

const previewSource = fs.readFileSync(previewPath, 'utf8');
assert.match(previewSource, /global-modal-mask\.css\?v=20260904-1/, '弹窗预览必须直接加载全局遮罩唯一样式源');
assert.match(previewSource, /global-modal-position\.css\?v=20260904-1/, '弹窗预览必须直接加载全局定位唯一样式源');
assert.match(previewSource, /global-modal-position\.js\?v=20260904-1/, '弹窗预览必须加载动态定位接入器');
assert.match(previewSource, /previewViewportHeight = 820/, '所有真实弹窗预览必须使用统一 820px 视口');
assert.match(previewSource, /frame\.style\.height = previewViewportHeight \+ 'px'/, 'iframe 高度必须来自统一预览视口');
assert.doesNotMatch(previewSource, /frame\.style\.height = entry\.height/, 'iframe 不得因登记项高度产生视觉假偏移');
assert.match(previewSource, /弹窗源登记\.js\?v=20260904-8/, '弹窗预览页必须刷新真实源登记缓存');
assert.match(previewSource, /弹窗自动索引\.generated\.js\?v=20260904-4/, '弹窗预览页必须刷新自动索引缓存');
assert.match(previewSource, /entry\.previewMode === 'route-trigger'/);
assert.match(previewSource, /shared\/scripts\/modal-registry\.js/);
assert.match(previewSource, /弹窗自动索引\.generated\.js/);
assert.match(previewSource, /__GAIP_MODAL_REGISTRY__\.open\(entry\.id\)/, '本地源弹窗应由通用注册器打开');
assert.doesNotMatch(previewSource, /entry\.id === ['"]/, '预览页不得继续为每个弹窗维护手写打开分支');
assert.doesNotMatch(previewSource, /GAIP Agent 助手主面板/, '预览页可见源码不应出现已排除主面板名称');
assert.doesNotMatch(previewSource, /<iframe\b/i, '父预览页初始 HTML 不得批量创建弹窗 iframe');
assert.match(previewSource, /new IntersectionObserver/, '弹窗必须在进入可见区域后按需加载');
assert.match(previewSource, /document\.createElement\('iframe'\)/, '按需加载时才创建隔离 iframe');
assert.match(previewSource, /frame\.loading = 'lazy'/, '动态 iframe 继续使用浏览器懒加载提示');
assert.match(previewSource, /class="frameLoad"/, '无法自动观察时必须保留手动加载入口');
assert.match(previewSource, /gaip-popup-preview/, '父页必须接收真实弹窗打开状态');
assert.match(previewSource, /routeConcurrency = 3/, '正式频道预览必须限流，同时缩短完整预览等待时间');
assert.match(previewSource, /pumpRouteQueue\(\)/, '正式频道预览队列必须持续加载后续项目');
assert.match(previewSource, /location\.replace\('\.\.\/登录\.html#'/);
assert.match(previewSource, /pending\.length \?/);
assert.match(previewSource, /data-category="all"/, '预览页应提供全部弹窗入口');
assert.match(previewSource, /categoryOrder = \['information', 'form', 'confirmation'\]/, '预览页应使用三类用途目录');
assert.match(previewSource, /readyIndex\.get\(entry\.id\)/, '分组后必须保留原弹窗编号');
assert.match(previewSource, /id="categoryOverviewGrid"/, '预览页应在真实弹窗前展示三栏分类总览');
assert.match(previewSource, /data-target="modal-preview-/, '分类总览项应能定位到对应真实弹窗');
assert.match(previewSource, /article\.id = 'modal-preview-' \+ entry\.id/, '每个真实弹窗卡片应提供稳定定位 ID');
assert.doesNotMatch(previewSource, /createPreviewModal\(/, '预览页不得调用 Agent 演示 DOM');

const generatorSource = fs.readFileSync(path.join(root, 'scripts/generate-modal-catalog.cjs'), 'utf8');
assert.match(generatorSource, /@gaip-modal/);
assert.match(generatorSource, /--check/);
assert.match(fs.readFileSync(path.join(root, 'features/config-center/config-center.js'), 'utf8'), /"id": "config-organization-log"/);
assert.match(fs.readFileSync(path.join(root, 'features/config-center/config-center.js'), 'utf8'), /"id": "config-bulk-import-members"/);
assert.match(fs.readFileSync(path.join(root, 'features/config-center/config-center.js'), 'utf8'), /"id": "config-adjust-member-node"/);

const componentContext = { window: {} };
vm.createContext(componentContext);
vm.runInContext(fs.readFileSync(componentRegistryPath, 'utf8'), componentContext, { filename: componentRegistryPath });
const modalComponent = componentContext.window.__GAIP_GLOBAL_COMPONENTS__.find((component) => component.id === 'modal-catalog');
assert.ok(modalComponent, '全局组件目录必须登记真实弹窗预览入口');
assert.equal(modalComponent.previewKind, 'modalCatalog');
assert.ok(modalComponent.sources.some((source) => source.path === '全局组件/弹窗预览.html'));

const componentIndexSource = fs.readFileSync(componentIndexPath, 'utf8');
assert.ok(componentIndexSource.indexOf('modal-registry.js') < componentIndexSource.indexOf('components-registry.js'), '目录页应先加载实时弹窗目录');
assert.match(componentIndexSource, /弹窗自动索引\.generated\.js/);
const componentPreviewSource = fs.readFileSync(componentPreviewPath, 'utf8');
assert.match(componentPreviewSource, /__GAIP_MODAL_SOURCE_CATALOG__/);
assert.match(componentPreviewSource, /href="\.\/弹窗预览\.html"/);
assert.doesNotMatch(componentPreviewSource, /<iframe/, '全局组件首页不得内嵌全部弹窗 iframe');

const localPreviewSource = fs.readFileSync(localPreviewPath, 'utf8');
assert.match(localPreviewSource, /gaip-popup-preview/);
assert.match(localPreviewSource, /chapter: 5, section: 1/, '入职完成弹窗预览必须进入真实可完成状态');
assert.match(bridgeSource, /prunePageBehindPopup/, '真实弹窗打开后必须裁掉频道页面 DOM');
assert.match(bridgeSource, /data-gaip-popup-preview-pruned/, '预览必须登记页面 DOM 已裁剪状态');
assert.doesNotMatch(bridgeSource, /gaip-popup-preview-clean-background/, '不得继续用覆盖层隐藏频道页面');
assert.match(bridgeSource, /markOpened\('业务线对接专家'\)/);
assert.match(bridgeSource, /selectorNode\('\[class\*="nextBtn___"\]'/, '入职完成必须使用真实 Ant 按钮类，避免“完 成”字距造成文本失配');
assert.match(bridgeSource, /label === '完成'/, '入职预览必须从当前真实进度逐步推进到完成按钮');
assert.match(bridgeSource, /pause\(650\)/, '入职预览必须等待 React 提交每一步进度');
assert.match(bridgeSource, /clickText\('转化'/);
assert.match(bridgeSource, /markOpened\('方案详情预览'\)/);
assert.match(bridgeSource, /clickSelector\('\[class\*="signUpContainer___"\]'/, '报名记录必须点击真实卡片容器');
assert.match(bridgeSource, /globalButton___/, '会话重命名必须先打开工作台真实 AI Agent 入口');
assert.match(bridgeSource, /agentModal___Nxp06 button\[aria-label="更多操作"\]/, '会话重命名必须使用 Agent 历史会话真实入口');
assert.match(bridgeSource, /markOpened\('编辑对话名称'\)/, '会话重命名必须按当前真实弹窗标题验收');
assert.match(bridgeSource, /customerCard___.*cName___/, '客户流程必须跳过复用相同卡片类名的骨架屏');
assert.match(bridgeSource, /productCard___.*moreAction___/, '产品详情必须跳过复用相同卡片类名的骨架屏');
assert.match(bridgeSource, /timeout = 45000/, '真实页面入口需要覆盖 Umi 异步加载时间');
assert.match(localPreviewSource, /popup-preview-bridge\.js\?v=20260902-7/);

const configCenterSource = fs.readFileSync(path.join(root, 'features/config-center/config-center.js'), 'utf8');
const previewHostSource = configCenterSource.slice(configCenterSource.indexOf('function ensureDialogPreviewHost'), configCenterSource.indexOf('dialogController ='));
assert.doesNotMatch(previewHostSource, /renderOrganization\(/, '配置中心弹窗预览宿主不得渲染组织架构背景页');

const entryFiles = fs.readdirSync(root).filter((name) => name !== 'index-login-video-test.html' && name.endsWith('.html') &&
  fs.readFileSync(path.join(root, name), 'utf8').includes('shared/scripts/local-preview.js'));
assert.equal(entryFiles.length, 15, '应覆盖 15 个正式入口');
entryFiles.forEach((name) => {
  const source = fs.readFileSync(path.join(root, name), 'utf8');
  assert.match(source, /local-preview\.js\?v=20260902-7/, `${name} 缓存版本未同步`);
  assert.match(source, /global-modal-mask\.css\?v=20260904-1/, `${name} 必须加载全局遮罩唯一样式源`);
  assert.match(source, /global-modal-position\.css\?v=20260904-1/, `${name} 必须加载全局定位唯一样式源`);
  assert.match(source, /global-modal-position\.js\?v=20260904-1/, `${name} 必须加载动态定位接入器`);
  assert.ok(source.indexOf('global-operation-log.css') < source.indexOf('global-modal-mask.css'), `${name} 的全局遮罩必须晚于既有业务样式加载`);
  assert.ok(source.indexOf('global-modal-mask.css') < source.indexOf('global-modal-position.css'), `${name} 的全局定位必须晚于遮罩样式加载`);
});

console.log(`popup preview registry: ${catalog.list.length} total / ${catalog.ready.length} ready / ${catalog.pending.length} pending / ${catalog.excluded.length} excluded`);
console.log(`route-trigger previews: ${routeEntries.length}`);
