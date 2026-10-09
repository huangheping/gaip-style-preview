const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {parse}=require('acorn');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const registry=JSON.parse(read('shared/assets/icons/registry.json'));
const visit=(n,fn)=>{if(!n||!n.type)return;fn(n);for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(x=>visit(x,fn));else if(v?.type)visit(v,fn)}};
const value=n=>{if(n.type==='Literal')return n.value;if(n.type==='ArrayExpression')return n.elements.map(value);if(n.type==='ObjectExpression'){const o={};for(const p of n.properties){const v=value(p.value);if(v===undefined)return;o[p.key.name||p.key.value]=v}return o}};
const c={console};c.window=c;c.self=c;vm.createContext(c);vm.runInContext(read('shared/assets/icons/local-icons.generated.js'),c);
// A merged export must not replace the caller's CSS viewport with its 32px
// intrinsic dimensions, or drop the hook that keeps wealth search on its standard 16px canvas.
const {renderMergedSVG}=require('./icon-merge-utils.cjs');
const scaled=new JSDOM(renderMergedSVG(read('shared/assets/icons/forms/shared/modal-search.svg'),{class:'consumer-size'}),{contentType:'image/svg+xml'});
assert.equal(scaled.window.document.documentElement.hasAttribute('width'),false);
assert.equal(scaled.window.document.documentElement.hasAttribute('height'),false);
assert.equal(scaled.window.document.documentElement.getAttribute('class'),'consumer-size');scaled.window.close();
const wealthSize=new JSDOM('<style>'+read('shared/assets/icons/forms/css/channels--wealth-center--wealth-center-1.css')+'</style>'+c.__GAIP_LOCAL_ICONS__.markup('wealth/search'));
const wealthSVG=wealthSize.window.document.querySelector('svg');
assert.equal(wealthSVG.getAttribute('class'),'gaip-wealth-icon');
assert.equal(wealthSize.window.getComputedStyle(wealthSVG).width,'16px');
assert.equal(wealthSize.window.getComputedStyle(wealthSVG).height,'16px');wealthSize.window.close();
for(const key of ['news/close','news/copy']){
 const dom=new JSDOM(c.__GAIP_LOCAL_ICONS__.markup(key,'btnIcon___VmYho'),{contentType:'image/svg+xml'}),svg=dom.window.document.documentElement;
 assert.equal(svg.getAttribute('class'),'btnIcon___VmYho');assert.equal(svg.getAttribute('aria-hidden'),'true');
 assert.equal(svg.hasAttribute('width'),false);assert.equal(svg.hasAttribute('height'),false);dom.window.close();
}
// Unselected definitions still equal the read-only baseline; explicitly merged
// aliases must use the user's selected drawing while preserving component names.
const originals=new Map();
for(const file of [...new Set(registry.ant.map(i=>i.original.replace('shared/runtime/','web/')))]){
 visit(parse(read(file),{ecmaVersion:'latest'}),n=>{if(n.type!=='ObjectExpression')return;const d=value(n);if(d?.icon?.tag==='svg'&&d.theme)originals.set(d.name+'/'+d.theme,d)});
}
for(const i of registry.ant){
 const local=JSON.parse(JSON.stringify(c.__GAIP_LOCAL_ICON_DEFINITIONS__[i.key]));
 if(!i.mergedInto)assert.deepEqual(local,originals.get(i.name+'/'+i.theme),'preserve unselected original drawing: '+i.file);
 else {
  assert.equal(local.name,i.name);assert.equal(local.theme,i.theme);
  const dom=new JSDOM(read(i.file),{contentType:'image/svg+xml'}),svg=dom.window.document.documentElement;
  const attrs=['viewBox','d','points','transform','x','y','cx','cy','r','rx','ry','fill','fill-opacity','stroke','stroke-width','stroke-linecap','stroke-linejoin','fill-rule','opacity'];
  const expected=[svg,...svg.querySelectorAll('*')].filter(n=>!['title','desc'].includes(n.localName)).map(n=>[n.localName,Object.fromEntries([...n.attributes].filter(a=>attrs.includes(a.name)).map(a=>[a.name,a.value]))]);
  if(!expected[0][1].viewBox)expected[0][1].viewBox='0 0 '+parseFloat(svg.getAttribute('width'))+' '+parseFloat(svg.getAttribute('height'));
  if(i.displayViewBox)expected[0][1].viewBox=i.displayViewBox;
  const flatten=n=>[[n.tag,Object.fromEntries(Object.entries(n.attrs||{}).filter(([k])=>attrs.includes(k)))],...(n.children||[]).flatMap(flatten)];
  assert.deepEqual(flatten(local.icon),expected,'merged Ant alias must match selected drawing: '+i.mergedInto);dom.window.close();
 }
}
// Exercise the actual React/Ant factories while isolating the Ant DOM renderer.
const source=read('shared/runtime/umi.0b0663b5.js'),factories=new Map();
visit(parse(source,{ecmaVersion:'latest'}),n=>{if(n.type==='Property'&&typeof n.key.value==='number'&&/Function/.test(n.value.type))factories.set(n.key.value,source.slice(n.value.start,n.value.end))});
const cache=new Map([[84089,{exports:{Z:'AntIconBase'}}]]);
function requireModule(id){if(cache.has(id))return cache.get(id).exports;const module={exports:{}};cache.set(id,module);if(!factories.has(id))throw Error('Missing module '+id);vm.runInContext('('+factories.get(id)+')',c)(module,module.exports,requireModule);return module.exports;}
requireModule.d=(exports,defs)=>Object.keys(defs).forEach(k=>Object.defineProperty(exports,k,{enumerable:true,get:defs[k]}));
requireModule.r=exports=>Object.defineProperty(exports,'__esModule',{value:true});
requireModule.o=(obj,k)=>Object.hasOwn(obj,k);
requireModule.n=exports=>{const get=()=>exports.__esModule?exports.default:exports;requireModule.d(get,{a:get});return get};
const react=requireModule(67294),ordinaryProps={title:'unchanged'};
assert.equal(react.createElement('span',ordinaryProps,'text').props.title,'unchanged');
for(const id of [68795,48689,57132]){
 const component=requireModule(id).Z,definition=registry.ant.find(i=>i.module===String(id));
 const props={className:'existing',width:16},element=component.render(props,null);
 assert.equal(element.props.icon,c.__GAIP_LOCAL_ICON_DEFINITIONS__[definition.key],'actual Ant component consumes the local SVG definition');
 assert.equal(element.props.className,'existing');assert.equal(element.props.width,16);assert.equal(props.icon,undefined,'caller props are not mutated');
}
const unknown={name:'custom',theme:'outlined',icon:{tag:'svg',attrs:{},children:[]}};
assert.equal(react.createElement('AntIconBase',{icon:unknown}).props.icon,unknown);
const installed=react.createElement;c.__GAIP_LOCAL_ICONS__.adaptReactModule({exports:react});assert.equal(react.createElement,installed,'React adapter is idempotent');
// Webpack replaces queue.push on startup; the adapter must survive that assignment.
let seen;c.webpackChunk.push=packet=>{seen=packet};const other=()=>{};
c.webpackChunk.push([['late'],{67294:(module)=>{module.exports=react},123:other}]);
assert.notEqual(seen[1][67294].toString(),((module)=>{module.exports=react}).toString());assert.equal(seen[1][123],other);
const duplicate=seen[1][67294];c.webpackChunk.push(seen);assert.equal(seen[1][67294],duplicate,'late module wrapping is idempotent');
// Real URL construction must work from a nested entry and a project subpath.
for(const base of ['file:///preview/','https://preview.invalid/gaip/']){
 const dom=new JSDOM('<base href="'+base+'"><script src="'+base+'channels/config-center/config-center.js?v=test"></script>',{url:base+'channels/customer/index.html',runScripts:'outside-only'});
 const w=dom.window;let helper;
 const configSource=read('channels/config-center/config-center.js');visit(parse(configSource,{ecmaVersion:'latest'}),n=>{if(n.type==='FunctionDeclaration'&&n.id.name==='bulkImportAssetUrl')helper=configSource.slice(n.start,n.end)});
 w.eval(helper);
 for(const [name,file]of [['bulk-import-upload.svg','shared/assets/icons/operations/config-center/bulk-import-upload.svg'],['bulk-import-template-xlsx.svg','shared/assets/icons/business/config-center/bulk-import-template-xlsx.svg']])assert.equal(w.bulkImportAssetUrl(name),base+file);
 assert.equal(w.bulkImportAssetUrl('批量人员导入模板.xlsx'),new URL('channels/config-center/assets/documents/批量人员导入模板.xlsx',base).href,'document download remains in the channel');
 const script=w.document.createElement('script');script.src=base+'components/organization-tree/organization-tree.js';w.document.head.appendChild(script);
 w.eval(read('components/organization-tree/organization-tree.js'));
 for(const expanded of [false,true]){const node=w.__GAIP_ORG_TREE__.node({id:'n',name:'部门',depth:0,children:true,expanded});assert.equal(node.querySelector('.folderIcon___yjhFX').src,base+(expanded?'shared/assets/icons/third-party/ant-design/folder-open-outlined.svg?v=20261001-merge-1':'shared/assets/icons/forms/organization-tree/folder.png'));}
 dom.window.close();
}
for(const entry of [...require('./entry-files.cjs')(root,{includeLocal:true}),'components/index.html','components/弹窗预览.html']){
 const scripts=[...read(entry).matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m=>m[1]);
 const cache=scripts.findIndex(s=>s.includes('shared/assets/icons/local-icons.generated.js'));
 const umi=scripts.findIndex(s=>s.includes('shared/runtime/umi.'));
 if(umi<0&&!['components/index.html','components/弹窗预览.html'].includes(entry))continue;
 assert(cache>=0,entry+': local icon cache is loaded');
 assert(umi<0||cache<umi,entry+': icon cache precedes Umi');
}
console.log('PASS: '+registry.ant.length+' local SVG definitions match originals or explicitly selected merged drawings; actual React/Ant factories, preserved props, late Webpack registration, nested URLs and all entry cache dependencies.');
