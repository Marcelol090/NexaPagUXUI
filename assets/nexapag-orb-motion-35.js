
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
 refund:{label:'Estornos',value:349.9,title:'Valor recuperado.',description:'Um estorno confirmado. Esse valor reduz suas saídas líquidas, mas não é contado novamente como entrada.',note:'1 estorno · histórico',cta:'Consultar estorno',labels:['Compra','Estorno','Confirmado']}
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
function fluidOutline(pose,reverse=false){
 // Superellipse progresses circle -> softly rounded card. 64 equidistant
 // vertices plus two harmonics produce the liquid edge without canvas reflow.
 const points=[];
 const power=2/pose.super;
 for(let i=0;i<64;i++){
  const a=-Math.PI/2+Math.PI*2*i/64;
  const c=Math.cos(a),s=Math.sin(a);
  const bulge=Math.max(0,s*-1)**14*pose.jet*.32;
  const wave=pose.ripple*(Math.sin(3*a+1.1)+.43*Math.sin(5*a-.6));
  const scale=Math.min(.998,Math.max(.6,.965*(1+bulge+wave)));
  const px=50+49.8*Math.sign(c)*Math.pow(Math.abs(c),power)*scale;
  const py=50+49.8*Math.sign(s)*Math.pow(Math.abs(s),power)*scale;
  points.push(px.toFixed(3)+'% '+py.toFixed(3)+'%');
 }
 return 'polygon('+points.join(',')+')';
}
function fluidFlight(start,end,kind,reverse=false,onReveal,onStart){
 cleanupFlight();
 if(reduce()||!Element.prototype.animate){onReveal?.();return Promise.resolve();}
 if(!start||!end||start.w<=0||start.h<=0||end.w<=0||end.h<=0){onReveal?.();return Promise.resolve();}
 const ghost=document.createElement('div');
 ghost.className='orb-fluid-ghost';ghost.dataset.kind=kind;
 ghost.dataset.phase=reverse?'closing':'opening';
 ghost.setAttribute('aria-hidden','true');
 Object.assign(ghost.style,{left:start.x+'px',top:start.y+'px',width:start.w+'px',height:start.h+'px',
  transformOrigin:'0 0',transform:'translate3d(0,0,0)'});
 phone.append(ghost);flight=ghost;
 onStart?.();
 const source={x:start.x+start.w/2,y:start.y+start.h/2};
 const target={x:end.x+end.w/2,y:end.y+end.h/2};
 const poses=reverse?LIQUID_POSES.slice().reverse():LIQUID_POSES;
 const frames=poses.map(p=>{
  const w=Math.max(start.w*.66,lerp(start.w,end.w,p.w));
  const h=Math.max(start.h*.65,lerp(start.h,end.h,p.h));
  const x=lerp(source.x,target.x,p.move)-w/2-start.x;
  const y=lerp(source.y,target.y,p.move)-h/2-start.y-p.lift;
  return {
   offset:reverse?1-p.t:p.t,
   transform:'translate3d('+x.toFixed(3)+'px,'+y.toFixed(3)+'px,0) scale3d('+
     (w/start.w).toFixed(5)+','+(h/start.h).toFixed(5)+',1)',
   clipPath:fluidOutline(p),
   opacity:reverse?1:p.opacity
  };
 });
 const gen=++flightGeneration,duration=reverse?CLOSE_DURATION:OPEN_DURATION;
 const animation=ghost.animate(frames,{duration,easing:'linear',fill:'forwards'});
 flightAnimation=animation;
 if(!reverse&&onReveal){
  morphRevealTimer=setTimeout(()=>{
   morphRevealTimer=null;
   if(gen===flightGeneration)onReveal();
  },Math.round(duration*.78));
 }
 return animation.finished.catch(()=>{}).then(()=>{
  if(gen===flightGeneration){if(morphRevealTimer!==null)clearTimeout(morphRevealTimer);morphRevealTimer=null;
   if(!reverse)onReveal?.();cleanupFlight();}
 }).finally(()=>{
  if(flightAnimation===animation)flightAnimation=null;
  animation.cancel();if(ghost.isConnected)ghost.remove();
 });
}
function stopFlight(){flightGeneration++;if(morphRevealTimer!==null)clearTimeout(morphRevealTimer);morphRevealTimer=null;flightAnimation?.cancel();flightAnimation=null;cleanupFlight();}
function restoreOrigin(){if(restoreFocus?.isConnected){restoreFocus.classList.remove('is-morph-origin');restoreFocus.setAttribute('aria-expanded','false');}}
function showLayer(kind,button,sourceOverride=null,outgoingLayer=null){
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
 home()?.style.setProperty('--orb-target-height',Math.max(275,expandedHeight)+'px');
 home()?.classList.remove('orb-inline-closing');home()?.classList.add('orb-inline-expanded','orb-choreo-running');
 const target=rect(active.card);active.card.style.opacity='0';
 button.classList.add('is-morph-origin');button.setAttribute('aria-expanded','true');
 requestAnimationFrame(()=>layer.classList.add('is-open'));
 let revealed=false;
 const reveal=()=>{if(revealed||active?.layer!==layer)return;revealed=true;
  active.card.style.opacity='1';layer.classList.add('is-content-ready');};
 fluidFlight(from,target,kind,false,reveal,()=>outgoingLayer?.remove()).then(()=>{
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
  home()?.classList.remove('orb-inline-expanded','orb-inline-closing','orb-choreo-running');home()?.style.removeProperty('--orb-target-height');
  restoreOrigin();busy=false;transitionDirection='idle';pendingClose=null;
  const next=pendingOpen;if(next)queueMicrotask(launchPendingOpen);
  if(follow==='refund')bridge()?.showMoneyInsight?.('refund',restoreFocus);
  else if(follow==='income'){
    bridge()?.go?.('home');
    requestAnimationFrame(()=>document.getElementById('transactionsSection')?.scrollIntoView({behavior:reduce()?'auto':'smooth',block:'center'}));
  }else if(restoreFocus?.isConnected)restoreFocus.focus({preventScroll:true});
 });
}
async function openSpending(button,sourceOverride=null,outgoingLayer=null){
 if(busy||active)return;
 busy=true;transitionDirection='opening';pendingClose=null;bridge()?.stopAutoplay?.();
 if(bridge()?.state){bridge().state.firstShow=false;bridge().state.slide=0;}
 restoreFocus=button;
 button.classList.add('is-morph-origin');button.setAttribute('aria-expanded','true');
 originalPosition=rect(button.querySelector('.jelly')||button);
 scrollAtOpen=document.getElementById('scroller')?.scrollTop||0;
 home()?.classList.add('orb-choreo-running','orb-flight-cover');
 bridge()?.expand?.(false);
 await waitFrames();
 const target=document.querySelector('.carousel-slide.current');
 if(!target){home()?.classList.remove('orb-choreo-running','orb-flight-cover');restoreOrigin();busy=false;transitionDirection='idle';pendingClose=null;return;}
 await fluidFlight(sourceOverride||originalPosition,rect(target),'spending',false,()=>{
  home()?.classList.add('orb-flight-reveal');
 },()=>outgoingLayer?.remove());
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
 if(kind==='spending')openSpending(button,sourceRect,outgoing);
 else showLayer(kind,button,sourceRect,outgoing);
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
  if(active){active.layer.remove();active=null;}document.querySelectorAll('.orb-story-departing').forEach(el=>el.remove());stopFlight();restoreOrigin();busy=false;transitionDirection='idle';pendingClose=null;pendingOpen=null;pendingSwitch=null;
  home()?.classList.remove('orb-choreo-running','orb-flight-cover','orb-flight-reveal','orb-inline-expanded','orb-inline-closing');home()?.style.removeProperty('--orb-target-height');
 }
},true);
// Keep V2.8 collapsed until a user chooses an orb.
if(bridge()?.state)bridge().state.firstShow=false;
window.NexaOrbFlowV35={version:'3.15-shared-carousel',switchKind,get phase(){return busy?'morphing':active?.kind||bridge()?.state?.expanded?'expanded':'idle'},get activeKind(){return active?.kind||(bridge()?.state?.expanded?'spending':null)},get inline(){return Boolean(active?.layer?.parentElement?.id==='heroRegion')}};
})();
