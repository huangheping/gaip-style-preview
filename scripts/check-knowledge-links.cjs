#!/usr/bin/env node
'use strict';
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
function walk(d) { return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):e.name.endsWith('.md')?[path.join(d,e.name)]:[]); }
const files = ['knowledge','docs'].flatMap(d=>walk(path.join(root,d))).concat(['AGENTS.md','PROJECT_STATE.md'].map(p=>path.join(root,p)));
const errors=[];
for(const file of files){
  // Released notes and archived reports preserve historical paths and code examples.
  // Only active knowledge is enforced; archive navigation lives in archive/README.md.
  if (/knowledge\/变更\/\d{4}-/.test(file) || (/docs\/archive\//.test(file) && path.relative(root,file) !== 'docs/archive/README.md')) continue;
  const s=fs.readFileSync(file,'utf8');
  for(const m of s.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)){
    const target=m[1].split('#')[0]; if(!target)continue;
    const suffix=path.extname(target)?'':'.md';
    const options=[path.resolve(root,target+suffix),path.resolve(path.dirname(file),target+suffix)];
    const matches=files.filter(p=>path.basename(p)===target+suffix);
    if(!options.some(p=>fs.existsSync(p))&&matches.length!==1)errors.push(path.relative(root,file)+': '+target);
  }
}
if(errors.length){console.error([...new Set(errors)].join('\n'));process.exitCode=1}else console.log('PASS: active knowledge Wikilink file targets resolve (heading content and Obsidian rendering are separate checks).');
