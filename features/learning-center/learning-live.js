(function () {
  'use strict';
  var D = window.__GAIP_LEARNING_DATA__, L = window.__GAIP_LEARNING_LIVE_DATA__, M = window.__GAIP_MODAL_COMPONENT__;
  var dialogs = new Set(), currentToast;
  function e(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function node(tag, cls, value) { var n = document.createElement(tag); n.className = cls || ''; if (value != null) n.textContent = value; return n; }
  function button(text, fn, cls) { var b = node('button', cls || 'gaip-table__button', text); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function date(value) { return value ? new Date(value).toLocaleString('zh-CN', { hour12:false }) : '—'; }
  function url(path) { return new URL(path, D.root).href; }
  function notify(message) {
    if (currentToast) currentToast.remove(); var n = node('div', 'gaip-learning-toast is-visible', message); n.setAttribute('role','status'); document.body.append(n); currentToast = n; setTimeout(function () { n.remove(); if (currentToast === n) currentToast = null; }, 4200);
  }
  function run(fn) { try { return fn(); } catch (err) { notify(err.message); return false; } }
  function attach(dialog, cleanup) {
    var focus = document.activeElement; dialog.dataset.learningDialog = ''; dialogs.add(dialog);
    dialog.addEventListener('close',function () { if (cleanup) cleanup(); dialogs.delete(dialog); dialog.remove(); if (focus && focus.isConnected) focus.focus({preventScroll:true}); },{once:true});
    document.body.append(dialog); if (window.__GAIP_MODAL_POSITION__) window.__GAIP_MODAL_POSITION__.adopt(dialog); dialog.showModal(); return dialog;
  }
  function confirm(scene, id, done) {
    var b = id ? L.get(id) : null, mode = 'schedule';
    var info = {
      publish: ['确认上架', '选择上架方式。定时上架按配置时间执行；立即上架会覆盖原上架排期。', '确认上架'],
      offline: ['下架直播 Banner', '下架后将保留为只读历史记录，不能编辑、删除或重新上架。', '确认下架'],
      remove: ['删除直播 Banner', '确定删除此草稿？删除后无法恢复，已确认的上架排期也会取消。', '删除草稿'],
      discard: ['放弃修改？', '未保存的 Banner 配置将丢失。', '放弃修改']
    }[scene];
    var parts = M.createConfirm({title:info[0],message:info[1],cancelLabel:'取消',confirmLabel:info[2],tone:scene==='publish'?null:'danger'});
    var dialog = parts.dialog; dialog.dataset.gaipModalId = 'learning-live-' + scene;
    if (scene === 'publish') {
      var choice = node('fieldset','gaip-page-form gaip-form-choices lc-live-publish-options');
      choice.innerHTML = '<legend>上架方式</legend><label><input type="radio" name="live-publish-mode" value="schedule" checked> 定时上架'+(b?' · '+e(date(b.startAt)):'')+'</label><label><input type="radio" name="live-publish-mode" value="now"> 立即上架</label>';
      choice.addEventListener('change',function (ev) {mode=ev.target.value;});
      dialog.querySelector('.gaip-modal__body').append(choice);
    }
    parts.cancel.addEventListener('click',function(){dialog.close();}); parts.close.addEventListener('click',function(){dialog.close();});
    parts.confirm.addEventListener('click',function(){
      if (run(function(){if(id){if(scene==='publish')L.publish(id,mode);if(scene==='offline')L.offline(id);if(scene==='remove')L.remove(id);}if(done)done();})!==false) {dialog.close();if(id)notify(scene==='publish'&&mode==='schedule'?'已确认定时上架':scene==='publish'?'上架成功':scene==='offline'?'下架成功':'删除成功');}
    });
    return attach(dialog);
  }
  function localTime(value) { if(!value)return '';var d=new Date(value);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16); }
  function openEditor(id, preview) {
    if (!L.admin()) return notify('没有直播管理权限');
    var b = id ? L.get(id) : L.fresh(); if(!b||b.status==='offline')return notify('已下架 Banner 只读');
    var locked=b.status==='published', snapshot=JSON.stringify(b), busy=false, removed=false, feedback, multi;
    var dialog=node('dialog','lc-live-editor ant-modal gaip-modal-form gaip-page-form'); dialog.dataset.gaipModalId='learning-live-editor';dialog.dataset.gaipModalCategory='form';dialog.dataset.gaipFormFooter='standard';dialog.setAttribute('aria-labelledby','lc-live-edit-title');
    function field(key,label,input,help){return '<div class="lc-field" data-live-field="'+key+'"><label class="gaip-form-label" for="live-'+key+'">'+label+'</label>'+input+(help?'<small class="lc-live-help">'+help+'</small>':'')+'</div>';}
    function input(key,type,disabled){return '<input class="gaip-form-control" id="live-'+key+'" data-live-input="'+key+'" type="'+type+'" value="'+e(type==='datetime-local'?localTime(b[key]):b[key])+'"'+(disabled?' disabled':'')+(key==='name'?' maxlength="50" placeholder="请输入 Banner 名称"':'')+'>';}
    dialog.innerHTML='<div class="ant-modal-content"><header class="ant-modal-header"><h2 id="lc-live-edit-title">'+(id?'编辑':'新增')+'直播 Banner</h2></header><button class="ant-modal-close" type="button" aria-label="关闭弹窗"></button><div class="ant-modal-body"><p class="lc-live-help">'+(locked?'已上架：仅可修改名称和下架时间。':b.scheduled?'已确认定时上架，保存修改后仍按排期执行。':'保存为草稿后，再到列表确认上架。')+'</p><div class="lc-live-form-grid">'+field('name','Banner 名称',input('name','text'), '仅后台使用，最多 50 个字')+field('image','Banner 图片','<div class="lc-live-image-slot"></div><button type="button" class="gaip-table__button lc-live-upload" data-live-upload'+(locked?' disabled':'')+'>选择图片</button><input id="live-image" type="file" hidden accept="image/jpeg,image/png,image/webp"'+(locked?' disabled':'')+'>','建议 1500 × 640 px（750∶320），JPG / PNG / WebP，最大 2 MB；本地保存图片')+'<fieldset class="lc-field lc-live-type gaip-form-choices" data-live-field="type"><legend>对接类型</legend><div><label><input type="radio" name="live-type" value="id"'+(b.type==='id'?' checked':'')+(locked?' disabled':'')+'> 直播 ID</label><label><input type="radio" name="live-type" value="url"'+(b.type==='url'?' checked':'')+(locked?' disabled':'')+'> 链接</label></div></fieldset>'+field('content',b.type==='id'?'直播 ID':'直播链接',input('content','text',locked),'')+field('groups','学习群组',locked?'<div>'+e(b.groups.map(function(g){return g==='all'?'所有人':g;}).join('、'))+'</div>':'<div id="live-groups" data-gaip-form-field="exclude"></div>','选择可看到此 Banner 的学习群组')+'<div class="lc-live-times">'+field('startAt','预期上架时间',input('startAt','datetime-local',locked),'定时上架需晚于当前时间 2 分钟')+field('endAt','自动下架时间',input('endAt','datetime-local'), '')+'</div></div><p class="lc-live-form-error" role="alert" hidden></p></div><footer class="ant-modal-footer"><button type="button" class="ant-btn-default" data-live-cancel>取消</button><button type="button" class="ant-btn-primary" data-live-save>'+ (locked?'保存修改':'保存草稿')+'</button></footer></div>';
    var presentationFields = node('div', 'lc-live-presentation-fields');
    presentationFields.innerHTML = field('publicTitle', '直播标题', input('publicTitle', 'text', locked), '面向学员展示，最多 100 个字；未填写时显示“直播活动”') +
      field('summary', '直播简介', input('summary', 'text', locked), '选填，最多 200 个字') +
      field('liveStartAt', '实际开播时间', input('liveStartAt', 'datetime-local', locked), '用于倒计时，到点显示“直播中”；与广告上架时间无关，未填写则显示“开播时间待定”');
    dialog.querySelector('[data-live-field="image"]').after(presentationFields);
    dialog.querySelector('#live-publicTitle').maxLength = 100;
    dialog.querySelector('#live-summary').maxLength = 200;
    function syncType(){var f=dialog.querySelector('[data-live-field="content"]');f.hidden=!b.type;f.querySelector('label').textContent=b.type==='id'?'直播 ID':'直播链接';f.querySelector('input').placeholder=b.type==='id'?'请输入直播 ID':'https://';}
    function showImage(){var slot=dialog.querySelector('.lc-live-image-slot');slot.replaceChildren();if(b.image){var img=node('img');img.src=url(b.image);img.alt='Banner 图片预览';slot.append(img);}else slot.append(node('span','','尚未上传图片'));}
    function clearError(){if(feedback){feedback.destroy();feedback=null;}dialog.querySelector('.lc-live-form-error').hidden=true;}
    function showError(err){clearError();var box=dialog.querySelector('[data-live-field="'+(err.field||'')+'"]'),control=box&&box.querySelector('[data-live-upload]:not([disabled]),input:not([disabled]):not([hidden]),[role="combobox"]');if(control){feedback=M.createFieldFeedback(box,control);feedback.set(err.message);control.focus();}else{var msg=dialog.querySelector('.lc-live-form-error');msg.textContent=err.message;msg.hidden=false;}}
    function closeRequest(){if(busy||JSON.stringify(b)!==snapshot)return confirm('discard',null,function(){dialog.close();});dialog.close();}
    dialog.querySelector('[data-live-cancel]').addEventListener('click',closeRequest);dialog.querySelector('.ant-modal-close').addEventListener('click',closeRequest);dialog.addEventListener('cancel',function(ev){ev.preventDefault();closeRequest();});
    dialog.addEventListener('input',function(ev){var key=ev.target.dataset.liveInput;if(!key)return;clearError();b[key]=ev.target.value;if(key==='startAt'||key==='endAt'||key==='liveStartAt')b[key]=ev.target.value?new Date(ev.target.value).toISOString():'';});
    dialog.querySelectorAll('[name="live-type"]').forEach(function(r){r.addEventListener('change',function(){b.type=r.value;b.content='';dialog.querySelector('#live-content').value='';clearError();syncType();});});
    dialog.querySelector('[data-live-upload]').classList.add('lc-button');
    dialog.querySelector('[data-live-upload]').addEventListener('click',function(){dialog.querySelector('#live-image').click();});
    dialog.querySelector('#live-image').addEventListener('change',function(ev){
      var f=ev.target.files[0];if(!f)return;ev.target.value='';clearError();
      if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>2*1024*1024){showError({field:'image',message:'请选择不超过 2 MB 的 JPG、PNG 或 WebP 图片'});return;}
      busy=true;dialog.querySelector('[data-live-save]').disabled=true;var reader=new FileReader();
      function end(){busy=false;if(!removed)dialog.querySelector('[data-live-save]').disabled=false;}
      reader.onerror=function(){end();if(!removed)showError({field:'image',message:'图片读取失败，请重试'});};
      reader.onload=function(){var img=new Image();img.onload=function(){end();if(removed)return;b.image=reader.result;b.imageName=f.name;showImage();};img.onerror=function(){end();if(!removed)showError({field:'image',message:'无法识别图片，请重新选择'});};img.src=reader.result;};reader.readAsDataURL(f);
    });
    dialog.querySelector('[data-live-save]').addEventListener('click',function(){if(busy)return;try{if(!preview){L.tick();if(id&&L.get(id)&&L.get(id).status!==b.status)throw new Error('Banner 状态已变化，请关闭后重新打开编辑。');L.save(b);}dialog.close();notify(preview?'组件预览，不写入数据':locked?'已保存修改':b.scheduled?'已保存修改，仍按排期上架':'草稿已保存，尚未安排上架');}catch(err){showError(err);}});
    dialog.querySelector('.lc-live-type').classList.remove('lc-field');
    M.adoptForm(dialog);syncType();showImage();
    if(!locked){multi=window.__GAIP_MULTI_SELECT__.mount(dialog.querySelector('#live-groups'),{options:[{value:'all',label:'所有人'}].concat(D.groups.map(function(g){return {value:g,label:g};})),value:b.groups,placeholder:'请选择学习群组',onChange:function(values){if(values.includes('all'))values=b.groups.includes('all')?values.filter(function(g){return g!=='all';}):['all'];b.groups=values;multi.setValue(values);clearError();}});}
    attach(dialog,function(){removed=true;if(multi)multi.destroy();if(feedback)feedback.destroy();});
    if(window.__GAIP_MODAL_CONTROLS__)window.__GAIP_MODAL_CONTROLS__.adopt(dialog);
    return dialog;
  }
  function mountManager(host, options) {
    var o=options||{}, filters={}, filter, table, popup, popupTrigger;
    function closeURL(){if(popup)popup.remove();if(popupTrigger)popupTrigger.setAttribute('aria-expanded','false');popup=null;popupTrigger=null;}
    function outside(ev){if(popup&&!popup.contains(ev.target)&&ev.target!==popupTrigger)closeURL();}
    function escapeURL(ev){if(popup&&ev.key==='Escape'){var trigger=popupTrigger;closeURL();trigger.focus({preventScroll:true});ev.preventDefault();}}
    function scrollURL(ev){if(popup&&!popup.contains(ev.target))closeURL();}
    host.innerHTML='<header class="gaip-course-detail-header lc-manage-header"><button class="gaip-course-detail-back" type="button" data-live-back><span class="gaip-course-detail-back-icon" aria-hidden="true"></span>返回学习中心</button><div class="lc-manage-header-actions gaip-table-tools"><button type="button" class="gaip-table__button" data-live-log>操作日志</button><button type="button" class="gaip-table__button is-primary" data-live-new>＋ 新增直播 Banner</button></div></header><main class="lc-admin lc-live-admin"><div data-live-filters></div><p class="lc-live-help">保存草稿不会自动上架，请在操作列确认上架。定时任务仅在本地页面运行或重新打开时模拟执行。</p><div data-live-table></div></main>';
    host.querySelector('[data-live-back]').onclick=o.back;host.querySelector('[data-live-log]').onclick=o.logs;host.querySelector('[data-live-new]').onclick=function(){openEditor();};
    function rows(){return L.list().filter(function(b){return (!filters.q||b.name.toLowerCase().includes(filters.q.toLowerCase()))&&(!filters.status||b.status===filters.status);});}
    function refresh(){closeURL();if(table&&L.admin())table.setRows(rows(),false);}
    function actions(b){var n=node('div','gaip-table__row-actions');if(b.status==='draft'){n.append(button('上架',function(){confirm('publish',b.id);}));n.append(button('编辑',function(){openEditor(b.id);}));n.append(button('删除',function(){confirm('remove',b.id);},'is-danger'));}else if(b.status==='published'){n.append(button('下架',function(){confirm('offline',b.id);}),button('编辑',function(){openEditor(b.id);}));}else n.textContent='—';return n;}
    function content(b){
      if(b.type!=='url'||!b.content)return b.content||'—';
      var trigger=button('查看',function(){
        if(popupTrigger===trigger){closeURL();return;}closeURL();
        popup=node('div','gaip-modal-popup lc-live-url-value',b.content);popup.setAttribute('role','dialog');popup.setAttribute('aria-label','完整直播链接');popup.tabIndex=-1;
        popupTrigger=trigger;trigger.setAttribute('aria-expanded','true');document.body.append(popup);
        if(typeof popup.showPopover==='function'){popup.setAttribute('popover','manual');popup.showPopover();}
        var r=trigger.getBoundingClientRect(),w=Math.min(420,window.innerWidth-32);popup.style.width=w+'px';popup.style.left=Math.max(16,Math.min(r.left,window.innerWidth-w-16))+'px';
        popup.style.top=Math.max(16,Math.min(r.bottom+8,window.innerHeight-popup.offsetHeight-16))+'px';popup.focus({preventScroll:true});
      },'lc-live-url');trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-expanded','false');return trigger;
    }
    table=window.__GAIP_TABLE__.mount(host.querySelector('[data-live-table]'),{title:'直播 Banner 列表',rows:rows(),pagination:false,minWidth:1440,rowVerticalAlign:'top',boundary:host.querySelector('main'),bottomGap:0,emptyText:'暂无直播 Banner，请点击新增',columns:[
      {label:'Banner 名称',key:'name',width:210,fixed:'left'},
      {label:'Banner 状态',width:125,render:function(b){var n=node('div');n.append(window.__GAIP_TABLE__.tag(L.names[b.status],{tone:b.status==='published'?'success':'neutral'}));if(b.scheduled)n.append(node('div','lc-live-help','已确认定时上架'));return n;}},
      {label:'学习群组',width:140,render:function(b){return b.groups.map(function(g){return g==='all'?'所有人':g;}).join('、')||'—';}},
      {label:'对接类型',width:100,render:function(b){return b.type==='id'?'直播 ID':b.type==='url'?'链接':'—';}},
      {label:'对接内容',width:150,render:content},
      {label:'预期上架时间',width:164,render:function(b){return date(b.startAt);}},
      {label:'自动下架时间',width:164,render:function(b){return date(b.endAt);}},
      {label:'最后更新',width:174,renderHTML:function(b){return e(date(b.updatedAt))+'<div>'+e(b.updatedBy)+'</div>';}},
      {label:'操作',width:190,fixed:'right',render:actions}
    ]});
    filter=window.__GAIP_FILTER_BAR__.mount(host.querySelector('[data-live-filters]'),{label:'直播 Banner 筛选',mode:'instant',fields:[{key:'q',type:'search',label:'Banner 名称',placeholder:'搜索 Banner 名称',wide:true},{key:'status',type:'select',label:'Banner 状态',placeholder:'全部状态',options:[{value:'',label:'全部状态'},{value:'published',label:'已上架'},{value:'draft',label:'草稿'},{value:'offline',label:'已下架'}]}],actions:{reset:true,more:false,submit:false},onChange:function(v){filters=v;refresh();}});
    window.addEventListener('gaip:live-change',refresh);document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escapeURL);document.addEventListener('scroll',scrollURL,true);window.addEventListener('resize',closeURL);
    return function(){closeURL();window.removeEventListener('gaip:live-change',refresh);document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escapeURL);document.removeEventListener('scroll',scrollURL,true);window.removeEventListener('resize',closeURL);filter.destroy();table.destroy();closeDialogs();};
  }
  function openLive(b) {
    var current = L.visible().find(function (x) { return x.id === b.id; });
    if (!current) return notify('此直播已下架或不可见');
    if (current.type === 'id') return notify('本地 Mock：直播 ID ' + current.content + ' 尚未接入播放地址。');
    if (L.validURL(current.content)) window.open(current.content, '_blank', 'noopener,noreferrer');
  }
  function mountCards(slot, heading) {
    var banners = [], signature = '', page = 0, timer, stopped = false, controls;
    slot.classList.add('lc-live-section'); slot.setAttribute('aria-label', '直播活动');
    function updateStatus() {
      slot.querySelectorAll('[data-live-card]').forEach(function (card) {
        var b = banners.find(function (item) { return item.id === card.dataset.liveCard; });
        if (!b) return;
        var data = L.presentation(b), status = card.querySelector('.lc-live-card-status');
        if (status.textContent !== data.status) status.textContent = data.status;
        status.classList.toggle('is-live', data.live);
      });
    }
    function show() {
      var focused = slot.contains(document.activeElement), focusId = document.activeElement.dataset.liveCard;
      var focusControl = document.activeElement.dataset.carouselControl;
      if (controls) { controls.destroy(); controls = null; }
      slot.replaceChildren(); slot.hidden = !banners.length;
      if (heading) heading.hidden = !banners.length;
      if (!banners.length) return;
      var items = banners.slice(page * 2, page * 2 + 2);
      var grid = node('div', 'lc-live-cards' + (items.length === 1 ? ' is-single' : ''));
      items.forEach(function (b) {
        var data = L.presentation(b), card = button('', function () { openLive(b); }, 'lc-live-card');
        card.dataset.liveCard = b.id; card.setAttribute('aria-label', '查看直播：' + data.title);
        var cover = node('span', 'lc-live-card-cover'), img = node('img');
        img.src = url(b.image); img.alt = ''; cover.append(img);
        var copy = node('span', 'lc-live-card-copy'), title = node('span', 'lc-live-card-title', data.title);
        title.title = data.title; copy.append(title);
        if (data.summary) { var summary = node('span', 'lc-live-card-summary', data.summary); summary.title = data.summary; copy.append(summary); }
        var meta = node('span', 'lc-live-card-meta'), label = node('span', 'lc-live-card-label', '直播');
        var liveIcon = node('img', 'lc-live-card-label-icon');
        liveIcon.src = url('assets/learning/live-video-label.svg?v=20260917-gold-1'); liveIcon.alt = ''; liveIcon.setAttribute('aria-hidden', 'true');
        label.prepend(liveIcon);
        meta.append(label, node('span', 'lc-live-card-status'));
        card.append(cover, copy, meta); grid.append(card);
      });
      var stage = node('div', 'lc-live-card-stage'); stage.append(grid); slot.append(stage);
      if (banners.length > 2) {
        controls = window.__GAIP_CAROUSEL_CONTROLS__.mount(slot, {
          arrowHost: stage, count: Math.ceil(banners.length / 2), index: page, label: '更多直播',
          onChange: function (index) { page = index; show(); }
        });
      }
      updateStatus();
      if (focused) {
        var target = Array.from(slot.querySelectorAll('[data-live-card]')).find(function (card) { return card.dataset.liveCard === focusId; });
        var control = Array.from(slot.querySelectorAll('[data-carousel-control]')).find(function (item) { return item.dataset.carouselControl === focusControl; });
        (control || target || grid.firstElementChild).focus({preventScroll:true});
      }
    }
    function refresh() {
      if (stopped) return;
      var next = L.visible(), key = JSON.stringify(next);
      if (key !== signature) {
        signature = key; banners = next; page = Math.min(page, Math.max(0, Math.ceil(banners.length / 2) - 1)); show();
      } else updateStatus();
    }
    refresh(); timer = setInterval(refresh, 1000);
    window.addEventListener('gaip:live-change', refresh);
    document.addEventListener('visibilitychange', refresh);
    return function () { stopped = true; clearInterval(timer); if (controls) controls.destroy(); window.removeEventListener('gaip:live-change', refresh); document.removeEventListener('visibilitychange', refresh); };
  }
  function mountCarousel(slot) {
    var index=0, banners=[], timer, stopped=false, signature='';
    function open(b){var current=L.visible().find(function(x){return x.id===b.id;});if(!current)return notify('此直播 Banner 已下架或不可见');if(current.type==='id')return notify('本地 Mock：直播 ID '+current.content+' 尚未接入播放地址。');if(L.validURL(current.content))window.open(current.content,'_blank','noopener,noreferrer');}
    function show(){
      slot.replaceChildren();slot.hidden=!banners.length;if(!banners.length)return;
      var b=banners[index],link=button('',function(){open(b);},'lc-live-banner-link'),img=node('img');img.src=url(b.image);img.alt='直播宣传图片，点击打开直播';link.setAttribute('aria-label','打开第 '+(index+1)+' 场直播');link.append(img);slot.append(link);
      if(banners.length>1){var prev=button('‹',function(){index=(index+banners.length-1)%banners.length;show();},'lc-live-arrow is-prev'),next=button('›',function(){index=(index+1)%banners.length;show();},'lc-live-arrow is-next');prev.setAttribute('aria-label','上一张直播 Banner');next.setAttribute('aria-label','下一张直播 Banner');var dots=node('div','lc-live-dots');banners.forEach(function(_,i){var dot=button('',function(){index=i;show();},'lc-live-dot');dot.setAttribute('aria-label','切换到第 '+(i+1)+' 张');dot.setAttribute('aria-pressed',String(i===index));dots.append(dot);});slot.append(prev,next,dots);}
    }
    function refresh(){var next=L.visible(),key=JSON.stringify(next);if(key===signature)return;var active=banners[index]&&banners[index].id;signature=key;banners=next;index=Math.max(0,banners.findIndex(function(b){return b.id===active;}));show();}
    refresh();timer=setInterval(function(){if(!stopped&&banners.length>1){var focused=slot.contains(document.activeElement);index=(index+1)%banners.length;show();if(focused)slot.querySelector('.lc-live-banner-link').focus({preventScroll:true});}},3000);
    window.addEventListener('gaip:live-change',refresh);return function(){stopped=true;clearInterval(timer);window.removeEventListener('gaip:live-change',refresh);slot.replaceChildren();};
  }
  function closeDialogs(){Array.from(dialogs).reverse().forEach(function(d){d.close();});}
  window.__GAIP_LEARNING_LIVE__={mountManager:mountManager,mountCards:mountCards,mountCarousel:mountCarousel,close:closeDialogs,openEditor:openEditor,openConfirm:function(scene){return confirm(scene||'publish');}};
}());
/* @gaip-modal
{"id":"learning-live-editor","title":"新增 / 编辑直播 Banner","channel":"学习中心","type":"modal","category":"form","status":"ready","source":"window.__GAIP_LEARNING_LIVE__.openEditor()","invoke":{"path":"__GAIP_LEARNING_LIVE__.openEditor","args":[null,true]},"styles":["shared/styles/global-modal.css?v=20260910-discard-outline-1","shared/styles/global-modal-position.css","shared/styles/global-modal-mask.css","shared/styles/global-page-form.css","shared/styles/global-multi-select.css?v=20260915-multi-filter-1","shared/styles/global-date-picker.css","shared/styles/modal-controls.css","features/learning-center/learning-v11.css?v=20260910-study-detail-modal-1","features/learning-center/learning-live.css?v=20260917-live-gold-1"],"scripts":["shared/scripts/global-modal.js","shared/scripts/global-modal-position.js","shared/scripts/global-multi-select.js","shared/scripts/global-date-picker.js","shared/scripts/modal-controls.js","features/learning-center/learning-data.js","features/learning-center/learning-live-data.js?v=20260917-live-copy-1","features/learning-center/learning-live.js?v=20260917-live-gold-1"]}
*/
/* @gaip-modal
{"id":"learning-live-publish","title":"直播 Banner 上架确认","channel":"学习中心","type":"confirm","category":"confirmation","status":"ready","source":"window.__GAIP_LEARNING_LIVE__.openConfirm()","invoke":{"path":"__GAIP_LEARNING_LIVE__.openConfirm","args":["publish"]},"styles":["shared/styles/global-modal.css?v=20260910-discard-outline-1","shared/styles/global-modal-position.css","shared/styles/global-modal-mask.css","shared/styles/global-page-form.css","shared/styles/global-multi-select.css?v=20260915-multi-filter-1","shared/styles/global-date-picker.css","shared/styles/modal-controls.css","features/learning-center/learning-v11.css?v=20260910-study-detail-modal-1","features/learning-center/learning-live.css?v=20260917-live-gold-1"],"scripts":["shared/scripts/global-modal.js","shared/scripts/global-modal-position.js","shared/scripts/global-multi-select.js","shared/scripts/global-date-picker.js","shared/scripts/modal-controls.js","features/learning-center/learning-data.js","features/learning-center/learning-live-data.js?v=20260917-live-copy-1","features/learning-center/learning-live.js?v=20260917-live-gold-1"]}
*/
/* @gaip-modal
{"id":"learning-live-offline","title":"直播 Banner 下架确认","channel":"学习中心","type":"confirm","category":"confirmation","status":"ready","source":"window.__GAIP_LEARNING_LIVE__.openConfirm()","invoke":{"path":"__GAIP_LEARNING_LIVE__.openConfirm","args":["offline"]},"styles":["shared/styles/global-modal.css?v=20260910-discard-outline-1","shared/styles/global-modal-position.css","shared/styles/global-modal-mask.css","shared/styles/global-page-form.css","shared/styles/global-multi-select.css?v=20260915-multi-filter-1","shared/styles/global-date-picker.css","shared/styles/modal-controls.css","features/learning-center/learning-v11.css?v=20260910-study-detail-modal-1","features/learning-center/learning-live.css?v=20260917-live-gold-1"],"scripts":["shared/scripts/global-modal.js","shared/scripts/global-modal-position.js","shared/scripts/global-multi-select.js","shared/scripts/global-date-picker.js","shared/scripts/modal-controls.js","features/learning-center/learning-data.js","features/learning-center/learning-live-data.js?v=20260917-live-copy-1","features/learning-center/learning-live.js?v=20260917-live-gold-1"]}
*/
/* @gaip-modal
{"id":"learning-live-remove","title":"删除直播 Banner 草稿","channel":"学习中心","type":"confirm","category":"confirmation","status":"ready","source":"window.__GAIP_LEARNING_LIVE__.openConfirm()","invoke":{"path":"__GAIP_LEARNING_LIVE__.openConfirm","args":["remove"]},"styles":["shared/styles/global-modal.css?v=20260910-discard-outline-1","shared/styles/global-modal-position.css","shared/styles/global-modal-mask.css","shared/styles/global-page-form.css","shared/styles/global-multi-select.css?v=20260915-multi-filter-1","shared/styles/global-date-picker.css","shared/styles/modal-controls.css","features/learning-center/learning-v11.css?v=20260910-study-detail-modal-1","features/learning-center/learning-live.css?v=20260917-live-gold-1"],"scripts":["shared/scripts/global-modal.js","shared/scripts/global-modal-position.js","shared/scripts/global-multi-select.js","shared/scripts/global-date-picker.js","shared/scripts/modal-controls.js","features/learning-center/learning-data.js","features/learning-center/learning-live-data.js?v=20260917-live-copy-1","features/learning-center/learning-live.js?v=20260917-live-gold-1"]}
*/
/* @gaip-modal
{"id":"learning-live-discard","title":"放弃直播 Banner 修改","channel":"学习中心","type":"confirm","category":"confirmation","status":"ready","source":"window.__GAIP_LEARNING_LIVE__.openConfirm()","invoke":{"path":"__GAIP_LEARNING_LIVE__.openConfirm","args":["discard"]},"styles":["shared/styles/global-modal.css?v=20260910-discard-outline-1","shared/styles/global-modal-position.css","shared/styles/global-modal-mask.css","shared/styles/global-page-form.css","shared/styles/global-multi-select.css?v=20260915-multi-filter-1","shared/styles/global-date-picker.css","shared/styles/modal-controls.css","features/learning-center/learning-v11.css?v=20260910-study-detail-modal-1","features/learning-center/learning-live.css?v=20260917-live-gold-1"],"scripts":["shared/scripts/global-modal.js","shared/scripts/global-modal-position.js","shared/scripts/global-multi-select.js","shared/scripts/global-date-picker.js","shared/scripts/modal-controls.js","features/learning-center/learning-data.js","features/learning-center/learning-live-data.js?v=20260917-live-copy-1","features/learning-center/learning-live.js?v=20260917-live-gold-1"]}
*/
