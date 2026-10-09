'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom'),{readTemplates}=require('./build-markup-templates.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const dom=new JSDOM('<main id="uploads"></main>',{url:'https://preview.invalid/components/index.html',runScripts:'outside-only'});
const w=dom.window,doc=w.document,host=doc.getElementById('uploads');
try{
  w.eval(read('components/uploads/upload-sources.js'));
  const defs={...readTemplates(read('components/templates/markup-components-preview.html')),...readTemplates(read('components/uploads/templates/markup-upload-controls.generated.html'))};
  const render=(id,args=[])=>defs[id].replace(/\{\{gaip:(\d+)\}\}/g,(_,i)=>args[i]);
  host.innerHTML=w.__GAIP_UPLOAD_CASES__.map(c=>render('upload-card',[c.id,c.name,render('upload-control-'+c.id)])).join('');
  let created=0;const revoked=[];
  w.URL.createObjectURL=()=> 'blob:preview-'+(++created);w.URL.revokeObjectURL=url=>revoked.push(url);
  w.eval(read('components/uploads/upload-controls.js'));
  w.__GAIP_UPLOAD_PREVIEW__.mount(host,()=>render('upload-file'));w.__GAIP_UPLOAD_PREVIEW__.mount(host,()=>render('upload-file'));
  const card=id=>host.querySelector('[data-upload-case="'+id+'"]');
  const names=id=>[...card(id).querySelectorAll('[data-upload-name]')].map(n=>n.textContent);
  function choose(id,files){const input=card(id).querySelector('input');Object.defineProperty(input,'files',{value:files,configurable:true});input.dispatchEvent(new w.Event('change',{bubbles:true}));}
  const file=(name,type='')=>new w.File(['data'],name,{type});
  assert.equal(w.__GAIP_UPLOAD_COMPONENTS__.length,1);
  assert.equal(host.querySelectorAll('input[type="file"]').length,12);
  assert.equal(host.querySelectorAll('iframe,a,dialog').length,0);
  for(const spec of w.__GAIP_UPLOAD_CASES__){
    const node=card(spec.id),input=node.querySelector('input'),trigger=node.querySelector('[data-upload-choose]');
    assert.equal(input.accept,spec.accept);assert.equal(input.multiple,!!spec.multiple);
    assert.equal(node.querySelector('h4').closest('.componentPreviewSurface'),null);
    assert.equal(node.querySelectorAll('[id]').length,0,'片段不带业务ID');
    let clicks=0;input.addEventListener('click',event=>{event.preventDefault();clicks++;});
    trigger.click();assert.equal(clicks,1,'点击触发选择器一次');
    trigger.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));assert.equal(clicks,2,'键盘可用');
    choose(spec.id,[file('unsupported.exe')]);assert.equal(node.querySelector('[role="alert"]').hidden,false);assert.deepEqual(names(spec.id),[]);
    const ext=spec.accept.split(',')[0],type=spec.type==='image'?'image/jpeg':'';
    choose(spec.id,[file('valid'+ext,type)]);assert.deepEqual(names(spec.id),['valid'+ext]);assert.equal(node.querySelector('[role="alert"]').hidden,true);
    if(spec.type==='image')assert.equal(node.querySelector('[data-upload-image]').hidden,false);
    if(spec.maxMB){const large=file('too-large'+ext,type);Object.defineProperty(large,'size',{value:spec.maxMB*1024*1024+1});choose(spec.id,[large]);assert.deepEqual(names(spec.id),['valid'+ext],'失败不能清除已选文件');assert.equal(node.querySelector('[role="alert"]').hidden,false);}
    node.querySelector('[data-upload-remove]').click();assert.deepEqual(names(spec.id),[]);
  }
  choose('upload-pdf',[file('<script>.pdf')]);assert.equal(card('upload-pdf').querySelector('script'),null,'文件名作为文本展示');
  choose('upload-pdf',[file('replacement.pdf')]);assert.deepEqual(names('upload-pdf'),['replacement.pdf']);
  choose('upload-agent',[file('a.pdf'),file('b.txt')]);choose('upload-agent',[file('c.docx')]);assert.deepEqual(names('upload-agent'),['a.pdf','b.txt','c.docx']);
  choose('upload-clue-images',[1,2,3,4].map(n=>file(n+'.png','image/png')));assert.equal(names('upload-clue-images').length,4);
  choose('upload-clue-images',[file('5.png','image/png')]);assert.equal(names('upload-clue-images').length,4);assert.match(card('upload-clue-images').querySelector('[role="alert"]').textContent,/最多/);
  card('upload-clue-images').querySelector('[data-upload-remove]').click();choose('upload-clue-images',[file('5.png','image/png')]);assert.equal(names('upload-clue-images').length,4);
  choose('upload-course-cover',[file('fake.jpg','application/pdf')]);assert.equal(names('upload-course-cover').length,0,'拒绝图片MIME冲突');
  const zone=card('upload-members').querySelector('.uploadControl'),drop=new w.Event('drop',{bubbles:true,cancelable:true});Object.defineProperty(drop,'dataTransfer',{value:{files:[file('drop.xlsx')]}});zone.dispatchEvent(drop);assert.deepEqual(names('upload-members'),['drop.xlsx']);
  assert.equal(w.localStorage.length,0,'预览不写业务存储');
  assert.equal(host.querySelectorAll('iframe').length,0);
  w.dispatchEvent(new w.Event('pagehide'));assert.equal(host.querySelectorAll('[data-upload-name]').length,0);
  assert.equal(revoked.length,created,'移除、更换及页面离开释放所有图片URL');
  assert.equal(new Set(revoked).size,revoked.length,'没有重复释放');
  for(const line of read('components/uploads/upload-source-styles.generated.css').split('\n').filter(s=>s.includes('{')))assert.ok(line.startsWith('.uploadCatalog .uploadControl '),'来源样式不逃逸到目录其他页签');
  console.log('upload preview: one entry, 12 controls, selection/keyboard/drop/type/size/count/replacement/remove/image cleanup passed (DOM only)');
}finally{w.close();}
