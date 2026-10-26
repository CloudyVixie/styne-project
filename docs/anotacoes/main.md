# assets/js/main.js

assets/js/main.js
   Inicialização da aplicação — sem localStorage: a cada carregamento
   perguntamos ao backend quem está logado (checkSession) e, se houver
   sessão, buscamos os dados reais do banco (loadStateFromServer)
   antes de renderizar qualquer coisa de "Meu Espaço".
