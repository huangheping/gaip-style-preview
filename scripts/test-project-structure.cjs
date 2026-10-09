'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const parent = path.join(root, 'outputs/structure-tests');
fs.mkdirSync(parent, { recursive: true });
const target = fs.mkdtempSync(path.join(parent, 'run-'));
const write = (name, value) => { const file=path.join(target,name); fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file,value); };
const run = () => spawnSync(process.execPath, [path.join(root, 'scripts/check-project-structure.cjs'), '--root='+target], {encoding:'utf8'});
const html = '<!doctype html><html><head><link rel="stylesheet" href="styles.css"><script src="script.js"></script></head><body><div>Fixture</div></body></html>';
write('shared/config/project-structure.json', JSON.stringify({channels:[{directory:'channels/home'}]}));
write('channels/home/index.html',html); write('channels/home/styles.css','body { color: black; }'); write('channels/home/script.js','"use strict";');
assert.equal(run().status,0,'valid independent fixture passes');
for (const [name,content,expected] of [
  ['channels/home/index.html',html.replace('<div>','<div style="color:red">'),'内联 CSS'],
  ['channels/home/styles.css','body { background: url(missing.png); }','资源不存在'],
  ['channels/home/index.html',html.replace('<div>Fixture</div>', '<template><template><div style="color:red"></div></template></template>'),'内联 CSS'],
  ['channels/home/index.html',html.replace('<div>Fixture</div>', '<template><button onclick="run()">Click</button></template>'),'内联事件'],
  ['channels/home/index.html',html.replace('<div>Fixture</div>', '<template><script>run()</script></template>'),'内联 JS'],
  ['channels/home/index.html',html.replace('<div>Fixture</div>', '<template><img src="missing.png"></template>'),'资源不存在'],
  ['channels/home/script.js','const image="channels/another/assets/private.png";','私有资源'],
  ['channels/home/script.js','const image="data:image/png;base64,YQ==";','内嵌资源'],
  ['channels/home/styles.css','body { background:url("data:image/svg+xml,%3Csvg%2F%3E"); }','内嵌资源'],
  ['channels/home/index.html',html.replace('<div>Fixture</div>','<template><img src="data:image/png;base64,YQ=="></template>'),'内嵌资源'],
  ['channels/home/script.js',`const markup='<div style="color:red"></div>';`,'内联样式']
]) {
  const original=fs.readFileSync(path.join(target,name),'utf8'); write(name,content);
  const result=run(); assert.notEqual(result.status,0); assert.ok(result.stderr.includes(expected),result.stderr);
  write(name,original);
}
write('channels/home/valid.svg','<svg xmlns="http://www.w3.org/2000/svg"/>');
write('channels/home/index.html',html.replace('<div>Fixture</div>','<template><template><img src="valid.svg"></template></template>'));
assert.equal(run().status,0,'nested template assets resolve relative to owning HTML');
write('channels/home/index.html',html.replace('<div>Fixture</div>','<template><svg><template data-slot="points"></template></svg></template>'));
assert.equal(run().status,0,'SVG binding placeholders have ordinary child nodes, no HTML content fragment');
const navCSS=fs.readFileSync(path.join(root,'shared/styles/main-nav.css'),'utf8');
write('shared/styles/main-nav.css',navCSS);
write('shared/scripts/templates/markup-learning-nav.html',fs.readFileSync(path.join(root,'shared/scripts/templates/markup-learning-nav.html')));
const iconRegistry=JSON.parse(fs.readFileSync(path.join(root,'shared/assets/icons/registry.json'),'utf8'));
write('shared/assets/icons/registry.json',JSON.stringify(iconRegistry));
for(const item of iconRegistry.assets.filter(a=>a.kind==='inline-svg'&&a.template?.startsWith('nav-icon-')))write(item.file,fs.readFileSync(path.join(root,item.file)));
const workspaceIcon=iconRegistry.assets.find(a=>a.template==='nav-icon-workspace').file;
assert.equal(run().status,0,'navigation templates preserve owned SVG geometry and currentColor');
write(workspaceIcon,'<svg xmlns="http://www.w3.org/2000/svg"/>');
let mismatch=run();assert.notEqual(mismatch.status,0);assert.match(mismatch.stderr,/导航图标与独立 SVG 不一致/);
write(workspaceIcon,fs.readFileSync(path.join(root,workspaceIcon)));
write('shared/runtime/not-a-vendor.js','const image="data:image/png;base64,YQ==";');
mismatch=run();assert.notEqual(mismatch.status,0);assert.match(mismatch.stderr,/内嵌资源/);
fs.unlinkSync(path.join(target,'shared/runtime/not-a-vendor.js'));
fs.renameSync(path.join(target,'channels/home/script.js'),path.join(target,'script.saved'));
assert.notEqual(run().status,0,'missing channel script is rejected');
console.log('PASS: project checker rejects real missing files, inline styles, broken CSS paths and cross-channel private resources.');
