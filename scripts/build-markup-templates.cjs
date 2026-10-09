'use strict';
// HTML is the editing source. A bounded cache in its existing owner script
// keeps file:// loading synchronous without additional runtime requests.
const fs = require('node:fs');
const path = require('node:path');
const begin = '/* @gaip-markup-cache:start */';
const end = '/* @gaip-markup-cache:end */';
function readTemplates(source) {
  const values = Object.create(null);
  for (const match of source.matchAll(/<template data-gaip-markup="([\w-]+)">([\s\S]*?)<\/template>/g)) {
    if (Object.hasOwn(values, match[1])) throw new Error('Duplicate markup template: ' + match[1]);
    // Preserve bytes: parsing/serializing HTML would alter table fragments,
    // escaped entities, whitespace and attribute interpolation boundaries.
    values[match[1]] = match[2];
  }
  if (!Object.keys(values).length) throw new Error('Empty markup template source');
  return values;
}
function cache(renderer, values) {
  if (!/^__gaipMarkup_[a-f0-9]+$/.test(renderer)) throw new Error('Invalid renderer identifier');
  return begin + '\n// Generated from the owned templates/markup-*.html; run npm run build:templates.\n' +
    'var ' + renderer + ' = (function () {\n  var templates = ' + JSON.stringify(values) + ';\n' +
    '  return function (id, values) {\n' +
    '    if (!Object.prototype.hasOwnProperty.call(templates, id)) throw new Error("Missing HTML template: " + id);\n' +
    '    return templates[id].replace(/\\{\\{gaip:(\\d+)\\}\\}/g, function (_, index) {\n' +
    '      if (!values || !Object.prototype.hasOwnProperty.call(values, index)) throw new Error("Missing HTML binding: " + id + ":" + index);\n' +
    '      return values[index];\n' +
    '    });\n  };\n}());\n' + end;
}
function build(root, check) {
  const manifestFile = path.join(root, 'shared/config/markup-templates.json');
  if (!fs.existsSync(manifestFile)) return 0;
  let count = 0;
  for (const item of JSON.parse(fs.readFileSync(manifestFile, 'utf8'))) {
    const values = Object.create(null);
    for (const template of [item.template, ...(item.additionalTemplates || [])]) {
      for (const [id, html] of Object.entries(readTemplates(fs.readFileSync(path.join(root, template), 'utf8')))) {
        if (Object.hasOwn(values, id)) throw new Error('Duplicate markup template: ' + id);
        values[id] = html;
      }
    }
    const file = path.join(root, item.script), source = fs.readFileSync(file, 'utf8');
    const from = source.indexOf(begin), to = source.indexOf(end);
    if (from !== 0 || to < from || source.indexOf(begin, 1) >= 0 || source.indexOf(end, to + end.length) >= 0) throw new Error('Invalid markup cache boundary: ' + item.script);
    const expected = cache(item.renderer, values) + source.slice(to + end.length);
    if (check && expected !== source) throw new Error('Markup cache is stale: ' + item.script);
    if (!check && expected !== source) fs.writeFileSync(file, expected);
    count += Object.keys(values).length;
  }
  return count;
}
module.exports = {readTemplates, cache, build};
