'use strict';

const program = {
  A: { day: 'Monday', exercises: [
    ['leg-press', 'Leg press', 90, 10, '10–12'],
    ['chest-press', 'Chest press machine', 40, 8, '8–12'],
    ['lat-pulldown', 'Lat pulldown', 55, 10, '10–12'],
    ['shoulder-press', 'Seated shoulder press machine', 20, 10],
    ['pushdown', 'Cable triceps pushdown', 20, 12],
    ['plank', 'Plank', null, 30],
  ] },
  B: { day: 'Wednesday', exercises: [
    ['goblet', 'Goblet squat', 20, 10, null, 'dumbbell'],
    ['row', 'Seated cable row', 50, 10, '10–12'],
    ['incline', 'Incline dumbbell press', 20, 10, null, 'each'],
    ['leg-curl', 'Leg curl machine', 40, 12],
    ['db-curl', 'Dumbbell biceps curl', 15, 12, null, 'each'],
    ['cable-crunch', 'Cable crunch', 30, 12],
  ] },
  C: { day: 'Friday', exercises: [
    ['leg-press', 'Leg press', 90, 12],
    ['chest-press', 'Chest press machine', 40, 10],
    ['lat-pulldown', 'Lat pulldown', 55, 10],
    ['lateral', 'Dumbbell lateral raise', 10, 12, '12–15', 'each'],
    ['cable-curl', 'Cable biceps curl', 20, 12],
    ['plank', 'Plank', null, 30],
  ] },
};

const form = {
  'leg-press': 'Plant your feet shoulder-width on the platform. Lower until your knees bend comfortably while your hips stay against the pad. Press through your whole foot and stop short of locking your knees.',
  'chest-press': 'Adjust the seat so the handles line up with mid-chest. Keep your back against the pad and wrists straight. Press forward, then bring the handles back slowly.',
  'lat-pulldown': 'Secure your thighs under the pad. With a slight lean back, pull your elbows down until the bar approaches your upper chest. Let the bar rise slowly without swinging.',
  'shoulder-press': 'Set the seat so the handles start near shoulder height. Keep your back against the pad and press overhead. Lower slowly to your starting position.',
  pushdown: 'Stand tall with elbows tucked at your sides. Straighten your arms to press the handle down, then bend your elbows slowly while keeping your upper arms still.',
  plank: 'Place your elbows under your shoulders. Brace your abdomen and keep a straight line from head to heels. Breathe steadily without letting your hips sag.',
  goblet: 'Hold one dumbbell close to your chest. Sit down between your hips with your feet flat and knees tracking over your toes. Stand by pressing through your whole foot.',
  row: 'Sit tall with knees slightly bent. Pull the handle toward your lower ribs, keeping your elbows close. Extend your arms slowly without rocking your torso.',
  incline: 'Rest against an inclined bench with a dumbbell in each hand. Lower the weights beside your upper chest with wrists above elbows. Press up smoothly and lower under control.',
  'leg-curl': 'Align your knees with the machine pivot and place the roller above your heels. Bend your knees to pull the roller, keeping your hips against the pad. Return slowly.',
  'db-curl': 'Stand with a dumbbell in each hand and elbows near your sides. Curl with palms facing up, then lower slowly. Keep your torso steady.',
  'cable-crunch': 'Kneel facing a high pulley with the rope beside your head. Keep your hips steady as you curl your ribs toward your pelvis. Return slowly without pulling on the rope with your arms.',
  lateral: 'Start with dumbbells at your sides and a slight bend in your elbows. Raise your arms out to about shoulder height, then lower slowly without swinging.',
  'cable-curl': 'Face a low pulley with an underhand grip. Keep your elbows close to your body as you curl the handle up. Lower slowly without leaning back.',
};

const storageKey = 'bobbys-workout-log-v1';
const view = document.querySelector('#view');
const status = document.querySelector('#status');
const now = new Date();
const today = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
  .map((part, index) => index === 0 ? part : String(part).padStart(2, '0')).join('-');
let date = today;
let plan = { 1: 'A', 3: 'B', 5: 'C' }[now.getDay()] || 'A';
let tab = 'workout';
let sessions = {};

function validBackup(data) {
  if (data?.version !== 1 || !data.sessions || Array.isArray(data.sessions) ||
      typeof data.sessions !== 'object') return false;
  return Object.entries(data.sessions).every(([key, sets]) => {
    const match = /^(\d{4}-\d{2}-\d{2})-([ABC])$/.exec(key);
    return match && Number.isFinite(Date.parse(match[1])) && Array.isArray(sets) && sets.length === 12 &&
      sets.every((set, index) => {
        const bodyweight = program[match[2]].exercises[Math.floor(index / 2)][2] === null;
        return set && typeof set.done === 'boolean' &&
          (bodyweight ? set.weight === null : set.weight === '' || Number.isFinite(set.weight) && set.weight >= 0) &&
          (set.count === '' || Number.isInteger(set.count) && set.count > 0) &&
          (!set.done || set.count !== '' && set.weight !== '');
      });
  });
}

try {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    const data = JSON.parse(saved);
    if (!validBackup(data)) throw new Error('Invalid saved data');
    sessions = data.sessions;
  }
} catch {
  status.textContent = 'Saved data could not be read. This session may only be available until you close the app.';
}

function save(message = '') {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ version: 1, sessions }));
    status.textContent = message;
  } catch {
    status.textContent = 'Your browser could not save these changes. Export a backup before closing this page.';
  }
}

function dateLabel(day) {
  return new Date(day + 'T12:00:00').toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function defaults(exercises) {
  return exercises.flatMap(([, , weight, count]) => [
    { weight, count, done: false }, { weight, count, done: false },
  ]);
}

function workout() {
  const { day, exercises } = program[plan];
  const key = date + '-' + plan;
  const sets = sessions[key] || defaults(exercises);
  view.innerHTML = `
    <div class="days" aria-label="Program day">${Object.entries(program).map(([letter, item]) =>
      `<button data-plan="${letter}" aria-pressed="${letter === plan}">${item.day.slice(0, 3)} · ${letter}</button>`).join('')}</div>
    <div class="session"><div><h2>${day} · Workout ${plan}</h2>
    <p id="set-total">${sets.filter(set => set.done).length} of 12 sets complete</p></div>
    <label>Workout date<input type="date" id="date" value="${date}"></label></div>
    ${exercises.map(([id, name, weight, count, range, qualifier], exerciseIndex) => `
      <section class="card"><div class="exercise-title"><h3>${name}</h3><a href="#form-${id}" data-guide="${id}" aria-label="How to do ${name}">How to <span aria-hidden="true">↗</span></a></div>
      <p>${weight === null ? 'Bodyweight' : weight + ' lb' + (qualifier ? ' ' + qualifier : '')}
      · 2 × ${range || count}${weight === null ? ' sec' : ' reps'}</p>
      ${sets.slice(exerciseIndex * 2, exerciseIndex * 2 + 2).map((set, offset) => {
        const index = exerciseIndex * 2 + offset;
        const label = `${name}, set ${offset + 1}`;
        return `<div class="set"><b>Set ${offset + 1}</b>
          ${weight === null ? '<span></span>' : `<label>lb${qualifier === 'each' ? ' each' : ''}<input type="number" min="0" step="any" inputmode="decimal" data-index="${index}" data-field="weight" aria-label="${label}, pounds" value="${set.weight}"></label>`}
          <label>${weight === null ? 'Seconds' : 'Reps'}<input type="number" min="1" step="1" inputmode="numeric" data-index="${index}" data-field="count" aria-label="${label}, ${weight === null ? 'seconds' : 'reps'}" value="${set.count}"></label>
          <button data-complete="${index}" aria-pressed="${set.done}" aria-label="Complete ${label}">✓</button></div>`;
      }).join('')}</section>`).join('')}`;

  view.querySelectorAll('[data-guide]').forEach(link => link.onclick = event => {
    event.preventDefault();
    const id = link.dataset.guide;
    const dialog = document.querySelector('#form-guide');
    dialog.querySelector('h2').textContent = exercises.find(exercise => exercise[0] === id)[1];
    dialog.querySelector('p').textContent = form[id];
    dialog.showModal();
  });

  view.querySelector('#date').addEventListener('change', event => {
    if (event.target.value && event.target.validity.valid && /^\d{4}-\d{2}-\d{2}$/.test(event.target.value)) date = event.target.value;
    render();
  });
  view.querySelectorAll('[data-plan]').forEach(button => button.onclick = () => {
    plan = button.dataset.plan;
    render();
    view.querySelector('[data-plan="' + plan + '"]').focus();
  });
  view.querySelectorAll('[data-field]').forEach(input => input.oninput = () => {
    const { field, index } = input.dataset;
    const set = sets[index];
    set[field] = input.value !== '' && input.validity.valid ? input.valueAsNumber : '';
    if (set[field] === '') set.done = false;
    sessions[key] = sets;
    save();
    refreshCompletion();
  });

  function refreshCompletion() {
    view.querySelector('#set-total').textContent = sets.filter(set => set.done).length + ' of 12 sets complete';
    view.querySelectorAll('[data-complete]').forEach(button => {
      button.setAttribute('aria-pressed', sets[button.dataset.complete].done);
    });
  }

  view.querySelectorAll('[data-complete]').forEach(button => button.onclick = () => {
    const index = button.dataset.complete;
    const set = sets[index];
    if (set.weight === '' || set.count === '') {
      const field = set.weight === '' ? 'weight' : 'count';
      status.textContent = 'Enter a valid weight and rep or time value first.';
      view.querySelector(`[data-index="${index}"][data-field="${field}"]`).focus();
      return;
    }
    set.done = !set.done;
    sessions[key] = sets;
    save();
    refreshCompletion();
  });
}

function loggedSessions() {
  return Object.entries(sessions).sort(([a], [b]) => b.localeCompare(a))
    .filter(([, sets]) => sets.some(set => set.done))
    .map(([key, sets]) => ({ key, date: key.slice(0, -2), plan: key.at(-1), sets }));
}

function setLabel(set) {
  return set.weight === null ? `${set.count} sec` : `${set.weight} lb × ${set.count}`;
}

function history() {
  const logs = loggedSessions();
  view.innerHTML = '<h2>Workout history</h2>' + (logs.length ? logs.map(log => `
    <details><summary>${dateLabel(log.date)} · Workout ${log.plan} · ${log.sets.filter(set => set.done).length}/12 sets</summary>
    <ul>${program[log.plan].exercises.map(([, name, , , , qualifier], index) => {
      const sets = log.sets.slice(index * 2, index * 2 + 2)
        .flatMap((set, offset) => set.done ? [`Set ${offset + 1} · ${setLabel(set)}`] : []);
      return sets.length ? `<li><strong>${name}</strong>${qualifier === 'each' ? ' (lb each)' : ''}<br>${sets.join(' · ')}</li>` : '';
    }).join('')}</ul><button data-edit="${log.key}">Edit workout</button></details>`).join('')
    : '<p>Mark a set complete to start your history.</p>');
  view.querySelectorAll('[data-edit]').forEach(button => button.onclick = () => {
    date = button.dataset.edit.slice(0, -2);
    plan = button.dataset.edit.at(-1);
    tab = 'workout';
    render();
    view.querySelector('#date').focus();
  });
}

function progress() {
  const logs = loggedSessions();
  const completed = logs.flatMap(log => log.sets.filter(set => set.done)).length;
  const full = logs.filter(log => log.sets.every(set => set.done)).length;
  const bests = new Map();
  const compare = (a, b) => (a.weight ?? 0) - (b.weight ?? 0) || a.count - b.count;
  for (const log of logs) {
    program[log.plan].exercises.forEach(([id, name, , , , qualifier], index) => {
      const sets = log.sets.slice(index * 2, index * 2 + 2).filter(set => set.done);
      if (!sets.length) return;
      const bestSet = sets.reduce((a, b) => compare(a, b) >= 0 ? a : b);
      if (!bests.has(id)) bests.set(id, { name, qualifier, latest: bestSet, date: log.date, best: bestSet });
      const row = bests.get(id);
      if (compare(bestSet, row.best) > 0) row.best = bestSet;
    });
  }
  view.innerHTML = `<h2>Progress</h2><div class="stats">
    <div class="stat"><strong>${logs.length}</strong>Sessions logged</div>
    <div class="stat"><strong>${full}</strong>Full workouts</div>
    <div class="stat"><strong>${completed}</strong>Sets completed</div></div>
    <h2>Exercise records</h2>
    ${[...bests.values()].map(row => `<section class="card"><h3>${row.name}${row.qualifier === 'each' ? ' · lb each' : ''}</h3>
    <p>Best · ${setLabel(row.best)}</p><p>Latest · ${setLabel(row.latest)} · ${dateLabel(row.date)}</p></section>`).join('') ||
    '<p>Complete sets to see your latest and best results.</p>'}`;
}

function render() {
  document.querySelectorAll('[data-tab]').forEach(button => button.setAttribute('aria-pressed', button.dataset.tab === tab));
  ({ workout, history, progress })[tab]();
}

document.querySelector('nav').onclick = event => {
  if (!event.target.dataset.tab) return;
  tab = event.target.dataset.tab;
  render();
};

document.querySelector('#export').onclick = () => {
  const blob = new Blob([JSON.stringify({ version: 1, sessions }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bobbys-workout-backup-${today}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
};

const backup = document.querySelector('#backup');
document.querySelector('#import').onclick = () => backup.click();
backup.onchange = async () => {
  const file = backup.files[0];
  backup.value = '';
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!validBackup(data)) throw new Error('Invalid backup');
    if (!confirm('Restore this backup? It will replace all workout data currently in this browser.')) return;
    sessions = data.sessions;
    save('Backup restored.');
    render();
  } catch {
    status.textContent = 'Could not read this workout backup.';
  }
};

render();
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('./sw.js').catch(() => {
    status.textContent = 'Offline setup failed. You can still use the app while online.';
  });
}
