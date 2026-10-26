# assets/js/goals.js

assets/js/goals.js
   Ações CRUD genéricas de metas (goals) — cronograma, financeira,
   hidratação, conversor, divisor e calculadora de juros.

   NÃO HÁ limite de instâncias por tipo em cada trilha/pasta: cada
   seleção no menu ADICIONA uma nova instância ao container (trilha
   raiz ou pasta), em vez de mostrar/ocultar um painel único. O
   usuário pode ter quantas instâncias iguais quiser — inclusive
   das 4 funções financeiras (Meta financeira, Conversor de moedas,
   Divisor de valores e Calculadora de juros), cada uma como um
   bloco independente e persistente.

   Funções:
   - addGoal(tid, fid, type)        → cria e adiciona uma nova meta/instância
   - addFinInstance(tid, fid, type) → atalho usado pelo mini-menu de Finanças
   - deleteGoal(tid, fid, gid)       → remove meta com confirmação
   - toggleGoalOpen(tid, fid, gid)   → expande/recolhe o painel
   - renameGoal(tid, fid, gid, v)    → renomeia a meta (inline)
