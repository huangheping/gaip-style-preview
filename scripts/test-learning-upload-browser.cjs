const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('https://gaip-preview.test/**',route=>{const relative=decodeURIComponent(new URL(route.request().url()).pathname).slice(1),f=path.resolve(root,relative);if(!f.startsWith(root+path.sep)||!fs.existsSync(f))return route.abort();return route.fulfill({contentType:f.endsWith('.jpg')?'image/jpeg':'application/octet-stream',body:fs.readFileSync(f)});});
 await p.setContent('<style>body{margin:0}#page{margin-left:212px;height:100vh}</style><section id="page" class="gaip-learning-page"><header class="gaip-learning-header"><button data-learning-action="学情管理">学情管理</button><button data-learning-action="课程管理">课程管理</button></header></section>');
 for(const f of ['shared/styles/global-font.css','shared/styles/global-modal.css','shared/styles/global-multi-select.css','shared/styles/global-filter-bar.css','shared/styles/global-table.css','features/learning-center/learning-center.css','features/learning-center/learning-v11.css','shared/styles/global-page-form.css'])await p.addStyleTag({content:read(f)});
 for(const f of ['shared/scripts/global-modal.js','shared/scripts/global-multi-select.js','shared/scripts/global-filter-bar.js','shared/scripts/global-table.js','features/learning-center/learning-data.js','features/learning-center/learning-app.js'])await p.evaluate(({s,url})=>{Object.defineProperty(document,'currentScript',{configurable:true,value:{src:url}});window.eval(s);},{s:read(f),url:'file://'+path.join(root,f)});
 await p.evaluate(()=>{const D=__GAIP_LEARNING_DATA__,c=D.course('c7');D.root='https://gaip-preview.test/';c.lessons=[['video','v'],['audio','a'],['pdf','p']].map(([type,id])=>Object.assign(D.newLesson(),{id,type,title:type+'测试课节'}));D.state().courses=[c];__GAIP_LEARNING_APP__.mount(document.querySelector('#page'));});
 await p.locator('[data-learning-action="课程管理"]').click();await p.locator('[data-lc="edit"]').click();
 assert.equal(await p.locator('.lc-basics-heading').textContent(),'基本信息');
 assert.match(await p.locator('.lc-basics-groups .lc-field-help').textContent(),/向全部学员开放/);
 const card=id=>p.locator('[data-edit-lesson="'+id+'"]'),area=(id,kind)=>card(id).locator('.lc-lesson-file').nth(kind==='content'?0:1);
 const file=(name)=>({name,mimeType:name.endsWith('.pdf')?'application/pdf':'application/octet-stream',buffer:name.endsWith('.pdf')?fs.readFileSync(path.join(root,'assets/learning/lesson-reading-sample.pdf')):Buffer.from('local mock metadata only')});
 const upload=(id,kind,name)=>card(id).locator('[data-upload="'+kind+'"]').setInputFiles(file(name));
 for(const [id,kind,name] of [['v','content','示例视频.mp4'],['a','content','示例音频.mp3'],['p','content','图文阅读.pdf'],['p','handout','补充讲义.pdf']]){
   await upload(id,kind,name);const box=area(id,kind);
   assert.equal(await box.locator('.is-uploading').count(),1);assert.equal(await box.locator('progress').getAttribute('aria-label'),'模拟上传进度');
   assert.equal(await box.locator('progress').evaluate(n=>getComputedStyle(n).accentColor),'rgb(36, 212, 201)');
   const uploadingHeight=await box.locator('.lc-lesson-file-box').evaluate(n=>n.getBoundingClientRect().height);
   if(process.env.UPLOADING_SCREENSHOT&&id==='v')await card(id).screenshot({path:process.env.UPLOADING_SCREENSHOT});
   await box.locator('.lc-upload-demo summary').click();await box.locator('[data-lc="fail-upload"]').click();assert.match(await box.locator('.is-failed').textContent(),/上传失败/);
   await box.locator('[data-lc="retry-upload"]').click();await box.locator('.is-success').waitFor();assert.match(await box.textContent(),/上传成功/);
   assert.deepEqual(await box.locator('.lc-file-replace').evaluate(n=>({bg:getComputedStyle(n).backgroundColor,color:getComputedStyle(n).color})),{bg:'rgb(17, 17, 17)',color:'rgb(255, 255, 255)'});
   assert.equal(await box.locator('.lc-lesson-file-box').evaluate(n=>n.getBoundingClientRect().height),uploadingHeight,'upload state does not move actions');
   assert.deepEqual(await box.locator('.lc-upload-icon').evaluate(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height,fill:getComputedStyle(n.querySelector('path')).fill,gap:getComputedStyle(n.parentElement).gap})),{w:16,h:16,fill:'rgb(255, 255, 255)',gap:'8px'});
   assert.equal(await box.locator('.is-success .lc-upload-status-label').textContent(),'上传成功，待保存');
   assert.deepEqual(await box.locator('.lc-upload-complete-icon').evaluate(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height,fill:getComputedStyle(n.querySelector('path')).fill,text:getComputedStyle(n.parentElement).color,gap:getComputedStyle(n.parentElement).gap})),{w:16,h:16,fill:'rgb(36, 212, 201)',text:'rgb(47, 54, 64)',gap:'8px'});
   assert.doesNotMatch(await box.textContent(),/当前文件：|原文件已保留：|点击文件名/);
   const before=await p.evaluate(()=>JSON.stringify(__GAIP_LEARNING_DATA__.state())),link=box.locator('.lc-local-file-link');
   assert.equal(await link.textContent(),name);
   assert.equal(await link.getAttribute('target'),'_blank');assert.match(await link.getAttribute('rel'),/noopener/);
   const actual=await link.evaluate(async n=>{const r=await fetch(n.href),bytes=new Uint8Array(await r.arrayBuffer());return {size:bytes.length,head:Array.from(bytes.slice(0,64)),type:r.headers.get('content-type')};});
   assert.equal(actual.size,file(name).buffer.length);assert.deepEqual(actual.head,Array.from(file(name).buffer.subarray(0,64)),'link resolves selected bytes');
   assert.equal(actual.type,name.endsWith('.pdf')?'application/pdf':name.endsWith('.mp3')?'audio/mpeg':'video/mp4');
   const opened=p.waitForEvent('popup');await link.click();const tab=await opened;
   if(!name.endsWith('.pdf')){await tab.waitForURL(/^blob:/,{waitUntil:'commit'});assert.ok(tab.url().startsWith('blob:'));}
   // Chrome's built-in PDF viewer owns its navigation lifecycle; verify the real PDF URL/bytes and new tab, not a DOM load event.
   else assert.match(await link.getAttribute('href'),/^blob:/);
   await tab.close();
   assert.equal(await p.locator('.lc-file-preview, video, audio').count(),0,'no inline player');
   assert.equal(await p.evaluate(()=>JSON.stringify(__GAIP_LEARNING_DATA__.state())),before,'opening files writes no course/study data');
   if(process.env.PREVIEW_SCREENSHOT&&id==='v')await card(id).screenshot({path:process.env.PREVIEW_SCREENSHOT});
 }
 // Success only modifies the editor until an explicit save; saving while busy cannot commit an old file.
 assert.equal(await p.evaluate(()=>__GAIP_LEARNING_DATA__.course('c7').lessons[0].file),null);
 await p.locator('[data-lc="save-course"]').click();assert.equal(await p.evaluate(()=>__GAIP_LEARNING_DATA__.course('c7').lessons[0].file.name),'示例视频.mp4');
 assert.equal(await area('v','content').locator('.lc-local-file-link').count(),1,'save keeps the selected local file available');
 const originalURL=await area('v','content').locator('.lc-local-file-link').getAttribute('href');
 await upload('v','content','替换视频.mp4');await p.locator('[data-lc="save-course"]').click();assert.match(await p.locator('.gaip-learning-toast').textContent(),/正在模拟上传/);
 await area('v','content').locator('.lc-upload-demo summary').click();await area('v','content').locator('[data-lc="fail-upload"]').click();assert.match(await area('v','content').textContent(),/更换失败，原文件未变/);
 assert.equal(await area('v','content').locator('.lc-local-file-link').getAttribute('href'),originalURL,'replacement failure preserves original file access');
 assert.equal((await area('v','content').textContent()).split('示例视频.mp4').length-1,1,'old filename shown once');
 if(process.env.UPLOAD_SCREENSHOT)await card('v').screenshot({path:process.env.UPLOAD_SCREENSHOT});
 await area('v','content').locator('[data-lc="retry-upload"]').click();await area('v','content').locator('[data-lc="cancel-upload"]').click();assert.match(await area('v','content').textContent(),/示例视频.mp4/);assert.equal(await area('v','content').locator('.lc-upload-state').count(),0);
 await upload('v','content','非法类型.txt');assert.match(await area('v','content').textContent(),/文件格式不支持/);assert.equal(await area('v','content').locator('[data-lc="retry-upload"]').count(),0);
 // Type change cancels the old upload and cannot attach the wrong file later.
 await upload('v','content','迟到的视频.mp4');await card('v').locator('[data-lesson-type="audio"]').check();assert.equal(await area('v','content').locator('.lc-upload-state').count(),0);assert.match(await area('v','content').textContent(),/请添加音频文件/);
 await upload('v','content','新音频.mp3');await upload('v','handout','并行讲义.pdf');await area('v','content').locator('.is-success').waitFor();await area('v','handout').locator('.is-success').waitFor();assert.match(await area('v','content').textContent(),/新音频.mp3/);
 for(const width of [1440,760,480]){await p.setViewportSize({width,height:1000});const overflow=await p.locator('.lc-lesson-file-box').evaluateAll(ns=>ns.some(n=>n.scrollWidth>n.clientWidth+1));assert.equal(overflow,false,'file area overflow at '+width);}
 await p.setViewportSize({width:1440,height:1000});await p.locator('[data-lc="save-course"]').click();
 await upload('v','content','离开时取消.mp3');await p.locator('[data-lc="leave-editor"]').first().click();await p.locator('dialog [data-learning-discard]').click();
 await p.waitForTimeout(2800);assert.equal(await p.evaluate(()=>__GAIP_LEARNING_DATA__.course('c7').lessons[0].file.name),'新音频.mp3');
 await p.locator('[data-lc="edit"]').click();assert.equal(await p.locator('.lc-upload-state').count(),0);
 assert.equal(await area('v','content').locator('.lc-local-file-link').count(),1,'return to editor keeps saved file link within this tab');
 await upload('v','content','销毁时取消.mp3');await p.evaluate(()=>__GAIP_LEARNING_APP__.destroy());await p.waitForTimeout(2800);assert.equal(await p.evaluate(()=>__GAIP_LEARNING_DATA__.course('c7').lessons[0].file.name),'新音频.mp3');
 assert.equal(await p.evaluate(()=>JSON.stringify(__GAIP_LEARNING_DATA__.state()).includes('blob:')),false,'temporary URLs never persist in course metadata');
 // A new controller instance represents losing in-memory files after refresh; metadata must not become a fake sample link.
 await p.evaluate(s=>window.eval(s),read('features/learning-center/learning-app.js'));
 await p.evaluate(()=>{document.querySelector('#page').innerHTML='<header class="gaip-learning-header"><button data-learning-action="学情管理">学情管理</button><button data-learning-action="课程管理">课程管理</button></header>';__GAIP_LEARNING_APP__.mount(document.querySelector('#page'));});
 await p.locator('[data-learning-action="课程管理"]').click();await p.locator('[data-lc="edit"]').click();
 assert.equal(await area('v','content').locator('.lc-local-file-link').count(),0);assert.match(await area('v','content').textContent(),/重新选择本地文件/);
 assert.deepEqual(errors,[]);console.log('PASS four mock upload types, progress/failure/retry/success/cancel, black replacement controls, old-file preservation, save guard, validation, parallel uploads, type-change/discard/destroy cleanup and responsive bounds.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
