const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const css = read('channels/proposal-center/proposal-center.css');
const js = read('channels/proposal-center/proposal-center.js');
const template = read('channels/proposal-center/templates/markup-proposal-center.html');
const statusCss = read('components/status-tag/global-status-tag.css');
const config = read('shared/config/channels.js');

function block(selector) {
  const start = css.indexOf('\n    ' + selector + ' {');
  assert.notEqual(start, -1, selector + ' 存在');
  const end = css.indexOf('\n    }', start);
  assert.notEqual(end, -1, selector + ' 规则闭合');
  return css.slice(start, end);
}

for (const [selector, declaration] of [
  ['.gaip-proposal-hero h1', 'font-size: 20px'],
  ['.gaip-record-category', 'font-size: 14px'],
  ['.gaip-record-count', 'font-size: 12px'],
  ['.gaip-record-summary', 'font-size: 12px'],
  ['.gaip-record-card h3', 'font-size: 16px'],
  ['.gaip-record-id', 'font-size: 12px'],
  ['.gaip-record-client', 'font-size: 12px'],
  ['.gaip-record-date', 'font-size: 12px'],
  ['.gaip-record-action', 'font-size: 14px']
]) {
  assert.ok(block(selector).includes(declaration), selector + ' 使用 ' + declaration);
}

const attachmentStart = css.indexOf('\n    .gaip-file-overlay');
assert.notEqual(attachmentStart, -1, '附件预览边界存在');
assert.doesNotMatch(css.slice(0, attachmentStart), /font-size:\s*(13|15|17)px/, '方案主页面不保留奇数字号');
assert.doesNotMatch(css, /\.gaip-record-owner-status\s*\{/, '业务页不重复维护状态标签皮肤');

assert.match(statusCss, /height:\s*24px/);
assert.match(statusCss, /font-size:\s*12px/);
assert.match(statusCss, /padding:\s*0 10px/);
assert.match(statusCss, /border-radius:\s*12px/);
assert.match(statusCss, /data-gaip-status-tag="success"/);
assert.match(statusCss, /data-gaip-status-tag="warning"/);

assert.equal((template.match(/data-gaip-status-tag=/g) || []).length, 1, '记录归属是方案模板唯一状态标签');
assert.match(template, /data-gaip-status-tag="\{\{gaip:5\}\}"/);
assert.match(js, /linked \? 'success' : 'warning'/);
assert.match(js, /linked \? '已归属' : '待确认客户归属'/);

assert.match(config, /components\/status-tag\/global-status-tag\.css\?v=20261008-1/);
assert.match(config, /proposal-center\.css\?v=20261008-typography-1/);
assert.match(config, /proposal-center\.js\?v=20261008-status-tag-1/);

const entryFiles = ['index.html'];
for (const name of fs.readdirSync(path.join(root, 'channels'))) {
  const file = path.join('channels', name, 'index.html');
  if (fs.existsSync(path.join(root, file))) entryFiles.push(file);
}
for (const file of entryFiles) {
  assert.doesNotMatch(read(file), /channels\.js\?v=20261008-product-details-1/, file + ' 不加载旧配置缓存');
  assert.match(read(file), /channels\.js\?v=20261008-status-tags-1/, file + ' 加载状态标签配置');
}

console.log('proposal status tags and typography contract passed for ' + entryFiles.length + ' entries');
