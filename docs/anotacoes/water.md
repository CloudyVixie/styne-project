# assets/js/water.js

assets/js/water.js
   Meta diária de água com horários e quantidades (L ou ml).

   NOVIDADE: cada meta de hidratação tem um horário de início
   (startTime) e um horário de término (endTime). TODOS os
   lembretes/horários — tanto os gerados automaticamente por
   divideWaterGoal() quanto os adicionados manualmente — são
   distribuídos/validados apenas dentro desse intervalo.

   Funções:
   - waterToMl / waterFmt / waterGoalMl / waterDoneMl
   - setWaterProp, addWaterSlot, updateWaterSlot, deleteWaterSlot
   - divideWaterGoal          → divide meta igualmente em N horários,
                                 distribuídos entre startTime e endTime
   - toggleWaterSlotDone      → marca/desmarca horário bebido hoje
   - logWaterExtra            → registro avulso (extra ou correção)
   - deleteWaterLog           → remove entrada do histórico de hoje
