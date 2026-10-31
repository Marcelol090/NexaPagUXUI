/* NexaPag 9.17 | Control fidelity bridge.
 * Existing sliders keep their official JS handlers. This layer reconnects
 * their material tokens to the actual shared Sage light source.
 */
const uxRoot=document.documentElement;
const uxRead=(id,fallback)=>Number(document.getElementById(id)?.value ?? fallback);
const uxBound=(n,min,max)=>Math.max(min,Math.min(max,Number.isFinite(n)?n:min));
const uxMix=(a,b,ratio)=>{
 const percent=Math.round(uxBound(ratio,0,1)*100);
 return 'color-mix(in oklab, '+a+' '+(100-percent)+'%, '+b+' '+percent+'%)';
};
let uxRaf=0;
function uxReconnect(){
 const pigment=uxBound(uxRead('pigmentRange',74)/100,0,1);
 const light=uxBound(uxRead('lightRange',78)/100,0,1);
 const mix=uxBound(uxRead('blendRange',44)/100,0,1);
 const rim=uxBound(uxRead('rimRange',72)/100,0,1);
 const luminance=pigment*light;
 uxRoot.style.setProperty('--ux-ambient-sage',(luminance*.93).toFixed(3));
 uxRoot.style.setProperty('--ux-ambient-sky',(luminance*.68).toFixed(3));
 uxRoot.style.setProperty('--ux-ambient-mix',uxMix('#D5E6A8','#A8D95E',mix*.45));
 uxRoot.style.setProperty('--ux-ambient-secondary',uxMix('#0D6372','#5FA9D8',mix*.9));
 uxRoot.style.setProperty('--ux-mist-opacity',(luminance*(.26+mix*.70)).toFixed(3));
 uxRoot.style.setProperty('--ux-mist-sage',uxMix('rgba(168,217,94,.12)','rgba(95,169,216,.17)',mix*.65));
 uxRoot.style.setProperty('--ux-mist-sky',uxMix('rgba(31,139,87,.09)','rgba(95,169,216,.18)',mix));
 uxRoot.style.setProperty('--ux-rim-alpha',(.075+rim*.19).toFixed(3));
 uxRoot.style.setProperty('--ux-rim-highlight',(.03+rim*.24).toFixed(3));
}
function uxQueue(){
 if(uxRaf)return;
 uxRaf=requestAnimationFrame(()=>{uxRaf=0;uxReconnect()});
}
const uxLinked=new Set(['blurRange','filmRange','rimRange','lightRange','pigmentRange','diffuseRange','blendRange']);
const uxNames={
 blurRange:'Background blur',filmRange:'Densidade do acrílico',
 rimRange:'Reflexo do contorno',lightRange:'Luz atrás dos cards',
 pigmentRange:'Força dos pigmentos',diffuseRange:'Difusão da cor',
 blendRange:'Mesclagem tonal',
 orbRefraction:'Iridescência',orbSeam:'Interfaces líquidas',
 orbMotion:'Resposta do líquido'
};
function uxReport(name,value,units){
 const foot=document.querySelector('.workspace-inspector .inspector-foot b');
 if(foot)foot.textContent=name+': '+value+units;
}
document.addEventListener('input',event=>{
 const target=event.target;
 if(!(target instanceof HTMLInputElement))return;
 if(uxLinked.has(target.id)){
  uxQueue();
  uxReport(uxNames[target.id],target.value,
   target.id==='blurRange'||target.id==='diffuseRange'?' px':'%');
 }else if(target.hasAttribute('data-geo-prop')){
  uxReport('Geometria',target.value,' px');
 }
},false);
document.addEventListener('click',event=>{
 if(event.target instanceof Element &&
    event.target.closest('[data-pigment-preset], .profile-buttons button'))uxQueue();
},false);

/* Mirror the original LiquidOrb controls into Motion. Originals stay in their
 * working modal; these proxies call the same setControl bridge. */
const uxMotion=document.getElementById('inspector-panel-motion');
if(uxMotion){
 const group=document.createElement('section');
 group.className='motion-physics';
 let html='<h4>Física do LiquidOrb</h4>'+
  '<p>Os ajustes controlam a bolha original. Abra-a para observar o efeito.</p>';
 for(const id of ['orbRefraction','orbSeam','orbMotion']){
  const original=document.getElementById(id);
  if(!original)continue;
  html+='<label class="motion-physics-row"><span>'+uxNames[id]+
  '<output data-orb-output="'+id+'">'+original.value+'%</output></span>'+
  '<input type="range" data-orb-control="'+id+'" min="'+original.min+
  '" max="'+original.max+'" step="'+(original.step||1)+'" value="'+original.value+'" /></label>';
 }
 html+='<div class="motion-physics-actions"><button type="button" id="motionOpenOrb">Abrir LiquidOrb</button>'+
 '<button type="button" id="motionShakeOrb">Agitar</button></div>';
 group.innerHTML=html;
 uxMotion.appendChild(group);
 group.querySelectorAll('input[data-orb-control]').forEach(input=>{
  input.addEventListener('input',()=>{
   const id=input.dataset.orbControl;
   if(window.NexaPagPreview?.setControl(id,input.value)){
    const output=group.querySelector('[data-orb-output="'+id+'"]');
    if(output)output.textContent=input.value+'%';
    uxReport(uxNames[id],input.value,'%');
   }
  });
 });
 group.querySelector('#motionOpenOrb')?.addEventListener('click',()=>window.NexaPagPreview?.openOrb?.());
 group.querySelector('#motionShakeOrb')?.addEventListener('click',()=>{
  window.NexaPagPreview?.openOrb?.();
  window.NexaPagPreview?.shakeOrb?.();
 });
}
uxReconnect();
window.NexaPagControlsQA=Object.freeze({
 check(){
  const types=['blurRange','filmRange','rimRange','lightRange','pigmentRange','diffuseRange','blendRange','orbRefraction','orbSeam','orbMotion'];
  return types.map(id=>{
   const input=document.getElementById(id);
   const available=!!input&&input.type==='range';
   return {id,available,value:available?Number(input.value):null};
  });
 },
 readEffects(){
  const phone=document.getElementById('phone');
  const hero=phone?.querySelector('.glass-site>.panel.fiduciary-hero');
  const ambient=phone?.querySelector('.ambient');
  return {
   root:{
    glow:getComputedStyle(uxRoot).getPropertyValue('--glass-glow').trim(),
    mix:getComputedStyle(uxRoot).getPropertyValue('--pigment-interlock').trim(),
    sage:getComputedStyle(uxRoot).getPropertyValue('--ux-ambient-sage').trim(),
    sky:getComputedStyle(uxRoot).getPropertyValue('--ux-ambient-sky').trim()
   },
   heroBackdrop:hero?getComputedStyle(hero).backdropFilter:null,
   heroBorder:hero?getComputedStyle(hero).borderColor:null,
   ambientOpacity:ambient?getComputedStyle(ambient,'::before').opacity:null
  };
 }
});
