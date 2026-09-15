const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const checkTabAnimation=require('./tabs-animation-check.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});try{
 const p=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 // Isolated real controller, not a full file-page navigation.
 await p.setContent('<div id="root"><header data-gaip-region="app-header"></header><aside class="ant-layout-sider"><ul class="ant-menu-root"></ul></aside><main class="ant-pro-layout-content"></main></div>');
 await p.evaluate(()=>{location.hash='/workspace?gaip-channel=config&gaip-view=organization';});
 for(const f of ['features/config-center/config-center.css','features/config-center/config-center-content.css','shared/styles/organization-tree.css','shared/styles/global-tabs.css'])await p.addStyleTag({content:read(f)});
 for(const f of ['shared/config/channels.js','shared/scripts/global-tabs.js','shared/scripts/global-modal.js','shared/scripts/organization-store.js','shared/scripts/organization-tree.js','features/config-center/source-markup.js','features/config-center/config-center.js'])await p.evaluate(({s,url})=>{Object.defineProperty(document,'currentScript',{configurable:true,value:{src:url}});window.eval(s);},{s:read(f),url:'file://'+path.join(root,f)});
 await p.locator('.tabs___U1Hwt[data-gaip-tabs]').waitFor();await p.waitForTimeout(250);
 await checkTabAnimation(p,'.tabs___U1Hwt','[data-config-channel="1"]');
 await checkTabAnimation(p,'.tabs___U1Hwt','[data-config-channel="0"]');
 assert.equal(await p.locator('[data-config-bulk-import]').count(),1);
 assert.equal(await p.locator('input[aria-label="搜索成员"]').count(),1);
 await p.locator('[data-config-channel="0"]').focus();await p.keyboard.press('ArrowRight');
 assert.equal(await p.locator('[data-config-channel="1"]').evaluate(n=>n===document.activeElement),true);
 assert.equal(await p.locator('[data-config-tree] .gaip-org-node').count(),await p.evaluate(()=>__GAIP_ORGANIZATION__.sets[1].length));
 assert.deepEqual(errors,[]);console.log('PASS organization real-controller Tab animation: stable instance, intermediate frames, rapid reversal, keyboard and no duplicate header controls');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
