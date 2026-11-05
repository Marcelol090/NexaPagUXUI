/* V2.6 · Original image-generated liquid morphs in lightweight animated WebP.
   Each morph plays only when visible, settles into a static last frame,
   and replays on tap. Does not restart motion on unrelated UI interactions. */
(()=>{
  'use strict';
  const catalogue={
    'Alimentação':{slug:'alimentacao',shape:'droplet'},
    'Compras':{slug:'compras',shape:'rectangle'},
    'Transporte':{slug:'transporte',shape:'triangle'},
    'Casa':{slug:'casa',shape:'pentagon'}
  };
  const duration=1440; // generated asset: 9 frames × 160ms
  const settleDelay=1350;
  const timers=new WeakMap();
  const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const url=(slug,final=false)=>`./assets/microbot-${slug}${final?'-last.png':'.webp'}`;

  // Keep the original 24px outline glyph as an error fallback.
  function markup(item,fallback){
    const spec=catalogue[item.n];
    if(!spec)return `<span class="category-morph-glyph">${item.n}</span>`;
    fallback=fallback||'';
    return `<button type="button" class="category-morph category-morph--${item.c} is-complete" data-shape="${spec.shape}" data-category-motion="${item.n}" data-microbot="${spec.slug}" aria-label="Reproduzir expressão da categoria ${item.n}" title="Reproduzir transformação de ${item.n}">
      <span class="category-morph-orb" aria-hidden="true"></span>
      <span class="category-morph-eyes" aria-hidden="true"><i></i><i></i></span>
      <img class="category-morph-final" alt="" aria-hidden="true" decoding="async" src="${url(spec.slug,true)}">
      <img class="category-morph-film" alt="" aria-hidden="true" decoding="async" data-motion-src="${url(spec.slug)}">
      <span class="category-morph-glyph" aria-hidden="true"><svg viewBox="0 0 24 24">${fallback}</svg></span>
    </button>`;
  };
  function play(button){
    if(!button || !button.isConnected)return;
    const spec=catalogue[button.dataset.categoryMotion];
    if(!spec || reduced()){
      button.classList.remove('is-playing','is-finishing');
      button.classList.add('is-complete');
      return;
    }
    const old=timers.get(button);
    if(old){old.forEach(clearTimeout)}
    // Replacing the <img> restarts the decoder without refetching unique URLs.
    const previous=button.querySelector('.category-morph-film');
    if(!previous)return;
    const film=previous.cloneNode(false);
    film.removeAttribute('src');
    previous.replaceWith(film);
    button.classList.remove('is-playing','is-finishing','is-complete');
    button.dataset.motionState='loading';
    let started=false;
    const begin=()=>{
      if(started)return; started=true;
      if(!button.isConnected||film!==button.querySelector('.category-morph-film'))return;
      button.dataset.motionState='playing';
      button.classList.add('is-playing');
      const a=setTimeout(()=>{
        if(button.isConnected){button.classList.add('is-finishing');button.dataset.motionState='finishing'}
      },settleDelay);
      const b=setTimeout(()=>{
        if(button.isConnected){button.classList.remove('is-playing','is-finishing');button.classList.add('is-complete');button.dataset.motionState='complete'}
      },duration+120);
      timers.set(button,[a,b]);
    };
    film.addEventListener('load',begin,{once:true});
    film.addEventListener('error',()=>{
      button.classList.add('has-fallback');
      button.dataset.motionState='fallback';
    },{once:true});
    film.src=film.dataset.motionSrc;
    // Cached animation may decode synchronously on some browsers.
    if(film.complete&&film.naturalWidth)queueMicrotask(begin);
  };
  window.NexaPagMicrobots={markup,play};
  // Any failed static frame should not leave a blank icon.
  document.addEventListener('error',event=>{
    const target=event.target;
    if(target?.classList?.contains('category-morph-final')){
      target.closest('.category-morph')?.classList.add('has-fallback');
    }
  },true);
})();