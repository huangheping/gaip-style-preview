'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {auditSource}=require('./js-style-audit.cjs');
// Real leakage forms: direct, computed, aliased, batched, embedded and framework styles.
for(const source of [
 "el.style.color='red'", "el['style']['marginTop']='6px'", "el.style[key]=values[key]",
 "el.style.setProperty('color', color)", "el.style.cssText='color:red'", "el.style='color:red'",
 "Object.assign(el.style,{padding:'8px'})", "const styles=el.style;styles.width='2px'",
 "const {style}=el;style.color='red'", "el.setAttribute('style','color:red')",
 "(0, runtime.jsx)('style', {dangerouslySetInnerHTML:{__html:css}})",
 "runtime['jsxs']('style', {children:css})", "jsx('style', {children:css})",
 "el.setAttributeNS(null,'style','color:red')",
 "const x={styles:{body:{padding:24}}}",
 "const body={body:{maxHeight:'80vh'}};const x={styles:body}",
 "const x={['sty'+'les']:{header:{borderBottom:'none'}}}",
 "const x={styles:getStyles()}", "const x={bodyStyle:{padding:0}}",
 "const x={overlayStyle:{display:'none'}}",
 "const html = '<div st' + 'yle=\"color:red\">text</div>'",
 "const html = '<sty' + 'le>p{color:red}</style>'",
 "document.createElement('style')", "new CSSStyleSheet()", "sheet.insertRule('p{color:red}')",
 "const x={style:{color:'red'}}", "const x='<div style=\"color:red\">'", "const x=`<i style='width:${p}%'>`"
]) assert.ok(auditSource(source).length,source);
for(const source of ["el.classList.add('active')", "el.hidden=true", "el.dataset.theme='gold'", "const value=el.style.width", "el.style.removeProperty('height')", "const exportXML='<styleSheet />'", "const x={styles:['page.css']}", "const configStyles=[umi,font,'config.css'];const x={styles:configStyles}", "const x={classNames:{body:'dialog-body'}}"])
 assert.deepEqual(auditSource(source),[],source);
const root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/style-audit-tests');fs.mkdirSync(out,{recursive:true});
const fixture=fs.mkdtempSync(path.join(out,'case-'));fs.mkdirSync(path.join(fixture,'channels/home'),{recursive:true});fs.mkdirSync(path.join(fixture,'shared/config'),{recursive:true});
const file=path.join(fixture,'channels/home/script.js'),policy=path.join(fixture,'shared/config/runtime-style-exceptions.json');
const expression="el.style.left = rect.left + 'px'";
fs.writeFileSync(file,expression);fs.writeFileSync(policy,JSON.stringify({dynamic:{'channels/home/script.js':[{expression,reason:'Measured anchor coordinate'}]}}));
const run=()=>spawnSync(process.execPath,[path.join(__dirname,'check-js-styles.cjs'),'--root='+fixture],{encoding:'utf8'});
assert.equal(run().status,0);
fs.appendFileSync(file,"; el.style.color='red'");assert.notEqual(run().status,0,'dynamic exception cannot exempt a whole file');
fs.writeFileSync(file,"el.classList.add('ready')");assert.notEqual(run().status,0,'removed exception must be retired');
fs.writeFileSync(policy,'{}');assert.equal(run().status,0);
fs.mkdirSync(path.join(fixture,'channels/home/legacy'));fs.writeFileSync(path.join(fixture,'channels/home/legacy/new.js'),"el.style.color='red'");assert.notEqual(run().status,0,'new legacy path cannot bypass checks');
console.log('PASS: JS style forms, exact dynamic exceptions, stale entries and fake legacy bypasses.');

const modalCSS=fs.readFileSync(path.join(root,'components/modal/global-modal.css'),'utf8');
const mask=modalCSS.match(/--gaip-modal-close-image: url\("data:image\/svg\+xml,([^"]+)"\)/);
assert.ok(mask,'file previews require an embedded CSS mask, not an external file mask');
assert.equal(decodeURIComponent(mask[1]),fs.readFileSync(path.join(root,'shared/assets/icons/third-party/ant-design/close-outlined.svg'),'utf8').trim(),'CSS mask and local icon must stay identical');
