const NODE_ICONS=['📁','📂','📖','📚','🔬','💻','✏️','🎯','💡','⚗️','📐','🧪','📝','🗂️','📌'];
let _nIcon='📁', _nTrail=null;

function openAddNode(tid){
  const trail=getTrail(tid); if(trail?.locked) return;
  _nTrail=tid; _nIcon='📁';
  document.getElementById('mn-name').value='';
  buildIconGrid('mn-icons',NODE_ICONS,'📁',v=>{_nIcon=v;});
  openModal('modal-node');
  setTimeout(()=>document.getElementById('mn-name').focus(),60);
}

function createNode(){
  const name=document.getElementById('mn-name').value.trim();
  if(!name){showToast('Toda pasta precisa de um nome', 'error');return;}
  const trail=getTrail(_nTrail); if(!trail) return;

  const folder={
    id:uid(),name,icon:_nIcon,colorIdx:(trail.folders?.length??0)%8,open:true,
    items:[],goals:[]
  };
  trail.folders=trail.folders??[]; trail.folders.push(folder);

  closeModal('modal-node'); commit();
}

function deleteNode(tid,fid){
  const trail=getTrail(tid); if(trail?.locked) return;
  if(!confirm('Deletar esta pasta e todo conteúdo?')) return;
  trail.folders=(trail.folders??[]).filter(f=>f.id!==fid);
  commit(); showToast('Pasta removida.', 'success');
}

function toggleNode(tid,fid){ const f=getFolder(tid,fid); if(f){f.open=!f.open;save();renderTrail(tid);} }

function renameNode(tid,fid,v){ const f=getFolder(tid,fid); if(f&&v.trim()){f.name=v.trim();save();} }
