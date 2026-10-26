# Manual do banco de dados do Styne

Este documento explica a estrutura completa do banco de dados usado pelo
Styne (MySQL / MariaDB), suas tabelas, relacionamentos e as regras que o
backend aplica em cima delas. O arquivo que cria tudo isso é
`database/schema.sql` — rode-o uma vez para criar o banco do zero.

## Visão geral dos relacionamentos

```
users             (1) ──< trails            (usuario_id)
trails            (1) ──< folders           (trilha_id)
trails            (1) ──< tasks             (trilha_id)
folders           (1) ──< tasks             (pasta_id, opcional)
users             (1) ──< tasks             (usuario_id — usuário responsável)
tasks             (1) ──< task_logs         (task_id — histórico de progresso)
users (0..1)      (1) ──< support_requests  (usuario_id, opcional — suporte sem login)
```

Convenções gerais:
- Todo ID é `VARCHAR(64)`, no mesmo formato gerado pelo frontend (`uid()` em `assets/js/utils.js`).
- Toda tabela usada em buscas/joins tem índice nos campos relevantes.
- `admin` em `users` é sempre um booleano real (`TINYINT(1)`), nunca uma string.
- Nenhuma tabela é acessada diretamente pelo frontend — tudo passa por `api/api.php`, que só aceita ações específicas e sempre usa o ID da sessão do PHP para saber de quem são os dados, nunca confiando em um ID mandado pelo navegador.

## `users`

Guarda cada conta cadastrada no site.

| Coluna | Tipo | O que é |
|---|---|---|
| id | VARCHAR(64) | identificador único |
| nome_usuario | VARCHAR(255) | nome exibido |
| email_usuario | VARCHAR(255) | e-mail, único no banco |
| senha_hash | VARCHAR(255) | senha já criptografada com `password_hash()` do PHP — nunca fica em texto puro |
| admin | TINYINT(1) | `1` = administrador, `0` = usuário comum. O cadastro público sempre grava `0` |
| criado_em / atualizado_em | DATETIME | controle automático |

O primeiro administrador não precisa de nenhum passo manual: a primeira conta criada pelo cadastro público do site vira administradora automaticamente (checagem feita em `styne_user_create()`, em `api/functions.php`). Todas as contas seguintes são sempre criadas como usuário comum. Também é possível promover ou recriar um administrador específico a qualquer momento rodando `php database/seed_admin.php "Nome" email@dominio.com "senha"`.

## `trails`

Uma trilha é o container principal que o usuário cria (ex.: "Faculdade", "Viagem"). Sempre pertence a um usuário; se a conta for apagada, as trilhas somem junto (`ON DELETE CASCADE`).

Campos além do básico: `icone`, `bloqueada` (modo somente leitura), `fin_tools_open` (se o painel de finanças estava aberto).

## `folders`

Pastas vivem só dentro de uma trilha, nunca dentro de outra pasta (o sistema não tem subpastas). Se a trilha for apagada, as pastas somem junto.

## `tasks`

A tabela mais importante: guarda **todo tipo de tarefa** — itens de checklist e as seis variações de meta (cronograma, financeira, água, conversor, divisor, calculadora de juros) — no mesmo formato. O campo `tipo` diz qual é qual, e `pasta_id` (nulo ou preenchido) diz se está na raiz da trilha ou dentro de uma pasta.

Campos específicos de cada tipo de meta (histórico de valores, dias de descanso, horários, taxa de câmbio etc.) não viram uma coluna para cada — eles ficam agrupados no campo `config`, que guarda um JSON. Isso evita ter dezenas de colunas que só fariam sentido para um único tipo de meta.

Se apagar a trilha, a pasta ou o usuário dono, as tarefas relacionadas somem junto.

## `task_logs`

Histórico de progresso de uma tarefa (equivalente ao `LogEntry` do frontend): cada depósito, retirada ou registro de progresso vira uma linha aqui, ligada à tarefa pelo `task_id`.

## `support_requests`

Pedidos de ajuda ou reportes de problema enviados pela aba Suporte. Funciona com ou sem login — por isso `usuario_id` pode ser nulo, mas `email_usuario` é sempre obrigatório (é por ele que a pessoa consegue ver suas próprias solicitações depois). Só administradores conseguem listar todas as solicitações; isso é checado no backend, não só escondido na tela.

## Regras de segurança aplicadas pelo backend

- Toda consulta usa **prepared statements** do PDO — nunca concatenação de texto — o que evita injeção de SQL.
- O `usuario_id` usado em qualquer leitura ou gravação vem sempre da sessão PHP (`$_SESSION`), nunca de um campo enviado pelo navegador. Isso impede que alguém manipule uma requisição e veja ou altere dados de outra conta.
- Toda ação de administrador (`admin_*`) roda `styne_require_admin()`, que confere de novo no banco se a sessão atual pertence a um usuário com `admin = 1` — mesmo que a tela já esconda o botão para quem não é admin.
- A senha nunca é comparada em texto puro: usa-se sempre `password_verify()` contra o hash guardado.
