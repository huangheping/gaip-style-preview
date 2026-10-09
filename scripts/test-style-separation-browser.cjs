'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'),output=path.join(root,'outputs/style-separation/20260922');
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],missing=[],results=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('requestfailed',request=>{if(request.url().startsWith('file:'))missing.push(request.url());});
 const open=async file=>page.goto(pathToFileURL(path.join(root,file)).href);
 try{
  await open('channels/clues/index.html');
  await page.locator('#gaip-clue-toolbar').waitFor();
  const clue=await page.locator('#gaip-clue-toolbar').evaluate(el=>({display:getComputedStyle(el).display,gap:getComputedStyle(el).gap,padding:getComputedStyle(el).padding,inline:el.hasAttribute('style'),search:getComputedStyle(el.querySelector('.gaip-clue-search')).width}));
  assert.deepEqual(clue,{display:'flex',gap:'16px',padding:'16px 20px 0px',inline:false,search:'348px'});results.push({clue});
  await page.screenshot({path:path.join(output,'clues.png')});
  await open('channels/learning-center/index.html');
  await page.locator('[data-lc="course"]').first().click();await page.locator('[data-lesson-progress]').first().waitFor();
  const progress=await page.locator('[data-lesson-progress]').evaluateAll(nodes=>nodes.map(n=>({value:Number(n.dataset.lessonProgress),css:parseFloat(getComputedStyle(n).getPropertyValue('--gaip-lesson-progress')),width:n.getBoundingClientRect().width,track:n.parentElement.getBoundingClientRect().width})));
  assert.ok(progress.length);for(const p of progress){assert.equal(p.value,p.css);assert.ok(Math.abs(p.width-p.track*p.value/100)<1);}results.push({progress});
  await open('channels/config-center/index.html');
  await page.locator('[data-config-bulk-import]').click();await page.locator('[data-bulk-node-depth]').first().waitFor();
  const tree=await page.locator('[data-bulk-node-depth]').evaluateAll(nodes=>nodes.map(n=>({value:Number(n.dataset.bulkNodeDepth),css:Number(getComputedStyle(n).getPropertyValue('--bulk-node-depth'))})));
  assert.ok(tree.length);assert.ok(tree.every(n=>n.value===n.css));results.push({tree});
  await page.locator('[data-bulk-close]').first().click();await page.locator('.gaip-bulk-import-dialog').waitFor({state:'detached'});
  await open('channels/workspace/index.html');
  await page.locator('.globalButton___DVYbX').click();
  const modal=page.locator('.agentModal___Nxp06.gaip-agent-sized');await modal.waitFor();
  for(const width of [1440,1000,720]){
   await page.setViewportSize({width,height:1000});
   await page.waitForFunction(()=>document.querySelector('.gaip-agent-sized') && Math.abs(parseFloat(getComputedStyle(document.querySelector('.gaip-agent-sized')).width)-Math.max(720,Math.min(1314,innerWidth-96)))<0.1);
   const size=await modal.evaluate(n=>({width:parseFloat(getComputedStyle(n).width),max:parseFloat(getComputedStyle(n).maxWidth),inline:n.style.width}));
   assert.equal(size.width,Math.max(720,Math.min(1314,width-96)));assert.equal(size.max,size.width);
   results.push({agentViewport:width,size});
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('.gaip-agent-fullscreen-toggle').click();await page.waitForFunction(()=>document.querySelector('.gaip-agent-sized') && Math.abs(parseFloat(getComputedStyle(document.querySelector('.gaip-agent-sized')).width)-(document.querySelector('.gaip-agent-modal-fullscreen')?innerWidth:Math.max(720,Math.min(1314,innerWidth-96))))<0.1);assert.equal(await modal.evaluate(n=>parseFloat(getComputedStyle(n).width)),1440);
  await page.locator('.gaip-agent-fullscreen-toggle').click();await page.waitForFunction(()=>document.querySelector('.gaip-agent-sized') && Math.abs(parseFloat(getComputedStyle(document.querySelector('.gaip-agent-sized')).width)-(document.querySelector('.gaip-agent-modal-fullscreen')?innerWidth:Math.max(720,Math.min(1314,innerWidth-96))))<0.1);assert.equal(await modal.evaluate(n=>parseFloat(getComputedStyle(n).width)),1314);
  await page.screenshot({path:path.join(output,'agent.png')});
  // Minimum state uses the actual delegated control and must release the overlay.
  await page.getByRole('button',{name:'最小化',exact:true}).click();
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-gaip-agent-minimized]')].every(n=>getComputedStyle(n).display==='none'));
  assert.ok(await page.locator('[data-gaip-agent-minimized]').count());
  await page.locator('.globalButton___DVYbX').click();await modal.waitFor();assert.equal(await page.locator('[data-gaip-agent-minimized]').count(),0);
  await open('components/海报分享/index.html');await page.locator('[data-template="compass"]').click();
  await page.waitForFunction(()=>document.querySelector('#poster').dataset.template==='compass');
  assert.equal(await page.locator('#poster').evaluate(n=>getComputedStyle(n).getPropertyValue('--cyan').trim()),'#c89a45');
  await page.locator('[data-template="medal"]').click();await page.waitForFunction(()=>document.querySelector('#poster').dataset.template==='medal');
  assert.equal(await page.locator('#poster').evaluate(n=>getComputedStyle(n).getPropertyValue('--cyan').trim()),'#16c7c1');
  const baseline=JSON.parse(fs.readFileSync(path.join(root,'outputs/standardization/20260922/browser/baseline-errors.json'),'utf8'));
  assert.deepEqual(errors.filter(e=>!baseline.errors.includes(e)),[]);assert.deepEqual(missing,[]);
  fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify({results,errors,missing},null,2));
  console.log('PASS file://: clues CSS, lesson progress, tree depth, AI responsive/fullscreen/minimize/restore and poster themes.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
