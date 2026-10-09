'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/table-tags');fs.mkdirSync(out,{recursive:true});
const palette={highlight:['rgb(128, 91, 13)','rgb(244, 214, 124)'],identity:['rgb(98, 92, 85)','rgb(241, 238, 234)'],neutral:['rgb(98, 107, 117)','rgb(240, 241, 242)'],info:['rgb(36, 93, 204)','rgb(232, 240, 255)'],success:['rgb(8, 123, 99)','rgb(223, 245, 236)'],warning:['rgb(153, 88, 0)','rgb(255, 240, 213)'],danger:['rgb(189, 48, 67)','rgb(255, 232, 236)']};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});const results=[],errors=[],missing=[];
const page=await browser.newPage({viewport:{width:1440,height:980}});page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>{if(r.url().startsWith('file:'))missing.push(r.url());});
async function open(file,query=''){await page.goto(pathToFileURL(path.join(root,file)).href+query,{waitUntil:'domcontentloaded'});}
async function check(name,selector='td [data-gaip-table-tag]'){
 await page.locator(selector).first().waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(100);
 const tags=await page.locator(selector).evaluateAll(nodes=>nodes.filter(n=>n.getBoundingClientRect().height).map(n=>{const s=getComputedStyle(n);return {text:n.textContent.trim(),tone:n.dataset.gaipTableTag,variant:n.dataset.gaipTableTagVariant,color:s.color,bg:s.backgroundColor,font:s.fontSize,height:n.getBoundingClientRect().height,padding:s.paddingLeft,radius:s.borderRadius,children:[...n.querySelectorAll('span')].map(c=>getComputedStyle(c).fontSize)};}));
 assert.ok(tags.length,name+' has visible tags');
 for(const t of tags){assert.equal(t.height,20,name+' '+t.text+' height');assert.equal(t.font,'12px',name+' '+t.text+' font');assert.ok(t.children.every(x=>x==='12px'),name+' nested text');if(t.tone==='empty'){assert.equal(t.bg,'rgba(0, 0, 0, 0)');assert.equal(t.padding,'0px');}else{assert.deepEqual([t.color,t.bg],t.variant==='solid'&&t.tone==='neutral'?['rgb(255, 255, 255)','rgb(98, 107, 117)']:t.variant==='solid'&&t.tone==='identity'?['rgb(255, 255, 255)','rgb(98, 92, 85)']:t.variant==='solid'&&t.tone==='danger'?['rgb(255, 255, 255)','rgb(189, 48, 67)']:palette[t.tone],name+' '+t.text);assert.equal(t.padding,'8px');assert.equal(t.radius,'3px');}}
 const iconLabels=['持牌','财富传承','资产配置','保险规划','税务规划','身份规划','子女教育','预警','失败','解析失败','创建失败','待分配','待跟进','跟进中','待提交','待核对','未学习','学习中','已完成'];
 const icons=await page.locator(selector).evaluateAll(nodes=>nodes.filter(n=>n.getBoundingClientRect().height).map(n=>({text:n.textContent.trim(),color:getComputedStyle(n).color,gap:getComputedStyle(n).columnGap,icons:[...n.querySelectorAll('svg[data-gaip-table-tag-icon]')].map(svg=>({width:svg.getBoundingClientRect().width,height:svg.getBoundingClientRect().height,paint:svg.getAttribute('fill')==='currentColor'?getComputedStyle(svg).fill:getComputedStyle(svg).stroke,hidden:svg.getAttribute('aria-hidden')})),visibleImages:[...n.querySelectorAll('img')].filter(img=>img.getBoundingClientRect().width).length})));
 for(const tag of icons)if(iconLabels.includes(tag.text)){assert.equal(tag.icons.length,1,name+' single icon '+tag.text);assert.equal(tag.visibleImages,0,name+' no duplicate bitmap');assert.equal(tag.gap,'4px');assert.deepEqual(tag.icons[0],{width:12,height:12,paint:tag.color,hidden:'true'});}
 results.push({name,count:tags.length,labels:[...new Set(tags.map(t=>t.text))]});
}
try{
 await open('components/index.html','?component=table-tags');await check('categorized preview','.tagCatalog__group [data-gaip-table-tag]');
 assert.equal(await page.locator('.tagCatalog__group').count(),30);assert.equal(await page.locator('.tagCatalog__group [data-gaip-table-tag]').count(),105);
 assert.equal(await page.locator('.tagCatalog__group [data-gaip-table-tag-variant="solid"]').count(),3);
 assert.deepEqual(await page.locator('[data-tag-filter]').evaluateAll(ns=>ns.map(n=>n.dataset.tagFilter).sort()),['','danger','highlight','identity','info','neutral','success','warning'],'全部 + 七种颜色筛选');
 await page.screenshot({path:path.join(out,'catalog.png'),fullPage:true});
 await page.locator('[data-tag-filter="identity"]').click();assert.equal(await page.locator('.tagCatalog__group [data-gaip-table-tag]:visible').count(),9);
 await page.locator('[data-tag-search]').fill('佣金');assert.equal(await page.locator('.tagCatalog__group [data-gaip-table-tag]:visible').count(),1);
 await page.locator('[data-tag-search]').fill('');await page.locator('[data-tag-filter=""]').click();
 await page.locator('[data-tag-filter="danger"]').click();assert.equal(await page.locator('.tagCatalog__group [data-gaip-table-tag]:visible').count(),9);
 await page.locator('[data-tag-search]').fill('删除');assert.equal(await page.locator('.tagCatalog__group [data-gaip-table-tag]:visible').count(),5);
 await page.locator('[data-tag-search]').fill('不存在的标签');assert.equal(await page.locator('[data-tag-empty]').isVisible(),true);
 await page.locator('[data-tag-filter=""]').click();await page.locator('[data-tag-search]').fill('持牌身份');assert.equal(await page.locator('.tagCatalog__group [data-gaip-table-tag]:visible').count(),6);
 await page.locator('[data-tag-search]').press('Escape');assert.equal(await page.locator('.tagCatalog__group [data-gaip-table-tag]:visible').count(),105);
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:path.join(out,'catalog-mobile.png'),fullPage:true});await page.setViewportSize({width:1440,height:980});
 for(const name of ['clues','activity']){await open('channels/'+name+'/index.html');await check(name);await page.screenshot({path:path.join(out,name+'.png')});}
 await open('channels/config-center/index.html');await check('organization');assert.ok(await page.locator('td [data-gaip-table-tag="identity"]').count()>0,'real organization roles use identity tone');const session=await page.locator('html').getAttribute('data-gaip-document-session');await page.screenshot({path:path.join(out,'organization.png')});
 await page.locator('[data-config-log]').click();await check('organization log','.gaip-organization-log-dialog td [data-gaip-table-tag]');await page.locator('[data-organization-log-next]').click();await check('organization log page 2','.gaip-organization-log-dialog td [data-gaip-table-tag]');await page.locator('[data-organization-log-close]').click();
 await page.locator('a[data-config-view="announcement-management"]').click();await check('announcement');
 await page.locator('[data-wealth-menu-toggle]').click();await page.locator('[data-wealth-view="import-workbench"] a').click();await check('wealth workbench');
 await page.locator('[data-wealth-view="import-records"] a').click();await check('wealth import records');
 assert.equal(await page.locator('html').getAttribute('data-gaip-document-session'),session,'cross-channel navigation does not reload');
 await page.locator('[data-gaip-channel="learning"] a').click();await page.getByRole('button',{name:'课程管理',exact:true}).click();await check('course management');
 await page.locator('[data-lc="logs"]').click();await check('course and live log','dialog[open] td [data-gaip-table-tag]');await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'返回学习中心',exact:true}).click();await page.getByRole('button',{name:'直播管理',exact:true}).click();await check('live management');
 await page.locator('[data-live-back]').click();await page.getByRole('button',{name:'学情管理',exact:true}).click();await page.locator('[data-lc="stats-detail"]').first().click();await check('learning status detail','dialog[open] td [data-gaip-table-tag]');await page.keyboard.press('Escape');
 await open('components/弹窗预览.html','?embed=operation-log');await check('isolated shared log preview');
 // Existing file:// WebGL limitation also recorded by the previous real-entry acceptance.
 const known="Failed to execute 'texImage2D' on 'WebGL2RenderingContext': The image element contains cross-origin data, and may not be loaded.";
 assert.deepEqual(errors.filter(e=>e!==known),[]);assert.deepEqual(missing,[]);
 console.log('PASS file browser: categorized tags, search/color/empty/reset/mobile; actual tables and logs, pagination, cross-channel session and isolated preview.');
}finally{fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({browser:browser.version(),results,errors,missing},null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
