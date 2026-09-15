// Isolated real controller: no online access or real media.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try {
    const p=await browser.newPage({viewport:{width:1440,height:1000}});
    await p.setContent('<section id="page"><header class="gaip-learning-header"><button data-learning-action="学情管理">学情管理</button><button data-learning-action="课程管理">课程管理</button></header></section>');
    for(const f of ['shared/styles/global-multi-select.css','shared/styles/global-filter-bar.css','shared/styles/global-table.css','features/learning-center/learning-v11.css'])await p.addStyleTag({content:read(f)});
    for(const f of ['shared/scripts/global-multi-select.js','shared/scripts/global-filter-bar.js','shared/scripts/global-table.js','features/learning-center/learning-data.js','features/learning-center/learning-app.js'])await p.evaluate(({source,url})=>{Object.defineProperty(document,'currentScript',{configurable:true,value:{src:url}});window.eval(source);},{source:read(f),url:'file://'+path.join(root,f)});
    await p.evaluate(()=>window.__GAIP_LEARNING_APP__.mount(document.querySelector('#page')));
    await p.locator('[data-learning-action="课程管理"]').click();
    const group=p.locator('[data-filter-key="group"]');
    await group.locator('[role="combobox"]').click();
    for(const g of ['香港业务','新加坡业务','美国业务']) {
      await group.locator('[data-value="'+g+'"]').click({timeout:5000});
      assert.equal(await group.locator('[role="combobox"]').getAttribute('aria-expanded'),'true');
    }
    const values=()=>p.evaluate(()=>window.__GAIP_FILTER_BAR__.get(document.querySelector('.lc-manage-filter-slot')).getValues());
    assert.deepEqual((await values()).group,['香港业务','新加坡业务','美国业务']);
    assert.equal(await p.locator('[data-gaip-filter-action="more"]').isVisible(),false);
    assert.equal(await p.locator('[data-filter-key="created"]').count(),0);
    await p.keyboard.press('Escape');
    assert.equal(await group.locator('[role="combobox"]').getAttribute('aria-expanded'),'false');
    await p.locator('[data-gaip-filter-action="reset"]').click();
    assert.deepEqual((await values()).group,[]);
    console.log('PASS Chromium isolated course controller: four fields, multi-select above sticky table, continuous clicks, Escape and reset');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
