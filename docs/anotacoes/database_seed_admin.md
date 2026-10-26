# database/seed_admin.php

database/seed_admin.php
-----------------------------------------------------------------------
Script de linha de comando (CLI) para criar o primeiro usuário
administrador, com senha hasheada de verdade via password_hash() do
PHP em tempo real — em vez de um hash fixo copiado no arquivo .sql.
Uso (uma única vez, após rodar database/schema.sql):
  php database/seed_admin.php "Administrador Styne" admin@styne.app "sua-senha-forte"
Por segurança, este script só roda via linha de comando (CLI) — se
alguém tentar acessá-lo por HTTP, ele recusa a execução.

Já existe: apenas garante que é admin e atualiza a senha.

