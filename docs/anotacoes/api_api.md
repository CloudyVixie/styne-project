# api/api.php

api/api.php
-----------------------------------------------------------------------
Ponto de entrada único da API JSON do Styne. Recebe POST com um corpo
JSON contendo { action: "...", ...dados }. Toda a lógica de acesso ao
banco fica em functions.php (prepared statements / PDO).
Segurança:
- Sessão PHP (cookie httpOnly) identifica o usuário autenticado.
- Ações administrativas SEMPRE revalidam a permissão no servidor via
  styne_require_admin() — nunca confiam apenas no que a interface
  mostra ou esconde.
- Todas as consultas usam PDO prepared statements (proteção contra
  SQL Injection). Nenhuma credencial de banco é exposta ao cliente.
- CORS: só aceita o próprio domínio (nenhum header Access-Control-*
  permissivo é enviado).

nunca vaza stack trace/erros de PHP para o cliente

CORS: nenhum header Access-Control-Allow-Origin é enviado por padrão

(o navegador já bloqueia cross-origin nesse caso). Como reforço, se um

Origin diferente do próprio host vier na requisição, ela é recusada.

── CADASTRO (público) — admin é sempre 0, nunca lido do cliente ──

── LOGIN ──

── LOGOUT ──

── TROCA DE SENHA (exige login e a senha atual) ──

── QUEM ESTÁ LOGADO? (usado a cada carregamento de página, já que

não existe localStorage/sessionStorage guardando isso no cliente) ──

── CARREGA TODO O ESTADO (trilhas/pastas/tarefas) DO USUÁRIO LOGADO ──

Fonte única: o banco. Chamado a cada login/refresh — nunca há cache

local sobrevivendo entre sessões.

── PESQUISA DE TAREFAS (Meu Espaço) — escopada ao usuário logado ──

── SUORTE: minhas solicitações por e-mail (não exige login) ──

── ADMIN: todas as solicitações de suporte ──

── SUPORTE (não exige login; exige e-mail válido) ──

Se o cliente indicar um usuário logado, usamos o ID da SESSÃO

(nunca o valor enviado pelo corpo da requisição) para evitar spoofing.

── SINCRONIZAÇÃO DE ESTADO (trilhas/pastas/tarefas) ──

Requer login: a posse dos dados é sempre a do usuário da SESSÃO,

nunca do id_usuario enviado pelo cliente. Faz upsert do que veio E

remove do banco o que não veio mais (deleções propagam de verdade —

nunca ficam "duas fontes de verdade" divergentes).

── ADMIN: pesquisar contas por ID, nome ou e-mail ──

── ADMIN: atualizar cadastro de um usuário (nunca altera `admin`) ──

── ADMIN: marcar solicitação de suporte como aberta/resolvida ──

── ADMIN: visão geral do banco de dados (contagens por tabela) ──

