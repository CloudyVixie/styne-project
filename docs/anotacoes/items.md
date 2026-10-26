# assets/js/items.js

assets/js/items.js
   Ações CRUD de itens / checklist dentro de um container
   (trilha raiz ou pasta — fid=null significa "raiz da trilha").

   Múltiplos itens com o mesmo nome sempre foram permitidos e
   continuam sendo — não há (e nunca houve) restrição de unicidade.

   Funções:
   - addItem(tid, fid, inputId)       → adiciona item (Enter ou botão)
   - toggleItem(tid, fid, iid)        → marca/desmarca como feito
   - renameItem(tid, fid, iid, v)     → renomeia inline
   - deleteItem(tid, fid, iid)        → remove item
   - editQty(tid, fid, iid)           → define quantidade via prompt
