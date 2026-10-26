CREATE DATABASE IF NOT EXISTS styne
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE styne;

CREATE TABLE IF NOT EXISTS users (
  id             VARCHAR(64)  NOT NULL,
  nome_usuario   VARCHAR(255) NOT NULL,
  email_usuario  VARCHAR(255) NOT NULL,
  senha_hash     VARCHAR(255) NOT NULL,
  admin          TINYINT(1)   NOT NULL DEFAULT 0,
  criado_em      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email_usuario),
  KEY idx_users_admin (admin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trails (
  id              VARCHAR(64)  NOT NULL,
  usuario_id      VARCHAR(64)  NOT NULL,
  nome            VARCHAR(255) NOT NULL,
  icone           VARCHAR(20)  NULL,
  bloqueada       TINYINT(1)   NOT NULL DEFAULT 0,
  fin_tools_open  TINYINT(1)   NOT NULL DEFAULT 0,
  criado_em       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_trails_usuario (usuario_id),
  CONSTRAINT fk_trails_usuario FOREIGN KEY (usuario_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS folders (
  id             VARCHAR(64)  NOT NULL,
  trilha_id      VARCHAR(64)  NOT NULL,
  nome           VARCHAR(255) NOT NULL,
  icone          VARCHAR(20)  NULL,
  cor_idx        INT          NOT NULL DEFAULT 0,
  aberta         TINYINT(1)   NOT NULL DEFAULT 0,
  criado_em      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_folders_trilha (trilha_id),
  CONSTRAINT fk_folders_trilha FOREIGN KEY (trilha_id)
    REFERENCES trails(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tasks (
  id              VARCHAR(64)  NOT NULL,
  trilha_id       VARCHAR(64)  NOT NULL,
  pasta_id        VARCHAR(64)  NULL,
  usuario_id      VARCHAR(64)  NOT NULL,
  tipo            ENUM('item','sched','fin','water','convert','split','interest') NOT NULL,
  titulo          VARCHAR(255) NOT NULL,
  descricao       TEXT         NULL,
  status          ENUM('pendente','concluida') NOT NULL DEFAULT 'pendente',
  prioridade      ENUM('baixa','media','alta') NULL,
  data_inicio     DATE         NULL,
  data_fim        DATE         NULL,
  horario_inicio  TIME         NULL,
  horario_fim     TIME         NULL,
  progresso       DECIMAL(14,2) NULL,
  quantidade      DECIMAL(14,2) NULL,
  unidade         VARCHAR(50)  NULL,
  categoria       VARCHAR(100) NULL,
  recorrencia     VARCHAR(100) NULL,
  concluida       TINYINT(1)   NOT NULL DEFAULT 0,
  aberta          TINYINT(1)   NOT NULL DEFAULT 1,
  config          JSON         NULL,
  criado_em       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tasks_trilha (trilha_id),
  KEY idx_tasks_pasta (pasta_id),
  KEY idx_tasks_usuario (usuario_id),
  KEY idx_tasks_tipo (tipo),
  KEY idx_tasks_status (status),
  CONSTRAINT fk_tasks_trilha FOREIGN KEY (trilha_id)
    REFERENCES trails(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_pasta FOREIGN KEY (pasta_id)
    REFERENCES folders(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_usuario FOREIGN KEY (usuario_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS task_logs (
  id          VARCHAR(64)   NOT NULL,
  task_id     VARCHAR(64)   NOT NULL,
  valor       DECIMAL(14,2) NOT NULL,
  nota        VARCHAR(255)  NULL,
  criado_em   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tasklogs_task (task_id),
  CONSTRAINT fk_tasklogs_task FOREIGN KEY (task_id)
    REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS support_requests (
  id             VARCHAR(64)  NOT NULL,
  usuario_id     VARCHAR(64)  NULL,
  nome_usuario   VARCHAR(255) NULL,
  email_usuario  VARCHAR(255) NOT NULL,
  tipo           ENUM('suporte','problema') NOT NULL,
  assunto        VARCHAR(255) NOT NULL,
  mensagem       TEXT         NOT NULL,
  status         ENUM('aberto','resolvido') NOT NULL DEFAULT 'aberto',
  criado_em      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_support_status (status),
  KEY idx_support_email (email_usuario),
  KEY idx_support_usuario (usuario_id),
  CONSTRAINT fk_support_usuario FOREIGN KEY (usuario_id)
    REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
