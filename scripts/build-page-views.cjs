'use strict';
// Maintained HTML sources live in channel index.html. Only the bounded cache
// section of page.js is generated; business bindings below it are preserved.
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const sourceBegin = '<!-- @gaip-page-views:start -->';
const sourceEnd = '<!-- @gaip-page-views:end -->';
const cacheBegin = '/* @gaip-page-cache:start */';
const cacheEnd = '/* @gaip-page-cache:end */';
const controls = new Set(['data-component','data-props','data-key','data-kind','data-children']);
function compileHTML(source, prefix) {
  const document = new JSDOM('<!doctype html><html><body>' + source + '</body></html>').window.document;
  const views = Object.create(null);
  function binding(value) {
    if (value && !/^[A-Za-z_$][\w$]*$/.test(value)) throw new Error('Invalid view binding: ' + value);
    return value;
  }
  function parse(node) {
    if (node.nodeType === 3) return {text: node.textContent.trim()};
    if (node.hasAttribute('data-text')) return {text:node.getAttribute('data-text')};
    if (node.hasAttribute('data-slot')) return {slot:binding(node.getAttribute('data-slot'))};
    if (['script','style'].includes(node.localName) || !['jsx','jsxs'].includes(node.getAttribute('data-kind'))) throw new Error('Invalid view element: ' + node.localName);
    const props = {};
    for (const attribute of node.attributes) {
      if (controls.has(attribute.name)) continue;
      const key = attribute.name.startsWith('data-ui-') ? attribute.name.slice(8).replace(/-([a-z])/g, (_, c) => c.toUpperCase()) : attribute.name === 'class' ? 'className' : attribute.name;
      if (key === 'style' || /^on/i.test(key) || ['__proto__','prototype','constructor'].includes(key)) throw new Error('Executable/style property must not be in HTML: ' + key);
      props[key] = attribute.value;
    }
    const childrenType = node.getAttribute('data-children');
    const children = [...node.childNodes].filter(n=>n.nodeType===1||n.nodeType===3&&n.textContent.trim()).map(parse);
    if (children.length && !childrenType || childrenType && !['single','array'].includes(childrenType) || childrenType==='single'&&children.length!==1) throw new Error('Invalid children contract: ' + node.outerHTML);
    return {tag:node.localName, component:binding(node.getAttribute('data-component')), propsBinding:binding(node.getAttribute('data-props')), key:binding(node.getAttribute('data-key')), kind:node.getAttribute('data-kind'), props, childrenType, children};
  }
  for (const template of document.body.children) {
    const id = template.getAttribute('id');
    if (template.localName !== 'template' || !id || !id.startsWith(prefix + '-') || Object.hasOwn(views,id) || template.content.children.length !== 1) throw new Error('Invalid/duplicate channel template: ' + id);
    views[id] = parse(template.content.firstElementChild);
  }
  if (!Object.keys(views).length) throw new Error('No HTML views: ' + prefix);
  return views;
}
function build(root, check) {
  let count = 0;
  for (const channel of fs.readdirSync(path.join(root,'channels'))) {
    const directory = path.join(root,'channels',channel), htmlPath = path.join(directory,'index.html');
    if (!fs.existsSync(htmlPath)) continue;
    const html = fs.readFileSync(htmlPath,'utf8'), begin = html.indexOf(sourceBegin), end = html.indexOf(sourceEnd);
    if (begin < 0) { if (end >= 0) throw new Error('Unpaired view markers'); continue; }
    if (end < begin || html.indexOf(sourceBegin,begin+1)>=0 || html.indexOf(sourceEnd,end+1)>=0) throw new Error('Invalid view markers: '+channel);
    const values = compileHTML(html.slice(begin+sourceBegin.length,end),channel);
    const file = path.join(directory,'page.js'), current = fs.readFileSync(file,'utf8');
    const from = current.indexOf(cacheBegin), to = current.indexOf(cacheEnd);
    if (from !== 0 || to < from || current.indexOf(cacheBegin,1)>=0 || current.indexOf(cacheEnd,to+1)>=0) throw new Error('Invalid generated cache markers: '+file);
    const cache = cacheBegin+'\n"use strict";\n// Generated from this channel’s index.html. Edit its HTML and run npm run build:templates.\nwindow.__GAIP_HTML_VIEW__.register('+JSON.stringify(values)+');\n'+cacheEnd;
    const expected = cache + current.slice(to+cacheEnd.length);
    if (check) { if (current !== expected) throw new Error('HTML view cache is stale: '+channel); }
    else if (current !== expected) fs.writeFileSync(file,expected);
    count += Object.keys(values).length;
  }
  return count;
}
function checkShell(file) {
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'));
  dom.window.document.querySelectorAll('template').forEach(node => node.remove());
  if (Buffer.byteLength(dom.serialize()) > 20000) throw new Error('Active entry shell exceeds limit: '+file);
}
module.exports = {compileHTML, build, checkShell};
if (require.main === module) console.log('HTML page views: '+build(path.resolve(__dirname,'..'),process.argv.includes('--check'))+' templates.');
