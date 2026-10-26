# assets/js/nodes.js

assets/js/nodes.js
   Ações CRUD de pastas.

   A partir da v5, pastas existem SOMENTE no nível raiz de uma
   trilha — não é mais possível criar uma pasta dentro de outra.
   A funcionalidade de subpastas foi completamente removida.

   Funções:
   - openAddNode(tid)           → abre modal de criação de pasta na raiz
   - createNode()                → cria pasta na raiz da trilha
   - deleteNode(tid, fid)        → remove com confirmação
   - toggleNode(tid, fid)        → abre/fecha
   - renameNode(tid, fid, v)     → renomeia inline
