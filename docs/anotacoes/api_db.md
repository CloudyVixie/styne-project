# api/db.php

api/db.php
-----------------------------------------------------------------------
Conexão com o banco de dados MySQL/MariaDB via PDO.
Este arquivo roda EXCLUSIVAMENTE no servidor (PHP). Nenhuma credencial
de banco é enviada ao frontend em nenhuma hipótese — o JavaScript da
aplicação só conversa com api/api.php via HTTP (JSON), nunca com o
banco diretamente.
As credenciais são lidas de variáveis de ambiente (recomendado em
produção). Caso não estejam definidas, valores padrão de
desenvolvimento local são usados como fallback — ajuste-os para o seu
ambiente (ou, de preferência, defina as variáveis de ambiente abaixo
no seu servidor/hospedagem em vez de editar este arquivo).
  STYNE_DB_HOST, STYNE_DB_PORT, STYNE_DB_NAME,
  STYNE_DB_USER, STYNE_DB_PASS

força prepared statements reais (proteção contra SQL Injection)

Nunca expõe detalhes de conexão/credenciais na resposta ao cliente.

