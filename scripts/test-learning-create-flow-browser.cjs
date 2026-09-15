// Real Chromium, local source fixture and mocked origin. All network requests are intercepted.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = path.resolve(__dirname, '..');
const styles = ['shared/styles/global-font.css','shared/styles/global-modal.css','shared/styles/global-multi-select.css','shared/styles/organization-tree.css','shared/styles/global-filter-bar.css','shared/styles/global-table.css','shared/styles/global-tabs.css','features/learning-center/learning-center.css','features/learning-center/learning-v11.css','shared/styles/global-page-form.css'];
const scripts = ['shared/scripts/global-modal.js','shared/scripts/global-multi-select.js','shared/scripts/organization-store.js','shared/scripts/organization-tree.js','shared/scripts/global-filter-bar.js','shared/scripts/global-table.js','shared/scripts/global-tabs.js','shared/scripts/operation-log-xlsx.js','features/learning-center/learning-data.js','features/learning-center/learning-app.js'];
const fixture = '<!doctype html><html><head><meta charset="utf-8">' + styles.map(f=>'<link rel="stylesheet" href="/'+f+'">').join('') + '<style>body{margin:0}#page{margin-left:212px;height:100vh}</style></head><body><section id="page" class="gaip-learning-page"><header class="gaip-learning-header"><button data-learning-action="学情管理">学情管理</button><button data-learning-action="课程管理">课程管理</button></header></section>' + scripts.map(f=>'<script src="/'+f+'"></script>').join('') + '<script>__GAIP_LEARNING_APP__.mount(document.querySelector("#page"));</script></body></html>';
(async()=>{
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    const ctx = await browser.newContext({viewport:{width:1920,height:1000}}), errors=[];
    ctx.on('page', p=>p.on('pageerror', e=>errors.push(e.message)));
    await ctx.route('**/*', route=>{
      const u=new URL(route.request().url()), relative=decodeURIComponent(u.pathname).slice(1), file=path.resolve(root,relative);
      if(u.origin!=='https://gaip.local.test')return route.abort();
      if(relative==='学习中心.html')return route.fulfill({contentType:'text/html',body:fixture});
      if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:''});
      const types={'.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
      return route.fulfill({contentType:types[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
    });
    const p=await ctx.newPage();await p.goto('https://gaip.local.test/学习中心.html#/clues?gaip-channel=learning');
    const click=a=>p.locator('[data-lc="'+a+'"]').first().click();
    await p.locator('[data-learning-action="课程管理"]').click();await click('create');
    assert.equal(await p.locator('.lc-course-lessons-editor').count(),0);
    assert.equal(await p.locator('[data-course-boolean="required"]:checked').count(),0);
    assert.deepEqual(await p.locator('.lc-editor-footer button').allTextContents(),['取消','保存草稿并返回','保存并添加课节']);
    assert.equal(await p.locator('.lc-admin-heading [data-lc="save-course"]').count(),0);
    assert.match(await p.locator('.lc-cover-help').textContent(),/建议使用 16:9 比例图片/);
    assert.equal(await p.locator('.lc-settings-grid > * > .lc-field-help').count(),1,'only group guidance remains');
    assert.equal(await p.locator('.lc-editor-header [data-lc="preview-course"]').count(),0,'unsaved course has no preview action');
    const hintPosition=await p.locator('.lc-editor-footer').evaluate(n=>{const hint=n.querySelector('.lc-editor-save-hint'),r=hint.getBoundingClientRect(),f=n.getBoundingClientRect(),b=n.querySelector('.lc-editor-footer-inner').getBoundingClientRect(),s=getComputedStyle(hint);return {left:r.left-f.left,center:r.top+r.height/2,buttonCenter:b.top+b.height/2,color:s.color,font:s.fontSize,line:s.lineHeight,height:f.height};});
    assert.equal(hintPosition.left,24);assert.equal(hintPosition.height,64);assert.ok(Math.abs(hintPosition.center-hintPosition.buttonCenter)<1);
    assert.equal(hintPosition.color,'rgba(47, 54, 64, 0.65)');assert.equal(hintPosition.font,'12px');assert.equal(hintPosition.line,'18px');
    for(const width of [1920,1327,760]){
      await p.setViewportSize({width,height:1000});
      const bounds=await p.locator('.lc-editor-footer').evaluate(n=>({overflow:n.scrollWidth>n.clientWidth+1,right:n.getBoundingClientRect().right,buttons:[...n.querySelectorAll('button')].map(b=>b.getBoundingClientRect().right)}));
      assert.equal(bounds.overflow,false);assert.ok(bounds.buttons.every(x=>x<=bounds.right));
    }
    await p.setViewportSize({width:1920,height:1000});
    if(process.env.CREATE_SCREENSHOT)await p.screenshot({path:process.env.CREATE_SCREENSHOT});
    async function fillBase(title){
      await p.locator('#lc-course-title').fill(title);await p.locator('#lc-course-description').fill('新增流程测试，只有本地 Mock。');await click('sample-cover');
      await p.locator('[data-editor-groups] [role="combobox"]').click();await p.locator('[data-editor-groups] [data-value="all"]').click();await p.keyboard.press('Escape');
    }
    await fillBase('保存返回测试');await click('save-draft-return');
    assert.equal(await p.locator('[data-course-boolean="required"]').first().getAttribute('aria-invalid'),'true');
    assert.equal(await p.locator('.lc-course-lessons-editor').count(),0,'invalid first save never reveals lesson management');
    await p.locator('[data-course-boolean="required"][value="false"]').check();await click('save-draft-return');
    assert.equal(await p.locator('#page').getAttribute('data-learning-view'),'manage');
    const returned=await p.evaluate(()=>__GAIP_LEARNING_DATA__.state().courses.find(c=>c.title==='保存返回测试'));
    assert.equal(returned.status,'draft');assert.equal(returned.required,false);assert.equal(returned.lessons.length,0);
    await click('create');await fillBase('保存继续测试');await p.locator('[data-course-boolean="required"][value="true"]').check();await click('save-course');
    assert.equal(await p.locator('.lc-course-lessons-editor').count(),1);assert.equal(await p.locator('[data-edit-lesson]').count(),1);
    assert.equal(await p.locator('.lc-editor-footer--draft').count(),0,'first save clears new-course footer layout');
    const previewButton=p.locator('.lc-editor-header [data-lc="preview-course"]');
    assert.equal(await previewButton.textContent(),'预览课程');
    assert.equal(await p.locator('.lc-admin-heading [data-lc="preview-course"]').count(),0);
    for(const width of [1920,1327,760]){
      await p.setViewportSize({width,height:1000});
      const g=await p.locator('.lc-editor-header').evaluate(n=>{const h=n.getBoundingClientRect(),b=n.querySelector('[data-lc="preview-course"]').getBoundingClientRect(),r=n.querySelector('[data-lc="leave-editor"]').getBoundingClientRect();return {right:h.right-b.right,delta:Math.abs(b.top+b.height/2-r.top-r.height/2),overlap:b.left<r.right};});
      assert.equal(g.right,28);assert.ok(g.delta<1);assert.equal(g.overlap,false);
    }
    await p.setViewportSize({width:1920,height:1000});
    if(process.env.PREVIEW_HEADER_SCREENSHOT){await p.locator('.lc-editor').evaluate(n=>n.scrollTop=0);await p.screenshot({path:process.env.PREVIEW_HEADER_SCREENSHOT});}
    const footerRight=await p.locator('.lc-editor-footer').evaluate(n=>n.getBoundingClientRect().right-n.querySelector('[data-lc="save-course"]').getBoundingClientRect().right);
    assert.equal(footerRight,28,'existing editor actions stay at the right after first save');
    assert.equal(await p.locator('[data-edit-lesson] [data-field="title"]').evaluate(n=>n===document.activeElement),true);
    assert.equal(await p.evaluate(()=>window.scrollY),0);
    const id=await p.evaluate(()=>__GAIP_LEARNING_DATA__.state().courses.find(c=>c.title==='保存继续测试').id);
    assert.equal(await p.evaluate(id=>__GAIP_LEARNING_DATA__.course(id).lessons.length,id),0,'first empty lesson is not silently persisted');
    await p.locator('[data-edit-lesson] [data-field="title"]').fill('预览视频');assert.equal(await p.locator('[data-lesson-type]:checked').count(),0);assert.equal(await p.locator('[data-upload="content"]').count(),0);await click('save-lesson');assert.equal(await p.locator('[data-lesson-type]').first().getAttribute('aria-invalid'),'true');await p.locator('[data-lesson-type="video"]').check();await p.locator('.lc-upload-demo summary').first().click();await click('sample-content');await click('save-lesson');
    assert.equal(await p.evaluate(id=>__GAIP_LEARNING_DATA__.course(id).lessons.length,id),1);
    await p.locator('#lc-course-title').fill('未保存的修改');
    const oldState=await p.evaluate(()=>{const s=__GAIP_LEARNING_DATA__.state();return JSON.stringify([s.records,s.completions,s.logs]);});
    const previewPromise=ctx.waitForEvent('page');await click('preview-course');const preview=await previewPromise;
    await preview.waitForLoadState();await preview.locator('.gaip-course-detail-title').waitFor();
    assert.match(preview.url(),/gaip-preview=/);assert.equal(await preview.evaluate(()=>window.opener),null);
    assert.equal(await preview.locator('.gaip-course-detail-title').textContent(),'保存继续测试','preview reads saved data, never pending form data');
    assert.equal(await p.locator('#lc-course-title').inputValue(),'未保存的修改');
    await preview.locator('article[data-lc="lesson"]').click();await preview.locator('[data-seek]').fill('180');
    const previewState=await preview.evaluate(()=>{const s=__GAIP_LEARNING_DATA__.state();return JSON.stringify([s.records,s.completions,s.logs]);});
    assert.equal(previewState,oldState,'preview seek must not modify learning or logs');await preview.close();
    await p.locator('#lc-course-title').fill('保存继续测试');await click('leave-editor');
    assert.equal(await p.locator('#page').getAttribute('data-learning-view'),'manage');
    await p.locator('.lc-manage-filter-slot input[type="search"]').fill('保存继续测试');
    const listPopupPromise=ctx.waitForEvent('page');await p.locator('[data-lc="preview-course"][data-id="'+id+'"]').click();const listPopup=await listPopupPromise;await listPopup.waitForLoadState();await listPopup.locator('.gaip-course-detail-title').waitFor();await listPopup.close();
    await click('list');assert.equal(await p.locator('[data-lc="course"][data-id="'+id+'"]').count(),0,'admin learning list excludes drafts');
    // Filter metrics without erasing archived records, and reject the last lesson atomically.
    const report=await p.evaluate(()=>{
      const D=__GAIP_LEARNING_DATA__,c=D.course('c2');D.state().courses=[c];
      c.lessons.forEach((l,i)=>D.state().records['u1/'+c.id+'/'+l.id]={progress:i===0?100:50,position:i===0?180:90,highWater:i===0?180:90,firstAt:i===0?'2020-01-01':'2021-01-01',lastAt:i===0?'2026-01-01':'2025-01-01',completedAt:i===0?'2026-01-01':null});
      const records=JSON.stringify(D.state().records),before=D.studyHistory(c,'u1');D.publishLesson(c.id,c.lessons[0].id,false);const after=D.studyHistory(c,'u1');
      D.publishLesson(c.id,c.lessons[0].id,true);const restored=D.studyHistory(c,'u1');D.publishLesson(c.id,c.lessons[0].id,false);D.publishLesson(c.id,c.lessons[2].id,false);
      const snapshot=JSON.stringify(D.state());let message='';try{D.publishLesson(c.id,c.lessons[1].id,false);}catch(e){message=e.message;}
      return {before,after,restored,recordsUnchanged:records===JSON.stringify(D.state().records),atomic:snapshot===JSON.stringify(D.state()),message};
    });
    assert.equal(report.before.duration,270);assert.equal(report.after.duration,90);assert.equal(report.after.firstAt,'2021-01-01');assert.equal(report.after.lastAt,'2025-01-01');assert.equal(report.restored.duration,270);assert.ok(report.recordsUnchanged);assert.ok(report.atomic);assert.match(report.message,/至少保留/);
    await p.locator('[data-learning-action="学情管理"]').click();assert.match(await p.locator('.lc-hint').textContent(),/已下架课节不纳入本页及导出统计/);
    const adminRow=p.locator('tbody tr').filter({hasText:'mock.admin'});assert.match(await adminRow.textContent(),/01:30/);
    await p.evaluate(()=>{window.__GAIP_OPERATION_LOG_XLSX__={build(rows){window.__exportRows=rows;return new Blob(['mock']);}};});await click('export');
    const exported=await p.evaluate(()=>__exportRows.find(r=>r[1]==='mock.admin'));assert.equal(exported[3],'01:30');
    await click('list');await p.locator('[data-learning-action="课程管理"]').click();await p.locator('[data-lc="edit"][data-id="c2"]').click();
    await p.locator('[data-lc="lesson-status"][data-id="c2l2"]').click();assert.equal(await p.locator('dialog .gaip-modal__title').textContent(),'无法下架课节');await p.getByRole('button',{name:'我知道了',exact:true}).click();
    assert.equal(await p.evaluate(()=>__GAIP_LEARNING_DATA__.course('c2').status),'published');
    // A normal learner cannot use a forged preview URL.
    await p.evaluate(c=>{__GAIP_LEARNING_DATA__.state().courses.push(c);__GAIP_LEARNING_DATA__.setUser('u2');},returned);const denied=await ctx.newPage();await denied.goto('https://gaip.local.test/学习中心.html#/clues?gaip-channel=learning&gaip-preview='+returned.id);
    assert.equal(await denied.locator('.gaip-course-detail-title').count(),0);assert.equal(await denied.locator('[data-lc="preview-course"]').count(),0);await denied.close();
    assert.deepEqual(errors,[]);console.log('PASS first-save branches, explicit required selection, new-window draft preview + no progress writes, published-only learner list, active-only statistics/export, atomic last-lesson guard, real popup UI. Local controller fixture; not full Umi entry.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
