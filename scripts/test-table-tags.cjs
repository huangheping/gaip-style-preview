'use strict';
const assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path'), {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'), source=fs.readFileSync(path.join(root,'components/table/global-table-tag.js'),'utf8');
(async()=>{
 const dom=new JSDOM('<body><table><tbody><tr><td id="cell"><span class="ant-tag" id="legacy"><img alt=""><span>已上架</span></span><span id="plain">失败</span><div class="ant-select"><span class="ant-tag" id="option">失败</span></div></td></tr></tbody></table><div id="outside"><span class="ant-tag" id="card">已上架</span></div></body>',{runScripts:'outside-only'});
 const w=dom.window,d=w.document,tick=()=>new Promise(r=>setTimeout(r,0));
 try {
  const legacy=d.querySelector('#legacy'),icon=legacy.firstChild,label=legacy.lastChild;let clicks=0;legacy.addEventListener('click',()=>clicks++);
  w.eval(source);const api=w.__GAIP_TABLE_TAG__;w.eval(source);assert.equal(api,w.__GAIP_TABLE_TAG__,'single installation');
  assert.equal(legacy.dataset.gaipTableTag,'success');assert.equal(d.querySelector('#plain').hasAttribute('data-gaip-table-tag'),false);assert.equal(d.querySelector('#option').hasAttribute('data-gaip-table-tag'),false);assert.equal(d.querySelector('#card').hasAttribute('data-gaip-table-tag'),false);
  assert.equal(api.toneFor('不持牌'),'neutral');assert.equal(api.toneFor('待跟进'),'warning');assert.equal(api.toneFor('跟进中'),'info');assert.equal(api.toneFor('下架'),'neutral');assert.equal(api.toneFor('删除'),'danger');assert.equal(api.toneFor('toString'),'neutral');
  const archived=fs.readFileSync(path.join(root,'docs/table-tag-color-mapping-v1.md'),'utf8');const colors={'灰色':'neutral','蓝色':'info','绿色':'success','橙色':'warning','红色':'danger'};let checked=0;
  const identityLabels=['管理员','人管','佣金','线索管理','线索跟进','新加坡','美国','百慕大','香港'];
  const planningLabels=['身份规划','资产配置','财富传承','保险规划','税务规划','子女教育'];
  assert.equal(api.tones.length,7);
  for(const text of identityLabels)assert.equal(api.toneFor(text),'identity');
  for(const row of archived.matchAll(/\|[^\n]+\| \*\*(灰色|蓝色|绿色|橙色|红色)\*\* \| ([^\n]+) \|/g))for(const text of row[2].split('、')){assert.equal(api.toneFor(text),text==='精选'?'highlight':identityLabels.includes(text)?'identity':planningLabels.includes(text)?'info':colors[row[1]],text);checked++;}
  assert.equal(checked,67,'all archived labels checked; approved identity and planning mappings differ');
  const texts=api.groups.flatMap(g=>Object.values(g.items).flat());assert.equal(texts.length,74);assert.equal(new Set(texts).size,74);
  const iconTexts=['持牌','财富传承','资产配置','保险规划','税务规划','身份规划','子女教育','预警','失败','解析失败','创建失败','待分配','待跟进','跟进中','待提交','待核对','未学习','学习中','已完成'];
  assert.equal(api.iconNames.length,14);assert.equal(new Set(api.iconNames).size,14);
  for(const text of texts) {
   const tag=api.create(text),svg=tag.querySelector('svg');
   assert.equal(Boolean(svg),iconTexts.includes(text),text+' default icon');
   assert.equal(tag.textContent,text,'icons do not alter accessible label text');
   if(svg){assert.equal(svg.namespaceURI,'http://www.w3.org/2000/svg');assert.equal(svg.getAttribute('aria-hidden'),'true');assert.equal(svg.getAttribute('stroke'),(api.iconFor(text).endsWith('-filled') || text==='持牌')?'none':'currentColor');assert.equal(svg.getAttribute('fill'),(api.iconFor(text).endsWith('-filled') || text==='持牌')?'currentColor':'none');assert.equal(svg.getAttribute('focusable'),'false');}
  }
  assert.equal(api.create('持牌',{icon:false}).querySelector('svg'),null);
  assert.equal(api.create('持牌',{icon:'toString'}).querySelector('svg'),null);
  assert.equal(api.create('—',{icon:'badge-check'}).querySelector('svg'),null);
  assert.equal(api.create('失败',{icon:'badge-check'}).querySelectorAll('svg').length,1,'explicit icon is preserved with soft failure state');
  const licenseHolder=d.createElement('tbody');licenseHolder.innerHTML=fs.readFileSync(path.join(root,'channels/config-center/templates/rows-0.html'),'utf8');
  const license=licenseHolder.querySelector('.tagLicensed___m8J7I'),oldImage=license.querySelector('img'),oldParent=oldImage.parentElement;
  d.querySelector('#cell').append(license);await tick();
  assert.equal(license.querySelectorAll('svg').length,1);assert.equal(oldImage.parentElement,oldParent);assert.ok(oldParent.hasAttribute('data-gaip-table-tag-legacy-icon'));
  let licenseClicks=0;license.addEventListener('click',()=>licenseClicks++);license.querySelector('svg').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));assert.equal(licenseClicks,1);
  let iconMutations=0;const iconWatch=new w.MutationObserver(records=>iconMutations+=records.length);iconWatch.observe(license,{subtree:true,childList:true,attributes:true});api.scan(d);api.scan(d);await tick();assert.equal(iconMutations,0,'icon adoption is idempotent');iconWatch.disconnect();
  d.querySelector('#outside').append(license);await tick();assert.equal(license.querySelector('svg'),null);assert.equal(oldParent.hasAttribute('data-gaip-table-tag-legacy-icon'),false);assert.equal(oldImage.parentElement,oldParent);
  const planning=d.createElement('span');planning.className='ant-tag badge___QDrJm';planning.innerHTML='<img alt=""><span>身份规划</span>';d.querySelector('#cell').append(planning);await tick();
  const originalPlanningImage=planning.querySelector('img'),planningText=planning.querySelector('span');
  for(const text of iconTexts.slice(1)){planningText.textContent=text;await tick();assert.equal(planning.querySelectorAll('svg').length,1);assert.equal(planning.querySelector('svg').dataset.gaipTableTagIcon,api.iconFor(text));assert.equal(planning.querySelector('img'),originalPlanningImage);}
  planningText.textContent='已关闭';await tick();assert.equal(planning.querySelector('svg'),null);assert.equal(originalPlanningImage.hasAttribute('data-gaip-table-tag-legacy-icon'),false);
  planningText.textContent='身份规划';await tick();planning.querySelector('svg').remove();await tick();assert.equal(planning.querySelectorAll('svg').length,1,'recover after business DOM refresh');
  const lateImage=d.createElement('img');planning.append(lateImage);await tick();assert.ok(lateImage.hasAttribute('data-gaip-table-tag-legacy-icon'),'late original images do not duplicate the displayed icon');
  assert.deepEqual(JSON.parse(JSON.stringify(api.tones.map(t=>[t.id,texts.filter(text=>api.toneFor(text)===t.id).length]))),[['neutral',22],['info',17],['success',15],['warning',5],['danger',5],['identity',9],['highlight',1]]);
  const solid=['管理员','草稿'];
  for(const text of texts)assert.equal(api.create(text).dataset.gaipTableTagVariant,solid.includes(text)?'solid':'soft',text);
  assert.equal(api.create('导入失败重试',{tone:'danger'}).dataset.gaipTableTagVariant,'soft','no keyword-based emphasis');
  const safe=api.create('<img src=x onerror=alert(1)>',{tone:'untrusted class'});assert.equal(safe.querySelector('img'),null);assert.equal(safe.textContent,'<img src=x onerror=alert(1)>');assert.equal(safe.dataset.gaipTableTag,'neutral');assert.equal(api.create('精选',{tone:'success'}).dataset.gaipTableTag,'highlight');assert.equal(api.create('新文案',{tone:'highlight'}).dataset.gaipTableTag,'highlight');assert.equal(api.create(null).dataset.gaipTableTag,'empty');
  label.firstChild.data='失败';await tick();assert.equal(legacy.dataset.gaipTableTag,'danger');assert.equal(legacy.dataset.gaipTableTagVariant,'soft');assert.equal(legacy.querySelector('img'),icon);assert.equal(legacy.querySelectorAll('svg[data-gaip-table-tag-icon]').length,1);assert.equal(legacy.lastChild,label);legacy.click();assert.equal(clicks,1);
  let mutations=0;const watcher=new w.MutationObserver(records=>mutations+=records.length);watcher.observe(legacy,{attributes:true});api.scan(d);api.scan(d);await tick();assert.equal(mutations,0,'idempotent scan does not self-trigger');watcher.disconnect();
  label.firstChild.data='删除';await tick();assert.equal(legacy.dataset.gaipTableTagVariant,'soft','failure and delete both retain soft danger tone');
  for(const text of identityLabels){label.firstChild.data=text;await tick();assert.equal(legacy.dataset.gaipTableTag,'identity');assert.equal(legacy.dataset.gaipTableTagVariant,text==='管理员'?'solid':'soft','role changes update strength without changing tone');}
  label.firstChild.data='解析失败';await tick();assert.equal(legacy.dataset.gaipTableTagVariant,'soft');
  d.querySelector('#outside').append(legacy);await tick();assert.equal(legacy.hasAttribute('data-gaip-table-tag'),false,'restore when moved outside table');assert.equal(legacy.hasAttribute('data-gaip-table-tag-variant'),false);
  d.querySelector('#cell').append(legacy);await tick();assert.equal(legacy.dataset.gaipTableTag,'danger');
  legacy.className='ordinary';await tick();assert.equal(legacy.hasAttribute('data-gaip-table-tag'),false);
  legacy.className='gaip-log-tag';legacy.textContent='—';await tick();assert.equal(legacy.dataset.gaipTableTag,'empty');
  d.querySelector('#cell').className='ant-select';await tick();assert.equal(legacy.hasAttribute('data-gaip-table-tag'),false,'ancestor scope changes are respected');
  const resizeObservers=[];
  w.ResizeObserver=class {constructor(callback){this.callback=callback;resizeObservers.push(this);}observe(node){this.node=node;}disconnect(){this.disconnected=true;}};
  const group=api.createGroup(['持牌',{text:'这是一个需要显示全文的很长标签',tone:'info',icon:'badge-check'}],{label:'标签组'});
  d.body.append(group);api.scan(group);await tick();
  assert.equal(group.getAttribute('role'),'group');assert.equal(group.getAttribute('aria-label'),'标签组');
  assert.equal(group.children.length,2);assert.equal(group.firstChild.textContent,'持牌');
  const long=group.lastChild, longText=long.querySelector('.gaip-table-tag__text');let available=60;
  Object.defineProperty(longText,'clientWidth',{get:()=>available});Object.defineProperty(longText,'scrollWidth',{get:()=>240});
  long.setAttribute('aria-describedby','business-note');api.scan(group);
  assert.equal(long.tabIndex,0);assert.ok(long.hasAttribute('data-tag-truncated'));
  long.focus();let full=d.querySelector('.gaip-table-tag-tooltip');assert.ok(full);assert.equal(full.textContent,long.textContent);assert.ok(long.getAttribute('aria-describedby').includes('business-note'));
  long.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(d.querySelector('.gaip-table-tag-tooltip'),null);assert.equal(long.getAttribute('aria-describedby'),'business-note');
  long.click();assert.ok(d.querySelector('.gaip-table-tag-tooltip'));
  available=300;resizeObservers.find(r=>r.node===long).callback();assert.equal(long.hasAttribute('data-tag-truncated'),false);assert.equal(long.hasAttribute('tabindex'),false);assert.equal(d.querySelector('.gaip-table-tag-tooltip'),null);
  available=60;long.tabIndex=2;api.scan(group);long.click();group.hidden=true;await tick();assert.equal(d.querySelector('.gaip-table-tag-tooltip'),null);
  group.hidden=false;await tick();long.click();group.remove();await tick();assert.equal(d.querySelector('.gaip-table-tag-tooltip'),null);assert.equal(long.tabIndex,2,'caller-owned tabindex is preserved');assert.ok(resizeObservers.every(r=>r.disconnected),'removed tags disconnect size observers');
  d.body.append(group);api.scan(group);long.dataset.tagSource=long.textContent;long.click();assert.equal(d.querySelector('.gaip-table-tag-tooltip'),null,'catalog source tooltip already exposes full text');group.remove();await tick();
  console.log('PASS table tags: v1 67 labels + 7 current labels; exact semantics, safe text, scoped adoption, async changes, original nodes/events, cleanup and observer idempotence.');
 } finally {w.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
