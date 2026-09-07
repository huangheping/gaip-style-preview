#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const outputPath = path.join(root, '全局组件', '弹窗自动索引.generated.js');
const runtimePath = path.join(root, 'shared', 'scripts', 'modal-registry.js');
const baselinePath = path.join(root, '全局组件', '弹窗源登记.js');
const checkOnly = process.argv.includes('--check');
const scanRoots = ['shared', 'features', 'AI Agent'].map((directory) => path.join(root, directory));
const ignoredDirectories = new Set(['node_modules', '.git', '原版备份_20260812']);
const markerPattern = /\/\*\s*@gaip-modal\s*([\s\S]*?)\*\//g;

function walk(directory, files) {
  if (!fs.existsSync(directory)) return;
  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    if (ignoredDirectories.has(entry.name)) return;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute, files);
    else if (entry.isFile() && entry.name.endsWith('.js') && absolute !== outputPath) files.push(absolute);
  });
}

function validate(entry, sourceFile) {
  ['id', 'title', 'channel', 'type', 'status'].forEach((key) => {
    if (typeof entry[key] !== 'string' || !entry[key].trim()) throw new Error(`${sourceFile}: @gaip-modal 缺少字段 ${key}`);
  });
  if (entry.status === 'ready' && entry.type !== 'drawer' && entry.previewMode !== 'route-trigger') {
    if (!entry.invoke || typeof entry.invoke.path !== 'string') throw new Error(`${sourceFile}: ${entry.id} 缺少 invoke.path`);
    if (!Array.isArray(entry.styles) || !entry.styles.length) throw new Error(`${sourceFile}: ${entry.id} 缺少 styles`);
    if (!Array.isArray(entry.scripts) || !entry.scripts.length) throw new Error(`${sourceFile}: ${entry.id} 缺少 scripts`);
  }
  if (entry.status === 'ready' && entry.type !== 'drawer' && !['information', 'form', 'confirmation'].includes(entry.category)) {
    throw new Error(`${sourceFile}: ${entry.id} 缺少合法的 category（information / form / confirmation）`);
  }
}

function baselineIds() {
  const window = {};
  const context = { window, Map, CustomEvent: function () {} };
  window.window = window;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(runtimePath, 'utf8'), context, { filename: runtimePath });
  vm.runInContext(fs.readFileSync(baselinePath, 'utf8'), context, { filename: baselinePath });
  return new Set(window.__GAIP_MODAL_SOURCE_CATALOG__.list.map((entry) => entry.id));
}

const files = [];
scanRoots.forEach((directory) => walk(directory, files));
files.sort();
const entries = [];
const ids = baselineIds();

files.forEach((absolute) => {
  const source = fs.readFileSync(absolute, 'utf8');
  const relative = path.relative(root, absolute).split(path.sep).join('/');
  let match;
  while ((match = markerPattern.exec(source))) {
    let entry;
    try { entry = JSON.parse(match[1].trim()); }
    catch (error) { throw new Error(`${relative}: @gaip-modal 不是有效 JSON：${error.message}`); }
    validate(entry, relative);
    if (ids.has(entry.id)) throw new Error(`${relative}: 弹窗 id 重复：${entry.id}`);
    ids.add(entry.id);
    entry.definitionSource = relative;
    entries.push(entry);
  }
});

const generated = `(function () {\n  'use strict';\n  if (!window.__GAIP_MODAL_REGISTRY__) throw new Error('请先加载 modal-registry.js');\n  window.__GAIP_MODAL_REGISTRY__.registerMany(${JSON.stringify(entries, null, 2)}, { origin: 'source-annotation' });\n}());\n`;
const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '';

if (checkOnly) {
  if (current !== generated) {
    console.error('弹窗自动索引已过期，请运行：node scripts/generate-modal-catalog.cjs');
    process.exit(1);
  }
  console.log(`modal catalog is current: ${entries.length} source-registered modal(s)`);
} else if (current !== generated) {
  fs.writeFileSync(outputPath, generated);
  console.log(`updated ${path.relative(root, outputPath)}: ${entries.length} source-registered modal(s)`);
} else {
  console.log(`modal catalog unchanged: ${entries.length} source-registered modal(s)`);
}
