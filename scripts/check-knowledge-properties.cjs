#!/usr/bin/env node
'use strict';
const fs = require('node:fs'), path = require('node:path');
const YAML = require('yaml');

function validateProperties(text, name) {
  const errors = [];
  if (!/^\uFEFF?---\r?\n/.test(text)) return errors; // Properties are optional in Obsidian.
  const block = text.replace(/^\uFEFF?---\r?\n/, '').match(/^([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!block) return [name + ': frontmatter 缺少结束分隔符'];
  const document = YAML.parseDocument(block[1], { uniqueKeys: true, version: '1.2' });
  if (document.errors.length) return document.errors.map(error => name + ': ' + error.message);
  if (!YAML.isMap(document.contents)) return [name + ': properties 必须为键值映射'];
  let properties;
  try { properties = document.toJS({ maxAliasCount: 100 }); }
  catch (error) { return [name + ': ' + error.message]; }
  for (const [key, value] of Object.entries(properties)) {
    const fail = reason => errors.push(name + ': ' + key + ' ' + reason);
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) fail('不可使用 Obsidian 不支持的嵌套属性');
    if (Array.isArray(value) && value.some(item => item !== null && typeof item === 'object')) fail('列表只能包含标量；双链须加引号');
    if (['tags', 'aliases', 'cssclasses'].includes(key) && (!Array.isArray(value) || value.some(item => typeof item !== 'string'))) fail('必须为字符串列表');
    if (key === 'updated' || key === 'date') {
      if (name.startsWith('knowledge/模板/') && value === '{{date:YYYY-MM-DD}}') continue;
      const valid = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
      if (!valid) fail('必须为有效的 YYYY-MM-DD 日期');
    }
  }
  return errors;
}

function check(root) {
  const files = [];
  function walk(directory) {
    for (const item of fs.readdirSync(directory, {withFileTypes:true})) {
      const file = path.join(directory,item.name);
      if (item.isDirectory()) walk(file);
      else if (item.isFile() && item.name.endsWith('.md')) files.push(file);
    }
  }
  for (const directory of ['knowledge', 'docs']) walk(path.join(root,directory));
  for (const file of ['PROJECT_STATE.md', 'AGENTS.md']) files.push(path.join(root,file));
  const errors = files.flatMap(file => validateProperties(fs.readFileSync(file,'utf8'),path.relative(root,file)));
  return {files:files.length, withProperties:files.filter(file=>/^\uFEFF?---\r?\n/.test(fs.readFileSync(file,'utf8'))).length, errors};
}
if (require.main === module) {
  const result = check(path.resolve(__dirname,'..'));
  if(result.errors.length) { console.error(result.errors.join('\n')); process.exitCode=1; }
  else console.log('PASS: Obsidian YAML properties (' + result.withProperties + '/' + result.files + ' Markdown files have optional properties); rendering remains a separate check.');
}
module.exports = {validateProperties, check};
