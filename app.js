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
let extras = {};
let notes = {};

function validBackup(data) {
  if (data?.version !== 1 || !data.sessions || Array.isArray(data.sessions) ||
      typeof data.sessions !== 'object') return false;
  if (data.extras !== undefined && (!data.extras || typeof data.extras !== 'object' ||
      Array.isArray(data.extras) || !Object.entries(data.extras).every(([key, rows]) =>
        /^\d{4}-\d{2}-\d{2}-[ABC]$/.test(key) && Array.isArray(rows) && rows.every(row =>
          row && typeof row.name === 'string' && row.name.trim().length > 0 && row.name.length <= 80 &&
          Number.isInteger(row.sets) && row.sets > 0 && row.sets <= 99 &&
          Number.isInteger(row.reps) && row.reps > 0 && row.reps <= 999)))) return false;
  if (data.notes !== undefined && (!data.notes || typeof data.notes !== 'object' ||
      Array.isArray(data.notes) || !Object.values(data.notes).every(note => typeof note === 'string' && note.length <= 500))) return false;
  if (Object.values(data.extras || {}).some(rows => rows.some(row => row.actual !== undefined &&
      (!Array.isArray(row.actual) || row.actual.length !== row.sets || row.actual.some(set =>
        !set || typeof set.done !== 'boolean' || !(set.weight === null || Number.isFinite(set.weight) && set.weight >= 0) ||
        !Number.isInteger(set.count) || set.count < 1 || set.count > 999))))) return false;
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
  const selection = JSON.parse(localStorage.getItem(storageKey + '-selection'));
  if (selection && /^\d{4}-\d{2}-\d{2}$/.test(selection.date) &&
      Number.isFinite(Date.parse(selection.date)) && ['A', 'B', 'C'].includes(selection.plan)) {
    date = selection.date;
    plan = selection.plan;
  }
} catch {
  // The current date and default workout are usable if preferences are unavailable.
}
try {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    const data = JSON.parse(saved);
    if (!validBackup(data)) throw new Error('Invalid saved data');
    sessions = data.sessions;
    extras = data.extras || {};
    notes = data.notes || {};
  }
} catch {
  status.textContent = 'Saved data could not be read. This session may only be available until you close the app.';
}

function save(message = '') {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ version: 1, sessions, extras, notes }));
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

const timer = document.querySelector('#rest');
let restInterval;
let restId;
const restOverrides = new Map();

function startRest(duration) {
  clearInterval(restInterval);
  timer.hidden = false;
  document.body.classList.add('rest-visible');
  const end = Date.now() + duration * 1000;
  const update = () => {
    const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    timer.querySelector('output').textContent = left
      ? Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0')
      : 'Rest complete';
    if (!left) {
      clearInterval(restInterval);
      navigator.vibrate?.([200, 100, 200]);
    }
  };
  timer.querySelectorAll('[data-rest]').forEach(button => button.setAttribute('aria-pressed', Number(button.dataset.rest) === duration));
  restInterval = setInterval(update, 250);
  update();
}

timer.querySelectorAll('[data-rest]').forEach(button => button.onclick = () => {
  const duration = Number(button.dataset.rest);
  restOverrides.set(restId, duration);
  startRest(duration);
});

document.querySelector('#rest-close').onclick = () => {
  clearInterval(restInterval);
  timer.hidden = true;
  document.body.classList.remove('rest-visible');
};

function lastTime(id) {
  for (const log of loggedSessions()) {
    if (log.date >= date) continue;
    const index = program[log.plan].exercises.findIndex(exercise => exercise[0] === id);
    if (index < 0) continue;
    const results = log.sets.slice(index * 2, index * 2 + 2).flatMap((set, offset) => {
      if (!set.done) return [];
      const result = set.weight === null ? 'Hold ' + set.count + ' sec'
        : 'Weight ' + set.weight + ' lb' + (program[log.plan].exercises[index][5] === 'each' ? ' each' : '') + ' · Reps ' + set.count;
      return ['Set ' + (offset + 1) + ' · ' + result];
    });
    if (results.length) return results;
  }
  return [];
}

function workout() {
  const { exercises } = program[plan];
  const weekday = new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'long' });
  const key = date + '-' + plan;
  const sets = sessions[key] || defaults(exercises);
  view.innerHTML = `
    <div class="days" aria-label="Program day">${Object.entries(program).map(([letter, item]) =>
      `<button data-plan="${letter}" aria-pressed="${letter === plan}">${item.day.slice(0, 3)} · ${letter}</button>`).join('')}</div>
    <div class="session"><div><h2>${weekday} Workout ${plan}</h2>
    <p id="set-total">${sets.filter(set => set.done).length} of 12 sets complete</p></div>
    <label>Workout date<input type="date" id="date" value="${date}"></label></div>
    ${exercises.map(([id, name, weight, count, range, qualifier], exerciseIndex) => {
      const last = lastTime(id);
      return `
      <section class="card"><div class="exercise-title"><h3>${name}</h3><a href="#form-${id}" data-guide="${id}" aria-label="How to do ${name}">How to <span aria-hidden="true">↗</span></a></div>
      <p>${weight === null ? 'Bodyweight' : weight + ' lb' + (qualifier ? ' ' + qualifier : '')}
      · 2 × ${range || count}${weight === null ? ' sec' : ' reps'}</p>
      ${last.length ? `<p class="last-time"><strong>Last time</strong><br>${last.join('<br>')}</p>` : ''}
      ${sets.slice(exerciseIndex * 2, exerciseIndex * 2 + 2).map((set, offset) => {
        const index = exerciseIndex * 2 + offset;
        const label = `${name}, set ${offset + 1}`;
        return `<div class="set"><b>Set ${offset + 1}</b>
          ${weight === null ? '<span></span>' : `<label>lb${qualifier === 'each' ? ' each' : ''}<input type="number" min="0" step="any" inputmode="decimal" data-index="${index}" data-field="weight" aria-label="${label}, pounds" value="${set.weight}"></label>`}
          <label>${weight === null ? 'Seconds' : 'Reps'}<input type="number" min="1" step="1" inputmode="numeric" data-index="${index}" data-field="count" aria-label="${label}, ${weight === null ? 'seconds' : 'reps'}" value="${set.count}"></label>
          <button data-complete="${index}" aria-pressed="${set.done}" aria-label="Complete ${label}">✓</button></div>`;
      }).join('')}</section>`; }).join('')}`;

  view.insertAdjacentHTML('beforeend', `<section class="card"><h3>Custom exercises</h3>
    <div id="extra-list"></div>
    <form id="extra-form"><label>Exercise<input name="exercise" maxlength="80" required></label>
      <label>Sets<input name="sets" type="number" inputmode="numeric" min="1" max="99" value="2" required></label>
      <label>Reps per set<input name="reps" type="number" inputmode="numeric" min="1" max="999" value="10" required></label>
      <button>Add exercise</button>
    </form></section>`);
  const list = view.querySelector('#extra-list');
  function showExtras() {
    list.replaceChildren();
    (extras[key] || []).forEach((row, index) => {
      const item = document.createElement('section');
      item.className = 'card';
      const title = document.createElement('h3');
      title.textContent = row.name;
      item.append(title);
      const earlier = loggedSessions().find(log => log.date < date &&
        (extras[log.key] || []).some(extra => sameExercise(extra.name, row.name) && actualSets(extra).some(set => set.done)));
      if (earlier) {
        const previous = document.createElement('p');
        previous.className = 'last-time';
        previous.textContent = 'Last time · ' + (extras[earlier.key] || [])
          .filter(extra => sameExercise(extra.name, row.name))
          .flatMap(extra => actualSets(extra).flatMap((set, i) => set.done
            ? ['Set ' + (i + 1) + ' · ' + extraSetLabel(set)] : [])).join(' / ');
        item.append(previous);
      }
      actualSets(row).forEach((set, offset) => {
        const line = document.createElement('div');
        line.className = 'set';
        line.innerHTML = `<b>Set ${offset + 1}</b><label>lb (optional)<input type="number" min="0" step="any" inputmode="decimal"></label>
          <label>Reps<input type="number" min="1" max="999" inputmode="numeric" required></label><button type="button">✓</button>`;
        const [weight, count] = line.querySelectorAll('input');
        const complete = line.querySelector('button');
        weight.value = set.weight ?? '';
        count.value = set.count;
        complete.setAttribute('aria-label', 'Complete ' + row.name + ', set ' + (offset + 1));
        const refresh = () => complete.setAttribute('aria-pressed', set.done);
        const edit = () => {
          if (!weight.validity.valid || !count.validity.valid) return false;
          set.weight = weight.value === '' ? null : weight.valueAsNumber;
          set.count = count.valueAsNumber;
          save();
          return true;
        };
        weight.oninput = count.oninput = edit;
        complete.onclick = () => {
          if (!edit()) {
            weight.reportValidity();
            count.reportValidity();
            return;
          }
          set.done = !set.done;
          save();
          refresh();
          if (set.done) {
            restId = 'custom:' + row.name.toLowerCase();
            timer.querySelector('strong').textContent = row.name;
            startRest(restOverrides.get(restId) ?? 60);
          }
        };
        refresh();
        item.append(line);
      });
      const remove = document.createElement('button');
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', 'Remove ' + row.name);
      remove.onclick = () => {
        extras[key].splice(index, 1);
        if (!extras[key].length) delete extras[key];
        save();
        showExtras();
        view.querySelector('#extra-form input').focus();
      };
      item.append(remove);
      list.append(item);
    });
  }
  showExtras();
  view.querySelector('#extra-form').onsubmit = event => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const name = fields.get('exercise').trim();
    if (!name) return;
    const sets = Number(fields.get('sets'));
    const reps = Number(fields.get('reps'));
    const actual = Array.from({ length: sets }, () => ({ count: reps, weight: null, done: false }));
    (extras[key] ||= []).push({ name, sets, reps, actual });
    save();
    form.reset();
    showExtras();
  };

  view.insertAdjacentHTML('beforeend', '<section class="card"><label for="workout-note">Workout note</label><textarea id="workout-note" maxlength="500" rows="3"></textarea><p id="previous-note"></p><button id="finish-workout">Finish workout</button></section>');
  const note = view.querySelector('#workout-note');
  note.value = notes[key] || '';
  note.oninput = () => {
    if (note.value.trim()) notes[key] = note.value;
    else delete notes[key];
    save();
  };
  const previousNote = Object.keys(notes).sort().reverse().find(entry => entry.endsWith('-' + plan) && entry.slice(0, -2) < date);
  if (previousNote) view.querySelector('#previous-note').textContent = 'Last Workout ' + plan + ' note · ' + notes[previousNote];
  view.querySelector('#finish-workout').onclick = () => {
    const groups = workoutResults({ key, plan, sets });
    const completed = groups.flatMap(group => group.sets).filter(set => set.done).length;
    const skipped = groups.flatMap(group => group.sets).length - completed;
    const prior = loggedSessions().filter(log => log.date < date).flatMap(workoutResults);
    const score = (a, b) => (a.weight ?? 0) - (b.weight ?? 0) || a.count - b.count;
    const best = groups.filter(group => {
      const previous = prior.filter(item => item.id === group.id).flatMap(item => item.sets).filter(set => set.done);
      return previous.length && group.sets.some(set => set.done && previous.every(other => score(set, other) > 0));
    }).map(group => group.name);
    const summary = document.querySelector('#finish-summary');
    summary.querySelector('p').textContent = completed + ' completed · ' + skipped + ' skipped';
    summary.querySelector('ul').replaceChildren(...best.map(name => {
      const item = document.createElement('li');
      item.textContent = name;
      return item;
    }));
    summary.querySelector('h3').textContent = best.length ? 'Personal bests' : 'No new personal bests';
    summary.showModal();
  };

  view.querySelectorAll('[data-guide]').forEach(link => link.onclick = event => {
    event.preventDefault();
    const id = link.dataset.guide;
    const dialog = document.querySelector('#form-guide');
    dialog.querySelector('h2').textContent = exercises.find(exercise => exercise[0] === id)[1];
    dialog.querySelector('p').textContent = form[id];
    const exercise = dialog.querySelector('h2').textContent;
    const query = id === 'plank' ? 'forearm plank proper form' : exercise + ' proper form demonstration';
    dialog.querySelector('#form-video').href = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query);
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
    if (set.done) {
      const [id, name] = exercises[Math.floor(index / 2)];
      restId = id;
      timer.querySelector('strong').textContent = name;
      const duration = ['leg-press', 'goblet'].includes(id) ? 120 :
        ['chest-press', 'lat-pulldown', 'shoulder-press', 'row', 'incline'].includes(id) ? 90 : 60;
      startRest(restOverrides.get(id) ?? duration);
    }
    sessions[key] = sets;
    save();
    refreshCompletion();
  });
}

function loggedSessions() {
  return [...new Set([...Object.keys(sessions), ...Object.keys(extras), ...Object.keys(notes)])].sort().reverse()
    .map(key => {
      const plan = key.at(-1);
      return { key, date: key.slice(0, -2), plan, sets: sessions[key] || defaults(program[plan].exercises) };
    }).filter(log => log.sets.some(set => set.done) || extras[log.key]?.some(row => actualSets(row).some(set => set.done)) || notes[log.key]);
}

function setLabel(set) {
  return set.weight === null ? `${set.count} sec` : `${set.weight} lb × ${set.count}`;
}

function actualSets(row) {
  row.actual ??= Array.from({ length: row.sets }, () => ({ weight: null, count: row.reps, done: true }));
  return row.actual;
}

function sameExercise(a, b) {
  return a.toLowerCase() === b.toLowerCase();
}

function extraSetLabel(set) {
  return (set.weight === null ? '' : 'Weight ' + set.weight + ' lb · ') + 'Reps ' + set.count;
}

function workoutResults(log) {
  return [
    ...program[log.plan].exercises.map(([id, name], index) => ({
      id, name, sets: log.sets.slice(index * 2, index * 2 + 2),
    })),
    ...(extras[log.key] || []).map(row => ({
      id: 'custom:' + row.name.toLowerCase(), name: row.name, sets: actualSets(row),
    })),
  ];
}

function historyChart(logs) {
  const card = document.createElement('section');
  card.className = 'card';
  card.innerHTML = '<h3>Exercise progress</h3><label>Exercise<select id="chart-exercise"></select></label> <label>Measure<select id="chart-measure"></select></label><div id="chart"></div>';
  view.querySelector('h2').after(card);
  const byExercise = new Map();
  for (const log of [...logs].reverse()) {
    function add(id, name, sets) {
      if (!byExercise.has(id)) byExercise.set(id, { name, points: [] });
      byExercise.get(id).points.push({ date: log.date, plan: log.plan, sets });
    }
    program[log.plan].exercises.forEach(([id, name], index) => {
      const sets = log.sets.slice(index * 2, index * 2 + 2).filter(set => set.done);
      if (sets.length) add(id, name, sets);
    });
    for (const row of extras[log.key] || []) {
      const sets = actualSets(row).filter(set => set.done);
      if (sets.length) add('custom:' + row.name.toLowerCase(), row.name + ' (custom)', sets);
    }
  }
  const exercise = card.querySelector('#chart-exercise');
  const measure = card.querySelector('#chart-measure');
  const chart = card.querySelector('#chart');
  if (!byExercise.size) {
    card.querySelectorAll('label').forEach(label => label.remove());
    chart.textContent = 'Log an exercise to see your progress here.';
    return;
  }
  for (const [id, item] of byExercise) exercise.add(new Option(item.name, id));
  function renderChart() {
    const field = measure.value;
    const points = byExercise.get(exercise.value).points
      .filter(point => point.sets.some(set => typeof set[field] === 'number')).slice(-12);
    const unit = measure.selectedOptions[0].textContent;
    const values = points.map(point => Math.max(...point.sets.map(set => set[field])));
    const max = Math.max(1, ...values);
    chart.replaceChildren();
    points.forEach((point, index) => {
      const row = document.createElement('div');
      row.className = 'chart-row';
      const label = document.createElement('span');
      label.textContent = dateLabel(point.date) + ' · ' + point.plan;
      const bar = document.createElement('meter');
      bar.min = 0;
      bar.max = max;
      bar.value = values[index];
      bar.setAttribute('aria-label', label.textContent + ', ' + unit);
      const value = document.createElement('strong');
      value.textContent = values[index];
      row.append(label, bar, value);
      chart.append(row);
    });
  }
  function chooseExercise() {
    const weight = byExercise.get(exercise.value).points[0].sets[0].weight;
    const count = weight === null && !exercise.value.startsWith('custom:') ? 'Seconds' : 'Reps';
    measure.replaceChildren();
    if (byExercise.get(exercise.value).points.some(point => point.sets.some(set => typeof set.weight === 'number'))) measure.add(new Option(
      ['incline', 'db-curl', 'lateral'].includes(exercise.value) ? 'Weight (lb each)' : 'Weight (lb)', 'weight'));
    measure.add(new Option(count, 'count'));
    renderChart();
  }
  exercise.onchange = chooseExercise;
  measure.onchange = renderChart;
  chooseExercise();
}

function history() {
  const logs = loggedSessions();
  view.innerHTML = '<h2>Workout history</h2>' + (logs.length ? logs.map(log => `
    <details><summary>${dateLabel(log.date)} · Workout ${log.plan} · ${log.sets.filter(set => set.done).length}/12 sets</summary>
    <ul>${program[log.plan].exercises.map(([, name, , , , qualifier], index) => {
      const sets = log.sets.slice(index * 2, index * 2 + 2)
        .flatMap((set, offset) => set.done ? [`Set ${offset + 1} · ${setLabel(set)}`] : []);
      return sets.length ? `<li><strong>${name}</strong>${qualifier === 'each' ? ' (lb each)' : ''}<br>${sets.join(' · ')}</li>` : '';
    }).join('')}</ul><ul data-extra-history="${log.key}"></ul><button data-edit="${log.key}">Edit workout</button></details>`).join('')
    : '<p>Mark a set complete to start your history.</p>');
  view.querySelectorAll('[data-extra-history]').forEach(list => {
    for (const row of extras[list.dataset.extraHistory] || []) {
      const item = document.createElement('li');
      const completed = actualSets(row).flatMap((set, index) => set.done ? ['Set ' + (index + 1) + ' · ' + extraSetLabel(set)] : []);
      if (!completed.length) continue;
      item.textContent = row.name + ' · ' + completed.join(' / ');
      list.append(item);
    }
  });
  for (const log of logs) {
    if (!notes[log.key]) continue;
    const note = document.createElement('p');
    note.textContent = 'Workout note · ' + notes[log.key];
    view.querySelector('[data-extra-history="' + log.key + '"]').after(note);
  }
  historyChart(logs);
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
  const completed = logs.reduce((sum, log) => sum + log.sets.filter(set => set.done).length +
    (extras[log.key] || []).reduce((total, row) => total + actualSets(row).filter(set => set.done).length, 0), 0);
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
  try {
    localStorage.setItem(storageKey + '-selection', JSON.stringify({ date, plan }));
  } catch {
    // Selection is still available while the current page is open.
  }
  document.querySelectorAll('[data-tab]').forEach(button => button.setAttribute('aria-pressed', button.dataset.tab === tab));
  ({ workout, history, progress })[tab]();
}

document.querySelector('nav').onclick = event => {
  if (!event.target.dataset.tab) return;
  tab = event.target.dataset.tab;
  render();
};

document.querySelector('#export').onclick = () => {
  const blob = new Blob([JSON.stringify({ version: 1, sessions, extras, notes }, null, 2)], { type: 'application/json' });
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
    extras = data.extras || {};
    notes = data.notes || {};
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
