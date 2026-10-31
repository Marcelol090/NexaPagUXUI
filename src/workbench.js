/*
 * NexaPag UX/UI Live Workbench
 * Vite bundles GSAP and Culori for enhanced presentation; the core editor
 * is functional in vanilla ES modules, including offline/non-bundled previews.
 * The actual application remains a visual demo with invented values, not Room.
 */
const $ = (id) => document.getElementById(id);
let gsap = null;
let culori = null;
const ready = () => window.NexaPagPreview;
let activeSection = 'material';
let baseline = null;
let candidate = null;
let dirty = false;
const changeHandlers = [];
const rangeDescriptions = {
  blurRange: ['Background blur', '0–42px', 'Filtro da cor que atravessa o acrílico'],
  filmRange: ['Densidade da película', '%', 'Mais opaco não significa mais vidro'],
  rimRange: ['Reflexo das bordas', '%', 'Highlight concentrado no contorno'],
  lightRange: ['Luz atrás dos cards', '%', 'Pigmentação depende da fonte luminosa posterior'],
  pigmentRange: ['Pigmento', '%', 'Intensidade cromática aprovada'],
  diffuseRange: ['Difusão', 'px', 'Expansão do pigmento atrás do card'],
  blendRange: ['Mesclagem de pigmentos', '%', 'Evitar transições acinzentadas'],
  orbRefraction: ['Iridescência da casca', '%', 'Dispersão discreta nas extremidades da lente'],
  orbSeam: ['Suavidade das interfaces', '%', 'Preservar camadas individuais'],
  orbMotion: ['Resposta física', '%', 'Aumentar a inércia sem agitar eternamente'],
};
const sections = [
  {key:'material',name:'Material',glyph:'◈'},
  {key:'pigment',name:'Pigmentos',glyph:'◉'},
  {key:'liquid',name:'Física',glyph:'◌'},
  {key:'finance',name:'Dados',glyph:'▤'},
  {key:'compare',name:'Comparar',glyph:'⊞'},
  {key:'audit',name:'Validar',glyph:'✓'},
];
const presets = {
  discreto:{blurRange:27,filmRange:82,rimRange:38,lightRange:36,pigmentRange:48,diffuseRange:28,blendRange:24,orbRefraction:30,orbSeam:34,orbMotion:45},
  equilibrado:{blurRange:23,filmRange:74,rimRange:52,lightRange:56,pigmentRange:74,diffuseRange:20,blendRange:44,orbRefraction:48,orbSeam:40,orbMotion:68},
  expressivo:{blurRange:18,filmRange:64,rimRange:68,lightRange:72,pigmentRange:92,diffuseRange:14,blendRange:62,orbRefraction:64,orbSeam:54,orbMotion:83}
};
const style = document.createElement('style');
style.textContent = `
#nexa-live-lab{position:fixed;inset:0;z-index:900;pointer-events:none;font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif;color:#e8f5e8}
#nexa-live-lab *{box-sizing:border-box}
#nexa-live-lab .wb-trigger{position:absolute;right:22px;bottom:20px;pointer-events:auto;border:1px solid rgba(197,232,211,.35);background:linear-gradient(135deg,#254739,#132920);border-radius:999px;padding:12px 17px;color:#effaf0;box-shadow:0 18px 48px #0009;display:flex;align-items:center;gap:10px;font-size:12px;font-weight:750;letter-spacing:.01em}
#nexa-live-lab .wb-trigger .wb-active{width:7px;height:7px;background:#77e2a5;border-radius:50%;box-shadow:0 0 0 3px #77e2a522}
#nexa-live-lab .wb-overlay{position:absolute;inset:0;display:none;pointer-events:auto;background:rgba(1,8,7,.66);backdrop-filter:blur(8px)}
#nexa-live-lab.open .wb-overlay{display:block}
#nexa-live-lab .wb-sheet{position:absolute;top:50%;right:24px;transform:translateY(-50%) translateX(12px);width:min(440px,calc(100% - 36px));max-height:min(860px,calc(100dvh - 40px));display:none;pointer-events:auto;border:1px solid rgba(207,246,218,.24);border-radius:25px;overflow:hidden;background:linear-gradient(165deg,rgba(25,43,38,.98),rgba(10,23,22,.99));box-shadow:0 35px 100px #000c,inset 0 1px 0 #e6ffe51a}
#nexa-live-lab.open .wb-sheet{display:flex;flex-direction:column}
#nexa-live-lab header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 21px 13px}
#nexa-live-lab .wb-eye{font-size:10px;color:#86cea7;letter-spacing:.17em;text-transform:uppercase;font-weight:800}
#nexa-live-lab h2{font-size:21px;font-weight:730;letter-spacing:-.05em;margin:5px 0 0}
#nexa-live-lab .wb-sub{font-size:11px;color:#aec6b6;margin:5px 0 0;line-height:1.5}
#nexa-live-lab button,#nexa-live-lab input{font:inherit}
#nexa-live-lab button{cursor:pointer}
#nexa-live-lab button:focus-visible,#nexa-live-lab input:focus-visible{outline:2px solid #a4eac1;outline-offset:2px}
#nexa-live-lab .wb-close{border:1px solid #edfbed1d;border-radius:12px;background:#f3fff207;color:#cce5d4;width:34px;height:34px;flex:none;font-size:20px}
#nexa-live-lab .wb-tabs{display:flex;gap:4px;padding:0 13px 14px;overflow-x:auto;scrollbar-width:none}
#nexa-live-lab .wb-tabs button{white-space:nowrap;border:1px solid transparent;background:transparent;color:#acc1b4;border-radius:12px;padding:9px 10px;font-size:11px}
#nexa-live-lab .wb-tabs button.active{background:#5b987c25;color:#d6f1e0;border-color:#afdcc241}
#nexa-live-lab .wb-content{padding:4px 20px 22px;overflow-y:auto;overscroll-behavior:contain;flex:1;min-height:0}
#nexa-live-lab .wb-kicker{color:#8dbaa1;font-size:10px;text-transform:uppercase;letter-spacing:.13em;font-weight:800;margin:12px 0 10px}
#nexa-live-lab .wb-note{font-size:12px;line-height:1.6;color:#b1c4b9;margin:9px 0 14px}
#nexa-live-lab .wb-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
#nexa-live-lab .wb-small-card{background:#0717117a;border:1px solid #c8e8d51a;border-radius:14px;padding:11px;min-width:0}
#nexa-live-lab .wb-small-card strong{font-size:12px;color:#e8f5e8}
#nexa-live-lab .wb-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
#nexa-live-lab .wb-row strong{color:#cbeedc;font-size:11px;font-variant-numeric:tabular-nums}
#nexa-live-lab .wb-range{display:grid;gap:7px;margin:12px 0}
#nexa-live-lab .wb-range label{font-size:12px;font-weight:680}
#nexa-live-lab input[type=range]{width:100%;accent-color:#8bddad;cursor:pointer}
#nexa-live-lab .wb-hint{font-size:10px;color:#8fa99b;line-height:1.4}
#nexa-live-lab .wb-input{width:100%;height:42px;border:1px solid #ddf5e520;border-radius:11px;background:#0a1a17;color:#eaf5ee;padding:0 11px;font-size:13px}
#nexa-live-lab .wb-btn{background:#1a3329;color:#dcefe1;border:1px solid #9bd7b52d;border-radius:11px;padding:11px 13px;font-size:11px;font-weight:700}
#nexa-live-lab .wb-btn.primary{background:linear-gradient(130deg,#b8edce,#70cfa1);color:#08251a;font-weight:800}
#nexa-live-lab .wb-btn.active{border-color:#a9e5c5;background:#558b6d48}
#nexa-live-lab .wb-btn-group{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
#nexa-live-lab .wb-btn-group .wb-btn{flex:1;min-width:75px}
#nexa-live-lab .wb-chroma{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:8px;border:1px solid #c8e8d51a;border-radius:12px;padding:9px;margin:8px 0;background:#0002}
#nexa-live-lab .wb-chroma .dot{height:23px;width:23px;border:1px solid #efffed40;border-radius:8px}
#nexa-live-lab input[type=color]{width:36px;height:29px;border:0;padding:0;border-radius:9px;background:transparent;cursor:pointer}
#nexa-live-lab .wb-legend{font-size:11px;color:#b7cdbf}
#nexa-live-lab .wb-pigment-preview{height:45px;border:1px solid #c8e8d52d;border-radius:13px;margin:12px 0;background:linear-gradient(90deg,#b96a71,#d0a568,#65af99)}
#nexa-live-lab .wb-check{display:flex;align-items:flex-start;gap:10px;margin:10px 0;color:#bdd0c3;font-size:12px;line-height:1.5}
#nexa-live-lab .wb-check i{width:16px;height:16px;flex:none;background:#91cfab25;border:1px solid #99e4b053;border-radius:50%;color:#95edbc;font-size:11px;text-align:center;font-style:normal}
#nexa-live-lab .wb-bar{height:7px;background:#28493c;border-radius:99px;overflow:hidden;margin-top:8px}
#nexa-live-lab .wb-bar span{height:100%;display:block;background:linear-gradient(90deg,#5fba8d,#a9efc6);transition:width .2s}
#nexa-live-lab .wb-divider{height:1px;background:linear-gradient(90deg,transparent,#bfdcc62e,transparent);margin:17px 0}
#nexa-live-lab footer{padding:12px 20px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #e7ffeb10;color:#829b8b;font-size:10px;gap:10px}
#nexa-live-lab .wb-footer-label{color:#bcd3c4}
#nexa-live-lab .wb-toast{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);background:#1c392b;color:#ecffed;border:1px solid #a6eac54f;border-radius:999px;padding:10px 17px;font-size:12px;box-shadow:0 15px 35px #0007;display:none;pointer-events:none}
#nexa-live-lab .wb-toast.show{display:block}
@media(max-width:720px){#nexa-live-lab .wb-trigger{display:none}#nexa-live-lab .wb-sheet{inset:auto 0 0 0;width:100%;border-radius:25px 25px 0 0;max-height:84dvh;transform:none}#nexa-live-lab .wb-trigger{right:12px;bottom:80px;padding:11px 13px;font-size:11px}#nexa-live-lab header{padding-top:15px}#nexa-live-lab .wb-tabs{padding-bottom:8px}}
@media(prefers-reduced-motion:reduce){#nexa-live-lab *{animation:none!important;transition:none!important}}
`;
document.head.appendChild(style);
const mount = document.getElementById('nexa-live-lab');
mount.innerHTML = `
<button class="wb-trigger" id="wbTrigger" type="button" aria-haspopup="dialog" aria-controls="wbSheet" aria-expanded="false"><span class="wb-active"></span>UX/UI LAB <span aria-hidden="true">⚙</span></button>
<div class="wb-overlay" id="wbOverlay"></div>
<section class="wb-sheet" id="wbSheet" role="dialog" aria-modal="true" aria-labelledby="wbTitle" tabindex="-1">
<header><div><div class="wb-eye">NEXAPAG / LIVE WORKBENCH</div><h2 id="wbTitle">Material &amp; Motion Lab</h2><p class="wb-sub">Alterações ao vivo; sem acesso a dados bancários reais</p></div><button class="wb-close" type="button" id="wbClose" aria-label="Fechar laboratório">×</button></header>
<div class="wb-tabs" id="wbTabs" role="tablist" aria-label="Áreas de edição"></div><div class="wb-content" id="wbContent"></div>
<footer><span class="wb-footer-label" id="wbFooter">Projeto Vite · Preview isolado</span><button class="wb-btn" type="button" id="wbExport">Exportar JSON</button></footer>
</section><div class="wb-toast" id="wbToast" role="status"></div>`;

function toast(message) {
  const el=$('wbToast');el.textContent=message;el.classList.add('show');
  clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2600);
}
const get = ()=>ready()?.getState();
const formatMoney = v=>Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const attrs=(o)=>Object.entries(o).map(([k,v])=>`${k}="${String(v).replaceAll('"','&quot;')}"`).join(' ');
const b=(text,id,extra='')=>`<button type="button" class="wb-btn ${extra}" id="${id}">${text}</button>`;
function renderTabs(){
  $('wbTabs').innerHTML=sections.map(s=>`<button type="button" class="${s.key===activeSection?'active':''}" data-area="${s.key}" role="tab" aria-selected="${s.key===activeSection}">${s.glyph} ${s.name}</button>`).join('');
  $('wbTabs').querySelectorAll('[data-area]').forEach(el=>el.onclick=()=>{activeSection=el.dataset.area;renderTabs();renderContent();});
}
function range(id){
  const el=$(id);if(!el)return `<p class="wb-note">${id} não encontrado</p>`;
  const [label,,desc]=rangeDescriptions[id];
  return `<div class="wb-range"><div class="wb-row"><label for="wb-${id}">${label}</label><strong id="wb-out-${id}">${el.value}${['blurRange','diffuseRange'].includes(id)?' px':'%'}</strong></div><input type="range" id="wb-${id}" min="${el.min}" max="${el.max}" step="${el.step||1}" value="${el.value}" /><div class="wb-hint">${desc}</div></div>`;
}
function bindRanges(ids){ids.forEach(id=>{$('wb-'+id)?.addEventListener('input',e=>{
  if(ready()?.setControl(id,e.target.value))$('wb-out-'+id).textContent=e.target.value+(['blurRange','diffuseRange'].includes(id)?' px':'%');
  dirty=true;
 });});}
function applyPreset(name){const p=presets[name];if(!p)return;for(const [id,value]of Object.entries(p))ready()?.setControl(id,value);renderContent();toast(`Perfil ${name} aplicado`);dirty=true;}
function renderMaterial(){
  $('wbContent').innerHTML=`<div class="wb-kicker">ÓPTICA · FIDELIDADE AO PROJETO</div><p class="wb-note">As cores ficam <b>atrás</b> do acrílico; a superfície filtra o fundo. A geometria e os dados não mudam.</p><div class="wb-kicker">Presets de material</div><div class="wb-btn-group">${b('Discreto','presetCalm')}${b('Equilibrado','presetBalanced','active')}${b('Expressivo','presetRich')}</div>${['blurRange','filmRange','rimRange','lightRange'].map(range).join('')}<div class="wb-divider"></div><div class="wb-kicker">ESTADOS DO SISTEMA</div><div class="wb-btn-group">${b('Shader','toggleShader')}${b('Glass','toggleOptics')}${b('Motion','toggleMotion')}</div><p class="wb-note">Faça testes reais com as três camadas ligadas/desligadas, sem substituir as cores financeiras.</p>`;
  $('presetCalm').onclick=()=>applyPreset('discreto');$('presetBalanced').onclick=()=>applyPreset('equilibrado');$('presetRich').onclick=()=>applyPreset('expressivo');
  const snap=get();[['toggleShader','shaderSwitch',snap?.shader],['toggleOptics','opticsSwitch',snap?.optics],['toggleMotion','motionSwitch',snap?.motion]].forEach(([name,id,enabled])=>{const el=$(name);el.classList.toggle('active',enabled);el.onclick=()=>{ready()?.setToggle(id,!enabled);renderMaterial()}});
  bindRanges(['blurRange','filmRange','rimRange','lightRange']);
}
function pigmentPreview(){
  const s=get();const colors=s?.weekCat?.map(x=>x.color)||['#b96a71','#d0a568','#65af99'];
  const gr=$('wbPigmentPreview');if(!gr)return;
  const fallback=`linear-gradient(100deg, ${colors.join(', ')})`;
  if(culori){
    try {const f=culori.interpolate(colors,'oklch');const arr=Array.from({length:13},(_,i)=>{
      const col=culori.formatHex(f(i/12));return `${col} ${Math.round(i/12*100)}%`;});
      gr.style.background=`linear-gradient(100deg, ${arr.join(', ')})`;return;
    }catch(e){console.warn('NexaPigmentLab OKLCH fallback',e)}
  }
  gr.style.background=fallback;
}
function renderPigments(){
  const s=get(),colors=s?.weekCat||[];
  $('wbContent').innerHTML=`<div class="wb-kicker">PIGMENTOS SEM PERDER INTENSIDADE</div><p class="wb-note">Escolha uma cor sem alterar o material base. Os gradientes ficam suaves na interface entre camadas, mas cada categoria conserva sua identidade.</p><div class="wb-pigment-preview" id="wbPigmentPreview" aria-label="Preview do gradiente cromático"></div>${colors.map((p,i)=>`<div class="wb-chroma"><span class="wb-legend">${p.name}</span><span class="dot" style="background:${p.color}"></span><input aria-label="Cor de ${p.name}" type="color" data-cid="${i}" value="${p.color}" /></div>`).join('')}<div class="wb-divider"></div>${['pigmentRange','diffuseRange','blendRange'].map(range).join('')}<p class="wb-note">O editor usa <b>OKLCH perceptual</b> para visualizar a interpolação, quando Culori está carregado. Caso contrário, mantém a escala CSS original.</p>`;
  pigmentPreview();
  $('wbContent').querySelectorAll('[data-cid]').forEach(el=>el.oninput=()=>{const p=colors[Number(el.dataset.cid)];ready()?.setColor('weekCat',p.name,el.value);pigmentPreview();dirty=true;});
  bindRanges(['pigmentRange','diffuseRange','blendRange']);
}
function renderLiquid(){
  $('wbContent').innerHTML=`<div class="wb-kicker">LIQUIDORB · FÍSICA AMORTECIDA</div><p class="wb-note">Pigmentos empilhados por proporção. Você pode agitar a bolha, tocar e arrastar dentro da visualização expandida. Os valores não mudam com o movimento.</p><div class="wb-btn-group">${b('Ampliar vidro','wbOpenOrb','primary')}${b('Agitar','wbShake')}</div>${['orbRefraction','orbSeam','orbMotion'].map(range).join('')}<div class="wb-divider"></div><div class="wb-kicker">REGRAS DA FÍSICA</div><div class="wb-small-card"><strong>Simulação visual, sem escrita financeira</strong><p class="wb-note">A física representa oscilações temporárias. Ela não modifica os centavos das categorias e não acessa os dados Android.</p></div>`;
  $('wbOpenOrb').onclick=()=>{close();ready()?.openOrb()};$('wbShake').onclick=()=>{ready()?.openOrb();ready()?.shakeOrb();toast('Impulso aplicado')};bindRanges(['orbRefraction','orbSeam','orbMotion']);
}
function renderFinance(){
  const s=get(),cats=s?.weekCat||[];
  $('wbContent').innerHTML=`<div class="wb-kicker">DADOS DEMONSTRATIVOS EDITÁVEIS</div><p class="wb-note">Altere os números e confira os gráficos, pigmentos e bolha em tempo real. Nada aqui escreve em banco de dados.</p><div class="wb-grid"><label class="wb-small-card"><strong>Gastos da semana (R$)</strong><input class="wb-input" type="number" min="0" max="999999" step="0.01" id="wbSpend" value="${s?.weeklySpend||0}" /></label><label class="wb-small-card"><strong>Limite semanal (R$)</strong><input class="wb-input" type="number" min="1" max="999999" step="0.01" id="wbBudget" value="${s?.weeklyBudget||0}" /></label></div><div class="wb-kicker">COMPOSIÇÃO DAS CAMADAS (PESOS)</div>${cats.map((p,i)=>`<label class="wb-range"><div class="wb-row"><span>${p.name}</span><strong>${formatMoney(p.v)}</strong></div><input type="range" data-part="${i}" min="0" max="100" step="1" value="${(p.v/Math.max(1,s.weeklySpend)*100).toFixed(1)}" /></label>`).join('')}<div class="wb-btn-group">${b('Aplicar dados','wbApplyFinance','primary')}${b('Restaurar R$270','wbResetFinance')}</div><div class="wb-hint">A proporção dos controles é normalizada para 100%. O indicador financeiro usará Gastos ÷ Limite; o volume da inspeção óptica permanece independente.</div>`;
  $('wbApplyFinance').onclick=()=>{
    const weeklySpend=Number($('wbSpend').value),weeklyBudget=Number($('wbBudget').value),vals=[...$('wbContent').querySelectorAll('[data-part]')].map(e=>Number(e.value));
    try{ready()?.setFinance({weeklySpend,weeklyBudget,weekCat:vals});dirty=true;renderFinance();toast('Dados demonstrativos atualizados')}catch(err){toast(err.message)}
  };
  $('wbResetFinance').onclick=()=>{ready()?.setFinance({weeklySpend:270,weeklyBudget:1200,weekCat:[98,72,52,48]});dirty=true;renderFinance();toast('Valores de referência restaurados')};
  $('wbContent').querySelectorAll('[data-part]').forEach(el=>el.oninput=()=>{const inputs=[...$('wbContent').querySelectorAll('[data-part]')];const sums=inputs.reduce((a,e)=>a+Number(e.value),0)||1;inputs.forEach((e,i)=>e.parentElement.querySelector('strong').textContent=((Number(e.value)/sums)*100).toFixed(1)+'%');});
}
function saveState(){return JSON.parse(JSON.stringify(get()))}
function renderCompare(){
  $('wbContent').innerHTML=`<div class="wb-kicker">COMPARAÇÃO DE PROPOSTAS</div><p class="wb-note">Grave duas combinações A/B dos parâmetros de material e pigmentos. Depois alterne entre elas no mesmo design, sem reconstruir a interface.</p><div class="wb-grid"><div class="wb-small-card"><strong>A / Referência</strong><p class="wb-note">${baseline?'Captura armazenada':'Ainda não salvo'}</p>${b('Salvar A','wbSaveA')}</div><div class="wb-small-card"><strong>B / Candidato</strong><p class="wb-note">${candidate?'Captura armazenada':'Ainda não salvo'}</p>${b('Salvar B','wbSaveB')}</div></div><div class="wb-btn-group">${b('Mostrar A','wbApplyA')}${b('Mostrar B','wbApplyB')}${b('Exportar JSON','wbSaveJSON','primary')}</div><p class="wb-note">Exporte os valores para revisão. Isso não cria screenshot automático nem transfere alterações ao aplicativo de produção.</p>`;
  $('wbSaveA').onclick=()=>{baseline=saveState();renderCompare();toast('Versão A registrada')};
  $('wbSaveB').onclick=()=>{candidate=saveState();renderCompare();toast('Versão B registrada')};
  const apply=(snap)=>{if(!snap)return;for(const[id,v]of Object.entries(snap.settings))ready()?.setControl(id,v);
    ready()?.setFinance({weeklySpend:snap.weeklySpend,weeklyBudget:snap.weeklyBudget,weekCat:snap.weekCat.map(x=>x.v)});
    snap.weekCat.forEach(x=>ready()?.setColor('weekCat',x.name,x.color));ready()?.setTab(snap.tab);
    renderCompare();toast('Parâmetros restaurados')};
  $('wbApplyA').onclick=()=>apply(baseline);$('wbApplyB').onclick=()=>apply(candidate);$('wbSaveJSON').onclick=exportJSON;
}
function renderAudit(){
  const s=get(),canvas=!!document.querySelector('.orb-canvas'),heat=!!document.querySelector('.heatmap'),nav=!!document.querySelector('[data-action="tab"]');
  const tests=[
    [!!s,'Estado de navegação disponível'],[canvas,'Canvas da LiquidOrb presente'],[s?.weekCat?.length===4,'Composição do líquido vinculada aos dados'],
    [Number.isFinite(s?.weeklySpend),'Gastos financeiros válidos'],[Number.isFinite(s?.weeklyBudget),'Limite financeiro válido'],
    [heat || s?.tab!=='spending','Heatmap preservado quando a aba de Gastos está ativa'],[nav,'Abas acessíveis por botões'],[!!document.querySelector('.glass-panel'),'Material acrílico preservado']
  ];
  const passed=tests.filter(x=>x[0]).length;
  $('wbContent').innerHTML=`<div class="wb-kicker">VERIFICAÇÕES RÁPIDAS DO PROTÓTIPO</div><p class="wb-note">Indicadores de estrutura e estado em execução. Não substituem testes em WebView Android nem validação de FPS no dispositivo.</p><div class="wb-small-card"><div class="wb-row"><strong>${passed} de ${tests.length} verificações</strong><strong>${Math.round(100*passed/tests.length)}%</strong></div><div class="wb-bar"><span style="width:${100*passed/tests.length}%"></span></div></div>${tests.map(([ok,label])=>`<div class="wb-check"><i>${ok?'✓':'!'}</i>${label}</div>`).join('')}<div class="wb-divider"></div><div class="wb-kicker">ATIVAR TELAS PARA INSPEÇÃO</div><div class="wb-btn-group">${[['home','Início'],['spending','Gastos'],['ads','Anúncios'],['cards','Cartões'],['review','Revisar']].map(([id,title])=>b(title,'wbTab-'+id)).join('')}</div>`;
  [['home','Início'],['spending','Gastos'],['ads','Anúncios'],['cards','Cartões'],['review','Revisar']].forEach(([id])=>{$('wbTab-'+id).onclick=()=>{ready()?.setTab(id);renderAudit()}});
}
function renderContent(){
  if(!ready()){$('wbContent').innerHTML='<p class="wb-note">Carregando visualização...</p>';return;}
  ({material:renderMaterial,pigment:renderPigments,liquid:renderLiquid,finance:renderFinance,compare:renderCompare,audit:renderAudit}[activeSection]||renderMaterial)();
  if(gsap){const el=$('wbContent');gsap.fromTo(el,{opacity:.7},{opacity:1,duration:.22,ease:'power2.out'});}
}
function exportJSON(){
  const data={kind:'NexaPag Design Lab',version:'9.03',at:new Date().toISOString(),current:get(),A:baseline,B:candidate};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='NexaPag_UXUI_DesignLab.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Parâmetros exportados');
}
function open(){mount.classList.add('open');$('wbTrigger').setAttribute('aria-expanded','true');renderTabs();renderContent();$('wbSheet').focus();if(gsap){gsap.fromTo($('wbSheet'),{opacity:.5,scale:.97},{opacity:1,scale:1,duration:.18})}}
function close(){mount.classList.remove('open');$('wbTrigger').setAttribute('aria-expanded','false');$('wbTrigger').focus()}
$('wbTrigger').onclick=open;$('wbClose').onclick=close;$('wbOverlay').onclick=close;$('wbExport').onclick=exportJSON;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mount.classList.contains('open'))close()});
window.addEventListener('nexa:state',()=>{if(mount.classList.contains('open')&&['audit','finance'].includes(activeSection))renderContent()});
if(import.meta.env?.MODE){
  Promise.allSettled([import('gsap'),import('culori')]).then(([g,c])=>{
    if(g.status==='fulfilled')gsap=g.value.gsap||g.value.default||null;
    if(c.status==='fulfilled')culori=c.value;
    if(activeSection==='pigment')pigmentPreview();
  });
}
