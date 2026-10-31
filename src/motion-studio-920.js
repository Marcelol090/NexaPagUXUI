/* NexaPag 9.20 | Live motion controls, scoped to the real financial UI. */
(function(){
 'use strict';
 const phone=document.getElementById('phone');
 const panel=document.getElementById('inspector-panel-motion');
 const content=document.getElementById('content');
 if(!phone||!panel||!content)return;
 const defaults=Object.freeze({duration:260,stagger:38,travel:10,lift:2,press:2,shadow:48,ambient:100,ease:'silk',auto:true});
 const ranges={duration:[100,620,10],stagger:[0,140,1],travel:[0,26,1],lift:[0,8,.5],press:[0,5,.5],shadow:[0,100,1],ambient:[40,180,5]};
 const curves={silk:'cubic-bezier(.22,1,.36,1)',precise:'cubic-bezier(.2,.7,.2,1)',spring:'cubic-bezier(.16,1.35,.36,1)',standard:'cubic-bezier(.4,0,.2,1)'};
 const presets={
  suave:{duration:210,stagger:25,travel:5,lift:1,press:1.5,shadow:37,ambient:135,ease:'silk'},
  equilibrado:{...defaults},
  editorial:{duration:380,stagger:65,travel:15,lift:3,press:2.5,shadow:63,ambient:80,ease:'spring'}
 };
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const normalize=(key,value)=>{
  if(key==='ease')return Object.hasOwn(curves,value)?value:defaults.ease;
  if(key==='auto')return value===true;
  const [low,high,step]=ranges[key];
  const number=Number(value);
  return Math.round(Math.max(low,Math.min(high,Number.isFinite(number)?number:defaults[key]))/step)*step;
 };
 const state={...defaults};
 let shadowEdited=false,paused=false,animations=[],pending=0;
 try{
  const saved=JSON.parse(localStorage.getItem('nexapag.motion.920')||'null');
  if(saved&&saved.version===920&&saved.values){
   for(const key of Object.keys(defaults))if(Object.hasOwn(saved.values,key))state[key]=normalize(key,saved.values[key]);
   shadowEdited=!!saved.shadowEdited;
  }
 }catch{}
 const studio=document.createElement('section');
 studio.className='nm-studio';studio.id='nexaMotionStudio';
 studio.setAttribute('aria-label','Motion Studio configurável');
 studio.innerHTML=
 '<div class="nm-topline"><span>NEXAPAG / MOTION SYSTEM</span><small>9.20</small></div>'+
 '<div class="nm-titleline"><strong>Ritmo &amp; resposta</strong><span class="nm-live">● Live</span></div>'+
 '<p class="nm-description">Motion aplicado aos componentes reais. Sem deformar a tela, sem recriar os gráficos.</p>'+
 '<div class="nm-presetbar" role="group" aria-label="Presets de movimento"><button type="button" data-nm-preset="suave">Sutil</button><button type="button" data-nm-preset="equilibrado">Equilibrado</button><button type="button" data-nm-preset="editorial">Expressivo</button></div>'+
 '<div class="nm-preview" aria-hidden="true"><div class="nm-preview-title"><span>Curva de movimento</span><b id="nmCurveName">Silk ease</b></div><div class="nm-motion-track"><i></i><i></i><i></i></div><div class="nm-time-axis"><span>0 ms</span><span id="nmTimeEnd">260 ms</span></div></div>'+
 '<details class="nm-group" open><summary>01 · Coreografia <small>Entrada, ritmo, easing</small></summary><div class="nm-inner">'+
 '<label class="nm-control"><span>Duração <output data-nm-output="duration"></output></span><input type="range" data-nm-key="duration" min="100" max="620" step="10"></label>'+
 '<label class="nm-control"><span>Intervalo entre cards <output data-nm-output="stagger"></output></span><input type="range" data-nm-key="stagger" min="0" max="140" step="1"></label>'+
 '<label class="nm-control"><span>Deslocamento vertical <output data-nm-output="travel"></output></span><input type="range" data-nm-key="travel" min="0" max="26" step="1"></label>'+
 '<label class="nm-select-control">Curva de easing<select data-nm-key="ease" id="nmEase"><option value="silk">Silk · saída suave</option><option value="precise">Precise · natural</option><option value="spring">Spring · resposta física</option><option value="standard">Standard · material</option></select></label></div></details>'+
 '<details class="nm-group" open><summary>02 · Interação e profundidade <small>Toque, sombra, ambiente</small></summary><div class="nm-inner">'+
 '<label class="nm-control"><span>Elevação ao apontar <output data-nm-output="lift"></output></span><input type="range" data-nm-key="lift" min="0" max="8" step="0.5"></label>'+
 '<label class="nm-control"><span>Compressão ao toque <output data-nm-output="press"></output></span><input type="range" data-nm-key="press" min="0" max="5" step="0.5"></label>'+
 '<label class="nm-control"><span>Profundidade da sombra <output data-nm-output="shadow"></output></span><input type="range" data-nm-key="shadow" min="0" max="100" step="1"></label>'+
 '<p class="nm-assist">A sombra original permanece até mudar este controle. Restaurar reverte o acabamento.</p>'+
 '<label class="nm-control"><span>Tempo Silk Folds <output data-nm-output="ambient"></output></span><input type="range" data-nm-key="ambient" min="40" max="180" step="5"></label></div></details>'+
 '<label class="nm-checkbox"><input type="checkbox" data-nm-key="auto"><span>Animar ao trocar de aba <small>Entrada única, sem loops nos cards.</small></span></label>'+
 '<div class="nm-actions"><button class="nm-primary" type="button" id="nmReplay">▶ Prévia na tela</button><button type="button" id="nmPause" aria-pressed="false">Pausar</button><button type="button" id="nmReset">Restaurar</button></div>'+
 '<div class="nm-feedback" role="status" aria-live="polite" id="nmStatus">Controles conectados.</div><div class="nm-readback" id="nmReadback"></div>';
 const anchor=panel.querySelector('.inspector-motion-controls');
 panel.insertBefore(studio,anchor||null);
 const q=selector=>studio.querySelector(selector);
 const qa=selector=>Array.from(studio.querySelectorAll(selector));
 const fmt=(key,value)=>['duration','stagger'].includes(key)?value+' ms':['travel','lift'].includes(key)?value+' px':value+'%';
 const targets=()=>Array.from(content.querySelectorAll('.glass-site>.panel,.glass-site>.metric,.quick-board,.category-board,.transaction,.bankcard'))
   .filter((el,i,all)=>all.indexOf(el)===i&&el.isConnected&&el.getClientRects().length>0).slice(0,12);
 const inactive=()=>reduced.matches||phone.classList.contains('no-motion')||document.hidden||paused;
 const announce=message=>{q('#nmStatus').textContent=message};
 function stop(){
  if(pending){cancelAnimationFrame(pending);pending=0}
  animations.forEach(anim=>{try{anim.cancel()}catch{}});
  animations=[];
 }
 function persist(){try{localStorage.setItem('nexapag.motion.920',JSON.stringify({version:920,values:state,shadowEdited}))}catch{}}
 function apply(){
  phone.dataset.motionStudio='920';
  phone.style.setProperty('--nm-duration',state.duration+'ms');
  phone.style.setProperty('--nm-fast',Math.max(90,Math.round(state.duration*.62))+'ms');
  phone.style.setProperty('--nm-ease',curves[state.ease]);
  phone.style.setProperty('--nm-lift',state.lift+'px');
  phone.style.setProperty('--nm-press',String(1-state.press/100));
  phone.style.setProperty('--nm-ambient-factor',String(state.ambient/100));
  phone.style.setProperty('--nm-shadow-y',Math.round(10+state.shadow*.19)+'px');
  phone.style.setProperty('--nm-shadow-blur',Math.round(19+state.shadow*.35)+'px');
  phone.style.setProperty('--nm-shadow-alpha',(state.shadow*.006).toFixed(3));
  phone.toggleAttribute('data-nm-shadow',shadowEdited);
  phone.toggleAttribute('data-nm-paused',paused);
  qa('[data-nm-key]').forEach(input=>{
   const key=input.dataset.nmKey;
   if(input.type==='checkbox')input.checked=state[key];else input.value=state[key];
  });
  qa('[data-nm-output]').forEach(output=>{output.textContent=fmt(output.dataset.nmOutput,state[output.dataset.nmOutput])});
  qa('[data-nm-preset]').forEach(btn=>btn.setAttribute('aria-pressed',String(Object.entries(presets[btn.dataset.nmPreset]).every(([k,v])=>state[k]===v))));
  q('#nmTimeEnd').textContent=state.duration+' ms';
  q('#nmCurveName').textContent={silk:'Silk ease',precise:'Precise',spring:'Spring',standard:'Standard'}[state.ease];
  studio.style.setProperty('--nm-preview-duration',state.duration+'ms');
  studio.style.setProperty('--nm-preview-delay',state.stagger+'ms');
  studio.style.setProperty('--nm-preview-ease',curves[state.ease]);
  const element=content.querySelector('.quick-board,.category-board,.glass-site>.metric,.glass-site>.panel');
  const computed=element?getComputedStyle(element):null;
  q('#nmReadback').textContent=computed
   ?'CSS calculado · '+computed.transitionDuration+' · '+computed.transitionTimingFunction
   :'Nenhum componente detectado';
  if(inactive())stop();
  persist();
 }
 function preview(){
  stop();
  if(inactive()){announce(reduced.matches?'Movimento reduzido pelo sistema.':'Motion pausado ou desativado.');return false}
  if(typeof Element==='undefined'||typeof Element.prototype.animate!=='function'){announce('Animações indisponíveis neste navegador.');return false}
  const items=targets();
  if(!items.length){announce('Abra uma aba com componentes.');return false}
  items.forEach((el,i)=>{
   animations.push(el.animate(
    [{opacity:.65,translate:'0 '+state.travel+'px'},{opacity:1,translate:'0 0px'}],
    {duration:state.duration,delay:i*state.stagger,easing:curves[state.ease],fill:'none'}
   ));
  });
  announce('Prévia em '+items.length+' componentes · '+state.duration+'ms · '+state.ease);
  return true;
 }
 qa('[data-nm-key]').forEach(input=>{
  input.addEventListener(input.type==='checkbox'||input.tagName==='SELECT'?'change':'input',()=>{
   const key=input.dataset.nmKey;
   state[key]=normalize(key,input.type==='checkbox'?input.checked:input.value);
   if(key==='shadow')shadowEdited=true;
   apply();announce('Atualizado · '+(key==='ease'?state.ease:fmt(key,state[key])));
  });
 });
 qa('[data-nm-preset]').forEach(btn=>btn.addEventListener('click',()=>{
  Object.assign(state,presets[btn.dataset.nmPreset]);shadowEdited=true;paused=false;
  q('#nmPause').textContent='Pausar';q('#nmPause').setAttribute('aria-pressed','false');
  apply();announce('Preset '+btn.textContent+' aplicado.');
 }));
 q('#nmReplay').addEventListener('click',preview);
 q('#nmPause').addEventListener('click',()=>{
  paused=!paused;if(paused)stop();
  q('#nmPause').textContent=paused?'Retomar':'Pausar';
  q('#nmPause').setAttribute('aria-pressed',String(paused));
  apply();announce(paused?'Motion pausado.':'Motion retomado.');
 });
 function reset(){
  stop();Object.assign(state,defaults);shadowEdited=false;paused=false;
  q('#nmPause').textContent='Pausar';q('#nmPause').setAttribute('aria-pressed','false');
  apply();announce('Motion e acabamento restaurados.');
 }
 q('#nmReset').addEventListener('click',reset);
 let lastTab=window.NexaPagPreview?.getState?.()?.tab||null;
 const observer=new MutationObserver(()=>{
  const current=window.NexaPagPreview?.getState?.()?.tab||null;
  const changed=current!==lastTab;lastTab=current;
  if(changed&&state.auto&&!inactive()){
   if(pending)cancelAnimationFrame(pending);
   pending=requestAnimationFrame(()=>{pending=0;preview()});
  }
 });
 observer.observe(content,{childList:true,subtree:false});
 reduced.addEventListener?.('change',()=>{if(reduced.matches)stop();apply()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
 document.getElementById('motionSwitch')?.addEventListener('click',()=>requestAnimationFrame(()=>{if(inactive())stop();apply()}));
 window.NexaPagMotionStudio=Object.freeze({
  inspect:()=>({values:{...state},shadowEdited,paused,targets:targets().length,enabled:!inactive()}),
  apply:(key,value)=>{if(!Object.hasOwn(defaults,key))return false;state[key]=normalize(key,value);if(key==='shadow')shadowEdited=true;apply();return true},
  preview,reset,stop
 });
 apply();
})();
