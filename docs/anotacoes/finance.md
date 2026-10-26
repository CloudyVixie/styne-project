# assets/js/finance.js

assets/js/finance.js
   Área de Finanças: 4 funções independentes, cada uma podendo ter
   múltiplas instâncias livremente (na raiz da trilha ou em
   qualquer pasta) — Meta financeira, Conversor de moedas, Divisor
   de valores e Calculadora de juros. Acessíveis pelo mini-menu de
   Finanças (ver buildFinFan em render.js / toggleFinFan em utils.js).

   ── META FINANCEIRA ──────────────────────────────────────────
   Conceito: o prazo é recalculado com base no SALDO REAL (log de
   movimentações), não na contribuição base. Depósitos extras
   encurtam o prazo; retiradas de emergência o aumentam.
   - setFinProp(tid,fid,gid,prop,val)  → genérico, usado por todas as 4 funções
   - finBalance(goal)
   - calcFin(tid,fid,gid)
   - logFinance(tid,fid,gid)
   - deleteFinLog(tid,fid,gid,eid)

   ── CONVERSOR · DIVISOR · JUROS (cada um por instância) ──────
   - EXCHANGE_RATES                     → cotação estimada fixa (BRL base)
   - convertCurrency(tid,fid,gid)       → conversor BRL/USD/EUR
   - calcSplit(tid,fid,gid)             → divisor de valores entre participantes
   - calcInterest(tid,fid,gid)          → juros simples e compostos
