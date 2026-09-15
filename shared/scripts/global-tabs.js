(function () {
  'use strict';
  if(window.__GAIP_TABS__)return;
  var instances=new Map(),frame=0;
  var adapters=[
    {selector:'.productArea___xMLm_ .filterTab___qn4xZ',label:'产品分类',selected:function(b){return b.classList.contains('active___Sfjac');}},
    {selector:'.gaip-config-original .tabs___U1Hwt',label:'组织渠道',selected:function(b){return b.classList.contains('tabActive___H5olV');}},
    {selector:'.lc-stats-tabs',label:'统计维度',selected:function(b){return b.getAttribute('aria-selected')==='true';}}
  ];
  function setAttr(n,k,v){if(n.getAttribute(k)!==String(v))n.setAttribute(k,String(v));}
  function enhance(root,options){
    if(instances.has(root))return instances.get(root);
    options=options||{};
    function items(){return Array.from(root.children).filter(function(b){return b.tagName==='BUTTON';});}
    function sync(){
      var buttons=items(),firstEnabled=buttons.findIndex(function(b){return !b.disabled;}),selected=buttons.map(function(b){return options.selected?options.selected(b):b.getAttribute('aria-selected')==='true';});
      root.setAttribute('data-gaip-tabs','');setAttr(root,'role','tablist');setAttr(root,'aria-label',options.label||'页面切换');
      buttons.forEach(function(b,i){b.setAttribute('data-gaip-tab','');setAttr(b,'role','tab');setAttr(b,'aria-selected',selected[i]);setAttr(b,'tabindex',!b.disabled&&(selected[i]||!selected.some(Boolean)&&i===firstEnabled)?0:-1);});
    }
    function keydown(ev){
      var buttons=items().filter(function(b){return !b.disabled&&b.getAttribute('aria-disabled')!=='true';}),i=buttons.indexOf(ev.target),next;
      if(i<0)return;
      if(ev.key==='ArrowRight')next=(i+1)%buttons.length;else if(ev.key==='ArrowLeft')next=(i-1+buttons.length)%buttons.length;else if(ev.key==='Home')next=0;else if(ev.key==='End')next=buttons.length-1;else return;
      ev.preventDefault();ev.stopPropagation();var target=buttons[next],index=items().indexOf(target);target.focus({preventScroll:true});target.click();
      queueMicrotask(function(){scan();var current=root.isConnected?root:options.selector&&document.querySelector(options.selector);if(!current)return;var b=Array.from(current.children).filter(function(n){return n.tagName==='BUTTON';})[index];if(b){b.focus({preventScroll:true});if(b.scrollIntoView)b.scrollIntoView({block:'nearest',inline:'nearest'});}});
    }
    root.addEventListener('keydown',keydown);
    var api={sync:sync,destroy:function(){root.removeEventListener('keydown',keydown);instances.delete(root);root.removeAttribute('data-gaip-tabs');items().forEach(function(b){b.removeAttribute('data-gaip-tab');});}};
    instances.set(root,api);sync();return api;
  }
  function mount(root,config){
    config=config||{};if(instances.has(root))instances.get(root).destroy();root.replaceChildren();
    var items=config.items||[],enabled=items.filter(function(x){return !x.disabled;}),value=enabled.some(function(x){return String(x.key)===String(config.value);})?String(config.value):enabled[0]?String(enabled[0].key):'';
    items.forEach(function(item){var b=document.createElement('button');b.type='button';b.dataset.tabKey=String(item.key);b.textContent=item.label;b.disabled=!!item.disabled;
      if(item.count!=null){b.append(' ( ');var count=document.createElement('span');count.className='gaip-tabs-count';count.textContent=item.count;b.append(count,' )');}root.appendChild(b);
    });
    var api=enhance(root,{label:config.label,selected:function(b){return b.dataset.tabKey===value;}});
    function select(key,notify){var b=Array.from(root.children).find(function(n){return n.dataset.tabKey===String(key)&&!n.disabled;});if(!b||value===String(key))return;value=String(key);api.sync();if(notify&&config.onChange)config.onChange(value);}
    function click(ev){var b=ev.target.closest('[data-tab-key]');if(b&&b.parentElement===root&&!b.disabled)select(b.dataset.tabKey,true);}
    root.addEventListener('click',click);var destroy=api.destroy;
    api.destroy=function(){root.removeEventListener('click',click);destroy();root.replaceChildren();};api.getValue=function(){return value;};api.setValue=function(v){select(v,false);};return api;
  }
  function scan(){
    frame=0;if(!window.document||!document.documentElement)return;
    instances.forEach(function(api,root){if(!root.isConnected)api.destroy();});
    adapters.forEach(function(a){document.querySelectorAll(a.selector).forEach(function(root){enhance(root,a).sync();});});
  }
  function schedule(){if(window.document&&document.documentElement&&!frame)frame=requestAnimationFrame(scan);}
  var selector=adapters.map(function(a){return a.selector;}).join(',');
  var observer=new MutationObserver(function(records){
    if(records.some(function(r){if(r.type==='attributes')return r.target.matches('button')&&r.target.parentElement&&r.target.parentElement.matches(selector);
      return Array.from(r.addedNodes).concat(Array.from(r.removedNodes)).some(function(n){return n.nodeType===1&&(n.matches(selector)||n.querySelector(selector)||n.matches('button')&&r.target.matches&&r.target.matches(selector));});}))schedule();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','disabled']});
  window.__GAIP_TABS__={mount:mount,enhance:enhance,refresh:scan,get:function(root){return instances.get(root);}};
  scan();
})();
