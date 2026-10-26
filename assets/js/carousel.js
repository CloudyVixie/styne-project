function initLpCarousel(){
  const root = document.getElementById('lp-carousel');
  const track = document.getElementById('lp-car-track');
  const dotsWrap = document.getElementById('lp-car-dots');
  const prevBtn = document.getElementById('lp-car-prev');
  const nextBtn = document.getElementById('lp-car-next');
  if(!root||!track||!dotsWrap||!prevBtn||!nextBtn) return;

  const slides = Array.from(track.children);
  if(!slides.length) return;
  let index = 0;

  dotsWrap.innerHTML = slides.map((_,i)=>
    `<button type="button" class="lp-car-dot" aria-label="Ir para o card ${i+1}"></button>`
  ).join('');
  const dots = Array.from(dotsWrap.children);

  function render(){
    track.style.transform = `translateX(-${index*100}%)`;
    dots.forEach((d,i)=>{
      d.classList.toggle('active', i===index);
      d.setAttribute('aria-current', i===index ? 'true' : 'false');
    });
  }

  function goTo(i){
    index = (i + slides.length) % slides.length;
    render();
  }

  prevBtn.addEventListener('click', ()=>goTo(index-1));
  nextBtn.addEventListener('click', ()=>goTo(index+1));
  dots.forEach((d,i)=>d.addEventListener('click', ()=>goTo(i)));

  root.setAttribute('tabindex','0');
  root.addEventListener('keydown', e=>{
    if(e.key==='ArrowLeft'){ e.preventDefault(); goTo(index-1); }
    if(e.key==='ArrowRight'){ e.preventDefault(); goTo(index+1); }
  });

  let startX=null;
  track.addEventListener('touchstart', e=>{ startX=e.touches[0].clientX; }, {passive:true});
  track.addEventListener('touchend', e=>{
    if(startX===null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if(Math.abs(dx) > 40) goTo(dx < 0 ? index+1 : index-1);
    startX=null;
  }, {passive:true});

  render();
}

document.addEventListener('DOMContentLoaded', initLpCarousel);
if(document.readyState !== 'loading') initLpCarousel();
