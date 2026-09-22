const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});try{
 const p=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 // Isolated real controller, not a full file-page navigation.
 await p.setContent('<div id="root"><header data-gaip-region="app-header"></header><aside class="ant-layout-sider"><ul class="ant-menu-root"></ul></aside><main class="ant-pro-layout-content"></main></div>');
 await p.evaluate(()=>{location.hash='/workspace?gaip-channel=config&gaip-view=organization';});
 for(const f of ['shared/styles/global-filter-bar.css','features/config-center/config-center.css','features/config-center/config-center-content.css','shared/styles/organization-tree.css','shared/styles/global-tabs.css'])await p.addStyleTag({content:read(f)});
 for(const f of ['shared/config/channels.js','shared/scripts/global-tabs.js','shared/scripts/global-modal.js','shared/scripts/organization-store.js','shared/scripts/organization-tree.js','features/config-center/source-markup.js','features/config-center/config-center.js'])await p.evaluate(({s,url})=>{Object.defineProperty(document,'currentScript',{configurable:true,value:{src:url}});window.eval(s);},{s:read(f),url:'file://'+path.join(root,f)});
 // Historical filename retained for existing scripts; organization now uses a dropdown.
 await p.locator('[data-channel-trigger]').waitFor();
 for(let i=0;i<6;i++){
  await p.locator('[data-channel-trigger]').click();
  await p.locator('[data-config-channel="'+i+'"]').click();
  assert.equal(await p.locator('[data-channel-current]').textContent(),await p.evaluate(i=>__GAIP_ORGANIZATION__.channels[i],i));
  assert.equal(await p.locator('[data-channel-panel]').isVisible(),false);
  assert.equal(await p.locator('[data-config-tree] .gaip-org-node').count(),await p.evaluate(i=>__GAIP_ORGANIZATION__.sets[i].length,i));
 }
 await p.locator('[data-channel-trigger]').click();
 await p.locator('[data-channel-search]').fill('Glory');
 assert.equal(await p.locator('[data-config-channel]:visible').count(),1);
 await p.keyboard.press('ArrowDown');await p.keyboard.press('Enter');
 assert.equal(await p.locator('[data-channel-current]').textContent(),'Glory品牌顾问');
 await p.locator('[data-channel-trigger]').click();
 await p.locator('[data-channel-search]').fill('不存在的渠道');
 assert.equal(await p.locator('[data-channel-empty]').isVisible(),true);
 await p.keyboard.press('Escape');
 assert.equal(await p.locator('[data-channel-trigger]').evaluate(n=>n===document.activeElement),true);
 for(const width of [1326,1024,800]){
  await p.setViewportSize({width,height:1000});
  await p.locator('[data-channel-trigger]').click();
  const rect=await p.locator('[data-channel-panel]').boundingBox();
  assert.ok(rect.x>=0&&rect.x+rect.width<=width,'dropdown remains inside viewport');
  await p.keyboard.press('Escape');
 }
 const memberSearch=p.locator('input[aria-label="搜索成员"]');
 await memberSearch.fill('薄荷');
 await p.locator('[data-member-result]').first().click();
 assert.equal(await p.locator('[data-channel-current]').textContent(),'薄荷经纪人');
 assert.equal(await p.locator('tr.is-search-target').count(),1);
 assert.equal(await p.locator('[data-member-results]').isVisible(),false);
 assert.equal(await p.locator('.gaip-organization-sidebar .gaip-channel-picker').count(),1);
 assert.equal(await p.locator('[data-config-bulk-import]').count(),1);
 assert.equal(await p.locator('input[aria-label="搜索成员"]').count(),1);
 assert.deepEqual(errors,[]);console.log('PASS organization channel dropdown: six channels, search, keyboard, responsive overlay and no duplicate controls');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
