# assets/js/trails.js

assets/js/trails.js
   Ações CRUD de trilhas (container principal).

   A partir da v5, a trilha também é um "container": pode ter
   items[] e goals[] diretamente na raiz, além de folders[] (pastas
   de nível único, sem subpastas).

   Funções:
   - openNewTrailModal()     → abre modal de criação
   - createTrail()           → cria e salva nova trilha
   - selectTrail(tid)        → define trilha ativa e renderiza
   - deleteTrail(tid)        → remove trilha com confirmação
   - renameTrail(tid, v)     → renomeia inline (onchange)
   - toggleLock(tid)         → alterna modo bloqueado
