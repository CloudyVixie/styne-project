# assets/js/render.js

assets/js/render.js
   Toda a renderização HTML da aplicação.

   Cada função gera HTML como string e o injeta via innerHTML.
   Não há framework — renderização manual para máxima portabilidade.

   A partir da v5, a árvore é NÃO-recursiva:
   Trilha (container) → Pastas (containers, só na raiz) → (sem subpastas)
   Trilha e Pasta podem conter, cada uma, itens[] e metas (goals[]).
   Metas do mesmo tipo podem se repetir livremente.

   Funções:
   - renderSidebar()                          → lista de trilhas na sidebar
   - showWelcome()                             → tela de boas-vindas (sem trilha)
   - renderTrail(tid)                          → cabeçalho + stats + conteúdo raiz + pastas
   - buildContainerBody(tid,fid,container,locked) → metas + itens de um container
   - buildFolder(tid, folder, locked)          → uma pasta (sem filhos)
   - buildItem(tid, fid, item, locked)         → um item de checklist
   - buildGoalPanel(tid, fid, goal, locked)    → cabeçalho + painel de uma meta
   - buildSchedBody / buildFinBody / buildWaterBody → conteúdo interno de cada tipo de meta
   - buildConvertBody / buildSplitBody / buildInterestBody → funções financeiras independentes
   - buildFinFan(tid, fid)                     → mini-menu (leque) de Finanças
