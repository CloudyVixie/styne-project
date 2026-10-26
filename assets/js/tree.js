function getTrail(tid){ return S.trails.find(t=>t.id===tid)??null; }

function getFolder(tid, fid){
  const trail=getTrail(tid); if(!trail) return null;
  return (trail.folders??[]).find(f=>f.id===fid)??null;
}

function getContainer(tid, fid){
  return fid ? getFolder(tid,fid) : getTrail(tid);
}

function findItem(tid, fid, iid){
  const c=getContainer(tid,fid); if(!c) return null;
  return (c.items??[]).find(i=>i.id===iid)??null;
}

function findGoal(tid, fid, gid){
  const c=getContainer(tid,fid); if(!c) return null;
  return (c.goals??[]).find(g=>g.id===gid)??null;
}

function countItems(container){
  let t=0,d=0;
  for(const i of container?.items??[]){ t++; if(i.done) d++; }
  return {t,d};
}

function countTrailItems(trail){
  let t=0,d=0;
  const own=countItems(trail); t+=own.t; d+=own.d;
  for(const f of trail?.folders??[]){ const s=countItems(f); t+=s.t; d+=s.d; }
  return {t,d};
}

function sumQty(container){
  let s=0;
  for(const i of container?.items??[]) s+=parseFloat(i.qty)||0;
  return s;
}
