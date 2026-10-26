# assets/js/utils.js

assets/js/utils.js
   Funções utilitárias usadas por todos os módulos.
   Sem localStorage/sessionStorage em lugar nenhum: preferências de
   UI (como o tema) vivem só em memória durante a sessão da aba.

   Exporta (globalmente):
   - uid()             → ID único baseado em timestamp + random
   - esc(str)          → escapa HTML para prevenir XSS
   - n2(v)             → formata número (sem casas decimais desnecessárias)
   - fmtMoney(v, sym)  → formata valor monetário em pt-BR
   - showToast(msg,type) → sistema de notificações (success/error/warning/info)
   - openModal(id)     → abre overlay/modal
   - closeModal(id)    → fecha overlay/modal
   - applyTheme/toggleTheme → claro/escuro (em memória, não persiste)
