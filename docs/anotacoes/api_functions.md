# api/functions.php

api/functions.php
-----------------------------------------------------------------------
Funções reutilizáveis de acesso ao banco (CRUD) e utilitários de
segurança usados por api/api.php. Todas as consultas usam prepared
statements (PDO) com parâmetros vinculados — nunca concatenação de
strings — para prevenir SQL Injection.

─────────────────────────────────────────────────────────────────────

Utilitários de validação / sanitização de entrada

─────────────────────────────────────────────────────────────────────

─────────────────────────────────────────────────────────────────────

Sessão / autenticação / permissões (verificadas no backend, não só

na interface — a checagem de admin é sempre refeita consultando o

banco na hora, nunca confiando em um valor antigo de sessão).

─────────────────────────────────────────────────────────────────────

Interrompe a execução com 403 caso o usuário atual não seja
administrador. Usada no início de TODA ação administrativa do
roteador (api.php) — a permissão nunca é verificada apenas no
frontend/JS.

─────────────────────────────────────────────────────────────────────

USERS

─────────────────────────────────────────────────────────────────────

admin é SEMPRE 0 no cadastro público — nunca lido de entrada do cliente.

Troca a senha de um usuário logado, sempre confirmando a senha atual
antes (nunca troca só porque a sessão está autenticada).

Gera e grava um código de verificação de 6 dígitos para um usuário —
base pronta para o envio por e-mail (cadastro/recuperação de conta) que
ainda será implementado. Por enquanto não dispara e-mail nenhum; o
código fica salvo com validade de 15 minutos, pronto para ser conferido
assim que o envio de e-mail for plugado aqui.

TODO: enviar por e-mail em vez de retornar aqui, quando o envio for implementado

Pesquisa por ID, nome de usuário ou e-mail (usada no painel administrativo).

Administrador atualiza o nome cadastral de um usuário localizado por e-mail.

─────────────────────────────────────────────────────────────────────

TRAILS / FOLDERS / TASKS (upsert em lote a partir do estado do cliente)

─────────────────────────────────────────────────────────────────────

Cria/atualiza uma trilha do usuário logado.

Cria/atualiza uma tarefa (item de checklist OU meta: cronograma,
financeira, hidratação) — o mesmo formato é usado tanto para tarefas
na raiz da trilha quanto dentro de uma pasta (pasta_id nulo = raiz).

Campos comuns, mapeados conforme o tipo real da tarefa:

Reconstrói uma linha da tabela `tasks` de volta ao formato usado pelo
frontend (item ou meta), incluindo os campos específicos do tipo que
ficam guardados em `config` (JSON). É o inverso de styne_task_upsert().

Monta a árvore completa (trilhas → pastas/tarefas) do usuário logado,
lendo diretamente do banco — é a ÚNICA fonte usada para popular o
frontend (não existe cache local/localStorage).

Sincroniza (upsert + remove o que não existe mais) o estado completo do
usuário autenticado. Deleções propagam de verdade para o banco: qualquer
trilha/pasta/tarefa que não estiver mais no payload recebido é removida
(nunca ficam "duas fontes de verdade" divergentes).

Remove trilhas do usuário que não vieram mais no payload (cascade

cuida de pastas/tarefas/logs associados).

Remove pastas órfãs (das trilhas que permaneceram) que não vieram mais.

Remove tarefas/metas do usuário que não vieram mais no payload.

Pesquisa tarefas (itens e metas) pelo nome/título, no banco, escopada ao usuário.

─────────────────────────────────────────────────────────────────────

SUPPORT REQUESTS (não exige login — exige e-mail válido)

─────────────────────────────────────────────────────────────────────

Solicitações de suporte enviadas por um e-mail específico (não exige login).

Todas as solicitações de suporte — exclusivo para administradores.

─────────────────────────────────────────────────────────────────────

VISÃO ADMINISTRATIVA DO BANCO DE DADOS

─────────────────────────────────────────────────────────────────────

