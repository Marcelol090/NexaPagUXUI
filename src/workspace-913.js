/* NexaPag Visualize 9.13 | Real inspector.
 * Progressive disclosure per Raphael Salaja (User Interface Wiki).
 * Existing inputs and handlers are MOVED, not re-created; semantics remain live.
 */
const right=document.querySelector('.studio>.rail.right');
const oldLeft=document.querySelector('.studio>.rail.left.geometry-left');
const geometry=oldLeft?.querySelector('#geometryHub');
const geometrySample=oldLeft?.querySelector('.geo-specimen');
if(right){
 const original=[...right.children];
 const used=new Set();
 function take(selector,target){
  const node=original.find(n=>!used.has(n)&&(n.matches(selector)||n.querySelector(selector)));
  if(node){used.add(node);target.appendChild(node)}
  return node;
 }
 const make=(tag,className,html='')=>{const n=document.createElement(tag);n.className=className;if(html)n.innerHTML=html;return n};
 const main=make('div','inspector-head');
 main.innerHTML='<div><div class="inspector-eyebrow">NexaPag / Design system</div><h2 class="inspector-title">Workbench</h2><p class="inspector-subtitle">Material, pigmento e geometria reais</p></div>';
 const close=make('button','inspector-close','×');
 close.type='button';close.setAttribute('aria-label','Fechar customização');main.appendChild(close);
 const tabs=make('nav','inspector-tabs');
 tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Categorias de customização');
 const scroll=make('div','inspector-scroll');
 const pages={};
 const categories=[
  ['material','Vidro','Material e ótica','Calibre o acrílico sem recriar o shader.'],
  ['pigment','Pigmentos','Colorimetria','Cores da paleta Sage Glass filtradas pelo mesmo ambiente.'],
  ['geometry','Geometria','Layout e formas','Edite somente o componente desejado.'],
  ['motion','Motion','Movimento','Uma revelação curta, seguida pelo analytics.']
 ];
 for(const [key,name,title,description] of categories){
  const button=make('button','inspector-tab',name);
  button.type='button';button.id='inspector-tab-'+key;
  button.setAttribute('role','tab');button.setAttribute('aria-controls','inspector-panel-'+key);
  button.setAttribute('aria-selected',String(key==='material'));button.tabIndex=key==='material'?0:-1;
  tabs.appendChild(button);
  const panel=make('section','inspector-page');
  panel.id='inspector-panel-'+key;panel.setAttribute('role','tabpanel');
  panel.setAttribute('aria-labelledby',button.id);panel.hidden=key!=='material';
  const head=make('header','inspector-page-header','<h3>'+title+'</h3><p>'+description+'</p>');
  panel.appendChild(head);scroll.appendChild(panel);pages[key]=panel;
 }
 right.replaceChildren(main,tabs,scroll);
 right.classList.add('workspace-inspector','geometry-left');
 // Existing optics and pigment controls retain their original DOM nodes and listeners.
 for(const selector of ['#shaderSwitch','#opticsSwitch','#blurRange','#filmRange','#rimRange','#lightRange','.glass-demo','.note-optic'])
  take(selector,pages.material);
 for(const selector of ['.pigment-heading','.profile-buttons','#pigmentRange','#diffuseRange','#blendRange','.pigment-specimen'])
  take(selector,pages.pigment);
 if(geometry)pages.geometry.appendChild(geometry);
 if(geometrySample)pages.geometry.appendChild(geometrySample);
 take('#motionSwitch',pages.motion);
 const motionUI=make('div','inspector-motion-controls',
  '<button type="button" class="motion-action" id="inspector-replay">Reproduzir saída líquida</button>'+
  '<p class="motion-note">A luz se organiza por cerca de 2,5 segundos e devolve a cena ao gráfico. Movimento reduzido mostra os dados imediatamente.</p>');
 pages.motion.appendChild(motionUI);
 const foot=make('footer','inspector-foot','<span>Visualize 9.13 · Sage Glass</span><b>Ajustes instantâneos</b>');
 right.appendChild(foot);
 const scrim=make('div','inspector-scrim');scrim.setAttribute('aria-hidden','true');
 const mobileOpen=make('button','inspector-open-button','Personalizar');
 mobileOpen.type='button';mobileOpen.setAttribute('aria-expanded','false');
 mobileOpen.setAttribute('aria-controls','inspector-panel-material');
 document.body.append(scrim,mobileOpen);
 let active='material',returnFocus=null;
 function choose(key){
  if(!pages[key])return;
  active=key;
  [...tabs.children].forEach(button=>{
   const is=button.id==='inspector-tab-'+key;
   button.setAttribute('aria-selected',String(is));button.tabIndex=is?0:-1;
  });
  Object.entries(pages).forEach(([k,page])=>{page.hidden=k!==key});
  scroll.scrollTop=0;
 }
 function open(){
  returnFocus=document.activeElement;
  document.body.classList.remove('lab-open','geo-mobile-open');
  document.body.classList.add('inspector-open');
  mobileOpen.setAttribute('aria-expanded','true');
  // Focus is moved after the panel becomes visible.
  tabs.querySelector('[aria-selected="true"]')?.focus();
 }
 function shut(){
  document.body.classList.remove('inspector-open','lab-open');
  mobileOpen.setAttribute('aria-expanded','false');
  if(returnFocus instanceof HTMLElement)returnFocus.focus();
 }
 categories.forEach(([key],index)=>{
  const button=tabs.children[index];
  button.addEventListener('click',()=>choose(key));
  button.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   event.preventDefault();
   const order=categories.map(c=>c[0]);
   const current=order.indexOf(active);
   const next=event.key==='Home'?0:event.key==='End'?order.length-1:
    (current+(event.key==='ArrowRight'?1:-1)+order.length)%order.length;
   choose(order[next]);tabs.children[next].focus();
  });
 });
 mobileOpen.addEventListener('click',open);
 close.addEventListener('click',shut);
 scrim.addEventListener('click',shut);
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&document.body.classList.contains('inspector-open'))shut();
 });
 // Header "pigment settings" opens the same unified inspector, not a second modal.
 document.addEventListener('click',event=>{
  if(event.target instanceof Element && event.target.closest('#wbTrigger')){
   event.preventDefault();event.stopImmediatePropagation();open();
  }
 },true);
 document.getElementById('inspector-replay')?.addEventListener('click',()=>{
  window.NexaPagLiquidIntro?.replay?.();
  if(window.matchMedia('(max-width:820px)').matches)shut();
 });
 window.NexaPagInspector={choose,open,close:shut,get active(){return active}};
}
