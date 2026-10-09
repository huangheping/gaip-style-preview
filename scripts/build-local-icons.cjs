#!/usr/bin/env node
'use strict';
// Canonical files are local SVG/CSS. Bounded copies keep file:// synchronous
// and preserve React nodes, CSS cascade and template interpolation contracts.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {JSDOM}=require('jsdom');
const {renderMergedSVG}=require('./icon-merge-utils.cjs');
const root=path.resolve(__dirname,'..'),check=process.argv.includes('--check');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'shared/assets/icons/registry.json'),'utf8'));
const assetFiles=new Set();
for(const asset of manifest.assets){
 if(!asset.file.startsWith('shared/assets/icons/'))throw Error('Icon source outside shared directory: '+asset.file);
 if(assetFiles.has(asset.file))throw Error('Duplicate icon source path; use one asset record with all consumers: '+asset.file);
 assetFiles.add(asset.file);
}
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
function publish(f,s){const old=fs.existsSync(path.join(root,f))?read(f):null;if(old===s)return;if(check)throw Error('Local icon generated copy is stale: '+f);fs.writeFileSync(path.join(root,f),s);}
// The selected More chevron remains authored in CSS. SVG consumers receive a
// generated local file of that same border silhouette, fitted to their canvas.
for(const adapter of manifest.cssChevronSVGs||[]){
 if(!assetFiles.has(adapter.source)||!assetFiles.has(adapter.target))throw Error('Unregistered chevron source/target');
 const block=read(adapter.source).split('{')[1]?.split('}')[0];
 const declarations=Object.fromEntries((block||'').split(';').filter(s=>s.includes(':')).map(s=>s.split(':').map(v=>v.trim())));
 const side=Number(declarations.width?.match(/^([\d.]+)px$/)?.[1]);
 const border=declarations['border-right']?.match(/^([\d.]+)px solid currentColor$/);
 const thickness=Number(border?.[1]);
 if(!(side>thickness&&thickness>0)||declarations.height!==declarations.width||declarations['border-bottom']!==declarations['border-right']||declarations.transform!=='translateY(-2px) rotate(45deg)'||adapter.boxSizing!=='border-box')throw Error('Unsupported selected CSS chevron; review its SVG adapter');
 // Two square borders, including their sharp join and butt ends. The business
 // reset uses border-box for pseudo-elements; positioning stays with the host.
 const inner=side-thickness,half=side/2;
 const points=[[inner,0],[side,0],[side,side],[0,side],[0,inner],[inner,inner]].map(([x,y])=>[(x-y)/Math.SQRT2,(x+y-2*half)/Math.SQRT2]);
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 const scale=adapter.glyphWidth/(Math.max(...xs)-Math.min(...xs));
 const cx=(Math.max(...xs)+Math.min(...xs))/2,cy=(Math.max(...ys)+Math.min(...ys))/2;
 const number=n=>String(Number(n.toFixed(6)));
 const fitted=points.map(([x,y])=>number((x-cx)*scale+adapter.canvas/2)+','+number((y-cy)*scale+adapter.canvas/2)).join(' ');
 const svg='<!-- Generated CSS chevron; source in registry.json; npm run build:icons. -->\n<svg xmlns="http://www.w3.org/2000/svg" width="'+adapter.canvas+'px" height="'+adapter.canvas+'px" viewBox="0 0 '+adapter.canvas+' '+adapter.canvas+'"><title>更多操作展开 / 下拉</title><polygon fill="'+adapter.fill+'" points="'+fitted+'"/></svg>\n';
 publish(adapter.target,svg);
}
const byFile=new Map();
for(const binding of manifest.bindings){if(!byFile.has(binding.file))byFile.set(binding.file,[]);byFile.get(binding.file).push(binding);}
for(const [file,bindings]of byFile){let text=read(file);for(const b of bindings){
  let drawing=b.merged?renderMergedSVG(read(b.asset),b.contextAttrs):read(b.asset).replace(/\n$/,'');if(b.addedXmlns)drawing=drawing.replace(' xmlns="http://www.w3.org/2000/svg"','');
  if(b.rebaseURLs)drawing=drawing.replace(/url\((['"]?)([^)'"\s]+)\1\)/g,(all,q,url)=>{
    if(/^(data:|https?:)/.test(url))return all;
    const parts=url.split('?'),target=path.posix.normalize(path.posix.dirname(b.asset)+'/'+parts[0]);
    return 'url('+q+path.posix.relative(path.posix.dirname(b.file),target)+(parts[1]?'?'+parts[1]:'')+q+')';
  });
  const start=b.type==='css'?'/* @gaip-icon:start '+b.asset+' */':'<!-- @gaip-icon:start '+b.asset+(b.markerId?' '+b.markerId:'')+' -->';
  const end=b.type==='css'?'/* @gaip-icon:end */':'<!-- @gaip-icon:end -->';
  const i=text.indexOf(start),j=text.indexOf(end,i+start.length);
  if(i<0||j<0||text.indexOf(start,i+1)>=0)throw Error('Missing/duplicate icon source binding: '+b.asset);
  text=text.slice(0,i+start.length)+drawing+text.slice(j);
 }publish(file,text);}
for(const b of manifest.dataURIs||[]){
 const text=read(b.file),match=text.match(new RegExp('('+b.property+': url\\("data:image/svg\\+xml,)([^"\\n]+)("\\))'));
 if(!match)throw Error('Missing SVG data-URI binding: '+b.property);
 const drawing=encodeURIComponent(read(b.asset).trim()).replace(/'/g,'%27');
 // Encoding spelling is immaterial; retain the current bytes when decoded SVG agrees.
 if(decodeURIComponent(match[2])!==read(b.asset).trim())publish(b.file,text.replace(match[0],match[1]+drawing+match[3]));
}
function tree(node){const attrs={};for(const a of node.attributes)if(a.name!=='xmlns')attrs[a.name]=a.value;const result={tag:node.localName,attrs};if(node.children.length)result.children=[...node.children].map(tree);return result;}
const definitions={},byName={},markup={},classBindings={};
for(const entry of manifest.markup||[]){
 let svg=entry.merged?renderMergedSVG(read(entry.file),entry.contextAttrs||(entry.classBinding?{class:''}:{})):read(entry.file).trim();if(entry.stripXmlns)svg=svg.replace(' xmlns="http://www.w3.org/2000/svg"','');
 markup[entry.key]=svg;if(entry.classBinding)classBindings[entry.key]=true;
}
for(const icon of manifest.ant){
 const dom=new JSDOM(icon.mergedInto?renderMergedSVG(read(icon.file),icon.displayViewBox?{viewBox:icon.displayViewBox}:{},true):read(icon.file),{contentType:'image/svg+xml'});const drawing=tree(dom.window.document.documentElement);dom.window.close();
 // The default fill only makes the standalone SVG viewable. Keep any authored
 // presentation attributes when the user later edits a canonical icon.
 if(!icon.mergedInto&&!icon.rootAttrs.includes('fill')&&drawing.attrs.fill==='currentColor')delete drawing.attrs.fill;
 definitions[icon.key]={icon:drawing,name:icon.name,theme:icon.theme};
 byName[icon.name+'/'+icon.theme]=icon.key;
}
const cacheSource='/* Generated from shared/assets/icons/ SVG files; npm run build:icons. */\n'+
 '(function () {\n  window.__GAIP_LOCAL_ICON_DEFINITIONS__ = '+JSON.stringify(definitions)+';\n'+
 '  var byName = '+JSON.stringify(byName)+';\n'+
 '  var markup = '+JSON.stringify(markup)+'; var classBindings = '+JSON.stringify(classBindings)+';\n'+
 '  function renderMarkup(key, className) {\n'+
 '    if (!Object.prototype.hasOwnProperty.call(markup,key)) throw new Error("Missing local icon: " + key);\n'+
 '    var svg=markup[key]; if (!classBindings[key]) return svg;\n'+
 '    var value=String(className || "").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");\n'+
 '    return svg.replace(/class="[^"]*"/, function(){return "class=\\\"" + value + "\\\"";});\n'+
 '  }\n'+
 '  function adaptReactModule(module) {\n'+
 '    var react = module && module.exports; if (!react || !react.createElement || react.createElement.__gaipLocalIcons) return;\n'+
 '    var original = react.createElement;\n'+
 '    function createElement(type, props) {\n'+
 '      var icon = props && props.icon; var key = icon && icon.icon && byName[icon.name + "/" + icon.theme]; var local = key && window.__GAIP_LOCAL_ICON_DEFINITIONS__[key];\n'+
 '      if (!local) return original.apply(this, arguments);\n'+
 '      var args = Array.prototype.slice.call(arguments); args[1] = Object.assign({}, props, {icon:local}); return original.apply(this, args);\n'+
 '    }\n'+
 '    createElement.__gaipLocalIcons = true; react.createElement = createElement;\n'+
 '  }\n'+
 '  window.__GAIP_LOCAL_ICONS__ = {adaptReactModule:adaptReactModule,markup:renderMarkup};\n'+
 '  var chunks = self.webpackChunk = self.webpackChunk || [];\n'+
 '  function adapt(packet) { if (!packet || !packet[1] || !packet[1][67294] || packet[1][67294].__gaipLocalIcons) return; var original = packet[1][67294]; function factory(module) { original.apply(this, arguments); adaptReactModule(module); } factory.__gaipLocalIcons = true; packet[1][67294] = factory; }\n'+
 '  chunks.forEach(adapt);\n'+
 '  var push = chunks.push;\n'+
 '  function wrap(next) { return function () { for (var i=0;i<arguments.length;i++) adapt(arguments[i]); return next.apply(this, arguments); }; }\n'+
 '  var active = wrap(push);\n'+
 '  Object.defineProperty(chunks, "push", {configurable:true, get:function(){return active;}, set:function(next){active=wrap(next);}});\n'+
 '}());\n';
publish('shared/assets/icons/local-icons.generated.js',cacheSource);
const cacheVersion='20260930-'+crypto.createHash('sha256').update(cacheSource).digest('hex').slice(0,12);
function htmlFiles(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?htmlFiles(dir+'/'+e.name):e.name.endsWith('.html')?[dir+'/'+e.name]:[]);}
for(const file of ['channels','components'].flatMap(htmlFiles)){
 if(file.includes('/templates/'))continue;
 const text=read(file),next=text.replace(/local-icons\.generated\.js(?:\?v=[^"']+)?/g,'local-icons.generated.js?v='+cacheVersion);
 if(next!==text)publish(file,next);
}
console.log((check?'Verified':'Built')+' local icons: '+manifest.assets.length+' registered sources, '+manifest.ant.length+' Ant modules');
