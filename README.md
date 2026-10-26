# Styne — Divisor de Tempo ☁️

> Quebre o **grande** em **pequeno**. Organize estudos, metas financeiras, hidratação e projetos em trilhas.

Projeto Final — Faetec 2025

---

## 📁 Estrutura do Projeto

```
projeto-final-faetec/
├── index.html                  # Página principal (ponto de entrada)
├── LICENSE                     # Licença do projeto
├── README.md                   # Este arquivo
└── assets/
    ├── components/
    │   └── header.css          # Estilos do header/topbar
    ├── css/
    │   ├── global/
    │   │   ├── variables.css   # ⭐ Tokens de design (edite aqui para mudar cores)
    │   │   ├── normalize.css   # Reset e base do navegador
    │   │   ├── global.css      # Layout: grid bg, topbar, sidebar, main, footer
    │   │   ├── elements.css    # Componentes: botões, badges, modal, toast
    │   │   └── objetivosSistema.css  # Pastas, itens, painéis de metas
    │   └── pages/
    │       ├── lp.css          # Landing page (página Início)
    │       ├── login.css       # Login / Conta / Painel admin
    │       └── sobre/
    │           ├── Sobre.css               # Página Sobre
    │           ├── cards.css               # Cards de funcionalidades
    │           ├── containers.css          # Containers e wrappers
    │           ├── imagens.css             # Diagramas e figuras
    │           ├── justificativaSistema.css# Seção de justificativa
    │           ├── objetivosSistema.css    # Seção de objetivos
    │           ├── requisitosSistema.css   # Tabela de requisitos
    │           └── objetivos.css           # Hero de objetivos
    ├── fonts/                  # Fontes locais (opcional — ver fonts.css)
    ├── icons/                  # Ícones SVG (opcional)
    ├── images/
    │   ├── diagramaDeCasoDeUso.jpeg
    │   └── diagramaDeClasse.jpeg
    └── js/
        ├── app.js              # Documentação da ordem de imports
        ├── state.js            # Estado global + localStorage + entidades Usuário/Administrador
        ├── utils.js            # Utilitários (uid, esc, toast, modal)
        ├── router.js           # Roteamento de páginas sem reload
        ├── tree.js             # Buscas/contagens (trilha/pasta, não-recursivo)
        ├── trails.js           # CRUD de trilhas
        ├── nodes.js            # CRUD de pastas (nível raiz — sem subpastas)
        ├── goals.js            # CRUD de metas (cronograma/financeira/água), múltiplas por tipo
        ├── items.js            # CRUD de itens/checklist
        ├── schedule.js         # Cronograma adaptativo (por meta)
        ├── finance.js          # Metas financeiras + conversor/divisor/juros
        ├── water.js            # Hidratação, com janela de horário início/término
        ├── render.js           # Toda a renderização HTML
        ├── account.js          # Conta do usuário, suporte e painel administrativo
        ├── icons.js             # Seletor de ícones
        └── main.js              # Inicialização
```

---

## 🚀 Como Usar

1. Clone o repositório:
   ```bash
   git clone https://github.com/CloudyVixie/projeto-final-faetec.git
   cd projeto-final-faetec
   ```

2. Abra `index.html` no navegador — **sem servidor necessário**.

3. Para usar com Live Server (VS Code): instale a extensão e clique em "Go Live".

---

## ✨ Funcionalidades

### Trilhas e pastas
- **Trilhas → Pastas (somente nível raiz)** — pastas nunca contêm outras pastas. Toda operação de item/meta ocorre diretamente na trilha ou em uma pasta de raiz.
- **Renomeação** de trilhas, pastas, metas e itens diretamente na interface.
- **Checklist** com checkbox, quantidade e unidade personalizável por item — itens repetidos são sempre permitidos.
- **Metas sem limite por tipo** — uma trilha ou pasta pode ter quantas metas de cronograma, financeira ou água quiser, inclusive repetidas.

### Metas
- **Cronograma adaptativo**: meta diária recalculada conforme o progresso real
  - Unidades: páginas, capítulos, exercícios, minutos, horas, vídeos, slides, personalizado
  - Dias de descanso clicáveis por semana
  - Histórico de registros com suporte a correções (valores negativos)
- **Meta financeira** com depósitos e retiradas — prazo se ajusta automaticamente
- **Hidratação** com meta diária (L ou ml) e **horário de início/término**: todos os lembretes (automáticos ou manuais) ficam restritos a esse intervalo

### Ferramentas financeiras (🧮 Finanças, por trilha)
- **Conversor de moedas** entre Real (BRL), Dólar (USD) e Euro (EUR), com cotação estimada fixa (não consulta valores em tempo real)
- **Divisor de valores**: informe o valor final desejado, a quantidade de participantes e o período em meses — o sistema calcula a contribuição mensal por participante
- **Calculadora de juros** simples e compostos: capital inicial, taxa e período → valor final e juros obtidos

### Conta, suporte e administração
- Cada **Usuário** (`id_usuario, nome_usuario, email_usuario`) tem suas trilhas, metas e progresso salvos localmente, e pode enviar **solicitações de suporte** ou **reportar problemas**
- O **Administrador** (`id_usuario, nome_usuario, email_usuario`) visualiza as solicitações recebidas e pode **atualizar os dados cadastrais do usuário** (ex.: recuperação de acesso)

### Geral
- **Modo bloqueado** — evita edição acidental
- **Dados persistidos** no `localStorage` do navegador
- Preparado para integração futura com um backend/banco de dados real

---

## 🗄️ Modelo de Dados (resumo)

```
Trail  { id, name, icon, locked, folders[], items[], goals[] }
Folder { id, name, icon, colorIdx, open, items[], goals[] }   // sem subpastas
Goal   { id, type: 'sched'|'fin'|'water', name, open, ...campos do tipo }
Item   { id, name, done, qty, unit }

Usuario       { id_usuario, nome_usuario, email_usuario }
Administrador { id_usuario, nome_usuario, email_usuario }
SupportRequest{ id, id_usuario, nome_usuario, email_usuario, tipo, assunto, mensagem, status, criadoEm }
```

Veja comentários completos em `assets/js/state.js` e a seção **"Modelo de Dados"** da página Sobre no próprio app.

---

## 🎨 Personalização Visual

Para mudar a identidade visual do site, edite **apenas** `assets/css/global/variables.css`:

```css
:root {
  --red:   #e94560;   /* cor de destaque */
  --navy:  #1a1a2e;   /* cor escura/primária */
  --bg:    #fffaf4;   /* fundo */
  /* ... */
}
```

---

## 🛠 Adicionar Funcionalidade

1. **Nova página**: crie `<div id="page-nome" class="page">` em `index.html`, adicione link na topbar, crie CSS em `assets/css/pages/nome.css`, e trate a rota em `router.js`
2. **Novo módulo JS**: crie `assets/js/modulo.js` com comentário de documentação no topo, importe no final de `index.html` (respeitando a ordem descrita em `app.js`)
3. **Novo estilo**: crie CSS em `assets/css/global/` ou `assets/css/pages/` e importe no `<head>` do `index.html`
4. **Novo tipo de meta**: adicione o tipo em `goals.js` (`defaultGoal`), a lógica de cálculo em um novo arquivo (como `schedule.js`/`finance.js`/`water.js`) e o painel correspondente em `render.js`

---

## 📄 Licença

MIT — veja `LICENSE` para detalhes.
