const ML_PER_L = 1000;

function waterTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function waterLogDay(e) {
  return e.day || new Date(e.ts).toISOString().slice(0, 10);
}

function waterToMl(amount, unit) {
  const n = parseFloat(amount) || 0;
  return unit === 'L' ? n * ML_PER_L : n;
}

function waterFromMl(ml, unit) {
  if (unit === 'L') return n2(ml / ML_PER_L);
  return n2(ml);
}

function waterFmt(ml, unit) {
  unit = unit || 'ml';
  return unit === 'L' ? `${waterFromMl(ml, 'L')} L` : `${n2(ml)} ml`;
}

function waterGoalMl(goal) {
  return waterToMl(goal.goal, goal.unit || 'ml');
}

function waterSlotsTotalMl(goal) {
  return (goal.slots ?? []).reduce((a, s) => a + waterToMl(s.amount, s.unit || 'ml'), 0);
}

function waterDoneMl(goal) {
  const today = waterTodayKey();
  return (goal.log ?? [])
    .filter(e => waterLogDay(e) === today)
    .reduce((a, e) => a + (parseFloat(e.v) || 0), 0);
}

function isSlotDoneToday(goal, slotId) {
  const today = waterTodayKey();
  return (goal.log ?? []).some(e => e.slotId === slotId && waterLogDay(e) === today);
}

function timeToMinutes(t) {
  const [h, m] = String(t || '00:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
function minutesToTime(min) {
  const h = Math.floor(min / 60) % 24;
  const m = Math.round(min % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function isWithinWaterWindow(goal, time) {
  const start = timeToMinutes(goal.startTime || '00:00');
  const end = timeToMinutes(goal.endTime || '23:59');
  const t = timeToMinutes(time);
  if (start <= end) return t >= start && t <= end;
  return t >= start || t <= end;
}

function setWaterProp(tid, fid, gid, prop, val) {
  const trail = getTrail(tid); if (trail?.locked) return;
  const g = findGoal(tid, fid, gid); if (!g) return;
  if ((prop === 'startTime' || prop === 'endTime')) {
    const start = prop === 'startTime' ? val : (g.startTime || '07:00');
    const end = prop === 'endTime' ? val : (g.endTime || '22:00');
    if (timeToMinutes(start) >= timeToMinutes(end)) {
      showToast('O horário de início deve ser antes do término', 'error');
      renderTrail(tid);
      return;
    }
  }
  g[prop] = val;
  save();
  if (prop === 'unit' || prop === 'startTime' || prop === 'endTime') renderTrail(tid);
}

function addWaterSlot(tid, fid, gid) {
  const trail = getTrail(tid); if (trail?.locked) return;
  const g = findGoal(tid, fid, gid); if (!g) return;
  const timeEl = document.getElementById('ws-time-' + gid);
  const amtEl = document.getElementById('ws-amt-' + gid);
  const unitEl = document.getElementById('ws-unit-' + gid);
  const amount = amtEl?.value.trim();
  if (!amount) { showToast('Informe a quantidade', 'error'); return; }
  const time = timeEl?.value || g.startTime || '08:00';
  if (!isWithinWaterWindow(g, time)) {
    showToast(`Escolha um horário entre ${g.startTime || '07:00'} e ${g.endTime || '22:00'}`, 'error');
    return;
  }
  g.slots = g.slots ?? [];
  g.slots.push({
    id: uid(),
    time,
    amount,
    unit: unitEl?.value || 'ml',
  });
  g.slots.sort((a, b) => a.time.localeCompare(b.time));
  if (amtEl) amtEl.value = '';
  save(); renderTrail(tid);
  showToast('Horário adicionado', 'success');
}

function updateWaterSlot(tid, fid, gid, sid, prop, val) {
  const trail = getTrail(tid); if (trail?.locked) return;
  const g = findGoal(tid, fid, gid); if (!g) return;
  const slot = (g.slots ?? []).find(s => s.id === sid);
  if (!slot) return;
  if (prop === 'time' && !isWithinWaterWindow(g, val)) {
    showToast(`Escolha um horário entre ${g.startTime || '07:00'} e ${g.endTime || '22:00'}`, 'error');
    renderTrail(tid);
    return;
  }
  slot[prop] = val;
  if (prop === 'time') {
    g.slots.sort((a, b) => a.time.localeCompare(b.time));
  }
  save(); renderTrail(tid);
}

function deleteWaterSlot(tid, fid, gid, sid) {
  const trail = getTrail(tid); if (trail?.locked) return;
  const g = findGoal(tid, fid, gid); if (!g) return;
  g.slots = (g.slots ?? []).filter(s => s.id !== sid);
  g.log = (g.log ?? []).filter(e => e.slotId !== sid);
  save(); renderTrail(tid);
  showToast('Horário removido', 'success');
}

function divideWaterGoal(tid, fid, gid) {
  const trail = getTrail(tid); if (trail?.locked) return;
  const g = findGoal(tid, fid, gid); if (!g) return;
  const goalMl = waterGoalMl(g);
  if (!goalMl) { showToast('Defina a meta diária primeiro', 'error'); return; }
  const countEl = document.getElementById('ws-div-n-' + gid);
  const count = Math.max(1, Math.min(24, parseInt(countEl?.value) || 8));
  const unit = g.unit || 'ml';
  const perSlotMl = goalMl / count;
  const perSlot = unit === 'L' ? n2(perSlotMl / ML_PER_L) : Math.round(perSlotMl);

  const startMin = timeToMinutes(g.startTime || '07:00');
  let endMin = timeToMinutes(g.endTime || '22:00');
  if (endMin <= startMin) endMin += 24 * 60;
  const span = endMin - startMin;

  const slots = [];
  for (let idx = 0; idx < count; idx++) {
    const offset = count === 1 ? 0 : (span / (count - 1)) * idx;
    const time = minutesToTime(startMin + offset);
    slots.push({ id: uid(), time, amount: String(perSlot), unit });
  }
  slots.sort((a, b) => a.time.localeCompare(b.time));
  g.slots = slots;
  save(); renderTrail(tid);
  showToast(`Meta dividida em ${count} horários, entre ${g.startTime || '07:00'} e ${g.endTime || '22:00'}`, 'success');
}

function toggleWaterSlotDone(tid, fid, gid, sid) {
  const trail = getTrail(tid); if (trail?.locked) return;
  const g = findGoal(tid, fid, gid); if (!g) return;
  const slot = (g.slots ?? []).find(s => s.id === sid);
  if (!slot) return;
  const today = waterTodayKey();
  g.log = g.log ?? [];
  const idx = g.log.findIndex(e => e.slotId === sid && waterLogDay(e) === today);
  if (idx >= 0) {
    g.log.splice(idx, 1);
    showToast('Registro removido', 'success');
  } else {
    const ml = waterToMl(slot.amount, slot.unit || 'ml');
    g.log.unshift({
      id: uid(), v: ml, slotId: sid, note: slot.time, day: today, ts: Date.now(),
    });
    const done = waterDoneMl(g);
    const goal = waterGoalMl(g);
    showToast(`+${waterFmt(ml, g.unit || 'ml')} registrado!${done >= goal && goal ? ' — Meta do dia!' : ''}`, 'success');
  }
  save(); renderTrail(tid);
}

function logWaterExtra(tid, fid, gid) {
  const trail = getTrail(tid); if (trail?.locked) return;
  const g = findGoal(tid, fid, gid); if (!g) return;
  const valEl = document.getElementById('ww-val-' + gid);
  const unitEl = document.getElementById('ww-unit-' + gid);
  const noteEl = document.getElementById('ww-note-' + gid);
  const raw = valEl?.value.trim();
  if (!raw || isNaN(parseFloat(raw))) { showToast('Informe uma quantidade válida', 'error'); return; }
  const unit = unitEl?.value || 'ml';
  const ml = waterToMl(raw, unit);
  if (ml === 0) { showToast('Informe uma quantidade diferente de zero', 'error'); return; }
  const note = noteEl?.value.trim() || 'Extra';
  g.log = g.log ?? [];
  g.log.unshift({
    id: uid(), v: ml, slotId: null, note, day: waterTodayKey(), ts: Date.now(),
  });
  if (valEl) valEl.value = '';
  if (noteEl) noteEl.value = '';
  const done = waterDoneMl(g);
  const goal = waterGoalMl(g);
  save(); renderTrail(tid);
  showToast(`${ml > 0 ? '+' : ''}${waterFmt(ml, g.unit || 'ml')} registrado!${done >= goal && goal ? ' — Meta do dia!' : ''}`, 'success');
}

function deleteWaterLog(tid, fid, gid, eid) {
  const trail = getTrail(tid); if (trail?.locked) return;
  const g = findGoal(tid, fid, gid); if (!g) return;
  g.log = (g.log ?? []).filter(e => e.id !== eid);
  save(); renderTrail(tid);
}
