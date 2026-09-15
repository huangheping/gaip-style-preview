/* Shared local organization nodes. Config owns mutations; consumers use stable keys. */
(function () {
  'use strict';
  if (window.__GAIP_ORGANIZATION__) return;
  var channels = ['薄荷经纪人','Glory品牌顾问','外部机构渠道','线上渠道','小仓','荣耀经纪人'];
  var seed = [
    ['all','薄荷经纪人',0],['department-1','测试部门',1],['department-2','测试1部',2],['department-3','测试-测试1',3],
    ['mock-level-3-east','华东业务组',3],['mock-level-3-institution','机构服务组',3],['mock-level-3-key-account','重点客户支持与运营组',3],['mock-level-3-follow-up','区域客户跟进组',3],
    ['department-4','测试2部',2],['department-5','研发部',1],['department-6','aabbccddee Jin Ark eeddeedddd Limited（龙马精神同舟有限公司）',2],
    ['department-7','334567890-0987656789',3],['department-8','33456789876567876789',4],
    ['department-9','aabbccddee Jin Ark eeddeedddd Limited（龙马精神同舟有限公司）aabbccddee Jin Ark eeddeedddd Limited（龙马精神同舟有限公司）',4],
    ['department-10','b',2],['department-11','分页61213121',1],['department-12','分页8',1],['department-13','分页9',1],
    ['department-14','家族1',1],['department-15','家族2',1],['department-16','家族3',1],['department-17','家族4',1],['department-18','测试256',1]
  ];
  var sets = channels.map(function () { var parents=[];return seed.map(function (a) {var n={id:a[0],name:a[1],depth:a[2],parent:a[2]?parents[a[2]-1]:null};parents[a[2]]=a[0];return n;}); });
  function key(channel,id) { return channel+':'+id; }
  function nodes() { return sets.flatMap(function(set,c){return set.map(function(n){return {id:key(c,n.id),parent:n.parent==null?null:key(c,n.parent),name:n.id==='all'?channels[c]:n.name,depth:n.depth};});}); }
  function path(id) { var all=nodes(), parts=[],seen=new Set();while(id&&!seen.has(id)){seen.add(id);var n=all.find(function(x){return x.id===id;});if(!n)break;parts.unshift(n.name);id=n.parent;}return parts.join('/'); }
  function contains(parent,id) { var all=nodes(),seen=new Set();while(id&&!seen.has(id)){if(id===parent)return true;seen.add(id);var n=all.find(function(x){return x.id===id;});id=n&&n.parent;}return false; }
  var references=[];
  window.__GAIP_ORGANIZATION__={channels:channels,sets:sets,key:key,nodes:nodes,path:path,contains:contains,
    changed:function(){window.dispatchEvent(new CustomEvent('gaip:organization-change'));},
    registerReferences:function(fn){references.push(fn);},
    referenced:function(id){return references.some(function(fn){return fn(id);});}
  };
})();
