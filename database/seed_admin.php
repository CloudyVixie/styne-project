<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Este script só pode ser executado via linha de comando (CLI).');
}

require_once __DIR__ . '/../api/db.php';
require_once __DIR__ . '/../api/functions.php';

$name  = $argv[1] ?? null;
$email = $argv[2] ?? null;
$pass  = $argv[3] ?? null;

if (!$name || !$email || !$pass) {
    fwrite(STDERR, "Uso: php database/seed_admin.php \"Nome\" email@dominio.com \"senha\"\n");
    exit(1);
}

$email = filter_var($email, FILTER_VALIDATE_EMAIL);
if (!$email) {
    fwrite(STDERR, "E-mail inválido.\n");
    exit(1);
}
if (strlen($pass) < 6) {
    fwrite(STDERR, "Use uma senha com pelo menos 6 caracteres.\n");
    exit(1);
}

$pdo = styne_db();

$stmt = $pdo->prepare('SELECT id FROM users WHERE email_usuario = ? LIMIT 1');
$stmt->execute([$email]);
$existing = $stmt->fetch();

$hash = password_hash($pass, PASSWORD_DEFAULT);

if ($existing) {

    $stmt = $pdo->prepare('UPDATE users SET nome_usuario = ?, senha_hash = ?, admin = 1 WHERE id = ?');
    $stmt->execute([$name, $hash, $existing['id']]);
    echo "Usuário existente atualizado e promovido a administrador (id={$existing['id']}).\n";
} else {
    $id = styne_uid();
    $stmt = $pdo->prepare(
        'INSERT INTO users (id, nome_usuario, email_usuario, senha_hash, admin) VALUES (?, ?, ?, ?, 1)'
    );
    $stmt->execute([$id, $name, $email, $hash]);
    echo "Administrador criado com sucesso (id={$id}).\n";
}
