<?php

declare(strict_types=1);

ini_set('display_errors', '0');
error_reporting(E_ALL);

session_set_cookie_params([
    'httponly' => true,
    'samesite' => 'Lax',
    'secure'   => (($_SERVER['HTTPS'] ?? '') !== '') || (($_SERVER['SERVER_PORT'] ?? '') === '443'),
]);
session_start();

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');
if ((($_SERVER['HTTPS'] ?? '') !== '') || (($_SERVER['SERVER_PORT'] ?? '') === '443')) {
    // Só envia HSTS quando a conexão já está em HTTPS — nunca força HTTPS
    // em ambiente local/XAMPP onde normalmente não há certificado configurado.
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
}

if (!empty($_SERVER['HTTP_ORIGIN'])) {
    $originHost = parse_url($_SERVER['HTTP_ORIGIN'], PHP_URL_HOST);
    if ($originHost !== null && $originHost !== ($_SERVER['HTTP_HOST'] ?? null) && strpos((string)$originHost, 'localhost') === false) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Origem não permitida.']);
        exit;
    }
}

require_once __DIR__ . '/functions.php';

function styne_input(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '{}', true);
    return is_array($data) ? $data : [];
}

function styne_respond(array $payload, int $status = 200): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    styne_respond(['ok' => false, 'error' => 'Método não permitido.'], 405);
}

$input  = styne_input();
$action = styne_str($input['action'] ?? '', 64);

try {
    switch ($action) {

        case 'cadastro': {
            $name  = styne_str($input['name'] ?? '', 255);
            $email = styne_valid_email($input['email'] ?? null);
            $pass  = (string)($input['pass'] ?? '');
            if ($name === '' || !$email || strlen($pass) < 4) {
                styne_respond(['ok' => false, 'error' => 'Preencha nome, e-mail válido e senha (mín. 4 caracteres).'], 422);
            }
            $result = styne_user_create($name, $email, $pass);
            styne_audit_log($result['ok'] ? 'cadastro_ok' : 'cadastro_falhou', $result['id_usuario'] ?? null, ['email' => $email, 'primeiro_admin' => $result['admin'] ?? false]);
            styne_respond($result);
        }

        case 'login': {
            $email = styne_valid_email($input['email'] ?? null);
            $pass  = (string)($input['pass'] ?? '');
            if (!$email || $pass === '') {
                styne_respond(['ok' => false, 'error' => 'Informe e-mail e senha.'], 422);
            }
            $u = styne_user_verify_login($email, $pass);
            if (!$u) {
                styne_audit_log('login_failed', null, ['email' => $email]);
                styne_respond(['ok' => false, 'error' => 'E-mail ou senha inválidos.'], 401);
            }
            session_regenerate_id(true); // evita fixação de sessão a cada novo login
            $_SESSION['uid'] = $u['id'];
            styne_audit_log('login_success', $u['id']);
            styne_respond(['ok' => true, 'csrf' => styne_csrf_token(), 'id_usuario' => $u['id'], 'nome_usuario' => $u['nome_usuario'], 'admin' => (bool)$u['admin']]);
        }

        case 'logout': {
            styne_require_csrf($input);
            styne_audit_log('logout', styne_current_user_id());
            $_SESSION = [];
            session_destroy();
            styne_respond(['ok' => true]);
        }

        case 'change_password': {
            $me = styne_require_login();
            styne_require_csrf($input);
            $current = (string)($input['current_password'] ?? '');
            $new = (string)($input['new_password'] ?? '');
            if ($current === '' || strlen($new) < 4) {
                styne_respond(['ok' => false, 'error' => 'Preencha a senha atual e uma nova com pelo menos 4 caracteres.'], 422);
            }
            $result = styne_change_password($me['id'], $current, $new);
            styne_audit_log($result['ok'] ? 'password_changed' : 'password_change_failed', $me['id']);
            styne_respond($result);
        }

        case 'update_profile': {
            $me = styne_require_login();
            styne_require_csrf($input);
            $name  = styne_str($input['name'] ?? '', 255);
            $email = styne_valid_email($input['email'] ?? null);
            if ($name === '' || !$email) {
                styne_respond(['ok' => false, 'error' => 'Preencha nome e um e-mail válido.'], 422);
            }
            $result = styne_update_own_profile($me['id'], $name, $email);
            styne_audit_log($result['ok'] ? 'profile_updated' : 'profile_update_failed', $me['id']);
            styne_respond($result);
        }

        case 'me': {
            $u = styne_current_user();
            $csrf = styne_csrf_token();
            if (!$u) styne_respond(['ok' => false, 'csrf' => $csrf]);
            styne_respond(['ok' => true, 'csrf' => $csrf, 'user' => [
                'id_usuario' => $u['id'], 'nome_usuario' => $u['nome_usuario'],
                'email_usuario' => $u['email_usuario'], 'admin' => (bool)$u['admin'],
            ]]);
        }

        case 'load_state': {
            $me = styne_require_login();
            styne_respond(['ok' => true, 'trails' => styne_load_state($me['id'])]);
        }

        case 'search_tasks': {
            $me = styne_require_login();
            $q = styne_str($input['q'] ?? '', 255);
            if ($q === '') styne_respond(['ok' => true, 'results' => []]);
            styne_respond(['ok' => true, 'results' => styne_search_tasks($me['id'], $q)]);
        }

        case 'my_support_requests': {
            $email = styne_valid_email($input['email'] ?? null);
            if (!$email) styne_respond(['ok' => true, 'requests' => []]);
            styne_respond(['ok' => true, 'requests' => styne_support_requests_by_email($email)]);
        }

        case 'admin_list_support': {
            styne_require_admin();
            styne_respond(['ok' => true, 'requests' => styne_admin_list_support()]);
        }

        case 'support_submit': {
            $email = styne_valid_email($input['email_usuario'] ?? null);
            if (!$email) {
                styne_respond(['ok' => false, 'error' => 'Informe um e-mail válido.'], 422);
            }
            $name    = styne_str($input['nome_usuario'] ?? '', 255);
            $tipo    = styne_str($input['tipo'] ?? '', 20);
            $subject = styne_str($input['assunto'] ?? '', 255);
            $message = styne_str($input['mensagem'] ?? '', 4000);

            $userId = styne_current_user_id();
            styne_respond(styne_support_create($userId, $name, $email, $tipo, $subject, $message));
        }

        case 'sync_state': {
            $me = styne_require_login();
            styne_require_csrf($input);
            $trails = $input['trails'] ?? [];
            if (!is_array($trails)) $trails = [];
            styne_sync_state($me['id'], $trails);
            styne_respond(['ok' => true]);
        }

        case 'admin_search_users': {
            styne_require_admin();
            $q = styne_str($input['q'] ?? '', 255);
            if ($q === '') styne_respond(['ok' => true, 'users' => []]);
            styne_respond(['ok' => true, 'users' => styne_admin_search_users($q)]);
        }

        // Atualiza nome, e-mail e (opcionalmente) a senha de um usuário —
        // sempre identificado pelo ID, nunca por uma busca de texto.
        case 'admin_update_user': {
            styne_require_admin();
            styne_require_csrf($input);
            $id    = styne_valid_id($input['id'] ?? null);
            $email = styne_valid_email($input['email'] ?? null);
            $name  = styne_str($input['name'] ?? '', 255);
            $newPassword = (string)($input['new_password'] ?? '');
            if ($id === null || !$email || $name === '') {
                styne_respond(['ok' => false, 'error' => 'Preencha nome e e-mail válidos para o usuário selecionado.'], 422);
            }
            if ($newPassword !== '' && strlen($newPassword) < 4) {
                styne_respond(['ok' => false, 'error' => 'A nova senha precisa ter pelo menos 4 caracteres.'], 422);
            }
            $result = styne_admin_update_user($id, $name, $email, $newPassword !== '' ? $newPassword : null);
            styne_audit_log($result['ok'] ? 'admin_update_user' : 'admin_update_user_failed', styne_current_user_id(), ['target_id' => $id, 'password_changed' => $newPassword !== '']);
            styne_respond($result);
        }

        case 'admin_set_support_status': {
            styne_require_admin();
            styne_require_csrf($input);
            $id     = styne_str($input['id'] ?? '', 64);
            $status = styne_str($input['status'] ?? '', 20);
            $ok = styne_admin_set_support_status($id, $status);
            styne_audit_log('admin_set_support_status', styne_current_user_id(), ['request_id' => $id, 'status' => $status]);
            styne_respond(['ok' => $ok]);
        }

        case 'admin_db_overview': {
            styne_require_admin();
            styne_respond(['ok' => true, 'counts' => styne_admin_db_overview()]);
        }

        default:
            styne_respond(['ok' => false, 'error' => 'Ação desconhecida.'], 400);
    }
} catch (Throwable $e) {
    error_log('[styne] Erro na API: ' . $e->getMessage());
    styne_respond(['ok' => false, 'error' => 'Erro interno ao processar a solicitação.'], 500);
}
