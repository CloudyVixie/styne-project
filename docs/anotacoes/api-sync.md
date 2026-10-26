# assets/js/api-sync.js

assets/js/api-sync.js
   Única camada de comunicação com o backend (api/api.php), que por
   sua vez fala com o banco (MySQL). NÃO HÁ fallback offline: sem
   uma resposta do backend, os dados simplesmente não persistem —
   esse é o comportamento esperado do Styne.

   Funções:
   - apiPost(action, data)        → POST JSON para api/api.php
   - checkSession()                → pergunta ao backend quem está logado
   - loadStateFromServer()         → busca trilhas/pastas/tarefas do usuário
   - syncStateToBackend()          → grava o estado atual (debounced)
   - syncStateNow()                → grava imediatamente, retorna Promise
   - searchTasks(q)                → pesquisa tarefas por nome no banco
   - adminLoadDbOverview()         → visão geral do banco (admin)
