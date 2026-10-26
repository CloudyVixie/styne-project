function setFinProp(tid,fid,gid,prop,val){
  const trail=getTrail(tid); if(trail?.locked) return;
  const g=findGoal(tid,fid,gid); if(!g) return;
  g[prop]=val; save();
}

function finBalance(goal){ return (goal.log??[]).reduce((a,e)=>a+(parseFloat(e.v)||0),0); }

function calcFin(tid,fid,gid){
  const g=findGoal(tid,fid,gid); if(!g) return;
  const goal=parseFloat(g.goal)||0;
  const amount=parseFloat(g.amount)||0;
  const resEl=document.getElementById('finres-'+gid);
  if(!resEl) return;
  if(!goal||!amount){showToast('Preencha meta e contribuição', 'error');return;}

  const sym=g.currency==='USD'?'US$':g.currency==='EUR'?'€':'R$';
  const freqMult={daily:30,weekly:4.33,monthly:1,yearly:1/12};
  const monthly=amount*(freqMult[g.freq]??1);
  const balance=finBalance(g);
  const remaining=Math.max(0,goal-balance);
  const pct=Math.min(100,Math.round(goal>0?balance/goal*100:0));
  const freqLabel={daily:'dia',weekly:'semana',monthly:'mês',yearly:'ano'}[g.freq]||'mês';

  const fmt=m=>m<1?`${Math.round(m*30)} dias`:m<24?`${n2(m)} meses`:`${n2(m/12)} anos`;
  const monthsLeft=remaining/monthly;
  const monthsOrig=goal/monthly;

  resEl.innerHTML=`
    <div>
      <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:var(--tx-soft);margin-bottom:4px;">
        <span>${fmtMoney(balance,sym)} acumulados</span>
        <span>${fmtMoney(remaining,sym)} faltam</span>
      </div>
      <div class="fin-prog-bar"><div class="fin-prog-fill" style="width:${pct}%"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--tx-muted);margin-top:3px;">
        <span><b>${pct}%</b> da meta</span><span>Meta: ${fmtMoney(goal,sym)}</span>
      </div>
    </div>
    ${remaining>0?`<div style="text-align:center;padding:6px 0;">
      <span class="fr-big">${fmt(monthsLeft)}</span>
      para a meta com ${fmtMoney(remaining,sym)} restando<br>
      guardando ${fmtMoney(amount,sym)}/${freqLabel}
      <span style="display:block;font-size:11px;color:var(--tx-muted);margin-top:3px;">≈ ${fmtMoney(monthly,sym)}/mês · prazo original: ${fmt(monthsOrig)}</span>
    </div>`:'<div style="text-align:center;font-size:22px;padding:8px;">Meta financeira atingida!</div>'}`;
  resEl.classList.add('visible');
}

function logFinance(tid,fid,gid){
  const trail=getTrail(tid); if(trail?.locked) return;
  const g=findGoal(tid,fid,gid); if(!g) return;
  const valEl=document.getElementById('fin-val-'+gid);
  const noteEl=document.getElementById('fin-note-'+gid);
  const typeEl=document.getElementById('fin-type-'+gid);
  const rawStr=valEl?.value.trim();
  if(!rawStr||isNaN(parseFloat(rawStr))){showToast('Informe um valor válido', 'error');return;}
  const raw=parseFloat(rawStr);
  if(raw===0){showToast('Informe um valor diferente de zero', 'error');return;}
  const type=typeEl?.value||'deposit';
  const v=type==='withdraw'?-Math.abs(raw):Math.abs(raw);
  const note=noteEl?.value.trim()||'';
  const sym=g.currency==='USD'?'US$':g.currency==='EUR'?'€':'R$';
  g.log=g.log??[];
  g.log.unshift({id:uid(),v,note,ts:Date.now()});
  if(valEl) valEl.value='';
  if(noteEl) noteEl.value='';
  const bal=finBalance(g);
  const goal=parseFloat(g.goal)||0;
  save(); renderTrail(tid);
  setTimeout(()=>calcFin(tid,fid,gid),80);
  showToast(`${v>0?'Depósito':'Retirada'}: ${fmtMoney(Math.abs(v),sym)}${bal>=goal&&goal?' — Meta atingida!':''}`, 'success');
}

function deleteFinLog(tid,fid,gid,eid){
  const trail=getTrail(tid); if(trail?.locked) return;
  const g=findGoal(tid,fid,gid); if(!g) return;
  g.log=(g.log??[]).filter(e=>e.id!==eid);
  save(); renderTrail(tid); setTimeout(()=>calcFin(tid,fid,gid),80);
}

const EXCHANGE_RATES = {
  BRL: 1,
  USD: 1/5.30,
  EUR: 1/5.75,
};
const CURRENCY_SYMBOL = {BRL:'R$',USD:'US$',EUR:'€'};

function convertCurrency(tid,fid,gid){
  const g=findGoal(tid,fid,gid); if(!g) return;
  const resEl=document.getElementById('cvt-res-'+gid); if(!resEl) return;
  const amt=parseFloat(g.amount);
  if(isNaN(amt)){showToast('Informe um valor válido', 'error');return;}
  const from=g.from||'BRL', to=g.to||'USD';
  const inBrl=amt/EXCHANGE_RATES[from];
  const result=inBrl*EXCHANGE_RATES[to];
  resEl.innerHTML=`<span class="fr-big">${fmtMoney(result,CURRENCY_SYMBOL[to])}</span>
    <span style="display:block;font-size:11px;color:var(--tx-muted);margin-top:3px;">${fmtMoney(amt,CURRENCY_SYMBOL[from])} · cotação estimada, não em tempo real</span>`;
  resEl.classList.add('visible');
}

function calcSplit(tid,fid,gid){
  const g=findGoal(tid,fid,gid); if(!g) return;
  const resEl=document.getElementById('spl-res-'+gid); if(!resEl) return;
  const total=parseFloat(g.total);
  const people=parseInt(g.people);
  const months=parseInt(g.months);
  if(!total||total<=0){showToast('Informe o valor final desejado', 'error');return;}
  if(!people||people<1){showToast('Informe a quantidade de participantes', 'error');return;}
  if(!months||months<1){showToast('Informe o período em meses', 'error');return;}
  const perPersonTotal=total/people;
  const perPersonMonthly=perPersonTotal/months;
  resEl.innerHTML=`<span class="fr-big">${fmtMoney(perPersonMonthly)}</span>
    <span style="display:block;font-size:12px;color:var(--tx-soft);margin-top:2px;">por participante, por mês</span>
    <span style="display:block;font-size:11px;color:var(--tx-muted);margin-top:5px;">
      ${people} participante(s) · ${months} mês(es) · ${fmtMoney(perPersonTotal)} por pessoa no total · ${fmtMoney(total)} no total geral
    </span>`;
  resEl.classList.add('visible');
}

function calcInterest(tid,fid,gid){
  const g=findGoal(tid,fid,gid); if(!g) return;
  const resEl=document.getElementById('int-res-'+gid); if(!resEl) return;
  const capital=parseFloat(g.capital);
  const ratePct=parseFloat(g.rate);
  const n=parseFloat(g.period);
  const mode=g.mode||'simple';
  if(!capital||capital<=0){showToast('Informe o capital inicial', 'error');return;}
  if(isNaN(ratePct)){showToast('Informe a taxa de juros', 'error');return;}
  if(!n||n<=0){showToast('Informe o período', 'error');return;}
  const i=ratePct/100;
  const montante = mode==='compound' ? capital*Math.pow(1+i,n) : capital*(1+i*n);
  const juros = montante-capital;
  resEl.innerHTML=`
    <div class="res-grid">
      <div class="res-card"><div class="rc-val">${fmtMoney(montante)}</div><div class="rc-label">Montante final</div></div>
      <div class="res-card"><div class="rc-val">${fmtMoney(juros)}</div><div class="rc-label">Juros obtidos</div></div>
    </div>
    <div style="text-align:center;font-size:11px;color:var(--tx-muted);margin-top:6px;">
      Juros ${mode==='compound'?'compostos':'simples'} · capital ${fmtMoney(capital)} · taxa ${n2(ratePct)}% por período · ${n2(n)} período(s)
    </div>`;
  resEl.classList.add('visible');
}
