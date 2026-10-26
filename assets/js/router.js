const APP_PAGES=['inicio','app','sobre','login','cadastro','suporte','admin'];

function goPage(name) {
  if(!APP_PAGES.includes(name)) name='inicio';
  if (name==='admin' && !isCurrentUserAdmin()) {
    showToast('Acesso restrito ao administrador', 'warning');
    name='inicio';
  }
  if (name==='app' && !currentUser()) {
    showToast('Faça login para acessar o Meu Espaço', 'info');
    name='login';
  }
  closeAllDropdowns();
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });
  const pg = document.getElementById('page-'+name);
  if (pg) { pg.style.display = name==='app'?'grid':'block'; pg.classList.add('active'); }
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const nl = document.getElementById('nav-'+name);
  if (nl) nl.classList.add('active');
  if (location.hash.slice(1)!==name) {
    history.replaceState(null,'','#'+name);
  }
  if (name==='app') {
    renderSidebar();
    if (S.active) renderTrail(S.active);
    else showWelcome();
  }
  if (name==='suporte') renderSuportePage();
  if (name==='admin') renderAdminPage();
  if (name==='login') {
    const forgot=document.getElementById('l-forgot');
    if (forgot) forgot.style.display='none';
  }
}
