#!/usr/bin/env node
'use strict';
// Source discovery only. This never rewrites business icons or loads a browser.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { parse } = require('acorn');
const { JSDOM } = require('jsdom');
const {renderMergedSVG}=require('./icon-merge-utils.cjs');
const root = path.resolve(__dirname, '..'), check = process.argv.includes('--check');
const iconRegistry=JSON.parse(fs.readFileSync(path.join(root,'shared/assets/icons/registry.json'),'utf8'));
const localKinds=new Map(iconRegistry.assets.map(a=>[a.file,a.kind]));
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const xml = text => String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const names = {
  workspace:'工作台', 'customer-360':'客户', 'quality-control':'品质管理', 'proposal-center':'方案', organization:'组织架构',
  'news-center':'资讯', wealth:'财富值', learning:'学习', 'channel-clues':'线索', 'sales-enablement':'产品',
  'activity-center':'活动', 'induction-guide':'入职引导', 'data-cockpit':'数据看板',
  search:'搜索', 'modal-search':'搜索', 'control-search':'搜索', '搜索客户':'搜索',
  close:'关闭', 'gaip-icon-close':'关闭', '关闭弹窗':'关闭', 'modal-clear':'清除',
  calendar:'日历', 'modal-calendar':'日历', 'control-calendar':'日历', 'announcement-calendar':'日历',
  clock:'时间', 'modal-clock':'时间', 'announcement-clock':'时间',
  'modal-down':'下拉', 'control-down':'下拉', down:'下拉', 'caret-down':'下拉', 'chevron-down':'下拉',
  delete:'删除', 'trash-2':'删除', 'embedded-2b14832daf2c':'删除',
  'icon-pdf-file':'PDF 文件', 'icon-upload-file':'附件', '上传附件':'附件', 'embedded-29c0e020f818':'附件',
  'totalIcon':'数量', 'folder-open':'组织文件夹', share:'分享', source:'查看原文', tag:'分类标签', 'tag-news':'分类标签',
  'featured-ai':'精选', 'news-featured':'精选', 'ai-score':'AI 评分', manage:'管理', 'page-title':'资讯标题',
  'bulk-import-template-xlsx':'表格文件', 'bulk-import-upload':'上传', 'download2':'下载', 'gaip-icon-download':'下载',
  'plan-tag-close':'关闭', 'gaip-icon-complete':'完成', '步骤完成':'完成', '完成状态':'完成',
  'icon-course-enter':'进入', 'icon-detail-back':'返回', 'icon-lesson-play':'播放', 'icon-lesson-review':'播放',
  'icon-video-player-play':'播放', 'icon-video-player-caret':'播放', 'icon-lesson-progress':'学习进度', 'icon-menu-learning':'学习',
  'live-management':'直播管理', 'live-video-label':'直播',
  'Agent头像':'AI 助手头像', 'Agent结果头像':'AI 结果', '浮标图标':'AI 助手入口', '做方案':'方案',
  '新建对话':'新建对话', '收起':'收起面板', '最小化':'最小化', '关闭历史记录':'收起历史',
  '复制文本':'复制', '复制成功':'复制成功', '跳出Icon':'打开建议', '推理中':'推理中',
  '提示2':'提示', 'tishi-icon':'提示', 'up-load-icon1':'头像上传', 'up-load-icon2':'二维码上传',
  'embedded-0a8d471e8cf6':'搜索', 'embedded-034d3716c7fb':'下拉', 'embedded-c6ea3642d450':'提示',
  'embedded-7c88c642c24a':'客户', 'embedded-de99ec5f5f47':'客户关系', 'embedded-47b88a14dbd9':'沟通纪要',
  'embedded-ffb175f21fe0':'资产分布', 'embedded-5a35ec1e5228':'工作', 'embedded-ad3ba439d765':'电话',
  'embedded-ebee3ef87b41':'收入', 'embedded-9d244a1e8662':'客户头像', 'embedded-b9031cca43b0':'智能分析',
  'embedded-1515752a0d92':'下载', 'embedded-8cc0169c8da6':'下载', 'embedded-45049ec6a588':'关闭',
  'embedded-100cdb61c868':'搜索', 'embedded-49e2cf3c8308':'联系专家', 'embedded-61fda50c3fa7':'保险',
  'embedded-790ca3c1ce16':'全球', 'embedded-820fbc970547':'信托', 'embedded-f36d4669e6cb':'投资',
  'embedded-6831f4ff99cc':'比较', 'embedded-8f7e5232b7df':'空状态',
  'embedded-64e45355d160':'查询客户', 'embedded-de470cbb4484':'方案', 'embedded-fe98a045d304':'跟进时间',
  'badge-check':'认证', 'key-round':'财富传承', 'chart-pie':'资产配置', umbrella:'保险规划', landmark:'税务规划',
  'shield-check':'身份规划', 'book-open':'子女教育', 'warning-filled':'预警', 'close-circle-filled':'失败',
  'status-dot-filled':'线索状态', 'clock-circle-filled':'待处理', circle:'未学习', 'play-circle-filled':'学习中', 'check-circle-filled':'完成',
  plus:'新增', minus:'减少', check:'完成', 'check-circle':'完成', 'close-circle':'关闭', 'left':'返回', right:'进入',
  'arrow-left':'返回', 'arrow-right':'进入', 'arrow-down':'下载', download:'下载', upload:'上传',
  eye:'查看', 'eye-invisible':'隐藏', edit:'编辑', 'copy':'复制', 'setting':'设置', 'settings':'设置',
  'more':'更多', 'ellipsis':'更多', info:'提示', 'info-circle':'提示', 'exclamation-circle':'警告',
  'warning':'警告', 'question-circle':'帮助', 'user':'用户', 'team':'客户', 'file':'文件', 'file-pdf':'PDF 文件',
  'play-circle':'播放', 'caret-right':'播放', 'loading':'加载', 'loading-3-quarters':'加载',
  'logout':'退出', 'menu-fold':'收起导航', 'menu-unfold':'展开导航', 'fullscreen':'全屏', 'fullscreen-exit':'退出全屏'
};
Object.assign(names,{'gaip-admin-info-icon':'管理员说明','gaip-agent-fullscreen-icon':'全屏','gaip-bulk-warning':'批量导入警告','gaip-main-menu-caret-icon':'导航展开','gaip-member-menu-icon':'成员更多操作','lc-upload-complete-icon':'上传完成','renderAgentInputTags-12':'移除已选项','renderPage-12':'空状态','PDF':'PDF 文件',word:'Word 文件',xlsx:'Excel 文件',图片:'图片附件'});
const channels = {workspace:'工作台',customer:'客户中心',policy:'保单中心',product:'产品中心',activity:'活动中心',
  induction:'入职引导',clues:'线索中心','learning-center':'学习中心','news-center':'资讯中心',
  'proposal-center':'方案中心','config-center':'配置中心','wealth-center':'财富值中心',login:'登录'};
const walk = dir => fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(dir+'/'+e.name) : [dir+'/'+e.name]);
const excluded = f => /(?:^|\/)(?:icons|node_modules)(?:\/|$)/.test(f) && f.startsWith('components/icons/') ||
  /login-video-test|components-preview|components-registry|table-preview|table-tag-sources|components\/templates\/markup-components|components\/index\.html|components\/弹窗/.test(f);
const sourceFiles = ['channels','components','shared'].flatMap(walk).filter(f => /\.(html|css|js)$/.test(f) && !excluded(f) && !f.startsWith('shared/assets/icons/') &&
  !/\.generated\.js$|source-markup\.js$|\/lottie\.min\.js$|shared\/runtime\//.test(f));
const sources = sourceFiles.map(file => ({file,text:fs.readFileSync(path.join(root,file),'utf8').replace(/^\/\* @gaip-(?:markup|page)-cache:start \*\/[\s\S]*?\/\* @gaip-(?:markup|page)-cache:end \*\//,'')}));
const items = new Map(), templates = {}, pending = [], unreferenced = [], cssGlyphs = [];
const channelOf = file => channels[file.split('/')[1]] || (file.startsWith('components/ai-agent/') ? 'AI 助手' : file.startsWith('components/海报分享/') ? '海报分享' : '共享组件');
function source(file,line,kind,ref) { return {file,line,kind,ref:ref || '',location:channelOf(file)}; }
function semantic(key) {
  key = key.replace(/\.svg$|\.png$/,'').replace(/\.[0-9a-f]{6,}$/,'').replace(/^nav-icon-/,'');
  if (key.startsWith('flag-')) return key.slice(5).toUpperCase()+' 货币标识';
  if (/^news-(morning|noon|afternoon|night)/.test(key)) return ({morning:'早报',noon:'午报',afternoon:'下午茶',night:'晚报'})[key.split('-')[1]];
  return names[key] || key.replace(/^icon-/,'').replace(/-/g,' ');
}
function category(file,key) {
  if (/main-nav|navigation|nav-icon/.test(file+key)) return '导航';
  if (/flag-|hkd-currency|\/aia\.svg|\/axa\.svg|\/allianz\.svg|\/fwd\.svg|\/msh\.svg|\/sunlife\.svg/.test(file+key)) return '品牌与标识';
  if (/table-tag|步骤完成|完成状态|推理中|ai-score|featured|提示|tishi|Warn|alert/.test(file+key)) return '状态';
  if (/modal-|control-|announcement-(calendar|clock)|filter-bar|multi-select|date-picker|organization-tree/.test(file+key)) return '表单与选择';
  if (/附件类型|pdf-file|upload-file/.test(file+key)) return '文件与附件';
  if (/search|close|clear|down|download|share|delete|pen|play|back|enter|复制|关闭|最小化|收起/.test(key)) return '操作';
  return '业务';
}
function signature(svg) {
  const doc = new JSDOM(svg,{contentType:'image/svg+xml'}); const el=doc.window.document.documentElement;
  const result = [...el.querySelectorAll('*')].filter(n=>!['title','desc'].includes(n.localName)).map(n=>[n.localName,n.localName==='style'?n.textContent:'',[...n.attributes].filter(a=>!['id','class'].includes(a.name)).map(a=>[a.name,a.value.replace(/#2f3640/ig,'currentColor')]).sort()]);
  const props=[...el.attributes].filter(a=>['viewBox','fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','opacity'].includes(a.name)).map(a=>[a.name,a.value]).sort();
  doc.window.close(); return hash(JSON.stringify([props,result]));
}
function add(svg, entry) {
  const merge=(iconRegistry.reviewMerges||[]).find(m=>m.target===entry.asset||entry.sources.some(s=>s.file===m.target));
  if(merge){svg=renderMergedSVG(fs.readFileSync(path.join(root,merge.target),'utf8'));entry.key=merge.meaning;entry.owner=merge.target;entry.asset=merge.target;}
  if (!svg || /\{\{gaip:|\$\{/.test(svg)) { pending.push(entry); return; }
  // Ant includes empty style/defs nodes in a few definitions. They have no
  // presentation effect and must not become inline stylesheet elements.
  svg=svg.replace(/<style>\s*<\/style>/g,'').replace(/<defs>\s*<\/defs>/g,'');
  const externalAsset=entry.asset && /<style\b|\sstyle=/.test(svg);
  const key=signature(svg).slice(0,16), id=merge?merge.id:'icon-'+key;
  let item=items.get(id);
  if(!item){
    const view=svg.match(/viewBox=["']([^"']+)["']/)?.[1] || '';
    item={id,name:semantic(entry.key),meaning:semantic(entry.key),category:category(entry.owner,entry.key),
      format:entry.format || 'SVG',review:'待评审',viewBox:view,asset:entry.asset || null,template:externalAsset?null:id,
      sources:[],sizes:[],variants:[],aliases:[],actualViewBox:merge?.previewViewBox||null,lightGlyph:/["'](?:#fff(?:fff)?|white)["']/i.test(svg)&&!/["']#(?!fff(?:fff)?["'])[0-9a-f]{3,8}["']/i.test(svg)};
    items.set(id,item); if(!externalAsset)templates[id]=svg;
  }
  if(!item.aliases.includes(entry.key))item.aliases.push(entry.key);
  for(const ref of entry.sources) if(!item.sources.some(s=>JSON.stringify(s)===JSON.stringify(ref)))item.sources.push(ref);
  if(entry.size && !item.sizes.some(s=>s.width===entry.size.width&&s.height===entry.size.height&&s.basis===entry.size.basis))item.sizes.push(entry.size);
  if(entry.owner.includes('main-nav') || entry.key.startsWith('nav-icon-')){
    item.category='导航';item.name=item.meaning=semantic(entry.key);item.template=id;item.asset=null;templates[id]=svg;
    item.sizes=[{width:16,height:16,basis:'源码显示尺寸',source:'shared/styles/main-nav.css:11；18px 槽内显示 16px 图形'}];
  }
}
function sizeAttrs(svg,basis,ref) {
  const opening=svg.slice(0,svg.indexOf('>')+1),w=opening.match(/\bwidth=["']([\d.]+)(?:px)?["']/),h=opening.match(/\bheight=["']([\d.]+)(?:px)?["']/);
  return w&&h?{width:Number(w[1]),height:Number(h[1]),basis,source:ref}:null;
}
function sourceAppearance(markup,file,index){
  const doc=new JSDOM(markup),all=[];
  function descend(node){if(node.localName==='svg')all.push(node);for(const child of (node.content||node).children||[])descend(child);}
  descend(doc.window.document.documentElement);
  const svg=all[index];if(!svg){doc.window.close();return null;}
  if(file==='channels/config-center/templates/markup-announcement-management-view.html'&&svg.parentElement?.classList.contains('ant-btn-icon'))svg.parentElement.classList.add('gaip-announcement-create');
  const folder=file.split('/').slice(0,2).join('/')+'/';
  const relevant=sources.filter(s=>s.file.endsWith('.css')&&s.file.startsWith(folder));
  const winners=new Map();
  for(const sheet of relevant)for(const rule of sheet.text.matchAll(/([^{}]+)\{([^{}]+)\}/g)){
    if(!/(?:fill|stroke)\s*:/.test(rule[2]))continue;
    for(const selector of rule[1].replace(/\/\*[\s\S]*?\*\//g,'').trim().split(',')){
      if(selector.includes('::')||selector.includes(':hover')||selector.includes(':focus'))continue;
      let matches=false;try{matches=svg.matches(selector.trim());}catch{}
      if(!matches)continue;
      const priority=(selector.match(/#[\w-]+/g)||[]).length*100+(selector.match(/\.[\w-]+|\[[^\]]+\]/g)||[]).length*10;
      for(const decl of rule[2].matchAll(/(?:^|;)\s*(fill|stroke|stroke-width|stroke-linecap|stroke-linejoin)\s*:\s*([^;]+)/g)){
        const val=decl[2].replace(/\s*!important/g,'').trim(),rank=priority+(decl[2].includes('!important')?10000:0);
        if(!val.includes('var(')&&(!winners.has(decl[1])||winners.get(decl[1]).rank<=rank))winners.set(decl[1],{val,rank});
      }
    }
  }
  winners.forEach(({val},key)=>svg.setAttribute(key,val));
  const host=svg.closest('button,a,[role="img"]'),ant=host?.className?.match?.(/anticon-([\w-]+)/)?.[1];
  const labelHost=host?.cloneNode(true);labelHost?.querySelectorAll('svg').forEach(s=>s.remove());
  const title=host?.getAttribute('aria-label')||labelHost?.textContent?.replace(/\s+/g,' ').trim();
  const key=ant||(title&&title.length<24&&!/[{}]/.test(title)?title:null);
  const result={svg:svg.outerHTML,key};doc.window.close();return result;
}
const assets = ['channels','components','shared'].flatMap(walk).filter(f => f.endsWith('.svg') && !iconRegistry.assets.find(a=>a.file===f)?.hidden && !['inline-svg','third-party-svg'].includes(localKinds.get(f)) && !excluded(f));
for(const asset of assets){
  const key=path.basename(asset,'.svg'),dir=path.dirname(asset),owner=asset.split('/').slice(0,2).join('/');
  const refs=[];
  for(const s of sources){
    // Full paths, owner-relative names, and the two existing parametrized workspace families.
    const literal = s.text.includes(asset) || (!asset.startsWith('shared/assets/icons/') && (s.file.startsWith(owner+'/') || asset.startsWith('shared/')) && s.text.includes(path.basename(asset)));
    const family = /shared\/assets\/icons\/(?:brand|business)\/workspace\//.test(asset) && s.file.startsWith('channels/workspace/') &&
      ((key.startsWith('flag-') && s.text.includes('flag-{{gaip:')) || (/^news-(morning|noon|afternoon|night)/.test(key) && s.text.includes('news-{{gaip:')));
    if(literal||family){
      const pos=s.text.indexOf(literal?path.basename(asset):key.startsWith('flag-')?'flag-{{gaip:':'news-{{gaip:');
      refs.push(source(s.file,s.text.slice(0,Math.max(0,pos)).split('\n').length,family?'参数化资源引用':'资源引用',family?'同源模板与业务枚举':'可定位的素材引用'));
    }
  }
  const registration=iconRegistry.assets.find(a=>a.file===asset);
  for(const file of registration?.uses||[]){
    if(refs.some(r=>r.file===file))continue;
    const content=fs.readFileSync(path.join(root,file),'utf8');
    if(content.includes(asset)||content.includes(path.posix.dirname(asset)+'/')&&content.includes(path.basename(asset))||(iconRegistry.dataURIs||[]).some(b=>b.asset===asset&&b.file===file)||(iconRegistry.markup||[]).some(b=>b.file===asset&&b.uses.includes(file)&&content.includes('__GAIP_LOCAL_ICONS__.markup')))refs.push(source(file,1,'本地资源引用','共享图标登记与实际运行源'));
  }
  for(const resolver of iconRegistry.dynamicResolvers||[]){
    if(!asset.startsWith(resolver.root))continue;
    const code=fs.readFileSync(path.join(root,resolver.file),'utf8'),markup=fs.readFileSync(path.join(root,resolver.template),'utf8');
    if(code.includes(resolver.root)&&markup.includes(path.basename(asset))&&!refs.some(r=>r.file===resolver.template))refs.push(source(resolver.template,1,'拼接资源引用',resolver.file+'：已登记的图标根目录与模板文件名'));
  }
  if(!refs.length){unreferenced.push(asset);continue;}
  const svg=fs.readFileSync(path.join(root,asset),'utf8').match(/<svg\b[\s\S]*?<\/svg>/)?.[0]; if(!svg)continue;
  let size=null;
  for(const ref of refs){
    const s=sources.find(s=>s.file===ref.file)||{text:fs.readFileSync(path.join(root,ref.file),'utf8')};const escaped=path.basename(asset).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const image=s.text.match(new RegExp('<img[^>]*'+escaped+'[^>]*>'));if(image)size=sizeAttrs(image[0],'HTML 声明尺寸',ref.file);
    const rule=s.text.match(new RegExp('[^{}]*\\{[^{}]*'+escaped+'[^{}]*\\}'))?.[0];
    if(rule){const w=rule.match(/\bwidth\s*:\s*(\d+(?:\.\d+)?)px/),h=rule.match(/\bheight\s*:\s*(\d+(?:\.\d+)?)px/);if(w&&h)size={width:+w[1],height:+h[1],basis:'CSS 声明尺寸',source:ref.file};}
  }
  if(asset.includes('/flag-'))size={width:20,height:20,basis:'HTML 声明尺寸',source:'channels/workspace/templates/markup-workspace-update.html：汇率模板'};
  if(/^news-(morning|noon|afternoon|night)/.test(key))size={width:40,height:40,basis:'HTML 声明尺寸',source:'channels/workspace/templates/markup-workspace-update.html：资讯切换模板'};
  if(asset.includes('附件类型/'))size={width:16,height:16,basis:'CSS 声明尺寸',source:'components/ai-agent/AI Agent.css：附件图标'};
  const displayKey=registration?.variantKey?.split('/')[1]||key;
  add(svg,{key:displayKey,owner:asset,asset,format:'独立 SVG',sources:[source(asset,1,'图标维护源',registration?.variantKey||''),...refs],size});
}
// Owned HTML SVGs; generated JS caches are intentionally excluded to avoid counting them twice.
for(const s of sources.filter(s=>s.file.endsWith('.html'))){
  let index=0,svgIndex=0;
  for(const m of s.text.matchAll(/<svg\b[\s\S]*?<\/svg>/g)){
    const appearance=sourceAppearance(s.text,s.file,svgIndex++);
    const preceding=s.text.slice(0,m.index);const template=[...preceding.matchAll(/<template[^>]*data-gaip-markup="([^"]+)"/g)].at(-1)?.[1];
    const localSource=[...preceding.matchAll(/@gaip-icon:start ([^\s]+\.svg)/g)].at(-1)?.[1];
    const sourceRefs=[...(localSource?[source(localSource,1,'图标维护源',template)]:[]),source(s.file,preceding.split('\n').length,'模板内 SVG',template)];
    const label=m[0].match(/(?:data-icon|aria-label|class)="([^"{}]+)"/)?.[1] || template || 'inline-'+(++index);
    const key=template?.startsWith('nav-icon-') || s.file.includes('table-tag') ? template : appearance?.key||label;
    add(appearance?.svg||m[0],{key:key||label,owner:s.file,sources:sourceRefs,size:
      s.file.includes('table-tag')?{width:12,height:12,basis:'CSS 声明尺寸',source:'components/table/global-table-tag.css：图标槽'}:sizeAttrs(m[0],'HTML 声明尺寸',s.file)});
  }
}
// Webpack static icon definitions are data, never evaluated. Trace numeric module imports
// from the maintained page bundles and shared framework to avoid importing a whole icon library.
function visit(node,fn){if(!node||!node.type)return;fn(node);for(const v of Object.values(node)){if(Array.isArray(v))v.forEach(n=>visit(n,fn));else if(v&&v.type)visit(v,fn);}}
function value(n){
  if(!n)return undefined;if(n.type==='Literal')return n.value;
  if(n.type==='ArrayExpression'){const a=n.elements.map(value);return a.some(v=>v===undefined)?undefined:a;}
  if(n.type==='ObjectExpression'){const o={};for(const p of n.properties){if(p.type!=='Property'||p.computed)return undefined;const v=value(p.value);if(v===undefined)return undefined;o[p.key.name||p.key.value]=v;}return o;}
  return undefined;
}
const modules=new Map(), seeds=new Map(), defs=[];
const baselineFiles=walk('web').filter(f=>f.endsWith('.js')&&!f.includes('p__'));
const compiled=sources.filter(s=>/\/page\.js$/.test(s.file));
const runtimeFiles=['shared/runtime/umi.0b0663b5.js','shared/runtime/page-vendor.js'];
for(const file of [...baselineFiles,...runtimeFiles,...compiled.map(s=>s.file)]){
  const text=fs.readFileSync(path.join(root,file),'utf8');let ast;
  try{ast=parse(text,{ecmaVersion:'latest',locations:true});}catch(e){pending.push({owner:file,key:'解析失败',sources:[source(file,1,'未解析',e.message)]});continue;}
  visit(ast,n=>{
    if(n.type==='Property' && /^\d+$/.test(String(n.key.value)) && /Function/.test(n.value.type)){
      const id=String(n.key.value),deps=[];visit(n.value,b=>{if(b.type==='CallExpression' && b.callee.type==='Identifier'&&b.arguments.length===1 && typeof b.arguments[0].value==='number')deps.push(String(b.arguments[0].value));});
      modules.set(id,{file,line:n.loc.start.line,deps});
      if(file.startsWith('channels/'))seeds.set(id,file);
      visit(n.value,b=>{
        if(b.type!=='ObjectExpression')return;
        const props=b.properties; if(!props.some(p=>p.key&&(p.key.name||p.key.value)==='icon')||!props.some(p=>p.key&&(p.key.name||p.key.value)==='theme'))return;
        const icon=value(b);if(icon?.icon?.tag==='svg')defs.push({id,icon,file,line:b.loc.start.line});
      });
    }
  });
  if(file.startsWith('shared/runtime/'))visit(ast,n=>{if(n.type==='AssignmentExpression' && n.left.type==='MemberExpression' && n.left.property.name==='s' && typeof n.right.value==='number')seeds.set(String(n.right.value),'shared/runtime/umi.0b0663b5.js');});
}
const bindings=new Map();
for(const [seed,file] of seeds){const seen=new Set(),stack=[seed];while(stack.length){const id=stack.pop();if(seen.has(id))continue;seen.add(id);if(!bindings.has(id))bindings.set(id,new Set());bindings.get(id).add(file);stack.push(...(modules.get(id)?.deps||[]));}}
function iconXML(n){return '<'+n.tag+Object.entries(n.attrs||{}).map(([k,v])=>' '+k+'="'+xml(v)+'"').join('')+'>'+((n.children||[]).map(iconXML).join(''))+'</'+n.tag+'>';}
for(const d of defs){
  const users=bindings.get(d.id);if(!users)continue;
  const local=iconRegistry.ant.find(a=>a.module===d.id&&a.name===d.icon.name&&a.theme===d.icon.theme);
  if(!local)throw Error('第三方定义缺少本地源：'+d.icon.name+' / '+d.icon.theme);
  const svg=fs.readFileSync(path.join(root,local.file),'utf8').trim();
  add(svg,{key:d.icon.name,owner:local.file,asset:local.file,format:'Ant Design · '+d.icon.theme+'（本地 SVG）',sources:[source(local.file,1,'本地第三方 SVG',d.icon.name+' / '+d.icon.theme),source(d.file,d.line,'第三方原始定义',d.icon.name+' / '+d.icon.theme),...[...users].map(f=>source(f,1,'模块依赖引用','Webpack 模块 '+d.id))]});
}
// CSS-only glyphs stay as original selectors/rules in isolated frames; no substitute SVG.
for(const s of sources.filter(s=>s.file.endsWith('.css')&&!s.file.endsWith('/page.css'))){
  for(const m of s.text.matchAll(/([^{}]+)\{([^{}]+)\}/g)){
    const selector=m[1].trim(),decl=m[2];
    if(!/::(?:before|after)/.test(selector)||!/content\s*:/.test(decl)||!/rotate\(|border-width:/.test(decl)||/switch|shadow/.test(selector))continue;
    cssGlyphs.push({selector,source:s.file,line:s.text.slice(0,m.index).split('\n').length,rules:m[0]});
  }
}
const list=[...items.values()].sort((a,b)=>a.category.localeCompare(b.category,'zh-CN')||a.name.localeCompare(b.name,'zh-CN'));
// Referenced raster symbols are retained too; original images may coexist with
// later shared SVG replacements. Their provenance is not proof of active display.
for(const asset of ['channels','components','shared'].flatMap(walk).filter(f=>/\.(png|webp|gif)$/.test(f)&&(/\/assets\/icons\//.test(f)||/技能-|入口版本2/.test(f)))){
  const owner=asset.split('/').slice(0,2).join('/'),refs=[];
  for(const s of sources)if(s.text.includes(asset)||s.file.startsWith(owner+'/')&&s.text.includes(path.basename(asset)))refs.push(source(s.file,s.text.slice(0,s.text.indexOf(path.basename(asset))).split('\n').length,'位图资源引用','本地业务资源引用；是否当前显示需核实'));
  for(const file of iconRegistry.assets.find(a=>a.file===asset)?.uses||[])if(!refs.some(r=>r.file===file)&&fs.readFileSync(path.join(root,file),'utf8').includes(asset))refs.push(source(file,1,'位图资源引用','共享运行时的本地资源'));
  if(!refs.length)continue;
  const id='raster-'+hash(fs.readFileSync(path.join(root,asset))).slice(0,16),existing=list.find(i=>i.id===id);
  if(existing){existing.sources.push(...refs);continue;}
  const name=semantic(path.basename(asset).replace(/\.(webp|gif)$/,''));
  list.push({id,name,meaning:name,category:'位图与原资源',format:path.extname(asset).slice(1).toUpperCase(),review:'待评审',asset,template:null,viewBox:'位图',sources:refs,sizes:[],variants:[],aliases:[path.basename(asset)]});
}
const cssSamples=[
  ['css-date-previous','上一月','components/date-picker/global-date-picker.css',7,7],
  ['css-date-next','下一月','components/date-picker/global-date-picker.css',7,7],
  ['css-date-year-previous','上一年','components/date-picker/global-date-picker.css',14,7],
  ['css-date-year-next','下一年','components/date-picker/global-date-picker.css',14,7],
  ['css-select-check','多选选中','components/multi-select/global-multi-select.css',16,16],
  ['css-select-down','下拉','components/multi-select/global-multi-select.css',20,20],
  ['css-select-up','收起下拉','components/multi-select/global-multi-select.css',20,20],
  ['css-table-down','更多操作展开','components/table/global-table.css',8,8],
  ['css-table-up','更多操作收起','components/table/global-table.css',8,8],
  ['css-carousel-dot','轮播未选中','components/carousel-controls/global-carousel-controls.css',20,28],
  ['css-carousel-current','轮播当前项','components/carousel-controls/global-carousel-controls.css',32,28],
  ['css-filter-check','筛选选中','components/filter-bar/global-filter-bar.css',36,36]
];
for(const [id,name,file,width,height] of cssSamples){
 const merge=(iconRegistry.reviewMerges||[]).find(m=>m.cssSamples.includes(id));
 if(merge){const item=list.find(i=>i.id===merge.id);if(!item)throw Error('Merged CSS glyph has no canonical SVG');item.sources.push(source(file,1,'同源 CSS 图标','共用 '+merge.keep+' 绘图'));item.aliases.push(id,name);if(merge.displayName)item.name=merge.displayName;if(merge.mergedLabels)item.mergedLabels=merge.mergedLabels;continue;}
 list.push({id,name,meaning:name,category:'表单与选择',format:'CSS 绘制',review:'待评审',viewBox:'原控件片段',asset:null,template:id,
  sources:[source(file,1,'原控件 CSS','同源类名与状态属性；布局宿主仅用于摆放')],sizes:[{width,height,basis:'控件片段摆放尺寸，非页面测量',source:file}],aliases:[id],variants:[]});}
// CSS glyphs can share the selected control drawing without inventing an SVG.
for(const merge of iconRegistry.cssGlyphMerges||[]){
 const kept=list.find(item=>item.id===merge.id);if(!kept)throw Error('Missing selected CSS glyph: '+merge.id);
 const retired=list.filter(item=>merge.from.includes(item.id));if(retired.length!==merge.from.length)throw Error('Missing retired CSS glyph');
 kept.mergedLabels=retired.map(item=>item.name);kept.review='已合并';
 kept.aliases.push(...retired.flatMap(item=>[item.id,item.name,...item.aliases]));
 kept.sources.push(...retired.flatMap(item=>item.sources).map(s=>({...s,kind:'同源 CSS 图标',ref:'共用“'+kept.name+'”绘图'})));
 for(let i=list.length-1;i>=0;i--)if(merge.from.includes(list[i].id))list.splice(i,1);
}
const groups=new Map();for(const item of list){if(!groups.has(item.meaning))groups.set(item.meaning,[]);groups.get(item.meaning).push(item.id);}
// Keep review numbers independently of discovery order. Retain retired IDs so
// future additions and merges never reuse a number already discussed by users.
const sequenceFile='components/icons/icon-review-sequences.json';
const sequencePath=path.join(root,sequenceFile);
const sequences=fs.existsSync(sequencePath)?JSON.parse(fs.readFileSync(sequencePath,'utf8')):{version:1,groups:[]};
if(sequences.version!==1||!Array.isArray(sequences.groups))throw new Error('图标评审编号登记版本无效');
const seenMeanings=new Set(),seenNumbers=new Set(),seenIcons=new Set(),meaningByIcon=new Map();
for(const group of sequences.groups){
  if(!Number.isInteger(group.number)||group.number<1||seenNumbers.has(group.number)||seenMeanings.has(group.meaning)||!Array.isArray(group.versions))throw new Error('图标评审编号登记无效');
  seenMeanings.add(group.meaning);seenNumbers.add(group.number);
  for(const id of group.versions){if(seenIcons.has(id))throw new Error('图标评审版本重复：'+id);seenIcons.add(id);meaningByIcon.set(id,group.meaning);}
}
for(const item of list)if(meaningByIcon.has(item.id)&&meaningByIcon.get(item.id)!==item.meaning)throw new Error('图标用途已改变，需显式核对原评审编号：'+item.id);
for(const [meaning,ids] of groups){
  let group=sequences.groups.find(g=>g.meaning===meaning);
  if(!group&&ids.length>1){group={meaning,number:Math.max(0,...seenNumbers)+1,versions:[]};sequences.groups.push(group);seenNumbers.add(group.number);}
  if(group)for(const id of ids)if(!group.versions.includes(id)){
    if(seenIcons.has(id))throw new Error('图标用途已改变，需显式核对原评审编号：'+id);
    group.versions.push(id);seenIcons.add(id);
  }
}
for(const item of list){
  item.variants=groups.get(item.meaning);
  const group=sequences.groups.find(g=>g.meaning===item.meaning);
  if(group){item.reviewGroup=String(group.number).padStart(2,'0');item.reviewVersion=group.versions.indexOf(item.id)+1;item.reviewCode=item.reviewGroup+'-'+item.reviewVersion;item.mergedCodes=(iconRegistry.reviewMerges||[]).filter(m=>m.id===item.id).flatMap(m=>m.from);if(item.mergedCodes.length)item.review='已合并';}
}
publish(sequenceFile,JSON.stringify(sequences,null,2)+'\n');
const report={version:1,scope:'正式频道、自有共享组件、模板内 SVG，以及可追溯到正式页面/框架依赖的 Ant Design 图标定义；来源引用不等于所有状态均已显示验证',
  items:list,pending:pending.map(p=>({source:p.owner,key:p.key,locations:p.sources})),unreferenced,cssGlyphs,
  stats:{icons:list.length,sources:sourceFiles.length,unconfirmedSizes:list.filter(i=>!i.sizes.length).length,pendingTemplates:pending.length,cssGlyphs:cssGlyphs.length}};
function publish(file,content){if(check){if(!fs.existsSync(path.join(root,file))||fs.readFileSync(path.join(root,file),'utf8')!==content)throw new Error('图标盘点产物过期：'+file);}else{fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),content);}}
publish('components/icons/icon-catalog-data.js','/* Generated by scripts/build-icon-catalog.cjs; source references are preview provenance, not business dependencies. */\nwindow.__GAIP_ICON_CATALOG_DATA__ = '+JSON.stringify(report,null,2)+';\n');
publish('components/icons/templates/markup-icon-assets.html','<!-- Generated from actual source SVGs. Edit the original asset/template; rebuild the catalog. -->\n'+Object.entries(templates).map(([id,svg])=>'<template data-gaip-markup="'+id+'">'+svg+'</template>').join('\n')+'\n');
const dimensions=['20x20'];
publish('components/icons/icon-catalog-sizes.css','/* Generated from declared preview dimensions; no browser measurement claim. */\n'+dimensions.map(key=>{const [w,h]=key.split('x');return '.iconCatalog__sample--'+key+' { width: '+w+'px; height: '+h+'px; }';}).join('\n')+'\n'+cssSamples.map(([id,,file,w,h])=>'.iconCatalog__card--css-'+id+' [data-icon-size="20"] .iconCatalog__cssGlyph { width: '+w+'px; height: '+h+'px; transform: scale('+(20/Math.max(w,h))+'); }').join('\n')+'\n');
console.log((check?'Verified':'Built')+' icon catalog: '+JSON.stringify(report.stats));
