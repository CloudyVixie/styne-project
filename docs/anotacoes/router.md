# assets/js/router.js

assets/js/router.js
   Roteamento de páginas sem reload.
   
   Páginas disponíveis: inicio, app, sobre, login, cadastro, suporte, admin
   
   Para adicionar uma nova página:
   1. Crie <div id="page-nomepagina" class="page"> no index.html
   2. Adicione o link na topbar com onclick="goPage('nomepagina')"
   3. Crie o CSS em assets/css/pages/nomepagina.css
   4. Importe o CSS no index.html
