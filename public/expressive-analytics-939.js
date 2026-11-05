(function initializeNexa939(){
  'use strict';
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>t*t*(3-2*t);
  const brl=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Math.max(0,Number(n)||0));
  const short=n=>n>=1000?'R$ '+new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1}).format(n/1000)+' mil':brl(n).replace(/,00$/,'');
  const niceLimit=n=>{
    if(n<=0)return 100;
    const approx=n/3;
    const ten=Math.pow(10,Math.floor(Math.log10(approx)));
    const step=[1,2,2.5,5,10].map(v=>v*ten).find(v=>v>=approx)||ten*10;
    return Math.ceil(n/step)*step;
  };
  // No invented time series: a single scale compares the actual demonstration totals.
  function graph(finance, tone){
    const week=finance.period==='week';
    const expense=Math.max(0,(Number(finance.expenses)||0)-(Number(finance.refunds)||0));
    const income=Math.max(0,Number(finance.income)||0);
    const spent=Math.max(0,Number(finance.weekly)||0);
    const budget=Math.max(0,Number(finance.budget)||0);
    const rows=week
      ?[{label:'Utilizado',value:spent,color:spent>budget?'red':spent>=budget*.8?'amber':'green'},
        {label:'Limite semanal',value:budget,color:'budget'}]
      :[{label:'Recebimentos',value:income,color:'green'},
        {label:'Saídas líquidas',value:expense,color:'red'}];
    const scale=niceLimit(Math.max(1,...rows.map(x=>x.value)));
    const colors={green:['#9FECC0','#28A777'],red:['#FFAFAB','#D84D63'],amber:['#FFD898','#DC9B3C'],budget:['#8BADA0','#567E72']};
    const defs=Object.entries(colors).map(([key,p])=>'<linearGradient id="n939-'+key+'" x1="0" x2="1"><stop stop-color="'+p[0]+'"/><stop offset="1" stop-color="'+p[1]+'"/></linearGradient>').join('');
    const grid=[0,.5,1].map((t,i)=>{
      const x=4+t*330;
      const anchor=i===0?'start':i===2?'end':'middle';
      return '<line class="chart-grid" x1="'+x+'" y1="19" x2="'+x+'" y2="103"/>'+
        '<text class="chart-axis" x="'+x+'" y="124" text-anchor="'+anchor+'">'+short(scale*t).replace('R$ 0','0')+'</text>';
    }).join('');
    const bars=rows.map((r,i)=>{
      const y=34+i*49, width=330*clamp(r.value/scale);
      const title=r.label+': '+brl(r.value);
      return '<text class="chart-label" x="4" y="'+(y-8)+'">'+r.label+'</text>'+
      '<text class="chart-value" x="334" y="'+(y-8)+'" text-anchor="end">'+brl(r.value)+'</text>'+
      '<rect class="chart-track" x="4" y="'+y+'" width="330" height="17" rx="7"/>'+
      (width>0.5?'<rect class="chart-fill" tabindex="0" aria-label="'+title+'" role="img" x="4" y="'+y+'" width="'+width.toFixed(3)+'" height="17" rx="7" fill="url(#n939-'+r.color+')"><title>'+title+'</title></rect>':'');
    }).join('');
    const aria=week?'Comparativo demonstrativo semanal. Utilizado: '+brl(spent)+'. Limite: '+brl(budget)+'.':'Comparativo mensal demonstrativo. Recebimentos: '+brl(income)+'. Saídas líquidas: '+brl(expense)+'.';
    return '<svg class="trend analytics-chart" viewBox="0 0 338 128" preserveAspectRatio="xMidYMid meet" role="img" aria-label="'+aria+'"><title>'+(week?'Uso da meta semanal':'Entradas versus saídas líquidas')+'</title><desc>Comparação com eixo comum, de zero até '+brl(scale)+'. Os valores são demonstrativos.</desc><defs>'+defs+'</defs>'+grid+bars+'</svg>';
  }
  function categoryRanking(categories, amountFor, selected, cash){
    const records=categories.map(c=>({name:c.name,color:c.color,amount:Math.max(0,amountFor(c))}));
    const total=records.reduce((s,r)=>s+r.amount,0);
    const ranked=records.sort((a,b)=>b.amount-a.amount);
    const rows=ranked.map(r=>{
      const percent=total?clamp(r.amount/total)*100:0;
      const pct=new Intl.NumberFormat('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1}).format(percent)+'%';
      return '<button type="button" data-category="'+r.name+'" aria-pressed="'+String(selected===r.name)+'" aria-label="'+r.name+': '+pct+' das compras, '+cash(r.amount)+'" style="--ranking-share:'+percent.toFixed(4)+'%;--ranking-color:'+r.color+'">'+
        '<span class="ranking-label"><i class="ranking-swatch" aria-hidden="true"></i>'+r.name+'</span>'+
        '<span class="ranking-amount">'+cash(r.amount)+'</span>'+
        '<span class="ranking-track" aria-hidden="true"><i class="ranking-fill"></i></span>'+
        '<span class="ranking-percent">'+pct+'</span></button>';
    }).join('');
    return '<div class="category-ranking" role="group" aria-label="Ranking de categorias por valor"><div class="ranking-title"><span>Composição detalhada</span><span>Maior para menor</span></div>'+rows+'</div>';
  }
  // Facial rig uses one compatible SVG path command per eye. Each eye follows a
  // slightly offset damping curve, while the mouth and brows settle last.
  function morphSignal(hero,t){
    const left=hero.querySelector('[data-eye="left"]');
    const right=hero.querySelector('[data-eye="right"]');
    const mouth=hero.querySelector('[data-mouth]');
    const browL=hero.querySelector('[data-brow="left"]');
    const browR=hero.querySelector('[data-brow="right"]');
    if(!left||!right||!mouth)return;
    const tone=hero.dataset.mood||'neutral';
    const configs={
      negative:{
        left:[[23,29],[26,19],[35,18],[39,25]],
        right:[[51,25],[55,18],[64,19],[67,29]],
        mouth:[34,46,45,35,56,46],
        brows:['M22 14 Q30 10 40 17','M50 17 Q60 10 68 14'],browOpacity:.68
      },
      positive:{
        left:[[23,27],[29,15],[34,15],[39,27]],
        right:[[51,27],[56,15],[61,15],[67,27]],
        mouth:[34,42,45,53,56,42],
        brows:['M25 13 Q32 12 38 14','M52 14 Q59 12 66 13'],browOpacity:.18
      },
      warning:{
        left:[[24,23],[29,25],[33,25],[38,23]],
        right:[[52,23],[57,25],[61,25],[66,23]],
        mouth:[36,44,45,43,54,44],
        brows:['M23 13 Q31 11 39 15','M51 15 Q59 11 67 13'],browOpacity:.55
      },
      neutral:{
        left:[[26,21],[30,21],[35,21],[39,21]],
        right:[[51,21],[56,21],[61,21],[65,21]],
        mouth:[37,44,45,45,53,44],
        brows:['M26 14 Q32 14 39 14','M51 14 Q58 14 65 14'],browOpacity:.15
      }
    };
    const mood=configs[tone]||configs.neutral;
    const eyeStart=x=>[[x,18],[x,21.7],[x,25.3],[x,29]];
    function curve(start,points,p){
      const r=start.map((s,i)=>[mix(s[0],points[i][0],p),mix(s[1],points[i][1],p)]);
      return 'M'+r[0].map(n=>n.toFixed(2)).join(' ')+' C'+r.slice(1).map(x=>x.map(n=>n.toFixed(2)).join(' ')).join(' ');
    }
    const leftP=smooth(clamp((t-.23)/.22));
    const rightP=smooth(clamp((t-.255)/.24));
    left.setAttribute('d',curve(eyeStart(32),mood.left,leftP));
    right.setAttribute('d',curve(eyeStart(58),mood.right,rightP));
    const p=smooth(clamp((t-.37)/.22));
    const m=mood.mouth;
    const x0=mix(34,m[0],p),y0=mix(44,m[1],p);
    const cx=mix(45,m[2],p),cy=mix(44,m[3],p);
    const x1=mix(56,m[4],p),y1=mix(44,m[5],p);
    mouth.setAttribute('d','M'+x0.toFixed(2)+' '+y0.toFixed(2)+' Q'+cx.toFixed(2)+' '+cy.toFixed(2)+' '+x1.toFixed(2)+' '+y1.toFixed(2));
    mouth.style.opacity=String(p*(tone==='neutral'?.55:.92));
    if(browL&&browR){
      browL.setAttribute('d',mood.brows[0]);
      browR.setAttribute('d',mood.brows[1]);
      const opacity=smooth(clamp((t-.31)/.18))*mood.browOpacity;
      browL.style.opacity=String(opacity);
      browR.style.opacity=String(opacity);
    }
  }
  window.Nexa939=Object.freeze({graph,categoryRanking,morphSignal});
})();
