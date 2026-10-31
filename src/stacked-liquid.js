/**
 * NexaPag LiquidOrb material renderer.
 * Pigments are stacked bottom-up. Boundaries follow the existing damped
 * 1D surface solver; all finance fractions are calculated by app.js from
 * circular segment area (not rectangular height). This module ONLY paints.
 */
const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
function rgb(hex){const v=hex.replace('#','');return [0,2,4].map(i=>parseInt(v.slice(i,i+2),16));}
function mix(a,b,t){const x=rgb(a),y=rgb(b);return `rgb(${x.map((c,i)=>Math.round(c+(y[i]-c)*t)).join(',')})`;}
function lift(hex,a){return mix(hex,a>=0?'#ffffff':'#071418',Math.abs(a));}
function pathBetween(ctx,xs,upper,lower){
 ctx.beginPath();ctx.moveTo(xs[0],lower(xs[0]));
 for(let j=1;j<xs.length;j++)ctx.lineTo(xs[j],lower(xs[j]));
 for(let j=xs.length-1;j>=0;j--)ctx.lineTo(xs[j],upper(xs[j]));
 ctx.closePath();
}
export function paintStackedLiquid({ctx,w,center,r,entries,cumulative,xvals,surfaceY,large,seam,iridescence}){
 ctx.clearRect(0,0,w,w);
 if(!entries.length)return;
 const L=entries.length,top=w*(1-cumulative[L]);
 ctx.save();ctx.beginPath();ctx.arc(center,center,r,0,Math.PI*2);ctx.clip();
 // Neutral optical chamber. It has no category pigment until the liquid begins.
 const chamber=ctx.createRadialGradient(w*.32,w*.15,w*.01,w*.56,w*.56,w*.7);
 chamber.addColorStop(0,'#5f827e');chamber.addColorStop(.31,'#2d5552');
 chamber.addColorStop(.75,'#142d2e');chamber.addColorStop(1,'#0b1a1e');
 ctx.fillStyle=chamber;ctx.fillRect(0,0,w,w);
 let low=()=>w;
 for(let k=0;k<L;k++){
   const up=x=>surfaceY(k,x),hex=entries[k].color;
   ctx.save();pathBetween(ctx,xvals,up,low);ctx.clip();
   // Pigment is a liquid body, not a rainbow overlay on the spherical glass.
   const y0=w*(1-cumulative[k]),y1=w*(1-cumulative[k+1]);
   const gradient=ctx.createLinearGradient(0,y1,0,y0);
   gradient.addColorStop(0,lift(hex,.13));
   gradient.addColorStop(.34,hex);
   gradient.addColorStop(1,lift(hex,-.18));
   ctx.fillStyle=gradient;ctx.fillRect(0,0,w,w);
   // Localized lighting is modulated by this pigment, not by unrelated hues.
   const spot=ctx.createRadialGradient(w*.27,y1+(y0-y1)*.26,0,w*.27,y1+(y0-y1)*.26,w*.47);
   spot.addColorStop(0,'rgba(253,255,251,.11)');spot.addColorStop(.52,'rgba(246,255,251,.038)');spot.addColorStop(1,'rgba(255,255,255,0)');
   ctx.fillStyle=spot;ctx.fillRect(0,0,w,w);
   ctx.restore();
   low=up;
 }
 // Each interface receives a short optical diffusion band; the two masses
 // remain separate, with a gradual perceptual bridge at their contact point.
 for(let k=0;k<L-1;k++){
   const up=x=>surfaceY(k,x);
   const loColor=entries[k].color,hiColor=entries[k+1].color;
   const thickness=(cumulative[k+1]-cumulative[k])*w;
   const thicknessAbove=(cumulative[k+2]-cumulative[k+1])*w;
   const half=Math.min(w*(large?.018:.014),Math.max(.8,Math.min(thickness,thicknessAbove)*.23))*(.40+clamp(seam)*.84);
   const steps=9;
   for(let j=0;j<steps;j++){
     const t=(j+.5)/steps;
     const a=x=>up(x)-half+(2*half*j/steps);
     const b=x=>up(x)-half+(2*half*(j+1)/steps);
     ctx.beginPath();ctx.moveTo(xvals[0],a(xvals[0]));
     for(let i=1;i<xvals.length;i++)ctx.lineTo(xvals[i],a(xvals[i]));
     for(let i=xvals.length-1;i>=0;i--)ctx.lineTo(xvals[i],b(xvals[i]));
     ctx.closePath();ctx.fillStyle=mix(hiColor,loColor,t);ctx.globalAlpha=.82;ctx.fill();
   }
   ctx.globalAlpha=1;
   if(large){
     ctx.beginPath();xvals.forEach((x,i)=>i?ctx.lineTo(x,up(x)):ctx.moveTo(x,up(x)));
     ctx.lineWidth=Math.max(.6,w*.002);ctx.strokeStyle='rgba(251,255,252,.16)';ctx.stroke();
   }
 }
 // One real meniscus, at the top of the highest liquid layer.
 ctx.beginPath();xvals.forEach((x,i)=>i?ctx.lineTo(x,surfaceY(L-1,x)):ctx.moveTo(x,surfaceY(L-1,x)));
 ctx.lineWidth=Math.max(.85,w*(large?.0032:.0025));
 ctx.strokeStyle='rgba(244,255,248,.53)';ctx.stroke();
 // Refractive thickness belongs to the glass boundary, not to the layers.
 const rim=ctx.createRadialGradient(center,center,r*.64,center,center,r);
 rim.addColorStop(0,'rgba(255,255,255,0)');
 rim.addColorStop(.61,'rgba(3,14,18,.025)');
 rim.addColorStop(.89,'rgba(1,10,15,.20)');
 rim.addColorStop(1,'rgba(207,245,235,.25)');
 ctx.fillStyle=rim;ctx.fillRect(0,0,w,w);
 // Subtle environmental caustics are confined to the curvature of the lens.
 if(large&&iridescence>.02){
   ctx.save();ctx.globalAlpha=Math.min(.20,iridescence*.20);
   const edge=ctx.createLinearGradient(w*.15,0,w*.85,w);
   edge.addColorStop(0,'rgba(203,245,239,0)');edge.addColorStop(.24,'#c8f4ed');
   edge.addColorStop(.52,'#e4e9f1');edge.addColorStop(.78,'#c6efd9');edge.addColorStop(1,'rgba(204,237,226,0)');
   ctx.strokeStyle=edge;ctx.lineWidth=w*.009;ctx.beginPath();
   ctx.arc(center,center,r*.973,-.18*Math.PI,.69*Math.PI);ctx.stroke();ctx.restore();
 }
 ctx.restore();
}
