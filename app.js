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

const legacyProgram = structuredClone(program);
program.B.exercises[5] = ['reverse-crunch', 'Reverse crunch', null, 10, '10–12'];
program.C.exercises[4] = ['db-curl', 'Dumbbell biceps curl', 15, 12, null, 'each'];
program.C.exercises[5] = ['dead-bug', 'Dead bug', null, 16, '8 per side'];
const exerciseVariants = [...Object.values(legacyProgram), ...Object.values(program)].flatMap(item => item.exercises);
const exerciseCatalog = [...new Map(exerciseVariants.map(row => [row[0], row])).values()];
let exerciseOrder = {};
const expandedExercisePanels = new Map();
const expandedCustomPanels = new WeakMap();
function exerciseOrderFor(key) { return exerciseOrder[key] || [0,1,2,3,4,5]; }
function moveSessionExercise(key, index, direction) {
  const order=[...exerciseOrderFor(key)], position=order.indexOf(index), next=position+direction;
  if(next<0 || next>=order.length)return false;
  [order[position],order[next]]=[order[next],order[position]];exerciseOrder[key]=order;return true;
}
let routines = {};
let awards = {};
let favoriteAwards = [];
let awardDetails = {};
let showcaseTitle = '';
let editingEntry = null;
let editReturnSection = 'entry';
function exercisesFor(key) { return routines[key] || program[key.at(-1)].exercises; }
function loadRoutines(data) {
  routines = {};
  exerciseOrder = structuredClone(data.exerciseOrder || {});
  for (const key of Object.keys(data.sessions)) {
    const rows = data.routines?.[key];
    routines[key] = Array.isArray(rows) && rows.length === 6 && rows.every(row => Array.isArray(row) && typeof row[0] === 'string' && typeof row[1] === 'string' && row[1].length <= 100)
      ? rows : structuredClone(legacyProgram[key.at(-1)].exercises);
  }
  favoriteAwards = Array.isArray(data.favoriteAwards) ? [...new Set(data.favoriteAwards)].filter(id => typeof id === 'string' && /^a\d{3}$/.test(id) && data.awards?.[id]).slice(0, 3) : [];
  awards = Object.fromEntries(Object.entries(data.awards || {}).filter(([id, value]) => /^a\d{3}$/.test(id) && typeof value === 'string'));
  awardDetails = Object.fromEntries(Object.entries(data.awardDetails || {}).filter(([id,info])=>awards[id] && info && typeof info.source==='string' && info.source.length<=200 && (info.activityDate===undefined || /^\d{4}-\d{2}-\d{2}$/.test(info.activityDate))).map(([id,info])=>[id,{source:info.source,...(info.activityDate?{activityDate:info.activityDate}:{})}]));
  showcaseTitle = typeof data.showcaseTitle==='string' && awards[data.showcaseTitle] && achievementList.some(a=>a.id===data.showcaseTitle) ? data.showcaseTitle : '';
}

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
  'reverse-crunch': 'Lie on your back with knees bent. Brace your abdomen and gently curl your pelvis toward your ribs, lifting your hips slightly. Lower slowly without swinging your legs. Count each controlled curl as one rep.',
  'dead-bug': 'Lie on your back with arms up and hips and knees bent to 90 degrees. Brace your abdomen, then slowly lower one arm and the opposite leg while keeping your lower back steady. Return and alternate. Enter the total reps across both sides, so 8 per side is 16 reps.',
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
let tab = 'today';
let section = 'entry';
let backlog = false;
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
          Number.isInteger(row.sets) && row.sets >= 0 && row.sets <= 99 &&
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
    (entry.type !== 'run' || Number.isFinite(entry.miles) && entry.miles > 0) &&
    (entry.temperature === undefined || entry.type === 'sauna' && Number.isFinite(entry.temperature) && entry.temperature >= 1)))) return false;
  if (data.exerciseOrder !== undefined && (!data.exerciseOrder || typeof data.exerciseOrder!=='object' || Array.isArray(data.exerciseOrder) || !Object.entries(data.exerciseOrder).every(([key,order])=>/^\d{4}-\d{2}-\d{2}-[ABC]$/.test(key) && Array.isArray(order) && order.length===6 && new Set(order).size===6 && order.every(index=>Number.isInteger(index)&&index>=0&&index<6)))) return false;
  if (data.routines !== undefined && (!data.routines || typeof data.routines !== 'object' || Array.isArray(data.routines) || !Object.entries(data.routines).every(([key, rows]) => /^[0-9]{4}-[0-9]{2}-[0-9]{2}-[ABC]$/.test(key) && Array.isArray(rows) && rows.length === 6 && rows.every(row => exerciseVariants.some(allowed => JSON.stringify(row) === JSON.stringify(allowed)))))) return false;
  if (data.activities?.some(entry => (entry.mode!==undefined && (entry.type!=='run'||!['run','walk','mixed'].includes(entry.mode))) || (entry.effort!==undefined && (entry.type!=='run'||!['','easy','moderate','hard'].includes(entry.effort))) || (entry.route!==undefined && (entry.type!=='run'||typeof entry.route!=='string'||entry.route.length>200)))) return false;
  if (data.activities?.some(entry => entry.environment!==undefined && (entry.type!=='run'||!['','treadmill','outside','event'].includes(entry.environment)))) return false;
  if (data.activities?.some(entry => entry.time !== undefined && !/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(entry.time))) return false;
  return Object.entries(data.sessions).every(([key, sets]) => {
    const match = /^(\d{4}-\d{2}-\d{2})-([ABC])$/.exec(key);
    return match && Number.isFinite(Date.parse(match[1])) && Array.isArray(sets) && (sets.length >= 12 || sets.every(set => Number.isInteger(set?.exerciseIndex))) &&
      sets.every((set, index) => {
        const exercise = (data.routines?.[key] || legacyProgram[match[2]].exercises)[exerciseIndexFor(set, index)];
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
    editingEntry = null;
    sessions = data.sessions;
    loadRoutines(data);
    extras = data.extras || {};
    notes = data.notes || {};
    activities = data.activities || [];
  }
} catch {
  status.textContent = 'Saved data could not be read. This session may only be available until you close the app.';
}

function save(message = '') {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ version: 1, sessions, extras, notes, activities, routines, exerciseOrder, awards, favoriteAwards, awardDetails, showcaseTitle }));
    status.textContent = message;
  } catch {
    status.textContent = 'Your browser could not save these changes. Export a backup before closing this page.';
  }
}

function dateLabel(day) {
  return new Date(day + 'T12:00:00').toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function defaults(exercises) {
  return exercises.flatMap(([id, , weight, count]) => [
    { weight, count, done: false, unit: id === 'plank' ? 'sec' : 'reps' }, { weight, count, done: false, unit: id === 'plank' ? 'sec' : 'reps' },
  ]);
}

const timer = document.querySelector('#rest');
let restInterval;
let restId;
const restOverrides = new Map();

function startRest(duration) {
  clearInterval(restInterval);
  timer.hidden = false;
  const end = Date.now() + duration * 1000;
  const update = () => {
    const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    const output = timer.querySelector('output');
    output.classList.toggle('rest-complete', left === 0);
    output.textContent = left
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
};

function exerciseIndexFor(set, index) {
  return set?.exerciseIndex ?? (index < 12 ? Math.floor(index / 2) : undefined);
}

// Assign stable exercise identities before removing a row from legacy flat arrays.
function deleteWorkoutSet(sets, index) {
  sets.forEach((set, position) => { set.exerciseIndex = exerciseIndexFor(set, position); });
  sets.splice(index, 1);
}

function enableSetDeletion(element, label, remove) {
  element.tabIndex = 0;
  element.setAttribute('aria-label', label + '. Swipe right or press Delete to delete this set.');
  let origin;
  let dragged = false;
  const ask = () => {
    const dialog=document.querySelector('#delete-set-dialog');
    dialog.querySelector('p').textContent='Delete '+label+'? This removes this set from this workout.';
    const confirm=dialog.querySelector('[data-confirm-delete-set]');
    confirm.onclick=()=>{dialog.close();remove();};
    dialog.showModal();
    dialog.querySelector('[data-cancel-delete-set]').focus();
  };
  element.addEventListener('pointerdown', event => {
    if (event.isPrimary === false || event.button !== 0) return;
    origin = { x:event.clientX, y:event.clientY };
    dragged = false;
  });
  element.addEventListener('pointermove', event => {
    if (!origin) return;
    const dx = event.clientX-origin.x, dy = event.clientY-origin.y;
    if (Math.abs(dy)>30 && Math.abs(dy)>Math.abs(dx)) origin = null;
    else if (dx>30 && dx>Math.abs(dy)*1.5) dragged = true;
  });
  element.addEventListener('pointerup', event => {
    if (!origin) return;
    const dx=event.clientX-origin.x,dy=event.clientY-origin.y;
    origin=null;
    if (dx>=70 && dx>Math.abs(dy)*1.5) { dragged=true; ask(); }
  });
  element.addEventListener('pointercancel', () => { origin=null; dragged=false; });
  element.addEventListener('click', event => {
    if (dragged) { event.preventDefault(); event.stopImmediatePropagation(); dragged=false; }
  }, true);
  element.addEventListener('keydown', event => {
    if (event.target===element && event.key==='Delete') { event.preventDefault(); ask(); }
  });
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
    const index = exercisesFor(log.key).findIndex(exercise => exercise[0] === id);
    if (index < 0) continue;
    const results = exerciseSets(log.sets, index).flatMap((set, offset) => {
      if (!set.done) return [];
      const result = set.weight === null ? (id === 'plank' ? 'Hold ' + set.count + ' sec' : 'Bodyweight · Reps ' + set.count)
        : 'Weight ' + set.weight + ' lb' + (exercisesFor(log.key)[index][5] === 'each' ? ' each' : '') + ' · Reps ' + set.count;
      return [{ ...set, offset, label: 'Set ' + (offset + 1) + ' · ' + result }];
    });
    if (results.length) return results;
  }
  return [];
}

function swapSessionExercise(key, sets, index, replacement) {
  if (!exerciseVariants.some(row => JSON.stringify(row) === JSON.stringify(replacement))) return false;
  if (exerciseSets(sets, index).some(set => set.done)) return false;
  const routine = structuredClone(exercisesFor(key));
  routine[index] = structuredClone(replacement);
  for (const position of setIndices(sets, index)) {
    sets[position] = { ...sets[position], weight:replacement[2], count:replacement[3], done:false, unit:replacement[0] === 'plank' ? 'sec' : 'reps' };
  }
  routines[key] = routine;
  sessions[key] = sets;
  return true;
}

function workout() {
  const key = date + '-' + plan;
  const exercises = exercisesFor(key);
  const displayOrder = exerciseOrderFor(key);
  const extraPanelSync = [];
  const weekday = new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'long' });
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
    <p class="set-delete-hint">Swipe right on a set to delete it. You’ll be asked to confirm.</p><div class="workout-order-tools"><p>Move exercises up or down for this session.</p>${displayOrder.some((index,position)=>index!==position)?'<button type="button" id="reset-exercise-order">Reset exercise order</button>':''}</div>
    ${displayOrder.map((exerciseIndex,position) => {
      let [id,name,weight,count,range,qualifier] = exercises[exerciseIndex];
      weight = targets[exerciseIndex];
      const last = lastTime(id);
      return `
      <section class="card exercise-panel" data-exercise-panel="${exerciseIndex}"><div class="exercise-title exercise-card-header"><div class="exercise-order-controls"><button type="button" data-move-exercise="${exerciseIndex}" data-direction="-1" aria-label="Move ${name} up" ${position===0?'disabled':''} title="Move up"><span aria-hidden="true">↑</span></button><button type="button" data-move-exercise="${exerciseIndex}" data-direction="1" aria-label="Move ${name} down" ${position===5?'disabled':''} title="Move down"><span aria-hidden="true">↓</span></button></div><h3>${name}</h3><a href="#form-${id}" data-guide="${id}" aria-label="How to do ${name}">How to <span aria-hidden="true">↗</span></a></div>
      <p class="exercise-completion" data-exercise-summary="${exerciseIndex}"></p>
      <div class="exercise-panel-body" id="exercise-body-${exerciseIndex}">
      <p><strong>Target</strong> · ${weight === null ? 'Bodyweight' : weight + ' lb' + (qualifier ? ' ' + qualifier : '')}
      · 2 × ${range || count}${id === 'plank' ? ' sec' : ' reps'}</p>
      ${last.length ? `<p class="last-time"><strong>Last time</strong><br>${last.map(set => set.label).join('<br>')}</p>` : ''}
      ${setIndices(sets, exerciseIndex).map((index, offset) => {
        const set = sets[index];
        const label = `${name}, set ${offset + 1}`;
        return `<div class="set" data-set-row="${index}"><b>Set ${offset + 1}</b>
          ${id === 'plank' ? `<button type="button" data-plank="${index}" aria-label="Start ${label}">Start</button>` : weight === null ? `<span>Bodyweight</span>` : `<label>lb${qualifier === 'each' ? ' each' : ''}<input type="number" min="0" step="any" inputmode="decimal" data-index="${index}" data-field="weight" aria-label="${label}, pounds" value="${set.weight}"></label>`}
          <label>${id === 'plank' ? 'Seconds' : 'Reps'}<input type="number" min="1" step="1" inputmode="numeric" data-index="${index}" data-field="count" aria-label="${label}, ${id === 'plank' ? 'seconds' : 'reps'}" value="${set.count}"></label>
          <button data-complete="${index}" aria-pressed="${set.done}" aria-label="${set.done ? 'Undo' : 'Complete'} ${label}">${set.done ? '✓ Completed' : 'Done'}</button></div>`;
      }).join('')}</div>
      <div class="exercise-panel-controls"><button class="add-set" data-add-set="${exerciseIndex}" aria-label="Add set for ${name}">+ Add set</button><button type="button" data-exercise-toggle="${exerciseIndex}" aria-controls="exercise-body-${exerciseIndex}">Hide sets</button></div>
</section>`; }).join('')}`;

  const canReorder=()=>{if(view.querySelector('[data-plank][data-running="true"]')){status.textContent='Finish or stop the plank timer before moving exercises.';return false;}return true;};
  view.querySelectorAll('[data-move-exercise]').forEach(button=>button.onclick=()=>{
    if(!canReorder())return;
    const index=Number(button.dataset.moveExercise);
    if(!moveSessionExercise(key,index,Number(button.dataset.direction)))return;
    save('Exercise order updated for this session.');render();
    view.querySelector('[data-exercise-toggle="'+index+'"]').focus();
  });
  const resetOrder=view.querySelector('#reset-exercise-order');
  if(resetOrder)resetOrder.onclick=()=>{if(!canReorder())return;delete exerciseOrder[key];save('Original exercise order restored.');render();};
  view.querySelectorAll('[data-exercise-toggle]').forEach(button=>button.onclick=()=>{
    const index=Number(button.dataset.exerciseToggle);
    const current=button.getAttribute('aria-expanded')==='true';
    expandedExercisePanels.set(key+':'+index,!current);syncExercisePanels();
  });
  function syncExercisePanels() {
    for(const panel of view.querySelectorAll('[data-exercise-panel]')) {
      const index=Number(panel.dataset.exercisePanel), rows=exerciseSets(sets,index), complete=rows.length>0 && rows.every(set=>set.done);
      if(panel.dataset.panelComplete!==undefined && (panel.dataset.panelComplete==='true')!==complete)expandedExercisePanels.delete(key+':'+index);
      panel.dataset.panelComplete=String(complete);
      const open=expandedExercisePanels.get(key+':'+index) ?? !complete;
      const button=panel.querySelector('[data-exercise-toggle]');button.setAttribute('aria-expanded',open);button.textContent=open?'Hide':'Show';button.setAttribute('aria-label',(open?'Hide':'Show')+' sets for '+exercises[index][1]);
      const body=panel.querySelector('.exercise-panel-body');
      panel.querySelector('[data-add-set]').hidden=!open;
      const hidingActive=!open&&body.contains(document.activeElement);body.hidden=!open;
      panel.querySelector('[data-exercise-summary]').textContent=rows.filter(set=>set.done).length+' / '+rows.length+' sets complete'+(complete?' · Finished':'');
      if(hidingActive)button.focus({preventScroll:true});
    }
    extraPanelSync.forEach(sync=>sync());
  }

  let plankInterval;
  const stopPlank = () => clearInterval(plankInterval);
  view.querySelectorAll('[data-plank]').forEach(button => {
    button.onclick = () => {
      const index = Number(button.dataset.plank);
      const input = view.querySelector(`[data-index="${index}"][data-field="count"]`);
      if (!input.value || !input.validity.valid) {
        input.focus();
        return;
      }
      const running = button.dataset.running === 'true';
      stopPlank();
      view.querySelectorAll('[data-plank]').forEach(control => {
        delete control.dataset.running;
        control.textContent = 'Start';
      });
      if (running) return;
      button.dataset.running = 'true';
      const end = Date.now() + input.valueAsNumber * 1000;
      const update = () => {
        if (!button.isConnected || sets[index].done) {
          stopPlank();
          delete button.dataset.running;
          button.textContent = 'Start';
          return;
        }
        const remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
        button.textContent = remaining ? remaining + 's' : 'Time up';
        if (!remaining) {
          stopPlank();
          delete button.dataset.running;
          navigator.vibrate?.([200, 100, 200]);
        }
      };
      plankInterval = setInterval(update, 200);
      update();
    };
  });

  view.querySelectorAll('[data-set-row]').forEach(row => {
    const index=Number(row.dataset.setRow), exercise=exerciseIndexFor(sets[index],index);
    const number=setIndices(sets,exercise).indexOf(index)+1;
    enableSetDeletion(row, exercises[exercise][1]+', set '+number, () => {
      deleteWorkoutSet(sets,index); sessions[key]=sets;
      routines[key] ||= structuredClone(exercises);
      expandedExercisePanels.set(key+':'+exercise,true);
      save('Set deleted.'); render();
    });
  });

  view.querySelectorAll('[data-add-set]').forEach(button => button.onclick = () => {
    const exerciseIndex = Number(button.dataset.addSet);
    const [, , weight, count] = exercises[exerciseIndex];
    const previous = exerciseSets(sets, exerciseIndex).at(-1) || {weight,count,unit:exercises[exerciseIndex][0]==='plank'?'sec':'reps'};
    sets.push({ exerciseIndex, weight: previous.weight === '' ? weight : previous.weight,
      count: previous.count === '' ? count : previous.count, unit: previous.unit, done: false });
    sessions[key] = sets;
    routines[key] ||= structuredClone(exercises);
    save();
    render();
    view.querySelector(`[data-index="${sets.length - 1}"]`).focus();
  });

  view.insertAdjacentHTML('beforeend', `<section class="card"><h3>Custom exercises</h3>
    <div id="extra-list"></div>
    <button type="button" id="open-extra" aria-expanded="false" aria-controls="extra-form">Add custom exercise</button>
    <form id="extra-form" hidden>
      <label>Exercise name<input name="exercise" maxlength="80" required></label>
      <label>Reps for set 1<input name="reps" type="number" inputmode="numeric" min="1" max="999" required></label>
      <button>Add exercise</button>
    </form></section>`);
  const openExtra = view.querySelector('#open-extra');
  const extraForm = view.querySelector('#extra-form');
  openExtra.onclick = () => {
    extraForm.hidden = !extraForm.hidden;
    openExtra.setAttribute('aria-expanded', !extraForm.hidden);
    if (!extraForm.hidden) extraForm.elements.exercise.focus();
  };
  const list = view.querySelector('#extra-list');
  function showExtras() {
    list.replaceChildren();
    extraPanelSync.length=0;
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
            checkAchievements(true, {activityDate:date,source:'Workout '+plan+' · '+row.name});
          }
        };
        refresh();
        enableSetDeletion(line,row.name+', set '+(offset+1),()=>{
          actualSets(row).splice(offset,1);row.sets=row.actual.length;
          expandedCustomPanels.set(row,true);save('Set deleted.');showExtras();
        });
        item.append(line);
      });
      const add = document.createElement('button');
      add.className = 'add-set';
      add.textContent = '+ Add set';
      add.setAttribute('aria-label', 'Add set for ' + row.name);
      add.disabled = row.sets >= 99;
      add.onclick = () => {
        const actual = actualSets(row);
        const { weight, count } = actual.at(-1) || {weight:null,count:row.reps};
        actual.push({ weight, count, done: false });
        row.sets = actual.length;
        save();
        showExtras();
        list.children[index].querySelector('.set:last-of-type input[required]').focus();
      };

      const remove = document.createElement('button');
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', 'Remove ' + row.name);
      remove.onclick = () => {
        extras[key].splice(index, 1);
        if (!extras[key].length) delete extras[key];
        save();
        showExtras();
        openExtra.focus();
      };
      item.append(remove);
      const body=document.createElement('div');body.className='exercise-panel-body';body.id='custom-body-'+index;
      body.append(...[...item.children].slice(1));
      const summary=document.createElement('p');summary.className='exercise-completion';
      const controls=document.createElement('div');controls.className='exercise-panel-controls';
      const toggle=document.createElement('button');toggle.type='button';toggle.setAttribute('aria-controls',body.id);controls.append(add,toggle);
      const moveControls=document.createElement('div');moveControls.className='exercise-order-controls';
      for(const [direction,label] of [[-1,'up'],[1,'down']]) {
        const move=document.createElement('button');move.type='button';move.textContent=direction<0?'↑':'↓';move.title='Move '+label;move.setAttribute('aria-label','Move '+row.name+' '+label);move.disabled=index+direction<0||index+direction>=(extras[key]||[]).length;
        move.onclick=()=>{const rows=extras[key];[rows[index],rows[index+direction]]=[rows[index+direction],rows[index]];save('Custom exercise order updated.');showExtras();list.children[index+direction].querySelector('.exercise-panel-controls button').focus();};moveControls.append(move);
      }
      let wasComplete=actualSets(row).length>0 && actualSets(row).every(set=>set.done);
      const sync=()=>{const rows=actualSets(row),complete=rows.length>0 && rows.every(set=>set.done);if(complete!==wasComplete)expandedCustomPanels.delete(row);wasComplete=complete;const open=expandedCustomPanels.get(row) ?? !complete;const hidingActive=!open&&body.contains(document.activeElement);body.hidden=!open;add.hidden=!open;toggle.textContent=open?'Hide':'Show';toggle.setAttribute('aria-expanded',open);toggle.setAttribute('aria-label',(open?'Hide':'Show')+' sets for '+row.name);summary.textContent=rows.filter(set=>set.done).length+' / '+rows.length+' sets complete'+(complete?' · Finished':'');if(hidingActive)toggle.focus({preventScroll:true});};
      toggle.onclick=()=>{expandedCustomPanels.set(row,toggle.getAttribute('aria-expanded')!=='true');sync();};
      extraPanelSync.push(sync);sync();
      const header=document.createElement('div');header.className='exercise-title exercise-card-header';
      const guide=document.createElement('a');guide.textContent='How to ↗';guide.href='https://www.youtube.com/results?search_query='+encodeURIComponent(row.name+' proper form demonstration');guide.target='_blank';guide.rel='noopener noreferrer';guide.title='Search YouTube';guide.setAttribute('aria-label','Find how to do '+row.name+' on YouTube');
      header.append(moveControls,title,guide);item.prepend(header);
      item.append(summary,body,controls);
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
    const sets = 1;
    const reps = Number(fields.get('reps'));
    const actual = Array.from({ length: sets }, () => ({ count: reps, weight: null, done: false }));
    (extras[key] ||= []).push({ name, sets, reps, actual });
    save();
    form.reset();
    form.hidden = true;
    openExtra.setAttribute('aria-expanded', 'false');
    showExtras();
    openExtra.focus();
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
    if (completed > 0) { sessions[key] = sets; routines[key] ||= structuredClone(exercises); save(); checkAchievements(true,{activityDate:date,source:'Workout '+plan+' summary'}); }
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
    routines[key] ||= structuredClone(exercises);
    save();
    refreshCompletion();
  });

  function refreshCompletion() {
    syncExercisePanels();
    const buttons = [...view.querySelectorAll('.set button[aria-pressed]')];
    for (const button of view.querySelectorAll('[data-complete]')) {
      const index = Number(button.dataset.complete);
      const done = sets[index].done;
      const [, name] = exercises[exerciseIndexFor(sets[index], Number(index))];
      button.setAttribute('aria-pressed', done);
      button.setAttribute('aria-label', (done ? 'Undo ' : 'Complete ') + name + ', set ' + (setIndices(sets, exerciseIndexFor(sets[index], index)).indexOf(index) + 1));
      button.textContent = done ? '✓ Completed' : 'Done';
    }
    view.querySelectorAll('[data-plank]').forEach(button => { button.disabled = sets[button.dataset.plank].done; });
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
    routines[key] ||= structuredClone(exercises);
    save();
    refreshCompletion();
    checkAchievements(set.done,{activityDate:date,source:'Workout '+plan+' · '+exercises[exerciseIndexFor(set,Number(index))][1]});
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
  return set.weight === null ? `${set.count} ${set.unit || 'sec'}` : `${set.weight} lb × ${set.count}`;
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
    ...exercisesFor(log.key).map(([id, name], index) => ({
      id, name, sets: exerciseSets(log.sets, index),
    })),
    ...(extras[log.key] || []).map(row => ({
      id: 'custom:' + row.name.toLowerCase(), name: row.name, sets: actualSets(row),
    })),
  ];
}

function history() {
  const all = loggedSessions();
  const logs = backlog ? all : all.slice(0, 3);
  view.innerHTML = '<h2>Workout history</h2>' + (logs.length ? logs.map(log => `
    <details><summary>${dateLabel(log.date)} · Workout ${log.plan} · ${workoutResults(log).flatMap(group => group.sets).filter(set => set.done).length}/${workoutResults(log).flatMap(group => group.sets).length} sets</summary>
    <ul>${exerciseOrderFor(log.key).map(index => {
      const [,name,,,,qualifier]=exercisesFor(log.key)[index];
      const sets = exerciseSets(log.sets, index)
        .flatMap((set, offset) => set.done ? [`Set ${offset + 1} · ${setLabel(set)}`] : []);
      return sets.length ? `<li><strong>${name}</strong>${qualifier === 'each' ? ' (lb each)' : ''}<ul class="history-sets">${sets.map(set => `<li>${set}</li>`).join('')}</ul></li>` : '';
    }).join('')}</ul><ul data-extra-history="${log.key}"></ul><button data-edit="${log.key}">Edit workout</button> <button data-delete="${log.key}">Delete workout</button></details>`).join('')
    : '<p>Mark a set complete to start your history.</p>');
  view.querySelectorAll('[data-extra-history]').forEach(list => {
    for (const row of extras[list.dataset.extraHistory] || []) {
      const item = document.createElement('li');
      const completed = actualSets(row).flatMap((set, index) => set.done ? ['Set ' + (index + 1) + ' · ' + extraSetLabel(set)] : []);
      if (!completed.length) continue;
      const title = document.createElement('strong');
      title.textContent = row.name;
      const setList = document.createElement('ul');
      setList.className = 'history-sets';
      for (const set of completed) {
        const line = document.createElement('li');
        line.textContent = set;
        setList.append(line);
      }
      item.append(title, setList);
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
    delete routines[key];
    delete exerciseOrder[key];
    save('Deleted ' + description + '.');
    render();
  });
  view.querySelectorAll('[data-edit]').forEach(button => button.onclick = () => {
    date = button.dataset.edit.slice(0, -2);
    plan = button.dataset.edit.at(-1);
    tab = 'workout';
    section = 'entry';
    render();
    view.querySelector('#date').focus();
  });
  backlogButton(all.length);
}

function progress() {
  const logs = loggedSessions();
  const completed = logs.reduce((sum, log) => sum + log.sets.filter(set => set.done).length +
    (extras[log.key] || []).reduce((total, row) => total + actualSets(row).filter(set => set.done).length, 0), 0);
  const full = logs.filter(log => workoutResults(log).every(group => group.sets.every(set => set.done))).length;
  const bests = new Map();
  const compare = (a, b) => (a.weight ?? 0) - (b.weight ?? 0) || a.count - b.count;
  for (const log of logs) {
    exercisesFor(log.key).forEach(([id, name, , , , qualifier], index) => {
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
}

const sectionNames = { today: 'Bobby’s Dashboard', workout: 'Workout', run: 'Run', sauna: 'Sauna', weight: 'Weight' };

function runMetrics(entry) {
  const weight = activities.filter(item => item.type === 'weight' && item.date <= entry.date)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const seconds = Math.round(entry.amount * 60 / entry.miles);
  const pace = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
  if (!isRunningEntry(entry)) return pace + ' /mi · Calorie estimates are available for runs only';
  const calories = weight ? Math.round(1.7 * weight.amount * 0.45359237 * entry.miles) : null;
  return pace + ' /mi · ' + (calories === null ? 'Add a weigh-in for estimated calories' : '~' + calories + ' kcal');
}

function clockLabel(time) { const [h, m] = time.split(':').map(Number); return (h % 12 || 12) + ':' + String(m).padStart(2, '0') + (h < 12 ? ' AM' : ' PM'); }

function entryText(entry) {
  if (entry.type === 'run') {
    const seconds = Math.round(entry.amount * 60);
    const time = Math.floor(seconds / 60) + ' min ' + seconds % 60 + ' sec';
    return movementNames[movementMode(entry)] + (entry.environment ? ' · '+runEnvironmentNames[entry.environment] : '') + ' · ' + entry.miles + ' mi · ' + time + ' · ' + runMetrics(entry) + (entry.effort ? ' · Effort: '+entry.effort : '');
  }
  if (entry.type === 'weight') return entry.amount + ' lb · ' + (entry.time ? clockLabel(entry.time) : 'Time not recorded');
  return entry.amount + ' min' + (entry.temperature === undefined ? '' : ' · ' + entry.temperature + ' °F');
}

function activityEntries() {
  return activities.filter(entry => entry.type === tab).reverse().sort((a, b) => b.date.localeCompare(a.date) || (b.time || '').localeCompare(a.time || ''));
}

function storeActivityEntry(entry, original = null) {
  if (original) {
    const index = activities.indexOf(original);
    if (index < 0) return false;
    activities[index] = { ...original, ...entry, updatedAt: new Date().toISOString() };
    if (entry.type === 'weight' && !entry.time) delete activities[index].time;
  } else activities.push(entry);
  return true;
}

function activityEntry() {
  const type = tab;
  const original = editingEntry?.type === type && activities.includes(editingEntry) ? editingEntry : null;
  view.innerHTML = `<h2>${original ? 'Edit' : 'Log'} ${type === 'weight' ? 'body weight' : 'a ' + (type === 'sauna' ? 'sauna visit' : 'run')}</h2>
    <section class="card"><form id="activity-form">
      <label class="activity-date">Date<input name="date" type="date" value="${today}" required></label>
      ${type === 'run' ? '<label>Activity type<select name="mode"><option value="run">Run</option><option value="walk">Walk</option><option value="mixed">Run/Walk</option></select></label><label>Location (optional)<select name="environment"><option value="">Not specified</option><option value="treadmill">Treadmill</option><option value="outside">Outside</option><option value="event">Event</option></select></label><p class="run-entry-hint">Running badges count Run entries. Each activity type keeps separate distance records.</p>' : ''}
      ${type === 'run' ? `<fieldset class="run-time"><legend>Time</legend>
        <label>Minutes<input name="minutes" type="number" inputmode="numeric" min="0" step="1" required></label>
        <label>Seconds<input name="seconds" type="number" inputmode="numeric" min="0" max="59" step="1" placeholder="0"></label>
      </fieldset>` : `<label>${type === 'weight' ? 'Weight (lb)' : 'Time (min)'}<input name="amount" type="number" inputmode="decimal" min="0.01" step="any" required></label>`}
      ${type === 'run' ? '<label>Distance (mi)<input name="miles" type="number" inputmode="decimal" min="0.01" step="any" required></label>' : ''}
      ${type === 'run' ? '<label>Effort (optional)<select name="effort"><option value="">Not rated</option><option value="easy">Easy</option><option value="moderate">Moderate</option><option value="hard">Hard</option></select></label><label>Route / notes (optional)<textarea name="route" rows="2" maxlength="200" placeholder="Neighborhood loop, hills…"></textarea></label>' : ''}
      ${type === 'sauna' ? '<label>Temperature (°F)<input name="temperature" type="number" inputmode="decimal" min="1" step="any" required></label>' : ''}
      ${original && type === 'weight' ? '<label>Weigh-in time<input name="time" type="time"><small>Leave blank if the original time is unknown.</small></label>' : ''}
      <button>${original ? 'Save changes' : 'Save ' + (type === 'sauna' ? 'visit' : type)}</button>
      ${original ? '<button type="button" id="cancel-edit">Cancel editing</button>' : ''}
    </form><p id="entry-result" role="status"></p></section>`;
  const form = view.querySelector('form');
  const result = view.querySelector('#entry-result');
  if (original) {
    const fields = form.elements;
    fields.date.value = original.date;
    if (type === 'run') {
      const seconds = Math.round(original.amount * 60);
      fields.minutes.value = Math.floor(seconds / 60);
      fields.seconds.value = seconds % 60;
      fields.miles.value = original.miles;
      fields.mode.value = movementMode(original);fields.environment.value=original.environment||'';fields.effort.value=original.effort||'';fields.route.value=original.route||'';
    } else fields.amount.value = original.amount;
    if (type === 'sauna') fields.temperature.value = original.temperature ?? '';
    if (type === 'weight') fields.time.value = original.time || '';
    view.querySelector('#cancel-edit').onclick = () => {
      editingEntry = null;
      section = editReturnSection;
      render();
    };
  }
  const draft = () => {
    const fields = form.elements;
    const entry = { type, date: fields.date.value, amount: type === 'run' ? fields.minutes.valueAsNumber + (fields.seconds.valueAsNumber || 0) / 60 : fields.amount.valueAsNumber };
    if (type === 'run') { entry.miles = fields.miles.valueAsNumber;entry.mode=fields.mode.value;entry.environment=fields.environment.value;entry.effort=fields.effort.value;entry.route=fields.route.value.trim(); }
    if (type === 'sauna') entry.temperature = fields.temperature.valueAsNumber;
    return entry;
  };
  if (type === 'run') {
    form.oninput = () => {
      const entry = draft();
      view.querySelector('h2').textContent=(original?'Edit ':'Log a ')+movementNames[entry.mode].toLowerCase();
      form.querySelector('button').textContent=original?'Save changes':'Save '+movementNames[entry.mode].toLowerCase();
      result.textContent = form.checkValidity() && entry.amount > 0 ? runMetrics(entry) : '';
    };
    form.oninput();
  }
  form.onsubmit = event => {
    event.preventDefault();
    const entry = draft();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) return;
    if (entry.amount <= 0) {
      result.textContent = 'Enter a run time greater than zero.';
      return;
    }
    if (type === 'weight' && original) entry.time = form.elements.time.value;
    if (type === 'weight' && !original) {
      const stamp = new Date();
      entry.recordedAt = stamp.toISOString();
      entry.time = stamp.toTimeString().slice(0, 5);
    }
    storeActivityEntry(entry, original);
    if (original) {
      editingEntry = null;
      section = editReturnSection;
      save('Entry updated.');
      checkAchievements(true,{activityDate:entry.date,source:sectionNames[type]+' · '+entryText(entry)});
      render();
      return;
    }
    save('Entry saved.');
    checkAchievements(true,{activityDate:entry.date,source:sectionNames[type]+' · '+entryText(entry)});
    result.textContent = 'Saved · ' + entryText(entry);
    for (const input of form.querySelectorAll('input[type="number"]')) input.value = '';
    if(type==='run'){form.elements.route.value='';form.elements.effort.value='';}
    if (type !== 'run') {
      activityProgress(false);
      const details = view.querySelector('#inline-activity-history');
      activityHistory(details);
    }
  };
  if (type !== 'run') {
    activityProgress(false);
    const details = document.createElement('details');
    details.id = 'inline-activity-history';
    details.innerHTML = '<summary>Saved entries</summary>';
    view.append(details);
    activityHistory(details);
  }
}

function backlogButton(count) {
  if (count <= 3) return;
  const button = document.createElement('button');
  button.textContent = backlog ? 'Show latest 3' : 'Show all ' + count + ' entries';
  button.onclick = () => {
    backlog = !backlog;
    render();
    view.querySelector('.backlog-button')?.focus();
  };
  button.className = 'backlog-button';
  view.append(button);
}

function activityHistory(container = view) {
  const entries = activityEntries();
  container.innerHTML = container === view ? '<h2>' + sectionNames[tab] + ' history</h2>' : '<summary>Saved entries</summary>';
  if (!entries.length) {
    container.insertAdjacentHTML('beforeend', '<p>No entries yet.</p>');
    return;
  }
  for (const entry of entries.slice(0, backlog || container !== view ? entries.length : 3)) {
    const card = document.createElement('section');
    card.className = 'card';
    const title = document.createElement('h3');
    title.textContent = dateLabel(entry.date);
    const detail = document.createElement('p');
    detail.textContent = entryText(entry);
    const edit = document.createElement('button');
    edit.textContent = 'Edit entry';
    edit.setAttribute('aria-label', 'Edit ' + sectionNames[tab].toLowerCase() + ' entry for ' + dateLabel(entry.date));
    edit.onclick = () => {
      editingEntry = entry;
      editReturnSection = section;
      section = 'entry';
      render();
      view.querySelector('#activity-form input').focus();
      view.scrollIntoView({block:'start'});
    };
    const remove = document.createElement('button');
    remove.textContent = 'Delete entry';
    remove.onclick = () => {
      if (!confirm('Delete the entry for ' + dateLabel(entry.date) + '?')) return;
      activities = activities.filter(item => item !== entry);
      save('Entry deleted.');
      render();
    };
    const actions = document.createElement('div');
    actions.className = 'entry-actions';
    actions.append(edit, remove);
    card.append(title, detail);
    if(entry.type==='run'&&entry.route){const route=document.createElement('p');route.className='run-route';route.textContent='Route / notes · '+entry.route;card.append(route);}
    card.append(actions);
    container.append(card);
  }
  if (container === view) backlogButton(entries.length);
}

function activityProgress(showTitle = true) {
  if (tab === 'sauna') { renderSaunaProgress(showTitle); return; }
  view.querySelector('#activity-progress')?.remove();
  if (showTitle) view.innerHTML = '<h2>' + sectionNames[tab] + ' progress</h2>';
  const entries = activityEntries();
  const monday = new Date(today + 'T12:00:00');
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  const startDay = tab === 'weight' ? today.slice(0, 7) + '-01' : localDate(monday);
  const period = entries.filter(entry => entry.date >= startDay && entry.date <= today);
  const card = document.createElement('section');
  card.className = 'card';
  if (tab === 'run') { renderRunProgress(entries); return; }
  card.id = 'activity-progress';
  const heading = tab === 'weight' ? 'This month · Daily average weight (lb)' : 'This week · Sauna time (min)';
  card.innerHTML = '<h3>' + heading + '</h3>';
  const daily = new Map();
  for (const entry of [...period].reverse()) {
    daily.set(entry.date, tab === 'weight' ? entry.amount : (daily.get(entry.date) || 0) + entry.amount);
  }
  if (tab === 'weight') {
    for (const day of daily.keys()) {
      const rows = period.filter(entry => entry.date === day);
      daily.set(day, Number((rows.reduce((sum, entry) => sum + entry.amount, 0) / rows.length).toFixed(1)));
    }
    const average = rows => rows.length ? (rows.reduce((sum, entry) => sum + entry.amount, 0) / rows.length).toFixed(1) + ' lb (' + rows.length + ' entries)' : 'No entries yet';
    const timed = period.filter(entry => entry.time);
    card.insertAdjacentHTML('beforeend', '<p>Morning (before noon) · ' + average(timed.filter(entry => entry.time < '12:00')) + '</p><p>Evening (6 pm onward) · ' + average(timed.filter(entry => entry.time >= '18:00')) + '</p><p>Daily points average all weigh-ins. Compare similar conditions; these averages can include different dates.</p>');
  }
  if (daily.size) {
    const values = [...daily.values()];
    const min = Math.min(...values);
    const span = Math.max(1, Math.max(...values) - min);
    const start = Date.parse(startDay);
    const end = new Date(startDay + 'T12:00:00');
    if (tab === 'weight') end.setMonth(end.getMonth() + 1, 0);
    else end.setDate(end.getDate() + 6);
    const duration = Date.parse(localDate(end)) - start;
    const coords = [...daily].map(([day, value]) => [
      10 + 280 * (Date.parse(day) - start) / duration, 85 - 70 * (value - min) / span,
    ]);
    card.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 300 100" role="img" aria-label="${heading}">
      <polyline fill="none" stroke="#ff8177" stroke-width="2" points="${coords.map(point => point.join(',')).join(' ')}"></polyline>
      ${coords.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#ff8177"></circle>`).join('')}
      </svg><ul>${[...daily].map(([day, value]) => `<li>${dateLabel(day)} · ${value} ${tab === 'weight' ? 'lb' : 'min'}</li>`).join('')}</ul>`);
  } else {
    card.insertAdjacentHTML('beforeend', '<p>No entries for this period yet.</p>');
  }
  const history = view.querySelector('#inline-activity-history');
  if (history) history.before(card);
  else view.append(card);
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
  updateShowcaseTitle();
  document.querySelectorAll('[data-tab]').forEach(button => button.setAttribute('aria-pressed', button.dataset.tab === tab));
  document.querySelector('#section-nav').hidden = ['today', 'sauna', 'weight', 'achievements'].includes(tab);
  if (tab === 'today') { renderToday(); return; }
  if (tab === 'achievements') { renderAchievements(); return; }
  document.querySelector('#section-nav').setAttribute('aria-label', sectionNames[tab] + ' views');
  document.querySelectorAll('[data-section]').forEach(button => button.setAttribute('aria-pressed', button.dataset.section === section));
  const views = tab === 'workout'
    ? { entry: workout, history, progress }
    : { entry: activityEntry, history: activityHistory, progress: activityProgress };
  views[section]();
}

const passages = [
  ['So run to win!', '1 Corinthians 9:24'],
  ['Don’t be afraid, for I am with you.', 'Isaiah 41:10'],
  ['Be strong and courageous!', 'Joshua 1:9'],
  ['For I can do everything through Christ, who gives me strength.', 'Philippians 4:13'],
  ['But those who trust in the Lord will find new strength.', 'Isaiah 40:31'],
  ['God is our refuge and strength, always ready to help in times of trouble.', 'Psalm 46:1'],
  ['My grace is all you need. My power works best in weakness.', '2 Corinthians 12:9'],
  ['The Lord is my light and my salvation—so why should I be afraid?', 'Psalm 27:1'],
  ['So let’s not get tired of doing what is good.', 'Galatians 6:9'],
  ['Work willingly at whatever you do, as though you were working for the Lord rather than for people.', 'Colossians 3:23'],
  ['God arms me with strength, and he makes my way perfect.', 'Psalm 18:32'],
  ['And let us run with endurance the race God has set before us.', 'Hebrews 12:1'],
];
let passageIndex = 0;
let verseAnimation;

async function rotateVerse() {
  const verse = document.querySelector('.header-verse');
  passageIndex = (passageIndex + 1) % passages.length;
  const [quote, reference] = passages[passageIndex];
  verseAnimation?.cancel();
  const replaceVerse = () => {
    const citation = document.createElement('span');
    citation.textContent = '· ' + reference + ' (NLT)';
    verse.replaceChildren('“' + quote + '” ', citation);
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    replaceVerse();
    return;
  }
  verseAnimation = verse.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150 });
  try {
    await verseAnimation.finished;
  } catch {
    return;
  }
  replaceVerse();
  verseAnimation = verse.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 230 });
}



document.querySelector('#today-tab').onclick = () => openMainTab('today');

document.querySelector('#award-tab').onclick = () => { editingEntry = null; tab = 'achievements'; section = 'entry'; rotateVerse(); render(); window.scrollTo({top:0}); };

document.querySelector('#main-nav').onclick = event => {
  if (!event.target.dataset.tab) return;
  if (tab === event.target.dataset.tab && section === 'entry') return;
  rotateVerse();
  editingEntry = null;
  tab = event.target.dataset.tab;
  section = 'entry';
  backlog = false;
  render();
};
document.querySelector('#section-nav').onclick = event => {
  if (!event.target.dataset.section) return;
  if (section === event.target.dataset.section) return;
  rotateVerse();
  section = event.target.dataset.section;
  backlog = false;
  render();
};

document.querySelector('#export').onclick = () => {
  const blob = new Blob([JSON.stringify({ version: 1, sessions, extras, notes, activities, routines, exerciseOrder, awards, favoriteAwards, awardDetails, showcaseTitle }, null, 2)], { type: 'application/json' });
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
    editingEntry = null;
    sessions = data.sessions;
    loadRoutines(data);
    extras = data.extras || {};
    notes = data.notes || {};
    activities = data.activities || [];
    save('Backup restored.');
    checkAchievements(false);
    render();
  } catch {
    status.textContent = 'Could not read this workout backup.';
  }
};

document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  updateLocalClock();
  const current = localDate(new Date());
  if (current === today) return;
  today = current;
  date = today;
  plan = { 1: 'A', 3: 'B', 5: 'C' }[new Date().getDay()] || 'A';
  render();
});

function updateLocalClock() {
  const clock = document.querySelector('#app-clock');
  const current = new Date();
  clock.textContent = current.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
  clock.dateTime = current.toISOString();
}

checkAchievements(false);
render();
updateLocalClock();
setInterval(() => { if (!document.hidden) updateLocalClock(); }, 1000);
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('./sw.js').catch(() => {
    status.textContent = 'Offline setup failed. You can still use the app while online.';
  });
}
