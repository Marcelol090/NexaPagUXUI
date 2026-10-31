/* NexaPag 9.18 | Material & palette controls
 * Synchronize all secondary surfaces with the same live material parameters,
 * without adding nested backdrop filters or changing the approved colors.
 */
(function(){
 const root=document.documentElement;
 const value=(id,defaultValue)=>Number(document.getElementById(id)?.value??defaultValue);
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 function syncMaterials(){
  const film=clamp(value('filmRange',74)/100,0,1);
  const rim=clamp(value('rimRange',72)/100,0,1);
  const blur=clamp(value('blurRange',23),0,50);
  root.style.setProperty('--ux-inner-film',(.33+film*.30).toFixed(3));
  root.style.setProperty('--ux-nav-film',(.79+film*.20).toFixed(3));
  root.style.setProperty('--ux-inner-edge',(.075+rim*.14).toFixed(3));
  root.style.setProperty('--ux-select-edge',(.29+rim*.26).toFixed(3));
  root.style.setProperty('--ux-nav-blur',(blur*.65).toFixed(2)+'px');
 }
 document.addEventListener('input',event=>{
  if(['blurRange','filmRange','rimRange'].includes(event.target?.id))syncMaterials();
 });
 syncMaterials();
 const page=document.getElementById('inspector-panel-pigment');
 if(!page||!window.NexaPagPreview)return;
 const section=document.createElement('section');
 section.className='wb-category-editor';
 const heading=document.createElement('h4');heading.textContent='Pigmentos por componente';
 section.appendChild(heading);
 const description=document.createElement('p');
 description.textContent='Edite cada categoria na própria prévia. O vidro e os glyphs monocromáticos permanecem independentes.';
 section.appendChild(description);
 const saved=new Map();
 function makeGroup(target,label,expanded=false){
  const details=document.createElement('details');
  details.open=expanded;
  const summary=document.createElement('summary');summary.textContent=label;
  summary.style.cssText='color:#DCEDE1;font-weight:700;font-size:11px;cursor:pointer;padding:10px 0';
  details.appendChild(summary);
  const grid=document.createElement('div');
  grid.className='wb-category-grid';details.appendChild(grid);
  section.appendChild(details);
  return {target,grid};
 }
 const groups=[
  makeGroup('category','Categorias dos boards',true),
  makeGroup('weekCat','Composição do LiquidOrb'),
  makeGroup('weekCard','Cores dos cartões')
 ];
 function createRow(group,item){
  const row=document.createElement('div');row.className='wb-category-edit';
  const label=document.createElement('label');label.textContent=item.name;
  const color=document.createElement('input');color.type='color';
  color.setAttribute('aria-label','Cor de '+item.name);
  color.value=item.color;
  color.dataset.group=group.target;color.dataset.name=item.name;
  const code=document.createElement('code');code.textContent=item.color.toUpperCase();
  color.addEventListener('input',()=>{
   const current=color.value;
   try{
    window.NexaPagPreview?.setColor(group.target,item.name,current);
    code.textContent=current.toUpperCase();
    const note=section.querySelector('.wb-category-footer');
    if(note)note.textContent=item.name+' atualizado no aplicativo';
   }catch{
    const note=section.querySelector('.wb-category-footer');
    if(note)note.textContent='Não foi possível aplicar esta cor';
   }
  });
  row.append(label,color,code);
  group.grid.appendChild(row);
  saved.set(group.target+':'+item.name,{color,code});
 }
 const initial=window.NexaPagPreview.getState();
 for(const group of groups){
  for(const item of initial?.[group.target]||[])createRow(group,item);
 }
 const footer=document.createElement('div');footer.className='wb-category-footer';
 footer.setAttribute('role','status');footer.textContent='Cores originais preservadas até você editar.';
 section.appendChild(footer);
 page.appendChild(section);
 window.addEventListener('nexa:state',()=>{
  const state=window.NexaPagPreview?.getState();
  if(!state)return;
  for(const group of groups)for(const item of state[group.target]||[]){
   const savedRow=saved.get(group.target+':'+item.name);
   if(!savedRow)continue;
   if(savedRow.color!==document.activeElement)savedRow.color.value=item.color;
   savedRow.code.textContent=item.color.toUpperCase();
  }
 });
 window.NexaPagWorkbenchMaterial=Object.freeze({
  syncMaterials,
  getValues:()=>({
   film:getComputedStyle(root).getPropertyValue('--ux-inner-film').trim(),
   nav:getComputedStyle(root).getPropertyValue('--ux-nav-film').trim(),
   rim:getComputedStyle(root).getPropertyValue('--ux-inner-edge').trim(),
   blur:getComputedStyle(root).getPropertyValue('--ux-nav-blur').trim()
  })
 });
})();
