function uid() { return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function esc(s){ return String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function n2(v){ const n=Number(v); return Number.isInteger(n)?n:parseFloat(n.toFixed(2)); }
function fmtMoney(v,sym='R$'){ return sym+' '+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2}); }

const TOAST_ICON = {success:'✓', error:'✕', warning:'!', info:'i'};
function showToast(msg, type='info'){
  const stack=document.getElementById('toast-stack'); if(!stack) return;
  const el=document.createElement('div');
  el.className='toast toast-'+type;
  el.setAttribute('role','status');
  el.innerHTML=`<span class="toast-ic">${TOAST_ICON[type]||TOAST_ICON.info}</span>
    <span class="toast-msg">${esc(msg)}</span>
    <button type="button" class="toast-close" aria-label="Fechar notificação">✕</button>`;
  stack.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('show'));
  const dur = type==='error' ? 5200 : 3400;
  const timer=setTimeout(()=>dismissToast(el), dur);
  el.querySelector('.toast-close').onclick=()=>{ clearTimeout(timer); dismissToast(el); };
  return el;
}
function dismissToast(el){
  if(!el || el._dismissing) return;
  el._dismissing = true;
  el.classList.remove('show');
  setTimeout(()=>el.remove(), 220);
}

function showActionToast(msg, actionLabel, onAction, type='info'){
  const stack=document.getElementById('toast-stack'); if(!stack) return;
  const el=document.createElement('div');
  el.className='toast toast-'+type+' toast-with-action';
  el.innerHTML=`<span class="toast-ic">${TOAST_ICON[type]||TOAST_ICON.info}</span>
    <span class="toast-msg">${esc(msg)}</span>
    <button type="button" class="toast-action-btn">${esc(actionLabel)}</button>
    <button type="button" class="toast-close" aria-label="Fechar notificação">✕</button>`;
  stack.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('show'));
  const timer=setTimeout(()=>dismissToast(el), 6500);
  el.querySelector('.toast-action-btn').onclick=(e)=>{
    e.stopPropagation(); clearTimeout(timer); dismissToast(el); onAction?.();
  };
  el.querySelector('.toast-close').onclick=()=>{ clearTimeout(timer); dismissToast(el); };
}

function commitReversible(label, {undo, redo}, msg){
  pushHistory({label, undo, redo});
  showActionToast(msg, 'Desfazer', ()=>{
    undoLast();
    showActionToast('Ação desfeita.', 'Refazer', ()=>{
      redoLast();
      showToast('Ação refeita', 'success');
    });
  });
}
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }

function finFanId(tid,fid){ return 'fin-fan-'+tid+'-'+(fid||'root'); }
function toggleFinFan(tid,fid){
  const el=document.getElementById(finFanId(tid,fid)); if(!el) return;
  const willOpen=!el.classList.contains('open');
  document.querySelectorAll('.fin-fan.open').forEach(f=>f.classList.remove('open'));
  if(willOpen) el.classList.add('open');
}
function closeFinFan(tid,fid){
  document.getElementById(finFanId(tid,fid))?.classList.remove('open');
}
document.addEventListener('click', e=>{
  if(e.target.closest('.fin-fan')) return;
  document.querySelectorAll('.fin-fan.open').forEach(f=>f.classList.remove('open'));
});

function initBackToTop(){
  const btn=document.getElementById('back-to-top'); if(!btn) return;
  const area=document.getElementById('main-area');
  const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const toggle=()=>{
    const scroller = (area && getComputedStyle(area).overflowY!=='visible') ? area : window;
    const y = scroller===window ? window.scrollY : area.scrollTop;
    btn.classList.toggle('show', y > 320);
  };
  window.addEventListener('scroll', toggle, {passive:true});
  document.addEventListener('scroll', e=>{ if(e.target.id==='main-area') toggle(); }, {capture:true, passive:true});
  btn.addEventListener('click', ()=>{
    const behavior = reduceMotion ? 'auto' : 'smooth';
    window.scrollTo({top:0, behavior});
    document.getElementById('main-area')?.scrollTo({top:0, behavior});
  });
  toggle();
}

function toggleDropdown(id){
  const el=document.getElementById(id); if(!el) return;
  const willOpen=!el.classList.contains('open');
  closeAllDropdowns();
  if(willOpen){
    el.classList.add('open');
    el.querySelector('.menu-dd-trigger')?.setAttribute('aria-expanded','true');
  }
}
function closeAllDropdowns(){
  document.querySelectorAll('.menu-dd.open').forEach(el=>{
    el.classList.remove('open');
    el.querySelector('.menu-dd-trigger')?.setAttribute('aria-expanded','false');
  });
}
document.addEventListener('click', e=>{
  if(e.target.closest('.menu-dd')) return;
  closeAllDropdowns();
});
function handleTopbarAuthClick(){
  if(currentUser()) handleLogout(); else goPage('login');
}

function toggleAccordion(id){
  document.getElementById(id)?.classList.toggle('open');
}
