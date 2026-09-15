// Page editor geometry and form contract; independent mock controller, no online writes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});try{
 const p=await browser.newPage({viewport:{width:1920,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.setContent('<style>body{margin:0}#page{margin-left:212px;height:100vh}</style><section id="page" class="gaip-learning-page"><header class="gaip-learning-header"><button data-learning-action="学情管理">学情管理</button><button data-learning-action="课程管理">课程管理</button></header></section>');
 for(const f of ['shared/styles/global-font.css','shared/styles/global-modal.css','shared/styles/global-multi-select.css','shared/styles/global-filter-bar.css','shared/styles/global-table.css','features/learning-center/learning-center.css','features/learning-center/learning-v11.css','shared/styles/global-page-form.css'])await p.addStyleTag({content:read(f)});
 for(const f of ['shared/scripts/global-modal.js','shared/scripts/global-multi-select.js','shared/scripts/global-filter-bar.js','shared/scripts/global-table.js','features/learning-center/learning-data.js','features/learning-center/learning-app.js'])await p.evaluate(({s,url})=>{Object.defineProperty(document,'currentScript',{configurable:true,value:{src:url}});window.eval(s);},{s:read(f),url:'file://'+path.join(root,f)});

 await p.evaluate(()=>window.__GAIP_LEARNING_APP__.mount(document.querySelector('#page')));
 await p.locator('[data-learning-action="课程管理"]').click();await p.locator('[data-lc="create"]').click();
 const save=()=>p.locator('.lc-editor-footer [data-lc="save-course"]').click();
 const feedback=p.locator('.gaip-form-invalid .gaip-form-help--error');
 await save();assert.equal(await p.locator('#lc-course-title').getAttribute('aria-invalid'),'true');
 assert.equal(await p.evaluate(()=>document.activeElement.id),'lc-course-title');
 const visual=await feedback.evaluate(n=>{const s=getComputedStyle(n),control=n.parentElement.querySelector('.gaip-form-control');return {color:s.color,font:s.fontSize,line:s.lineHeight,gap:n.getBoundingClientRect().top-control.getBoundingClientRect().bottom,border:getComputedStyle(control).borderColor};});
 assert.deepEqual(visual,{color:'rgb(255, 77, 79)',font:'12px',line:'20px',gap:4,border:'rgb(255, 77, 79)'});
 await save();assert.equal(await feedback.count(),1);await p.locator('#lc-course-title').fill('反馈测试课程');assert.equal(await feedback.count(),0);
 await save();assert.equal(await p.locator('#lc-course-description').getAttribute('aria-invalid'),'true');await p.locator('#lc-course-description').fill('课程描述');
 await save();assert.equal(await p.locator('.lc-cover-picker').getAttribute('aria-invalid'),'true');
 await p.locator('[data-upload="cover"]').setInputFiles({name:'错误格式.txt',mimeType:'text/plain',buffer:Buffer.from('mock')});assert.match(await feedback.textContent(),/文件格式不支持/);
 await p.locator('[data-lc="sample-cover"]').click();
 await save();assert.equal(await p.locator('[role="combobox"]').getAttribute('aria-invalid'),'true');
 await p.locator('[role="combobox"]').click();await p.locator('[data-editor-groups] [data-value="all"]').click();assert.equal(await feedback.count(),0);await p.keyboard.press('Escape');
 await save();assert.match(await feedback.textContent(),/请选择必修属性/);await p.locator('[data-course-boolean="required"][value="false"]').check();assert.equal(await feedback.count(),0);await save();const id=await p.evaluate(()=>window.__GAIP_LEARNING_DATA__.state().courses.find(c=>c.title==='反馈测试课程').id);
 assert.equal(await p.locator('[data-edit-lesson]').count(),1,'first save opens the first unsaved lesson');await save();assert.equal(await p.locator('[data-edit-lesson] [data-field="title"]').getAttribute('aria-invalid'),'true');
 const lesson=p.locator('[data-edit-lesson]').last();await lesson.locator('[data-field="title"]').fill('第一课节');await save();assert.match(await feedback.textContent(),/请选择课节类型/);await lesson.locator('[data-lesson-type="video"]').check();await save();assert.match(await feedback.textContent(),/请添加课节内容/);
 assert.equal(await p.evaluate(()=>window.scrollY),0,'validation scrolls only the editor');assert.ok(await p.locator('.lc-editor').evaluate(n=>n.scrollTop)>0);
 await lesson.locator(".lc-upload-demo summary").first().click();await lesson.locator('[data-lc="sample-content"]').click();assert.equal(await feedback.count(),0);await save();
 await p.locator('[data-lc="leave-editor"]').first().click();await p.locator('.lc-manage-filter-slot input[type="search"]').fill('反馈测试课程');await p.locator('[data-lc="edit"][data-id="'+id+'"]').click();
 await p.locator('#lc-course-title').fill('');await save();assert.equal(await p.locator('#lc-course-title').getAttribute('aria-invalid'),'true','same feedback when editing');
 const box=await p.locator('.lc-editor-footer [data-lc="save-course"]').boundingBox();assert.equal(Math.round(1920-box.x-box.width),28,'buttons use viewport content edge, not centered card edge');
 if(process.env.FEEDBACK_SCREENSHOT)await p.screenshot({path:process.env.FEEDBACK_SCREENSHOT});
 assert.deepEqual(errors,[]);console.log('PASS right-aligned footer, shared feedback API, 12px/20px/red/4px gap, all base fields, lesson title/content, repeat/error clearing, edit reentry, inner-only scrolling');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
