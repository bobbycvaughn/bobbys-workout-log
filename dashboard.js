'use strict';
let recapOffset = 0;
function openMainTab(next, chosenPlan) {
  editingEntry = null;
  tab = next;
  section = 'entry';
  backlog = false;
  if (next === 'workout') { date = today; if (chosenPlan) plan = chosenPlan; }
  rotateVerse();
  render();
  view.scrollIntoView({block:'start'});
}
function favoriteBadgesHTML() {
  const chosen = favoriteAwards.map(id => achievementList.find(a => a.id === id)).filter(a => a && awards[a.id]);
  return `<div class="favorite-badges">${chosen.map(a => `<div><button type="button" class="badge-mini-replay" data-replay-achievement="${a.id}" aria-label="View ${a.name} badge">${badgeArt(a)}</button><span>${a.name}</span><small class="badge-reason">${achievementDescription(a)}</small></div>`).join('') || '<p>Choose up to 3 favorite badges in Achievements to display here.</p>'}</div>`;
}
function weekRange(offset = 0) {
  const first = new Date(today + 'T12:00:00');
  first.setDate(first.getDate() - (first.getDay() + 6) % 7 + offset * 7);
  const last = new Date(first); last.setDate(last.getDate() + 6);
  return {start:localDate(first), end:localDate(last)};
}
function isCompleteWorkout(log) {
  return workoutResults(log).filter(g => !g.id.startsWith('custom:')).every(g => g.sets.length >= 2 && g.sets.slice(0,2).every(s => s.done));
}
function weekSummary(offset = 0) {
  const {start,end} = weekRange(offset);
  const includes = day => day >= start && day <= end && day <= today;
  const logs = loggedSessions().filter(log => includes(log.date));
  const entries = activities.filter(entry => includes(entry.date));
  const runs = entries.filter(isRunningEntry);
  const daily = new Map();
  for (const entry of entries.filter(e => e.type === 'weight')) {
    const row = daily.get(entry.date) || [];
    row.push(entry.amount); daily.set(entry.date,row);
  }
  const weights = [...daily].sort(([a],[b]) => a.localeCompare(b)).map(([day,values]) => ({day,amount:values.reduce((a,b)=>a+b,0)/values.length}));
  const badges = achievementList.filter(a => awards[a.id] && Number.isFinite(Date.parse(awards[a.id])) && includes(localDate(new Date(awards[a.id])))).sort(compareBadgeDifficulty);
  return {start,end,workouts:logs.filter(isCompleteWorkout).length, sessions:logs.filter(log => workoutResults(log).some(g => g.sets.some(s => s.done))).length,
    sets:logs.flatMap(workoutResults).reduce((sum,g) => sum + g.sets.filter(s => s.done).length,0),
    miles:runs.reduce((sum,e)=>sum+e.miles,0),runs:runs.length,sauna:entries.filter(e=>e.type==='sauna').length,weights,badges};
}
function renderToday() {
  const {xp} = checkAchievements(false);
  const dayName = new Date(today+'T12:00:00').toLocaleDateString(undefined,{weekday:'long'});
  const latestWeight = activities.filter(e=>e.type==='weight' && e.date<=today).slice().reverse().sort((a,b)=>b.date.localeCompare(a.date)||(b.time||'').localeCompare(a.time||''))[0];
  const runMiles = activities.filter(e=>isRunningEntry(e) && e.date===today).reduce((sum,e)=>sum+e.miles,0);
  view.innerHTML = `<h2>Bobby’s Dashboard</h2><p class="today-date">${dayName} · ${dateLabel(today)}</p>
    <section class="card"><h3>Level ${Math.floor(xp/500)+1}</h3>${favoriteBadgesHTML()}<p>${xp} XP · ${500-xp%500} to next level</p><progress value="${xp%500}" max="500" aria-label="Level progress"></progress><button data-open="achievements">Choose favorite badges</button></section>
    <div class="dashboard-stats"><section class="stat"><strong>${Number(runMiles.toFixed(2))} mi</strong>Run today</section><section class="stat"><strong>${latestWeight ? latestWeight.amount+' lb' : '—'}</strong>${latestWeight ? 'Latest · '+dateLabel(latestWeight.date)+(latestWeight.time?' · '+clockLabel(latestWeight.time):' · Time not recorded') : 'No weigh-ins yet'}</section></div>
    <section class="card" id="weekly-recap"></section>`;
  view.querySelectorAll('[data-open]').forEach(button=>button.onclick=()=>openMainTab(button.dataset.open,button.dataset.letter));
  view.querySelector('#weekly-recap').before(achievementTools());
  renderWeeklyRecap();
}
function renderWeeklyRecap() {
  const summary = weekSummary(recapOffset);
  const target = view.querySelector('#weekly-recap');
  if (!target) return;
  const weightTrend = summary.weights.length > 1 ? (()=>{
    const first=summary.weights[0], last=summary.weights.at(-1), difference=last.amount-first.amount;
    return `${difference>0?'+':''}${difference.toFixed(1)} lb · ${first.amount.toFixed(1)} → ${last.amount.toFixed(1)} lb (${dateLabel(first.day)} to ${dateLabel(last.day)}). Uses each day’s average.`;
  })() : summary.weights.length ? 'One day of weigh-ins logged. Add another day to see a trend.' : 'No weigh-ins this week.';
  target.innerHTML=`<h3>Weekly recap</h3><p>${dateLabel(summary.start)} – ${dateLabel(summary.end)}</p>
    <div class="recap-controls"><button id="previous-week">Previous week</button><button id="next-week" ${recapOffset===0?'disabled':''}>Next week</button></div>
    ${recapOffset ? '<button id="current-week">This week</button>' : ''}
    <div class="dashboard-stats"><div class="stat"><strong>${summary.workouts}</strong>Workouts complete</div><div class="stat"><strong>${Number(summary.miles.toFixed(2))} mi</strong>${summary.runs} runs</div></div>
    <p>${summary.sessions} workout sessions logged · ${summary.sets} completed sets · ${summary.sauna} sauna visits</p>
    <h4>Weight trend</h4><p>${weightTrend}</p><h4>Trophy Case · ${summary.badges.length}</h4>
    <div class="favorite-badges">${summary.badges.map(a=>`<div><button type="button" class="badge-mini-replay" data-replay-achievement="${a.id}" aria-label="View ${a.name} badge">${badgeArt(a)}</button><span>${a.name}</span><small class="badge-reason">${achievementDescription(a)}</small></div>`).join('') || '<p>No new badges this week. Every logged session builds progress.</p>'}</div>`;
  target.querySelector('#previous-week').onclick=()=>{recapOffset--;renderWeeklyRecap();};
  target.querySelector('#next-week').onclick=()=>{recapOffset=Math.min(0,recapOffset+1);renderWeeklyRecap();};
  const current=target.querySelector('#current-week');if(current)current.onclick=()=>{recapOffset=0;renderWeeklyRecap();};
}
