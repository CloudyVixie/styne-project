const API_BASE = new URL('api/api.php', window.location.href).href;

let CSRF_TOKEN = null;

async function apiPost(action, data){
  try{
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      credentials: 'same-origin',
      body: JSON.stringify({action, csrf: CSRF_TOKEN, ...data}),
    });
    S.offline = false;
    let body = null;
    try{ body = await res.json(); }catch(e){ body = null; }
    if(body?.csrf) CSRF_TOKEN = body.csrf;
    if(!res.ok) return {ok:false, offline:false, status:res.status, error: body?.error || 'Erro ao comunicar com o servidor.'};
    return body ?? {ok:false, error:'Resposta vazia do servidor.'};
  }catch(e){
    S.offline = true;
    return {ok:false, offline:true, error:'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'};
  }
}

async function checkSession(){
  const res = await apiPost('me', {});
  if(res?.ok && res.user){
    S.currentUser = res.user;
    return true;
  }
  S.currentUser = null;
  return false;
}

async function loadStateFromServer(){
  S.loading = true;
  const res = await apiPost('load_state', {});
  S.loading = false;
  if(!res?.ok){
    S.trails = [];
    S.active = null;
    return {ok:false, error: res?.error, offline: res?.offline};
  }
  S.trails = Array.isArray(res.trails) ? res.trails : [];
  S.active = S.trails[0]?.id ?? null;
  return {ok:true};
}

let _syncTimer=null;
function syncStateToBackend(){
  if(!currentUser()) return;
  clearTimeout(_syncTimer);
  _syncTimer=setTimeout(()=>{ syncStateNow(); }, 700);
}

function syncStateNow(){
  clearTimeout(_syncTimer);
  if(!currentUser()) return Promise.resolve({ok:false});
  return apiPost('sync_state', { trails: S.trails }).then(res=>{
    if(!res?.ok) showToast(res?.offline ? 'Sem conexão com o servidor — a alteração pode não ter sido salva.' : 'Não foi possível salvar agora.', 'error');
    return res;
  });
}

async function searchTasks(q){
  const res = await apiPost('search_tasks', {q});
  return res?.ok ? (res.results||[]) : [];
}

async function adminLoadDbOverview(){
  const el=document.getElementById('ad-db-overview'); if(!el) return;
  if(!isCurrentUserAdmin()){ showToast('Acesso restrito ao administrador', 'error'); return; }
  el.textContent='Consultando...';
  const res=await apiPost('admin_db_overview',{});
  if(!res?.ok){
    el.innerHTML=`<span style="color:var(--tx-muted);">${res?.offline?'Sem conexão com o servidor.':'Não foi possível consultar o banco agora.'}</span>`;
    return;
  }
  const c=res.counts||{};
  el.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
      <div class="s-chip"><div class="sv">${c.users??0}</div><div class="sl">Usuários</div></div>
      <div class="s-chip"><div class="sv">${c.trails??0}</div><div class="sl">Trilhas</div></div>
      <div class="s-chip"><div class="sv">${c.folders??0}</div><div class="sl">Pastas</div></div>
      <div class="s-chip"><div class="sv">${c.tasks??0}</div><div class="sl">Tarefas</div></div>
      <div class="s-chip"><div class="sv">${c.support_requests??0}</div><div class="sl">Suportes</div></div>
    </div>`;
}
