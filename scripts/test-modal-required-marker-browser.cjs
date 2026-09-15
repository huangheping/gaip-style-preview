// Isolated shared CSS/legacy conflict test, not source-page visual acceptance.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'shared/styles/global-modal.css'), 'utf8');
const shared = css.slice(css.indexOf('/* Required markers:'), css.indexOf('.gaip-modal-controls.gaip-modal-controls.gaip-modal-controls :is(.gaip-form-control, .gaip-form-input-shell)'));
const clueCss = fs.readFileSync(path.join(root, 'web/p__clues__index.29eaa724.chunk.css'), 'utf8');
const legacy = clueCss.match(/[^{}]*ant-form-item-required[^{}]*\{[^}]*\}/g).join('\n') +
  '.ant-form-item-required:not(.ant-form-item-required-mark-optional)::before{content:"*";margin-right:4px}.gaip-activity-modal__label::before{content:"*"}.required___AKcPW{color:#ef4444;margin-left:2px}';
const fixture = '<div class="gaip-modal-kit gaip-modal-form">' +
  '<label id="ant" class="ant-form-item-required" for="name">姓名</label><input id="name" required>' +
  '<div class="createClueWrapper___mpoSg"><label id="clue" class="ant-form-item-required" for="clueName">线索姓名</label><input id="clueName" required></div>' +
  '<label id="optional" class="ant-form-item-required ant-form-item-required-mark-optional">选填</label>' +
  '<label id="activity" class="gaip-activity-modal__label" for="customer">客户姓名</label><input id="customer" required>' +
  '<label id="terminal">关闭原因<span class="required___AKcPW">*</span></label>' +
  '<div class="gaip-announcement-section-heading"><h3 id="announcement">公告标题配置 <span aria-hidden="true">*</span></h3></div>' +
  '<div class="gaip-adjust-target-heading"><label id="node"><span aria-hidden="true">*</span> 目标节点</label></div>' +
  '<label id="long" style="width:130px">很长的字段说明用于检查换行后的星号位置<span class="required___AKcPW">*</span></label>' +
  '</div><div class="createClueWrapper___mpoSg"><label id="outside" class="ant-form-item-required">页面字段</label></div>';
async function main() {
  assert.ok(shared.startsWith('/* Required markers:'));
  const browser = await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try {
    const page = await browser.newPage();
    for (const styles of [legacy+shared,shared+legacy]) {
      await page.setContent('<style>:root{--gaip-modal-error:#ff4d4f}label,h3{font:14px/22px sans-serif;margin:12px 0}'+styles+'</style>'+fixture);
      const results = await page.evaluate(() => {
        const pseudo = id => {const e=document.getElementById(id),s=getComputedStyle(e,'::before');return{id,content:s.content,display:s.display,color:s.color,gap:s.marginRight,after:getComputedStyle(e,'::after').display};};
        const actual = ['terminal','announcement','node','long'].map(id=>{
          const e=document.getElementById(id),m=e.querySelector('span'),t=[...e.childNodes].find(n=>n.nodeType===3&&n.textContent.trim()),r=document.createRange();
          r.selectNodeContents(t);const text=r.getClientRects()[0],mark=m.getBoundingClientRect();
          return{id,markRight:mark.right,textLeft:text.left,color:getComputedStyle(m).color,gap:getComputedStyle(e).columnGap,sourceText:e.textContent};
        });
        return {pseudo:['ant','clue','activity','outside'].map(pseudo),optional:getComputedStyle(document.getElementById('optional'),'::before').content,actual,required:document.querySelectorAll('input[required]').length};
      });
      for (const p of results.pseudo.filter(p=>p.id!=='outside')) {
        assert.equal(p.content,'"*"');assert.equal(p.display,'inline-block');assert.equal(p.color,'rgb(255, 77, 79)');assert.equal(p.gap,'4px');
      }
      assert.equal(results.pseudo.find(p=>p.id==='clue').after,'none','no duplicate trailing star');
      assert.equal(results.pseudo.find(p=>p.id==='outside').display,'none','page source exception untouched');
      for(const p of results.actual){assert.equal(p.color,'rgb(255, 77, 79)');assert.equal(p.gap,'4px');assert.ok(Math.abs(p.textLeft-p.markRight-4)<0.1,p.id+' marker visually precedes text with shared gap');}
      assert.equal(results.actual.find(p=>p.id==='terminal').sourceText,'关闭原因*','React child order preserved');
      assert.equal(results.required,3,'required attributes preserved');
      assert.equal(results.optional,'none','optional labels gain no required marker');
      await page.locator('#clue').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'clueName','label linkage preserved');
    }
    console.log('PASS: required marker leading position, 4px gap, shared color, long label, both CSS orders, no duplicates, source nodes/required/label linkage; isolated Chromium '+browser.version());
  } finally {await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
