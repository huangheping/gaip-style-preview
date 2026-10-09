(function (w) {
  'use strict';
  if (w.__GAIP_DATE_PICKER__) return;
  function date(year, month, day) { var d = new Date(); d.setHours(12,0,0,0); d.setFullYear(year,month,day); return d; }
  function iso(d) { return String(d.getFullYear()).padStart(4,'0') + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
  function parse(value) { var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || ''); if (!p) return null; var d = date(+p[1],+p[2]-1,+p[3]); return iso(d) === value ? d : null; }
  // This renderer owns only the calendar; callers own their existing input, popup and value events.
  function mount(root, options) {
    var o = options || {}, selected = o.value || '', initial = parse(selected) || o.month || new Date();
    var month = date(initial.getFullYear(),initial.getMonth(),1), mode = 'date', destroyed = false;
    root.classList.add('gaip-date-panel'); root.setAttribute('data-gaip-form-field','exclude');
    function valid(value) { return !!parse(value) && value >= '0001-01-01' && value <= '9999-12-31' && (!o.isDateEnabled || o.isDateEnabled(value)); }
    function element(tag, cls, text, parent) { var n = document.createElement(tag); n.className = cls; if (text != null) n.textContent = text; parent.appendChild(n); return n; }
    function button(parent, text, label, action, cls) { var b = element('button',cls || 'gaip-date-panel__period',text,parent); b.type='button'; b.setAttribute('aria-label',label); b.addEventListener('click',action); return b; }
    function choose(value) { if (!valid(value)) return; selected=value; if(o.onSelect)o.onSelect(value); }
    function redraw(focusLabel) { render(); if (focusLabel) { var b=Array.from(root.querySelectorAll('button')).find(function(b){return b.getAttribute('aria-label')===focusLabel;}); if(!b || b.disabled)b=root.querySelector('[aria-pressed="true"]:not(:disabled), .gaip-date-panel__heading'); if(b)b.focus({preventScroll:true}); } if(o.onLayout)o.onLayout(); }
    function move(delta, label) { var next=date(month.getFullYear(),month.getMonth()+delta,1); if(next.getFullYear()<1||next.getFullYear()>9999)return;month=next;redraw(label); }
    function render() {
      if(destroyed)return; root.replaceChildren();root.dataset.mode=mode;
      var head=element('div','gaip-date-panel__header',null,root);
      function nav(label, delta, direction, double) {
        var b=button(head,'',label,function(){move(delta,label);},'gaip-date-panel__nav');
        var icon=element('span','gaip-date-panel__arrow'+(double?' is-double':'')+(direction==='next'?' is-next':''),null,b);icon.setAttribute('aria-hidden','true');
        var next=date(month.getFullYear(),month.getMonth()+delta,1);b.disabled=next.getFullYear()<1||next.getFullYear()>9999;
      }
      nav(mode==='year'?'上十年':'上一年',mode==='year'?-120:-12,'prev',true);
      if(mode==='date')nav('上个月',-1,'prev',false);
      var title=element('div','gaip-date-panel__title',null,head);title.setAttribute('aria-live','polite');
      var year=month.getFullYear(), start=Math.floor(year/10)*10;
      button(title,mode==='year'?start+'年 – '+(start+9)+'年':year+'年','选择年份',function(){mode='year';redraw('选择年份');},'gaip-date-panel__heading');
      if(mode==='date')button(title,(month.getMonth()+1)+'月','选择月份',function(){mode='month';redraw('选择年份');},'gaip-date-panel__heading');
      if(mode==='date')nav('下个月',1,'next',false);
      nav(mode==='year'?'下十年':'下一年',mode==='year'?120:12,'next',true);
      var grid=element('div','gaip-date-panel__grid'+(mode==='date'?'':' is-period'),null,root);grid.setAttribute('role','group');grid.setAttribute('aria-label',mode==='date'?'选择日期':mode==='month'?'选择月份':'选择年份');
      if(mode==='date') {
        ['一','二','三','四','五','六','日'].forEach(function(day){element('span','gaip-date-panel__weekday',day,grid);});
        var first=date(year,month.getMonth(),1-(month.getDay()+6)%7), today=iso(new Date());
        for(var i=0;i<42;i++)(function(i){
          var d=date(first.getFullYear(),first.getMonth(),first.getDate()+i), value=iso(d);
          var cell=element('div','gaip-date-panel__cell',null,grid);
          var b=button(cell,String(d.getDate()),value,function(){choose(value);},'gaip-date-panel__day');b.dataset.date=value;b.disabled=!valid(value);
          b.classList.toggle('is-outside',d.getMonth()!==month.getMonth());b.setAttribute('aria-pressed',String(value===selected));
          if(value===today)b.setAttribute('aria-current','date');
        }(i));
        grid.addEventListener('keydown',function(e){
          var current=e.target.closest('[data-date]');if(!current)return;
          var delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[e.key];
          if(delta==null)return;e.preventDefault();e.stopPropagation();
          var next=parse(current.dataset.date);next.setDate(next.getDate()+delta);var value=iso(next);if(!valid(value))return;
          month=date(next.getFullYear(),next.getMonth(),1);redraw(value);
        });
      } else {
        for(var j=0;j<12;j++)(function(j){
          var value=mode==='year'?start-1+j:j, isYear=mode==='year';
          var b=button(grid,isYear?value+'年':(j+1)+'月',isYear?value+'年':(j+1)+'月',function(){
            month=isYear?date(value,month.getMonth(),1):date(year,j,1);mode=isYear?'month':'date';redraw('选择月份');
          });b.disabled=isYear&&(value<1||value>9999);
          b.setAttribute('aria-pressed',String(isYear?value===year:j===month.getMonth()));
          if(isYear&&(j===0||j===11))b.classList.add('is-outside');
        }(j));
      }
      var footer=element('div','gaip-date-panel__footer',null,root), today=iso(new Date());
      button(footer,'今天','今天',function(){choose(today);},'gaip-date-panel__today').disabled=!valid(today);
    }
    render();
    return { destroy:function(){destroyed=true;root.replaceChildren();root.classList.remove('gaip-date-panel');}, getMonth:function(){return new Date(month);} };
  }
  w.__GAIP_DATE_PICKER__={version:'1.0.0',mount:mount,parse:parse,format:iso,width:288};
}(window));
