# assets/js/schedule.js

assets/js/schedule.js
   Cálculo de cronograma + progresso adaptativo.
   Cada meta de cronograma é um objeto independente (goal), então
   uma trilha ou pasta pode ter quantos cronogramas quiser.

   Funções:
   - setSchedProp(tid,fid,gid,prop,val)
   - toggleRestDay(tid,fid,gid,day)
   - calcSched(tid,fid,gid)
   - logProgress(tid,fid,gid)
   - deleteSchedLog(tid,fid,gid,eid)
