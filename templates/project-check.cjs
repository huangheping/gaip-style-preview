'use strict';
const fs = require('node:fs'), path = require('node:path');
const { pathToFileURL, fileURLToPath } = require('node:url');
const { auditSource, auditStaticMarkup } = require('./js-style-audit.cjs');
const root = path.resolve(__dirname, '..'), errors = [];
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (['outputs','node_modules','.git','.aoci','.obsidian'].includes(entry.name)) return [];
    const file = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) { errors.push(file + ': external link is not a portable project asset'); return []; }
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const files = walk(root);
function resource(value, file) {
  if (/^(?:https?:|data:|blob:|#|mailto:|tel:)/i.test(value)) return;
  try {
    const target = fileURLToPath(new URL(value, pathToFileURL(file)));
    if (!target.startsWith(root + path.sep) || !fs.existsSync(target)) errors.push(file + ': invalid local resource ' + value);
    const owner = path.relative(root,file).split(path.sep), destination = path.relative(root,target).split(path.sep);
    if (destination[0] === 'channels' && destination.includes('assets') && (owner[0] !== 'channels' || owner[1] !== destination[1])) errors.push(file + ': private channel asset dependency ' + value);
  } catch { errors.push(file + ': invalid URL ' + value); }
}
for (const entry of fs.readdirSync(path.join(root,'channels'), {withFileTypes:true}).filter(e => e.isDirectory())) {
  for (const name of ['index.html','styles.css','script.js']) if (!fs.existsSync(path.join(root,'channels',entry.name,name))) errors.push(entry.name + ': missing ' + name);
}
for (const file of files) {
  if (!/\.(?:html|css|[cm]?js|md)$/.test(file)) continue;
  const source = fs.readFileSync(file,'utf8');
  if (/\.(?:html|css|[cm]?js)$/.test(file) && !file.startsWith(path.join(root,'scripts')+path.sep) && /data:image\//i.test(source)) errors.push(file + ': fixed images belong in owner assets, not data:image payloads');
  if (file.endsWith('.html')) {
    if (/<style\b|\sstyle\s*=|\son\w+\s*=|<script(?![^>]*\bsrc\s*=)[^>]*>\s*\S/i.test(source)) errors.push(file + ': inline code');
    if (/<base\b/i.test(source)) errors.push(file + ': standalone template must use document-relative resources');
    for (const m of source.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) resource(m[1],file);
  }
  if (file.endsWith('.css')) for (const m of source.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) resource(m[1],file);
  if (/\.[cm]?js$/.test(file) && !file.startsWith(path.join(root,'scripts')+path.sep)) {
    try {
      for (const finding of auditSource(source)) errors.push(file + ':' + finding.line + ': JS style requires CSS separation or explicit review: ' + finding.kind);
      for (const finding of auditStaticMarkup(source)) errors.push(file + ':' + finding.line + ': static page markup belongs in HTML');
    } catch (error) { errors.push(file + ': JS parse failed: ' + error.message); }
  }
  if (file.endsWith('.md')) for (const m of source.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) {
    const target=m[1].split('#')[0]; if (!target) continue;
    const suffix=path.extname(target)?'':'.md';
    if (![path.resolve(root,target+suffix),path.resolve(path.dirname(file),target+suffix)].some(p=>p.startsWith(root+path.sep)&&fs.existsSync(p))) errors.push(file + ': missing knowledge target ' + target);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode=1; }
else console.log('PASS: project structure, separated source, local resources, ownership and knowledge links. Browser behavior still requires validation.');
