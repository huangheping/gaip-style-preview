const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const previewDir = path.join(root, 'components');
const html = fs.readFileSync(path.join(previewDir, 'index.html'), 'utf8');
// DOM-only test: no resource loader, network, or browser navigation.
const dom = new JSDOM(html, { url: 'https://preview.invalid/components/index.html', runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window;
w.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
try {
  for (const script of w.document.querySelectorAll('script[src]')) {
    const file = path.resolve(previewDir, script.getAttribute('src').split('?')[0]);
    w.eval(fs.readFileSync(file, 'utf8'));
  }
  const doc = w.document;
  const iconCatalog=doc.querySelector('[data-icon-catalog]'),iconData=w.__GAIP_ICON_CATALOG_DATA__;
  const iconTemplates=require('./build-markup-templates.cjs').readTemplates(fs.readFileSync(path.join(previewDir,'icons/templates/markup-icon-assets.html'),'utf8'));
  const geometry=svg=>[svg,...svg.querySelectorAll('*')].map(n=>[n.localName,[...n.attributes].filter(a=>['viewBox','d','points','x','y','x1','x2','y1','y2','cx','cy','r','rx','ry','width','height','fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','fill-rule','transform','opacity'].includes(a.name)).map(a=>[a.name,a.value.replace(/icon-preview-\d+-/g,'')])]);
  assert.ok(iconCatalog&&iconData.items.length>0,'图标入口加载真实盘点数据');
  const cards=()=>[...iconCatalog.querySelectorAll('[data-icon-id]')];
  assert.equal(cards().length,iconData.items.length,'初始排列覆盖盘点清单');
  assert.equal(new Set(iconData.items.map(i=>i.id)).size,iconData.items.length,'重复图形合并');
  assert.equal(iconData.pending.length,0,'当前有限动态模板均展开，不能默默略过');
  for(const item of iconData.items){
    assert.ok(item.sources.length&&item.aliases.length,'每个图标有来源和标识');
    for(const source of item.sources)assert.ok(fs.existsSync(path.join(root,source.file)),source.file);
    if(item.asset)assert.ok(fs.existsSync(path.join(root,item.asset)),item.asset);
    const card=cards().find(c=>c.dataset.iconId===item.id);
    assert.equal(card.querySelector('[data-icon-review]').textContent,(item.mergedCodes?.length||item.mergedLabels?.length)?'已合并':'待评审');
    assert.equal(card.querySelectorAll('[data-icon-size] > *').length,1,'每张卡片只展示一个真实图形');
    if(!item.sizes.length)assert.match(card.querySelector('[data-icon-size-detail]').textContent,/尚未确认/);
    assert.deepEqual([...card.querySelectorAll('[data-icon-size]')].map(n=>Number(n.dataset.iconSize)),[20]);
    if(item.asset&&!item.template)assert.equal(card.querySelector('img').getAttribute('src'),'../'+item.asset);
    if(item.template&&item.format!=='CSS 绘制'){
      const expected=doc.createElement('template');expected.innerHTML=iconTemplates[item.template];
      if(item.actualViewBox)expected.content.firstElementChild.setAttribute('viewBox',item.actualViewBox);
      for(const svg of card.querySelectorAll('[data-icon-size] > svg'))assert.deepEqual(geometry(svg),geometry(expected.content.firstElementChild),'单尺寸保留显示窗口、路径、描边和固定色');
    }
    if(item.format==='CSS 绘制')assert.ok(card.querySelector('.iconCatalog__cssGlyph'),'CSS片段复用原组件类');
  }
  const svgIds=[...iconCatalog.querySelectorAll('svg[id],svg [id]')].map(n=>n.id);
  assert.equal(new Set(svgIds).size,svgIds.length,'不同图标克隆不重复渐变/路径ID');
  assert.ok(iconData.items.some(i=>i.sources.length>1),'合并后保留多个来源');
  const numbered=iconData.items.filter(i=>i.reviewCode);
  assert.ok(numbered.length>0);
  assert.equal(new Set(numbered.map(i=>i.reviewCode)).size,numbered.length,'评审编号唯一');
  const sequenceRegistry=JSON.parse(fs.readFileSync(path.join(previewDir,'icons/icon-review-sequences.json'),'utf8'));
  const sequenceById=new Map(numbered.map(i=>[i.id,i.reviewCode]));
  for(const item of iconData.items){
    const card=cards().find(c=>c.dataset.iconId===item.id);
    assert.equal(card.querySelector('[data-icon-sequence]').hidden,!item.reviewCode);
    if(item.variants.length>1)assert.ok(item.reviewCode,'所有同用途版本都可用编号指定');
    if(item.reviewCode){
      const group=sequenceRegistry.groups.find(g=>g.meaning===item.meaning);
      assert.equal(item.reviewCode,String(group.number).padStart(2,'0')+'-'+(group.versions.indexOf(item.id)+1),'编号来自持久登记');
      assert.equal(card.querySelector('[data-icon-sequence-code]').textContent,item.reviewCode);
    }
  }
  const iconSearch=iconCatalog.querySelector('[data-icon-search]');
  iconSearch.value=numbered[0].reviewCode;iconSearch.dispatchEvent(new w.Event('input'));
  assert.equal(cards().length,1,'完整编号精确定位一个版本');
  assert.equal(cards()[0].dataset.iconId,numbered[0].id,'按编号找到对应图标');
  assert.ok(cards().every(c=>c.querySelector('[data-icon-sequence-code]').textContent===sequenceById.get(c.dataset.iconId)),'编号筛选不重排');
  iconCatalog.querySelector('[data-icon-reset]').click();
  for(const item of iconData.items.filter(i=>i.mergedCodes?.length)){
    iconSearch.value=item.mergedCodes[0];iconSearch.dispatchEvent(new w.Event('input'));
    assert.equal(cards().length,1,'被合并编号只定位保留版本');
    assert.equal(cards()[0].dataset.iconSequence,item.reviewCode,'旧号保留重定向关系');
    assert.match(cards()[0].querySelector('[data-icon-merged]').textContent,new RegExp(item.mergedCodes[0]),'卡片可追溯被合并编号');
  }
  iconCatalog.querySelector('[data-icon-reset]').click();
  for(const item of iconData.items.filter(i=>i.mergedLabels?.length)){
    iconSearch.value=item.mergedLabels[0];iconSearch.dispatchEvent(new w.Event('input'));
    assert.equal(cards().length,1,'旧CSS名称只定位保留图形');
    assert.equal(cards()[0].dataset.iconId,item.id);
    assert.match(cards()[0].querySelector('[data-icon-merged]').textContent,new RegExp(item.mergedLabels[0]));
  }
  iconCatalog.querySelector('[data-icon-reset]').click();
  iconSearch.value='财富值中心';iconSearch.dispatchEvent(new w.Event('input'));
  assert.ok(cards().length>0&&cards().length<iconData.items.length,'按来源频道筛选');
  iconSearch.value='没有此图标';iconSearch.dispatchEvent(new w.Event('input'));
  assert.equal(cards().length,0);assert.equal(iconCatalog.querySelector('[data-icon-empty]').hidden,false);
  iconSearch.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));
  assert.equal(cards().length,iconData.items.length);
  const unknownSize=iconCatalog.querySelector('[data-icon-unknown-size]');
  unknownSize.checked=true;unknownSize.dispatchEvent(new w.Event('change'));
  assert.equal(cards().length,iconData.stats.unconfirmedSizes);
  iconCatalog.querySelector('[data-icon-reset]').click();
  const variants=cards().find(c=>!c.querySelector('[data-icon-variant]').hidden);
  assert.ok(variants,'同用途保留不同图形供比较');
  const meaning=iconData.items.find(i=>i.id===variants.dataset.iconId).meaning;
  variants.querySelector('[data-icon-variant]').click();
  assert.equal(iconSearch.value,meaning);assert.ok(cards().length>1);
  assert.ok(cards().every(c=>iconData.items.find(i=>i.id===c.dataset.iconId).variants.length>1));
  assert.ok(cards().every(c=>c.dataset.iconSequence===sequenceById.get(c.dataset.iconId)),'切换到同用途排列后原编号保持');
  const remountHost=doc.createElement('div');remountHost.innerHTML=w.__GAIP_ICON_CATALOG__.render();w.__GAIP_ICON_CATALOG__.mount(remountHost.querySelector('[data-icon-catalog]'));
  assert.ok([...remountHost.querySelectorAll('[data-icon-sequence-code]')].filter(n=>n.textContent).every(n=>n.textContent===sequenceById.get(n.closest('[data-icon-id]').dataset.iconId)),'重新挂载保留编号');
  iconCatalog.querySelector('[data-icon-view="standard"]').click();
  assert.equal(cards().length,0);assert.equal(iconCatalog.querySelector('[data-icon-standard-empty]').hidden,false);
  assert.match(iconCatalog.querySelector('[data-icon-count]').textContent,/尚未定稿/);
  iconCatalog.querySelector('[data-icon-view="inventory"]').click();iconCatalog.querySelector('[data-icon-reset]').click();
  assert.equal(cards().length,iconData.items.length);
  const category=iconCatalog.querySelector('[data-icon-category]');category.value='导航';category.dispatchEvent(new w.Event('change'));
  assert.ok(cards().length>0&&cards().every(c=>iconData.items.find(i=>i.id===c.dataset.iconId).category==='导航'));
  iconCatalog.querySelector('[data-icon-reset]').click();
  assert.equal(new Set([...doc.querySelectorAll('[data-tag-items] svg[data-gaip-table-tag-icon]')].map(svg => svg.parentElement.textContent)).size,19,'来源预览保留19个带图标文案');
  const tagCatalog = doc.querySelector('[data-tag-catalog]');
  assert.equal(tagCatalog.querySelectorAll('[data-tag-channel]').length,5,'按5个实际频道分组');
  assert.equal(tagCatalog.querySelectorAll('[data-tag-page]').length,18,'展示18个表格场景');
  assert.equal(tagCatalog.querySelectorAll('[data-tag-field]').length,30,'保留30处字段来源');
  assert.equal(tagCatalog.querySelectorAll('[data-tag-items] [data-gaip-table-tag]').length,105,'同文案按实际字段重复展示');
  assert.equal(tagCatalog.querySelectorAll('.tagSpec__metrics dd').length,8,'尺寸说明包含8项规格');
  const combinations=tagCatalog.querySelector('[data-tag-combination-table]');
  assert.equal(combinations.querySelectorAll('.gaip-table__table tbody tr').length,3,'真实共享表格包含3行组合示例');
  assert.equal(combinations.querySelectorAll('[data-gaip-table-tag-group]').length,6,'每行宽窄两组标签');
  assert.equal(combinations.querySelectorAll('.tagSpec__narrow').length,3);
  assert.equal(tagCatalog.querySelectorAll('[data-tag-items][data-gaip-table-tag-group]').length,30,'来源分类复用标签组');
  assert.equal(tagCatalog.querySelector('[data-tag-audiences]'),null,'移除观看者筛选');
  const style = doc.createElement('style');
  style.textContent = fs.readFileSync(path.join(previewDir, 'table/global-table.css'), 'utf8') + fs.readFileSync(path.join(previewDir, 'status-tag/global-status-tag.css'), 'utf8') + fs.readFileSync(path.join(previewDir, 'components-preview.css'), 'utf8');
  doc.head.appendChild(style);
  const statusEntry = doc.getElementById('status-tags');
  const statusTags = [...statusEntry.querySelectorAll('[data-gaip-status-tag]')];
  assert.deepEqual(statusTags.map(node => node.dataset.gaipStatusTag), ['success', 'warning'], '状态标签目录只展示已接入的两种语义');
  assert.deepEqual(statusTags.map(node => node.textContent), ['已归属', '待确认客户归属'], '状态标签目录只展示方案归属状态');
  for (const statusTag of statusTags) {
    const statusStyle = w.getComputedStyle(statusTag);
    assert.equal(statusStyle.height, '24px');
    assert.equal(statusStyle.fontSize, '12px');
    assert.equal(statusStyle.paddingLeft, '10px');
    assert.equal(statusStyle.paddingRight, '10px');
    assert.equal(statusStyle.borderRadius, '12px');
  }
  assert.equal(doc.querySelector('.catalogSummary'), null, '重复概览应从DOM移除');
  assert.doesNotMatch(html, /summaryComponentCount|summaryUsageCount|组件数量|当前使用位置|组件来源/);
  const tabs = [...doc.querySelectorAll('.catalogNavItem[role="tab"]')];
  assert.equal(tabs.length, w.__GAIP_GLOBAL_COMPONENTS__.length, '保留所有已登记组件');
  for (const tab of tabs) {
    tab.click();
    const entry = doc.getElementById(tab.getAttribute('aria-controls'));
    assert.equal(doc.querySelectorAll('.componentEntry:not([hidden])').length, 1);
    assert.equal(entry.hidden, false);
    assert.equal(tab.getAttribute('aria-selected'), 'true');
    assert.equal(new URL(w.location.href).searchParams.get('component'), entry.id);
    assert.equal(entry.querySelectorAll('.componentPreviewSurface').length, entry.id === 'uploads' ? 12 : entry.id === 'underline-tabs' ? 2 : 1, entry.id + ' 每组示例有独立预览卡片');
    const surface = entry.querySelector('.componentPreviewSurface');
    assert.equal(w.getComputedStyle(surface).backgroundColor, 'rgb(255, 255, 255)');
    assert.equal(w.getComputedStyle(entry).backgroundColor, 'rgba(0, 0, 0, 0)');
    assert.equal(w.getComputedStyle(surface).overflow, 'visible', '目录展示卡片不裁切组件下拉面板');
    for (const node of entry.querySelectorAll('.componentEntryHeader, .componentDetails, .componentEntryFooter, .filterDemo__note, .filterDemo__toggles, .filterDemo__values, .tableDemo__scenarios, .tableDemo__note, .tableDemo__feedback, .modalCatalogMetrics, [data-frame-restore]')) {
      assert.equal(node.closest('.componentPreviewSurface'), null, '说明及配置必须位于白卡外：' + node.className);
    }
  }
  const usageLinks = [...doc.querySelectorAll('#global-table .componentUsageLink')];
  assert.equal(usageLinks.length, 12, 'each table location has its own page or source-modal link');
  for (const link of usageLinks) {
    const url = new URL(link.getAttribute('href'), 'https://preview.invalid/components/index.html');
    assert.ok(fs.existsSync(path.join(root, decodeURIComponent(url.pathname))), url.pathname);
    assert.ok(link.getAttribute('aria-label').includes(link.textContent));
    if (url.searchParams.has('embed')) {
      const entry = w.__GAIP_MODAL_SOURCE_CATALOG__.ready.find(item => item.id === url.searchParams.get('embed'));
      assert.ok(entry && entry.category === 'information', 'link targets an existing information modal');
    }
    if (link.target === '_blank') assert.ok(link.rel.includes('noopener'));
  }
  // Provenance coverage and tooltip lifecycle; geometry below is a DOM stub, not visual QA.
  tabs.find(tab => tab.dataset.component === 'table-tags').click();
  const labels = [...tagCatalog.querySelectorAll('[data-tag-source]')];
  const sourceMap = w.__GAIP_TABLE_TAG_SOURCES__;
  assert.deepEqual(Object.keys(sourceMap).sort(), [...new Set(labels.map(node => node.textContent))].sort());
  for (const label of labels) {
    assert.equal(label.tabIndex, 0);
    assert.equal(label.hasAttribute('title'), false, '不用系统默认title提示');
    for (const source of sourceMap[label.textContent]) {
      assert.ok(source.channel && source.page && source.field);
      assert.ok(fs.existsSync(path.join(root, source.source)), source.source);
    }
  }
  for (const location of w.__GAIP_TABLE_TAG_LOCATIONS__) {
    const channel = [...tagCatalog.querySelectorAll('[data-tag-channel]')].find(node => node.dataset.tagChannel === location.channel);
    const page = [...channel.querySelectorAll('[data-tag-page]')].find(node => node.dataset.tagPage === location.page);
    const field = [...page.querySelectorAll('[data-tag-field]')].find(node => node.dataset.tagField === location.field);
    assert.equal(channel.querySelector('h3').textContent,location.channel);
    assert.equal(page.querySelector('h4').textContent,location.page);
    assert.equal(field.querySelector('h5').textContent,location.field);
    assert.deepEqual([...field.querySelectorAll('[data-tag-source]')].map(node => node.textContent),Array.from(location.labels));
    for (const label of field.querySelectorAll('[data-tag-source]')) {
      const reference=w.__GAIP_TABLE_TAG__.create(label.textContent);
      assert.equal(label.dataset.gaipTableTag,reference.dataset.gaipTableTag);
      assert.equal(label.dataset.gaipTableTagVariant,reference.dataset.gaipTableTagVariant);
      assert.equal(label.querySelector('svg')?.outerHTML,reference.querySelector('svg')?.outerHTML);
    }
  }
  const scenarioSearch=tagCatalog.querySelector('[data-tag-search]');
  const visible = selector => [...tagCatalog.querySelectorAll(selector)].filter(node => !node.closest('[hidden]'));
  scenarioSearch.value='线索中心';scenarioSearch.dispatchEvent(new w.Event('input'));
  assert.equal(visible('[data-tag-channel]').length,1);
  assert.equal(visible('[data-tag-page]').length,1);
  assert.equal(visible('[data-tag-source]').length,14);
  tagCatalog.querySelector('[data-tag-filter="warning"]').click();
  assert.deepEqual(visible('[data-tag-source]').map(node=>node.textContent),['待分配','待跟进']);
  assert.equal(visible('[data-tag-field]').length,1,'隐藏无匹配字段及空页面');
  scenarioSearch.value='没有此来源';scenarioSearch.dispatchEvent(new w.Event('input'));
  assert.equal(visible('[data-tag-channel]').length,0);
  assert.equal(tagCatalog.querySelector('[data-tag-empty]').hidden,false);
  scenarioSearch.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert.equal(scenarioSearch.value,'');
  tagCatalog.querySelector('[data-tag-filter=""]').click();
  assert.equal(visible('[data-tag-source]').length,105);
  assert.match(tagCatalog.querySelector('[data-tag-count]').textContent,/5 个频道 · 18 张表格 · 74 \/ 74 个文案/);
  assert.equal(tagCatalog.querySelector('[data-tag-filter=""] [data-tag-filter-count]').textContent,'74','颜色数量按唯一文案统计');
  const recommendation = tagCatalog.querySelector('[data-color-rule="highlight"]');
  assert.equal(recommendation.querySelector('[data-color-examples] [data-gaip-table-tag]').dataset.gaipTableTag, 'highlight');
  tagCatalog.querySelector('[data-tag-filter="highlight"]').click();
  assert.ok(visible('[data-tag-source]').length > 0);
  assert.ok(visible('[data-tag-source]').every(node => node.textContent === '精选'), '推荐色只筛出精选来源实例');
  assert.equal(tagCatalog.querySelector('[data-tag-filter="highlight"] [data-tag-filter-count]').textContent, '1');
  tagCatalog.querySelector('[data-tag-filter=""]').click();
  const tip = doc.getElementById('table-tag-source-tooltip');
  assert.equal(doc.querySelectorAll('.tagSourceTooltip').length, 1);
  assert.equal(tip.hidden, true);
  const offline = labels.find(node => node.textContent === '已下架');
  offline.getBoundingClientRect = () => ({left:1000,top:740,bottom:760});
  tip.getBoundingClientRect = () => ({width:340,height:320});
  offline.focus();
  assert.equal(tip.hidden, false);
  assert.equal(offline.getAttribute('aria-describedby'), tip.id);
  assert.equal(tip.querySelectorAll('li').length, 5, '已下架分别列出公告、课程、直播、统计及详情');
  assert.match(tip.textContent, /公告管理.*字段：状态/);
  assert.match(tip.textContent, /Banner.*字段：Banner 状态/);
  assert.ok(parseFloat(tip.style.left) + 340 <= w.innerWidth - 12);
  assert.ok(parseFloat(tip.style.top) + 320 < 740, '底部空间不足时向上避让');
  offline.dispatchEvent(new w.KeyboardEvent('keydown', {key:'Escape',bubbles:true}));
  assert.equal(tip.hidden, true);
  assert.equal(offline.hasAttribute('aria-describedby'), false);
  offline.blur();
  const realTimeout = w.setTimeout, realClearTimeout = w.clearTimeout;
  const pending = new Map(); let timerId = 0;
  w.setTimeout = (fn, ms) => {pending.set(++timerId,{fn,ms});return timerId;};
  w.clearTimeout = id => pending.delete(id);
  const runTimer = ms => {
    const entry = [...pending].find(([,task]) => task.ms === ms);
    assert.ok(entry, '存在 ' + ms + 'ms 计时器'); pending.delete(entry[0]);entry[1].fn();
  };
  const clue = labels.find(node => node.textContent === '待跟进');
  clue.dispatchEvent(new w.MouseEvent('mouseenter'));
  assert.equal(tip.hidden,true,'快速掠过时不立即弹出');
  runTimer(250);
  assert.match(tip.textContent,/线索中心 → 线索列表字段：状态/);
  clue.dispatchEvent(new w.MouseEvent('mouseleave'));
  tip.dispatchEvent(new w.MouseEvent('mouseenter'));
  assert.equal(pending.size,0,'移入浮层时保持可读');
  assert.equal(tip.hidden,false);
  tip.dispatchEvent(new w.MouseEvent('mouseleave'));runTimer(150);
  assert.equal(tip.hidden,true);
  clue.dispatchEvent(new w.MouseEvent('mouseenter'));
  w.dispatchEvent(new w.Event('resize'));
  assert.equal(pending.size,0,'关闭同时取消尚未触发的悬停');
  w.setTimeout=realTimeout;w.clearTimeout=realClearTimeout;
  clue.focus();
  const search = tagCatalog.querySelector('[data-tag-search]');
  search.value='不存在的标签';search.dispatchEvent(new w.Event('input'));
  assert.equal(tip.hidden,true,'过滤时清理浮层');
  search.value='';search.dispatchEvent(new w.Event('input'));
  offline.focus();tabs[0].click();assert.equal(tip.hidden,true,'切换组件关闭浮层');
  assert.equal(w.__GAIP_TABLE_TAG__.create('待跟进').hasAttribute('tabindex'),false,'业务标签不新增焦点');
  for (const selector of ['[data-gaip-tabs-demo]', '[data-gaip-tabs-count-demo]', '[data-gaip-table-demo]', '[data-gaip-filter-demo]', '[data-gaip-date-demo]', '[data-gaip-multi-select-demo]', '.catalogFormFrame']) {
    const host = doc.querySelector(selector);
    assert.ok(host.closest('.componentPreviewSurface'), selector + ' 位于白卡内');
    assert.ok(host.children.length, selector + ' 已挂载真实组件');
  }
  const sharedTabs = doc.querySelector('[data-gaip-tabs-demo]');
  assert.equal(doc.querySelector('[data-gaip-tabs-demo-status]').closest('.componentPreviewSurface'), null, 'Tab状态文字在白卡外');
  assert.equal(doc.querySelector('.tabsDemo__help').closest('.componentPreviewSurface'), null, '键盘说明在白卡外');
  assert.notEqual(sharedTabs.closest('.componentPreviewSurface'), doc.querySelector('[data-gaip-tabs-count-demo]').closest('.componentPreviewSurface'));
  sharedTabs.children[1].click();
  assert.equal(sharedTabs.children[1].getAttribute('aria-selected'), 'true');
  assert.equal(doc.querySelector('[data-gaip-tabs-demo-status]').textContent, '当前：课程学习统计');
  assert.ok(doc.querySelector('[data-gaip-tabs-count-demo] button:disabled'));
  for (const scenario of doc.querySelectorAll('[data-table-demo]')) {
    scenario.click();
    assert.equal(scenario.getAttribute('aria-pressed'), 'true', '卡片外的场景切换仍可用');
    assert.ok(doc.querySelector('[data-gaip-table-demo]').children.length);
  }
  // Shared menu exercised through preview-only actions. Rectangles are stubs; this does not validate native top-layer layout.
  tabs.find(tab => tab.dataset.component === 'global-table').click();
  doc.querySelector('[data-table-demo="short"]').click();
  const actionRoot = doc.querySelector('[data-gaip-table-demo]');
  const actionPanel = doc.querySelector('[data-table-action-panel]');
  const moreButtons = [...actionRoot.querySelectorAll('.tableDemo__more')];
  assert.equal(moreButtons.length, 3);
  assert.ok(moreButtons.every(button=>button.textContent==='更多'));
  assert.equal(actionPanel.getAttribute('aria-orientation'),'vertical');
  assert.equal(w.getComputedStyle(actionPanel).flexDirection,'column');
  assert.equal(w.getComputedStyle(actionPanel.querySelector('button')).textAlign,'left');
  assert.equal(actionPanel.parentElement, doc.body, '浮层脱离表格裁切容器');
  assert.equal(actionPanel.hidden, true);
  const actionItems = [...actionPanel.querySelectorAll('[role="menuitem"]')];
  actionPanel.getBoundingClientRect = () => ({width:144,height:114});
  moreButtons[0].getBoundingClientRect = () => ({left:970,right:1002,top:740,bottom:772});
  moreButtons[0].dispatchEvent(new w.MouseEvent('mouseenter'));
  assert.equal(actionPanel.hidden,true,'悬停不会打开');
  moreButtons[0].click();
  assert.equal(actionPanel.hidden,false);
  assert.equal(doc.activeElement, actionItems[0]);
  assert.equal(moreButtons[0].getAttribute('aria-expanded'),'true');
  assert.ok(parseFloat(actionPanel.style.left)+144 <= w.innerWidth-12);
  assert.ok(parseFloat(actionPanel.style.top)+114 < 740,'底部向上避让');
  actionPanel.dispatchEvent(new w.MouseEvent('mouseleave'));
  assert.equal(actionPanel.hidden,false,'鼠标移开保持展开');
  moreButtons[1].click();
  assert.equal(moreButtons[0].getAttribute('aria-expanded'),'false');
  assert.equal(moreButtons[1].getAttribute('aria-expanded'),'true');
  assert.equal(doc.querySelectorAll('.tableActionPreview:not([hidden])').length,1);
  actionItems[0].dispatchEvent(new w.KeyboardEvent('keydown',{key:'End',bubbles:true}));
  assert.equal(doc.activeElement,actionItems[2]);
  actionItems[2].dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));
  assert.equal(doc.activeElement,actionItems[0]);
  actionItems[0].dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert.equal(actionPanel.hidden,true);assert.equal(doc.activeElement,moreButtons[1]);
  moreButtons[0].click();moreButtons[0].click();assert.equal(actionPanel.hidden,true,'再次点击收起');
  moreButtons[0].click();actionItems[1].click();
  assert.match(doc.querySelector('[data-table-demo-feedback]').textContent,/复制.*仅预览演示/);
  assert.equal(actionRoot.querySelectorAll('tbody tr').length,3,'演示不改变数据');
  moreButtons[0].click();doc.body.dispatchEvent(new w.Event('pointerdown',{bubbles:true}));assert.equal(actionPanel.hidden,true);
  moreButtons[0].click();actionRoot.querySelector('.gaip-table__scroll').dispatchEvent(new w.Event('scroll'));assert.equal(actionPanel.hidden,true);
  moreButtons[0].click();w.dispatchEvent(new w.Event('scroll'));assert.equal(actionPanel.hidden,true,'窗口滚动也关闭');
  moreButtons[0].click();w.dispatchEvent(new w.Event('resize'));assert.equal(actionPanel.hidden,true);
  moreButtons[0].click();tabs.find(tab=>tab.dataset.component==='table-tags').click();assert.equal(actionPanel.hidden,true,'切换组件不会遗留浮层');
  tabs.find(tab=>tab.dataset.component==='global-table').click();moreButtons[0].click();doc.querySelector('[data-table-demo="long"]').click();assert.equal(actionPanel.hidden,true,'重建表格关闭');
  actionRoot.querySelector('.tableDemo__more').click();w.dispatchEvent(new w.Event('pagehide'));assert.equal(actionPanel.hidden,true);assert.ok(actionRoot.__actionPreview,'保留BFCache返回后的表格实例');
  const tablePreviewInstance=actionRoot.__actionPreview;
  assert.equal(w.__GAIP_TABLE_PREVIEW__.mount(doc),tablePreviewInstance,'重复mount不添加第二套监听');
  const scriptsConfig=fs.readFileSync(path.join(root,'shared/config/channels.js'),'utf8');
  assert.doesNotMatch(scriptsConfig,/table-preview\.js|tableActionPreview/,'原型不注册进业务频道');
  const filterToggle = doc.querySelector('[data-filter-demo-visible="groups"]');
  filterToggle.click();
  assert.equal(filterToggle.checked, false);
  filterToggle.click();
  assert.equal(filterToggle.checked, true);
  const frame = doc.querySelector('.catalogFormFrame');
  const restore = doc.querySelector('[data-frame-restore]');
  frame.querySelector('[data-frame-cancel]').click();
  assert.equal(frame.hidden, true);
  assert.equal(restore.hidden, false);
  restore.click();
  assert.equal(frame.hidden, false);
  assert.equal(restore.hidden, true);
  let notice = 0, poster = 0;
  w.__GAIP_AI_NOTICE__.show = () => notice++;
  w.__GAIP_POSTER_SHARE__.open = () => poster++;
  doc.querySelector('[data-preview-action="showAiNotice"]').click();
  doc.querySelector('[data-preview-action="showPosterShare"]').click();
  assert.equal(notice, 1);
  assert.equal(poster, 1);
  assert.equal(doc.querySelectorAll('iframe').length, 0, '首页不加载全部业务弹窗');
  const uploads = [...w.__GAIP_UPLOAD_COMPONENTS__];
  assert.equal(uploads.length,1,'上传只有一个左侧入口');
  assert.equal(w.__GAIP_UPLOAD_CASES__.length,12,'排除无文件选择器的财富Mock');
  const allIds=w.__GAIP_GLOBAL_COMPONENTS__.map(c=>c.id);
  assert.equal(new Set(allIds).size,allIds.length,'目录ID不重复');
  doc.querySelector('[data-component="uploads"]').click();
  assert.equal(doc.getElementById('uploads').hidden,false);
  for(const item of w.__GAIP_UPLOAD_CASES__){
    const card=doc.querySelector('[data-upload-case="'+item.id+'"]');
    assert.ok(card.querySelector('input[type="file"]'),'仅控件片段，不需要进入业务页面');
    assert.equal(card.querySelector('h4').closest('.componentPreviewSurface'),null,'名称在卡片外');
    assert.ok(fs.existsSync(path.join(root,item.source)),item.source);
    assert.equal(card.querySelectorAll('iframe,a').length,0,'不搬页面，不展示来源跳转操作');
  }
  assert.equal(doc.querySelectorAll('iframe').length,0,'切换上传仍不加载业务页面');
  tabs[0].focus();
  tabs[0].dispatchEvent(new w.KeyboardEvent('keydown', { key: 'End', bubbles: true }));
  assert.equal(doc.activeElement, tabs.at(-1));
  w.history.replaceState(null, '', '?component=' + tabs[0].dataset.component);
  w.dispatchEvent(new w.PopStateEvent('popstate'));
  assert.equal(doc.getElementById(tabs[0].dataset.component).hidden, false);
  tablePreviewInstance.destroy();assert.equal(actionRoot.__actionPreview,undefined);assert.notEqual(actionPanel.parentElement,doc.body,'销毁后无portal遗留');
  w.__GAIP_TABLE_PREVIEW__.mount(doc);assert.equal(doc.querySelectorAll('[data-table-action-panel]').length,1,'销毁后可重挂载');
  console.log('component preview layout: all ' + tabs.length + ' tabs, card separation, real mounts, scenario controls, form restore and launch delegation passed (DOM only)');
} finally {
  w.close();
}
