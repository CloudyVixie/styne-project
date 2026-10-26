const GOAL_LABELS={
  sched:'Cronograma', fin:'Meta financeira', water:'Hidratação',
  convert:'Conversor de moedas', split:'Divisor de valores', interest:'Calculadora de juros',
};
const FIN_TYPES=['fin','convert','split','interest'];

function defaultGoal(type){
  const base={id:uid(),type,name:GOAL_LABELS[type]||'Meta',open:true};
  if(type==='sched')    return {...base,total:'',unit:'pages',unitLabel:'',deadline:'',period:'days',sessions:1,restDays:[],log:[]};
  if(type==='fin')      return {...base,goal:'',amount:'',freq:'monthly',currency:'BRL',log:[]};
  if(type==='water')    return {...base,goal:'',unit:'ml',slots:[],log:[],startTime:'07:00',endTime:'22:00'};
  if(type==='convert')  return {...base,amount:'',from:'BRL',to:'USD'};
  if(type==='split')    return {...base,total:'',people:'',months:''};
  if(type==='interest') return {...base,capital:'',rate:'',period:'',mode:'simple'};
  return base;
}

function addGoal(tid,fid,type){
  const trail=getTrail(tid); if(trail?.locked) return;
  const c=getContainer(tid,fid); if(!c) return;
  c.goals=c.goals??[];
  const sameType=c.goals.filter(g=>g.type===type).length;
  const g=defaultGoal(type);
  if(sameType>0) g.name=`${GOAL_LABELS[type]} ${sameType+1}`;
  c.goals.push(g);
  commit();
  showToast(`${GOAL_LABELS[type]||'Meta'} adicionada!`, 'success');
}

function addFinInstance(tid,fid,type){
  closeFinFan(tid,fid);
  addGoal(tid,fid,type);
}

function deleteGoal(tid,fid,gid){
  const trail=getTrail(tid); if(trail?.locked) return;
  const c=getContainer(tid,fid); if(!c) return;
  if(!confirm('Remover esta meta e todo o histórico dela?')) return;
  c.goals=(c.goals??[]).filter(g=>g.id!==gid);
  commit(); showToast('Meta removida.', 'success');
}

function toggleGoalOpen(tid,fid,gid){
  const g=findGoal(tid,fid,gid); if(g){g.open=!g.open;save();renderTrail(tid);}
}

function renameGoal(tid,fid,gid,v){
  const g=findGoal(tid,fid,gid); if(g&&v.trim()){g.name=v.trim();save();}
}
