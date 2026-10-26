# assets/js/account.js

assets/js/account.js
   Autenticação (login/cadastro/logout), Suporte e Painel do
   Administrador. NADA aqui guarda senha ou lista de contas no
   cliente — toda credencial é validada pelo backend, que é a
   única fonte de verdade (banco de dados).

   `S.currentUser` é apenas um espelho do que o backend confirmou
   para a sessão atual: { id_usuario, nome_usuario, email_usuario,
   admin }. Ele nunca é usado para autenticar — só para exibir a UI.

   Funções:
   - handleCadastro()              → cria conta no backend (admin=false)
   - handleLogin()                 → autentica no backend, carrega o estado
   - handleLogout()                → sincroniza pendências e encerra a sessão
   - updateAuthUI()                → alterna botão Login/Sair e visibilidade
                                      do Painel Administrativo
   - renderSuportePage()           → preenche a seção de Suporte
   - submitSupportRequest(tipo)    → envia solicitação de suporte ou
                                      reporte de problema (não exige login)
   - renderAdminPage()             → lista solicitações + form de usuário
   - adminSearchUsers()            → busca contas no banco (admin)
   - adminSetStatus(id,status)     → administrador marca aberto/resolvido
   - adminUpdateUserData()         → administrador atualiza o cadastro
                                      do usuário (ex.: recuperação de acesso)
