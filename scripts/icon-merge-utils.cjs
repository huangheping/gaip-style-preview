'use strict';
const {JSDOM}=require('jsdom');
// Shared drawing stays in the selected SVG; context attributes preserve the
// consumer's sizing, accessibility and event hooks without copying old paths.
function renderMergedSVG(source,contextAttrs={},ant=false){
 const dom=new JSDOM(source,{contentType:'image/svg+xml'}),svg=dom.window.document.documentElement;
 if(!svg.hasAttribute('viewBox')){const w=parseFloat(svg.getAttribute('width')),h=parseFloat(svg.getAttribute('height'));if(!(w>0&&h>0))throw Error('Merged SVG needs a scalable canvas');svg.setAttribute('viewBox','0 0 '+w+' '+h);}
 svg.querySelectorAll('title,desc').forEach(n=>n.remove());
 // Selected drawings in this batch do not reference IDs; strip unused drawing
 // IDs so repeated instances never duplicate them in the actual document.
 if(!/url\(#|(?:href|xlink:href)\s*=/.test(source))svg.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
 // A drawing's export dimensions are not the consumer's display contract.
 // Restore only dimensions explicitly supplied by the original consumer;
 // otherwise its CSS (including 1em Ant sizing) owns the viewport.
 svg.removeAttribute('width');svg.removeAttribute('height');
 Object.entries(contextAttrs).forEach(([k,v])=>svg.setAttribute(k,v));
 if(ant){svg.removeAttribute('width');svg.removeAttribute('height');svg.removeAttribute('xmlns:xlink');}
 const result=svg.outerHTML.replace(/^[\t ]+$/gm,'');dom.window.close();return result;
}
module.exports={renderMergedSVG};
