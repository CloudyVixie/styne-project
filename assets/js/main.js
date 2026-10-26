async function bootStyne(){
  updateAuthUI();

  const loggedIn = await checkSession();
  if(loggedIn){
    await loadStateFromServer();
  } else {
    resetLocalState();
  }
  updateAuthUI();

  const initialPage=location.hash.slice(1);
  goPage(APP_PAGES.includes(initialPage)?initialPage:'inicio');
  if(S.active) renderSidebar();

  initBackToTop();
}

document.addEventListener('keydown',e=>{
  if(document.getElementById('modal-trail')?.classList.contains('open')&&e.key==='Enter') createTrail();
  if(document.getElementById('modal-node')?.classList.contains('open')&&e.key==='Enter') createNode();
  if(e.key==='Escape'){closeModal('modal-trail');closeModal('modal-node');closeAllDropdowns();}
  const typing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);
  if(!typing && (e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='z'){
    e.preventDefault();
    if(e.shiftKey){ if(redoLast()) showToast('Ação refeita', 'success'); }
    else { if(undoLast()) showToast('Ação desfeita. Ctrl+Shift+Z para refazer.', 'info'); }
  }
  if(!typing && (e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='y'){
    e.preventDefault();
    if(redoLast()) showToast('Ação refeita', 'success');
  }
});

window.addEventListener('hashchange',()=>{
  const page=location.hash.slice(1);
  if(APP_PAGES.includes(page)) goPage(page);
});

bootStyne();
