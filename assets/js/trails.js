const TRAIL_ICONS=['📚','🎯','💡','🔬','💻','🏆','📝','⚡','🌍','⚗️','🎨','🏫','💰','🚀','🎵'];
let _tIcon='📚';

function openNewTrailModal(){
  document.getElementById('mt-name').value='';
  _tIcon='📚';
  buildIconGrid('mt-icons',TRAIL_ICONS,'📚',v=>{_tIcon=v;});
  openModal('modal-trail');
  setTimeout(()=>document.getElementById('mt-name').focus(),60);
}

function createTrail(){
  const name=document.getElementById('mt-name').value.trim();
  if(!name){showToast('Toda trilha precisa de um nome', 'error');return;}
  const trail={id:uid(),name,icon:_tIcon,locked:false,folders:[],items:[],goals:[]};
  S.trails.push(trail); S.active=trail.id;
  closeModal('modal-trail'); commit();
  showToast(`Trilha "${name}" criada!`, 'success');
}

function selectTrail(tid){ S.active=tid; renderSidebar(); renderTrail(tid); }

function deleteTrail(tid){
  if(!confirm('Deletar esta trilha e todo conteúdo?')) return;
  S.trails=S.trails.filter(t=>t.id!==tid);
  if(S.active===tid) S.active=S.trails[0]?.id??null;
  commit(); showToast('Trilha removida.', 'success');
}

function renameTrail(tid,v){ const t=getTrail(tid); if(t&&v.trim()){t.name=v.trim();save();renderSidebar();} }

function toggleLock(tid){
  const t=getTrail(tid); if(!t) return;
  t.locked=!t.locked; commit();
  showToast(t.locked?'Trilha bloqueada.':'Trilha desbloqueada.', 'info');
}
