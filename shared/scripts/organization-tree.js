/* One node renderer for organization management and organization pickers. */
(function () {
  'use strict';
  if(window.__GAIP_ORG_TREE__)return;
  var base='features/config-center/assets/';
  if(document.currentScript&&document.currentScript.src)base=new URL('../../features/config-center/assets/',document.currentScript.src).href;
  function nodeRow(options) {
    var row=options.template?options.template.cloneNode(true):document.createElement('div');
    if(!options.template)row.innerHTML='<span class="ant-tree-indent"></span><span class="ant-tree-switcher"></span><span class="ant-tree-node-content-wrapper"><img class="folderIcon___yjhFX" alt=""><span class="treeNodeName___mtuTp"></span></span>';
    row.classList.add('gaip-org-node');row.dataset.nodeId=options.id;row.setAttribute('role','treeitem');row.setAttribute('aria-level',options.depth+1);row.setAttribute('aria-selected',String(!!options.selected));
    row.querySelector('.ant-tree-indent').innerHTML='<span class="ant-tree-indent-unit"></span>'.repeat(options.depth);
    var label=row.querySelector('.treeNodeName___mtuTp');label.textContent=options.name;label.title=options.path||options.name;
    var icon=row.querySelector('.folderIcon___yjhFX');if(icon){icon.src=base+(options.children&&options.expanded?'folder-open.svg?v=20260904-4':'folder.png');icon.alt='';}
    var toggle=row.querySelector('.ant-tree-switcher');
    toggle.className='ant-tree-switcher '+(options.children?(options.expanded?'ant-tree-switcher_open':'ant-tree-switcher_close'):'ant-tree-switcher-noop');
    toggle.innerHTML=options.children?(options.switcherMarkup||'<span class="gaip-org-caret" aria-hidden="true"></span>'):'';
    toggle.removeAttribute('data-collapse');toggle.removeAttribute('role');toggle.removeAttribute('tabindex');toggle.removeAttribute('aria-label');
    if(options.children){row.setAttribute('aria-expanded',String(!!options.expanded));toggle.setAttribute('role','button');toggle.tabIndex=0;toggle.setAttribute('aria-label',(options.expanded?'收起':'展开')+options.name);}
    else row.removeAttribute('aria-expanded');
    return row;
  }
  function mount(root,options) {
    var expanded=new Set(), selected=options.value||'',query='',data=options.nodes||[];
    data.filter(function(n){return !data.some(function(p){return p.id===n.parent;});}).forEach(function(n){expanded.add(n.id);});
    function ancestors(id,fn){var seen=new Set();while(id&&!seen.has(id)){seen.add(id);var n=data.find(function(x){return x.id===id;});if(!n)break;fn(n);id=n.parent;}}
    if(selected)ancestors(selected,function(n){expanded.add(n.id);});
    function render(focusId){
      var allowed=new Set(),needle=query.trim().toLocaleLowerCase(),scroll=root.scrollTop;
      if(needle)data.forEach(function(n){if(n.name.toLocaleLowerCase().includes(needle))ancestors(n.id,function(p){allowed.add(p.id);});});
      root.replaceChildren();root.classList.add('gaip-org-tree');root.setAttribute('role','tree');root.setAttribute('aria-label',options.label||'组织节点');
      data.forEach(function(n){
        var visible=true,depth=-1;ancestors(n.id,function(p){depth++;if(p.id!==n.id&&!expanded.has(p.id))visible=false;});
        if(!visible||(needle&&!allowed.has(n.id)))return;
        var children=data.some(function(p){return p.parent===n.id;}),open=expanded.has(n.id);
        var row=nodeRow({id:n.id,name:n.name,path:n.path,depth:depth,children:children,expanded:open,selected:selected===n.id});
        row.tabIndex=selected===n.id?0:-1;root.appendChild(row);
      });
      if(!root.children.length){var empty=document.createElement('p');empty.className='gaip-org-empty';empty.textContent='未找到匹配组织';empty.setAttribute('role','status');root.appendChild(empty);}
      else if(!root.querySelector('[tabindex="0"][role="treeitem"]'))root.firstElementChild.tabIndex=0;
      root.scrollTop=scroll;if(focusId){var f=Array.from(root.children).find(function(n){return n.dataset.nodeId===focusId;});if(f)f.focus({preventScroll:true});}
    }
    function toggle(id){if(expanded.has(id))expanded.delete(id);else expanded.add(id);render(id);}
    function choose(id){selected=id;render();if(options.onSelect)options.onSelect(id);}
    function click(ev){var row=ev.target.closest('[data-node-id]');if(!row||!root.contains(row))return;if(ev.target.closest('.ant-tree-switcher:not(.ant-tree-switcher-noop)'))toggle(row.dataset.nodeId);else choose(row.dataset.nodeId);}
    function keydown(ev){var row=ev.target.closest('[data-node-id]');if(!row)return;var id=row.dataset.nodeId,rows=Array.from(root.querySelectorAll('[role="treeitem"]')),index=rows.indexOf(row),next;
      if(ev.key==='ArrowDown')next=rows[Math.min(index+1,rows.length-1)];else if(ev.key==='ArrowUp')next=rows[Math.max(0,index-1)];else if(ev.key==='Home')next=rows[0];else if(ev.key==='End')next=rows[rows.length-1];
      else if(ev.key==='ArrowRight'){if(row.hasAttribute('aria-expanded')&&row.getAttribute('aria-expanded')!=='true'){expanded.add(id);render(id);}else next=rows[index+1];}
      else if(ev.key==='ArrowLeft'){if(row.getAttribute('aria-expanded')==='true'){expanded.delete(id);render(id);}else{var item=data.find(function(n){return n.id===id;});next=rows.find(function(n){return n.dataset.nodeId===item.parent;});}}
      else if(ev.key==='Enter'||ev.key===' '){if(ev.target.closest('.ant-tree-switcher'))toggle(id);else choose(id);}else return;
      ev.preventDefault();ev.stopPropagation();if(next)next.focus();
    }
    root.addEventListener('click',click);root.addEventListener('keydown',keydown);render();
    return {search:function(q){query=q;var needle=q.trim().toLocaleLowerCase();if(needle)data.forEach(function(n){if(n.name.toLocaleLowerCase().includes(needle))ancestors(n.id,function(p){expanded.add(p.id);});});render();},setValue:function(v){selected=v;render();},destroy:function(){root.removeEventListener('click',click);root.removeEventListener('keydown',keydown);root.replaceChildren();}};
  }
  window.__GAIP_ORG_TREE__={node:nodeRow,mount:mount};
})();
