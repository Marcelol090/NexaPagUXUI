/* NexaPag 9.18 | Geometry System
 * Global dimension tokens with 0.10px–1px precision and readback from
 * actual, freshly rendered app components. Edits remain opt-in per property.
 * Original local refinements are preserved under "Refino individual".
 */
(function(){
 const phone=document.getElementById('phone');
 const page=document.getElementById('inspector-panel-geometry');
 const original=document.getElementById('geometryHub');
 const specimen=page?.querySelector('.geo-specimen');
 if(!phone||!page||!original)return;
 const properties=[
  {id:'radius',name:'Arredondamento',min:0,max:40,default:20,css:'borderRadius',selector:'.quick-board,.glass-site>.panel,.metric,.nav'},
  {id:'gap',name:'Espaçamento · gap',min:0,max:26,default:10,css:'gap',selector:'.quick-grid,.metric-row,.nav'},
  {id:'padding',name:'Padding · interior',min:0,max:28,default:14,css:'paddingTop',selector:'.quick-board,.glass-site>.panel,.metric'},
  {id:'border',name:'Espessura da borda',min:0,max:3,default:1,css:'borderTopWidth',selector:'.quick-board,.glass-site>.panel,.nav'},
  {id:'icon',name:'Radius dos glyphs',min:0,max:28,default:11,css:'borderRadius',selector:'.quick-icon,.small-icon,.txn-icon'}
 ];
 const keys=properties.map(item=>item.id);
 const changed=new Set();
 const values={};
 let precision=.25;
 let device=408;
 const fmt=value=>Number(Number(value).toFixed(2)).toString();
 const bound=(v,item)=>Math.max(item.min,Math.min(item.max,Number(v)));
 function baseline(item){
  const el=phone.querySelector(item.selector);
  if(!el)return item.default;
  const measured=parseFloat(getComputedStyle(el)[item.css]);
  return Number.isFinite(measured)?Math.max(item.min,Math.min(item.max,measured)):item.default;
 }
 for(const p of properties)values[p.id]=baseline(p);
 const panel=document.createElement('section');
 panel.className='global-geometry';
 panel.id='ggPanel';
 panel.setAttribute('aria-label','Geometria global dos componentes');
 panel.innerHTML=
  '<div class="gg-top"><span class="gg-eyebrow">DESIGN TOKENS / SISTEMA</span><span class="gg-state" id="ggState">Original</span></div>'+
  '<h4>Todos os componentes</h4>'+
  '<p class="gg-note">Um único ajuste percorre cards, boards, botões, tabs e navbar. Mude um valor para ativá-lo globalmente.</p>'+
  '<div class="gg-stepper"><span>Precisão do ajuste</span><div class="gg-step-options" role="group" aria-label="Precisão em pixels">'+
  [0.1,0.25,0.5,1].map(x=>'<button type="button" data-gg-step="'+x+'" aria-pressed="'+(x===.25)+'">'+x+'px</button>').join('')+
  '</div></div>'+
  properties.map(p=>
   '<div class="gg-field"><label for="gg-'+p.id+'">'+p.name+'</label>'+
   '<div class="gg-inputs"><input id="gg-'+p.id+'" data-ds-prop="'+p.id+'" type="range" '+
    'min="'+p.min+'" max="'+p.max+'" step=".25" value="'+fmt(values[p.id])+'" '+
    'aria-label="'+p.name+' em todos os componentes"/>'+
   '<input id="gg-number-'+p.id+'" data-ds-num="'+p.id+'" type="number" inputmode="decimal" '+
    'min="'+p.min+'" max="'+p.max+'" step=".25" value="'+fmt(values[p.id])+'" '+
    'aria-label="Valor preciso de '+p.name+' em pixels"/></div></div>'
  ).join('')+
  '<div class="gg-stepper"><span>Tela de teste</span><div class="gg-step-options" role="group" aria-label="Largura do dispositivo">'+
  [320,360,390,408].map(x=>'<button type="button" data-gg-device="'+x+'" aria-pressed="'+(x===408)+'">'+x+'</button>').join('')+
  '</div></div>'+
  '<p class="gg-note">Simule 320–408 px sem usar o zoom do navegador ou distorcer os gráficos.</p>'+
  '<div class="gg-actions"><button type="button" id="ggReset">Restaurar global</button>'+
  '<button type="button" id="ggCopy">Copiar tokens CSS</button></div>'+
  '<div class="gg-actions"><button type="button" id="ggSave">Salvar ajuste</button>'+
  '<button type="button" id="ggLoad">Carregar ajuste</button></div>'+
  '<p id="ggFeedback" class="gg-feedback" role="status" aria-live="polite">Visualize o design original, sem alterações globais.</p>';
 page.insertBefore(panel,original);
 const details=document.createElement('details');
 details.className='gg-refinements';
 details.id='ggRefinements';
 details.innerHTML='<summary>Refino por componente</summary><div class="gg-refinements-body"></div>';
 page.insertBefore(details,original);
 details.querySelector('.gg-refinements-body').append(original);
 if(specimen)details.querySelector('.gg-refinements-body').append(specimen);
 const feedback=panel.querySelector('#ggFeedback');
 const status=panel.querySelector('#ggState');
 const input=id=>panel.querySelector('[data-ds-prop="'+id+'"]');
 const number=id=>panel.querySelector('[data-ds-num="'+id+'"]');
 let reportFrame=0;
 function countTargets(){
  const selectors=[
   '.glass-site>.panel','.glass-site>.metric','.quick-board','.category-board',
   '.shop','.nav button','.primarybtn','.quick-icon','.txn-icon','.review-item',
   '.tiny-pill','.overview-period button','.segmented button','.filters button'
  ];
  const hits=new Set();
  for(const selector of selectors)for(const el of phone.querySelectorAll(selector))hits.add(el);
  return hits.size;
 }
 function readback(){
  const result={};
  for(const p of properties){
   const el=phone.querySelector(p.selector);
   result[p.id]=el?getComputedStyle(el)[p.css]:'sem amostra nesta aba';
  }
  return result;
 }
 function report(){
  reportFrame=0;
  const active=changed.size;
  status.textContent=active?active+' tokens globais':'Original';
  const live=readback();
  const parts=[...changed].map(key=>{
   const raw=live[key];
   return key+': '+(typeof raw==='string'&&raw?raw:fmt(values[key])+'px');
  });
  feedback.textContent=(active?'Aplicado a '+countTargets()+' elementos visíveis. ':'CSS original preservado. ')+
   (parts.length?parts.join(' · '):'Nenhum token alterado.')+
   (device!==408?' · tela '+device+'px':'');
 }
 function queueReport(){
  if(reportFrame)return;
  reportFrame=requestAnimationFrame(report);
 }
 function apply(key,value){
  const p=properties.find(x=>x.id===key);
  if(!p||!Number.isFinite(Number(value)))return false;
  values[key]=bound(Number(value),p);
  changed.add(key);
  phone.style.setProperty('--ds-'+key,fmt(values[key])+'px');
  phone.setAttribute('data-ds-'+key,'');
  input(key).value=String(values[key]);
  number(key).value=fmt(values[key]);
  queueReport();
  return true;
 }
 function reset(){
  for(const key of keys){
   changed.delete(key);
   phone.removeAttribute('data-ds-'+key);
   phone.style.removeProperty('--ds-'+key);
  }
  for(const p of properties){
   values[p.id]=baseline(p);
   input(p.id).value=String(values[p.id]);
   number(p.id).value=fmt(values[p.id]);
  }
  device=408;
  phone.removeAttribute('data-ds-device');
  phone.style.removeProperty('--ds-device-width');
  for(const btn of panel.querySelectorAll('[data-gg-device]'))
   btn.setAttribute('aria-pressed',String(+btn.dataset.ggDevice===device));
  queueReport();
 }
 function changePrecision(next){
  precision=next;
  for(const field of panel.querySelectorAll('[data-ds-prop],[data-ds-num]'))
   field.step=String(precision);
  for(const btn of panel.querySelectorAll('[data-gg-step]'))
   btn.setAttribute('aria-pressed',String(+btn.dataset.ggStep===precision));
 }
 function changeDevice(size){
  if(![320,360,390,408].includes(size))return;
  device=size;
  if(size===408){
   phone.removeAttribute('data-ds-device');
   phone.style.removeProperty('--ds-device-width');
  }else{
   phone.dataset.dsDevice=String(size);
   phone.style.setProperty('--ds-device-width',size+'px');
  }
  for(const btn of panel.querySelectorAll('[data-gg-device]'))
   btn.setAttribute('aria-pressed',String(+btn.dataset.ggDevice===size));
  queueReport();
 }
 for(const field of panel.querySelectorAll('[data-ds-prop]')){
  field.addEventListener('input',()=>apply(field.dataset.dsProp,field.value));
 }
 for(const field of panel.querySelectorAll('[data-ds-num]')){
  field.addEventListener('input',()=>{
   if(field.value.trim()==='')return;
   apply(field.dataset.dsNum,field.value);
  });
  field.addEventListener('change',()=>{
   const key=field.dataset.dsNum;
   field.value=fmt(values[key]);
  });
 }
 for(const btn of panel.querySelectorAll('[data-gg-step]'))
  btn.addEventListener('click',()=>changePrecision(+btn.dataset.ggStep));
 for(const btn of panel.querySelectorAll('[data-gg-device]'))
  btn.addEventListener('click',()=>changeDevice(+btn.dataset.ggDevice));
 function exportCSS(){
  const lines=['/* NexaPag · Geometry 9.18 · system tokens */','#phone {'];
  for(const key of changed)lines.push('  --ds-'+key+': '+fmt(values[key])+'px;');
  lines.push('}');
  for(const key of changed)lines.push('/* activate data-ds-'+key+' on #phone */');
  return lines.join('\n');
 }
 function snapshot(){
  return {version:918,precision,device,values:{...values},changed:[...changed]};
 }
 async function copy(text){
  if(navigator.clipboard?.writeText){
   try{await navigator.clipboard.writeText(text);return true}catch{}
  }
  const textarea=document.createElement('textarea');textarea.value=text;
  document.body.appendChild(textarea);textarea.select();
  const result=document.execCommand?.('copy')||false;textarea.remove();return result;
 }
 panel.querySelector('#ggReset').addEventListener('click',reset);
 panel.querySelector('#ggCopy').addEventListener('click',async()=>{
  const ok=await copy(exportCSS());
  feedback.textContent=ok?'Tokens CSS copiados':'Cópia automática indisponível neste navegador';
 });
 panel.querySelector('#ggSave').addEventListener('click',()=>{
  try{
   localStorage.setItem('nexapag.global.geometry.918',JSON.stringify(snapshot()));
   feedback.textContent='Tokens salvos neste navegador';
  }catch{feedback.textContent='Armazenamento indisponível'}
 });
 panel.querySelector('#ggLoad').addEventListener('click',()=>{
  try{
   const saved=JSON.parse(localStorage.getItem('nexapag.global.geometry.918')||'null');
   if(!saved||saved.version!==918){feedback.textContent='Nenhuma configuração 9.18 salva';return}
   reset();
   if([.1,.25,.5,1].includes(+saved.precision))changePrecision(+saved.precision);
   for(const key of saved.changed||[])
    if(keys.includes(key))apply(key,+saved.values[key]);
   changeDevice(Number(saved.device)||408);
   feedback.textContent='Geometria global restaurada';
   queueReport();
  }catch{feedback.textContent='Não foi possível carregar os tokens'}
 });
 const content=document.getElementById('content');
 if(content){
  const watcher=new MutationObserver(queueReport);
  watcher.observe(content,{childList:true,subtree:false});
 }
 window.NexaPagGlobalGeometry=Object.freeze({
  apply,reset,changeDevice,snapshot,exportCSS,readback,
  countTargets
 });
 queueReport();
})();
