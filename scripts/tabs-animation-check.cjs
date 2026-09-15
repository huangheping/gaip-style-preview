const assert=require('node:assert/strict');

// Observe actual painted intermediate values, not just transition declarations.
module.exports=async function checkTabAnimation(page,rootSelector,targetSelector){
 const result=await page.evaluate(async({rootSelector,targetSelector})=>{
  const root=document.querySelector(rootSelector),before=root.querySelector('[aria-selected="true"]'),after=root.querySelector(targetSelector),api=__GAIP_TABS__.get(root);
  const width=n=>parseFloat(getComputedStyle(n,'::after').width);
  const samples=[],events=[];
  const listen=e=>{if(e.propertyName==='width'&&e.pseudoElement==='::after')events.push(e.type);};
  root.addEventListener('transitionrun',listen);
  // Flush the old selected style before driving the real consumer click path.
  const initial=[width(before),width(after)];after.click();
  await new Promise(resolve=>{const start=performance.now();function frame(){samples.push([width(before),width(after)]);if(performance.now()-start<300)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
  root.removeEventListener('transitionrun',listen);
  const stable=document.querySelector(rootSelector)===root&&before.isConnected&&after.isConnected&&__GAIP_TABS__.get(root)===api;
  // Reverse midway and switch back; the final state must agree with content.
  before.click();await new Promise(r=>setTimeout(r,50));after.click();await new Promise(r=>setTimeout(r,250));
  return {stable,initial,samples,events,final:[width(before),width(after)],selected:after.getAttribute('aria-selected')};
 },{rootSelector,targetSelector});
 assert.equal(result.stable,true,'same connected Tab nodes and shared instance');
 assert.deepEqual(result.initial,[71,0]);
 assert.ok(result.events.length>=2,'both underline transitions start');
 assert.ok(result.samples.some(([a,b])=>a>0&&a<71&&b>0&&b<71),'both underlines have intermediate animated widths');
 assert.deepEqual(result.final,[0,71],'rapid reversal settles correctly');
 assert.equal(result.selected,'true');
 return result;
};
