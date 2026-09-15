const assert=require('node:assert/strict');

// Historical filename retained for callers. Underlines now switch without motion.
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
  // Rapid reversal must preserve the same instance and selected content.
  before.click();await new Promise(r=>setTimeout(r,50));after.click();await new Promise(r=>setTimeout(r,250));
  return {stable,initial,samples,events,final:[width(before),width(after)],selected:after.getAttribute('aria-selected')};
 },{rootSelector,targetSelector});
 assert.equal(result.stable,true,'same connected Tab nodes and shared instance');
 assert.deepEqual(result.initial,[71,0]);
 assert.equal(result.events.length,0,'no underline transition starts');
 assert.ok(result.samples.length>0,'painted frames captured');
 assert.ok(result.samples.every(([a,b])=>[a,b].every(width=>width===0||width===71)),'underline widths stay discrete without intermediate frames: '+JSON.stringify(result));
 assert.ok(result.samples.some(([a,b])=>a===0&&b===71),'underline reaches its new state');
 assert.deepEqual(result.final,[0,71],'rapid reversal settles correctly');
 assert.equal(result.selected,'true');
 return result;
};
