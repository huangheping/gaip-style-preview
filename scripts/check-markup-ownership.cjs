'use strict';
const fs=require('node:fs'),path=require('node:path'),{parse}=require('acorn');
const root=path.resolve(__dirname,'..');
const policy=JSON.parse(fs.readFileSync(path.join(root,'shared/config/runtime-style-exceptions.json')));
// Generated outputs are checked byte-for-byte against their HTML/SVG authoring
// sources by build:templates/check:icons. Spreadsheet XML is a document export.
const generated=new Set(['channels/config-center/source-markup.js','channels/learning-center/templates.generated.js','channels/news-center/templates.generated.js','shared/assets/icons/local-icons.generated.js']);
const markupOwners=new Set(JSON.parse(fs.readFileSync(path.join(root,'shared/config/markup-templates.json'))).map(item=>item.script));
const errors=[];
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const file of ['channels','components','shared','app'].flatMap(d=>walk(path.join(root,d))).filter(f=>f.endsWith('.js'))){
 const relative=path.relative(root,file).split(path.sep).join('/');
 if(policy.compiled[relative]||generated.has(relative)||relative==='components/operation-log/operation-log-xlsx.js'||relative.startsWith('channels/login-video-test/'))continue;
 let source=fs.readFileSync(file,'utf8');
 if(markupOwners.has(relative))source=source.replace(/^\/\* @gaip-markup-cache:start \*\/[\s\S]*?\/\* @gaip-markup-cache:end \*\//,'');
 if(/^channels\/[^/]+\/page\.js$/.test(relative))source=source.replace(/^\/\* @gaip-page-cache:start \*\/[\s\S]*?\/\* @gaip-page-cache:end \*\//,'');
 const ast=parse(source,{ecmaVersion:'latest',locations:true});
 function visit(node){
  if(!node||!node.type)return;
  const value=node.type==='Literal'?node.value:node.type==='TemplateElement'?node.value.cooked:null;
  if(typeof value==='string'&&/<\/?[a-zA-Z][a-zA-Z0-9:-]*(?:\s|>|\/)/.test(value))errors.push(relative+':'+node.loc.start.line+': static HTML belongs in owned templates: '+value.slice(0,90));
  for(const child of Object.values(node))if(Array.isArray(child))child.forEach(visit);else if(child&&child.type)visit(child);
 }
 visit(ast);
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('PASS: owned runtime markup is maintained in HTML; generated caches and document-export XML are accounted for.');
