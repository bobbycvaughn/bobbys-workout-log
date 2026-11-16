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
function localDate(value) {
  return [value.getFullYear(), value.getMonth() + 1, value.getDate()]
    .map((part, index) => index === 0 ? part : String(part).padStart(2, '0')).join('-');
}
const now = new Date();
let today = localDate(now);
let date = today;
let plan = { 1: 'A', 3: 'B', 5: 'C' }[now.getDay()] || 'A';
let tab = 'workout';
let sessions = {};
let extras = {};
let notes = {};
let activities = [];

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
  if (data.activities !== undefined && (!Array.isArray(data.activities) || !data.activities.every(entry =>
    entry && typeof entry.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.date) &&
    Number.isFinite(Date.parse(entry.date)) && ['run', 'lifting', 'weight', 'sauna'].includes(entry.type) &&
    Number.isFinite(entry.amount) && entry.amount > 0 &&
    (entry.type !== 'run' || Number.isFinite(entry.miles) && entry.miles > 0)))) return false;
  return Object.entries(data.sessions).every(([key, sets]) => {
    const match = /^(\d{4}-\d{2}-\d{2})-([ABC])$/.exec(key);
    return match && Number.isFinite(Date.parse(match[1])) && Array.isArray(sets) && sets.length >= 12 &&
      sets.every((set, index) => {
        const exercise = program[match[2]].exercises[exerciseIndexFor(set, index)];
        if (!exercise) return false;
        const bodyweight = exercise[2] === null;
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
    extras = data.extras || {};
    notes = data.notes || {};
    activities = data.activities || [];
  }
} catch {
  status.textContent = 'Saved data could not be read. This session may only be available until you close the app.';
}

function save(message = '') {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ version: 1, sessions, extras, notes, activities }));
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

function exerciseIndexFor(set, index) {
  return index < 12 ? Math.floor(index / 2) : set?.exerciseIndex;
}

function setIndices(sets, exerciseIndex) {
  return sets.flatMap((set, index) => exerciseIndexFor(set, index) === exerciseIndex ? [index] : []);
}

function exerciseSets(sets, exerciseIndex) {
  return setIndices(sets, exerciseIndex).map(index => sets[index]);
}

function lastTime(id) {
  for (const log of loggedSessions()) {
    if (log.date >= date) continue;
    const index = program[log.plan].exercises.findIndex(exercise => exercise[0] === id);
    if (index < 0) continue;
    const results = exerciseSets(log.sets, index).flatMap((set, offset) => {
      if (!set.done) return [];
      const result = set.weight === null ? 'Hold ' + set.count + ' sec'
        : 'Weight ' + set.weight + ' lb' + (program[log.plan].exercises[index][5] === 'each' ? ' each' : '') + ' · Reps ' + set.count;
      return [{ ...set, offset, label: 'Set ' + (offset + 1) + ' · ' + result }];
    });
    if (results.length) return results;
  }
  return [];
}

function workout() {
  const { exercises } = program[plan];
  const weekday = new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'long' });
  const key = date + '-' + plan;
  const targets = exercises.map(([id, , weight]) => {
    const previous = lastTime(id).filter(set => set.weight > 0);
    return previous.length ? Math.min(...previous.map(set => set.weight)) : weight;
  });
  const sets = sessions[key] || defaults(exercises).map((set, index) => ({
    ...set, weight: targets[Math.floor(index / 2)],
  }));
  view.innerHTML = `
    <div class="days" aria-label="Program day">${Object.entries(program).map(([letter, item]) =>
      `<button data-plan="${letter}" aria-pressed="${letter === plan}">${item.day.slice(0, 3)} · ${letter}</button>`).join('')}</div>
    <div class="session"><div><h2>${weekday} Workout ${plan}</h2>
    <p id="set-total">${sets.filter(set => set.done).length} of 12 sets complete</p></div>
    <div class="date-controls"><label>Workout date<input type="date" id="date" value="${date}"></label><button id="today" ${date === today ? 'disabled' : ''}>Today</button></div></div>
    ${exercises.map(([id, name, weight, count, range, qualifier], exerciseIndex) => {
      weight = targets[exerciseIndex];
      const last = lastTime(id);
      return `
      <section class="card"><div class="exercise-title"><h3>${name}</h3><a href="#form-${id}" data-guide="${id}" aria-label="How to do ${name}">How to <span aria-hidden="true">↗</span></a></div>
      <p><strong>Target</strong> · ${weight === null ? 'Bodyweight' : weight + ' lb' + (qualifier ? ' ' + qualifier : '')}
      · 2 × ${range || count}${weight === null ? ' sec' : ' reps'}</p>
      ${last.length ? `<p class="last-time"><strong>Last time</strong><br>${last.map(set => set.label).join('<br>')}</p>
        <button class="copy-last" data-copy="${exerciseIndex}" aria-label="Copy last session for ${name}">Copy last session</button>` : ''}
      ${setIndices(sets, exerciseIndex).map((index, offset) => {
        const set = sets[index];
        const label = `${name}, set ${offset + 1}`;
        return `<div class="set"><b>Set ${offset + 1}</b>
          ${weight === null ? '<span></span>' : `<label>lb${qualifier === 'each' ? ' each' : ''}<input type="number" min="0" step="any" inputmode="decimal" data-index="${index}" data-field="weight" aria-label="${label}, pounds" value="${set.weight}"></label>`}
          <label>${weight === null ? 'Seconds' : 'Reps'}<input type="number" min="1" step="1" inputmode="numeric" data-index="${index}" data-field="count" aria-label="${label}, ${weight === null ? 'seconds' : 'reps'}" value="${set.count}"></label>
          <button data-complete="${index}" aria-pressed="${set.done}" aria-label="${set.done ? 'Undo' : 'Complete'} ${label}">${set.done ? '✓ Completed' : 'Done'}</button></div>`;
      }).join('')}<button class="add-set" data-add-set="${exerciseIndex}" aria-label="Add set for ${name}">+ Add set</button></section>`; }).join('')}`;

  view.querySelectorAll('[data-add-set]').forEach(button => button.onclick = () => {
    const exerciseIndex = Number(button.dataset.addSet);
    const [, , weight, count] = exercises[exerciseIndex];
    const previous = exerciseSets(sets, exerciseIndex).at(-1);
    sets.push({ exerciseIndex, weight: previous.weight === '' ? weight : previous.weight,
      count: previous.count === '' ? count : previous.count, done: false });
    sessions[key] = sets;
    save();
    render();
    view.querySelector(`[data-index="${sets.length - 1}"]`).focus();
  });

  view.querySelectorAll('[data-copy]').forEach(button => {
    const exerciseIndex = Number(button.dataset.copy);
    const [id] = exercises[exerciseIndex];
    const previous = lastTime(id);
    const indices = setIndices(sets, exerciseIndex);
    const candidates = () => previous.filter(set => sets[indices[set.offset]]?.done === false);
    button.onclick = () => {
      for (const { offset, weight, count } of candidates()) {
        const index = indices[offset];
        Object.assign(sets[index], { weight, count });
        view.querySelectorAll(`[data-index="${index}"]`).forEach(input => {
          input.value = sets[index][input.dataset.field];
        });
      }
      sessions[key] = sets;
      save('Copied your previous sets.');
      button.textContent = 'Copied';
    };
    button.disabled = !candidates().length;
  });

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
        const source = (extras[earlier.key] || []).find(extra =>
          sameExercise(extra.name, row.name) && actualSets(extra).some(set => set.done));
        const copy = document.createElement('button');
        copy.className = 'copy-last';
        copy.textContent = 'Copy last session';
        copy.setAttribute('aria-label', 'Copy last session for ' + row.name);
        const candidates = () => actualSets(row).flatMap((set, i) =>
          !set.done && actualSets(source)[i]?.done ? [i] : []);
        copy.disabled = !candidates().length;
        copy.onclick = () => {
          for (const i of candidates()) {
            const { weight, count } = actualSets(source)[i];
            Object.assign(actualSets(row)[i], { weight, count });
            const [weightInput, countInput] = item.querySelectorAll('.set')[i].querySelectorAll('input');
            weightInput.value = weight ?? '';
            countInput.value = count;
          }
          save('Copied your previous sets.');
          copy.textContent = 'Copied';
        };
        item.append(copy);

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
        const refresh = () => {
          complete.setAttribute('aria-pressed', set.done);
          complete.setAttribute('aria-label', (set.done ? 'Undo ' : 'Complete ') + row.name + ', set ' + (offset + 1));
          complete.textContent = set.done ? '✓ Completed' : 'Done';
        };
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
          refreshCompletion();
          if (set.done) {
            restId = 'custom:' + row.name.toLowerCase();
            timer.querySelector('strong').textContent = row.name;
            startRest(restOverrides.get(restId) ?? 60);
          }
        };
        refresh();
        item.append(line);
      });
      const add = document.createElement('button');
      add.className = 'add-set';
      add.textContent = '+ Add set';
      add.setAttribute('aria-label', 'Add set for ' + row.name);
      add.disabled = row.sets >= 99;
      add.onclick = () => {
        const actual = actualSets(row);
        const { weight, count } = actual.at(-1);
        actual.push({ weight, count, done: false });
        row.sets = actual.length;
        save();
        showExtras();
        list.children[index].querySelector('.set:last-of-type input').focus();
      };
      item.append(add);
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
    refreshCompletion();
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

  view.querySelector('#today').onclick = () => {
    date = today;
    render();
    view.querySelector('#date').focus();
  };

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
    const buttons = [...view.querySelectorAll('.set button')];
    for (const button of view.querySelectorAll('[data-complete]')) {
      const index = Number(button.dataset.complete);
      const done = sets[index].done;
      const [, name] = exercises[exerciseIndexFor(sets[index], Number(index))];
      button.setAttribute('aria-pressed', done);
      button.setAttribute('aria-label', (done ? 'Undo ' : 'Complete ') + name + ', set ' + (setIndices(sets, exerciseIndexFor(sets[index], index)).indexOf(index) + 1));
      button.textContent = done ? '✓ Completed' : 'Done';
    }
    view.querySelectorAll('[data-copy]').forEach(button => {
      const index = Number(button.dataset.copy);
      button.disabled = !lastTime(exercises[index][0]).some(set => exerciseSets(sets, index)[set.offset]?.done === false);
      button.textContent = 'Copy last session';
    });
    const next = buttons.find(button => button.getAttribute('aria-pressed') === 'false');
    for (const button of buttons) button.closest('.set').classList.toggle('next-set', button === next);
    const completed = buttons.filter(button => button.getAttribute('aria-pressed') === 'true').length;
    view.querySelector('#set-total').textContent = completed + ' of ' + buttons.length + ' sets complete';
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
      const [id, name] = exercises[exerciseIndexFor(sets[index], Number(index))];
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
      id, name, sets: exerciseSets(log.sets, index),
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
  view.append(card);
  const byExercise = new Map();
  for (const log of [...logs].reverse()) {
    function add(id, name, sets) {
      if (!byExercise.has(id)) byExercise.set(id, { name, points: [] });
      byExercise.get(id).points.push({ date: log.date, plan: log.plan, sets });
    }
    program[log.plan].exercises.forEach(([id, name], index) => {
      const sets = exerciseSets(log.sets, index).filter(set => set.done);
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
    <details><summary>${dateLabel(log.date)} · Workout ${log.plan} · ${workoutResults(log).flatMap(group => group.sets).filter(set => set.done).length}/${workoutResults(log).flatMap(group => group.sets).length} sets</summary>
    <ul>${program[log.plan].exercises.map(([, name, , , , qualifier], index) => {
      const sets = exerciseSets(log.sets, index)
        .flatMap((set, offset) => set.done ? [`Set ${offset + 1} · ${setLabel(set)}`] : []);
      return sets.length ? `<li><strong>${name}</strong>${qualifier === 'each' ? ' (lb each)' : ''}<br>${sets.join(' · ')}</li>` : '';
    }).join('')}</ul><ul data-extra-history="${log.key}"></ul><button data-edit="${log.key}">Edit workout</button> <button data-delete="${log.key}">Delete workout</button></details>`).join('')
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

  view.querySelectorAll('[data-delete]').forEach(button => button.onclick = () => {
    const key = button.dataset.delete;
    const description = dateLabel(key.slice(0, -2)) + ' · Workout ' + key.at(-1);
    if (!confirm('Delete ' + description + '? This removes its sets, custom exercises, and note.')) return;
    delete sessions[key];
    delete extras[key];
    delete notes[key];
    save('Deleted ' + description + '.');
    render();
  });
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
  const full = logs.filter(log => workoutResults(log).every(group => group.sets.every(set => set.done))).length;
  const bests = new Map();
  const compare = (a, b) => (a.weight ?? 0) - (b.weight ?? 0) || a.count - b.count;
  for (const log of logs) {
    program[log.plan].exercises.forEach(([id, name, , , , qualifier], index) => {
      const sets = exerciseSets(log.sets, index).filter(set => set.done);
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
  historyChart(logs);
  view.append(weightChart());
}

const activityNames = { run: 'Run', lifting: 'Weight training', weight: 'Body weight', sauna: 'Sauna' };

function estimate(entry) {
  const weighIn = activities.filter(item => item.type === 'weight' && item.date <= entry.date)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!weighIn) return null;
  const kg = weighIn.amount * 0.45359237;
  if (entry.type === 'run') return 1.7 * kg * entry.miles;
  if (entry.type === 'lifting') return 3.5 * 3.5 * kg * entry.amount / 200;
  return null;
}

function activity() {
  view.innerHTML = `<h2>Activity</h2><section class="card">
    <form id="activity-form">
      <label>Activity<select name="type">
        <option value="run">Run</option><option value="lifting">Weight training</option>
        <option value="weight">Body weight</option><option value="sauna">Sauna</option>
      </select></label>
      <label>Date<input name="date" type="date" value="${today}" required></label>
      <label id="miles-label">Distance (mi)<input name="miles" type="number" inputmode="decimal" min="0.01" step="any" required></label>
      <label><span id="amount-label">Time (min)</span><input name="amount" type="number" inputmode="decimal" min="0.01" step="any" required></label>
      <button>Save entry</button>
    </form>
    <p>Log body weight each Monday to build your trend. Calorie estimates use the latest weigh-in on or before the activity date. Enter lifting time to include weight training.</p>
    </section><section class="card"><h3>This week</h3><p id="week-activity"></p></section>
    <section class="card"><h3>Activity log</h3><ul id="activity-log"></ul></section>`;
  const form = view.querySelector('#activity-form');
  const type = form.elements.type;
  const adjust = () => {
    const run = type.value === 'run';
    form.elements.miles.disabled = !run;
    view.querySelector('#miles-label').hidden = !run;
    view.querySelector('#amount-label').textContent = type.value === 'weight' ? 'Weight (lb)' : 'Time (min)';
  };
  type.onchange = adjust;
  adjust();
  form.onsubmit = event => {
    event.preventDefault();
    const day = form.elements.date.value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return;
    if (type.value === 'weight') activities = activities.filter(item => item.type !== 'weight' || item.date !== day);
    const entry = { type: type.value, date: day, amount: form.elements.amount.valueAsNumber };
    if (entry.type === 'run') entry.miles = form.elements.miles.valueAsNumber;
    activities.push(entry);
    save('Activity saved.');
    form.elements.amount.value = '';
    form.elements.miles.value = '';
    showActivity();
  };
  function showActivity() {
    const monday = new Date(today + 'T12:00:00');
    monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
    const week = activities.filter(item => item.date >= localDate(monday) && item.date <= today);
    const estimates = week.map(estimate).filter(value => value !== null);
    const miles = week.reduce((sum, item) => sum + (item.miles || 0), 0);
    const sauna = week.filter(item => item.type === 'sauna').reduce((sum, item) => sum + item.amount, 0);
    const lifting = week.filter(item => item.type === 'lifting').reduce((sum, item) => sum + item.amount, 0);
    view.querySelector('#week-activity').textContent =
      Number(miles.toFixed(2)) + ' mi running · ' + lifting + ' min lifting · ' + sauna + ' min sauna. ' +
      (estimates.length ? 'Estimated calories (run + lifting): ' + Math.round(estimates.reduce((a, b) => a + b, 0)) + ' kcal.' : 'No calorie estimates yet.');
    const list = view.querySelector('#activity-log');
    list.replaceChildren();
    for (const entry of [...activities].sort((a, b) => b.date.localeCompare(a.date))) {
      const row = document.createElement('li');
      const calories = estimate(entry);
      row.textContent = dateLabel(entry.date) + ' · ' + activityNames[entry.type] + ' · ' +
        (entry.type === 'run' ? entry.miles + ' mi · ' : '') + entry.amount + (entry.type === 'weight' ? ' lb' : ' min') +
        (calories === null ? '' : ' · ~' + Math.round(calories) + ' kcal');
      const remove = document.createElement('button');
      remove.textContent = 'Delete';
      remove.onclick = () => {
        if (!confirm('Delete this ' + activityNames[entry.type].toLowerCase() + ' entry?')) return;
        activities = activities.filter(item => item !== entry);
        save('Entry deleted.');
        showActivity();
      };
      row.append(' ', remove);
      list.append(row);
    }
  }
  showActivity();
}

function weightChart() {
  const card = document.createElement('section');
  card.className = 'card';
  card.innerHTML = '<h3>Body weight</h3>';
  const points = activities.filter(item => item.type === 'weight').sort((a, b) => a.date.localeCompare(b.date)).slice(-12);
  if (!points.length) {
    card.insertAdjacentHTML('beforeend', '<p>Add a weigh-in under Activity to start your chart.</p>');
    return card;
  }
  const weights = points.map(item => item.amount);
  const low = Math.min(...weights);
  const span = Math.max(1, Math.max(...weights) - low);
  const start = Date.parse(points[0].date);
  const timeSpan = Math.max(1, Date.parse(points.at(-1).date) - start);
  const coords = points.map(item => [
    points.length === 1 ? 150 : 10 + 280 * (Date.parse(item.date) - start) / timeSpan,
    85 - 70 * (item.amount - low) / span,
  ]);
  card.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 300 100" role="img" aria-label="Body weight trend in pounds">
    <polyline fill="none" stroke="#89e3f8" stroke-width="2" points="${coords.map(point => point.join(',')).join(' ')}"></polyline>
    ${coords.map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#89e3f8"></circle>`).join('')}
    </svg>`);
  const list = document.createElement('ul');
  for (const point of points) {
    const row = document.createElement('li');
    row.textContent = dateLabel(point.date) + ' · ' + point.amount + ' lb';
    list.append(row);
  }
  card.append(list);
  return card;
}

view.addEventListener('focusin', event => {
  const input = event.target;
  if (!input.matches('input[type="number"]') || input.value === '') return;
  const previous = input.value;
  input.value = '';
  let edited = false;
  const markEdited = () => { edited = true; };
  input.addEventListener('input', markEdited);
  const restore = () => {
    input.removeEventListener('input', markEdited);
    if (!edited && input.value === '') input.value = previous;
  };
  input.addEventListener('blur', restore, { once: true });
});

function render() {
  document.querySelectorAll('[data-tab]').forEach(button => button.setAttribute('aria-pressed', button.dataset.tab === tab));
  ({ workout, history, progress, activity })[tab]();
}

document.querySelector('nav').onclick = event => {
  if (!event.target.dataset.tab) return;
  tab = event.target.dataset.tab;
  render();
};

document.querySelector('#export').onclick = () => {
  const blob = new Blob([JSON.stringify({ version: 1, sessions, extras, notes, activities }, null, 2)], { type: 'application/json' });
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
    activities = data.activities || [];
    save('Backup restored.');
    render();
  } catch {
    status.textContent = 'Could not read this workout backup.';
  }
};

document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  const current = localDate(new Date());
  if (current === today) return;
  today = current;
  date = today;
  plan = { 1: 'A', 3: 'B', 5: 'C' }[new Date().getDay()] || 'A';
  render();
});

render();
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('./sw.js').catch(() => {
    status.textContent = 'Offline setup failed. You can still use the app while online.';
  });
}
