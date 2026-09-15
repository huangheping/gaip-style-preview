(function () {
  'use strict';
  window.__GAIP_TABLE_PREVIEW__ = { mount: function (catalog) {
    var root = catalog.querySelector('[data-gaip-table-demo]'); if (!root || !window.__GAIP_TABLE__) return;
    var instance, mode = 'short', feedback = catalog.querySelector('[data-table-demo-feedback]');
    var names = ['全球资产配置基础', '客户沟通与需求分析', '保险产品进阶', '跨境财富规划', '合规与风险识别', '投资市场观察'];
    function show(next) {
      mode = next;
      var wide = mode === 'wide', total = mode === 'short' ? 3 : mode === 'empty' ? 0 : 86;
      var rows = Array.from({length: total}, function (_, i) { return { id: i + 1, name: names[i % names.length] + (i > 5 ? ' · 第 ' + (i + 1) + ' 期' : ''), featured: i % 3 === 0, status: ['草稿', '已上架', '已下架'][i % 3], group: '全部学习群组', lessons: (i % 12) + 1, date: '2026-09-09 10:30', owner: '课程管理员' }; });
      var columns = [
        {key:'name',label:'课程名称',width:wide?280:230,fixed:wide?'left':null,render:function(row){ var cell=document.createElement('div'),title=document.createElement('div');title.textContent=row.name;cell.appendChild(title);if(row.featured){var tag=window.__GAIP_TABLE__.tag('精选',{tone:'highlight'});tag.style.marginTop='6px';cell.appendChild(tag);}return cell; }},
        {key:'status',label:'状态',width:100,render:function(row){return window.__GAIP_TABLE__.tag(row.status,{tone:row.status==='已上架'?'success':'neutral'});}},
        {key:'group',label:'学习群组',width:150},
        {key:'lessons',label:'课节数',width:90,align:'center'}
      ];
      if (wide) columns.push({key:'date',label:'创建时间',width:190},{key:'owner',label:'创建人',width:150},{key:'date',label:'最近更新',width:190});
      columns.push({label:'操作',width:160,fixed:wide?'right':null,render:function(row){
        var group = document.createElement('div'); group.className = 'gaip-table__row-actions';
        ['编辑','删除'].forEach(function(label){ var b = document.createElement('button'); b.type='button';b.className='gaip-table__button'+(label==='删除'?' is-danger':''); b.textContent=label; b.disabled=label==='删除'&&row.status!=='草稿'; if(b.disabled)b.title='仅草稿可以删除'; b.onclick=function(){feedback.textContent='已点击「'+row.name+'」的'+label+'（组件演示）';};group.appendChild(b); });return group;
      }});
      if (instance) instance.destroy();
      instance = window.__GAIP_TABLE__.mount(root, {title:'课程列表',rows:rows,columns:columns,minWidth:wide?1310:730,pageSize:mode==='long'||wide?50:10,
        onRetry:function(){show('long');feedback.textContent='重新加载成功';}
      });
      if (mode==='loading'||mode==='error') instance.setState(mode);
      catalog.querySelectorAll('[data-table-demo]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.tableDemo===mode));});
      catalog.querySelector('[data-table-demo-note]').textContent = mode==='short'?'只有 3 条记录，分页紧随表格；切换长列表查看底部停留效果。':wide?'横向滚动查看全部字段，课程名称和操作列保持可见。':'表格达到页面可用高度后，仅数据区域滚动；表头和分页保持可见。';
      feedback.textContent='';
    }
    catalog.querySelectorAll('[data-table-demo]').forEach(function(b){b.addEventListener('click',function(){show(b.dataset.tableDemo);});});
    show('short');
  }};
}());
