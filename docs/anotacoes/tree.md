# assets/js/tree.js

assets/js/tree.js
   Buscas e contagens na estrutura (agora não-recursiva).

   Estrutura de dados a partir da v5:
   Trail → [Folder] (apenas raiz, sem subpastas)
   Trail e Folder são ambos "containers": possuem items[] e goals[].

   Funções:
   - getTrail(tid)                → Trail ou null
   - getFolder(tid, fid)          → Folder ou null
   - getContainer(tid, fid)       → Trail (fid=null) ou Folder
   - findItem(tid, fid, iid)      → Item
   - findGoal(tid, fid, gid)      → Goal
   - countItems(container)        → { t: total, d: done } (não-recursivo)
   - countTrailItems(trail)       → soma trilha + todas as pastas
   - sumQty(container)            → soma numérica de qty dos itens do container
