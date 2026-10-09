'use strict';
// Build bounded control fragments from the existing owners; never load business pages.
const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm');
const {JSDOM}=require('jsdom'), {parse}=require('rrweb-cssom');
const {readTemplates}=require('./build-markup-templates.cjs');
const root=path.resolve(__dirname,'..'), check=process.argv.includes('--check');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sandbox={window:{}};vm.runInNewContext(read('components/uploads/upload-sources.js'),sandbox);
const cases=sandbox.window.__GAIP_UPLOAD_CASES__;
const doc=new JSDOM('').window.document;
const template=(file,id,args=[])=>readTemplates(read(file))[id].replace(/\{\{gaip:(\d+)\}\}/g,(_,i)=>args[i]||'');
const fragment=html=>{const t=doc.createElement('template');t.innerHTML=html;return t.content;};
const icon=(file)=>{const img=doc.createElement('img');img.src='../shared/assets/icons/'+file;img.alt='';img.className='uploadControl__icon';return img.outerHTML;};
const input=()=>{const el=doc.createElement('input');el.type='file';el.hidden=true;return el;};
const button=(name,cls='')=>{const el=doc.createElement('button');el.type='button';el.className=cls;el.textContent=name;return el;};
const learning='channels/learning-center/templates/markup-learning-app.html';
let html='<!-- Generated from bounded source controls by scripts/build-upload-preview.cjs. -->\n';
for(const item of cases){
  let content;
  if(item.skin==='lesson'){
    const action=template(learning,'lessonFilePicker-54',['','选择文件',icon('business/variants/learning-upload.svg'),'上传'+item.name,'content',item.id,item.accept]);
    content=fragment(template(learning,'lessonFilePicker-59',[item.name,'', '',item.accept.toUpperCase()+'，最大 '+item.maxMB+'MB','',action]));
    content.querySelector('h5').remove();
    content.querySelectorAll('.lc-lesson-file-description,.lc-upload-feedback').forEach(n=>n.remove());
  }else if(item.skin==='cover'){
    content=fragment(template(learning,'courseBasics-44'));
    const label=content.querySelector('.lc-cover-picker');label.innerHTML=template(learning,'courseBasics-46');content=fragment(label.outerHTML);
  }else if(item.skin==='live'){
    content=fragment(template('channels/learning-center/templates/markup-learning-live.html','openEditor-6'));
  }else if(item.skin==='avatar'||item.skin==='qr'){
    const owner=new JSDOM(read('components/海报分享/index.html')).window.document;
    content=fragment(owner.getElementById(item.skin==='avatar'?'avatarUploader':'qrUploader').outerHTML);
    content.querySelectorAll('.upload-actions').forEach(n=>n.remove());
    content.querySelectorAll('img').forEach(n=>n.setAttribute('src',n.getAttribute('src').replace('./../../','../')));
  }else if(item.skin==='members'){
    content=fragment(template('channels/config-center/templates/markup-config-center.html','renderBulkImportStep-20'));
    content=fragment(content.querySelector('.gaip-bulk-upload-button').outerHTML);
    content.querySelector('.gaip-bulk-upload-icon').remove();
    const label=content.firstElementChild;label.insertAdjacentHTML('afterbegin',icon('operations/config-center/bulk-import-upload.svg'));
  }else if(item.skin==='clues'){
    const owner=new JSDOM(read('channels/clues/index.html')).window.document;
    content=owner.getElementById('clues-uploadBtn').content.cloneNode(true);
    const plus=content.querySelector('[data-component]');const replacement=doc.createElement('span');replacement.className=plus.getAttribute('data-ui-class-name');replacement.textContent='+';plus.replaceWith(replacement);
  }else if(item.skin==='customer'){
    content=fragment('');content.append(button('导入沟通内容识别','ant-btn importBtn___ZrdGJ'));
  }else if(item.skin==='agent'){
    content=fragment('');const el=button('','uploadControl__attachment');el.innerHTML=icon('business/ai-agent/上传附件.svg');el.setAttribute('aria-label','上传附件');el.title='上传附件';content.append(el);
  }
  if(!content.querySelector('input[type="file"]'))content.append(input());
  const file=content.querySelector('input[type="file"]');file.setAttribute('accept',item.accept);file.hidden=true;
  if(item.multiple)file.multiple=true;
  file.setAttribute('aria-label',item.name);file.dataset.uploadInput='';
  const trigger=content.querySelector('label,button,[role="button"]');trigger.dataset.uploadChoose='';trigger.tabIndex=0;
  const wrapper=doc.createElement('div');wrapper.className='uploadControl uploadControl--'+item.skin;wrapper.append(content);
  for(const n of wrapper.querySelectorAll('*')){
    n.removeAttribute('id');n.removeAttribute('style');
    for(const a of [...n.attributes])if(a.name.startsWith('data-')&&!['data-upload-input','data-upload-choose'].includes(a.name))n.removeAttribute(a.name);
  }
  const visual=wrapper.querySelector('.lc-cover-picker, .lc-live-image-slot, .upload-visual');
  if(visual)visual.dataset.uploadVisual='';
  const hint=doc.createElement('small');hint.className='uploadControl__limits';hint.textContent=item.accept.toUpperCase().replaceAll('.', '').replaceAll(',', ' / ')+(item.maxMB?' · 最大 '+(item.maxMB===3072?'3GB':item.maxMB+'MB'):'')+(item.maxCount?' · 最多 '+item.maxCount+' 张':'');wrapper.append(hint);
  html+='<template data-gaip-markup="upload-control-'+item.id+'">'+wrapper.outerHTML+'</template>\n';
}
let css='/* Generated source control styles, scoped to uploads only. */\n';
function topLevelRules(source){
  const blocks=[];let depth=0,start=0,quote='';
  source=source.replace(/\/\*[\s\S]*?\*\//g,'');
  for(let i=0;i<source.length;i++){
    const ch=source[i];
    if(quote){if(ch==='\\')i++;else if(ch===quote)quote='';continue;}
    if(ch==='"'||ch==="'"){quote=ch;continue;}
    if(ch==='{' ){depth++;}
    else if(ch==='}'){if(--depth===0){blocks.push(source.slice(start,i+1));start=i+1;}}
    else if(ch===';'&&depth===0)start=i+1;
  }
  return blocks;
}
const sources=[
 ['channels/learning-center/learning-center.css',/^\.(lc-button|lc-file-picker|lc-cover-picker(?:-caption)?|lc-lesson-file(?:-box|-description|-actions)?|lc-upload-feedback|lc-upload-icon|lc-live-image-slot|lc-live-upload)(?=[\s.:>+\[]|$)/],
 ['channels/config-center/config-center-content.css',/^\.gaip-config-page \.gaip-bulk-upload-button/],
 ['channels/clues/page.css',/^\.(uploadBtn___WBpgy|uploadPlus___y6lZP|uploadText___VRcVH)(?=[\s.:>+\[]|$)/],
 ['components/海报分享/index.styles-1.css',/^\.(upload-card|upload-visual|upload-copy)(?=[\s.:>+\[]|$)/],
 ['channels/customer/page.css',/^\.bottomBar___Odca2 \.importBtn___ZrdGJ/]
];
for(const [file,match] of sources){
  css+='/* '+file+' */\n';
  // Only top-level bounded control rules; no page layout or responsive business shells.
  for(const sourceRule of topLevelRules(read(file))){
    const block=sourceRule.match(/^([^{}]+)\{([^{}]*)\}$/);
    if(!block)continue;
    const selectors=block[1].split(',').map(s=>s.trim()).filter(s=>match.test(s));
    if(selectors.length){
      const rule=parse(selectors.join(',')+'{'+block[2]+'}').cssRules[0];
      css+=selectors.map(s=>'.uploadCatalog .uploadControl '+s.replace(/^\.gaip-config-page |^\.bottomBar___Odca2 /,'')).join(',')+' {'+rule.style.cssText+'}\n';
    }
  }
}
function output(file,value){
  const target=path.join(root,file);
  if(check){if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==value)throw Error('Stale upload preview: '+file);}
  else {fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,value);}
}
output('components/uploads/templates/markup-upload-controls.generated.html',html.replace(/[\t ]+$/gm, ''));
output('components/uploads/upload-source-styles.generated.css',css);
console.log('upload source controls: '+cases.length+' bounded fragments '+(check?'verified':'built'));
