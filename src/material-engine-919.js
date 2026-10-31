/* NexaPag 9.19 | single-material calibration engine.
 * The existing input handlers update the original design tokens; this engine
 * makes hero, metrics, boards and nav consume one shared optical state.
 * No new copies of DOM controls or colored shaders.
 */
(function(){
 const phone=document.getElementById('phone');
 const pane=document.getElementById('inspector-panel-material');
 if(!phone)return;
 const ids=['filmRange','blurRange','rimRange','lightRange','pigmentRange','diffuseRange','blendRange'];
 const source={};
 for(const id of ids){const el=document.getElementById(id);if(el)source[id]=el.value}
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
 const val=(id,fallback)=>clamp(Number(document.getElementById(id)?.value??fallback),0,150);
 const px=n=>Math.round(n*100)/100+'px';
 const rgbaAlpha=n=>Math.round(n*1000)/1000;
 const makeVars=()=>{
  const f=clamp(val('filmRange',74)/100,0,1);
  const b=clamp(val('blurRange',23),0,42);
  const rim=clamp(val('rimRange',72)/100,0,1);
  const pigment=clamp(val('pigmentRange',74)/110,0,1);
  const light=clamp(val('lightRange',78)/100,0,1);
  const tint=clamp(val('blendRange',44)/100,0,1);
  const diffusion=clamp(val('diffuseRange',20),4,55);
  const beam=pigment*light;
  return {
   '--live-glass-panel':rgbaAlpha(.16+f*.76),
   '--live-glass-hero':rgbaAlpha(.08+f*.79),
   '--live-glass-metric':rgbaAlpha(.14+f*.76),
   '--live-glass-board':rgbaAlpha(.11+f*.56),
   '--live-glass-nav':rgbaAlpha(.62+f*.37),
   '--live-glass-rim':rgbaAlpha(.08+rim*.22),
   '--live-glass-select-rim':rgbaAlpha(.29+rim*.29),
   '--live-glass-highlight':rgbaAlpha(.035+rim*.20),
   '--live-glass-mini-highlight':rgbaAlpha(.017+rim*.09),
   '--live-glass-sheen':rgbaAlpha(.13+rim*.70),
   '--live-glass-blur':px(b),
   '--live-glass-board-blur':px(b*.43),
   '--live-glass-nav-blur':px(b*.70),
   '--live-light-sage':rgbaAlpha(beam*(.60+.35*tint)),
   '--live-light-sky':rgbaAlpha(beam*(.36+.35*tint)),
   '--live-light-mist':rgbaAlpha(beam*(.35+.55*tint)),
   '--live-light-diffusion':px(diffusion)
  };
 };
 const samples={
  'Saídas líquidas':'.glass-site>.panel.fiduciary-hero',
  'Métricas':'.glass-site[data-optic="metric"]>.metric',
  'Boards':'.quick-board,.category-board',
  'Navbar':'.nav',
  'Cartões':'.bankcard',
  'Transações':'.transaction'
 };
 let proof=null,readback=null,meta=null;
 if(pane){
  proof=document.createElement('section');
  proof.className='glass-live-proof';proof.id='glassLiveProof';
  proof.innerHTML='<div class="glass-live-head"><strong>Material aplicado</strong><small id="glassLiveCount">Aguardando leitura</small></div>'+
   '<p>Os controles modificam o acrílico real dos cards, métricas, boards e navegação. O valor abaixo vem do CSS calculado, não da posição do slider.</p>'+
   '<div class="glass-live-readback" id="glassLiveReadback" aria-live="polite"></div>'+
   '<button class="glass-live-button" type="button" id="glassLiveReset">Restaurar material original</button>';
  pane.appendChild(proof);
  readback=proof.querySelector('#glassLiveReadback');
  meta=proof.querySelector('#glassLiveCount');
 }
 let pending=0;
 function read(){
  const found={};
  for(const [name,selector] of Object.entries(samples)){
   const el=phone.querySelector(selector);
   if(!el)continue;
   const style=getComputedStyle(el);
   found[name]={
    background:style.backgroundColor,
    border:style.borderTopColor,
    blur:style.backdropFilter||style.webkitBackdropFilter||'none'
   };
  }
  return found;
 }
 function refresh(){
  pending=0;
  const results=read();
  if(!readback)return results;
  const hero=results['Saídas líquidas']||results['Métricas']||results['Boards']||results['Navbar'];
  const count=Object.keys(results).length;
  const optical=!phone.classList.contains('no-optics');
  meta.textContent=optical?count+' tipos detectados':'Óptica desativada';
  const item=hero?Object.entries(results).find(([name])=>results[name]===hero):null;
  const name=item?.[0]||'Nenhum card nesta aba';
  const alpha=hero?.background||'indisponível';
  const blur=hero?.blur||'indisponível';
  readback.textContent=name+' · '+alpha+' · '+blur;
  return results;
 }
 function queue(){
  if(pending)return;
  pending=requestAnimationFrame(refresh);
 }
 function apply(){
  const vars=makeVars();
  for(const [key,value] of Object.entries(vars))phone.style.setProperty(key,String(value));
  phone.setAttribute('data-live-glass','');
  queue();
  return vars;
 }
 document.addEventListener('input',event=>{
  if(event.target instanceof HTMLInputElement && ids.includes(event.target.id))apply();
 });
 document.addEventListener('click',event=>{
  if(event.target instanceof Element&&
     event.target.closest('[data-pigment-preset], #opticsSwitch, #shaderSwitch')){
   // Existing handlers apply the preset or toggle the state in their own turn.
   requestAnimationFrame(apply);
  }
 });
 const reset=proof?.querySelector('#glassLiveReset');
 reset?.addEventListener('click',()=>{
  for(const [id,v] of Object.entries(source)){
   const control=document.getElementById(id);
   if(!control)continue;
   control.value=v;
   control.dispatchEvent(new Event('input',{bubbles:true}));
  }
  apply();
  if(readback)readback.textContent='Parâmetros originais restaurados';
 });
 const content=document.getElementById('content');
 const nav=document.getElementById('nav-wrap');
 if(typeof MutationObserver!=='undefined'){
  const observer=new MutationObserver(queue);
  if(content)observer.observe(content,{childList:true,subtree:false});
  if(nav)observer.observe(nav,{childList:true,subtree:false});
 }
 window.NexaPagMaterialEngine=Object.freeze({
  apply,read,makeVars,
  inspect(){
   const fields=read(),vars=makeVars();
   return {inputs:Object.fromEntries(ids.map(id=>[id,document.getElementById(id)?.value||''])),vars,fields};
  },
  /** For QA: no writes; compare two snapshots taken after an input change. */
  changed(before,after){
   return Object.keys(after).filter(key=>before[key]&&
      (before[key].background!==after[key].background||
       before[key].blur!==after[key].blur||
       before[key].border!==after[key].border));
  }
 });
 apply();
})();
