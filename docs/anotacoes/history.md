# assets/js/history.js

assets/js/history.js
   Estrutura genérica e reutilizável de histórico para Undo/Redo.

   Qualquer operação (excluir tarefa, excluir meta, excluir pasta...)
   pode registrar uma entrada aqui com { label, undo(), redo() } e
   ganhar suporte a desfazer/refazer automaticamente, sem diálogos
   nativos do navegador.

   Funções:
   - pushHistory({label, undo, redo}) → registra uma ação reversível
   - undoLast()                        → desfaz a última ação
   - redoLast()                        → refaz a última ação desfeita
   - canUndo() / canRedo()             → estado atual da pilha
