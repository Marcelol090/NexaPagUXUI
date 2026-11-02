/* NexaPag 9.22 | A restrained financial expression, never a generic reaction emoji.
 * Mood is derived from *actual numbers in the Visualize's illustrative model*.
 * Monthly balance = income - (expenses - refunds); weekly = spent vs budget.
 */
const toCents = value => Math.round((Number(value) || 0) * 100);

export function financialMood({period='month',income=0,expenses=0,refunds=0,spent=0,budget=0} = {}) {
  if (period === 'week') {
    const cap=toCents(budget);
    const used=toCents(spent);
    if(cap<=0) return {tone:'neutral',label:'Meta semanal indisponível',difference:0};
    if(used>cap) return {tone:'negative',label:'Acima da meta semanal',difference:cap-used};
    if(used>=Math.round(cap*.8)) return {tone:'warning',label:'Próximo ao limite semanal',difference:cap-used};
    return {tone:'positive',label:'Dentro da meta semanal',difference:cap-used};
  }
  const net=toCents(income)-Math.max(0,toCents(expenses)-toCents(refunds));
  if(net<0) return {tone:'negative',label:'Saídas superam entradas',difference:net};
  if(net>0) return {tone:'positive',label:'Entradas superam saídas',difference:net};
  return {tone:'neutral',label:'Entradas e saídas equilibradas',difference:0};
}

export function financialFace(mood){
  const tone=['negative','positive','warning','neutral'].includes(mood?.tone)?mood.tone:'neutral';
  const mouth={
    negative:'M12 26 Q20 18 28 26',
    positive:'M12 23 Q20 31 28 23',
    warning:'M12 25 H28',
    neutral:'M12 25 H28'
  }[tone];
  // Explicit SVG path, single stroke and two eyes. No raster emoji, glow, bounce loop or fake indicator.
  return `<span class="flow-expression" data-tone="${tone}" role="img" aria-label="${mood?.label||'Estado do fluxo indisponível'}"><svg class="flow-expression-icon" viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="20" cy="20" r="16.5" stroke-width="1.4"/><path d="M14 15.5v2.5M26 15.5v2.5" stroke-width="2.5"/><path d="${mouth}" stroke-width="2.15"/></svg><span class="flow-expression-copy">${mood?.label||'Sem dados'}</span></span>`;
}
