# assets/js/state.js

assets/js/state.js
   Estado em memória da aplicação. NÃO HÁ persistência local —
   nem localStorage, nem sessionStorage, nem qualquer mock. O
   Styne NÃO funciona offline: todo dado é lido e gravado através
   da API (api/api.php), que fala com o banco de dados (MySQL).
   O banco é a ÚNICA fonte oficial dos dados; `S` é apenas um cache
   em memória do que o backend retornou, refeito do zero a cada
   login (ver bootStyne() em main.js e loadStateFromServer() em
   api-sync.js).

   ── MODELO DE DADOS ───────────────────────────────────────────
   Uma trilha pode conter, diretamente: pastas (apenas no nível
   raiz) e metas (itens de checklist + painéis de cronograma,
   financeiro, água, conversor, divisor e juros).
   Uma pasta pode conter itens e metas, mas NUNCA outra pasta.

   - Trail  { id, name, icon, locked, folders[], items[], goals[] }
   - Folder { id, name, icon, colorIdx, open, items[], goals[] }
   - Goal   { id, type, name, open, ...campos específicos do tipo }
   - Item   { id, name, done, qty, unit }
   - LogEntry { id, v, note, ts }

   "Container" = Trail (raiz) ou Folder — ambos têm items[] e goals[].

   ── USUÁRIO / SESSÃO ──────────────────────────────────────────
   `S.currentUser` é sempre um espelho exato do que o backend
   confirmou para a sessão atual (nunca uma lista local de contas
   com senha em texto puro) — { id_usuario, nome_usuario,
   email_usuario, admin }. `admin` só é true quando o backend
   confirma isso a partir do banco.

   Todas as gravações (commit()) disparam uma sincronização com o
   backend; NENHUM dado sobrevive a um F5 sem um backend acessível
   e uma sessão válida — é esse o comportamento esperado.
