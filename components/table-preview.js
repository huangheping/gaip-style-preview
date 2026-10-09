(function () {
  'use strict';
  window.__GAIP_TABLE_PREVIEW__ = { mount: function (catalog) {
    var root = catalog.querySelector('[data-gaip-table-demo]'); if (!root || !window.__GAIP_TABLE__) return;
    if (root.__actionPreview) return root.__actionPreview;
    var instance, mode = 'short', feedback = catalog.querySelector('[data-table-demo-feedback]');
    var names = ['全球资产配置基础', '客户沟通与需求分析', '保险产品进阶', '跨境财富规划', '合规与风险识别', '投资市场观察'];
    var panel = catalog.querySelector('[data-table-action-panel]'), activeRow = null;
    var listeners = [], disposed = false, entry = root.closest('.componentEntry');
    var menu = window.__GAIP_TABLE__.createActionMenu(root, panel, {
      visibilityRoot: entry,
      onSelect: function (button) { report(activeRow, button.dataset.tableAction); }
    });
    function close(restoreFocus) { menu.close(restoreFocus); }
    function open(button, row, last) { activeRow = row; panel.setAttribute('aria-label', row.name + '的更多操作'); menu.open(button, last); }
    function report(row, label) { feedback.textContent = '已点击「' + row.name + '」的' + label + '（仅预览演示，不修改课程数据）'; }
    function listen(node, event, handler) { node.addEventListener(event, handler); listeners.push(function () { node.removeEventListener(event, handler); }); }
    function destroy() {
      if (disposed) return; disposed = true; menu.destroy();
      listeners.forEach(function (remove) { remove(); });
      if (instance) instance.destroy();
      delete root.__actionPreview;
    }
    root.__actionPreview = {destroy:destroy};
    function show(next) {
      close(false);
      mode = next;
      var wide = mode === 'wide', total = mode === 'short' ? 3 : mode === 'empty' ? 0 : 86;
      var rows = Array.from({length: total}, function (_, i) { return { id: i + 1, name: names[i % names.length] + (i > 5 ? ' · 第 ' + (i + 1) + ' 期' : ''), featured: i % 3 === 0, status: ['草稿', '已上架', '已下架'][i % 3], group: '全部学习群组', lessons: (i % 12) + 1, date: '2026-09-09 10:30', owner: '课程管理员' }; });
      var columns = [
        {key:'name',label:'课程名称',width:wide?280:230,fixed:wide?'left':null,render:function(row){ var cell=document.createElement('div'),title=document.createElement('div');title.textContent=row.name;cell.appendChild(title);if(row.featured){var tag=window.__GAIP_TABLE__.tag('精选',{tone:'highlight'});tag.classList.add('gaip-table-demo-featured');cell.appendChild(tag);}return cell; }},
        {key:'status',label:'状态',width:100,render:function(row){return window.__GAIP_TABLE__.tag(row.status,{tone:row.status==='已上架'?'success':'neutral'});}},
        {key:'group',label:'学习群组',width:150},
        {key:'lessons',label:'课节数',width:90,align:'center'}
      ];
      if (wide) columns.push({key:'date',label:'创建时间',width:190},{key:'owner',label:'创建人',width:150},{key:'date',label:'最近更新',width:190});
      columns.push({label:'操作',width:192,fixed:'right',render:function(row){
        var group = document.createElement('div'); group.className = 'gaip-table__row-actions';
        ['编辑','学情'].forEach(function(label){
          var button = document.createElement('button'); button.type='button'; button.className='gaip-table__button'; button.textContent=label;
          button.addEventListener('click',function(){report(row,label);}); group.appendChild(button);
        });
        var more=document.createElement('button'); more.type='button'; more.className='gaip-table__button gaip-table__more tableDemo__more'; more.textContent='更多';
        more.setAttribute('aria-label',row.name+'的更多操作'); more.setAttribute('aria-haspopup','menu'); more.setAttribute('aria-expanded','false'); more.setAttribute('aria-controls',panel.id);
        more.addEventListener('click',function(){open(more,row,false);});
        more.addEventListener('keydown',function(event){
          if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(menu.isOpen(more))close(false);open(more,row,event.key==='ArrowUp');}
        });
        group.appendChild(more); return group;
      }});
      if (instance) instance.destroy();
      instance = window.__GAIP_TABLE__.mount(root, {title:'课程列表',rows:rows,columns:columns,minWidth:wide?1342:762,pageSize:mode==='long'||wide?50:10,
        onRetry:function(){show('long');feedback.textContent='重新加载成功';}
      });
      if (mode==='loading'||mode==='error') instance.setState(mode);
      catalog.querySelectorAll('[data-table-demo]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.tableDemo===mode));});
      catalog.querySelector('[data-table-demo-note]').textContent = mode==='short'?'只有 3 条记录，分页紧随表格；切换长列表查看底部停留效果。':wide?'横向滚动查看全部字段，课程名称和操作列保持可见。':'表格达到页面可用高度后，仅数据区域滚动；表头和分页保持可见。';
      catalog.querySelector('[data-table-demo-note]').textContent += ' 点击行内「更多」体验更多操作浮层，与课程管理共用菜单交互；此处操作仅演示。';
      feedback.textContent='';
    }
    catalog.querySelectorAll('[data-table-demo]').forEach(function(b){listen(b,'click',function(){show(b.dataset.tableDemo);});});
    show('short');
    return root.__actionPreview;
  }};
}());
