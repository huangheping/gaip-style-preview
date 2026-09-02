const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const entries = [
  ['财富值中心.html', '#/workspace?gaip-channel=wealth&gaip-view=import-workbench'],
  ['资讯中心.html', '#/workspace?gaip-channel=news'],
  ['学习中心.html', '#/workspace?gaip-channel=learning']
];
const foreignHash = '#/workspace?gaip-channel=config&gaip-view=organization';

function startupScript(file) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const scripts = Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g));
  const match = scripts.find((entry) => entry[1].includes('location.hash'));
  assert.ok(match, `${file} 缺少默认 Hash 初始化脚本`);
  return match[1];
}

entries.forEach(([file, defaultHash]) => {
  const source = startupScript(file);
  const refreshContext = { location: { hash: foreignHash }, window: {} };
  vm.runInNewContext(source, refreshContext, { filename: file });
  assert.equal(refreshContext.location.hash, foreignHash, `${file} 不得覆盖已有频道 Hash`);
  assert.equal(refreshContext.window.__GAIP_PAGE_OVERRIDE__, undefined, `${file} 不得写入粘性频道覆盖标记`);

  const directContext = { location: { hash: '' }, window: {} };
  vm.runInNewContext(source, directContext, { filename: file });
  assert.equal(directContext.location.hash, defaultHash, `${file} 直接打开时应补默认虚拟频道 Hash`);
});

console.log('PASS: virtual entry filenames preserve an existing Hash and only provide defaults for empty URLs.');
