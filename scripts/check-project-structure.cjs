#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL, fileURLToPath } = require('node:url');
const { JSDOM } = require('jsdom');
const root = path.resolve(process.argv.find(a => a.startsWith('--root='))?.slice(7) || path.join(__dirname, '..'));
const errors = [];
const fail = message => errors.push(message);
const navTemplate = path.join(root, 'shared/scripts/templates/markup-learning-nav.html');
if (fs.existsSync(navTemplate)) {
  const dom = new JSDOM(fs.readFileSync(navTemplate, 'utf8'));
  const icons = [...dom.window.document.querySelectorAll('template[data-gaip-markup^="nav-icon-"]')];
  if (icons.length !== 12) fail('导航图标模板必须有 12 项');
  const signature = svg => JSON.stringify([svg.getAttribute('viewBox'), ...[...svg.querySelectorAll('*')]
    .filter(n => n.tagName.toLowerCase() !== 'title')
    .map(n => [n.tagName.toLowerCase(), [...n.attributes].filter(a => a.name !== 'id')
      .map(a => [a.name, a.value.replace(/#2f3640/ig, 'currentColor')]).sort()])]);
  for (const template of icons) {
    const key = template.dataset.gaipMarkup.slice(9);
    const registry = JSON.parse(fs.readFileSync(path.join(root,'shared/assets/icons/registry.json'),'utf8'));
    const local = registry.assets.find(a => a.kind === 'inline-svg' && a.template === 'nav-icon-' + key);
    const asset = path.join(root, local?.file || '__missing_icon__');
    const svg = template.content.querySelector('svg');
    if (!svg || !fs.existsSync(asset)) { fail('导航图标缺少模板或独立 SVG ' + key); continue; }
    const original = new JSDOM(fs.readFileSync(asset, 'utf8'), { contentType: 'image/svg+xml' });
    if (signature(svg) !== signature(original.window.document.documentElement)) fail('导航图标与独立 SVG 不一致 ' + key);
    for (const node of svg.querySelectorAll('[stroke],[fill],[opacity]')) {
      for (const attr of ['stroke', 'fill']) {
        // The supplied mint glyph has a white 0.4px contour, not a state color.
        const originalContour = key === 'induction-guide' && attr === 'stroke' && node.getAttribute(attr) === '#FFFFFF' && node.getAttribute('stroke-width') === '0.4';
        if (node.hasAttribute(attr) && !['none', 'currentColor'].includes(node.getAttribute(attr)) && !originalContour) fail('导航图标必须使用 currentColor ' + key);
      }
      if (node.hasAttribute('opacity') && Number(node.getAttribute('opacity')) !== 1) fail('导航图标透明度必须统一为 1 ' + key);
    }
    original.window.close();
  }
  dom.window.close();
}
function walk(folder) {
  if (!fs.existsSync(folder)) return [];
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(folder, e.name)) : [path.join(folder, e.name)]);
}
function localURL(value, base, owner) {
  if (!value || /^(?:data:|blob:|https?:|mailto:|tel:|#)/i.test(value) || value.includes('${') || /\{\{gaip:\d+\}\}/.test(value)) return;
  try {
    const url = new URL(value, base);
    if (url.protocol !== 'file:') return;
    const target = fileURLToPath(url);
    if (!target.startsWith(root + path.sep) && target !== root) fail(owner + ': 资源越出项目 ' + value);
    else if (!fs.existsSync(target)) fail(owner + ': 资源不存在 ' + value);
  } catch { fail(owner + ': 无效路径 ' + value); }
}
const manifestPath = path.join(root, 'shared/config/project-structure.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const markupManifestPath = path.join(root, 'shared/config/markup-templates.json');
const markupSources = fs.existsSync(markupManifestPath) ? JSON.parse(fs.readFileSync(markupManifestPath, 'utf8')) : [];
if (manifest.projectEntry) {
  const rootHTML = fs.readdirSync(root).filter(n => n.endsWith('.html'));
  if (rootHTML.length !== 1 || rootHTML[0] !== 'index.html') fail('根目录只允许一个 index.html 项目目录');
  for (const c of [...manifest.channels, ...manifest.extraEntries]) if (c.entry !== c.directory + '/index.html') fail(c.entry + ': 入口必须在所属频道目录');
}
const channels = [...manifest.channels, ...(manifest.extraEntries || [])];
for (const entry of fs.readdirSync(path.join(root, 'channels'), { withFileTypes: true })) {
  const directory = 'channels/' + entry.name;
  if (entry.isDirectory() && !channels.some(c => c.directory === directory)) channels.push({ directory });
}
for (const channel of channels) {
  const folder = path.join(root, channel.directory);
  if (channel.localOnly && !fs.existsSync(folder) && !fs.existsSync(path.join(root, channel.entry))) continue;
  const files = walk(folder);
  for (const ext of ['.html', '.css', '.js']) if (!files.some(p => p.endsWith(ext))) fail(channel.directory + ': 缺少 ' + ext);
  if (!fs.existsSync(path.join(folder, 'index.html'))) fail(channel.directory + ': 缺少 index.html');
  for (const file of files.filter(p => /\.(?:html|css|js)$/.test(p))) {
    const source = fs.readFileSync(file, 'utf8');
    // Private asset dependencies may not cross channel ownership.
    for (const m of source.matchAll(/channels\/([^/\s'"<>]+)\/assets\//g)) {
      if (m[1] !== path.basename(folder)) fail(path.relative(root, file) + ': 引用了频道 ' + m[1] + ' 的私有资源');
    }
  }
}
const files = ['channels', 'components', 'app', 'shared'].flatMap(d => walk(path.join(root, d)));
files.push(...fs.readdirSync(root).filter(n => n.endsWith('.html')).map(n => path.join(root, n)));
for (const file of files) {
  const relative = path.relative(root, file);
  // Fixed embedded image payloads hide assets from their owning directory.
  // The byte-locked third-party runtime is audited separately by check:js-styles.
  if (/\.(?:html|css|js)$/.test(file) && relative !== 'shared/runtime/umi.0b0663b5.js') {
    const content = fs.readFileSync(file, 'utf8');
    if (/data:image\//i.test(content)) {
      if (relative === 'components/modal/global-modal.css') {
        const copy = content.match(/--gaip-modal-close-image: url\("data:image\/svg\+xml,([^"]+)"\)/);
        const asset = path.join(root, 'shared/assets/icons/third-party/ant-design/close-outlined.svg');
        let valid = false;
        try { valid = copy && fs.existsSync(asset) && decodeURIComponent(copy[1]) === fs.readFileSync(asset, 'utf8').trim(); } catch {}
        if (!valid || (content.match(/data:image\//gi) || []).length !== 1) fail(relative + ': 关闭遮罩与独立 SVG 不一致');
      } else fail(relative + ': 固定图片必须存入所属 assets，禁止 data:image 内嵌资源');
    }
  }
  if (/\.(?:html|css|js)$/.test(file) && relative.startsWith('components' + path.sep)) {
    // The generated icon inventory reads original resources for provenance only.
    // It is loaded exclusively by the component catalog, never a business entry.
    const content=fs.readFileSync(file,'utf8');
    let previewProvenance=false;
    if(relative==='components/icons/icon-catalog-data.js'){
      const payload=content.match(/^\/\* Generated by scripts\/build-icon-catalog\.cjs; source references are preview provenance, not business dependencies\. \*\/\nwindow\.__GAIP_ICON_CATALOG_DATA__ = ([\s\S]+);\n$/);
      try{const data=payload&&JSON.parse(payload[1]);previewProvenance=!!data&&Array.isArray(data.items)&&data.version===1;}catch{}
      if(!previewProvenance)fail(relative+': 图标盘点例外只允许生成的纯 JSON 来源数据');
    }
    if (!previewProvenance && /channels\/[^/\s'"<>]+\/assets\//.test(content)) fail(relative + ': 组件依赖频道私有资产');
  }
  if (file.endsWith('.html')) {
    const source = fs.readFileSync(file, 'utf8');
    const isTemplate = relative.includes(path.sep + 'templates' + path.sep);
    const markupOwner = markupSources.find(item => [item.template, ...(item.additionalTemplates || [])].includes(relative.split(path.sep).join('/')));
    const templateBase = path.join(root, markupOwner?.documentBase || 'index.html');
    const dom = new JSDOM(source, { url: pathToFileURL(relative === 'app/project-index/templates/index.html' ? path.join(root, 'app/project-index/index.html') : isTemplate ? templateBase : file).href });
    const doc = dom.window.document;
    // querySelectorAll does not enter inert template contents. Inspect every
    // nested fragment using the owning entry's base URI as well.
    function inspectHTML(scope) {
      if (scope.querySelector('style,[style]')) fail(relative + ': 存在内联 CSS');
      for (const el of scope.querySelectorAll('*')) {
        for (const attr of el.attributes) if (/^on/i.test(attr.name)) fail(relative + ': 存在内联事件 ' + attr.name);
      }
      for (const script of scope.querySelectorAll('script:not([src])')) {
        if (script.textContent.trim() && (!script.type || /javascript|module/.test(script.type))) fail(relative + ': 存在内联 JS');
      }
      for (const el of scope.querySelectorAll('script[src],link[href],img[src],video[src],audio[src],source[src]')) {
        localURL(el.getAttribute('src') || el.getAttribute('href'), doc.baseURI, relative);
      }
      for (const template of scope.querySelectorAll('template')) if (template.content) inspectHTML(template.content);
    }
    inspectHTML(doc);
    dom.window.close();
  } else if (file.endsWith('.css')) {
    const source = fs.readFileSync(file, 'utf8');
    for (const m of source.matchAll(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/g)) localURL(m[2], pathToFileURL(file).href, relative);
  } else if (file.endsWith('.js') && !relative.includes('/legacy/') && !relative.startsWith('shared/runtime/')) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(/\sstyle\s*=\s*"[^"\n]*"/g)) {
      fail(relative + ': JS 字符串内联样式，应维护独立 CSS');
    }
    if (/createElement\(['"]style['"]\)/.test(source)) fail(relative + ': JS 注入静态 style 元素');
  }
}
if (errors.length) { console.error([...new Set(errors)].join('\n')); process.exitCode = 1; }
else console.log('PASS: channel ownership, HTML separation and literal local HTML/CSS resources. Dynamic JS/legacy runtime requires browser validation.');
