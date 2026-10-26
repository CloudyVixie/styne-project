function renderSidebar(){
  const el=document.getElementById('trail-list');
  if(!el) return;
  if(!S.trails.length){
    el.innerHTML='<span style="font-size:12px;color:var(--tx-muted);padding:8px 10px;display:block;">Nenhuma trilha por aqui — que tal criar a primeira?</span>';
    return;
  }
  el.innerHTML=S.trails.map(t=>{
    const {t:tot,d:don}=countTrailItems(t);
    const pct=tot?Math.round(don/tot*100):0;
    return `<button class="trail-btn ${S.active===t.id?'active':''}" onclick="selectTrail('${t.id}')">
      <span style="font-size:16px;">${esc(t.icon)}</span>
      <span class="tb-name">${esc(t.name)}</span>
      ${t.locked?'<span style="font-size:11px;">🔒</span>':''}
      ${tot?`<span class="badge ${pct===100?'badge-g':'badge-a'}" style="font-size:9px;">${pct}%</span>`:''}
    </button>`;
  }).join('');
}

let _searchTimer=null, _searchSeq=0;
function onTaskSearchInput(q){
  const box=document.getElementById('task-search-results'); if(!box) return;
  clearTimeout(_searchTimer);
  q=q.trim();
  if(!q){ box.classList.remove('open'); box.innerHTML=''; return; }
  box.classList.add('open');
  box.innerHTML='<div class="empty-hint">Buscando...</div>';
  const mySeq=++_searchSeq;
  _searchTimer=setTimeout(async ()=>{
    const results=await searchTasks(q);
    if(mySeq!==_searchSeq) return;
    if(!results.length){
      box.innerHTML='<div class="empty-hint">Nada encontrado para "'+esc(q)+'". Tenta outro termo?</div>';
      return;
    }
    box.innerHTML=results.map(r=>`
      <button class="task-search-item" onclick="goToSearchResult('${esc(r.trilha_id||'')}')">
        <span class="tsi-type">${GOAL_ICON[r.tipo]||(r.tipo==='item'?'☑':'★')}</span>
        <span class="tsi-body">
          <span class="tsi-title">${esc(r.titulo)}</span>
          <span class="tsi-path">${esc(r.trilha_nome||'')}${r.pasta_nome?' / '+esc(r.pasta_nome):''}</span>
        </span>
      </button>`).join('');
  }, 350);
}
function goToSearchResult(tid){
  document.getElementById('task-search-results')?.classList.remove('open');
  if(tid) selectTrail(tid);
}
document.addEventListener('click', e=>{
  if(e.target.closest('.sb-search')) return;
  document.getElementById('task-search-results')?.classList.remove('open');
});

function showWelcome(){
  const ma=document.getElementById('main-area'); if(!ma) return;
  const u=currentUser();
  const title=u?`Bem-vindo(a), ${esc(u.nome_usuario)}`:'Ainda não tem nada por aqui';
  ma.innerHTML=`<div class="welcome-center anim-up">
    <img class="w-emblem" src="assets/images/logo.png" alt="" width="50" height="72"/>
    <div class="w-title">${title}</div>
    <p class="w-sub">Que tal começar com sua primeira trilha? Pode ser estudos, um projeto, suas finanças — o que você quiser organizar.</p>
    <button class="btn btn-primary" onclick="openNewTrailModal()">+ Criar minha primeira trilha</button>
  </div>`;
}

let _trailSearchTimer=null;
function filterTrailView(tid, q){
  clearTimeout(_trailSearchTimer);
  _trailSearchTimer=setTimeout(()=>{
    const root=document.getElementById('tv-'+tid); if(!root) return;
    const query=q.trim().toLowerCase();
    let anyVisible=false;

    root.querySelectorAll('.item').forEach(el=>{
      const name=(el.querySelector('.item-name')?.value||'').toLowerCase();
      const hide=!!query && !name.includes(query);
      el.classList.toggle('search-hidden', hide);
      if(!hide) anyVisible=true;
    });

    root.querySelectorAll('.panel[data-goal-name]').forEach(el=>{
      const name=(el.dataset.goalName||'').toLowerCase();
      const hide=!!query && !name.includes(query);
      el.classList.toggle('search-hidden', hide);
      if(!hide) anyVisible=true;
    });

    root.querySelectorAll('.node').forEach(el=>{
      const nameInput=el.querySelector('.node-head input, .node-head .nh-name');
      const name=(nameInput?.value||nameInput?.textContent||'').toLowerCase();
      const innerVisible=Array.from(el.querySelectorAll('.item,.panel[data-goal-name]')).some(inner=>!inner.classList.contains('search-hidden'));
      const selfMatches=!query || name.includes(query);
      const hide=!!query && !selfMatches && !innerVisible;
      el.classList.toggle('search-hidden', hide);
      if(!hide) anyVisible=true;
    });

    const emptyEl=document.getElementById('trail-search-empty-'+tid);
    if(emptyEl) emptyEl.style.display=(query && !anyVisible)?'block':'none';
  }, 180);
}

function renderTrail(tid){
  const ma=document.getElementById('main-area'); if(!ma) return;
  const trail=getTrail(tid); if(!trail){showWelcome();return;}

  const {t:tot,d:don}=countTrailItems(trail);
  const pct=tot?Math.round(don/tot*100):0;
  const locked=trail.locked;
  const folders=trail.folders??[];

  ma.innerHTML=`<div class="anim-up ${locked?'trail-locked':''}" id="tv-${tid}">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px;">
      <span style="font-size:30px;">${esc(trail.icon)}</span>
      <input style="font-size:22px;font-weight:900;background:none;border:none;border-bottom:2.5px solid var(--red);outline:none;color:var(--navy);font-family:var(--font);padding:2px 6px;flex:1;min-width:160px;"
        value="${esc(trail.name)}" ${locked?'readonly':''} onchange="renameTrail('${tid}',this.value)" />
      <div style="display:flex;gap:7px;flex-wrap:wrap;">
        <button class="btn btn-sm ${locked?'btn-primary':'btn-navy'}" onclick="toggleLock('${tid}')">${locked?'🔒 Bloqueada':'🔓 Editar'}</button>
        ${!locked?`<button class="btn btn-sm" onclick="openAddNode('${tid}')">+ Pasta</button>
        <button class="btn btn-icon btn-sm" title="Nova meta: Cronograma" onclick="addGoal('${tid}',null,'sched')">⏱</button>
        <button class="btn btn-icon btn-sm" title="Nova meta: Hidratação" onclick="addGoal('${tid}',null,'water')">💧</button>
        ${buildFinFan(tid,null)}`:''}
        <button class="btn btn-sm btn-danger" onclick="deleteTrail('${tid}')">🗑</button>
      </div>
    </div>

    <div class="trail-search-wrap">
      <input type="search" class="trail-search-input" placeholder="Buscar dentro desta trilha..."
        oninput="filterTrailView('${tid}', this.value)" aria-label="Buscar dentro desta trilha"/>
      <div class="empty-hint" id="trail-search-empty-${tid}" style="display:none;">Nada encontrado nesta trilha.</div>
    </div>

    <!-- Stats -->
    ${tot>0?`<div class="stats-strip">
      <div class="s-chip"><div class="sv">${tot}</div><div class="sl">Itens</div></div>
      <div class="s-chip"><div class="sv">${don}</div><div class="sl">Feitos</div></div>
      <div class="s-chip"><div class="sv">${tot-don}</div><div class="sl">Faltam</div></div>
      <div class="s-chip" style="flex:1;min-width:180px;">
        <div class="prog-wrap" style="width:100%;">
          <div class="prog-track" style="flex:1;"><div class="prog-fill" style="width:${pct}%"></div></div>
          <span class="prog-label">${pct}%</span>
        </div>
        <div class="sl">progresso geral</div>
      </div>
    </div>`:''}

    <!-- Metas e itens diretamente na trilha -->
    <div id="root-container" style="display:flex;flex-direction:column;gap:14px;margin-top:${tot>0?'14px':'0'};">
      ${buildContainerBody(tid,null,trail,locked)}
    </div>

    <!-- Pastas (somente nível raiz — sem subpastas) -->
    <div id="folders-root" style="display:flex;flex-direction:column;gap:14px;margin-top:14px;">
      ${folders.map(f=>buildFolder(tid,f,locked)).join('')}
    </div>

    ${!locked?`<button class="btn btn-ghost w-full mt-12" style="justify-content:center;" onclick="openAddNode('${tid}')">
      + adicionar pasta em "${esc(trail.name)}"
    </button>`:''}
  </div>`;
}

function buildContainerBody(tid,fid,container,locked){
  const goals=container.goals??[];
  const items=container.items??[];
  const inputId=fid?`ai-${fid}`:`ai-root-${tid}`;
  return `
    ${goals.length?`<div style="display:flex;flex-direction:column;gap:12px;">${goals.map(g=>buildGoalPanel(tid,fid,g,locked)).join('')}</div>`:''}
    ${items.length?`<div style="display:flex;flex-direction:column;gap:6px;">${items.map(i=>buildItem(tid,fid,i,locked)).join('')}</div>`:''}
    ${!locked?`<div class="inline-add">
      <input id="${inputId}" placeholder="+ novo item..."
        onkeydown="if(event.key==='Enter')addItem('${tid}','${fid?fid:''}','${inputId}')" />
      <button class="btn btn-sm btn-primary" onclick="addItem('${tid}','${fid?fid:''}','${inputId}')">OK</button>
    </div>`:''}`;
}

function buildFolder(tid,folder,locked){
  const {t:tot,d:don}=countItems(folder);
  const pct=tot?Math.round(don/tot*100):0;
  const pb=tot?`<span class="badge ${pct===100?'badge-g':pct>50?'badge-a':''}" style="font-size:9px;">${don}/${tot}</span>`:'';

  return `<div class="node nc${folder.colorIdx??0} ${folder.open?'open':''} anim-pop" id="nd-${folder.id}">
    <div class="node-head" onclick="handleFolderClick(event,'${tid}','${folder.id}')">
      <span class="nh-arrow">▶</span>
      <span class="nh-icon">${esc(folder.icon)}</span>
      <input class="nh-name" value="${esc(folder.name)}" ${locked?'readonly':''}
        onclick="event.stopPropagation()"
        onchange="renameNode('${tid}','${folder.id}',this.value)" />
      <div class="nh-right">
        ${pb}
        ${!locked?`<div class="node-acts" onclick="event.stopPropagation()">
          <button class="btn btn-icon btn-sm" title="Nova meta: Cronograma" onclick="addGoal('${tid}','${folder.id}','sched')">⏱</button>
          <button class="btn btn-icon btn-sm" title="Nova meta: Hidratação" onclick="addGoal('${tid}','${folder.id}','water')">💧</button>
          ${buildFinFan(tid,folder.id)}
          <button class="btn btn-icon btn-sm btn-danger" title="Deletar pasta" onclick="deleteNode('${tid}','${folder.id}')">✕</button>
        </div>`:''}
      </div>
    </div>

    <div class="node-body">
      ${buildContainerBody(tid,folder.id,folder,locked)}
    </div>
  </div>`;
}

function handleFolderClick(e,tid,fid){
  if(e.target.closest('input, button, .node-acts, .item, .panel')) return;
  toggleNode(tid,fid);
}

function buildItem(tid,fid,item,locked){
  const qLabel=item.qty?`${esc(item.qty)}${item.unit?' '+esc(item.unit):''}`:'+ qty';
  const fidArg=fid?fid:'';
  return `<div class="item ${item.done?'done':''}">
    <div class="item-check" ${locked?'':'onclick="toggleItem(\''+tid+'\',\''+fidArg+'\',\''+item.id+'\')"'}>${item.done?'✓':''}</div>
    <input class="item-name" value="${esc(item.name)}" ${locked?'readonly':''}
      onchange="renameItem('${tid}','${fidArg}','${item.id}',this.value)" />
    ${!locked?`<span class="item-qty" onclick="editQty('${tid}','${fidArg}','${item.id}')" title="Editar quantidade">${qLabel}</span>`:(item.qty?`<span class="badge" style="font-size:10px;">${qLabel}</span>`:'')}
    ${!locked?`<div class="item-acts"><button class="btn btn-icon btn-sm btn-danger" onclick="deleteItem('${tid}','${fidArg}','${item.id}')">✕</button></div>`:''}
  </div>`;
}

function buildFinFan(tid,fid){
  const fidArg=fid?fid:'';
  return `<div class="fin-fan" id="${finFanId(tid,fid)}">
    <button class="btn btn-icon btn-sm fin-fan-trigger" title="Finanças" onclick="event.stopPropagation();toggleFinFan('${tid}','${fidArg}')">💰</button>
    <div class="fin-fan-menu" onclick="event.stopPropagation()">
      <button class="fin-fan-item" title="Meta financeira" onclick="addFinInstance('${tid}','${fidArg}','fin')">🎯</button>
      <button class="fin-fan-item" title="Conversor de moedas" onclick="addFinInstance('${tid}','${fidArg}','convert')">💱</button>
      <button class="fin-fan-item" title="Divisor de valores" onclick="addFinInstance('${tid}','${fidArg}','split')">➗</button>
      <button class="fin-fan-item" title="Calculadora de juros" onclick="addFinInstance('${tid}','${fidArg}','interest')">📈</button>
    </div>
  </div>`;
}

const GOAL_ICON={sched:'⏱',fin:'💰',water:'💧',convert:'💱',split:'➗',interest:'📈'};
const GOAL_PANEL_CLASS={sched:'panel-schedule',fin:'panel-finance',water:'panel-water',convert:'panel-finance',split:'panel-finance',interest:'panel-finance'};
const GOAL_TITLE_COLOR={sched:'',fin:'color:var(--amber);',water:'color:#2b7cd3;',convert:'color:var(--amber);',split:'color:var(--amber);',interest:'color:var(--amber);'};

function buildGoalPanel(tid,fid,goal,locked){
  const fidArg=fid?fid:'';
  const icon=GOAL_ICON[goal.type]||'🎯';
  let body='';
  if(goal.open){
    if(goal.type==='sched') body=buildSchedBody(tid,fid,goal,locked);
    else if(goal.type==='fin') body=buildFinBody(tid,fid,goal,locked);
    else if(goal.type==='water') body=buildWaterBody(tid,fid,goal,locked);
    else if(goal.type==='convert') body=buildConvertBody(tid,fid,goal,locked);
    else if(goal.type==='split') body=buildSplitBody(tid,fid,goal,locked);
    else if(goal.type==='interest') body=buildInterestBody(tid,fid,goal,locked);
  }
  return `<div class="panel ${GOAL_PANEL_CLASS[goal.type]||''}" data-goal-name="${esc(goal.name)}">
    <div class="p-title" style="${GOAL_TITLE_COLOR[goal.type]||''}flex-wrap:wrap;">
      <span style="display:flex;align-items:center;gap:7px;flex:1;min-width:140px;">
        <span>${icon}</span>
        <input value="${esc(goal.name)}" ${locked?'readonly':''}
          style="background:none;border:none;outline:none;font-family:var(--font);font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:inherit;flex:1;min-width:80px;border-bottom:2px solid transparent;"
          onchange="renameGoal('${tid}','${fidArg}','${goal.id}',this.value)" />
      </span>
      <span style="display:flex;gap:5px;align-items:center;">
        <button class="btn btn-icon btn-sm" title="${goal.open?'Recolher':'Expandir'}" onclick="toggleGoalOpen('${tid}','${fidArg}','${goal.id}')">${goal.open?'▾':'▸'}</button>
        ${!locked?`<button class="btn btn-icon btn-sm btn-danger" title="Remover meta" onclick="deleteGoal('${tid}','${fidArg}','${goal.id}')">✕</button>`:''}
      </span>
    </div>
    ${body}
  </div>`;
}

const SCHED_UNITS=[
  {v:'pages',l:'Páginas'},{v:'chapters',l:'Capítulos'},{v:'exercises',l:'Exercícios'},
  {v:'min',l:'Minutos'},{v:'h',l:'Horas'},{v:'videos',l:'Vídeos'},
  {v:'slides',l:'Slides'},{v:'items',l:'Itens'},{v:'custom',l:'Personalizado'},
];
const DAYS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

function buildSchedBody(tid,fid,goal,locked){
  const fidArg=fid?fid:'';
  const container=getContainer(tid,fid);
  const rd=goal.restDays??[];
  const autoTotal=sumQty(container);
  const log=goal.log??[];
  const done=schedDone(goal);
  const total=schedTotal(container,goal);
  const unit=schedUnit(goal);
  const pct=total?Math.min(100,Math.round(done/total*100)):0;
  const dis=locked?' disabled readonly':'';

  const miniBar=total>0?`<div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--tx-soft);margin-bottom:3px;">
      <span><b>${n2(done)}</b> ${unit} feitos de <b>${n2(total)}</b></span>
      <span style="font-weight:800;">${pct}%</span>
    </div>
    <div class="big-prog-bar" style="height:10px;"><div class="big-prog-fill ${pct<30?'danger':pct<65?'warning':''}" style="width:${pct}%"></div></div>
  </div>`:'';

  const logHtml=log.length?`<div class="log-list">${log.map(e=>{
    const d=new Date(e.ts);
    const ds=`${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    return `<div class="log-entry ${e.v>0?'positive':'negative'}">
      <span class="le-val">${e.v>0?'+':''}${n2(e.v)}</span>
      <span class="le-unit">${unit}</span>
      <span class="le-note">${esc(e.note||'—')}</span>
      <span class="le-date">${ds}</span>
      ${locked?'':`<button class="le-del" onclick="deleteSchedLog('${tid}','${fidArg}','${goal.id}','${e.id}')" title="Remover">✕</button>`}
    </div>`;
  }).join('')}</div>`:'<div style="font-size:12px;color:var(--tx-muted);text-align:center;padding:4px;">Nenhum registro por enquanto.</div>';

  return `
    <div style="display:flex;justify-content:flex-end;">
      <button class="btn btn-calc btn-sm" onclick="calcSched('${tid}','${fidArg}','${goal.id}')">Calcular</button>
    </div>
    ${miniBar}
    <div class="p-grid">
      <div class="p-field">
        <label>Total${autoTotal?` (auto: ${autoTotal})`:''}  </label>
        <input type="number" min="0" placeholder="auto"
          value="${esc(goal.total)}"${dis} onchange="setSchedProp('${tid}','${fidArg}','${goal.id}','total',this.value)" />
      </div>
      <div class="p-field">
        <label>Unidade</label>
        <select${dis} onchange="setSchedProp('${tid}','${fidArg}','${goal.id}','unit',this.value)">
          ${SCHED_UNITS.map(u=>`<option value="${u.v}"${goal.unit===u.v?' selected':''}>${u.l}</option>`).join('')}
        </select>
      </div>
      ${goal.unit==='custom'?`<div class="p-field">
        <label>Nome da unidade</label>
        <input type="text" placeholder="ex: lições" value="${esc(goal.unitLabel)}"${dis}
          onchange="setSchedProp('${tid}','${fidArg}','${goal.id}','unitLabel',this.value)" />
      </div>`:''}
      <div class="p-field">
        <label>Prazo</label>
        <input type="number" min="1" placeholder="ex: 7" value="${esc(goal.deadline)}"${dis}
          onchange="setSchedProp('${tid}','${fidArg}','${goal.id}','deadline',this.value)" />
      </div>
      <div class="p-field">
        <label>Período</label>
        <select${dis} onchange="setSchedProp('${tid}','${fidArg}','${goal.id}','period',this.value)">
          <option value="days"  ${goal.period==='days'  ?'selected':''}>Dias</option>
          <option value="weeks" ${goal.period==='weeks' ?'selected':''}>Semanas</option>
          <option value="months"${goal.period==='months'?'selected':''}>Meses</option>
          <option value="years" ${goal.period==='years' ?'selected':''}>Anos</option>
        </select>
      </div>
      <div class="p-field">
        <label>Sessões/dia</label>
        <input type="number" min="1" max="20" value="${goal.sessions||1}"${dis}
          onchange="setSchedProp('${tid}','${fidArg}','${goal.id}','sessions',parseInt(this.value))" />
      </div>
    </div>

    <div class="p-field">
      <label>Dias de descanso</label>
      <div class="days-row">
        ${DAYS.map((d,i)=>`<span class="day-chip${rd.includes(i)?' rest':''}"${locked?'':' onclick="toggleRestDay(\''+tid+'\',\''+fidArg+'\',\''+goal.id+'\','+i+')"'}>${d}</span>`).join('')}
        <span style="font-size:11px;color:var(--tx-muted);">${rd.length} dia(s)/sem</span>
      </div>
    </div>

    <div class="calc-result" id="res-${goal.id}"></div>

    ${locked?'':`<div class="prog-section">
      <div class="prog-section-title">Registrar progresso</div>
      <div class="log-input-row">
        <input type="number" id="log-val-${goal.id}" placeholder="ex: 25 (use − para remover)"
          step="any"
          onkeydown="if(event.key==='Enter')logProgress('${tid}','${fidArg}','${goal.id}')" />
        <input type="text" id="log-note-${goal.id}" placeholder="observação (opcional)"
          onkeydown="if(event.key==='Enter')logProgress('${tid}','${fidArg}','${goal.id}')" />
        <button class="btn btn-primary btn-sm" onclick="logProgress('${tid}','${fidArg}','${goal.id}')">Registrar</button>
      </div>
      <div style="font-size:11px;color:var(--tx-muted);">
        Use valores negativos para corrigir (ex: <b>-10</b> remove 10 ${unit} do progresso).
      </div>
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--tx-muted);margin-top:4px;">Histórico</div>
      ${logHtml}
    </div>`}
    ${locked?`<div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--tx-muted);margin-top:12px;">Histórico</div>${logHtml}`:''}`;
}

function buildFinBody(tid,fid,goal,locked){
  const fidArg=fid?fid:'';
  const log=goal.log??[];
  const balance=finBalance(goal);
  const goalVal=parseFloat(goal.goal)||0;
  const sym=goal.currency==='USD'?'US$':goal.currency==='EUR'?'€':'R$';
  const pct=goalVal?Math.min(100,Math.round(balance/goalVal*100)):0;
  const dis=locked?' disabled readonly':'';

  const miniBar=goalVal>0?`<div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--tx-soft);margin-bottom:3px;">
      <span><b>${fmtMoney(balance,sym)}</b> acumulados</span>
      <span style="font-weight:800;">${pct}%</span>
    </div>
    <div class="fin-prog-bar"><div class="fin-prog-fill" style="width:${pct}%"></div></div>
    <div style="text-align:right;font-size:11px;color:var(--tx-muted);">Meta: ${fmtMoney(goalVal,sym)}</div>
  </div>`:'';

  const finLog=log.length?`<div class="log-list">${log.map(e=>{
    const d=new Date(e.ts);
    const ds=`${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    return `<div class="fin-log-entry ${e.v>0?'positive':'negative'}">
      <span class="fle-val">${e.v>0?'+':''}${fmtMoney(Math.abs(e.v),sym)}</span>
      <span class="fle-note">${esc(e.note||'—')}</span>
      <span class="fle-date">${ds}</span>
      ${locked?'':`<button class="fle-del" onclick="deleteFinLog('${tid}','${fidArg}','${goal.id}','${e.id}')" title="Remover">✕</button>`}
    </div>`;
  }).join('')}</div>`:'<div style="font-size:12px;color:var(--tx-muted);text-align:center;padding:4px;">Nenhum registro por enquanto.</div>';

  return `
    <div style="display:flex;justify-content:flex-end;">
      <button class="btn btn-sm" style="background:var(--amber);color:var(--on-amber);border-color:var(--ink);" onclick="calcFin('${tid}','${fidArg}','${goal.id}')">Calcular</button>
    </div>
    ${miniBar}
    <div class="p-grid">
      <div class="p-field">
        <label>Meta (valor total)</label>
        <input type="number" min="0" step="any" placeholder="ex: 5000" value="${esc(goal.goal)}"${dis}
          onchange="setFinProp('${tid}','${fidArg}','${goal.id}','goal',this.value)" />
      </div>
      <div class="p-field">
        <label>Contribuição</label>
        <input type="number" min="0" step="any" placeholder="ex: 200" value="${esc(goal.amount)}"${dis}
          onchange="setFinProp('${tid}','${fidArg}','${goal.id}','amount',this.value)" />
      </div>
      <div class="p-field">
        <label>Frequência</label>
        <select${dis} onchange="setFinProp('${tid}','${fidArg}','${goal.id}','freq',this.value)">
          <option value="daily"  ${goal.freq==='daily'  ?'selected':''}>Por dia</option>
          <option value="weekly" ${goal.freq==='weekly' ?'selected':''}>Por semana</option>
          <option value="monthly"${goal.freq==='monthly'?'selected':''}>Por mês</option>
          <option value="yearly" ${goal.freq==='yearly' ?'selected':''}>Por ano</option>
        </select>
      </div>
      <div class="p-field">
        <label>Moeda</label>
        <select${dis} onchange="setFinProp('${tid}','${fidArg}','${goal.id}','currency',this.value)">
          <option value="BRL"${goal.currency==='BRL'?'selected':''}>R$ Real</option>
          <option value="USD"${goal.currency==='USD'?'selected':''}>$ Dólar</option>
          <option value="EUR"${goal.currency==='EUR'?'selected':''}>€ Euro</option>
        </select>
      </div>
    </div>

    <div class="fin-result" id="finres-${goal.id}"></div>

    ${locked?'':`<div class="prog-section">
      <div class="prog-section-title" style="color:var(--amber);">Registrar movimentação</div>
      <div class="log-input-row">
        <select id="fin-type-${goal.id}" style="background:var(--surface);border:2.5px solid var(--ink);border-radius:var(--r-md);padding:7px 10px;font-size:13px;font-family:var(--font);color:var(--tx);outline:none;box-shadow:2px 2px 0 var(--ink);">
          <option value="deposit">Depósito</option>
          <option value="withdraw">Retirada</option>
        </select>
        <input type="number" id="fin-val-${goal.id}" placeholder="valor" min="0" step="any"
          style="width:110px;"
          onkeydown="if(event.key==='Enter')logFinance('${tid}','${fidArg}','${goal.id}')" />
        <input type="text" id="fin-note-${goal.id}" placeholder="motivo (opcional)"
          onkeydown="if(event.key==='Enter')logFinance('${tid}','${fidArg}','${goal.id}')" />
        <button class="btn btn-sm" style="background:var(--amber);color:var(--on-amber);border-color:var(--ink);"
          onclick="logFinance('${tid}','${fidArg}','${goal.id}')">Registrar</button>
      </div>
      <div style="font-size:11px;color:var(--tx-muted);">
        Depósitos adicionam ao saldo; retiradas subtraem. O prazo é recalculado automaticamente.
      </div>
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--tx-muted);margin-top:4px;">Histórico</div>
      ${finLog}
    </div>`}
    ${locked?`<div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--tx-muted);margin-top:12px;">Histórico</div>${finLog}`:''}`;
}

function buildWaterBody(tid,fid,goal,locked){
  const fidArg=fid?fid:'';
  const dispUnit=goal.unit||'ml';
  const goalMl=waterGoalMl(goal);
  const doneMl=waterDoneMl(goal);
  const slotsTotalMl=waterSlotsTotalMl(goal);
  const pct=goalMl?Math.min(100,Math.round(doneMl/goalMl*100)):0;
  const dis=locked?' disabled readonly':'';
  const slots=goal.slots??[];
  const today=waterTodayKey();
  const todayLog=(goal.log??[]).filter(e=>waterLogDay(e)===today);
  const startTime=goal.startTime||'07:00', endTime=goal.endTime||'22:00';

  const miniBar=goalMl>0?`<div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--tx-soft);margin-bottom:3px;">
      <span><b>${waterFmt(doneMl,dispUnit)}</b> de <b>${waterFmt(goalMl,dispUnit)}</b> hoje</span>
      <span style="font-weight:800;">${pct}%</span>
    </div>
    <div class="water-prog-bar"><div class="water-prog-fill ${pct<30?'danger':pct<65?'warning':''}" style="width:${pct}%"></div></div>
  </div>`:'';

  const slotsMatch=goalMl>0&&slots.length>0
    ?Math.abs(slotsTotalMl-goalMl)<1
      ?`<span class="water-sum-ok">✓ Horários somam ${waterFmt(slotsTotalMl,dispUnit)}</span>`
      :`<span class="water-sum-warn">⚠ Horários: ${waterFmt(slotsTotalMl,dispUnit)} · Meta: ${waterFmt(goalMl,dispUnit)}</span>`
    :'';

  const slotsHtml=slots.length?slots.map(s=>{
    const done=isSlotDoneToday(goal,s.id);
    const amtLabel=s.unit==='L'?`${esc(s.amount)} L`:`${esc(s.amount)} ml`;
    return `<div class="water-slot ${done?'done':''}">
      <input type="time" class="ws-time" value="${esc(s.time)}"${dis}
        onchange="updateWaterSlot('${tid}','${fidArg}','${goal.id}','${s.id}','time',this.value)" />
      <span class="ws-amt">${amtLabel}</span>
      ${locked?'':`<button class="btn btn-sm ${done?'btn-primary':''}" onclick="toggleWaterSlotDone('${tid}','${fidArg}','${goal.id}','${s.id}')">${done?'✓ Bebi':'Bebi'}</button>
      <button class="btn btn-icon btn-sm btn-danger" onclick="deleteWaterSlot('${tid}','${fidArg}','${goal.id}','${s.id}')" title="Remover">✕</button>`}
    </div>`;
  }).join(''):'<div style="font-size:12px;color:var(--tx-muted);text-align:center;padding:6px;">Nenhum horário definido.</div>';

  const logHtml=todayLog.length?`<div class="log-list">${todayLog.map(e=>{
    const d=new Date(e.ts);
    const ds=`${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    const sign=e.v>=0?'+':'';
    return `<div class="log-entry ${e.v>0?'positive':'negative'}">
      <span class="le-val">${sign}${waterFmt(Math.abs(e.v),dispUnit)}</span>
      <span class="le-note">${esc(e.note||'—')}</span>
      <span class="le-date">${ds}</span>
      ${locked?'':`<button class="le-del" onclick="deleteWaterLog('${tid}','${fidArg}','${goal.id}','${e.id}')" title="Remover">✕</button>`}
    </div>`;
  }).join('')}</div>`:'<div style="font-size:12px;color:var(--tx-muted);text-align:center;padding:4px;">Nenhum registro hoje.</div>';

  return `
    ${miniBar}

    <div class="p-grid">
      <div class="p-field">
        <label>Meta diária</label>
        <input type="number" min="0" step="any" placeholder="ex: 2000 ou 2" value="${esc(goal.goal)}"${dis}
          onchange="setWaterProp('${tid}','${fidArg}','${goal.id}','goal',this.value)" />
      </div>
      <div class="p-field">
        <label>Unidade da meta</label>
        <select${dis} onchange="setWaterProp('${tid}','${fidArg}','${goal.id}','unit',this.value)">
          <option value="ml"${dispUnit==='ml'?' selected':''}>Mililitros (ml)</option>
          <option value="L"${dispUnit==='L'?' selected':''}>Litros (L)</option>
        </select>
      </div>
      <div class="p-field">
        <label>Início dos lembretes</label>
        <input type="time" value="${esc(startTime)}"${dis}
          onchange="setWaterProp('${tid}','${fidArg}','${goal.id}','startTime',this.value)" />
      </div>
      <div class="p-field">
        <label>Término dos lembretes</label>
        <input type="time" value="${esc(endTime)}"${dis}
          onchange="setWaterProp('${tid}','${fidArg}','${goal.id}','endTime',this.value)" />
      </div>
    </div>
    <div style="font-size:11px;color:var(--tx-muted);">Todos os horários (automáticos ou manuais) ficam restritos ao intervalo entre <b>${esc(startTime)}</b> e <b>${esc(endTime)}</b>.</div>

    ${locked?'':`<div class="water-divide-row">
      <label>Dividir meta em</label>
      <input type="number" id="ws-div-n-${goal.id}" min="1" max="24" value="8" style="width:56px;" />
      <span>horários</span>
      <button class="btn btn-sm water-btn" onclick="divideWaterGoal('${tid}','${fidArg}','${goal.id}')">Dividir meta</button>
    </div>`}

    <div class="water-slots-head">
      <span>Horários do dia</span>
      ${slotsMatch}
    </div>
    <div class="water-slots">${slotsHtml}</div>

    ${locked?'':`<div class="water-add-row">
      <input type="time" id="ws-time-${goal.id}" value="${esc(startTime)}" min="${esc(startTime)}" max="${esc(endTime)}" />
      <input type="number" id="ws-amt-${goal.id}" min="0" step="any" placeholder="qtd" style="width:80px;" />
      <select id="ws-unit-${goal.id}">
        <option value="ml">ml</option>
        <option value="L">L</option>
      </select>
      <button class="btn btn-sm water-btn" onclick="addWaterSlot('${tid}','${fidArg}','${goal.id}')">+ Horário</button>
    </div>`}

    ${locked?'':`<div class="prog-section">
      <div class="prog-section-title" style="color:#2b7cd3;">Registro extra</div>
      <div class="log-input-row">
        <input type="number" id="ww-val-${goal.id}" placeholder="qtd" step="any" style="width:90px;" />
        <select id="ww-unit-${goal.id}">
          <option value="ml">ml</option>
          <option value="L">L</option>
        </select>
        <input type="text" id="ww-note-${goal.id}" placeholder="observação (opcional)" />
        <button class="btn btn-sm water-btn" onclick="logWaterExtra('${tid}','${fidArg}','${goal.id}')">Registrar</button>
      </div>
      <div style="font-size:11px;color:var(--tx-muted);">Use para copos extras fora dos horários planejados.</div>
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--tx-muted);margin-top:4px;">Histórico de hoje</div>
      ${logHtml}
    </div>`}
    ${locked?`<div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--tx-muted);margin-top:12px;">Histórico de hoje</div>${logHtml}`:''}`;
}

function buildConvertBody(tid,fid,goal,locked){
  const fidArg=fid?fid:'';
  const dis=locked?' disabled':'';
  return `
    <div class="p-grid">
      <div class="p-field"><label>Valor</label>
        <input type="number" min="0" step="any" value="${esc(goal.amount)}"${dis}
          onchange="setFinProp('${tid}','${fidArg}','${goal.id}','amount',this.value)" placeholder="ex: 100" />
      </div>
      <div class="p-field"><label>De</label>
        <select${dis} onchange="setFinProp('${tid}','${fidArg}','${goal.id}','from',this.value)">
          ${['BRL','USD','EUR'].map(c=>`<option value="${c}"${goal.from===c?' selected':''}>${CURRENCY_SYMBOL[c]} ${c==='BRL'?'Real':c==='USD'?'Dólar':'Euro'}</option>`).join('')}
        </select>
      </div>
      <div class="p-field"><label>Para</label>
        <select${dis} onchange="setFinProp('${tid}','${fidArg}','${goal.id}','to',this.value)">
          ${['USD','BRL','EUR'].map(c=>`<option value="${c}"${goal.to===c?' selected':''}>${CURRENCY_SYMBOL[c]} ${c==='BRL'?'Real':c==='USD'?'Dólar':'Euro'}</option>`).join('')}
        </select>
      </div>
    </div>
    ${locked?'':`<button class="btn btn-sm" style="background:var(--amber);color:var(--on-amber);border-color:var(--ink);margin-top:8px;" onclick="convertCurrency('${tid}','${fidArg}','${goal.id}')">Converter</button>`}
    <div class="fin-result" id="cvt-res-${goal.id}"></div>`;
}

function buildSplitBody(tid,fid,goal,locked){
  const fidArg=fid?fid:'';
  const dis=locked?' disabled':'';
  return `
    <div class="p-grid">
      <div class="p-field"><label>Valor final desejado</label>
        <input type="number" min="0" step="any" value="${esc(goal.total)}"${dis}
          onchange="setFinProp('${tid}','${fidArg}','${goal.id}','total',this.value)" placeholder="ex: 3000" />
      </div>
      <div class="p-field"><label>Participantes</label>
        <input type="number" min="1" step="1" value="${esc(goal.people)}"${dis}
          onchange="setFinProp('${tid}','${fidArg}','${goal.id}','people',this.value)" placeholder="ex: 3" />
      </div>
      <div class="p-field"><label>Período (meses)</label>
        <input type="number" min="1" step="1" value="${esc(goal.months)}"${dis}
          onchange="setFinProp('${tid}','${fidArg}','${goal.id}','months',this.value)" placeholder="ex: 6" />
      </div>
    </div>
    ${locked?'':`<button class="btn btn-sm" style="background:var(--amber);color:var(--on-amber);border-color:var(--ink);margin-top:8px;" onclick="calcSplit('${tid}','${fidArg}','${goal.id}')">Calcular divisão</button>`}
    <div class="fin-result" id="spl-res-${goal.id}"></div>`;
}

function buildInterestBody(tid,fid,goal,locked){
  const fidArg=fid?fid:'';
  const dis=locked?' disabled':'';
  return `
    <div class="p-grid">
      <div class="p-field"><label>Capital inicial</label>
        <input type="number" min="0" step="any" value="${esc(goal.capital)}"${dis}
          onchange="setFinProp('${tid}','${fidArg}','${goal.id}','capital',this.value)" placeholder="ex: 1000" />
      </div>
      <div class="p-field"><label>Taxa de juros (% por período)</label>
        <input type="number" step="any" value="${esc(goal.rate)}"${dis}
          onchange="setFinProp('${tid}','${fidArg}','${goal.id}','rate',this.value)" placeholder="ex: 1.5" />
      </div>
      <div class="p-field"><label>Período (nº de vezes)</label>
        <input type="number" min="1" step="any" value="${esc(goal.period)}"${dis}
          onchange="setFinProp('${tid}','${fidArg}','${goal.id}','period',this.value)" placeholder="ex: 12" />
      </div>
      <div class="p-field"><label>Tipo</label>
        <select${dis} onchange="setFinProp('${tid}','${fidArg}','${goal.id}','mode',this.value)">
          <option value="simple"${goal.mode==='simple'?' selected':''}>Juros simples</option>
          <option value="compound"${goal.mode==='compound'?' selected':''}>Juros compostos</option>
        </select>
      </div>
    </div>
    ${locked?'':`<button class="btn btn-sm" style="background:var(--amber);color:var(--on-amber);border-color:var(--ink);margin-top:8px;" onclick="calcInterest('${tid}','${fidArg}','${goal.id}')">Calcular</button>`}
    <div class="fin-result" id="int-res-${goal.id}"></div>`;
}
