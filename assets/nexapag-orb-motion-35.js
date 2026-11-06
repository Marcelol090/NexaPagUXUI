
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
let flightAnimation=null;
function fluidFlight(start,end,kind,reverse=false){
 cleanupFlight();
 if(reduce()||!Element.prototype.animate)return Promise.resolve();
 if(!start||!end||start.w<=0||start.h<=0||end.w<=0||end.h<=0)return Promise.resolve();
 const el=document.createElement('div');
 el.className='orb-fluid-ghost';el.dataset.kind=kind;el.setAttribute('aria-hidden','true');
 Object.assign(el.style,{left:start.x+'px',top:start.y+'px',width:start.w+'px',height:start.h+'px',
  borderRadius:'50%',transformOrigin:'0 0',transform:'translate3d(0,0,0)'});
 phone.append(el);flight=el;
 const source={x:start.x+start.w/2,y:start.y+start.h/2};
 const target={x:end.x+end.w/2,y:end.y+end.h/2};
 const stops=[
  {t:0,p:0,sx:0,sy:0,lift:0,rad:'50% 50% 50% 50%'},
  {t:.09,p:.015,sx:-.02,sy:.09,lift:4,rad:'46% 54% 50% 50% / 49% 45% 55% 51%'},
  {t:.20,p:.09,sx:.13,sy:.22,lift:15,rad:'46% 56% 37% 58% / 35% 46% 62% 50%'},
  {t:.32,p:.27,sx:.36,sy:.35,lift:24,rad:'36% 46% 34% 52% / 35% 41% 66% 53%'},
  {t:.47,p:.50,sx:.61,sy:.57,lift:15,rad:'26% 38% 28% 47% / 41% 39% 53% 47%'},
  {t:.65,p:.79,sx:.86,sy:.82,lift:5,rad:'32% 26% 30% 37% / 39% 41% 43% 46%'},
  {t:.83,p:.98,sx:1.026,sy:1.026,lift:0,rad:'30px 29px 35px 28px'},
  {t:.93,p:1,sx:.994,sy:.99,lift:0,rad:'27px 28px 29px 27px'},
  {t:1,p:1,sx:1,sy:1,lift:0,rad:'28px'}
 ];
 const frame=(s,offset)=>{
  const width=Math.max(start.w*.62,lerp(start.w,end.w,s.sx));
  const height=Math.max(start.h*.63,lerp(start.h,end.h,s.sy));
  const x=lerp(source.x,target.x,s.p)-width/2-start.x;
  const y=lerp(source.y,target.y,s.p)-height/2-start.y-s.lift;
  return {offset,transform:'translate3d('+x.toFixed(3)+'px,'+y.toFixed(3)+'px,0) scale3d('+
   (width/start.w).toFixed(5)+','+(height/start.h).toFixed(5)+',1)',
   borderRadius:s.rad,opacity:1};
 };
 const points=reverse?stops.slice().reverse():stops;
 const frames=points.map(s=>frame(s,reverse?1-s.t:s.t));
 const id=++flightGeneration;
 el.dataset.phase=reverse?'closing':'opening';
 const animation=el.animate(frames,{duration:reverse?830:940,easing:'cubic-bezier(.18,.78,.17,1)',fill:'forwards'});
 flightAnimation=animation;
 return animation.finished.catch(()=>{}).then(()=>{
  if(id===flightGeneration)cleanupFlight();
 }).finally(()=>{
  if(flightAnimation===animation)flightAnimation=null;
  animation.cancel();if(el.isConnected)el.remove();
 });
}
function stopFlight(){flightGeneration++;flightAnimation?.cancel();flightAnimation=null;cleanupFlight();}
function restoreOrigin(){if(restoreFocus?.isConnected){restoreFocus.classList.remove('is-morph-origin');restoreFocus.setAttribute('aria-expanded','false');}}
function showLayer(kind,button){
 if(busy||active||!STORIES[kind])return;
 busy=true;
 bridge()?.stopAutoplay?.();
 if(bridge()?.state)bridge().state.firstShow=false;
 restoreFocus=button;
 const source=button.querySelector('.jelly')||button,from=rect(source),v=STORIES[kind];
 const layer=document.createElement('section');layer.id='orbStoryLayer';layer.className='orb-story-layer';layer.dataset.kind=kind;
 const ticks=Array.from({length:45},()=>'<i></i>').join('');
 layer.innerHTML='<div class="orb-story-backdrop" data-orb-close="1"></div>'+
 '<article class="orb-story-card" role="dialog" aria-modal="true" aria-labelledby="orbStoryTitle" aria-describedby="orbStoryDescription">'+
 '<div class="orb-story-content"><div class="orb-story-top"><span class="orb-story-kicker">'+v.label+'</span>'+
 '<button class="orb-story-close" type="button" data-orb-close="1" aria-label="Recolher para o orb '+v.label+'">×</button></div>'+
 '<div class="orb-story-value">'+money(v.value)+'</div><h2 class="orb-story-title" id="orbStoryTitle">'+v.title+'</h2>'+
 '<p class="orb-story-description" id="orbStoryDescription">'+v.description+'</p>'+
 '<div class="orb-story-ruler" aria-hidden="true">'+ticks+'</div><div class="orb-story-labels" aria-hidden="true">'+v.labels.map(t=>'<span>'+t+'</span>').join('')+'</div>'+
 '<div class="orb-story-divider"></div><div class="orb-story-foot"><span>'+v.note+'</span>'+
 '<button type="button" class="orb-story-go" data-orb-follow="'+kind+'">'+v.cta+'</button></div></div></article>';
 phone.append(layer);active={kind,layer,card:layer.querySelector('.orb-story-card'),from};
 const target=rect(active.card);active.card.style.opacity='0';
 button.classList.add('is-morph-origin');button.setAttribute('aria-expanded','true');
 requestAnimationFrame(()=>layer.classList.add('is-open'));
 fluidFlight(from,target,kind).then(()=>{
  if(active?.layer!==layer)return;
  active.card.style.opacity='';
  layer.classList.add('is-content-ready');busy=false;
  layer.querySelector('.orb-story-close')?.focus({preventScroll:true});
 });
}
function closeLayer(follow){
 if(!active||busy)return;
 busy=true;
 const {kind,layer,card,from}=active;
 const fromCard=rect(card);
 layer.classList.remove('is-content-ready');layer.classList.add('is-closing');
 card.style.opacity='0';
 const destination=restoreFocus?.querySelector('.jelly')?.isConnected?rect(restoreFocus.querySelector('.jelly')):from;
 fluidFlight(destination,fromCard,kind,true).then(()=>{
  if(active?.layer!==layer)return;
  layer.remove();active=null;restoreOrigin();busy=false;
  if(follow==='refund')bridge()?.showMoneyInsight?.('refund',restoreFocus);
  else if(follow==='income'){
    bridge()?.go?.('home');
    requestAnimationFrame(()=>document.getElementById('transactionsSection')?.scrollIntoView({behavior:reduce()?'auto':'smooth',block:'center'}));
  }else if(restoreFocus?.isConnected)restoreFocus.focus({preventScroll:true});
 });
}
async function openSpending(button){
 if(busy||active)return;
 busy=true;bridge()?.stopAutoplay?.();
 if(bridge()?.state){bridge().state.firstShow=false;bridge().state.slide=0;}
 restoreFocus=button;
 button.classList.add('is-morph-origin');button.setAttribute('aria-expanded','true');
 originalPosition=rect(button.querySelector('.jelly')||button);
 scrollAtOpen=document.getElementById('scroller')?.scrollTop||0;
 home()?.classList.add('orb-choreo-running','orb-flight-cover');
 bridge()?.expand?.(false);
 await waitFrames();
 const target=document.querySelector('.carousel-slide.current');
 if(!target){home()?.classList.remove('orb-choreo-running','orb-flight-cover');restoreOrigin();busy=false;return;}
 await fluidFlight(originalPosition,rect(target),'spending');
 home()?.classList.remove('orb-flight-cover','orb-choreo-running');
 busy=false;
}
async function closeSpending(){
 if(busy||!bridge()?.state?.expanded)return;
 busy=true;
 bridge()?.stopAutoplay?.();
 const card=document.querySelector('.carousel-slide.current');
 const fromCard=card?rect(card):null;
 const currentScroll=document.getElementById('scroller')?.scrollTop||0;
 const destination=originalPosition?inPhone({...originalPosition,y:originalPosition.y-(currentScroll-scrollAtOpen)}):null;
 home()?.classList.add('orb-choreo-running','orb-flight-cover');
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
 home()?.classList.remove('orb-flight-cover','orb-choreo-running');
 restoreOrigin();busy=false;
 if(restoreFocus?.isConnected)restoreFocus.focus({preventScroll:true});
}
phone.addEventListener('click',event=>{
 const orb=event.target.closest('#compactHero .milestone');
 if(orb){
  event.preventDefault();event.stopImmediatePropagation();
  if(busy||active)return;
  const all=[...document.querySelectorAll('#compactHero .milestone')];
  const kind=KINDS[all.indexOf(orb)];
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
 if(!active&&event.key==='Escape'&&bridge()?.state?.expanded&&bridge()?.state?.tab==='home'){event.preventDefault();event.stopImmediatePropagation();if(!busy)closeSpending();return;}
 if(!active)return;
 if(event.key==='Escape'){event.preventDefault();if(!busy)closeLayer();return;}
 if(event.key!=='Tab'||busy)return;
 const buttons=[...active.layer.querySelectorAll('button')];
 const first=buttons[0],last=buttons.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
},true);
phone.addEventListener('click',event=>{
 if(event.target.closest('#dock [data-tab]')&&(active||busy)){
  if(active){active.layer.remove();active=null;}stopFlight();restoreOrigin();busy=false;
  home()?.classList.remove('orb-choreo-running','orb-flight-cover');
 }
},true);
// Keep V2.8 collapsed until a user chooses an orb.
if(bridge()?.state)bridge().state.firstShow=false;
window.NexaOrbFlowV35={get phase(){return busy?'morphing':active?.kind||bridge()?.state?.expanded?'expanded':'idle'},get activeKind(){return active?.kind||(bridge()?.state?.expanded?'spending':null)}};
})();
