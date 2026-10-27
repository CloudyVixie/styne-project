# Styne

O Styne é uma aplicação web para organizar estudos, projetos e objetivos em etapas menores. A ideia é transformar metas grandes em tarefas diárias, acompanhando o progresso em um só lugar.

## Por que fiz esse projeto

Criei o Styne para facilitar a organização de tarefas e tornar objetivos longos mais fáceis de acompanhar. O projeto também foi uma forma de praticar desenvolvimento web, integração entre frontend e backend e persistência de dados em um banco relacional.

## Funcionalidades

- **Trilhas e pastas:** organize atividades por assunto ou projeto.
- **Checklist:** adicione itens, marque o que concluiu e informe quantidades.
- **Cronogramas:** calcule metas diárias a partir do prazo e do progresso registrado.
- **Metas financeiras:** acompanhe depósitos, retiradas e valores que deseja alcançar.
- **Ferramentas financeiras:** conversor entre BRL, USD e EUR, divisor de valores e calculadora de juros simples e compostos.
- **Hidratação:** defina uma meta diária e o intervalo de horário para os lembretes.
- **Conta de usuário:** cadastro, login, edição de dados e sincronização das trilhas com o banco.
- **Suporte e administração:** envie solicitações de suporte e permita que administradores consultem solicitações e gerenciem dados de usuários.
- **Interface responsiva:** layout com identidade visual neo-brutalista e opções de tema claro e escuro.

## Tecnologias

- HTML, CSS e JavaScript
- PHP
- MySQL ou MariaDB
- PDO para acesso ao banco de dados
- Apache, por meio do XAMPP

## Como o código funciona

O frontend é feito com HTML, CSS e JavaScript sem frameworks. Os arquivos de estilo ficam em `assets/css/`, e os módulos JavaScript ficam em `assets/js/`.

As operações de conta e os dados salvos são enviados para a API PHP em `api/api.php`. As funções de apoio ficam em `api/functions.php`, enquanto `api/db.php` cuida da conexão com o banco. A estrutura das tabelas está em `database/schema.sql`.

Depois do login, as trilhas e seus dados são carregados e sincronizados com o banco de dados. A API também controla sessões e valida operações que exigem autenticação.

## Como executar

O Styne precisa ser aberto por um servidor web para que as chamadas à API PHP funcionem. Abrir o arquivo diretamente com `file://` não é suficiente.

1. Instale e inicie o Apache e o MySQL pelo XAMPP.
2. Coloque o repositório na pasta `htdocs/styne-project`.
3. Abra o phpMyAdmin e importe o arquivo `database/schema.sql`.
4. Confira as configurações de conexão do banco em `api/db.php` e ajuste-as ao seu ambiente.
5. Acesse [http://localhost/styne-project/](http://localhost/styne-project/) no navegador.

## Estrutura principal

```text
styne-project/
├── api/
│   ├── api.php
│   ├── db.php
│   └── functions.php
├── assets/
│   ├── components/
│   ├── css/
│   ├── images/
│   └── js/
├── database/
│   └── schema.sql
├── index.html
├── LICENSE
└── README.md
```

## Licença

Este projeto está sob a licença MIT. Consulte o arquivo `LICENSE` para mais informações.
