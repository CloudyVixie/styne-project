function addItem(tid,fid,inputId){
  const trail=getTrail(tid); if(trail?.locked) return;
  const inp=document.getElementById(inputId); if(!inp) return;
  const name=inp.value.trim(); if(!name) return;
  const c=getContainer(tid,fid); if(!c) return;
  c.items=c.items??[];
  c.items.push({id:uid(),name,done:false,qty:'',unit:''});
  inp.value=''; commit();
}

function toggleItem(tid,fid,iid){
  const trail=getTrail(tid); if(trail?.locked) return;
  const item=findItem(tid,fid,iid);
  if(item){item.done=!item.done;commit();}
}

function renameItem(tid,fid,iid,v){
  const trail=getTrail(tid); if(trail?.locked) return;
  const item=findItem(tid,fid,iid);
  if(item&&v.trim()){item.name=v.trim();save();}
}

function deleteItem(tid,fid,iid){
  const trail=getTrail(tid); if(trail?.locked) return;
  const c=getContainer(tid,fid); if(!c) return;
  c.items=c.items??[];
  const idx=c.items.findIndex(i=>i.id===iid);
  if(idx===-1) return;
  const [removed]=c.items.splice(idx,1);
  commit();

  commitReversible('excluir-tarefa', {
    undo: ()=>{
      const cc=getContainer(tid,fid); if(!cc) return;
      cc.items=cc.items??[];
      const at=Math.min(idx,cc.items.length);
      cc.items.splice(at,0,removed);
      commit();
    },
    redo: ()=>{
      const cc=getContainer(tid,fid); if(!cc) return;
      cc.items=(cc.items??[]).filter(i=>i.id!==iid);
      commit();
    },
  }, `Tarefa "${removed.name}" excluída.`);
}

function editQty(tid,fid,iid){
  const trail=getTrail(tid); if(trail?.locked) return;
  const item=findItem(tid,fid,iid); if(!item) return;
  const qty=prompt(`Quantidade para "${item.name}":\n(número, ex: 50)`,item.qty||'');
  if(qty===null) return;
  const unit=prompt('Unidade (ex: pág, min, h, cap, ex, vídeos):',item.unit||'');
  if(unit===null) return;
  item.qty=parseFloat(qty)||''; item.unit=unit.trim(); commit();
}
