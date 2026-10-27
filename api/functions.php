<?php

declare(strict_types=1);
require_once __DIR__ . '/db.php';

function styne_str(mixed $v, int $maxLen = 500): string {
    $v = trim((string)($v ?? ''));
    return mb_substr($v, 0, $maxLen);
}

function styne_valid_email(mixed $email): ?string {
    $email = trim((string)($email ?? ''));
    $email = filter_var($email, FILTER_VALIDATE_EMAIL);
    return $email !== false ? $email : null;
}


function styne_valid_id(mixed $v): ?string {
    $v = trim((string)($v ?? ''));
    return preg_match('/^[a-z0-9_-]{1,64}$/i', $v) ? $v : null;
}


function styne_csrf_token(): string {
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}


function styne_require_csrf(array $input): void {
    $sent = (string)($input['csrf'] ?? '');
    $expected = $_SESSION['csrf'] ?? '';
    if ($expected === '' || $sent === '' || !hash_equals($expected, $sent)) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Sessão inválida — recarregue a página e tente de novo.']);
        exit;
    }
}

function styne_uid(): string {
    return bin2hex(random_bytes(8));
}


function styne_audit_log(string $event, ?string $userId = null, array $context = []): void {
    unset($context['pass'], $context['password'], $context['current_password'], $context['new_password'], $context['csrf'], $context['senha']);
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'desconhecido';
    $line = sprintf('[styne-audit] %s user=%s ip=%s %s', $event, $userId ?? '-', $ip, json_encode($context, JSON_UNESCAPED_UNICODE));
    error_log($line);
}

function styne_current_user_id(): ?string {
    return $_SESSION['uid'] ?? null;
}

function styne_current_user(): ?array {
    $uid = styne_current_user_id();
    if (!$uid) return null;
    $stmt = styne_db()->prepare('SELECT id, nome_usuario, email_usuario, admin FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$uid]);
    $u = $stmt->fetch();
    return $u ?: null;
}

function styne_require_admin(): array {
    $u = styne_current_user();
    if (!$u || (int)$u['admin'] !== 1) {
        styne_audit_log('admin_access_denied', $u['id'] ?? null);
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Acesso restrito ao administrador.']);
        exit;
    }
    return $u;
}

function styne_require_login(): array {
    $u = styne_current_user();
    if (!$u) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'É necessário estar autenticado.']);
        exit;
    }
    return $u;
}

function styne_user_create(string $name, string $email, string $plainPassword): array {
    $pdo = styne_db();
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email_usuario = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        return ['ok' => false, 'error' => 'Já existe uma conta com esse e-mail.'];
    }
    $id = styne_uid();
    $hash = password_hash($plainPassword, PASSWORD_DEFAULT);

    
    
    
    
    
    $isFirstUser = (int)$pdo->query('SELECT COUNT(*) AS c FROM users')->fetch()['c'] === 0;

    $stmt = $pdo->prepare(
        'INSERT INTO users (id, nome_usuario, email_usuario, senha_hash, admin) VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([$id, $name, $email, $hash, $isFirstUser ? 1 : 0]);
    return ['ok' => true, 'id_usuario' => $id, 'admin' => $isFirstUser];
}

function styne_user_verify_login(string $email, string $plainPassword): ?array {
    $stmt = styne_db()->prepare('SELECT id, nome_usuario, email_usuario, senha_hash, admin FROM users WHERE email_usuario = ? LIMIT 1');
    $stmt->execute([$email]);
    $u = $stmt->fetch();
    if (!$u || !password_verify($plainPassword, $u['senha_hash'])) {
        return null;
    }
    unset($u['senha_hash']);
    return $u;
}

function styne_change_password(string $userId, string $currentPassword, string $newPassword): array {
    $stmt = styne_db()->prepare('SELECT senha_hash FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $row = $stmt->fetch();
    if (!$row || !password_verify($currentPassword, $row['senha_hash'])) {
        return ['ok' => false, 'error' => 'A senha atual não confere.'];
    }
    $hash = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = styne_db()->prepare('UPDATE users SET senha_hash = ? WHERE id = ?');
    $stmt->execute([$hash, $userId]);
    return ['ok' => true];
}

function styne_admin_search_users(string $q): array {
    $like = '%' . $q . '%';
    $stmt = styne_db()->prepare(
        'SELECT id AS id_usuario, nome_usuario, email_usuario, admin
         FROM users
         WHERE id LIKE ? OR nome_usuario LIKE ? OR email_usuario LIKE ?
         ORDER BY nome_usuario ASC
         LIMIT 50'
    );
    $stmt->execute([$like, $like, $like]);
    return $stmt->fetchAll();
}


function styne_admin_update_user(string $userId, string $name, string $email, ?string $newPassword): array {
    $pdo = styne_db();

    $stmt = $pdo->prepare('SELECT id FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$userId]);
    if (!$stmt->fetch()) {
        return ['ok' => false, 'error' => 'Não encontrei nenhum usuário com esse ID.'];
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE email_usuario = ? AND id != ? LIMIT 1');
    $stmt->execute([$email, $userId]);
    if ($stmt->fetch()) {
        return ['ok' => false, 'error' => 'Esse e-mail já está sendo usado por outra conta.'];
    }

    if ($newPassword !== null && $newPassword !== '') {
        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('UPDATE users SET nome_usuario = ?, email_usuario = ?, senha_hash = ? WHERE id = ?');
        $stmt->execute([$name, $email, $hash, $userId]);
    } else {
        $stmt = $pdo->prepare('UPDATE users SET nome_usuario = ?, email_usuario = ? WHERE id = ?');
        $stmt->execute([$name, $email, $userId]);
    }

    return ['ok' => true, 'id_usuario' => $userId, 'nome_usuario' => $name, 'email_usuario' => $email];
}


function styne_update_own_profile(string $userId, string $name, string $email): array {
    $pdo = styne_db();
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email_usuario = ? AND id != ? LIMIT 1');
    $stmt->execute([$email, $userId]);
    if ($stmt->fetch()) {
        return ['ok' => false, 'error' => 'Esse e-mail já está sendo usado por outra conta.'];
    }
    $stmt = $pdo->prepare('UPDATE users SET nome_usuario = ?, email_usuario = ? WHERE id = ?');
    $stmt->execute([$name, $email, $userId]);
    return ['ok' => true, 'nome_usuario' => $name, 'email_usuario' => $email];
}

function styne_trail_upsert(string $userId, array $t): void {
    $pdo = styne_db();
    $stmt = $pdo->prepare(
        'INSERT INTO trails (id, usuario_id, nome, icone, bloqueada, fin_tools_open)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE nome=VALUES(nome), icone=VALUES(icone),
           bloqueada=VALUES(bloqueada), fin_tools_open=VALUES(fin_tools_open)'
    );
    $stmt->execute([
        styne_str($t['id'] ?? '', 64),
        $userId,
        styne_str($t['name'] ?? '', 255),
        styne_str($t['icon'] ?? '', 20),
        !empty($t['locked']) ? 1 : 0,
        !empty($t['finToolsOpen']) ? 1 : 0,
    ]);
}

function styne_folder_upsert(string $trailId, array $f): void {
    $pdo = styne_db();
    $stmt = $pdo->prepare(
        'INSERT INTO folders (id, trilha_id, nome, icone, cor_idx, aberta)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE nome=VALUES(nome), icone=VALUES(icone),
           cor_idx=VALUES(cor_idx), aberta=VALUES(aberta)'
    );
    $stmt->execute([
        styne_str($f['id'] ?? '', 64),
        $trailId,
        styne_str($f['name'] ?? '', 255),
        styne_str($f['icon'] ?? '', 20),
        (int)($f['colorIdx'] ?? 0),
        !empty($f['open']) ? 1 : 0,
    ]);
}

function styne_task_upsert(string $userId, string $trailId, ?string $folderId, string $tipo, array $t): void {
    $pdo = styne_db();

    $titulo    = styne_str($t['name'] ?? $t['titulo'] ?? '', 255);
    $concluida = !empty($t['done']) ? 1 : 0;
    $status    = $concluida ? 'concluida' : 'pendente';
    $aberta    = array_key_exists('open', $t) ? (!empty($t['open']) ? 1 : 0) : 1;

    $quantidade = null; $unidade = null; $prazo = null; $horaInicio = null; $horaFim = null;
    $recorrencia = null; $categoria = $tipo; $progresso = null;
    $config = [];

    if ($tipo === 'item') {
        $quantidade = is_numeric($t['qty'] ?? null) ? (float)$t['qty'] : null;
        $unidade = styne_str($t['unit'] ?? '', 50);
    } elseif ($tipo === 'sched') {
        $quantidade = is_numeric($t['total'] ?? null) ? (float)$t['total'] : null;
        $unidade = styne_str($t['unitLabel'] ?: ($t['unit'] ?? ''), 50);
        $prazo = is_numeric($t['deadline'] ?? null) ? (int)$t['deadline'] : null;
        $recorrencia = styne_str(($t['period'] ?? '') . '/' . ($t['sessions'] ?? ''), 100);
        $config = ['restDays' => $t['restDays'] ?? [], 'log' => $t['log'] ?? [], 'period' => $t['period'] ?? null, 'sessions' => $t['sessions'] ?? null];
    } elseif ($tipo === 'fin') {
        $quantidade = is_numeric($t['goal'] ?? null) ? (float)$t['goal'] : null;
        $unidade = styne_str($t['currency'] ?? '', 10);
        $recorrencia = styne_str($t['freq'] ?? '', 50);
        $config = ['amount' => $t['amount'] ?? null, 'freq' => $t['freq'] ?? null, 'currency' => $t['currency'] ?? null, 'log' => $t['log'] ?? []];
    } elseif ($tipo === 'water') {
        $quantidade = is_numeric($t['goal'] ?? null) ? (float)$t['goal'] : null;
        $unidade = styne_str($t['unit'] ?? '', 20);
        $horaInicio = styne_str($t['startTime'] ?? '', 10) ?: null;
        $horaFim = styne_str($t['endTime'] ?? '', 10) ?: null;
        $config = ['slots' => $t['slots'] ?? [], 'log' => $t['log'] ?? []];
    } elseif ($tipo === 'convert') {
        $quantidade = is_numeric($t['amount'] ?? null) ? (float)$t['amount'] : null;
        $unidade = styne_str($t['from'] ?? '', 10);
        $config = ['amount' => $t['amount'] ?? null, 'from' => $t['from'] ?? null, 'to' => $t['to'] ?? null];
    } elseif ($tipo === 'split') {
        $quantidade = is_numeric($t['total'] ?? null) ? (float)$t['total'] : null;
        $recorrencia = styne_str((string)($t['months'] ?? ''), 50);
        $config = ['total' => $t['total'] ?? null, 'people' => $t['people'] ?? null, 'months' => $t['months'] ?? null];
    } elseif ($tipo === 'interest') {
        $quantidade = is_numeric($t['capital'] ?? null) ? (float)$t['capital'] : null;
        $recorrencia = styne_str($t['mode'] ?? '', 20);
        $config = ['capital' => $t['capital'] ?? null, 'rate' => $t['rate'] ?? null, 'period' => $t['period'] ?? null, 'mode' => $t['mode'] ?? null];
    }

    $stmt = $pdo->prepare(
        'INSERT INTO tasks
            (id, trilha_id, pasta_id, usuario_id, tipo, titulo, descricao, status, prioridade,
             data_inicio, data_fim, horario_inicio, horario_fim, progresso, quantidade, unidade,
             categoria, recorrencia, concluida, aberta, config)
         VALUES (?, ?, ?, ?, ?, ?, NULL, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            pasta_id=VALUES(pasta_id), titulo=VALUES(titulo), status=VALUES(status),
            data_fim=VALUES(data_fim), horario_inicio=VALUES(horario_inicio), horario_fim=VALUES(horario_fim),
            progresso=VALUES(progresso), quantidade=VALUES(quantidade), unidade=VALUES(unidade),
            categoria=VALUES(categoria), recorrencia=VALUES(recorrencia), concluida=VALUES(concluida),
            aberta=VALUES(aberta), config=VALUES(config)'
    );
    $stmt->execute([
        styne_str($t['id'] ?? '', 64),
        $trailId,
        $folderId,
        $userId,
        $tipo,
        $titulo,
        $status,
        $prazo,
        $horaInicio,
        $horaFim,
        $progresso,
        $quantidade,
        $unidade,
        $categoria,
        $recorrencia,
        $concluida,
        $aberta,
        json_encode($config, JSON_UNESCAPED_UNICODE),
    ]);
}

function styne_task_row_to_object(array $row): array {
    $config = json_decode($row['config'] ?? '{}', true) ?: [];
    $base = [
        'id' => $row['id'],
    ];
    if ($row['tipo'] === 'item') {
        return $base + [
            'name' => $row['titulo'],
            'done' => (bool)$row['concluida'],
            'qty'  => $row['quantidade'],
            'unit' => $row['unidade'],
        ];
    }
    $goal = $base + [
        'type' => $row['tipo'],
        'name' => $row['titulo'],
        'open' => (bool)$row['aberta'],
    ];
    if ($row['tipo'] === 'sched') {
        $goal += [
            'total' => $row['quantidade'], 'unit' => $config['unit'] ?? '', 'unitLabel' => $row['unidade'],
            'deadline' => $row['data_fim'], 'period' => $config['period'] ?? 'days',
            'sessions' => $config['sessions'] ?? 1, 'restDays' => $config['restDays'] ?? [], 'log' => $config['log'] ?? [],
        ];
    } elseif ($row['tipo'] === 'fin') {
        $goal += [
            'goal' => $row['quantidade'], 'amount' => $config['amount'] ?? '', 'freq' => $config['freq'] ?? 'monthly',
            'currency' => $row['unidade'] ?: 'BRL', 'log' => $config['log'] ?? [],
        ];
    } elseif ($row['tipo'] === 'water') {
        $goal += [
            'goal' => $row['quantidade'], 'unit' => $row['unidade'] ?: 'ml',
            'startTime' => $row['horario_inicio'], 'endTime' => $row['horario_fim'],
            'slots' => $config['slots'] ?? [], 'log' => $config['log'] ?? [],
        ];
    } elseif ($row['tipo'] === 'convert') {
        $goal += ['amount' => $config['amount'] ?? '', 'from' => $config['from'] ?? 'BRL', 'to' => $config['to'] ?? 'USD'];
    } elseif ($row['tipo'] === 'split') {
        $goal += ['total' => $config['total'] ?? '', 'people' => $config['people'] ?? '', 'months' => $config['months'] ?? ''];
    } elseif ($row['tipo'] === 'interest') {
        $goal += ['capital' => $config['capital'] ?? '', 'rate' => $config['rate'] ?? '', 'period' => $config['period'] ?? '', 'mode' => $config['mode'] ?? 'simple'];
    }
    return $goal;
}

function styne_load_state(string $userId): array {
    $pdo = styne_db();

    $stmt = $pdo->prepare('SELECT id, nome, icone, bloqueada, fin_tools_open FROM trails WHERE usuario_id = ? ORDER BY criado_em ASC');
    $stmt->execute([$userId]);
    $trailRows = $stmt->fetchAll();

    $stmt = $pdo->prepare('SELECT id, trilha_id, nome, icone, cor_idx, aberta FROM folders WHERE trilha_id IN (SELECT id FROM trails WHERE usuario_id = ?) ORDER BY criado_em ASC');
    $stmt->execute([$userId]);
    $folderRows = $stmt->fetchAll();

    $stmt = $pdo->prepare('SELECT * FROM tasks WHERE usuario_id = ? ORDER BY criado_em ASC');
    $stmt->execute([$userId]);
    $taskRows = $stmt->fetchAll();

    $foldersByTrail = [];
    foreach ($folderRows as $f) {
        $foldersByTrail[$f['trilha_id']][] = [
            'id' => $f['id'], 'name' => $f['nome'], 'icon' => $f['icone'],
            'colorIdx' => (int)$f['cor_idx'], 'open' => (bool)$f['aberta'],
            'items' => [], 'goals' => [],
        ];
    }
    $foldersById = [];
    foreach ($foldersByTrail as $tid => &$list) {
        foreach ($list as &$f) $foldersById[$f['id']] = &$f;
    }
    unset($list, $f);

    $tasksByTrailRoot = [];
    foreach ($taskRows as $row) {
        $obj = styne_task_row_to_object($row);
        $bucket = $row['tipo'] === 'item' ? 'items' : 'goals';
        if ($row['pasta_id'] && isset($foldersById[$row['pasta_id']])) {
            $foldersById[$row['pasta_id']][$bucket][] = $obj;
        } else {
            $tasksByTrailRoot[$row['trilha_id']][$bucket][] = $obj;
        }
    }

    $trails = [];
    foreach ($trailRows as $t) {
        $trails[] = [
            'id' => $t['id'], 'name' => $t['nome'], 'icon' => $t['icone'],
            'locked' => (bool)$t['bloqueada'], 'finToolsOpen' => (bool)$t['fin_tools_open'],
            'folders' => $foldersByTrail[$t['id']] ?? [],
            'items' => $tasksByTrailRoot[$t['id']]['items'] ?? [],
            'goals' => $tasksByTrailRoot[$t['id']]['goals'] ?? [],
        ];
    }
    return $trails;
}

function styne_sync_state(string $userId, array $trails): void {
    $pdo = styne_db();
    $pdo->beginTransaction();
    try {
        $trailIds = [];
        $folderIds = [];
        $taskIds = [];
        $validTypes = ['item', 'sched', 'fin', 'water', 'convert', 'split', 'interest'];

        foreach ($trails as $t) {
            if (!is_array($t) || empty($t['id'])) continue;
            $trailId = styne_valid_id($t['id']);
            if ($trailId === null) continue;
            styne_trail_upsert($userId, $t);
            $trailIds[] = $trailId;

            foreach (($t['items'] ?? []) as $it) {
                $itemId = is_array($it) ? styne_valid_id($it['id'] ?? null) : null;
                if ($itemId !== null) {
                    styne_task_upsert($userId, $trailId, null, 'item', $it);
                    $taskIds[] = $itemId;
                }
            }
            foreach (($t['goals'] ?? []) as $g) {
                $goalId = is_array($g) ? styne_valid_id($g['id'] ?? null) : null;
                if ($goalId !== null && in_array($g['type'] ?? null, $validTypes, true)) {
                    styne_task_upsert($userId, $trailId, null, $g['type'], $g);
                    $taskIds[] = $goalId;
                }
            }
            foreach (($t['folders'] ?? []) as $f) {
                if (!is_array($f)) continue;
                $folderId = styne_valid_id($f['id'] ?? null);
                if ($folderId === null) continue;
                styne_folder_upsert($trailId, $f);
                $folderIds[] = $folderId;
                foreach (($f['items'] ?? []) as $it) {
                    $itemId = is_array($it) ? styne_valid_id($it['id'] ?? null) : null;
                    if ($itemId !== null) {
                        styne_task_upsert($userId, $trailId, $folderId, 'item', $it);
                        $taskIds[] = $itemId;
                    }
                }
                foreach (($f['goals'] ?? []) as $g) {
                    $goalId = is_array($g) ? styne_valid_id($g['id'] ?? null) : null;
                    if ($goalId !== null && in_array($g['type'] ?? null, $validTypes, true)) {
                        styne_task_upsert($userId, $trailId, $folderId, $g['type'], $g);
                        $taskIds[] = $goalId;
                    }
                }
            }
        }

        if ($trailIds) {
            $placeholders = implode(',', array_fill(0, count($trailIds), '?'));
            $stmt = $pdo->prepare("DELETE FROM trails WHERE usuario_id = ? AND id NOT IN ($placeholders)");
            $stmt->execute(array_merge([$userId], $trailIds));
        } else {
            $stmt = $pdo->prepare('DELETE FROM trails WHERE usuario_id = ?');
            $stmt->execute([$userId]);
        }

        if ($trailIds) {
            $tPlaceholders = implode(',', array_fill(0, count($trailIds), '?'));
            if ($folderIds) {
                $fPlaceholders = implode(',', array_fill(0, count($folderIds), '?'));
                $stmt = $pdo->prepare("DELETE FROM folders WHERE trilha_id IN ($tPlaceholders) AND id NOT IN ($fPlaceholders)");
                $stmt->execute(array_merge($trailIds, $folderIds));
            } else {
                $stmt = $pdo->prepare("DELETE FROM folders WHERE trilha_id IN ($tPlaceholders)");
                $stmt->execute($trailIds);
            }
        }

        if ($taskIds) {
            $placeholders = implode(',', array_fill(0, count($taskIds), '?'));
            $stmt = $pdo->prepare("DELETE FROM tasks WHERE usuario_id = ? AND id NOT IN ($placeholders)");
            $stmt->execute(array_merge([$userId], $taskIds));
        } else {
            $stmt = $pdo->prepare('DELETE FROM tasks WHERE usuario_id = ?');
            $stmt->execute([$userId]);
        }

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function styne_search_tasks(string $userId, string $q): array {
    $like = '%' . $q . '%';
    $stmt = styne_db()->prepare(
        'SELECT t.id, t.tipo, t.titulo, t.concluida, t.trilha_id, t.pasta_id,
                tr.nome AS trilha_nome, f.nome AS pasta_nome
         FROM tasks t
         JOIN trails tr ON tr.id = t.trilha_id
         LEFT JOIN folders f ON f.id = t.pasta_id
         WHERE t.usuario_id = ? AND t.titulo LIKE ?
         ORDER BY t.criado_em DESC
         LIMIT 50'
    );
    $stmt->execute([$userId, $like]);
    return $stmt->fetchAll();
}

function styne_support_create(?string $userId, string $name, string $email, string $tipo, string $subject, string $message): array {
    if (!in_array($tipo, ['suporte', 'problema'], true)) {
        return ['ok' => false, 'error' => 'Tipo de solicitação inválido.'];
    }
    if ($subject === '' || $message === '') {
        return ['ok' => false, 'error' => 'Assunto e mensagem são obrigatórios.'];
    }
    $id = styne_uid();
    $stmt = styne_db()->prepare(
        'INSERT INTO support_requests (id, usuario_id, nome_usuario, email_usuario, tipo, assunto, mensagem, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, "aberto")'
    );
    $stmt->execute([$id, $userId, $name ?: null, $email, $tipo, $subject, $message]);
    return ['ok' => true, 'id' => $id];
}

function styne_admin_set_support_status(string $id, string $status): bool {
    if (!in_array($status, ['aberto', 'resolvido'], true)) return false;
    $stmt = styne_db()->prepare('UPDATE support_requests SET status = ? WHERE id = ?');
    $stmt->execute([$status, $id]);
    return $stmt->rowCount() > 0;
}

function styne_support_requests_by_email(string $email): array {
    $stmt = styne_db()->prepare('SELECT id, tipo, assunto, status, criado_em FROM support_requests WHERE email_usuario = ? ORDER BY criado_em DESC LIMIT 50');
    $stmt->execute([$email]);
    return $stmt->fetchAll();
}

function styne_admin_list_support(): array {
    $stmt = styne_db()->query('SELECT id, usuario_id, nome_usuario, email_usuario, tipo, assunto, mensagem, status, criado_em FROM support_requests ORDER BY criado_em DESC LIMIT 200');
    return $stmt->fetchAll();
}

function styne_admin_db_overview(): array {
    $pdo = styne_db();
    $counts = [];
    foreach (['users', 'trails', 'folders', 'tasks', 'support_requests', 'task_logs'] as $table) {
        $counts[$table] = (int)$pdo->query("SELECT COUNT(*) AS c FROM {$table}")->fetch()['c'];
    }
    return $counts;
}
