
/* NexaPag V3.5: one fluid motion engine for Entradas, Saídas and Estornos.
   The source GIF is a storyboard; interactive animation runs at the browser refresh rate. */
(() => {
'use strict';
const phone=document.querySelector('.phone');
if(!phone)return;
const bridge=()=>window.NexaHeroBridge;
const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const money=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n);
const KINDS=['income','spending','refund'];
const STORIES={
 income:{label:'Entradas',value:1950,title:'Dinheiro que entrou.',description:'Recebimentos e PIX identificados no histórico. Não inclui estornos de compras.',note:'PIX recebido · histórico',cta:'Ver recebimentos',labels:['PIX','Recebimentos','Histórico']},
 refund:{label:'Estornos',value:349.9,title:'Valor recuperado.',description:'Estorno confirmado. Reduz as saídas líquidas sem gerar uma nova entrada.',note:'1 estorno · histórico',cta:'Consultar estorno',labels:['Compra','Estorno','Confirmado']}
};
let active=null,flight=null,busy=false,originalPosition=null,scrollAtOpen=0,restoreFocus=null,flightGeneration=0;
let pendingClose=null,pendingOpen=null,pendingSwitch=null,transitionDirection='idle';
const KIND_LABELS={income:'Entradas',spending:'Saídas',refund:'Estornos'};
function orbSwitchMarkup(current){
 return '<nav class="orb-flow-switcher" aria-label="Navegar entre componentes financeiros">'+KINDS.map(k=>
  '<button type="button" data-orb-switch="'+k+'" aria-current="'+(k===current?'true':'false')+'" aria-label="Mostrar '+KIND_LABELS[k]+'">'+
  '<span class="orb-flow-swatch" data-kind="'+k+'" aria-hidden="true"></span><span>'+KIND_LABELS[k]+'</span></button>').join('')+'</nav>';
}
function orbControlsMarkup(current){
 return '<div class="orb-flow-controls"><button type="button" class="orb-flow-arrow" data-orb-nav="-1" aria-label="Componente financeiro anterior">‹</button>'+
 orbSwitchMarkup(current)+'<button type="button" class="orb-flow-arrow" data-orb-nav="1" aria-label="Próximo componente financeiro">›</button></div>';
}
function flushPendingSwitch(){const kind=pendingSwitch;pendingSwitch=null;
 if(kind&&kind!==(active?.kind||(bridge()?.state?.expanded?'spending':null)))queueMicrotask(()=>switchKind(kind));
}
function launchPendingOpen(){const req=pendingOpen;pendingOpen=null;if(!req?.button?.isConnected||bridge()?.state?.tab!=='home')return;
 if(req.kind==='spending')openSpending(req.button);else showLayer(req.kind,req.button);}
const rect=(el)=>{const o=phone.getBoundingClientRect(),b=el.getBoundingClientRect();return {x:b.left-o.left,y:b.top-o.top,w:b.width,h:b.height};};
const inPhone=b=>({x:b.x,y:b.y,w:b.w,h:b.h});
const lerp=(a,b,t)=>a+(b-a)*t;
const waitFrames=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
const home=()=>document.getElementById('homePage');
const orbFor=kind=>{const index=KINDS.indexOf(kind);return document.querySelectorAll('#compactHero .milestone')[index]||null;};
const cleanupFlight=()=>{if(flight){flight.remove();flight=null;}};
const ease='cubic-bezier(.23,.78,.18,1)';
// Frame-authored liquid morph. Only transform/border radius/opacity animate:
// no left/top/width/height layout interpolation, no animation restart at its midpoint.
/* V3.7: the 16 storyboard poses define phase, deformation, and timing.
   Between authored poses, Web Animations interpolates every display frame. */
const LIQUID_POSES=[
 {t:0.000,move:0.000,w:0.000,h:0.000,lift:0,super:2.00,ripple:0.00,jet:0,opacity:1},
 {t:0.055,move:0.003,w:-0.025,h:-0.060,lift:0,super:2.00,ripple:0.018,jet:0,opacity:1},
 {t:0.115,move:0.015,w:0.015,h:0.085,lift:2,super:2.12,ripple:0.028,jet:0.33,opacity:1},
 {t:0.182,move:0.050,w:0.065,h:0.210,lift:10,super:2.16,ripple:0.040,jet:0.68,opacity:1},
 {t:0.250,move:0.135,w:0.145,h:0.340,lift:16,super:2.37,ripple:0.038,jet:0.62,opacity:1},
 {t:0.332,move:0.270,w:0.320,h:0.490,lift:19,super:2.60,ripple:0.032,jet:0.38,opacity:1},
 {t:0.420,move:0.470,w:0.545,h:0.675,lift:11,super:2.95,ripple:0.027,jet:0.12,opacity:1},
 {t:0.515,move:0.695,w:0.765,h:0.840,lift:4,super:3.42,ripple:0.020,jet:0.02,opacity:1},
 {t:0.610,move:0.885,w:0.915,h:0.960,lift:0,super:4.02,ripple:0.013,jet:0,opacity:1},
 {t:0.710,move:1.000,w:1.024,h:1.035,lift:0,super:4.25,ripple:0.010,jet:0,opacity:1},
 {t:0.794,move:1.000,w:0.992,h:0.987,lift:0,super:4.15,ripple:0.008,jet:0,opacity:1},
 {t:0.866,move:1.000,w:1.000,h:1.000,lift:0,super:4.25,ripple:0.004,jet:0,opacity:.91},
 {t:0.910,move:1.000,w:1.000,h:1.000,lift:0,super:4.20,ripple:0.002,jet:0,opacity:.66},
 {t:0.951,move:1.000,w:1.000,h:1.000,lift:0,super:4.20,ripple:0.001,jet:0,opacity:.29},
 {t:0.985,move:1.000,w:1.000,h:1.000,lift:0,super:4.20,ripple:0.000,jet:0,opacity:.08},
 {t:1.000,move:1.000,w:1.000,h:1.000,lift:0,super:4.20,ripple:0.000,jet:0,opacity:0}
];
const OPEN_DURATION=920,CLOSE_DURATION=770;
let flightAnimation=null,morphRevealTimer=null;

/* V3.17: 16 authored poses, continuously interpolated with shape-preserving cubic
   Hermite sampling. The browser receives 49 evenly spaced animation frames. */
const RENDER_FRAME_COUNT=49;
const MOTION_KEYS=['move','w','h','lift','super','ripple','jet','opacity'];
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
function slope(a,b,key){
 return (b[key]-a[key])/(b.t-a.t);
}
function smoothSlope(left,a,b,right,key,atEnd){
 const first=atEnd?slope(a,b,key):left?slope(left,a,key):slope(a,b,key);
 const second=atEnd?(right?slope(b,right,key):slope(a,b,key)):slope(a,b,key);
 if(first===0||second===0||Math.sign(first)!==Math.sign(second))return 0;
 return 2*first*second/(first+second);
}
function poseAt(t){
 const p=clamp(t,0,1),points=LIQUID_POSES;
 if(p<=0)return {...points[0]};
 if(p>=1)return {...points.at(-1)};
 let index=1;while(index<points.length-1&&points[index].t<p)index++;
 const a=points[index-1],b=points[index],before=points[index-2],after=points[index+1];
 const span=b.t-a.t,x=(p-a.t)/span,x2=x*x,x3=x2*x;
 const pose={t:p};
 for(const key of MOTION_KEYS){
  const m0=smoothSlope(before,a,b,after,key,false);
  const m1=smoothSlope(before,a,b,after,key,true);
  const value=(2*x3-3*x2+1)*a[key]+(x3-2*x2+x)*span*m0+
    (-2*x3+3*x2)*b[key]+(x3-x2)*span*m1;
  pose[key]=clamp(value,Math.min(a[key],b[key]),Math.max(a[key],b[key]));
 }
 return pose;
}

/* V3.18 · NexaPag's original expressive financial orbs.
   Geometry is original to the app; Grok Bot is a motion-language reference,
   not an imported logo, sprite, package, or third-party artwork. */
const BOT_SHAPES={
 income:{name:'gotícula',period:7300,phases:[0,.24,.68,.37,.85,.22,0]},
 spending:{name:'triângulo arredondado',period:6200,phases:[0,.36,.82,.30,.70,.42,0]},
 refund:{name:'hexágono maleável',period:8800,phases:[0,.16,.40,.83,.30,.68,0]}
};
const BOT_VERTEX_COUNT=48;
const botAnimationMap=new WeakMap();
function polygonRadius(sides,angle,orientation){
 const period=2*Math.PI/sides;
 const relative=angle-(orientation+Math.PI/sides);
 const offset=((relative+period/2)%period+period)%period-period/2;
 return Math.cos(Math.PI/sides)/Math.cos(offset);
}
function botRadial(kind,angle,phase=0){
 const sin=Math.sin(angle),cos=Math.cos(angle);
 if(kind==='income'){
  // A gentle upward tip and pear-shaped lower reservoir: money flowing in.
  const base=.91+.052*sin+.13*Math.pow(Math.max(0,-sin),18);
  return clamp(base*(1+.011*Math.sin(2*angle+phase*2.4)
    +.006*Math.sin(4*angle-phase*1.6)),.73,.998);
 }
 if(kind==='spending'){
  // Rounded triangle: forward energy, no cut-out spikes or hard corners.
  const n=3,angleStep=.125;
  const softened=(polygonRadius(n,angle,-Math.PI/2)*2+
   polygonRadius(n,angle-angleStep,-Math.PI/2)+
   polygonRadius(n,angle+angleStep,-Math.PI/2))/4;
  return clamp((.345+.655*softened)*(1+.008*Math.sin(3*angle+phase*1.9)),.57,.993);
 }
 // A faceted six-sided silhouette, deliberately more composed and slower.
 const n=6,orientation=-Math.PI/2+Math.PI/6;
 const smooth=(polygonRadius(n,angle,orientation)*2+
   polygonRadius(n,angle-.08,orientation)+polygonRadius(n,angle+.08,orientation))/4;
 return clamp((.06+.94*smooth)*(1+.008*Math.sin(2*angle-phase*1.4)),.80,.991);
}
function botContour(kind,phase=0){
 const points=[];
 for(let i=0;i<BOT_VERTEX_COUNT;i++){
  const angle=-Math.PI/2+i*2*Math.PI/BOT_VERTEX_COUNT;
  const r=botRadial(kind,angle,phase)*.983;
  points.push((50+49.8*Math.cos(angle)*r).toFixed(3)+'% '+
              (50+49.8*Math.sin(angle)*r).toFixed(3)+'%');
 }
 return 'polygon('+points.join(',')+')';
}
function botIdentity(kind,amount){
 const shell=document.createElement('span');
 shell.className='orb-bot-identity';shell.setAttribute('aria-hidden','true');
 const face=document.createElement('span');face.className='orb-bot-face';
 const left=document.createElement('i'),right=document.createElement('i');
 left.className='orb-bot-eye';right.className='orb-bot-eye';
 face.append(left,right);
 const number=document.createElement('span');number.className='orb-bot-amount';
 number.textContent=amount||'';
 shell.append(face,number);return shell;
}
function setupBotShape(button,kind){
 const jelly=button.querySelector('.jelly');
 if(!jelly||jelly.dataset.botReady==='1')return;
 button.dataset.botKind=kind;jelly.dataset.botKind=kind;
 jelly.classList.add('bot-orb');jelly.dataset.botReady='1';
 const value=jelly.querySelector('.value');
 const amount=value?.textContent?.trim()||'';
 const identity=botIdentity(kind,amount);
 jelly.append(identity);
 if(value)value.classList.add('bot-orb-native-value');
 jelly.style.clipPath=botContour(kind,0);
 if(reduce())return;
 const spec=BOT_SHAPES[kind];
 const phases=spec.phases;
 const frames=phases.map((phase,index)=>({
  offset:index/(phases.length-1),clipPath:botContour(kind,phase)
 }));
 const motion=jelly.animate(frames,{duration:spec.period,iterations:Infinity,easing:'linear',fill:'both'});
 motion.id='nexapag-bot-idle-'+kind;
 botAnimationMap.set(jelly,motion);
}
let botInitFrame=0;
function setupFinancialBots(){
 botInitFrame=0;
 document.querySelectorAll('#compactHero .milestone').forEach((button,index)=>{
  const kind=KINDS[index];if(kind)setupBotShape(button,kind);
 });
}
function queueFinancialBots(){
 if(botInitFrame)return;
 botInitFrame=requestAnimationFrame(setupFinancialBots);
}
const screenRoot=document.getElementById('screen');
if(screenRoot){
 const botObserver=new MutationObserver(queueFinancialBots);
 botObserver.observe(screenRoot,{childList:true,subtree:true});
}
const botReducedMedia=matchMedia('(prefers-reduced-motion: reduce)');
botReducedMedia.addEventListener?.('change',()=>{
 document.querySelectorAll('#compactHero .jelly.bot-orb').forEach(jelly=>{
  botAnimationMap.get(jelly)?.cancel();
  if(!reduce()){
   jelly.removeAttribute('data-bot-ready');jelly.dataset.botReady='';
  }
 });
 queueFinancialBots();
});
document.addEventListener('visibilitychange',()=>{
 document.querySelectorAll('#compactHero .jelly.bot-orb').forEach(jelly=>{
  const motion=botAnimationMap.get(jelly);
  if(motion){if(document.hidden)motion.pause();else if(!reduce())motion.play();}
 });
});
queueFinancialBots();

function fluidOutline(pose,kind=null){
 // Forty-eight ordered points preserve the soft liquid edge and limit paint cost.
 const points=[],power=2/pose.super;
 for(let i=0;i<48;i++){
  const angle=-Math.PI/2+Math.PI*2*i/48;
  const cosine=Math.cos(angle),sine=Math.sin(angle);
  const crown=Math.pow(Math.max(0,-sine),12)*pose.jet*.15;
  const surface=pose.ripple*(Math.sin(3*angle+1.1)+.32*Math.sin(5*angle-.6));
  const radius=clamp(.978*(1+crown+surface),.88,.997);
  const morphWeight=kind?clamp((pose.move-.02)/.82,0,1):1;
  const organic=kind?botRadial(kind,angle,0)*.983:1;
  const roundedX=Math.sign(cosine)*Math.pow(Math.abs(cosine),power)*radius;
  const roundedY=Math.sign(sine)*Math.pow(Math.abs(sine),power)*radius;
  const x=50+49.8*lerp(cosine*organic,roundedX,morphWeight);
  const y=50+49.8*lerp(sine*organic,roundedY,morphWeight);
  points.push(x.toFixed(3)+'% '+y.toFixed(3)+'%');
 }
 return 'polygon('+points.join(',')+')';
}
function fluidFlight(start,end,kind,reverse=false,onReveal,onStart,fromKind=null){
 cleanupFlight();
 if(reduce()||!Element.prototype.animate){onStart?.();onReveal?.();return Promise.resolve();}
 if(!start||!end||start.w<=0||start.h<=0||end.w<=0||end.h<=0){
  onStart?.();onReveal?.();return Promise.resolve();
 }
 const ghost=document.createElement('div');
 ghost.className='orb-fluid-ghost';ghost.dataset.kind=kind;
 ghost.dataset.phase=reverse?'closing':'opening';
 ghost.setAttribute('aria-hidden','true');
 const cardToCard=Boolean(fromKind&&fromKind!==kind);
 if(cardToCard){
  ghost.dataset.fromKind=fromKind;ghost.dataset.morphType='card-to-card';
  const tint=document.createElement('span');tint.className='orb-fluid-color-mix';
  ghost.append(tint);
 }
 const duration=reverse?CLOSE_DURATION:(cardToCard?720:OPEN_DURATION);
 Object.assign(ghost.style,{
  left:start.x+'px',top:start.y+'px',width:start.w+'px',height:start.h+'px',
  transformOrigin:'0 0',transform:'translate3d(0,0,0)',
  '--orb-flight-time':duration+'ms'
 });
 if(!cardToCard){
  const value=orbFor(kind)?.querySelector('.value')?.textContent?.trim()||'';
  const identity=botIdentity(kind,value);identity.classList.add('orb-bot-flight-identity');
  ghost.append(identity);
 }
 phone.append(ghost);flight=ghost;
 const source={x:start.x+start.w/2,y:start.y+start.h/2};
 const target={x:end.x+end.w/2,y:end.y+end.h/2};
 const frames=Array.from({length:RENDER_FRAME_COUNT},(_,index)=>{
  const time=index/(RENDER_FRAME_COUNT-1);
  const p=poseAt(reverse?1-time:time);
  // Card-to-card is card -> card throughout: no circular flash or shrink.
  const movement=cardToCard?(p.t*p.t*(3-2*p.t)):p.move;
  const pulse=cardToCard?1+.008*Math.sin(Math.PI*p.t):1;
  const w=cardToCard?lerp(start.w,end.w,movement)*pulse:Math.max(start.w*.66,lerp(start.w,end.w,p.w));
  const h=cardToCard?lerp(start.h,end.h,movement)*pulse:Math.max(start.h*.65,lerp(start.h,end.h,p.h));
  const lift=cardToCard?0:p.lift;
  const x=lerp(source.x,target.x,cardToCard?movement:p.move)-w/2-start.x;
  const y=lerp(source.y,target.y,cardToCard?movement:p.move)-h/2-start.y-lift;
  const outline=cardToCard?{...p,super:4.15-.24*Math.sin(Math.PI*p.t),
   jet:0,ripple:.004*Math.sin(Math.PI*p.t)}:p;
  return {
   offset:time,
   transform:'translate3d('+x.toFixed(3)+'px,'+y.toFixed(3)+'px,0) scale3d('+
    (w/start.w).toFixed(5)+','+(h/start.h).toFixed(5)+',1)',
   clipPath:fluidOutline(outline,cardToCard?null:kind),
   opacity:reverse?1:p.opacity
  };
 });
 const gen=++flightGeneration;
 onStart?.();
 const animation=ghost.animate(frames,{duration,easing:'linear',fill:'forwards'});
 flightAnimation=animation;
 const identity=ghost.querySelector('.orb-bot-flight-identity');
 if(identity){
  identity.animate(reverse?[
   {opacity:0,offset:0},{opacity:0,offset:.78},{opacity:1,offset:1}
  ]:[
   {opacity:1,offset:0},{opacity:.8,offset:.07},{opacity:0,offset:.22},
   {opacity:0,offset:1}
  ],{duration,easing:'linear',fill:'forwards'});
 }
 if(cardToCard){
  ghost.querySelector('.orb-fluid-color-mix')?.animate([
    {opacity:1,offset:0},{opacity:.80,offset:.18},
    {opacity:.42,offset:.60},{opacity:0,offset:1}
  ],{duration,easing:'cubic-bezier(.22,.65,.29,1)',fill:'forwards'});
 }
 if(!reverse&&onReveal){
  morphRevealTimer=setTimeout(()=>{
   morphRevealTimer=null;
   if(gen===flightGeneration)onReveal();
  },Math.round(duration*(cardToCard?.70:.73)));
 }
 return animation.finished.catch(()=>{}).then(()=>{
  if(gen===flightGeneration){
   if(morphRevealTimer!==null)clearTimeout(morphRevealTimer);
   morphRevealTimer=null;if(!reverse)onReveal?.();cleanupFlight();
  }
 }).finally(()=>{
  if(flightAnimation===animation)flightAnimation=null;
  animation.cancel();if(ghost.isConnected)ghost.remove();
 });
}
function stopFlight(){flightGeneration++;if(morphRevealTimer!==null)clearTimeout(morphRevealTimer);morphRevealTimer=null;flightAnimation?.cancel();flightAnimation=null;cleanupFlight();}
function restoreOrigin(){if(restoreFocus?.isConnected){restoreFocus.classList.remove('is-morph-origin');restoreFocus.setAttribute('aria-expanded','false');}}
function showLayer(kind,button,sourceOverride=null,outgoingLayer=null,sourceKind=null){
 if(busy||active||!STORIES[kind])return;
 busy=true;transitionDirection='opening';pendingClose=null;
 bridge()?.stopAutoplay?.();
 if(bridge()?.state)bridge().state.firstShow=false;
 restoreFocus=button;
 const source=button.querySelector('.jelly')||button,from=sourceOverride||rect(source),v=STORIES[kind];
 const host=document.getElementById('heroRegion');if(!host){busy=false;transitionDirection='idle';return;}
 const layer=document.createElement('section');layer.id='orbStoryLayer';layer.className='orb-story-layer orb-inline-section';layer.dataset.kind=kind;
 layer.setAttribute('role','region');layer.setAttribute('aria-labelledby','orbStoryTitle');layer.setAttribute('aria-describedby','orbStoryDescription');
 const ticks=Array.from({length:45},()=>'<i></i>').join('');
 layer.innerHTML='<article class="orb-story-card" aria-describedby="orbStoryDescription">'+
 '<div class="orb-story-content"><div class="orb-story-top"><span class="orb-story-kicker">'+v.label+'</span>'+
 '<button class="orb-story-close" type="button" data-orb-close="1" aria-label="Recolher para o orb '+v.label+'">×</button></div>'+
 '<div class="orb-story-value">'+money(v.value)+'</div><h2 class="orb-story-title" id="orbStoryTitle">'+v.title+'</h2>'+
 '<p class="orb-story-description" id="orbStoryDescription">'+v.description+'</p>'+
 '<div class="orb-story-ruler" aria-hidden="true">'+ticks+'</div><div class="orb-story-labels" aria-hidden="true">'+v.labels.map(t=>'<span>'+t+'</span>').join('')+'</div>'+
 '<div class="orb-story-divider"></div><div class="orb-story-foot"><span>'+v.note+'</span>'+
 '<button type="button" class="orb-story-go" data-orb-follow="'+kind+'">'+v.cta+'</button></div></div></article>'+orbControlsMarkup(kind);
 host.append(layer);active={kind,layer,card:layer.querySelector('.orb-story-card'),from};
 const expandedHeight=Math.ceil(layer.getBoundingClientRect().height+14);
 const baseline=phone.getBoundingClientRect().width<=350?376:360;
 const hostHeight=Math.max(Number(home()?.dataset.orbStageHeight)||0,baseline,expandedHeight);
 home().dataset.orbStageHeight=String(hostHeight);
 home()?.style.setProperty('--orb-stage-height',hostHeight+'px');
 home()?.style.setProperty('--orb-target-height',hostHeight+'px');
 home()?.classList.remove('orb-inline-closing');home()?.classList.add('orb-inline-expanded','orb-choreo-running');
 const target=rect(active.card);active.card.style.opacity='0';
 button.classList.add('is-morph-origin');button.setAttribute('aria-expanded','true');
 requestAnimationFrame(()=>layer.classList.add('is-open'));
 let revealed=false;
 const reveal=()=>{if(revealed||active?.layer!==layer)return;revealed=true;
  active.card.style.opacity='1';layer.classList.add('is-content-ready');};
 fluidFlight(from,target,kind,false,reveal,()=>outgoingLayer?.remove(),sourceKind).then(()=>{
  if(active?.layer!==layer)return;
  reveal();busy=false;transitionDirection='open';home()?.classList.remove('orb-choreo-running','orb-flight-cover');
  if(pendingSwitch){flushPendingSwitch();return;}
  const request=pendingClose;pendingClose=null;
  if(request?.kind==='layer'){queueMicrotask(()=>closeLayer(request.follow));return;}
  layer.querySelector('.orb-story-close')?.focus({preventScroll:true});
 });
}
function closeLayer(follow){
 if(!active)return;
 if(busy){if(transitionDirection==='opening')pendingClose={kind:'layer',follow};return;}
 busy=true;transitionDirection='closing';
 const {kind,layer,card,from}=active;
 const fromCard=rect(card);
 layer.classList.remove('is-content-ready');layer.classList.add('is-closing');
 home()?.classList.remove('orb-inline-expanded');home()?.classList.add('orb-inline-closing','orb-choreo-running');
 card.style.opacity='0';
 const destination=restoreFocus?.querySelector('.jelly')?.isConnected?rect(restoreFocus.querySelector('.jelly')):from;
 fluidFlight(destination,fromCard,kind,true).then(()=>{
  if(active?.layer!==layer)return;
  layer.remove();active=null;
  home()?.classList.remove('orb-inline-expanded','orb-inline-closing','orb-choreo-running');home()?.style.removeProperty('--orb-target-height');home()?.style.removeProperty('--orb-stage-height');if(home())delete home().dataset.orbStageHeight;
  restoreOrigin();busy=false;transitionDirection='idle';pendingClose=null;
  const next=pendingOpen;if(next)queueMicrotask(launchPendingOpen);
  if(follow==='refund')bridge()?.showMoneyInsight?.('refund',restoreFocus);
  else if(follow==='income'){
    bridge()?.go?.('home');
    requestAnimationFrame(()=>document.getElementById('transactionsSection')?.scrollIntoView({behavior:reduce()?'auto':'smooth',block:'center'}));
  }else if(restoreFocus?.isConnected)restoreFocus.focus({preventScroll:true});
 });
}
async function openSpending(button,sourceOverride=null,outgoingLayer=null,sourceKind=null){
 if(busy||active)return;
 busy=true;transitionDirection='opening';pendingClose=null;bridge()?.stopAutoplay?.();
 if(bridge()?.state){bridge().state.firstShow=false;bridge().state.slide=0;}
 restoreFocus=button;
 button.classList.add('is-morph-origin');button.setAttribute('aria-expanded','true');
 originalPosition=rect(button.querySelector('.jelly')||button);
 scrollAtOpen=document.getElementById('scroller')?.scrollTop||0;
 if(home()&&!home().dataset.orbStageHeight){const baseline=phone.getBoundingClientRect().width<=350?376:360;home().dataset.orbStageHeight=String(baseline);home().style.setProperty('--orb-stage-height',baseline+'px');}
 home()?.classList.add('orb-choreo-running','orb-flight-cover');
 bridge()?.expand?.(false);
 await waitFrames();
 const target=document.querySelector('.carousel-slide.current');
 if(!target){home()?.classList.remove('orb-choreo-running','orb-flight-cover');restoreOrigin();busy=false;transitionDirection='idle';pendingClose=null;return;}
 await fluidFlight(sourceOverride||originalPosition,rect(target),'spending',false,()=>{
  home()?.classList.add('orb-flight-reveal');
 },()=>outgoingLayer?.remove(),sourceKind);
 home()?.classList.remove('orb-flight-cover','orb-flight-reveal','orb-choreo-running');
 busy=false;transitionDirection='open';
 if(pendingSwitch){flushPendingSwitch();return;}
 const request=pendingClose;pendingClose=null;
 if(request?.kind==='spending')queueMicrotask(()=>closeSpending());
}
async function closeSpending(){
 if(!bridge()?.state?.expanded)return;
 if(busy){if(transitionDirection==='opening')pendingClose={kind:'spending'};return;}
 busy=true;transitionDirection='closing';
 bridge()?.stopAutoplay?.();
 const card=document.querySelector('.carousel-slide.current');
 const fromCard=card?rect(card):null;
 const currentScroll=document.getElementById('scroller')?.scrollTop||0;
 const destination=originalPosition?inPhone({...originalPosition,y:originalPosition.y-(currentScroll-scrollAtOpen)}):null;
 home()?.classList.remove('orb-flight-reveal');home()?.classList.add('orb-choreo-running','orb-flight-cover');
 bridge()?.state && (bridge().state.slide=0);
 bridge()?.stopAutoplay?.();
 // V3.4 bridge exposes expand but not collapse: keep original state in sync.
 if(bridge()?.state)bridge().state.expanded=false;
 home()?.classList.remove('hero-expanded');
 document.querySelectorAll('.slide-motion-video').forEach(v=>v.pause());
 await waitFrames();
 const fallback=orbFor('spending')?.querySelector('.jelly');
 const to=destination|| (fallback?rect(fallback):null);
 if(fromCard&&to)await fluidFlight(to,fromCard,'spending',true);
 home()?.classList.remove('orb-flight-cover','orb-flight-reveal','orb-choreo-running');
 home()?.style.removeProperty('--orb-stage-height');if(home())delete home().dataset.orbStageHeight;
 restoreOrigin();busy=false;transitionDirection='idle';pendingClose=null;
 const next=pendingOpen;
 if(next)queueMicrotask(launchPendingOpen);
 else if(restoreFocus?.isConnected)restoreFocus.focus({preventScroll:true});
}

/* Shared-element handoff from the CURRENT card to the next financial component.
   Never reset to the orb state during category navigation. */
function switchKind(kind){
 if(!KINDS.includes(kind)||bridge()?.state?.tab!=='home')return;
 const current=active?.kind||(bridge()?.state?.expanded?'spending':null);
 if(!current||current===kind)return;
 if(busy){pendingSwitch=kind;return;}
 const sourceEl=current==='spending'?document.querySelector('.carousel-slide.current'):active?.card;
 if(!sourceEl)return;
 const sourceRect=rect(sourceEl);
 bridge()?.stopAutoplay?.();
 let outgoing=null;
 if(active){
  outgoing=active.layer;
  outgoing.removeAttribute('id');outgoing.removeAttribute('role');
  outgoing.setAttribute('aria-hidden','true');
  outgoing.classList.add('orb-story-departing');
  active=null;
  home()?.classList.remove('orb-inline-expanded','orb-inline-closing');
  home()?.style.removeProperty('--orb-target-height');
 }else if(bridge()?.state){
  home()?.classList.add('orb-flight-cover');
  bridge().state.expanded=false;
  home()?.classList.remove('hero-expanded','orb-flight-reveal');
  document.querySelectorAll('.slide-motion-video').forEach(v=>v.pause());
 }
 restoreOrigin();
 const button=orbFor(kind);
 if(!button){outgoing?.remove();return;}
 if(kind==='spending')openSpending(button,sourceRect,outgoing,current);
 else showLayer(kind,button,sourceRect,outgoing,current);
}
let orbSwipe=null;
phone.addEventListener('pointerdown',e=>{
 if(!active||e.target.closest('button')||!e.target.closest('#orbStoryLayer .orb-story-card'))return;
 orbSwipe={id:e.pointerId,x:e.clientX,y:e.clientY};
},{passive:true});
phone.addEventListener('pointerup',e=>{
 if(!orbSwipe||e.pointerId!==orbSwipe.id)return;
 const {x,y}=orbSwipe;orbSwipe=null;
 const dx=e.clientX-x,dy=e.clientY-y;
 if(Math.abs(dx)>54&&Math.abs(dx)>Math.abs(dy)*1.3){
  const k=active?.kind;if(k)switchKind(KINDS[(KINDS.indexOf(k)+(dx<0?1:2))%3]);
 }
},{passive:true});
phone.addEventListener('pointercancel',()=>{orbSwipe=null;},{passive:true});

phone.addEventListener('click',event=>{
 const direct=event.target.closest('[data-orb-switch]');
 if(direct){event.preventDefault();event.stopImmediatePropagation();switchKind(direct.dataset.orbSwitch);return;}
 const nav=event.target.closest('[data-orb-nav]');
 if(nav){event.preventDefault();event.stopImmediatePropagation();
  const k=active?.kind||(bridge()?.state?.expanded?'spending':null);
  if(k)switchKind(KINDS[(KINDS.indexOf(k)+(Number(nav.dataset.orbNav)>0?1:2))%3]);return;}
 const orb=event.target.closest('#compactHero .milestone');
 if(orb){
  event.preventDefault();event.stopImmediatePropagation();
  const all=[...document.querySelectorAll('#compactHero .milestone')];
  const kind=KINDS[all.indexOf(orb)];
  if(busy||active){if(busy&&transitionDirection==='closing'&&kind)pendingOpen={kind,button:orb};return;}
  if(kind==='spending')openSpending(orb);else if(kind)showLayer(kind,orb);
  return;
 }
 const collapse=event.target.closest('[data-action="collapse"]');
 if(collapse&&bridge()?.state?.expanded){
  event.preventDefault();event.stopImmediatePropagation();closeSpending();return;
 }
 if(!active)return;
 if(event.target.closest('[data-orb-close]')){event.preventDefault();closeLayer();return;}
 const cta=event.target.closest('[data-orb-follow]');
 if(cta){event.preventDefault();closeLayer(cta.dataset.orbFollow);return;}
},true);
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&busy&&transitionDirection==='closing'){pendingOpen=null;event.preventDefault();return;}
 if(!active&&event.key==='Escape'&&bridge()?.state?.expanded&&bridge()?.state?.tab==='home'){event.preventDefault();event.stopImmediatePropagation();closeSpending();return;}
 if(!active)return;
 if(event.key==='Escape'){event.preventDefault();closeLayer();return;}
 // An inline disclosure, not a modal: normal Tab navigation remains available.
},true);
phone.addEventListener('click',event=>{
 if(event.target.closest('#dock [data-tab]')&&(active||busy)){
  if(active){active.layer.remove();active=null;}document.querySelectorAll('.orb-story-departing').forEach(el=>el.remove());stopFlight();restoreOrigin();busy=false;transitionDirection='idle';pendingClose=null;pendingOpen=null;pendingSwitch=null;home()?.style.removeProperty('--orb-stage-height');if(home())delete home().dataset.orbStageHeight;
  home()?.classList.remove('orb-choreo-running','orb-flight-cover','orb-flight-reveal','orb-inline-expanded','orb-inline-closing');home()?.style.removeProperty('--orb-target-height');
 }
},true);
// Keep V2.8 collapsed until a user chooses an orb.
if(bridge()?.state)bridge().state.firstShow=false;
window.NexaOrbFlowV35={version:'3.18-expressive-bots',botShapes:Object.fromEntries(Object.entries(BOT_SHAPES).map(([kind,shape])=>[kind,shape.name])),authoredFrames:LIQUID_POSES.length,renderedFrames:RENDER_FRAME_COUNT,switchKind,get phase(){return busy?'morphing':active?.kind||bridge()?.state?.expanded?'expanded':'idle'},get activeKind(){return active?.kind||(bridge()?.state?.expanded?'spending':null)},get inline(){return Boolean(active?.layer?.parentElement?.id==='heroRegion')}};
})();
