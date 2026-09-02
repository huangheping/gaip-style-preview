const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const registryPath = path.join(root, '全局组件/弹窗源登记.js');
const previewPath = path.join(root, '全局组件/弹窗预览.html');
const bridgePath = path.join(root, 'shared/scripts/popup-preview-bridge.js');
const localPreviewPath = path.join(root, 'shared/scripts/local-preview.js');

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(registryPath, 'utf8'), context, { filename: registryPath });
const catalog = context.window.__GAIP_MODAL_SOURCE_CATALOG__;

assert.ok(catalog, '弹窗登记表应可执行');
assert.equal(catalog.list.length, 45, '盘点总数必须保持 45');
assert.equal(catalog.ready.length, 28, '真实可预览项应为 28');
assert.equal(catalog.pending.length, 0, '本轮完成后不得残留待接入项');
assert.equal(catalog.excluded.length, 17, '不进入预览项应为 17');
assert.equal(catalog.excludedDrawers.length, 6, '用户排除的抽屉必须保持 6');
assert.equal(catalog.excludedOther.length, 11, 'Agent 主面板与无效旧登记应为 11');

const byId = Object.fromEntries(catalog.list.map((entry) => [entry.id, entry]));
assert.equal(byId['agent-main'].status, 'excluded');
assert.match(byId['agent-main'].reason, /用户明确要求/);
assert.ok(!catalog.ready.some((entry) => entry.id === 'agent-main'), 'Agent 主面板不得进入预览');

const routeEntries = catalog.ready.filter((entry) => entry.previewMode === 'route-trigger');
assert.equal(routeEntries.length, 15, '应有 15 个正式页面真实点击预览');
const bridgeSource = fs.readFileSync(bridgePath, 'utf8');
routeEntries.forEach((entry) => {
  assert.match(entry.route, /^\//, `${entry.id} 必须登记 Hash 路由`);
  assert.match(bridgeSource, new RegExp(`['"]${entry.id}['"]\\s*:`), `${entry.id} 必须存在真实点击流程`);
});

catalog.ready.filter((entry) => entry.previewMode !== 'route-trigger').forEach((entry) => {
  assert.ok(Array.isArray(entry.styles) && entry.styles.length, `${entry.id} 必须登记真实 CSS`);
  assert.ok(Array.isArray(entry.scripts) && entry.scripts.length, `${entry.id} 必须登记真实脚本`);
  entry.styles.concat(entry.scripts).forEach((asset) => {
    assert.ok(fs.existsSync(path.join(root, asset)), `${entry.id} 资源不存在：${asset}`);
  });
});

const previewSource = fs.readFileSync(previewPath, 'utf8');
assert.match(previewSource, /entry\.previewMode === 'route-trigger'/);
assert.doesNotMatch(previewSource, /GAIP Agent 助手主面板/, '预览页可见源码不应出现已排除主面板名称');
assert.match(previewSource, /loading="eager"/, '弹窗 iframe 必须主动加载，不能因懒加载漏项');
assert.match(previewSource, /gaip-popup-preview/, '父页必须接收真实弹窗打开状态');
assert.match(previewSource, /routeConcurrency = 2/, '正式频道预览必须限流，避免同时启动全部 Umi 页面');
assert.match(previewSource, /pumpRouteQueue\(\)/, '正式频道预览队列必须持续加载后续项目');
assert.match(previewSource, /location\.replace\('\.\.\/登录\.html#'/);
assert.match(previewSource, /pending\.length \?/);
assert.doesNotMatch(previewSource, /createPreviewModal\(/, '预览页不得调用 Agent 演示 DOM');

const localPreviewSource = fs.readFileSync(localPreviewPath, 'utf8');
assert.match(localPreviewSource, /gaip-popup-preview/);
assert.match(localPreviewSource, /chapter: 5, section: 1/, '入职完成弹窗预览必须进入真实可完成状态');
assert.match(bridgeSource, /gaip-popup-preview-clean-background/, '频道背景必须由预览隔离层遮住');
assert.match(bridgeSource, /markOpened\('联系产品专家'\)/);
assert.match(bridgeSource, /clickText\('标记已转化'/);
assert.match(bridgeSource, /markOpened\('方案详情预览'\)/);
assert.match(bridgeSource, /clickSelector\('\[class\*="signUpContainer___"\]'/, '报名记录必须点击真实卡片容器');
assert.match(bridgeSource, /button\[aria-label="更多操作"\]/, '会话重命名必须使用源码真实入口');
assert.match(localPreviewSource, /popup-preview-bridge\.js\?v=20260901-3/);

const entryFiles = fs.readdirSync(root).filter((name) => name !== 'index-login-video-test.html' && name.endsWith('.html') &&
  fs.readFileSync(path.join(root, name), 'utf8').includes('shared/scripts/local-preview.js'));
assert.equal(entryFiles.length, 15, '应覆盖 15 个正式入口');
entryFiles.forEach((name) => {
  assert.match(fs.readFileSync(path.join(root, name), 'utf8'), /local-preview\.js\?v=20260901-4/, `${name} 缓存版本未同步`);
});

console.log('popup preview registry: 45 total / 28 ready / 0 pending / 17 excluded');
console.log('route-trigger previews: 15');
