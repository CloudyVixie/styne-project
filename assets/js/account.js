async function handleCadastro(){
  const nameEl=document.getElementById('cd-name');
  const emailEl=document.getElementById('cd-email');
  const passEl=document.getElementById('cd-pass');
  const btn=document.getElementById('cd-submit');
  const name=nameEl?.value.trim();
  const email=emailEl?.value.trim();
  const pass=passEl?.value;
  if(!name||!email||!pass){showToast('Falta preencher nome, e-mail ou senha', 'error');return;}
  if(pass.length<4){showToast('Use uma senha com pelo menos 4 caracteres', 'error');return;}

  if(btn){ btn.disabled=true; btn.textContent='Criando conta...'; }
  const res=await apiPost('cadastro',{name,email,pass});
  if(btn){ btn.disabled=false; btn.textContent='Cadastrar'; }

  if(!res?.ok){
    showToast(res?.offline ? 'Sem conexão com o servidor. Tente novamente em instantes.' : (res?.error||'Não foi possível concluir o cadastro.'), 'error');
    return;
  }
  if(nameEl) nameEl.value='';
  if(emailEl) emailEl.value='';
  if(passEl) passEl.value='';
  showToast(res.admin ? 'Conta criada como administradora, por ser a primeira do sistema! Agora é só entrar.' : 'Conta criada! Agora é só entrar.', 'success');
  goPage('login');
}

async function handleLogin(){
  const emailEl=document.getElementById('l-email');
  const passEl=document.getElementById('l-pass');
  const btn=document.getElementById('l-submit');
  const email=emailEl?.value.trim();
  const pass=passEl?.value;
  if(!email||!pass){showToast('Digite seu e-mail e senha para entrar', 'error');return;}

  if(btn){ btn.disabled=true; btn.textContent='Entrando...'; }
  const res=await apiPost('login',{email,pass});
  if(btn){ btn.disabled=false; btn.textContent='Entrar'; }

  if(!res?.ok){
    showToast(res?.offline ? 'Sem conexão com o servidor. Tente novamente em instantes.' : 'E-mail ou senha incorretos', 'error');
    const forgot=document.getElementById('l-forgot');
    if(forgot && !res?.offline) forgot.style.display='block';
    return;
  }

  resetLocalState();
  S.currentUser={id_usuario:res.id_usuario, nome_usuario:res.nome_usuario, email_usuario:email, admin:!!res.admin};
  if(passEl) passEl.value='';
  updateAuthUI();
  await loadStateFromServer();
  showToast(`Bem-vindo(a), ${res.nome_usuario}!`, 'success');
  goPage('app');
}

async function handleLogout(){
  const nome=currentUser()?.nome_usuario;
  showToast('Salvando antes de sair...', 'info');
  await saveAsync();
  await apiPost('logout',{});
  resetLocalState();
  updateAuthUI();
  showToast(nome?`Até mais, ${nome}!`:'Sessão encerrada.', 'success');
  goPage('inicio');
}

function updateAuthUI(){
  const btn=document.getElementById('nav-login');
  const loggedIn=!!currentUser();
  if(btn){
    btn.textContent=loggedIn?'Sair':'Entrar';
    btn.onclick=loggedIn?()=>handleLogout():()=>goPage('login');
  }
  const admin=isCurrentUserAdmin();
  document.querySelectorAll('.admin-only').forEach(el=>{
    el.classList.toggle('is-visible', admin);
  });
  document.querySelectorAll('.logged-in-only').forEach(el=>{
    el.classList.toggle('is-visible', loggedIn);
  });
}

function renderSuportePage(){
  const u=currentUser();
  const loggedOutHint=document.getElementById('ac-logged-out-hint');
  const loggedInBox=document.getElementById('ac-logged-in-box');
  const srName=document.getElementById('sr-name');
  const srEmail=document.getElementById('sr-email');
  const srTitle=document.getElementById('sr-title');
  const srSubtitle=document.getElementById('sr-subtitle');
  if(u){
    if(loggedOutHint) loggedOutHint.style.display='none';
    if(loggedInBox) loggedInBox.style.display='block';
    const acId=document.getElementById('ac-id');
    const acName=document.getElementById('ac-name');
    const acEmail=document.getElementById('ac-email');
    if(acId) acId.value=u.id_usuario;
    if(acName) acName.value=u.nome_usuario;
    if(acEmail) acEmail.value=u.email_usuario;
    if(srName){ srName.value=u.nome_usuario; srName.readOnly=true; }
    if(srEmail){ srEmail.value=u.email_usuario; srEmail.readOnly=true; }
    if(srTitle) srTitle.textContent='Suporte';
    if(srSubtitle) srSubtitle.textContent='Precisa de uma mão com alguma coisa? Manda pra gente.';
  } else {
    if(loggedOutHint) loggedOutHint.style.display='block';
    if(loggedInBox) loggedInBox.style.display='none';
    if(srName){ srName.value=''; srName.readOnly=false; }
    if(srEmail){ srEmail.value=''; srEmail.readOnly=false; }
    if(srTitle) srTitle.textContent='Suporte & recuperação';
    if(srSubtitle) srSubtitle.textContent='Perdeu o acesso à tua conta ou travou em algo? Manda pra gente — não precisa estar logado, só um e-mail válido pra te responder.';
  }
  const cpCurrent=document.getElementById('cp-current');
  const cpNew=document.getElementById('cp-new');
  const cpConfirm=document.getElementById('cp-confirm');
  if(cpCurrent) cpCurrent.value='';
  if(cpNew) cpNew.value='';
  if(cpConfirm) cpConfirm.value='';
  renderMyRequests();
}

async function changePassword(){
  if(!currentUser()){ showToast('Entra na tua conta pra trocar a senha', 'error'); return; }
  const current=document.getElementById('cp-current')?.value||'';
  const novaSenha=document.getElementById('cp-new')?.value||'';
  const confirm=document.getElementById('cp-confirm')?.value||'';
  if(!current||!novaSenha||!confirm){ showToast('Preenche os três campos pra trocar a senha', 'error'); return; }
  if(novaSenha.length<4){ showToast('A nova senha precisa ter pelo menos 4 caracteres', 'error'); return; }
  if(novaSenha!==confirm){ showToast('A confirmação não bateu com a nova senha', 'error'); return; }

  const btn=document.getElementById('cp-submit');
  if(btn){ btn.disabled=true; btn.textContent='Trocando...'; }
  const res=await apiPost('change_password', {current_password:current, new_password:novaSenha});
  if(btn){ btn.disabled=false; btn.textContent='Trocar senha'; }

  if(!res?.ok){
    showToast(res?.offline?'Sem conexão com o servidor.':(res?.error||'Não deu pra trocar a senha agora.'), 'error');
    return;
  }
  document.getElementById('cp-current').value='';
  document.getElementById('cp-new').value='';
  document.getElementById('cp-confirm').value='';
  showToast('Senha trocada!', 'success');
}

// Atualiza nome e/ou e-mail da própria conta. Valida no backend (formato do
// e-mail e unicidade), grava no banco vinculado ao usuário da sessão, e
// sincroniza sessão + tela na hora — sem precisar recarregar a página.
async function updateProfile(){
  const u=currentUser();
  if(!u){ showToast('Entra na tua conta pra editar teus dados', 'error'); return; }
  const nameEl=document.getElementById('ac-name');
  const emailEl=document.getElementById('ac-email');
  const name=nameEl?.value.trim()||'';
  const email=emailEl?.value.trim()||'';
  if(!name){ showToast('O nome não pode ficar em branco', 'error'); return; }
  if(!isValidEmail(email)){ showToast('Digite um e-mail válido', 'error'); return; }

  if(name===u.nome_usuario && email===u.email_usuario){ showToast('Nada mudou por aqui', 'info'); return; }

  const btn=document.getElementById('ac-profile-submit');
  if(btn){ btn.disabled=true; btn.textContent='Salvando...'; }
  const res=await apiPost('update_profile', {name, email});
  if(btn){ btn.disabled=false; btn.textContent='Salvar alterações'; }

  if(!res?.ok){
    showToast(res?.offline?'Sem conexão com o servidor.':(res?.error||'Não deu pra salvar agora.'), 'error');
    return;
  }

  // Sincroniza sessão + toda a interface que usa o nome/e-mail na hora.
  u.nome_usuario=res.nome_usuario;
  u.email_usuario=res.email_usuario;
  updateAuthUI();
  renderSuportePage();
  showToast(`Prontinho, ${u.nome_usuario}! Seus dados foram atualizados.`, 'success');
}

function isValidEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email||'').trim());
}

async function submitSupportRequest(tipo){
  const u=currentUser();
  const nameEl=document.getElementById('sr-name');
  const emailEl=document.getElementById('sr-email');
  const subjEl=document.getElementById('sr-subject');
  const msgEl=document.getElementById('sr-message');
  const name=(u?.nome_usuario)||nameEl?.value.trim()||'';
  const email=(u?.email_usuario)||emailEl?.value.trim()||'';
  const subject=subjEl?.value.trim();
  const message=msgEl?.value.trim();

  if(!isValidEmail(email)){ showToast('Informe um e-mail válido para contato', 'error'); return; }
  if(!subject||!message){showToast('Conta pra gente o assunto e a mensagem', 'error');return;}

  const res=await apiPost('support_submit', {nome_usuario:name||'(não informado)', email_usuario:email, tipo, assunto:subject, mensagem:message});
  if(!res?.ok){
    showToast(res?.offline ? 'Sem conexão com o servidor. Tente novamente.' : (res?.error||'Não foi possível enviar sua solicitação.'), 'error');
    return;
  }

  if(subjEl) subjEl.value='';
  if(msgEl) msgEl.value='';
  if(!u){ if(nameEl) nameEl.value=''; if(emailEl) emailEl.value=''; }
  renderMyRequests();
  showToast(tipo==='problema'?'Problema reportado! Vamos olhar com carinho.':'Solicitação enviada! Retornamos em breve.', 'success');
}

async function renderMyRequests(){
  const el=document.getElementById('sr-my-list'); if(!el) return;
  const u=currentUser();
  const emailEl=document.getElementById('sr-email');
  const myEmail=(u?.email_usuario||emailEl?.value.trim()||'').toLowerCase();
  if(!myEmail){
    el.innerHTML='<div class="empty-hint">Informe seu e-mail para ver suas solicitações.</div>';
    return;
  }
  el.innerHTML='<div class="empty-hint">Carregando...</div>';
  const res=await apiPost('my_support_requests', {email: myEmail});
  const mine = res?.ok ? (res.requests||[]) : [];
  el.innerHTML=mine.length?mine.map(r=>`
    <div class="log-entry ${r.status==='resolvido'?'positive':'negative'}">
      <span class="le-val badge ${r.tipo==='problema'?'badge-a':''}" style="font-size:9px;">${r.tipo==='problema'?'problema':'suporte'}</span>
      <span class="le-note">${esc(r.assunto)}</span>
      <span class="badge ${r.status==='resolvido'?'badge-g':'badge-a'}" style="font-size:9px;">${r.status==='resolvido'?'resolvido':'aberto'}</span>
    </div>`).join(''):`<div class="empty-hint">${res?.ok?'Você ainda não enviou nenhuma solicitação com esse e-mail.':'Não foi possível carregar agora.'}</div>`;
}

async function renderAdminPage(){
  if(!isCurrentUserAdmin()){ goPage('inicio'); return; }

  const admin=currentUser();
  const nameEl=document.getElementById('ad-admin-name');
  const emailEl=document.getElementById('ad-admin-email');
  if(nameEl) nameEl.value=admin?.nome_usuario||'';
  if(emailEl) emailEl.value=admin?.email_usuario||'';

  clearAdminUserForm();

  const searchEl=document.getElementById('ad-search-q');
  if(searchEl) searchEl.value='';
  const resultsEl=document.getElementById('ad-search-results');
  if(resultsEl) resultsEl.innerHTML='<div class="empty-hint">Pesquise por ID, nome ou e-mail.</div>';

  const list=document.getElementById('ad-requests-list'); if(!list) return;
  list.innerHTML='<div class="empty-hint">Carregando solicitações...</div>';
  const res=await apiPost('admin_list_support',{});
  if(!res?.ok){
    list.innerHTML=`<div class="empty-hint">${res?.offline?'Sem conexão com o servidor.':'Não foi possível carregar as solicitações.'}</div>`;
    return;
  }
  window._adminRequests=res.requests||[];
  renderAdminRequestsList();
}

function clearAdminUserForm(){
  const idEl=document.getElementById('ad-user-id');
  const uNameEl=document.getElementById('ad-user-name');
  const uEmailEl=document.getElementById('ad-user-email');
  const uPassEl=document.getElementById('ad-user-password');
  if(idEl) idEl.value='';
  if(uNameEl) uNameEl.value='';
  if(uEmailEl) uEmailEl.value='';
  if(uPassEl) uPassEl.value='';
}

// Carrega um usuário (por ID, nome e e-mail já conhecidos) no formulário
// de atualização — usado tanto pela busca quanto pelas solicitações de suporte.
function adminUseUser(id,name,email){
  const idEl=document.getElementById('ad-user-id');
  const uNameEl=document.getElementById('ad-user-name');
  const uEmailEl=document.getElementById('ad-user-email');
  const uPassEl=document.getElementById('ad-user-password');
  if(idEl) idEl.value=id;
  if(uNameEl) uNameEl.value=name;
  if(uEmailEl) uEmailEl.value=email;
  if(uPassEl) uPassEl.value='';
  document.getElementById('ad-user-id')?.scrollIntoView({behavior:'smooth',block:'center'});
  showToast('Usuário carregado no formulário de atualização', 'info');
}

// Quando uma solicitação chegou sem login (o caso mais comum de "esqueci
// minha senha", já que quem esqueceu a senha não está logado), não existe
// um ID de usuário salvo junto da solicitação. Resolve o usuário atual
// dono daquele e-mail, buscando no banco, e só então carrega o formulário.
async function adminResolveRequestUser(email){
  if(!isCurrentUserAdmin()) return;
  const res=await apiPost('admin_search_users',{q:email});
  const matches=(res?.ok?res.users:[])||[];
  const exact=matches.find(u=>u.email_usuario.toLowerCase()===email.toLowerCase());
  if(!exact){
    showToast('Não encontrei nenhuma conta com esse e-mail no banco.', 'error');
    return;
  }
  adminUseUser(exact.id_usuario, exact.nome_usuario, exact.email_usuario);
}

function renderAdminRequestsList(){
  const list=document.getElementById('ad-requests-list'); if(!list) return;
  const reqs=window._adminRequests||[];
  list.innerHTML=reqs.length?reqs.map(r=>`
    <div class="admin-req-item acc-item ${r.status==='resolvido'?'positive':'negative'}" id="req-${r.id}">
      <button class="admin-req-head" onclick="toggleAccordion('req-${r.id}')">
        <span class="badge ${r.tipo==='problema'?'badge-a':'badge-g'}" style="font-size:9px;">${r.tipo==='problema'?'problema':'suporte'}</span>
        <span class="admin-req-summary"><b>${esc(r.assunto)}</b> — ${esc(r.nome_usuario||'(não informado)')}</span>
        <span class="badge ${r.status==='resolvido'?'badge-g':'badge-a'}" style="font-size:9px;">${r.status==='resolvido'?'resolvido':'aberto'}</span>
        <span class="acc-ic">+</span>
      </button>
      <div class="acc-body"><div class="acc-body-inner admin-req-detail">
        <div class="admin-req-field"><span>ID do usuário</span><b>${r.usuario_id?esc(r.usuario_id):'— (enviado sem login)'}</b></div>
        <div class="admin-req-field"><span>Nome</span><b>${esc(r.nome_usuario||'(não informado)')}</b></div>
        <div class="admin-req-field"><span>E-mail</span><b>${esc(r.email_usuario)}</b></div>
        <div class="admin-req-field"><span>Tipo</span><b>${r.tipo==='problema'?'Reporte de problema':'Pedido de suporte'}</b></div>
        <div class="admin-req-field"><span>Data</span><b>${new Date(r.criado_em).toLocaleString('pt-BR')}</b></div>
        <div class="admin-req-msg"><span>Mensagem</span><p>${esc(r.mensagem)}</p></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
          ${r.usuario_id?`<button class="btn btn-sm btn-primary" onclick="adminUseUser('${esc(r.usuario_id)}','${esc(r.nome_usuario||'').replace(/'/g,"\\'")}','${esc(r.email_usuario).replace(/'/g,"\\'")}')">Usar estes dados</button>`
            :`<button class="btn btn-sm btn-primary" onclick="adminResolveRequestUser('${esc(r.email_usuario).replace(/'/g,"\\'")}')">Localizar conta por e-mail</button>`}
          <button class="btn btn-sm ${r.status==='resolvido'?'':'btn-primary'}" onclick="adminSetStatus('${r.id}','${r.status==='resolvido'?'aberto':'resolvido'}')">
            ${r.status==='resolvido'?'Reabrir':'Marcar resolvido'}
          </button>
        </div>
      </div></div>
    </div>`).join(''):'<div class="empty-hint">Nenhuma solicitação por aqui ainda — tudo tranquilo.</div>';
}

async function adminSearchUsers(){
  if(!isCurrentUserAdmin()){ showToast('Acesso restrito ao administrador', 'warning'); return; }
  const q=(document.getElementById('ad-search-q')?.value||'').trim();
  const resultsEl=document.getElementById('ad-search-results'); if(!resultsEl) return;
  if(!q){ resultsEl.innerHTML='<div class="empty-hint">Pesquise por ID, nome ou e-mail.</div>'; return; }

  resultsEl.innerHTML='<div class="empty-hint">Buscando...</div>';
  const res=await apiPost('admin_search_users',{q});
  if(!res?.ok){
    resultsEl.innerHTML=`<div class="empty-hint">${res?.offline?'Sem conexão com o servidor.':'Não foi possível buscar agora.'}</div>`;
    return;
  }
  const matches=res.users||[];
  resultsEl.innerHTML=matches.length?matches.map(u=>`
    <div class="fin-log-entry" style="align-items:flex-start;flex-wrap:wrap;">
      <span class="badge ${u.admin?'badge-a':'badge-g'}" style="font-size:9px;">${u.admin?'admin':'usuário'}</span>
      <span class="fle-note" style="flex:1;min-width:160px;">
        <b>${esc(u.nome_usuario)}</b><br>
        <span style="color:var(--tx-muted);">ID: ${esc(u.id_usuario)} · ${esc(u.email_usuario)}</span>
      </span>
      <button class="btn btn-sm" onclick="adminUseUser('${esc(u.id_usuario)}','${esc(u.nome_usuario).replace(/'/g,"\\'")}','${esc(u.email_usuario).replace(/'/g,"\\'")}')">Usar</button>
    </div>`).join(''):'<div class="empty-hint">Não achei ninguém com esses dados.</div>';
}

async function adminSetStatus(id,status){
  if(!isCurrentUserAdmin()){ showToast('Acesso restrito ao administrador', 'warning'); return; }
  const res=await apiPost('admin_set_support_status',{id,status});
  if(!res?.ok){ showToast(res?.offline?'Sem conexão com o servidor.':'Não foi possível atualizar.', 'error'); return; }
  showToast(status==='resolvido'?'Marcada como resolvida':'Reaberta.', 'success');
  renderAdminPage();
}

// Atualiza nome, e-mail e (opcionalmente) senha do usuário identificado
// pelo ID — nunca por busca. É preciso ter carregado um usuário antes
// (pela busca ou por uma solicitação de suporte).
async function adminUpdateUserData(){
  if(!isCurrentUserAdmin()){ showToast('Acesso restrito ao administrador', 'warning'); return; }
  const id=document.getElementById('ad-user-id')?.value.trim();
  const nameEl=document.getElementById('ad-user-name');
  const emailEl=document.getElementById('ad-user-email');
  const passEl=document.getElementById('ad-user-password');
  const name=nameEl?.value.trim();
  const email=emailEl?.value.trim();
  const newPassword=passEl?.value||'';
  if(!id){ showToast('Selecione um usuário primeiro (busca ou solicitação de suporte)', 'error'); return; }
  if(!name||!email){ showToast('Preencha nome e e-mail do usuário', 'error'); return; }

  const btn=document.getElementById('ad-update-submit');
  if(btn){ btn.disabled=true; btn.textContent='Salvando...'; }
  const res=await apiPost('admin_update_user',{id,name,email,new_password:newPassword});
  if(btn){ btn.disabled=false; btn.textContent='Atualizar dados do usuário'; }

  if(!res?.ok){
    showToast(res?.offline?'Sem conexão com o servidor.':(res?.error||'Não deu pra atualizar agora.'), 'error');
    return;
  }
  if(passEl) passEl.value='';
  showToast(newPassword?`Dados e senha de ${name} atualizados`:`Dados de ${name} atualizados`, 'success');
}
