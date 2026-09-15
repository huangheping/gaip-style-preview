// Isolated real-component/catalog rendering; no live test environment or media.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = path.resolve(__dirname,'..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
function styles(file) {
  return read(file).replace(/url\((['"]?)([^)'"?#]+)(?:[?#][^)'"\s]*)?\1\)/g,(match,q,url)=>{
    if(!url.endsWith('.svg'))return match;
    const asset=path.resolve(root,path.dirname(file),url);
    return fs.existsSync(asset)?'url("data:image/svg+xml;base64,'+fs.readFileSync(asset).toString('base64')+'")':match;
  });
}
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.setContent(read('全局组件/index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<link\b[^>]*>/g,''));
    for(const f of ['web/umi.c6286171.css','shared/styles/global-font.css','shared/styles/global-multi-select.css','shared/styles/organization-tree.css','shared/styles/global-filter-bar.css', 'shared/styles/global-date-picker.css','全局组件/components-preview.css'])await page.addStyleTag({content:styles(f)});
    for(const f of ['shared/scripts/organization-store.js','shared/scripts/organization-tree.js','shared/scripts/global-multi-select.js','shared/scripts/global-date-picker.js', 'shared/scripts/global-filter-bar.js','shared/scripts/global-modal.js','全局组件/components-registry.js','全局组件/components-preview.js'])await page.addScriptTag({content:read(f)});
    await page.locator('[data-component="filter-bar"]').click();
    const scope=page.locator('[data-gaip-filter-demo]'),multi=scope.locator('.gaipMultiSelect'),combo=multi.locator('[role="combobox"]'),reset=scope.locator('[data-gaip-filter-action="reset"]');
    assert.equal(await reset.getAttribute('data-active'),'false');
    const org=scope.locator('[data-filter-key="org"] input[role="combobox"]');
    assert.equal(await org.isVisible(),true,'organization combo is visible without expanding more filters');
    await org.click();await org.fill('华东');
    const tree=scope.locator('.gaip-filter-bar__tree-popup:not([hidden])');
    assert.equal(await tree.locator('input').count(),0,'search happens in the main input, not the dropdown');
    await tree.locator('[data-node-id="1:mock-level-3-east"] .treeNodeName___mtuTp').click();
    assert.match(await org.inputValue(),/华东/);
    assert.equal(await scope.evaluate(n=>window.__GAIP_FILTER_BAR__.get(n).getValues().org),'1:mock-level-3-east');
    await page.locator('[data-filter-demo-visible="org"]').uncheck();assert.equal(await org.isVisible(),false);
    assert.equal(await scope.evaluate(n=>'org' in window.__GAIP_FILTER_BAR__.get(n).getValues()),false);
    await page.locator('[data-filter-demo-visible="org"]').check();assert.equal(await org.inputValue(),'');
    await reset.click();
    await combo.click();const option=multi.locator('[data-value="美国业务"]');await option.click();await page.waitForTimeout(50);
    assert.equal(await combo.getAttribute('aria-expanded'),'true');
    assert.equal(await reset.getAttribute('data-active'),'true');
    assert.deepEqual(await reset.evaluate(el=>({background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color})),{background:'rgb(47, 54, 64)',color:'rgb(255, 255, 255)'});
    await multi.locator('[data-value="总部"]').click();assert.equal(await combo.getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape');assert.equal(await combo.getAttribute('aria-expanded'),'false');
    const single=scope.locator('[data-filter-key="status"] [role="combobox"]');await single.click();
    assert.equal(await scope.locator('.gaip-filter-bar__options').isVisible(),true);
    await scope.locator('.gaip-filter-bar__options [role="option"]').nth(1).click();assert.equal(await single.getAttribute('aria-expanded'),'false');
    await scope.locator('[data-gaip-filter-action="more"]').click();
    const date=scope.locator('[data-filter-key="date"] input[type="text"]');await date.click();
    let calendar=scope.locator('.gaip-filter-bar__calendar:not([hidden])');
    assert.equal(await date.getAttribute('placeholder'),'年/月/日');
    await calendar.getByRole('button',{name:'下个月',exact:true}).click();assert.equal(await calendar.isVisible(),true);
    const day=calendar.locator('[data-date]:not(:disabled):not(.is-outside)').nth(10),value=await day.getAttribute('data-date');await day.click();assert.equal(await date.inputValue(),value.replace(/-/g,'/'));
    await date.hover();await scope.locator('[data-filter-key="date"] .gaip-filter-bar__clear').click();assert.equal(await date.inputValue(),'');
    await date.click();await calendar.getByRole('button',{name:'今天',exact:true}).click();assert.match(await date.inputValue(),/^\d{4}\/\d{2}\/\d{2}$/);
    await date.click();await page.keyboard.press('Escape');assert.equal(await date.getAttribute('aria-expanded'),'false');
    await reset.click();assert.equal(await reset.getAttribute('data-active'),'false');
    assert.notEqual((await reset.evaluate(el=>getComputedStyle(el).backgroundColor)),'rgb(47, 54, 64)');
    // Pointer event + document bubbling must retain the same option and open panel.
    await combo.click();for(let i=0;i<6;i++)await multi.locator('[data-value="香港业务"]').click();assert.equal(await combo.getAttribute('aria-expanded'),'true');
    await page.locator('#filter-bar .componentEntryHeader').click();assert.equal(await combo.getAttribute('aria-expanded'),'false');
    for(const width of [1440,1100,800,480]){
      await page.setViewportSize({width,height:1000});
      const measurements=await scope.evaluate(root=>({
        form:root.querySelector('form').getBoundingClientRect().toJSON(),
        fields:Array.from(root.querySelectorAll('.gaip-filter-bar__field:not([hidden])')).map(e=>e.getBoundingClientRect().toJSON()),
        tags:Array.from(root.querySelectorAll('.gaipMultiSelect__tag-text')).map(e=>({overflow:getComputedStyle(e).textOverflow,client:e.clientWidth,scroll:e.scrollWidth})),
        overflow:document.documentElement.scrollWidth>window.innerWidth
      }));
      assert.equal(measurements.overflow,false,'catalog horizontal overflow at '+width);
      for(const f of measurements.fields)assert.ok(f.right<=measurements.form.right+1 && f.left>=measurements.form.left-1,'field must stay within filter bar');
      assert.ok(measurements.tags.every(t=>t.overflow==='ellipsis'&&t.client>0),'tags retain readable ellipsis box');
      await date.click();const rect=await calendar.boundingBox();assert.ok(rect.x>=0&&rect.x+rect.width<=width+1&&rect.y+rect.height<=1001,'calendar stays in viewport');
      if(process.env.FILTER_SCREENSHOT_DIR && [1440,800].includes(width))await page.screenshot({path:path.join(process.env.FILTER_SCREENSHOT_DIR,'filter-'+width+'.png'),fullPage:true});
      await page.keyboard.press('Escape');
    }
    // Same viewport, different host widths: adaptation follows the filter container.
    await page.setViewportSize({width:2400,height:1000});
    await page.evaluate(()=>{
      const host=document.createElement('div');host.id='filter-width-fixture';document.body.appendChild(host);
      window.__widthFilter=window.__GAIP_FILTER_BAR__.mount(host,{
        actions:{more:true,reset:true},fields:[
          {key:'q',type:'search',label:'课程名称'},
          {key:'s',type:'select',label:'状态',options:['全部','已上架']},
          {key:'g',type:'multiSelect',label:'群组',options:['香港业务','新加坡业务']},
          {key:'d',type:'date',label:'日期'},
          {key:'required',type:'switch',label:'必修属性',text:'只看必修课'},
          {key:'period',type:'dateRange',label:'创建日期',advanced:true},
          {key:'count',type:'numberRange',label:'课节数',advanced:true}
        ]
      });
    });
    const fixture=page.locator('#filter-width-fixture');
    await fixture.locator('[data-gaip-filter-action="more"]').click();
    for(const width of [2200,1440,1000,720,640,480,320]){
      await fixture.evaluate((e,width)=>e.style.width=width+'px',width);
      const m=await fixture.evaluate(host=>{
        const form=host.querySelector('form'),grid=form.querySelector('.gaip-filter-bar__fields'),style=getComputedStyle(form);
        return {overflow:form.scrollWidth>form.clientWidth+1,inner:form.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),gridWidth:grid.getBoundingClientRect().width,
          fields:Array.from(grid.children).filter(e=>!e.hidden).map(e=>({type:e.dataset.type,width:e.getBoundingClientRect().width,inputs:Array.from(e.querySelectorAll('input:not([type="hidden"])')).filter(e=>e.getBoundingClientRect().width).map(e=>e.getBoundingClientRect().width)}))};
      });
      assert.equal(m.overflow,false,'filter host overflow at '+width);
      for(const f of m.fields){
        if(f.type==='switch'){assert.ok(f.width<200,'switch must not fill remaining space');continue;}
        if(m.inner<=640)assert.ok(Math.abs(f.width-m.gridWidth)<1,'narrow container uses full-width rows: '+f.type);
        else assert.ok(f.width<=({search:360,multiSelect:320,dateRange:480,numberRange:480}[f.type]||280)+1,'field width cap: '+f.type);
        if(f.type.endsWith('Range'))assert.ok(Math.abs(f.inputs[0]-f.inputs[1])<1,'range endpoints stay equal');
      }
    }
    // A date range alone must not stretch across a wide empty row.
    await fixture.evaluate(host=>{
      host.style.width='2200px';
      for(const k of ['q','s','g','d','required','count'])window.__widthFilter.setVisible(k,false);
    });
    assert.ok((await fixture.locator('[data-filter-key="period"]').boundingBox()).width<=480);
    await page.evaluate(()=>{window.__widthFilter.destroy();document.querySelector('#filter-width-fixture').remove();});
    assert.deepEqual(errors,[]);
    console.log('PASS Chromium shared catalog: multi/single/date interactions and popup bounds; 320–2200px host width caps, intrinsic switch, equal range endpoints, container wrapping and singleton range. Not live learning-page acceptance.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
