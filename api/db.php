<?php

declare(strict_types=1);

function styne_load_env(): void {
    static $loaded = false;
    if ($loaded) return;
    $loaded = true;
    $path = __DIR__ . '/../.env';
    if (!is_file($path) || !is_readable($path)) return;
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) continue;
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value, " \t\n\r\0\x0B\"'");
        if ($key !== '' && getenv($key) === false) {
            putenv("{$key}={$value}");
        }
    }
}

function styne_db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    styne_load_env();

    $host = getenv('STYNE_DB_HOST') ?: '127.0.0.1';
    $port = getenv('STYNE_DB_PORT') ?: '3306';
    $name = getenv('STYNE_DB_NAME') ?: 'styne';
    $user = getenv('STYNE_DB_USER') ?: 'styne_app';
    $pass = getenv('STYNE_DB_PASS');
    if ($pass === false) {
        error_log('[styne] STYNE_DB_PASS não configurada — defina-a em .env ou nas variáveis de ambiente do servidor.');
        $pass = '';
    }

    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

    try {
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {

        error_log('[styne] Falha ao conectar ao banco de dados: ' . $e->getMessage());
        http_response_code(503);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => false, 'error' => 'Banco de dados indisponível no momento.']);
        exit;
    }

    return $pdo;
}
