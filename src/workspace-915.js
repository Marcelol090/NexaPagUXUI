/* NexaPag 9.15 · desktop layout integrity guard.
 * A real layout check after paint prevents the Workbench being silently
 * pushed underneath the phone if another stylesheet changes the flex context.
 * No scale/zoom manipulation. Does not touch card/orb/chart DOM.
 */
(function(){
 const stage=document.querySelector('body>.studio>.workspace-stage');
 const phone=stage?.querySelector(':scope>.phone');
 const inspector=stage?.querySelector(':scope>.rail.right');
 if(!stage || !phone || !inspector)return;
 const wide=()=>window.matchMedia('(min-width: 941px)').matches;
 const px=(element,property,value)=>element.style.setProperty(property,value,'important');
 const check=()=>{
  if(!wide())return;
  const a=phone.getBoundingClientRect(),b=inspector.getBoundingClientRect();
  const sideBySide=b.left>=a.right+8 && Math.abs(a.top-b.top)<=8;
  const rigid=Math.abs(a.width-408)<=1 && Math.abs(a.height-850)<=1;
  if(sideBySide&&rigid)return;
  // Last-resort layout repair. Keep both siblings in one horizontal context.
  px(stage,'display','flex');
  px(stage,'flex-direction','row');
  px(stage,'flex-wrap','nowrap');
  px(stage,'gap','28px');
  px(stage,'width','840px');
  px(stage,'min-width','840px');
  px(phone,'position','relative');
  px(phone,'width','408px');
  px(phone,'height','850px');
  px(phone,'min-width','408px');
  px(phone,'max-width','408px');
  px(phone,'min-height','850px');
  px(phone,'max-height','850px');
  px(phone,'flex','0 0 408px');
  px(phone,'transform','none');
  px(inspector,'display','flex');
  px(inspector,'flex','0 0 404px');
  px(inspector,'position','relative');
  px(inspector,'inset','auto');
  px(inspector,'width','404px');
  px(inspector,'min-width','404px');
  px(inspector,'max-width','404px');
  px(inspector,'height','850px');
  px(inspector,'min-height','850px');
  px(inspector,'max-height','850px');
  requestAnimationFrame(()=>{
   const c=phone.getBoundingClientRect(),d=inspector.getBoundingClientRect();
   if(d.left<c.right+8 || Math.abs(c.top-d.top)>8){
    console.warn('NexaPag Layout: Workbench not adjacent to phone', {phone:c.toJSON(), inspector:d.toJSON()});
   }
  });
 };
 // Run after all DOM construction and connected controls.
 requestAnimationFrame(()=>requestAnimationFrame(check));
 window.addEventListener('resize',()=>requestAnimationFrame(check),{passive:true});
 window.NexaPagWorkspaceQA={
  measure:()=>{const p=phone.getBoundingClientRect(),i=inspector.getBoundingClientRect();return {
   viewport:innerWidth,phone:{x:p.x,y:p.y,width:p.width,height:p.height},
   inspector:{x:i.x,y:i.y,width:i.width,height:i.height},
   adjacent:i.left>=p.right+8&&Math.abs(p.top-i.top)<=8
  }}
 };
})();
