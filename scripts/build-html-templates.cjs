#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const check = process.argv.includes('--check');
console.log('Owned markup templates: ' + require('./build-markup-templates.cjs').build(root, check));
function publish(relative, content) {
  const file = path.join(root, relative);
  if (check) {
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== content) throw new Error('模板产物过期：' + relative);
  } else fs.writeFileSync(file, content);
}
const folder = path.join(root, 'channels/config-center/templates');
function expand(value) {
  if (Array.isArray(value)) return value.map(expand);
  if (value && typeof value === 'object') {
    if (value.$template) return fs.readFileSync(path.join(folder, value.$template), 'utf8').replace(/>\s+</g, '><').trim();
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, expand(v)]));
  }
  return value;
}
const values = expand(JSON.parse(fs.readFileSync(path.join(folder, 'metadata.json'), 'utf8')));
for (const name of fs.readdirSync(folder).filter(n => n.endsWith('.html') && !/^(?:markup-|rows-|departmentUi-)/.test(n)).sort()) {
  values[path.basename(name, '.html')] = fs.readFileSync(path.join(folder, name), 'utf8').replace(/>\s+</g, '><').trim();
}
const dialogs = fs.readFileSync(path.join(root, 'channels/config-center/source-dialogs.js'), 'utf8');
publish('channels/config-center/source-markup.js', '/* Generated from templates/*.html and source-dialogs.js by build-html-templates.cjs. Do not edit. */\nwindow.__GAIP_CONFIG_SOURCE__ = ' + JSON.stringify(values, null, 2) + ';\n' + dialogs);
const learning = fs.readFileSync(path.join(root, 'channels/learning-center/templates/home.html'), 'utf8').replace(/>\s+</g, '><').trim();
publish('channels/learning-center/templates.generated.js', '/* Generated from templates/home.html; classic script supports file://. */\nwindow.__GAIP_HTML_TEMPLATES__ = window.__GAIP_HTML_TEMPLATES__ || {};\nwindow.__GAIP_HTML_TEMPLATES__["learning-home"] = ' + JSON.stringify(learning) + ';\n');
const newsFolder = path.join(root, 'channels/news-center/templates');
const newsTemplates = fs.readdirSync(newsFolder).filter(name => name.endsWith('.html') && !name.startsWith('markup-')).sort().map(name => {
  const html = fs.readFileSync(path.join(newsFolder, name), 'utf8').replace(/>\s+</g, '><').trim();
  return 'window.__GAIP_HTML_TEMPLATES__[' + JSON.stringify('news-' + path.basename(name, '.html')) + '] = ' + JSON.stringify(html) + ';';
}).join('\n');
publish('channels/news-center/templates.generated.js', '/* Generated from templates/*.html; edit HTML and run npm run build:templates. */\nwindow.__GAIP_HTML_TEMPLATES__ = window.__GAIP_HTML_TEMPLATES__ || {};\n' + newsTemplates + '\n');
console.log(check ? 'HTML template outputs are current.' : 'HTML template outputs updated.');

console.log('Page HTML views: ' + require('./build-page-views.cjs').build(root, check));
