#!/usr/bin/env node
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..'), check = process.argv.includes('--check');
const window = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'shared/config/channels.js'), 'utf8'), { window });
const config = window.__GAIP_CHANNEL_CONFIG__;
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function output(relative, value) {
  const file = path.join(root, relative);
  if (check) { if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== value) throw Error('生成入口过期：' + relative); }
  else { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, value); }
}
for (const c of [...config.list, ...config.standaloneEntries]) {
  if (!/^channels\/[a-z][a-z0-9-]*$/.test(c.directory) || c.entry !== c.directory + '/index.html') throw Error('频道入口必须位于自己的目录：' + c.entry);
  if (c.entryAliases?.length) throw Error('已停用根入口别名，请使用频道目录入口');
  if (c.localOnly && !fs.existsSync(path.join(root,c.entry))) continue;
  if (!fs.existsSync(path.join(root,c.entry))) throw Error('频道入口缺失：' + c.entry);
}
const ordered = [...config.list].sort((a,b) => {
  const order = config.sidebarOrder || config.list.map(c=>c.key);
  return order.indexOf(a.key) - order.indexOf(b.key);
});
const cards = ordered.map((c,i) => `        <article class="channel-card" data-channel-card data-search="${escape(c.label + ' ' + c.key + ' ' + c.directory)}">
          <div class="channel-heading"><span class="channel-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><h3><a data-open-channel href="${escape(c.entry)}">${escape(c.label)}<span aria-hidden="true">↗</span></a></h3></div>
          <code>${escape(c.directory)}/</code>
          <div class="channel-links"><a href="${escape(c.directory)}/">源码文件夹</a><a href="${escape(c.directory)}/README.md">维护说明</a></div>
        </article>`).join('\n');
const login = config.standaloneEntries.find(c=>c.id==='login');
const template = fs.readFileSync(path.join(root,'app/project-index/templates/index.html'),'utf8');
const html = template.replace('<!-- CHANNEL_CARDS -->',cards).replaceAll('{{CHANNEL_COUNT}}',String(config.list.length)).replaceAll('{{LOGIN_ENTRY}}',escape(login.entry));
output('app/project-index/index.html','<!-- Generated from app/project-index/templates/index.html and shared/config/channels.js; run npm run build:entries. -->\n'+html);
const loginHTML = fs.readFileSync(path.join(root, login.entry), 'utf8').replace('href="../../"', 'href="./"');
output('index.html','<!-- Generated from channels/login/index.html; run npm run build:entries. -->\n'+loginHTML);
const old = JSON.parse(fs.readFileSync(path.join(root, 'shared/config/project-structure.json'), 'utf8'));
const manifest = { version: 2, generatedFrom: 'shared/config/channels.js', projectEntry: 'index.html', directoryEntry: 'app/project-index/index.html', channels: config.list.map(c => ({ id:c.key, label:c.label, directory:c.directory, entry:c.entry, html:c.entry, implementation:c.implementation })), extraEntries:config.standaloneEntries, bundleMap:old.bundleMap };
output('shared/config/project-structure.json', JSON.stringify(manifest, null, 2)+'\n');
const redundant = fs.readdirSync(root).filter(name=>name.endsWith('.html')&&name!=='index.html');
if (redundant.length) throw Error('根目录只保留 index.html，请先归档旧入口：'+redundant.join('、'));
console.log(check?'Project directory and canonical entries are current.':'Project directory generated; channel HTML remains the source.');
