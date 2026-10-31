/* NexaPag 9.13 · Short liquid-money introduction
 * Inspired by the user-supplied motion reference; pigment stays within the
 * approved Sage / Forest spectrum. Meaningful analytics returns by itself.
 * Raphael Salaja: one focal animation, no high-frequency loop,
 * small immediate press feedback, reduced-motion fallback.
 */
const content=document.getElementById('content');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let mounted=null,closeTimer=0,cleanupTimer=0,raf=0;
let homeVisited=false;
function cancelTimers(){
 window.clearTimeout(closeTimer);window.clearTimeout(cleanupTimer);window.cancelAnimationFrame(raf);
 closeTimer=cleanupTimer=raf=0;
}
function settle(hero){
 if(!hero)return;
 hero.classList.remove('intro-active','intro-return');
 const graph=hero.querySelector('.hero-graph-frame');
 if(graph){graph.style.removeProperty('opacity');graph.style.removeProperty('transform')}
}
function replay(){
 const hero=mounted;
 if(!hero||!hero.isConnected||reduced.matches||document.hidden)return false;
 if(!hero.querySelector('.hero-head')?.textContent.includes('Saídas líquidas'))return false;
 cancelTimers();settle(hero);
 if(!hero.querySelector('.liquid-intro-light')){
  const glow=document.createElement('div');
  glow.className='liquid-intro-light';
  glow.setAttribute('aria-hidden','true');
  hero.insertBefore(glow,hero.firstChild);
 }
 // Restart a finite CSS animation without recreating any financial graph.
 void hero.offsetWidth;
 raf=requestAnimationFrame(()=>{
  if(!hero.isConnected)return;
  hero.classList.add('intro-active');
  closeTimer=window.setTimeout(()=>{
   if(!hero.isConnected)return;
   hero.classList.add('intro-return');
   hero.classList.remove('intro-active');
  },2200);
  cleanupTimer=window.setTimeout(()=>{
   if(!hero.isConnected)return;
   settle(hero);
  },2550);
 });
 return true;
}
function refresh(){
 if(!content)return;
 const hero=content.querySelector('.fiduciary-hero');
 if(hero===mounted)return;
 cancelTimers();settle(mounted);mounted=hero;
 if(!hero){homeVisited=false;return}
 if(!hero.querySelector('.hero-head')?.textContent.includes('Saídas líquidas'))return;
 if(!hero.querySelector('.liquid-replay')){
  const button=document.createElement('button');
  button.type='button';button.className='liquid-replay';
  button.setAttribute('aria-label','Reproduzir animação da saída líquida');
  button.title='Reproduzir revelação líquida';
  button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 1-2.5-5.9"/><path d="M20 4v7h-7"/></svg>';
  button.addEventListener('click',event=>{event.stopPropagation();replay()});
  hero.appendChild(button);
 }
 if(!homeVisited && !reduced.matches){
  homeVisited=true;
  // Allow the analytics markup to finish rendering before starting the short intro.
  raf=requestAnimationFrame(()=>{if(hero===mounted)replay()});
 }
}
if(content){
 const observer=new MutationObserver(refresh);
 observer.observe(content,{childList:true,subtree:true});
 refresh();
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){cancelTimers();settle(mounted)}
 });
 reduced.addEventListener?.('change',()=>{
  if(reduced.matches){cancelTimers();settle(mounted)}
 });
}
window.NexaPagLiquidIntro={
 replay,
 stop:()=>{cancelTimers();settle(mounted)},
 get active(){return !!mounted?.classList.contains('intro-active')}
};
