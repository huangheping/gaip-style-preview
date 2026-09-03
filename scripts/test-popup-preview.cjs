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
assert.equal(catalog.list.length, 48, '盘点总数应包含自动发现的组织架构日志、批量导入与调整节点弹窗');
assert.equal(catalog.ready.length, 31, '真实可预览项应为 31');
assert.equal(catalog.pending.length, 0, '本轮完成后不得残留待接入项');
assert.equal(catalog.excluded.length, 17, '不进入预览项应为 17');
assert.equal(catalog.excludedDrawers.length, 6, '用户排除的抽屉必须保持 6');
assert.equal(catalog.excludedOther.length, 11, 'Agent 主面板与无效旧登记应为 11');

const byId = Object.fromEntries(catalog.list.map((entry) => [entry.id, entry]));
assert.equal(byId['agent-main'].status, 'excluded');
assert.match(byId['agent-main'].reason, /用户明确要求/);
assert.ok(!catalog.ready.some((entry) => entry.id === 'agent-main'), 'Agent 主面板不得进入预览');
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

const routeEntries = catalog.ready.filter((entry) => entry.previewMode === 'route-trigger');
assert.equal(routeEntries.length, 15, '应有 15 个正式页面真实点击预览');
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
assert.ok(byId['config-admin'].scripts.includes('features/config-center/config-center.js?v=20260903-39'), '配置中心弹窗预览必须加载当前逻辑版本');

const previewSource = fs.readFileSync(previewPath, 'utf8');
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
  assert.match(fs.readFileSync(path.join(root, name), 'utf8'), /local-preview\.js\?v=20260902-7/, `${name} 缓存版本未同步`);
});

console.log(`popup preview registry: ${catalog.list.length} total / ${catalog.ready.length} ready / ${catalog.pending.length} pending / ${catalog.excluded.length} excluded`);
console.log('route-trigger previews: 15');
