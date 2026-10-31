import { paintStackedLiquid } from './stacked-liquid.js';
const $=id=>document.getElementById(id);
const categories=[
 {name:'Marketplace',value:1145.90,hue:'#B56E76',rgb:'181,110,118',path:'M5 7h14l-1 13H6L5 7zm4 0V5a3 3 0 0 1 6 0v2'},
 {name:'Casa',value:874.40,hue:'#91657B',rgb:'145,101,123',path:'M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M3 12h18v7H3zM6 19v2m12-2v2'},
 {name:'Alimentação',value:620.30,hue:'#BE9868',rgb:'190,152,104',path:'M5 3v7a3 3 0 0 0 6 0V3M8 3v18M18 3v18M18 3c3 0 3 4 3 7h-3'},
 {name:'Transporte',value:430.00,hue:'#66A39D',rgb:'102,163,157',path:'M5 9l2-5h10l2 5M4 9h16v10H4zM7 16h2m6 0h2'},
 {name:'Moda',value:407.50,hue:'#BA7796',rgb:'186,119,150',path:'m16 3 5 4-3 4-2-2v12H8V9l-2 2-3-4 5-4c1 3 7 3 8 0z'},
 {name:'Outros',value:340.00,hue:'#829E8A',rgb:'130,158,138',path:'m12 3-9 5 9 5 9-5-9-5zm-9 10 9 5 9-5M3 17l9 5 9-5'}
];
const money=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
let selected=0;
function renderBoards(){
 $('boards').innerHTML=categories.map((c,i)=>`<button class="cat-btn ${i===selected?'selected':''}" style="--hue:${c.hue};--rgb:${c.rgb}" data-cat="${i}" aria-pressed="${i===selected}"><span class="glyph"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${c.path}"/></svg></span><strong>${c.name}</strong><small>${money(c.value)}</small></button>`).join('');
 $('boardDetail').textContent=`${categories[selected].name}: pigmento limitado ao glyph e à borda, sem comprometer a leitura de ${money(categories[selected].value)}.`;
 $('boards').querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.cat);renderBoards();});
}
function profile(name){
 const presets={quiet:[30,92],balanced:[52,86],rich:[76,76]};
 const [p,g]=presets[name];$('pigment').value=p;$('glass').value=g;
 document.querySelectorAll('[data-profile]').forEach(b=>b.classList.toggle('active',b.dataset.profile===name));update();
}
function update(){const p=Number($('pigment').value),g=Number($('glass').value);document.documentElement.style.setProperty('--pigment',(p/100).toFixed(2));document.documentElement.style.setProperty('--opacity',(g/100).toFixed(2));$('pigmentValue').textContent=p+'%';$('glassValue').textContent=g+'%';}
$('pigment').addEventListener('input',update);$('glass').addEventListener('input',update);
document.querySelectorAll('[data-profile]').forEach(b=>b.onclick=()=>profile(b.dataset.profile));renderBoards();profile('balanced');
const canvas=$('sphere'),ctx=canvas.getContext('2d'),shell=$('specimen');
const entries=[{color:'#B56E76',v:49},{color:'#91657B',v:24},{color:'#BE9868',v:18},{color:'#66A39D',v:9}];
const clamp=(a,min=0,max=1)=>Math.min(max,Math.max(min,a));
function aCircle(h){const u=1-2*clamp(h);return (Math.acos(u)-u*Math.sqrt(Math.max(0,1-u*u)))/Math.PI;}
function invArea(a){let l=0,h=1;for(let i=0;i<27;i++){const m=(l+h)/2;if(aCircle(m)<a)l=m;else h=m}return (l+h)/2;}
const amount=.76,area=aCircle(amount),cum=[0];let total=0;
for(const c of entries){total+=c.v;cum.push(invArea(area*total/100));}
const N=16,wave=entries.map(()=>new Float32Array(N)),vel=entries.map(()=>new Float32Array(N));
let motion=false,last=0,phase=0,px=.5,drag=false,raf=0;
const measure=()=>{const w=shell.getBoundingClientRect().width,dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(w*dpr);canvas.height=canvas.width;return {w,dpr};};let dims=measure();
function surfaceY(k,x){const t=clamp(x/(dims.w));const n=t*(N-1),i=Math.floor(n);const m=wave[k][i]*(1-(n-i))+wave[k][Math.min(i+1,N-1)]*(n-i);return dims.w*(1-cum[k+1])+m*dims.w*.16;}
function paint(){const w=dims.w;ctx.setTransform(dims.dpr,0,0,dims.dpr,0,0);const r=w*.49,c=w*.5,xvals=Array.from({length:90},(_,i)=>w*.01+(w*.98)*(i/89));paintStackedLiquid({ctx,w,center:c,r,entries,cumulative:cum,xvals,surfaceY,large:true,seam:.27,iridescence:.07});}
function sim(dt){for(let k=0;k<entries.length;k++){const a=new Float32Array(N);for(let i=0;i<N;i++){const before=wave[k][i?i-1:1],after=wave[k][i<N-1?i+1:N-2];a[i]=40*(before+after-2*wave[k][i])-13*wave[k][i];}for(let i=0;i<N;i++){vel[k][i]=(vel[k][i]+a[i]*dt)*Math.exp(-5*dt);wave[k][i]=clamp(wave[k][i]+vel[k][i]*dt,-.12,.12);}}}
function stir(x=.5,force=.8){const p=clamp(x);vel.forEach((row,k)=>row.forEach((_,i)=>{let d=i/(N-1)-p;row[i]+=force*Math.exp(-d*d/.028)*(d<0?-1:1)*(1-k*.12)}));motion=true;if(!raf)raf=requestAnimationFrame(loop);}
function loop(now){raf=0;let dt=Math.min(.033,last?(now-last)/1000:.016);last=now;if(!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches){sim(dt);paint();motion=wave.some((w,k)=>w.some((v,i)=>Math.abs(v)>.00018||Math.abs(vel[k][i])>.001));if(motion)raf=requestAnimationFrame(loop);}else paint();}
shell.addEventListener('pointerdown',e=>{drag=true;px=(e.clientX-shell.getBoundingClientRect().left)/dims.w;shell.setPointerCapture?.(e.pointerId);stir(px,.8)});
shell.addEventListener('pointermove',e=>{if(!drag)return;let x=(e.clientX-shell.getBoundingClientRect().left)/dims.w;stir(x,clamp((x-px)*7,-1,1));px=x;});
shell.addEventListener('pointerup',()=>drag=false);shell.addEventListener('pointercancel',()=>drag=false);
shell.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();stir(.45,.85)}});
$('stir').onclick=()=>stir(.45,1);$('settle').onclick=()=>{wave.forEach(w=>w.fill(0));vel.forEach(v=>v.fill(0));motion=false;last=0;if(raf)cancelAnimationFrame(raf);raf=0;paint()};
new ResizeObserver(()=>{dims=measure();paint()}).observe(shell);paint();
