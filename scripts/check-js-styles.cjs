'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {auditSource}=require('./js-style-audit.cjs');
const root=path.resolve(process.argv.find(v=>v.startsWith('--root='))?.slice(7)||path.join(__dirname,'..'));
const policyFile=path.join(root,'shared/config/runtime-style-exceptions.json');
const policy=fs.existsSync(policyFile)?JSON.parse(fs.readFileSync(policyFile,'utf8')):{dynamic:{},compiled:{}};
const errors=[],report={files:0,reviewed:[],compiled:[]};
function walk(p){return !fs.existsSync(p)?[]:fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);}
const visited=new Set();
for(const file of ['channels','components','shared','app'].flatMap(d=>walk(path.join(root,d))).filter(f=>/\.[cm]?js$/.test(f))){
 const name=path.relative(root,file).split(path.sep).join('/'),source=fs.readFileSync(file,'utf8');visited.add(name);
 const compiled=policy.compiled?.[name];
 if(compiled){
  if(!compiled.reason || compiled.sha256!==crypto.createHash('sha256').update(source).digest('hex'))errors.push(name+': 原站/第三方基线改变，需重新审查样式边界');
  report.compiled.push({file:name,reason:compiled.reason});continue;
 }
 report.files++;
 let found;try{found=auditSource(source);}catch(e){errors.push(name+': JS 解析失败 '+e.message);continue;}
 const allowed=[...(policy.dynamic?.[name]||[])];
 for(const item of found){
  const index=allowed.findIndex(a=>a.expression===item.expression&&a.reason&&item.kind==='style-write');
  if(index<0)errors.push(`${name}:${item.line}: 未登记的 JS 样式（${item.kind}）：${item.expression.slice(0,140)}`);
  else {const entry=allowed.splice(index,1)[0];report.reviewed.push({file:name,...item,reason:entry.reason});}
 }
 for(const item of allowed)errors.push(name+': 过期动态样式登记 '+item.expression);
}
for(const name of [...Object.keys(policy.dynamic||{}),...Object.keys(policy.compiled||{})])if(!visited.has(name))errors.push(name+': 登记文件不存在');
if(process.argv.includes('--json'))console.log(JSON.stringify({...report,errors},null,2));
else if(errors.length)console.error(errors.join('\n'));
else console.log(`PASS: ${report.files} 自有 JS；${report.reviewed.length} 处逐项登记的动态写入；${report.compiled.length} 个哈希锁定的编译/第三方文件。`);
if(errors.length)process.exitCode=1;
