import { paintStackedLiquid } from './stacked-liquid.js';

(()=>{
const $=s=>document.querySelector(s);
const paths={home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',spending:'<path d="M3 3v18h18"/><path d="m7 16 4-5 3 3 5-7"/>',ads:'<path d="m3 9 2-5h14l2 5"/><path d="M4 10v10h16V10"/><path d="M2 9h20M9 20v-7h6v7"/>',cards:'<rect x="2" y="5" width="20" height="15" rx="3"/><path d="M2 10h20"/>',review:'<rect x="5" y="3" width="14" height="19" rx="2"/><path d="M9 3V2h6v1m-6 7h6m-6 4h6"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0"/>',arrow:'<path d="m9 18 6-6-6-6"/>',chevron:'<path d="m6 9 6 6 6-6"/>',up:'<path d="M12 19V5m-7 7 7-7 7 7"/>',down:'<path d="M12 5v14m-7-7 7 7 7-7"/>',refund:'<path d="M9 14 4 9l5-5"/><path d="M4 9h9a7 7 0 0 1 0 14"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',coffee:'<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 9h2a3 3 0 0 1 0 6h-2M4 22h15"/>',bag:'<path d="M5 8h14l-1 13H6L5 8Zm4 1V6a3 3 0 0 1 6 0v3"/>',truck:'<path d="M3 5h12v12H3zM15 10h4l3 4v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',house:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',spark:'<path d="m12 3-2.5 7L3 12l6.5 2L12 21l2.5-7 6.5-2-6.5-2z"/>',store:'<path d="M4 10v11h16V10M3 10l2-6h14l2 6M3 10c0 3 5 3 5 0 0 3 4 3 4 0 0 3 4 3 4 0 0 3 5 3 5 0M9 21v-7h6v7"/>',check:'<path d="m4 12 5 5L20 6"/>',x:'<path d="M5 5 19 19M19 5 5 19"/>',search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',alert:'<circle cx="12" cy="12" r="10"/><path d="M12 7v6m0 4h.01"/>',shield:'<path d="m12 2 8 4v6c0 6-4 9-8 10-4-1-8-4-8-10V6z"/><path d="m8 12 3 3 5-5"/>',sliders:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2"/><circle cx="16" cy="17" r="2"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',wallet:'<path d="M19 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0-3 3v13a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2H4a2 2 0 0 1 0-4"/><path d="M16 15h6"/>',receipt:'<path d="M4 2v20l4-2 4 2 4-2 4 2V2H4Z"/><path d="M8 7h8M8 11h8M8 15h4"/>',shirt:'<path d="m16 3 5 4-3 4-2-2v12H8V9l-2 2-3-4 5-4c1 3 7 3 8 0Z"/>',layers:'<path d="m12 3-9 5 9 5 9-5-9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5"/>',fork:'<path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M17 3v18M17 3c3 0 4 4 4 7v1h-4"/>',car:'<path d="m5 17-2 2m16-2 2 2M5 9l2-5h10l2 5M3 9h18v10H3z"/><circle cx="7" cy="15" r="1.25"/><circle cx="17" cy="15" r="1.25"/>',sofa:'<path d="M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5M4 12h16a2 2 0 0 1 2 2v5H2v-5a2 2 0 0 1 2-2Zm1 7v2m14-2v2"/>'};
const icon=(name,w)=>`<span class="icon" ${w?'style="'+w+'"':''}><svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.spark}</svg></span>`;
const money=(v,sign=false)=>`${sign&&v>0?'+ ':''}R$ ${Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const category=[{name:'Marketplace',v:1145.9,color:'#D5E6A8',icon:'bag',sub:[['Compras online',820.40],['Eletrônicos',325.50]]},{name:'Casa',v:874.4,color:'#A8D95E',icon:'sofa',sub:[['Utilidades',540.40],['Decoração',334.00]]},{name:'Alimentação',v:620.3,color:'#6FB81E',icon:'fork',sub:[['Mercado',430.30],['Restaurantes',190.00]]},{name:'Transporte',v:430,color:'#1F8B57',icon:'car',sub:[['Aplicativos',280],['Combustível',150]]},{name:'Moda',v:407.5,color:'#0D6372',icon:'shirt',sub:[['Roupas',279.50],['Acessórios',128.00]]},{name:'Outros',v:340,color:'#5FA9D8',icon:'layers',sub:[['Serviços',210],['Diversos',130]]}];
const weekCat=[{name:'Mercado',v:98,color:'#D5E6A8'},{name:'Casa',v:72,color:'#A8D95E'},{name:'Alimentação',v:52,color:'#1F8B57'},{name:'Outros',v:48,color:'#5FA9D8'}];
let weeklyBudget=1200; let weeklySpend=270;
const weekCard=[{name:'Nubank',v:118,color:'#A8D95E'},{name:'Itaú',v:87,color:'#1F8B57'},{name:'Inter',v:65,color:'#5FA9D8'}];
const banks=[{name:'Nubank Ultravioleta',suffix:'4821',cls:'nubank',v:1510},{name:'Itaú Personnalité',suffix:'7310',cls:'itau',v:1274.5},{name:'Inter Black',suffix:'2044',cls:'inter',v:1033.6}];
const tx=[{name:'Compra no marketplace',desc:'Hoje · Nubank ·4821',v:-189.90,icon:'bag'},{name:'Transferência recebida',desc:'Ontem · PIX',v:450,icon:'down'},{name:'Estorno de compra',desc:'27 out · Itaú ·7310',v:89.9,icon:'refund',refund:true}];
const dayAmounts=[0,120,62.9,0,134,70,0,189.9,93,144,72,0,121,158,84,0,202,55,136,76,0,173,97,186,104,0,93,145,177,122,83];
const dayTotal=dayAmounts.slice(1).reduce((a,b)=>a+b,0);const demonstrativeDaily=dayAmounts.map(x=>x/dayTotal*3818.1);
const reviews=[{id:1,title:'Pagamento sem estabelecimento',src:'Notificação · Nubank · 29 out',amount:'R$ 89,90',reason:'Estabelecimento não identificado'},{id:2,title:'Lançamento para classificar',src:'SMS · Itaú · 28 out',amount:'R$ 46,00',reason:'Categoria não reconhecida'},{id:3,title:'Possível compra duplicada',src:'Notificação · Inter · 26 out',amount:'R$ 124,90',reason:'Correspondência semelhante encontrada'}];
const state={tab:'home',goalMode:'category',goalPick:0,filter:'all',categoryIndex:-1,day:28,activeCard:0,shop:0,shader:true,motion:true,optics:true,done:[],outcomes:{},reviewView:'pending',toast:'',period:'month'};
function toast(s){state.toast=s;render(false);const target=$('#toast-layer');setTimeout(()=>{if(state.toast===s){state.toast='';target.innerHTML=''}},2900)}
function set(p,keep=false){Object.assign(state,p);render(keep)}
function panelHeader(t,sub='',right=''){return `<div class="subhead"><div><b style="font-size:13px">${t}</b>${sub?`<div class="caption" style="margin-top:4px">${sub}</div>`:''}</div>${right}</div>`}
function nav(){const entries=[['home','Início'],['spending','Gastos'],['ads','Anúncios'],['cards','Cartões'],['review','Revisar']];return `<div class="nav" aria-label="Navegação principal">${entries.map(([id,n])=>`<button type="button" aria-label="${n}" aria-current="${state.tab===id?'page':'false'}" data-action="tab" data-value="${id}" class="${state.tab===id?'active':''}">${icon(id)}<span>${n}</span></button>`).join('')}</div>`}
function header(){return `<div class="brand"><div class="mark"><svg viewBox="0 0 24 24" fill="none"><path d="M4 18V6l8 10V6l8 12V6" stroke="#0e3621" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div><h2>Nexa<span>Pag</span></h2><div class="header-label">Inteligência financeira</div></div></div><div class="hd-actions"><button class="iconbutton pigment-lab-trigger" data-action="pigment-lab" aria-label="Abrir laboratório de pigmentação" title="Pigmentação">${icon('sliders')}</button><button class="iconbutton" data-action="tab" data-value="review" aria-label="Eventos para revisar">${icon('bell')}${reviews.filter(r=>!state.done.includes(r.id)).length?'<i class="notify-dot"></i>':''}</button></div>`}
function graph(){return `<svg class="hero-graph" viewBox="0 0 340 92" preserveAspectRatio="none" aria-label="Fluxo ilustrativo de movimentação"><defs><linearGradient id="currentLine" x1="0" x2="1"><stop stop-color="#77b6a5"/><stop offset=".46" stop-color="#7dbdae"/><stop offset="1" stop-color="#b1dbc7"/></linearGradient><linearGradient id="currentFill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#75ab9e" stop-opacity=".17"/><stop offset="1" stop-color="#456d64" stop-opacity="0"/></linearGradient></defs><path d="M0 63 C23 61 25 47 49 53 S83 68 101 43 133 38 147 51 175 24 191 40 223 61 247 36 281 48 298 29 322 31 340 17 L340 92 L0 92Z" fill="url(#currentFill)"/><path d="M0 63 C23 61 25 47 49 53 S83 68 101 43 133 38 147 51 175 24 191 40 223 61 247 36 281 48 298 29 322 31 340 17" stroke="url(#currentLine)" stroke-width="2.8" fill="none" stroke-linecap="round"/><path d="M0 73 C28 61 42 83 67 67 S109 70 133 64 170 75 191 58 237 77 258 60 299 79 340 51" stroke="#627f78" stroke-width="1.2" fill="none" opacity=".5"/><circle cx="298" cy="29" r="4" fill="#c4ecdc" stroke="#1a3025" stroke-width="2"/></svg>`}
function orb(){return `<div class="orb material-orb" role="button" tabindex="0" aria-label="Bolha de 22,5% da meta. Toque ou arraste para movimentar as camadas líquidas; Enter para agitar."><canvas id="orb-canvas" class="orb-canvas" width="360" height="360" aria-hidden="true"></canvas><div class="orb-lens" aria-hidden="true"></div><div class="orb-inner"><b>${(weeklySpend/weeklyBudget*100).toFixed(1).replace('.',',')}%</b><span>da meta usada</span></div></div>`}

function goal(){const items=state.goalMode==='category'?weekCat:weekCard;let picked=items[state.goalPick]||items[0];return `<div class="panel goal glass-panel" id="weekly-goal">${panelHeader('Meta semanal','26 out – 01 nov',`<span class="active-goal">${icon('check')} Ativa</span>`)}<div class="goal-layout">${orb()}<div class="goal-side"><div class="micro-label">Gastos desta semana</div><div class="big">${money(weeklySpend)}</div><div class="side-text">de ${money(weeklyBudget)}<br>planejados</div><div class="remaining">${money(Math.max(0, weeklyBudget-weeklySpend))} disponíveis</div></div></div><div class="segmented"><button class="${state.goalMode==='category'?'selected':''}" data-action="goal-mode" data-value="category">Por categoria</button><button class="${state.goalMode==='card'?'selected':''}" data-action="goal-mode" data-value="card">Por cartão</button></div><div class="stack">${items.map((x,i)=>`<div style="width:${x.v/Math.max(1,weeklySpend)*100}%;background:linear-gradient(180deg,${x.color},color-mix(in srgb,${x.color} 55%,#1a3029));opacity:${state.goalPick===i?1:.83}"></div>`).join('')}</div><div class="legend material-legend">${items.map((x,i)=>`<button class="legend-option ${state.goalPick===i?'selected':''}" data-action="goal-pick" data-value="${i}" style="--accent:${x.color};--tone-rgb:${toRgb(x.color)}"><span class="legend-bead"></span><span>${x.name}</span></button>`).join('')}</div><div class="goal-caption">Selecionado: <b style="color:${picked.color}">${picked.name} · ${money(picked.v)}</b></div><div class="orb-action-row"><span>Camadas proporcionais • física amortecida</span><button class="orb-open-btn" data-action="orb-detail">${icon('search')} Ampliar vidro</button></div></div>`}

function transactionList(){return `<div class="panel">${panelHeader('Atividade financeira','Fluxo recente · itens ilustrativos')}${tx.map(t=>`<div class="transaction"><div class="txn-icon" style="--accent:${t.refund?'var(--yellow)':t.v>0?'var(--green)':'var(--red)'};color:${t.refund?'var(--yellow)':t.v>0?'var(--green)':'var(--red)'}">${icon(t.icon)}</div><div class="txn-mid"><strong>${t.name}</strong><span>${t.desc}</span></div><div class="txn-amount" style="color:${t.refund?'var(--yellow)':t.v>0?'var(--green)':'var(--red)'}">${t.v<0?'−':'+'}${money(t.v)}</div></div>`).join('')}</div>`}
const toRgb=h=>h.replace('#','').match(/.{2}/g).map(x=>parseInt(x,16)).join(',');
const inkFor=(hex)=>{
 const rgb=hex.replace('#','').match(/.{2}/g).map(v=>parseInt(v,16)/255);
 const linear=rgb.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 const light=.2126*linear[0]+.7152*linear[1]+.0722*linear[2];
 return light>=.30?'#0B1B1A':'#F4F8F5';
};
function quickBoards(){const actions=[{label:'Gastos',hint:'Analisar',icon:'spending',tone:'#0D6372',action:'spending'},{label:'Metas',hint:'Esta semana',icon:'target',tone:'#A8D95E',action:'goal'},{label:'Cartões',hint:'3 cartões',icon:'wallet',tone:'#5FA9D8',action:'cards'},{label:'Revisar',hint:'Pendências',icon:'receipt',tone:'#6FB81E',action:'review'}];return `<div class="quick-grid">${actions.map(a=>`<button class="quick-board" data-action="shortcut" data-value="${a.action}" style="--accent:${a.tone};--tone-rgb:${toRgb(a.tone)};--glyph-ink:${inkFor(a.tone)}" aria-label="${a.label}, ${a.hint}"><span class="quick-icon">${icon(a.icon)}</span><strong>${a.label}</strong><small>${a.hint}</small></button>`).join('')}</div>`}
function home(){
 const currentMonth=state.period==='month';
 const net=currentMonth?'R$ 3.468,20':'R$ 270,00';
 const subtitle=currentMonth?'R$ 3.818,10 em compras · R$ 349,90 em estornos':'22,5% da meta semanal de R$ 1.200,00';
 return `<div class="tab-title homepage-title"><div><div class="eyebrow">Seu panorama financeiro</div><div class="t">Bom dia<span class="title-punct">.</span></div></div><span class="home-date">31 out 2026</span></div>
  <section class="panel hero glass-panel fiduciary-hero" aria-label="Visão financeira do período">
   <div class="hero-head"><span class="label">${currentMonth?'Saídas líquidas':'Gastos da semana'}</span><span class="hero-period-badge">${icon('calendar')} ${currentMonth?'Outubro 2026':'Semana atual'}</span></div>
   <div class="hero-value">${net}</div>
   <div class="hero-meta">${subtitle}</div>
   <div class="hero-graph-frame">${graph()}</div>
   <div class="hero-bottom"><span><i class="dot" style="background:var(--red)"></i>Saídas</span><span><i class="dot" style="background:var(--green)"></i>Entradas</span><span class="hero-caption">Fluxo demonstrativo</span></div>
  </section>
  <div class="overview-period" role="group" aria-label="Período do panorama"><button class="${currentMonth?'active':''}" data-action="period-set" data-value="month" aria-pressed="${currentMonth}">Mensal</button><button class="${!currentMonth?'active':''}" data-action="period-set" data-value="week" aria-pressed="${!currentMonth}">Esta semana</button></div>
  <div class="metric-row" aria-label="Resumo das movimentações"><div class="metric metric-income"><div class="metric-top"><span class="small-icon">${icon('down')}</span><span>Recebimentos</span></div><strong>${money(1950)}</strong><span class="metric-caption">Entradas confirmadas</span></div><div class="metric metric-refund"><div class="metric-top"><span class="small-icon">${icon('refund')}</span><span>Estornos</span></div><strong>${money(349.9)}</strong><span class="metric-caption">Valores devolvidos</span></div></div>
  <div class="section-head"><strong>Acessos rápidos</strong><span class="section-side-label">AÇÕES FREQUENTES</span></div>${quickBoards()}
  <div class="section-head"><strong>Meta semanal</strong><button class="linkish" data-action="tab" data-value="spending">Explorar ${icon('arrow')}</button></div>${goal()}
  <div class="finance-insight"><span class="insight-symbol">${icon('spark')}</span><div><strong>Ritmo da semana</strong><p>R$ 270,00 utilizados dos R$ 1.200,00 previstos. Restam <b>R$ 930,00</b> na meta.</p></div><span class="insight-mark">22,5%</span></div>
  <div class="section-head"><strong>Movimentações recentes</strong><button class="linkish" data-action="tab" data-value="cards">Ver cartões ${icon('arrow')}</button></div>${transactionList()}
  <div class="section-head"><strong>Explorar lojas</strong></div><div class="integrations"><div class="square" style="color:#91d4a8">${icon('store')}</div><div style="flex:1"><strong>Catálogo de parceiros</strong><small>Disponibilidade das integrações</small></div><button class="textbtn" data-action="tab" data-value="ads">Abrir</button></div>`;
}

function heat(){
 const first=new Date(2026,9,1).getDay();let html='';
 const maxDay=Math.max(1,...Object.values(demonstrativeDaily));
 for(let i=0;i<42;i++){
  const d=i-first+1;
  if(d<1||d>31){html+='<span class="day dim" aria-hidden="true"></span>';continue;}
  const amt=demonstrativeDaily[d]||0;
  // Five perceptual bins with stable boundaries; zero remains its own state.
  const level=amt===0?0:amt<30?1:amt<65?2:amt<115?3:amt<170?4:5;
  // Two context tones, deliberately subtle: luminance expresses magnitude.
  const tone=category[(d+Math.floor(d/8))%category.length].color;
  const tone2=category[(Math.floor(d*.62)+3)%category.length].color;
  const isFuture=d>30;
  html+=`<button class="day heat-cell heat-${level} ${level===0?'heat-zero':''} ${state.day===d?'selected':''} ${isFuture?'future':''}" data-action="day" data-value="${d}" ${isFuture?'disabled':''} style="--h1:${tone};--h2:${tone2};" aria-pressed="${state.day===d}" aria-label="${d} de outubro, ${money(amt)} em saídas demonstrativas">${d}</button>`;
 }
 const samples=['#15271f','#273d32','#3e614d','#5c9270','#7eb998','#b8dbbd'];
 const legend=`<span class="heat-scale" aria-hidden="true">${samples.map(c=>`<i style="background:linear-gradient(145deg,${c},color-mix(in oklab,${c} 68%,#10261b))"></i>`).join('')}</span>`;
 return `<div class="panel">${panelHeader('Heatmap financeiro','Outubro de 2026 · distribuição ilustrativa',`<span style="color:#96cba3">${icon('calendar')}</span>`)}<div class="weekday">${['D','S','T','Q','Q','S','S'].map(x=>`<span>${x}</span>`).join('')}</div><div class="heatmap">${html}</div><div class="heat-legend"><span>Sem gastos</span>${legend}<span>Mais gastos</span></div><div class="heat-subcaption">Intensidade = volume diário · gradiente Forest por nível</div><div class="day-detail"><span>${state.day} de outubro · saídas</span><b>${money(demonstrativeDaily[state.day]||0)}</b></div></div>`;
}
function cats(){const total=category.reduce((a,c)=>a+c.v,0);const selected=state.categoryIndex;return `<div class="panel category-panel glass-panel">${panelHeader('Gastos por categoria','Despesas brutas · R$ 3.818,10')}<div class="cat-bar" aria-label="Composição proporcional das despesas">${category.map((c,i)=>`<button title="${c.name}: ${money(c.v)}" aria-label="${c.name}" class="${selected!==-1&&selected!==i?'faded':''}" style="background:${c.color};width:${c.v/total*100}%" data-action="category" data-value="${i}"></button>`).join('')}</div><div class="category-board-grid">${category.map((c,i)=>`<button class="category-board ${selected===i?'selected':''}" data-action="category" data-value="${i}" aria-pressed="${selected===i}" style="--accent:${c.color};--tone-rgb:${toRgb(c.color)};--glyph-ink:${inkFor(c.color)}"><span class="category-board-top"><span class="cat-symbol">${icon(c.icon)}</span><span class="category-percent">${(c.v/total*100).toFixed(1).replace('.',',')}%</span></span><strong>${c.name}</strong><span class="category-value">${money(c.v)}</span><small>${c.sub.map(x=>x[0]).join(' · ')}</small></button>`).join('')}</div>${selected!==-1?`<div class="category-detail" style="--accent:${category[selected].color};--tone-rgb:${toRgb(category[selected].color)}"><div class="category-detail-head"><span class="cat-symbol">${icon(category[selected].icon)}</span><div><strong>${category[selected].name}</strong><small>Subcategorias · composição detalhada</small></div></div>${category[selected].sub.map((sc,i)=>`<div class="subcategory-row"><div class="subcat-chip">${i+1}</div><span>${sc[0]}</span><b>${money(sc[1])}</b></div>`).join('')}</div>`:`<div class="category-hint">${icon('arrow')} Toque em um board para explorar as subcategorias.</div>`}</div>`}

function spending(){return `<div class="tab-title"><div><div class="eyebrow">Análise e padrões</div><div class="t">Gastos</div></div><button class="tiny-pill" data-action="filters">${icon('sliders')} Filtrar</button></div><div class="filters">${[['all','Tudo'],['month','Mês atual'],['week','Esta semana'],['refund','Estornos']].map(([id,n])=>`<button class="${state.filter===id?'selected':''}" data-action="filter" data-value="${id}">${n}</button>`).join('')}</div><div style="height:11px"></div>${state.filter==='refund'?`<div class="panel">${panelHeader('Estornos reconhecidos','Ajustes financeiros no período')}<div class="hero-value" style="font-size:27px;color:var(--yellow)">R$ 349,90</div><div class="caption">3 registros de estorno no conjunto demonstrativo.</div></div>`:state.filter==='week'?`<div class="panel">${panelHeader('Semana atual','Meta de R$ 1.200,00')}<div class="hero-value" style="font-size:27px">R$ 270,00</div><div class="caption">Saldo disponível de R$ 930,00</div></div>${goal()}`:`${heat()}<div class="section-head"><strong>Onde seu dinheiro circulou</strong></div>${cats()}`}`}
function ads(){const shops=[['Amazon','#dbac6b'],['Shopee','#ef926b'],['AliExpress','#e58187'],['Mercado Livre','#e3bd6d']];const picked=shops[state.shop];return `<div class="tab-title"><div><div class="eyebrow">Ofertas e parceiros</div><div class="t">Anúncios</div></div><button class="tiny-pill" data-action="ad-search">${icon('search')} Buscar</button></div><div class="integrations"><div class="square" style="color:#e4c68d">${icon('alert')}</div><div style="flex:1"><strong>Conexões em homologação</strong><small>APIs dos parceiros ainda sem catálogo confirmado.</small></div></div><div class="section-head"><strong>Explorar lojas</strong><span class="caption">4 parceiros</span></div><div class="shops">${shops.map((s,i)=>`<button class="shop ${state.shop===i?'selected':''}" data-action="shop" data-value="${i}"><div class="shop-mark" style="color:${s[1]};background:${s[1]}25">${icon('store')}</div><b>${s[0]}</b><small>${i===3?'Acesso de vendedor; catálogo restrito':'Aguardando consulta de ofertas'}</small></button>`).join('')}</div><div class="callout"><div class="row"><div><div class="eyebrow" style="font-size:9px">Loja selecionada</div><b>${picked[0]}</b></div><span style="color:#dabc81">${icon('shield')}</span></div><p>Esta prévia não inventa preços, cupons ou cashback. O catálogo será preenchido quando o gateway confirmar os produtos e o rastreamento afiliado.</p><button class="primarybtn" data-action="analyze">Analisar integração ${icon('arrow')}</button></div><div class="section-head"><strong>Experiência de compra</strong></div><div class="panel"><div style="display:flex;gap:11px;align-items:start"><div style="width:42px;height:42px;display:grid;place-items:center;flex-shrink:0;background:#355b425a;border-radius:12px;color:#91caa4">${icon('bag')}</div><div><b style="font-size:12px">Ofertas transparentes</b><p class="caption" style="margin:7px 0 0">Produtos, preço anterior, preço atual e origem serão mostrados apenas com dados válidos. Nenhum desconto de demonstração será exibido como real.</p></div></div></div>`}
function chartBars(){const a=[27,48,33,74,63,42,86,65,53,75,94,58,79,57,46,88,69,61,81,47,77];return `<div class="timeline">${a.map((v,i)=>`<div class="col"><i style="height:${v}%;opacity:${.45+v/220}"></i><i class="alt" style="height:${Math.max(8,v*(.22+(i%4)*.12))}%"></i></div>`).join('')}</div><div class="timeline-labels"><span>01 out</span><span>10 out</span><span>20 out</span><span>30 out</span></div>`}
function cards(){const b=banks[state.activeCard];return `<div class="tab-title"><div><div class="eyebrow">Seus meios de pagamento</div><div class="t">Cartões</div></div><button class="tiny-pill" data-action="card-info">${icon('cards')} 3 ativos</button></div><div class="cardslider" aria-label="Selecione um cartão">${banks.map((c,i)=>`<button class="bankcard ${c.cls} ${state.activeCard===i?'active':''}" data-action="card" data-value="${i}"><span class="bank-name">${c.name}</span><span style="font-size:23px;font-weight:600;letter-spacing:.08em">•••• ${c.suffix}</span><span class="bank-foot">Dados debug · cartão demonstrativo</span></button>`).join('')}</div><div class="panel"><div class="card-amount"><span>Compras ilustrativas · ${b.name}</span><span>${icon('spending')}</span></div><div class="card-amount" style="margin-top:9px"><b>${money(b.v)}</b><span>${Math.round(b.v/3818.1*100)}% do total</span></div>${chartBars()}</div><div class="section-head"><strong>Distribuição por cartão</strong></div><div class="panel">${banks.map((x,i)=>`<button data-action="card" data-value="${i}" style="display:flex;align-items:center;gap:11px;padding:10px 0;border:0;border-bottom:${i<2?'1px solid #b9e4c11d':'0'};width:100%;background:none;text-align:left"><span style="width:9px;height:9px;border-radius:50%;background:${['#9573ae','#c3a06c','#d68768'][i]}"></span><span style="flex:1;font-size:12px;color:${i===state.activeCard?'#e9f4ec':'#b1c2b6'}">${x.name}</span><b style="font-size:12px">${money(x.v)}</b></button>`).join('')}</div>`}
function review(){const pending=reviews.filter(r=>!state.done.includes(r.id));const selected=state.reviewView;const tabs=[['pending','Pendentes '+pending.length],['captured','Capturados'],['history','Histórico']];let inside='';if(selected==='pending'){inside=pending.length?pending.map(r=>`<div class="review-item"><div style="display:flex;align-items:start;justify-content:space-between;gap:9px"><strong>${r.title}</strong><span class="tag">Pendente</span></div><div class="detail">${r.src}<br>${r.reason} · ${r.amount}</div><div class="review-actions"><button data-action="resolve" data-value="${r.id}">${icon('check')} Confirmar</button><button class="secondary" data-action="ignore" data-value="${r.id}">${icon('x')} Ignorar</button></div></div>`).join(''):`<div class="empty">${icon('check')}<br>Tudo revisado nesta demonstração.</div>`;}else if(selected==='captured'){inside=`<div class="review-item"><div style="display:flex;justify-content:space-between;gap:12px"><strong>Notificação financeira recebida</strong><span class="tag" style="color:#8fe3b1;background:#285b393f">PARSED</span></div><div class="detail">Nubank · exemplo de captura<br>Evento interpretado e registrado na prévia</div></div><div class="review-item"><div style="display:flex;justify-content:space-between;gap:12px"><strong>Evento de notificação</strong><span class="tag">RECEIVED</span></div><div class="detail">Aguardando classificação pela cadeia de captura.<br>Conteúdo demonstrativo, sem acesso a notificações reais.</div></div>`;}else{const resolved=reviews.filter(r=>state.done.includes(r.id));inside=resolved.length?resolved.map(r=>`<div class="review-item"><strong>${r.title}</strong><div class="detail">${r.src}<br>${state.outcomes[r.id]||'Revisado'} nesta sessão de demonstração.</div></div>`).join(''):`<div class="empty">Nenhuma ação realizada nesta sessão.<br>Confirme ou ignore um evento para gerar histórico.</div>`;}return `<div class="tab-title"><div><div class="eyebrow">Captura e conferência</div><div class="t">Revisar</div></div><button class="tiny-pill" data-action="review-info">${icon('shield')} Eventos</button></div><div class="review-count"><div class="review-badge">${icon('review')}</div><div><b>${pending.length}</b><span>${pending.length===1?'evento aguardando revisão':'eventos aguardando revisão'}</span></div></div><div class="filters">${tabs.map(([v,label])=>`<button class="${selected===v?'selected':''}" data-action="review-view" data-value="${v}">${label}</button>`).join('')}</div><div style="height:12px"></div><div class="panel">${panelHeader(selected==='pending'?'Fila de revisão':selected==='captured'?'Eventos capturados':'Histórico desta sessão',selected==='pending'?'Exemplos de eventos capturados':selected==='captured'?'Amostra ilustrativa do pipeline':'Somente ações realizadas no protótipo')}${inside}</div><div class="section-head"><strong>Integridade da captura</strong></div><div class="integrations"><div class="square" style="color:#9dd5ae">${icon('shield')}</div><div style="flex:1"><strong>Pipeline de eventos</strong><small>RECEIVED → PARSED / REJECTED / FAILED. Protótipo sem alterações no banco.</small></div></div>`}


// The same native-style financial composition drives both the small indicator
// and the expanded optical specimen. No simulated value enters financial math.
let orbInstances=[];
const orbSettings={iridescence:.19,seam:.28,response:.68};
function circularArea(h){const u=1-2*Math.max(0,Math.min(1,h));return (Math.acos(u)-u*Math.sqrt(Math.max(0,1-u*u)))/Math.PI;}
function inverseCircularArea(a){let lo=0,hi=1;for(let i=0;i<27;i++){const m=(lo+hi)/2;(circularArea(m)<a?lo=m:hi=m);}return (lo+hi)/2;}
function blendHex(hex,to,amount){const n=hex.slice(1).match(/.{2}/g).map(v=>parseInt(v,16));return `rgb(${n.map(v=>Math.round(v+(to-v)*amount)).join(',')})`}
function attachOrb(canvas,large=false){
 const ctx=canvas.getContext('2d');if(!ctx)return null;
 const container=canvas.parentElement;
 const entries=(state.goalMode==='card'?weekCard:weekCat).filter(p=>p.v>0);
 const total=entries.reduce((a,p)=>a+p.v,0);
 const fill=large?Number($('#orbDemoFill').value)/100:Math.max(0,Math.min(.88,weeklySpend/Math.max(1,weeklyBudget))); // Main orb stays factual. Enlarged material specimen uses explicitly labeled demo fill.
 const fullArea=circularArea(fill);
 const cumulative=[0]; let runningTotal=0;
 for(const p of entries){runningTotal+=p.v; cumulative.push(inverseCircularArea(fullArea*runningTotal/total));}
 cumulative[cumulative.length-1]=fill;
 const L=entries.length,N=23;
 const waves=Array.from({length:L},()=>new Float32Array(N));
 const velocities=Array.from({length:L},()=>new Float32Array(N));
 let frameId=0,last=0,stillFrames=0,visible=true,lastPointerX=.5,activePointer=null,alive=true;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const effectiveMotion=()=>state.motion&&!reduced.matches;
 let observer=null;
 const w=canvas.width,center=w/2,r=w*.491;
 const xvals=Array.from({length:large?105:61},(_,i)=>center-r+(r*2)*i/(large?104:60));
 const interp=(k,x)=>{const a=waves[k],t=Math.max(0,Math.min(N-1,(x-(center-r))/(2*r)*(N-1))),j=Math.floor(t);return a[j]*(1-(t-j))+a[Math.min(N-1,j+1)]*(t-j);};
 function surfaceY(k,x){
   const spaceBelow=cumulative[k+1]-cumulative[k],spaceAbove=k+2<cumulative.length?cumulative[k+2]-cumulative[k+1]:spaceBelow;
   const maxMove=Math.min(.027,.31*Math.min(spaceBelow,spaceAbove));
   return w*(1-cumulative[k+1])+interp(k,x)*w*maxMove*5;
 }
 function paint(){
   if(!alive)return;
   paintStackedLiquid({ctx,w,center,r,entries,cumulative,xvals,surfaceY,large,seam:orbSettings.seam,iridescence:orbSettings.iridescence});
 }
 function running(){return waves.some((layer,k)=>layer.some((v,i)=>Math.abs(v)>.00016||Math.abs(velocities[k][i])>.00042));}
 function integrate(dt){
   const sub=Math.min(.034,dt)/3;
   for(let step=0;step<3;step++)for(let k=0;k<L;k++){
     const v=velocities[k],h=waves[k],acc=new Float32Array(N);
     for(let i=0;i<N;i++){
       const previous=h[i===0?1:i-1],next=h[i===N-1?N-2:i+1];
       acc[i]=61*(previous+next-2*h[i])-12*h[i];
     }
     for(let i=0;i<N;i++){v[i]=(v[i]+acc[i]*sub)*Math.exp(-5.7*sub);h[i]=Math.max(-1,Math.min(1,h[i]+v[i]*sub));}
     // Prevent DC drift in liquid mass; waves redistribute surface, do not change volume.
     let mean=0;for(let i=0;i<N;i++)mean+=h[i];mean/=N;
     for(let i=0;i<N;i++)h[i]-=mean;
   }
 }
 function settle(){for(const wv of waves)wv.fill(0);for(const v of velocities)v.fill(0);stop();paint();}
 function stop(){if(frameId)cancelAnimationFrame(frameId);frameId=0;last=0;}
 function tick(now){
   frameId=0;
   if(!alive||!visible||document.hidden||!effectiveMotion())return;
   if(!last)last=now;
   const elapsed=now-last;
   if(elapsed>=1000/24){integrate(elapsed/1000);last=now;paint();}
   if(running()&&stillFrames<320){stillFrames++;frameId=requestAnimationFrame(tick)}
   else{stillFrames=0;settle();}
 }
 function resume(){if(!alive)return;paint();if(running()&&visible&&!document.hidden&&effectiveMotion()&&!frameId)frameId=requestAnimationFrame(tick)}
 function excite(x,force){
   if(!effectiveMotion())return;
   let impulse=Math.max(-3,Math.min(3,force))*orbSettings.response;
   for(let k=0;k<L;k++)for(let i=0;i<N;i++){
     const dx=i/(N-1)-x;
     const f=Math.exp(-dx*dx/.018)*(dx<0?-1:1);
     velocities[k][i]+=f*impulse*(1-.09*k);
   }
   integrate(1/24);paint();stillFrames=0;resume();
 }
 function coords(e){const rc=container.getBoundingClientRect();return Math.max(0,Math.min(1,(e.clientX-rc.left)/rc.width));}
 function onDown(e){e.preventDefault();activePointer=e.pointerId;lastPointerX=coords(e);container.setPointerCapture(e.pointerId);excite(lastPointerX,1.15);}
 function onMove(e){if(activePointer!==e.pointerId)return;let x=coords(e);excite(x,Math.max(-2.4,Math.min(2.4,(x-lastPointerX)*14)));lastPointerX=x;}
 function onUp(e){if(activePointer===e.pointerId){activePointer=null;if(container.hasPointerCapture(e.pointerId))container.releasePointerCapture(e.pointerId);}}
 function onKey(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();excite(.51,1.4);}}
 container.addEventListener('pointerdown',onDown);container.addEventListener('pointermove',onMove);
 container.addEventListener('pointerup',onUp);container.addEventListener('pointercancel',onUp);container.addEventListener('keydown',onKey);
 if('IntersectionObserver'in window){observer=new IntersectionObserver(entries=>{visible=!!entries[0]?.isIntersecting;visible?resume():stop();});observer.observe(container);}
 const visibility=()=>{document.hidden?stop():resume();};document.addEventListener('visibilitychange',visibility);
 const motionChange=()=>{if(!effectiveMotion())settle();else resume();};reduced.addEventListener?.('change',motionChange);
 paint();
 const handle={canvas,excite,settle,paint,dispose(){alive=false;stop();observer?.disconnect();document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener?.('change',motionChange);container.removeEventListener('pointerdown',onDown);container.removeEventListener('pointermove',onMove);container.removeEventListener('pointerup',onUp);container.removeEventListener('pointercancel',onUp);container.removeEventListener('keydown',onKey)}};
 orbInstances.push(handle);return handle;
}
function drawMaterialOrb(){
 orbInstances.filter(x=>x.canvas.id==='orb-canvas').forEach(x=>x.dispose());
 orbInstances=orbInstances.filter(x=>x.canvas.id!=='orb-canvas');
 const c=$('#orb-canvas');if(c)attachOrb(c,false);
}
function updateOrbPalette(){
 const list=$('#orbDetailLegend');if(!list)return;
 const items=state.goalMode==='card'?weekCard:weekCat;
 list.innerHTML=items.map(x=>`<div class="orb-legend-row"><i style="background:${x.color}"></i><span>${x.name}</span><strong>${(x.v/Math.max(1,weeklySpend)*100).toFixed(1).replace('.',',')}%</strong></div>`).join('');
}
function openOrbDetail(){
 const modal=$('#orbModal');if(!modal)return;
 modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('orb-modal-open');
 orbInstances.filter(x=>x.canvas.id==='orbDetailCanvas').forEach(x=>x.dispose());
 orbInstances=orbInstances.filter(x=>x.canvas.id!=='orbDetailCanvas');
 updateOrbPalette();attachOrb($('#orbDetailCanvas'),true);
 $('#closeOrb')?.focus();
}
function closeOrbDetail(){
 const modal=$('#orbModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('orb-modal-open');
 orbInstances.filter(x=>x.canvas.id==='orbDetailCanvas').forEach(x=>x.dispose());
 orbInstances=orbInstances.filter(x=>x.canvas.id!=='orbDetailCanvas');
 $('.orb-open-btn')?.focus();
}
function syncOrbSettings(){
 orbSettings.iridescence=Number($('#orbRefraction').value)/100;
 orbSettings.seam=Number($('#orbSeam').value)/100;
 orbSettings.response=Number($('#orbMotion').value)/100;
 document.documentElement.style.setProperty('--orb-iridescence',orbSettings.iridescence);
 $('#orbRefractionOut').textContent=Math.round(orbSettings.iridescence*100)+'%';
 $('#orbSeamOut').textContent=Math.round(orbSettings.seam*100)+'%';
 $('#orbMotionOut').textContent=Math.round(orbSettings.response*100)+'%';
 for(const orb of orbInstances)orb.paint();
}
function mountOpticalSurfaces(root){
 // The lighting source is a DOM sibling behind each existing component.
 // No content, chart, navigation, or Liquid Orb markup is rewritten here.
 const panels=[...root.querySelectorAll('.panel,.metric')];
 for (const el of panels) {
   if(el.parentElement?.classList.contains('glass-site'))continue;
   const site=document.createElement('div');site.className='glass-site';
   site.dataset.optic=el.classList.contains('hero')?'hero':el.classList.contains('goal')?'goal':
      el.classList.contains('category-panel')?'category':
      el.querySelector('.heatmap')?'heat':
      el.querySelector('.transaction')?'activity':
      el.classList.contains('metric')?'metric':
      el.textContent.includes('Estornos reconhecidos')?'refund':'default';
   // All cards sample the same ambient shader; no per-card paint or light DOM.
   el.parentNode.insertBefore(site,el);site.appendChild(el);
 }
}
function render(keepScroll=false){let c=$('#content'),top=keepScroll?c.scrollTop:0;$('#phone').classList.toggle('no-shader',!state.shader);$('#phone').classList.toggle('no-motion',!state.motion);$('#phone').classList.toggle('no-optics',!state.optics);$('#header').innerHTML=header();$('#nav-wrap').innerHTML=nav();c.innerHTML=({home,spending,ads,cards,review}[state.tab]||home)();mountOpticalSurfaces(c);c.scrollTop=top;drawMaterialOrb();$('#toast-layer').innerHTML=state.toast?`<div class="toast" role="status">${state.toast}</div>`:'';$('#shaderSwitch')?.classList.toggle('off',!state.shader);$('#motionSwitch')?.classList.toggle('off',!state.motion);$('#opticsSwitch')?.classList.toggle('off',!state.optics)}
$('#phone').addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(!el)return;const a=el.dataset.action,v=el.dataset.value;switch(a){case 'orb-detail':openOrbDetail();break;case 'pigment-lab':if(document.getElementById('wbTrigger')) document.getElementById('wbTrigger').click();else document.body.classList.add('lab-open');break;case 'tab':set({tab:v},false);break;case 'shortcut':if(v==='goal'){set({tab:'home'},false);requestAnimationFrame(()=>{const el=$('#weekly-goal');if(el)$('#content').scrollTop=el.offsetTop-120;});}else{set({tab:v},false)}break;case 'period':set({period:state.period==='month'?'week':'month'},true);break;case 'period-set':set({period:v},true);break;case 'goal-mode':set({goalMode:v,goalPick:0},true);break;case 'goal-pick':set({goalPick:Number(v)},true);break;case 'day':set({day:Number(v)},true);break;case 'category':set({categoryIndex:state.categoryIndex===Number(v)?-1:Number(v)},true);break;case 'filter':set({filter:v},false);break;case 'shop':set({shop:Number(v)},true);break;case 'card':set({activeCard:Number(v)},true);break;case 'review-view':set({reviewView:v},true);break;case 'resolve':set({done:[...state.done,Number(v)],outcomes:{...state.outcomes,[v]:'Confirmado'}},true);toast('Evento confirmado nesta demonstração.');break;case 'ignore':set({done:[...state.done,Number(v)],outcomes:{...state.outcomes,[v]:'Ignorado'}},true);toast('Evento ignorado nesta demonstração.');break;case 'analyze':toast('Gateway não confirmado: análise indisponível no protótipo.');break;case 'ad-search':toast('Busca será habilitada após conexão com o catálogo.');break;case 'card-info':toast('3 cartões de exemplo, sem acesso ao banco real.');break;case 'review-info':toast('Esta prévia exibe apenas a fila demonstrativa.');break;case 'filters':toast('Use os filtros rápidos logo abaixo do título.');break;}});
$('#closeLab').addEventListener('click',()=>document.body.classList.remove('lab-open'));$('#labScrim').addEventListener('click',()=>document.body.classList.remove('lab-open'));
$('#shaderSwitch').addEventListener('click',()=>set({shader:!state.shader},true));$('#motionSwitch').addEventListener('click',()=>set({motion:!state.motion},true));
$('#opticsSwitch').addEventListener('click',()=>set({optics:!state.optics},true));
function syncGlassSettings(){const blur=Number($('#blurRange').value);const film=Number($('#filmRange').value);document.documentElement.style.setProperty('--glass-blur',blur+'px');document.documentElement.style.setProperty('--glass-film',(film/100).toFixed(2));$('#blurOut').textContent=blur+' px';$('#filmOut').textContent=film+'%';
 const rim=Number($('#rimRange').value);const light=Number($('#lightRange').value);
 document.documentElement.style.setProperty('--glass-rim-strength',(rim/100).toFixed(2));
 document.documentElement.style.setProperty('--glass-glow',(light/100).toFixed(2));
 $('#rimOut').textContent=rim+'%';$('#lightOut').textContent=light+'%';}
$('#blurRange').addEventListener('input',syncGlassSettings);$('#filmRange').addEventListener('input',syncGlassSettings);$('#rimRange').addEventListener('input',syncGlassSettings);$('#lightRange').addEventListener('input',syncGlassSettings);

function syncPigmentSettings(){
 const strength=Number($('#pigmentRange').value);
 const diffusion=Number($('#diffuseRange').value);
 const blend=Number($('#blendRange').value);
 document.documentElement.style.setProperty('--pigment-strength',(strength/100).toFixed(2));
 document.documentElement.style.setProperty('--pigment-diffusion',diffusion+'px');
 document.documentElement.style.setProperty('--pigment-interlock',(blend/100).toFixed(2));
 $('#pigmentOut').textContent=strength+'%';
 $('#diffuseOut').textContent=diffusion+' px';
 $('#blendOut').textContent=blend+'%';
 // Controls remain usable individually; a manual change clears preset status.
 document.querySelectorAll('[data-pigment-preset]').forEach(btn=>{
  const preset=btn.dataset.pigmentPreset;
  const target={calm:[42,28,23],balanced:[74,20,44],rich:[96,14,66]}[preset];
  btn.setAttribute('aria-pressed',String(!!target&&target[0]===strength&&target[1]===diffusion&&target[2]===blend));
 });
}
for(const id of ['pigmentRange','diffuseRange','blendRange']) $('#'+id).addEventListener('input',syncPigmentSettings);
document.querySelectorAll('[data-pigment-preset]').forEach(btn=>btn.addEventListener('click',()=>{
 const [gain,spread,mix]={calm:[42,28,23],balanced:[74,20,44],rich:[96,14,66]}[btn.dataset.pigmentPreset];
 $('#pigmentRange').value=gain;$('#diffuseRange').value=spread;$('#blendRange').value=mix;
 syncPigmentSettings();
}));
syncPigmentSettings();

syncGlassSettings();render();
$('#closeOrb').addEventListener('click',closeOrbDetail);
$('#orbModal').addEventListener('click',e=>{if(e.target===$('#orbModal'))closeOrbDetail();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#orbModal').classList.contains('open'))closeOrbDetail();});
for(const id of ['orbRefraction','orbSeam','orbMotion'])$('#'+id).addEventListener('input',syncOrbSettings);
$('#orbShake').addEventListener('click',()=>{for(const orb of orbInstances)orb.excite(.49,1.7);});
$('#orbRest').addEventListener('click',()=>{for(const orb of orbInstances)orb.settle();});
$('#orbDemoFill').addEventListener('input',()=>{
 $('#orbDemoFillOut').textContent=$('#orbDemoFill').value+'%';
 orbInstances.filter(x=>x.canvas.id==='orbDetailCanvas').forEach(x=>x.dispose());
 orbInstances=orbInstances.filter(x=>x.canvas.id!=='orbDetailCanvas');
 if($('#orbModal').classList.contains('open'))attachOrb($('#orbDetailCanvas'),true);
});
syncOrbSettings();

// Controlled bridge for the DESIGN LAB only. Never reads personal/bank data.
window.NexaPagPreview = Object.freeze({
  getState(){return {
    version:'9.03-interactive', tab:state.tab,
    weeklySpend,weeklyBudget,
    weekCat:weekCat.map(p=>({...p})),
    weekCard:weekCard.map(p=>({...p})),
    category:category.map(p=>({...p,sub:p.sub.map(s=>[...s])})),
    shader:state.shader,motion:state.motion,optics:state.optics,
    goalMode:state.goalMode,filter:state.filter,
    settings:Object.fromEntries(['blurRange','filmRange','rimRange','lightRange','pigmentRange','diffuseRange','blendRange','orbRefraction','orbSeam','orbMotion'].map(id=>[id,Number(document.getElementById(id)?.value||0)]))
  }},
  setTab(tab){if(['home','spending','ads','cards','review'].includes(tab)){set({tab},false);return true}return false},
  setFinance(patch){
    const cap=Number(patch.weeklyBudget),spend=Number(patch.weeklySpend);
    if(!Number.isFinite(cap)||cap<=0||cap>10000000||!Number.isFinite(spend)||spend<0||spend>10000000)throw Error('Valores inválidos');
    const before=weeklySpend;
    weeklyBudget=Math.round(cap*100)/100;weeklySpend=Math.round(spend*100)/100;
    const chosen=Array.isArray(patch.weekCat)?patch.weekCat:null;
    if(chosen && chosen.length===weekCat.length && chosen.every(v=>Number.isFinite(+v)&&+v>=0)){
      const weights=chosen.map(v=>+v),sum=weights.reduce((a,b)=>a+b,0);
      weekCat.forEach((p,i)=>{p.v=sum>0?Math.round(weights[i]/sum*weeklySpend*100)/100:0});
    }else{
      const k=before>0?weeklySpend/before:weeklySpend/270;
      weekCat.forEach(p=>p.v=Math.round(p.v*k*100)/100);
    }
    const sum=weekCat.reduce((a,p)=>a+p.v,0);
    if(weekCat.length)weekCat[weekCat.length-1].v=Math.max(0,+(weekCat[weekCat.length-1].v+weeklySpend-sum).toFixed(2));
    const cardSum=weekCard.reduce((a,p)=>a+p.v,0)||1;
    weekCard.forEach(p=>p.v=+(p.v/cardSum*weeklySpend).toFixed(2));
    state.goalPick=0;render(true);
    window.dispatchEvent(new CustomEvent('nexa:state',{detail:{reason:'finance'}}));
  },
  setColor(target,name,color){
    if(!/^#[0-9a-f]{6}$/i.test(color))throw Error('Hex inválido');
    const groups={weekCat,weekCard,category};
    const part=(groups[target]||[]).find(v=>v.name===name);
    if(!part)throw Error('Categoria não encontrada');
    part.color=color;
    render(true);
    window.dispatchEvent(new CustomEvent('nexa:state',{detail:{reason:'color'}}));
  },
  setControl(id,value){
    const el=document.getElementById(id);if(!el||el.type!=='range')return false;
    const v=Math.max(Number(el.min)||0,Math.min(Number(el.max)||100,Number(value)));
    el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));return true;
  },
  setToggle(id,enabled){
    if(!['shaderSwitch','motionSwitch','opticsSwitch'].includes(id))return false;
    if((id==='shaderSwitch'?state.shader:id==='motionSwitch'?state.motion:state.optics)!==enabled){
      document.getElementById(id)?.click();
    }return true;
  },
  shakeOrb(){document.getElementById('orbShake')?.click()},
  openOrb(){document.querySelector('[data-action="orb-detail"]')?.click()},
  reset(){location.reload()}
});
window.dispatchEvent(new CustomEvent('nexa:ready'));

})();
