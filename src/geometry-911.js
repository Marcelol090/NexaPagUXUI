/* Geometry Lab 9.11: live structural editing of the ACTUAL NexaPag components.
 * No external overlay, no rebuilding component DOM, no modifications to the orb solver.
 */
const phone=document.getElementById('phone');
const editor=document.getElementById('geometryHub');
const sample=document.getElementById('geoSample');
const scopeButtons=Array.from(editor?.querySelectorAll('[data-geo-scope]')||[]);
const sliders=Array.from(editor?.querySelectorAll('input[data-geo-prop]')||[]);
const names={hero:'Card principal',metric:'Resumo',board:'Boards',tabs:'Tabs',nav:'Navbar'};
const defaults={
 hero:{radius:22,gap:14,padding:18,border:1,height:224,icon:12},
 metric:{radius:18,gap:10,padding:14,border:1,height:101,icon:11},
 board:{radius:17,gap:9,padding:12,border:1,height:106,icon:13},
 tabs:{radius:24,gap:5,padding:9,border:1,height:36,icon:12},
 nav:{radius:20,gap:4,padding:5,border:1,height:64,icon:15}
};
const props=['radius','gap','padding','border','height','icon'];
const values=structuredClone(defaults);
let scope='hero';
let inspect=false;
const CSS=(group,key)=>'--geo-'+group+'-'+key;
function put(group){
 if(!phone)return;
 for(const key of props)phone.style.setProperty(CSS(group,key),values[group][key]+'px');
}
function setScope(next){
 if(!defaults[next])return;
 scope=next;
 const iconControl=editor?.querySelector('[data-geo-prop="icon"]')?.closest('.geo-control');
 if(iconControl)iconControl.hidden=!['metric','board','nav'].includes(scope);
 for(const btn of scopeButtons){
  const selected=btn.dataset.geoScope===scope;
  btn.setAttribute('aria-pressed',String(selected));
 }
 for(const input of sliders){
  const key=input.dataset.geoProp;
  input.value=String(values[scope][key]);
  const output=editor.querySelector('[data-geo-out="'+key+'"]');
  if(output)output.textContent=values[scope][key]+' px';
 }
 const title=document.getElementById('geoSampleName');
 if(title)title.textContent=names[scope];
 updateSpecimen();
 syncGuides();
}
function updateSpecimen(){
 if(!sample)return;
 const v=values[scope];
 sample.style.setProperty('--geo-sample-radius',v.radius+'px');
 sample.style.setProperty('--geo-sample-border',v.border+'px');
 sample.style.setProperty('--geo-sample-pad',v.padding+'px');
 sample.style.setProperty('--geo-sample-gap',v.gap+'px');
 sample.style.setProperty('--geo-sample-height',Math.min(166,Math.max(72,v.height*.57))+'px');
 const dimensions=document.getElementById('geoSampleDims');
 if(dimensions)dimensions.textContent='R '+v.radius+' · G '+v.gap+' · P '+v.padding+' · B '+v.border+' px';
 const label=document.getElementById('geoActiveScope');
 if(label)label.textContent=names[scope];
}
function syncGuides(){
 if(phone)phone.dataset.geoInspect=inspect?scope:'';
 const btn=document.getElementById('geoInspect');
 if(btn){btn.setAttribute('aria-pressed',String(inspect));btn.textContent=inspect?'Ocultar guias':'Mostrar guias'}
}
function writeStatus(message){
 const item=document.getElementById('geoStatus');
 if(item)item.textContent=message;
}
function getSnapshot(){
 return {version:1,theme:'sage-material-911',groups:structuredClone(values)};
}
function exportCSS(){
 const lines=['/* NexaPag Geometry 9.11 · use after material CSS */','.phone {'];
 for(const group of Object.keys(defaults)){
  lines.push('  /* '+names[group]+' */');
  for(const key of props)lines.push('  '+CSS(group,key)+': '+values[group][key]+'px;');
 }
 lines.push('}');
 return lines.join('\n');
}
async function copyText(text){
 if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(text);return true}catch(_){}}
 const tmp=document.createElement('textarea');
 tmp.value=text;tmp.style.cssText='position:fixed;left:-10000px;top:-10000px';
 document.body.appendChild(tmp);tmp.select();
 const okay=document.execCommand?.('copy')||false;tmp.remove();
 return okay;
}
for(const group of Object.keys(defaults))put(group);
scopeButtons.forEach(button=>button.addEventListener('click',()=>setScope(button.dataset.geoScope)));
sliders.forEach(input=>input.addEventListener('input',()=>{
 const key=input.dataset.geoProp;
 const value=Number(input.value);
 if(!Number.isFinite(value))return;
 values[scope][key]=value;
 put(scope);
 const output=editor.querySelector('[data-geo-out="'+key+'"]');
 if(output)output.textContent=value+' px';
 updateSpecimen();
 writeStatus(names[scope]+' atualizado no preview');
}));
document.getElementById('geoReset')?.addEventListener('click',()=>{
 values[scope]=structuredClone(defaults[scope]);
 put(scope);
 setScope(scope);
 writeStatus('Geometria padrão restaurada para '+names[scope]);
});
document.getElementById('geoInspect')?.addEventListener('click',()=>{
 inspect=!inspect;syncGuides();
 writeStatus(inspect?'Guias de borda ativadas':'Guias de borda ocultas');
});
document.getElementById('geoCopy')?.addEventListener('click',async()=>{
 const okay=await copyText(exportCSS());
 writeStatus(okay?'Tokens CSS copiados':'Copie o CSS pelo navegador');
});
document.getElementById('geoSave')?.addEventListener('click',()=>{
 try{localStorage.setItem('nexapag.geometry.911',JSON.stringify(getSnapshot()));writeStatus('Ajustes salvos neste navegador')}catch{writeStatus('Armazenamento indisponível neste navegador')}
});
document.getElementById('geoLoad')?.addEventListener('click',()=>{
 try{
  const raw=localStorage.getItem('nexapag.geometry.911');
  if(!raw){writeStatus('Ainda não há geometria salva');return}
  const data=JSON.parse(raw);
  for(const group of Object.keys(defaults))for(const key of props){
   const incoming=Number(data?.groups?.[group]?.[key]);
   if(Number.isFinite(incoming))values[group][key]=Math.max(0,Math.min(260,incoming));
  }
  for(const group of Object.keys(defaults))put(group);
  setScope(scope);
  writeStatus('Geometria salva restaurada');
 }catch{writeStatus('Não foi possível carregar os ajustes')}
});
const mobileToggle=document.getElementById('geoMobileToggle');
mobileToggle?.addEventListener('click',()=>{
 const opened=document.body.classList.toggle('geo-mobile-open');
 mobileToggle.setAttribute('aria-expanded',String(opened));
 mobileToggle.textContent=opened?'Fechar geometria':'Geometria · PX';
});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&document.body.classList.contains('geo-mobile-open')){
  document.body.classList.remove('geo-mobile-open');
  mobileToggle?.setAttribute('aria-expanded','false');
  if(mobileToggle)mobileToggle.textContent='Geometria · PX';
 }
});
window.NexaPagGeometry={
 get:()=>getSnapshot(),
 css:()=>exportCSS(),
 choose:setScope,
 reset:()=>{for(const g of Object.keys(defaults)){values[g]=structuredClone(defaults[g]);put(g)}setScope(scope)}
};
setScope('hero');
