/* NexaPag 9.12 · Geometry Lab refinement
 * Opt-in changes only. Unedited components inherit the approved Sage Glass CSS
 * without any override. All inputs change the actual phone, never a fake clone.
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
const edits={hero:{},metric:{},board:{},tabs:{},nav:{}};
let scope='hero';
let inspect=false;
const attr=(group,key)=>'data-geo-'+group+'-'+key;
const CSS=(group,key)=>'--geo-'+group+'-'+key;
const field=(key)=>editor?.querySelector('[data-geo-prop="'+key+'"]');
const edited=(group,key)=>!!edits[group]?.[key];

function writeStatus(message){
 const item=document.getElementById('geoStatus');
 if(item)item.textContent=message;
}
function setDimension(group,key,value){
 if(!phone||!defaults[group]||!props.includes(key)||!Number.isFinite(value))return;
 const input=field(key);
 let v=value;
 // Honor context-specific bounds without making small tabs 260px high.
 if(key==='height'){
  const bounds={hero:[160,300],metric:[60,150],board:[72,170],tabs:[28,60],nav:[54,78]}[group];
  v=Math.max(bounds[0],Math.min(bounds[1],value));
 }else if(key==='radius'){
  v=Math.max(0,Math.min(group==='tabs'?48:42,value));
 }else if(key==='border'){v=Math.max(0,Math.min(3,value));}
 else{v=Math.max(0,Math.min(key==='padding'?30:key==='gap'?28:26,value))}
 values[group][key]=v;
 edits[group][key]=true;
 phone.style.setProperty(CSS(group,key),v+'px');
 phone.setAttribute(attr(group,key),'');
}
function restoreGroup(group){
 for(const key of props){
  delete edits[group][key];
  phone?.style.removeProperty(CSS(group,key));
  phone?.removeAttribute(attr(group,key));
  values[group][key]=defaults[group][key];
 }
}
function setScope(next){
 if(!defaults[next])return;
 scope=next;
 for(const btn of scopeButtons)btn.setAttribute('aria-pressed',String(btn.dataset.geoScope===scope));
 const iconRow=field('icon')?.closest('.geo-control');
 if(iconRow)iconRow.hidden=!['metric','board','nav'].includes(scope);
 const heightInput=field('height');
 const bounds={hero:[160,300],metric:[60,150],board:[72,170],tabs:[28,60],nav:[54,78]}[scope];
 if(heightInput){heightInput.min=bounds[0];heightInput.max=bounds[1]}
 for(const input of sliders){
  const key=input.dataset.geoProp;
  const v=values[scope][key];
  input.value=String(v);
  const out=editor.querySelector('[data-geo-out="'+key+'"]');
  if(out)out.textContent=v+' px';
 }
 document.getElementById('geoSampleName').textContent=names[scope];
 document.getElementById('geoHint').textContent=
  Object.keys(edits[scope]).length
   ?'Ajustes aplicados: '+Object.keys(edits[scope]).length+' · o restante preserva o original'
   :'Sem alterações: material e proporções originais preservados';
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
 sample.style.setProperty('--geo-sample-height',Math.min(148,Math.max(83,v.height*.49))+'px');
 const dimensions=document.getElementById('geoSampleDims');
 if(dimensions)dimensions.textContent='R '+v.radius+' · G '+v.gap+' · P '+v.padding+' · B '+v.border+' px';
 const label=document.getElementById('geoActiveScope');
 if(label)label.textContent=names[scope];
}
function syncGuides(){
 if(phone)phone.dataset.geoInspect=inspect?scope:'';
 const btn=document.getElementById('geoInspect');
 if(btn){btn.setAttribute('aria-pressed',String(inspect));btn.textContent=inspect?'Ocultar':'Guias'}
}
function snapshot(){
 return {version:2,theme:'sage-material-912',groups:structuredClone(values),edits:structuredClone(edits)};
}
function exportCSS(){
 const selectors={
  hero:{radius:'.glass-site>.panel.fiduciary-hero|border-radius',gap:'.fiduciary-hero .hero-graph-frame|margin-top',padding:'.glass-site>.panel.fiduciary-hero|padding',border:'.glass-site>.panel.fiduciary-hero|border-width',height:'.glass-site>.panel.fiduciary-hero|min-height'},
  metric:{radius:'.glass-site[data-optic="metric"]>.metric|border-radius',gap:'.metric-row|gap',padding:'.glass-site[data-optic="metric"]>.metric|padding',border:'.glass-site[data-optic="metric"]>.metric|border-width',height:'.glass-site[data-optic="metric"]>.metric|min-height',icon:'.metric .small-icon|border-radius'},
  board:{radius:'.quick-board,.phone .category-board|border-radius',gap:'.quick-grid,.phone .category-board-grid|gap',padding:'.quick-board,.phone .category-board|padding',border:'.quick-board,.phone .category-board|border-width',height:'.quick-board,.phone .category-board|min-height',icon:'.quick-icon,.phone .category-board .cat-symbol|border-radius'},
  tabs:{radius:'.overview-period button,.phone .segmented button,.phone .filters button|border-radius',gap:'.overview-period,.phone .segmented,.phone .filters|gap',padding:'.overview-period button,.phone .segmented button,.phone .filters button|padding',border:'.overview-period button,.phone .segmented button,.phone .filters button|border-width',height:'.overview-period button,.phone .segmented button,.phone .filters button|min-height'},
  nav:{radius:'.nav|border-radius',gap:'.nav|gap',padding:'.nav|padding',border:'.nav|border-width',height:'.nav|height',icon:'.nav button|border-radius'}
 };
 const lines=['/* NexaPag Geometry 9.12. Only explicit edits are exported. */'];
 let count=0;
 for(const [group,obj] of Object.entries(edits))for(const key of Object.keys(obj)){
  if(!obj[key]||!selectors[group][key])continue;
  const [selector,property]=selectors[group][key].split('|');
  const targets=selector.split(',').map(x=>x.trim()).map(x=>x.startsWith('.phone')?x:'.phone '+x).join(', ');
  lines.push(targets+' { '+property+': '+values[group][key]+'px; }');
  count++;
 }
 if(!count)lines.push('/* Nenhuma geometria alterada. O design original está ativo. */');
 return lines.join('\n');
}
async function copyText(text){
 if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(text);return true}catch(_){}}
 const tmp=document.createElement('textarea');tmp.value=text;tmp.style.cssText='position:fixed;left:-10000px;top:-10000px';
 document.body.appendChild(tmp);tmp.select();
 const okay=document.execCommand?.('copy')||false;tmp.remove();return okay;
}
scopeButtons.forEach(button=>button.addEventListener('click',()=>setScope(button.dataset.geoScope)));
sliders.forEach(input=>input.addEventListener('input',()=>{
 const key=input.dataset.geoProp, value=Number(input.value);
 if(!Number.isFinite(value))return;
 setDimension(scope,key,value);
 const out=editor.querySelector('[data-geo-out="'+key+'"]');
 if(out)out.textContent=values[scope][key]+' px';
 updateSpecimen();setScope(scope);
 writeStatus(names[scope]+' · '+key+' atualizado');
}));
document.getElementById('geoReset')?.addEventListener('click',()=>{
 restoreGroup(scope);setScope(scope);writeStatus('CSS original restaurado em '+names[scope]);
});
document.getElementById('geoInspect')?.addEventListener('click',()=>{
 inspect=!inspect;syncGuides();
 writeStatus(inspect?'Guia ativada':'Guia desativada');
});
document.getElementById('geoCopy')?.addEventListener('click',async()=>{
 const okay=await copyText(exportCSS());
 writeStatus(okay?'CSS de alterações copiado':'Selecione o texto com as regras no DevTools');
});
document.getElementById('geoSave')?.addEventListener('click',()=>{
 try{localStorage.setItem('nexapag.geometry.912',JSON.stringify(snapshot()));writeStatus('Ajustes salvos neste navegador')}
 catch{writeStatus('Armazenamento indisponível')}
});
document.getElementById('geoLoad')?.addEventListener('click',()=>{
 try{
  const raw=localStorage.getItem('nexapag.geometry.912');
  if(!raw){writeStatus('Ainda não há geometria salva');return}
  const data=JSON.parse(raw);
  for(const group of Object.keys(defaults)){
   restoreGroup(group);
   for(const key of props){
    if(!data?.edits?.[group]?.[key])continue;
    const v=Number(data.groups?.[group]?.[key]);
    if(Number.isFinite(v))setDimension(group,key,v);
   }
  }
  setScope(scope);writeStatus('Ajustes restaurados');
 }catch{writeStatus('Não foi possível carregar a geometria')}
});
const mobileToggle=document.getElementById('geoMobileToggle');
function closeMobile(){
 document.body.classList.remove('geo-mobile-open');
 mobileToggle?.setAttribute('aria-expanded','false');
 if(mobileToggle)mobileToggle.textContent='Geometria · PX';
}
mobileToggle?.addEventListener('click',()=>{
 const opened=document.body.classList.toggle('geo-mobile-open');
 mobileToggle.setAttribute('aria-expanded',String(opened));
 mobileToggle.textContent=opened?'Fechar geometria':'Geometria · PX';
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&document.body.classList.contains('geo-mobile-open'))closeMobile();
});
window.NexaPagGeometry={get:snapshot,css:exportCSS,choose:setScope,reset:()=>{
 for(const g of Object.keys(defaults))restoreGroup(g);
 setScope(scope);
}};
setScope('hero');
