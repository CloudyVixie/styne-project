function setSchedProp(tid,fid,gid,prop,val){
  const trail=getTrail(tid); if(trail?.locked) return;
  const g=findGoal(tid,fid,gid); if(!g) return;
  g[prop]=val; save();
  if(prop==='unit') renderTrail(tid);
}
function toggleRestDay(tid,fid,gid,day){
  const trail=getTrail(tid); if(trail?.locked) return;
  const g=findGoal(tid,fid,gid); if(!g) return;
  g.restDays=g.restDays??[];
  const idx=g.restDays.indexOf(day);
  if(idx>-1) g.restDays.splice(idx,1); else g.restDays.push(day);
  save(); renderTrail(tid);
}

function schedUnitRaw(s){
  const m={pages:'pág',chapters:'cap',exercises:'ex',min:'min',h:'h',videos:'vídeos',slides:'sl',items:'itens'};
  return s.unit==='custom'?(s.unitLabel||'itens'):(m[s.unit]||s.unit||'itens');
}
function schedUnit(s){
  return esc(schedUnitRaw(s));
}
function schedTotal(container,goal){ return parseFloat(goal.total)||sumQty(container)||0; }
function schedDone(goal){ return (goal.log??[]).reduce((a,e)=>a+(parseFloat(e.v)||0),0); }

function coreCalc(remaining,deadline,period,sessions,restDays){
  let totalDays=parseFloat(deadline)||0;
  if(period==='weeks')  totalDays*=7;
  if(period==='months') totalDays*=30;
  if(period==='years')  totalDays*=365;
  const restPerWeek=(restDays??[]).length;
  const activeDays=Math.max(1,Math.round(totalDays-(totalDays/7)*restPerWeek));
  const weeks=Math.max(1,Math.ceil(totalDays/7));
  const perDay=remaining>0?Math.ceil(remaining/activeDays):0;
  const perSess=Math.ceil(perDay/Math.max(1,sessions||1));
  const perWeek=Math.ceil(remaining/weeks);
  return {remaining,totalDays,activeDays,weeks,perDay,perSess,perWeek,restPerWeek};
}

function calcSched(tid,fid,gid){
  const container=getContainer(tid,fid); if(!container) return;
  const g=findGoal(tid,fid,gid); if(!g) return;
  const total=schedTotal(container,g);
  const done=schedDone(g);
  const remaining=Math.max(0,total-done);
  if(!total||!g.deadline){showToast('Preencha total e prazo', 'error');return;}

  const r=coreCalc(remaining,g.deadline,g.period,g.sessions,g.restDays);
  const rOrig=coreCalc(total,g.deadline,g.period,g.sessions,g.restDays);
  const unit=schedUnit(g);
  const pct=Math.min(100,Math.round(total>0?done/total*100:0));

  let pdLabel=`${n2(r.perDay)} ${unit}`;
  if(g.unit==='min'&&r.perDay>=60) pdLabel=`${n2(r.perDay/60)}h (${n2(r.perDay)} min)`;

  const pal=['#ffb347','#87ceeb','#98d4a3','#f7a7c0','#c5aef5','#f5e472','#aed9f5','#f5b8a0'];
  let wBar='',rem2=remaining;
  for(let w=0;w<r.weeks&&rem2>0;w++){
    const seg=Math.min(r.perWeek,rem2); rem2-=seg;
    wBar+=`<div class="week-seg" style="background:${pal[w%pal.length]};" title="Sem.${w+1}: ${n2(seg)} ${unit}">${n2(seg)}</div>`;
  }

  const statusClass=r.perDay<=rOrig.perDay?'ahead':(r.perDay>rOrig.perDay*1.15?'behind':'');
  const statusMsg=remaining===0?'✅ Meta concluída!'
    :r.perDay<rOrig.perDay?`🟢 Adiantado! Meta era ${n2(rOrig.perDay)} ${unit}/dia`
    :r.perDay>rOrig.perDay*1.15?`🔴 Precisa acelerar: ${n2(r.perDay)} ${unit}/dia (era ${n2(rOrig.perDay)})`
    :`🟡 No ritmo: ${n2(r.perDay)} ${unit}/dia`;

  const resEl=document.getElementById('res-'+gid);
  if(!resEl) return;
  resEl.innerHTML=`
    <div class="big-prog">
      <div class="big-prog-nums">
        <span><span class="done-val">${n2(done)}</span> ${unit} feitos</span>
        <span class="left-val">${n2(remaining)} restam</span>
      </div>
      <div class="big-prog-bar"><div class="big-prog-fill ${pct<30?'danger':pct<65?'warning':''}" style="width:${pct}%"></div></div>
      <div class="big-prog-nums"><span style="font-size:11px;font-weight:800;">${pct}% concluído</span><span style="font-size:11px;color:var(--tx-muted);">${n2(total)} ${unit} no total</span></div>
    </div>
    ${remaining>0?`<div class="recalc-block ${statusClass}">
      <div class="rb-title">⚡ Meta recalculada com base no que falta</div>
      <div class="rb-grid">
        <div class="rb-item"><div class="rb-val">${pdLabel}</div><div class="rb-label">por dia</div></div>
        <div class="rb-item"><div class="rb-val">${n2(r.perSess)} ${unit}</div><div class="rb-label">por sessão</div></div>
        <div class="rb-item"><div class="rb-val">${r.activeDays}</div><div class="rb-label">dias ativos</div></div>
        <div class="rb-item"><div class="rb-val">${r.weeks}</div><div class="rb-label">semanas</div></div>
      </div>
      <div style="margin-top:8px;font-size:11px;color:rgba(255,255,255,.65);">${statusMsg}</div>
    </div>`:'<div style="text-align:center;font-size:22px;padding:8px;">✅ Meta concluída!</div>'}
    ${r.weeks>1&&remaining>0?`<div class="weeks-bar">${wBar}</div>`:''}`;
  resEl.classList.add('visible');
}

function logProgress(tid,fid,gid){
  const trail=getTrail(tid); if(trail?.locked) return;
  const g=findGoal(tid,fid,gid); if(!g) return;
  const container=getContainer(tid,fid); if(!container) return;
  const valEl=document.getElementById('log-val-'+gid);
  const noteEl=document.getElementById('log-note-'+gid);
  const raw=valEl?.value.trim();
  if(!raw||isNaN(parseFloat(raw))){showToast('Informe uma quantidade válida', 'error');return;}
  const v=parseFloat(raw);
  if(v===0){showToast('Informe uma quantidade diferente de zero', 'error');return;}
  const note=noteEl?.value.trim()||'';
  const total=schedTotal(container,g);
  g.log=g.log??[];
  g.log.unshift({id:uid(),v,note,ts:Date.now()});
  if(valEl) valEl.value='';
  if(noteEl) noteEl.value='';
  const done=schedDone(g);
  const unit=schedUnitRaw(g);
  save(); renderTrail(tid);
  setTimeout(()=>calcSched(tid,fid,gid),80);
  showToast(`${v>0?'+':''}${v} ${unit} registrado!${done>=total?' Meta atingida!':''}`, 'success');
}

function deleteSchedLog(tid,fid,gid,eid){
  const trail=getTrail(tid); if(trail?.locked) return;
  const g=findGoal(tid,fid,gid); if(!g) return;
  g.log=(g.log??[]).filter(e=>e.id!==eid);
  save(); renderTrail(tid); setTimeout(()=>calcSched(tid,fid,gid),80);
}
