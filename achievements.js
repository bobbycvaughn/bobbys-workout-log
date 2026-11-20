'use strict';
// All milestones use cumulative totals, never dangerous single-session targets.
const achievementList = [];
function addAchievement(name, metric, target, known, category, tier = 'standard') {
  achievementList.push({ id: 'a' + String(achievementList.length + 1).padStart(3, '0'), name, metric, target, known, category, tier });
}
const workoutGoalNames = ['Finding Your Fire', 'Iron Promise', 'Built to Return', 'Quarter Century Club', 'Forty Strong', 'Halfway to a Hundred', 'Relentless Rhythm', 'Seventy Sessions Deep', 'Three Quarter Titan', 'Eighty and Rising', 'The Final Ten', 'Century of Strength'];
[5,10,20,25,40,50,60,70,75,80,90,100].forEach((n,i) => addAchievement(workoutGoalNames[i], 'workouts', n, true, 'workouts'));
[
  ['The First Forge','workouts',1,'workouts'], ['Ten Sparks','sets',10,'sets'],
  ['First Footfall','runs',1,'runs'], ['The Five Mile Trail','miles',5,'miles'],
  ['Into the Ember','sauna',1,'sauna'], ['Ten Quiet Returns','sauna',10,'sauna'],
  ['Starting Point','weighins',1,'weight'], ['A Week in Focus','weightDays',7,'weight'],
].forEach(([name,metric,target,category]) => addAchievement(name,metric,target,true,category));
const secretTracks = [
 ['workouts','workouts','Iron journey',[2,3,15,30,125,150,200,300,500,1000]],
 ['sets','sets','Forged in effort',[25,50,75,100,150,200,300,500,750,1000]],
 ['curlReps','curls','Curl collector',[25,50,75,100,150,250,400,600,800,1000]],
 ['legReps','legs','Strong foundation',[25,50,75,100,150,250,400,600,800,1000]],
 ['pressReps','press','Press onward',[25,50,75,100,150,250,400,600,800,1000]],
 ['pullReps','pull','Pull your weight',[25,50,75,100,150,250,400,600,800,1000]],
 ['runs','runs','Road warrior',[2,3,5,10,20,40,75,100,250,1000]],
 ['miles','miles','Miles of determination',[1,3,10,20,40,75,100,250,500,1000]],
 ['sauna','sauna','Recovery ritual',[2,3,5,15,20,40,75,100,250,1000]],
 ['weightDays','weight','Know your rhythm',[2,3,5,10,20,40,75,100,250,1000]],
];
const secretNames = {
  workouts: ['Second Wind', 'Threefold Resolve', 'Iron Journey', 'Thirty in the Furnace', 'Beyond the Century', 'Unbroken Intent', 'Double Century', 'Three Hundred Returns', 'The Long Devotion', 'Thousand Workout Legend'],
  sets: ['Forged in Effort', 'Tempered Resolve', 'Hammer and Heart', 'One Hundred Sparks', 'Steel in the Making', 'The Anvil Answers', 'Three Hundred Strikes', 'Half a Thousand Hammers', 'Master of the Forge', 'Thousand Set Titan'],
  curlReps: ['Curl Collector', 'Arms Awaken', 'Biceps Rising', 'Century Curl Club', 'Sleeves of Steel', 'Quarter Thousand Curls', 'Iron Grip Resolve', 'The Curl Crusade', 'Arms of Endurance', 'Thousand Curl Champion'],
  legReps: ['Strong Foundation', 'Roots of Iron', 'Grounded in Strength', 'Legs of Resolve', 'Built from the Ground', 'Foundation Fortress', 'Pillars of Power', 'The Steady Ascent', 'Mountain Legs', 'Thousand Rep Foundation'],
  pressReps: ['Press Onward', 'Push Past Doubt', 'Rising Pressure', 'Century of Presses', 'Shoulders to the Sky', 'The Iron Push', 'Pressing the Horizon', 'Momentum Maker', 'The Unyielding Press', 'Thousand Press Vanguard'],
  pullReps: ['Pull Your Weight', 'Drawn to Strength', 'Back in Command', 'Century of Pulls', 'Steady Draw', 'The Iron Anchor', 'Row of Resolve', 'Wings of Effort', 'The Relentless Pull', 'Thousand Pull Guardian'],
  runs: ['Return to the Road', 'Three Roads Taken', 'Stride Starter', 'Ten Times Out', 'Twenty Trails', 'Road Warrior', 'The Seventy Five Strides', 'Century Runner', 'Footprints of Commitment', 'Thousand Run Voyager'],
  miles: ['Miles of Determination', 'Three Mile Spark', 'Double Digit Distance', 'Twenty Mile Trail', 'Forty Mile Flame', 'Farther Than Before', 'Century of Miles', 'Open Road Heart', 'Five Hundred Horizons', 'Thousand Mile Pilgrim'],
  sauna: ['Return to the Ember', 'Three Moments of Stillness', 'Recovery Ritual', 'Fifteen Pauses', 'The Restful Return', 'Forty Fireside Visits', 'Seventy Five Respites', 'Century of Stillness', 'The Patient Ritual', 'Thousand Visit Sanctuary'],
  weightDays: ['Another Data Point', 'Three Days of Insight', 'Know Your Rhythm', 'Ten Days in Focus', 'Twenty Day Picture', 'Forty Day Perspective', 'Patterns Take Shape', 'Century of Check Ins', 'The Long View', 'Thousand Day Chronicle'],
};
secretTracks.forEach(([metric,category,name,targets]) => targets.forEach((target, i) => addAchievement(secretNames[metric][i], metric, target, false, category)));
// Appended IDs preserve the original 120 badges and saved unlocks.
const challengeGoals = [
  ['Blue Steel Devotion','workouts',175,'workouts'], ['Cobalt Quartermaster','workouts',250,'workouts'],
  ['Sapphire Anvil','sets',600,'sets'], ['Nine Hundred Embers','sets',900,'sets'],
  ['Cobalt Curlsmith','curlReps',500,'curls'], ['Blue Flame Biceps','curlReps',900,'curls'],
  ['Glacial Pillars','legReps',500,'legs'], ['Sapphire Mountain','legReps',900,'legs'],
  ['Azure Vanguard','pressReps',500,'press'], ['Cobalt Skybreaker','pressReps',900,'press'],
  ['Deep Blue Anchor','pullReps',500,'pull'], ['Sapphire Wings','pullReps',900,'pull'],
  ['Cobalt Roadkeeper','runs',150,'runs'], ['Azure Trailmaster','runs',300,'runs'],
  ['Four Hundred Horizons','miles',400,'miles'], ['Sapphire Expedition','miles',750,'miles'],
  ['Blue Ember Ritual','sauna',150,'sauna'], ['Cobalt Sanctuary','sauna',300,'sauna'],
  ['Half Year Perspective','weightDays',180,'weight'], ['Year of Insight','weightDays',365,'weight'],
];
const mysteryChallenges = [
  ['The Eternal Return','workouts',350,'workouts'], ['Keeper of Seven Fifty','workouts',750,'workouts'],
  ['The Hidden Foundry','sets',650,'sets'], ['The Last Fifty Sparks','sets',950,'sets'],
  ['Midnight Armorer','curlReps',650,'curls'], ['The Silent Curl King','curlReps',950,'curls'],
  ['Bedrock of Resolve','legReps',650,'legs'], ['The Unmoving Summit','legReps',950,'legs'],
  ['Beyond the Blue Sky','pressReps',650,'press'], ['The Final Ascent','pressReps',950,'press'],
  ['Depths of Determination','pullReps',650,'pull'], ['The Unseen Anchor','pullReps',950,'pull'],
  ['Roads Without End','runs',400,'runs'], ['The Wandering Flame','runs',750,'runs'],
  ['Beyond the Far Horizon','miles',600,'miles'], ['The Nine Hundred Journey','miles',900,'miles'],
  ['Stillness Through Seasons','sauna',400,'sauna'], ['Keeper of the Quiet Flame','sauna',750,'sauna'],
  ['Five Hundred Reflections','weightDays',500,'weight'], ['The Patient Observer','weightDays',750,'weight'],
];
challengeGoals.forEach(([name,metric,target,category])=>addAchievement(name,metric,target,true,category,'challenge'));
mysteryChallenges.forEach(([name,metric,target,category])=>addAchievement(name,metric,target,false,category,'challenge'));
// New visible milestones append IDs, keeping every existing badge unchanged.
[
 ['Raise the Standard','weightRecords',1,'sets'], ['New Heights','weightRecords',5,'sets'], ['Iron Benchmark','weightRecords',10,'sets'],
 ['One More Rep','repRecords',1,'sets'], ['Beyond Yesterday','repRecords',5,'sets'], ['Rep Rewriter','repRecords',10,'sets'],
 ['Farther Still','distanceRecords',1,'miles'], ['Open Horizons','distanceRecords',3,'miles'], ['Distance Breaker','distanceRecords',5,'miles'],
 ['Week of Resolve','completeWeeks',1,'workouts'], ['Four Weeks Forged','completeWeeks',4,'workouts'], ['Twelve Week Testament','completeWeeks',12,'workouts'],
 ['Strength Meets Stride','balancedWeeks',1,'runs'], ['Four Weeks in Balance','balancedWeeks',4,'runs'], ['The Complete Journey','balancedWeeks',12,'runs'],
].forEach(([name,metric,target,category])=>addAchievement(name,metric,target,true,category));
function isSuperBadge(achievement) {
  return achievement.target === 1000 && ['workouts','sets','curlReps','legReps','pressReps','pullReps','runs','miles','weightDays'].includes(achievement.metric);
}
function isGreenFlame(achievement) {
  if (achievement.tier !== 'challenge') return false;
  const thresholds = {workouts:250,runs:300,miles:750,weightDays:365,sets:950,curlReps:950,legReps:950,pressReps:950,pullReps:950};
  return thresholds[achievement.metric] !== undefined && achievement.target >= thresholds[achievement.metric];
}
function badgeTierName(achievement) {
  if (isSuperBadge(achievement)) return 'Super';
  return achievement.tier === 'challenge' ? (isGreenFlame(achievement) ? 'Green Flame' : 'Blue Flame') : 'Gold';
}
function achievementDescription(achievement, unlocked = true) {
  const n = achievement.target;
  const plural = (singular, multiple) => n === 1 ? singular : multiple;
  const descriptions = {
    weightRecords: `${unlocked ? 'Improved' : 'Improve'} your best logged exercise weight ${n} ${plural('time','times')}. Your first dated result establishes the baseline.`,
    repRecords: `${unlocked ? 'Beat' : 'Beat'} your rep record at a previously logged weight ${n} ${plural('time','times')}. Timed holds do not count.`,
    distanceRecords: `${unlocked ? 'Improved' : 'Improve'} your longest logged run ${n} ${plural('time','times')}, comparing runs on different dates. Your first run is the baseline.`,
    completeWeeks: `${unlocked ? 'Completed' : 'Complete'} 3 full workouts on different days in ${n} ${plural('week','weeks')}. Weeks do not need to be consecutive.`,
    balancedWeeks: `${unlocked ? 'Completed' : 'Complete'} 3 full workout days and logged at least 1 run in ${n} ${plural('week','weeks')}. Weeks do not need to be consecutive.`,
    workouts: `${unlocked ? 'Completed' : 'Complete'} ${n} full ${plural('workout', 'workouts')}, with both original sets of all six exercises done.`,
    sets: `${unlocked ? 'Completed' : 'Complete'} ${n} sets in total across your workouts, including custom exercises.`,
    curlReps: `${unlocked ? 'Completed' : 'Complete'} ${n} total biceps curl reps across your logged dumbbell and cable curl sets.`,
    legReps: `${unlocked ? 'Completed' : 'Complete'} ${n} total reps across your logged leg press and goblet squat sets.`,
    pressReps: `${unlocked ? 'Completed' : 'Complete'} ${n} total reps across your chest press, incline press and shoulder press sets.`,
    pullReps: `${unlocked ? 'Completed' : 'Complete'} ${n} total reps across your seated row and lat pulldown sets.`,
    runs: `${unlocked ? 'Logged' : 'Log'} ${n} ${plural('run', 'runs')}. Every saved run counts, regardless of distance or pace.`,
    miles: `${unlocked ? 'Logged' : 'Log'} ${n} ${plural('mile', 'miles')} of running in total across your saved runs.`,
    sauna: `${unlocked ? 'Logged' : 'Log'} ${n} sauna ${plural('visit', 'visits')}. Time and temperature do not affect this badge.`,
    weighins: `${unlocked ? 'Saved' : 'Save'} ${n} body weight ${plural('entry', 'entries')}. The number on the scale does not affect this badge.`,
    weightDays: `${unlocked ? 'Logged' : 'Log'} body weight on ${n} different ${plural('day', 'days')}. The days do not have to be consecutive.`,
  };
  return descriptions[achievement.metric];
}
const metricLabels = { weightRecords:'weight record improvements', repRecords:'rep record improvements', distanceRecords:'running distance improvements', completeWeeks:'three-workout weeks', balancedWeeks:'balanced weeks', workouts:'complete workouts', sets:'completed sets', curlReps:'total biceps curl reps', legReps:'total leg press / squat reps', pressReps:'total chest / shoulder press reps', pullReps:'total row / pulldown reps', runs:'runs logged', miles:'total running miles', sauna:'sauna visits', weighins:'weigh-ins', weightDays:'different days with a weigh-in' };
function achievementStats() {
  const stats = {workouts:0,sets:0,curlReps:0,legReps:0,pressReps:0,pullReps:0,runs:0,miles:0,sauna:0,weighins:0,weightDays:0};
  for (const log of loggedSessions()) {
    const groups = workoutResults(log);
    const planned = groups.filter(group => !group.id.startsWith('custom:'));
    if (planned.length === 6 && planned.every(group => group.sets.length >= 2 && group.sets.slice(0,2).every(set => set.done))) stats.workouts++;
    for (const group of groups) {
      const done = group.sets.filter(set => set.done);
      stats.sets += done.length;
      const reps = done.reduce((sum,set) => sum + Number(set.count || 0),0);
      if (['db-curl','cable-curl'].includes(group.id)) stats.curlReps += reps;
      if (['leg-press','goblet'].includes(group.id)) stats.legReps += reps;
      if (['chest-press','shoulder-press','incline'].includes(group.id)) stats.pressReps += reps;
      if (['row','lat-pulldown'].includes(group.id)) stats.pullReps += reps;
    }
  }
  stats.runs = activities.filter(isRunningEntry).length;
  stats.miles = activities.filter(isRunningEntry).reduce((sum,e) => sum + e.miles,0);
  stats.sauna = activities.filter(e => e.type === 'sauna').length;
  stats.weighins = activities.filter(e => e.type === 'weight').length;
  stats.weightDays = new Set(activities.filter(e => e.type === 'weight').map(e => e.date)).size;
  return Object.assign(stats, recordAndWeekStats());
}
// Unique, self-contained badge art. Category emblem + individual facets and number.
function badgeArt(achievement) {
  const n = Number(achievement.id.slice(1));
  const symbols = {workouts:'✝',sets:'⚒',curls:'💪',legs:'▲',press:'⬆',pull:'⬇',runs:'⚡',miles:'◆',sauna:'♨',weight:'⚖'};
  const points = Array.from({length:20},(_,i) => {const angle=i*Math.PI/10-Math.PI/2; const r=i%2?39:47;return (50+Math.cos(angle)*r).toFixed(1)+','+(50+Math.sin(angle)*r).toFixed(1);}).join(' ');
  const unlocked = Boolean(awards[achievement.id]);
  const superBadge = isSuperBadge(achievement);
  const elite = achievement.tier === 'challenge' || superBadge;
  const green = isGreenFlame(achievement);
  const flameColor = superBadge ? '#090a10' : green ? '#22ba6d' : '#1687ec';
  const flameEdge = superBadge ? '#bdc5db' : green ? '#8dffba' : '#74dcff';
  const flameCore = superBadge ? '#303344' : green ? '#d3ffe1' : '#a5efff';
  const rays = Array.from({length:48},(_,i) => {
    const angle = i * Math.PI / 24 - Math.PI / 2;
    const radius = i % 2 ? 43 : (i % 4 ? 58 : 63);
    return (50 + Math.cos(angle) * radius).toFixed(1) + ',' + (48 + Math.sin(angle) * radius).toFixed(1);
  }).join(' ');
  const sunburst = unlocked ? `<g class="badge-sunburst"><circle cx="50" cy="48" r="57" fill="#ffd875" opacity=".13"/><polygon points="${rays}" fill="#e9ad35" stroke="#ffe29a" stroke-width=".6"/><circle cx="50" cy="48" r="43" fill="#ffd365"/></g>` : '';
  const flames = unlocked && elite ? `<g class="${superBadge ? 'badge-black-flames' : green ? 'badge-green-flames' : 'badge-blue-flames'}"><circle cx="50" cy="48" r="54" fill="${flameColor}" opacity=".2"/>${Array.from({length:12},(_,i)=>`<g transform="rotate(${i*30} 50 48)"><path d="M41 17C28 4 48 0 46-15C65-4 67 6 57 19C60 7 53 4 54-3C49 5 43 8 47 18Z" fill="${flameColor}" stroke="${flameEdge}" stroke-width=".7"/><path d="M47 16C41 8 51 6 52 0C59 8 57 13 52 20Z" fill="${flameCore}"/></g>`).join('')}</g>` : '';
  return `<svg class="award-badge ${unlocked ? 'is-unlocked' : 'is-locked'} ${elite && unlocked ? 'challenge-earned' : ''} ${green && unlocked ? 'green-earned' : ''} ${superBadge && unlocked ? 'super-earned' : ''}" viewBox="-16 -18 132 140" aria-hidden="true">${elite ? flames : sunburst}<polygon points="${points}" fill="hsl(${(n*7)%40},70%,${18+n%8}%)" stroke="#ff8074" stroke-width="2"/><circle cx="50" cy="48" r="30" fill="#160909" stroke="#a4433a"/><text x="50" y="57" text-anchor="middle" fill="#fff2ee" font-size="27">${symbols[achievement.category]}</text><path d="M18 76H82L76 99H24Z" fill="#a82425" stroke="#ff8074"/><text x="50" y="92" text-anchor="middle" fill="white" font-size="13">${n}</text>${Array.from({length:n%5+1},(_,i)=>`<circle cx="${38+i*6}" cy="17" r="1.8" fill="#ffd0a2"/>`).join('')}</svg>`;
}
let awardQueue = [];
function checkAchievements(celebrate = false, context = null) {
  const stats = achievementStats();
  const earned = achievementList.filter(a => !awards[a.id] && stats[a.metric] >= a.target);
  if (earned.length) {
    const stamp = new Date().toISOString();
    earned.forEach(a => {
      awards[a.id] = stamp;
      const evidence=stats.evidence?.[a.metric]?.[a.target-1] || context;
      awardDetails[a.id] = evidence ? {source:String(evidence.source).slice(0,200), ...(evidence.activityDate?{activityDate:evidence.activityDate}:{})} : {source:'Recognized from existing or restored logs.'};
    });
    save();
    if (celebrate) { awardQueue.push(...earned); showNextAward(); }
  }
  const xp = stats.sets*10 + stats.workouts*100 + stats.runs*25 + stats.sauna*10 + stats.weightDays*10;
  const ribbon = document.querySelector('#award-tab');
  if (ribbon) ribbon.setAttribute('aria-label', 'Achievements · Level ' + (Math.floor(xp/500)+1) + ' · ' + Object.keys(awards).length + ' unlocked');
  return {stats,xp};
}
let displayedAward = null;
function showAward(award) {
  if (!award || !awards[award.id]) return;
  displayedAward = award;
  const popup = document.querySelector('#award-popup');
  const content = document.querySelector('#award-content');
  content.classList.toggle('super-celebration',isSuperBadge(award));
  content.innerHTML = `<p>${badgeTierName(award)} achievement unlocked</p>${badgeArt(award)}<h2 id="award-heading">${award.name}</h2><p class="badge-reason">${achievementDescription(award)}</p>`;
  updateAwardFavorite();
  if (!popup.open) popup.showModal();
}
function updateAwardFavorite() {
  const button = document.querySelector('#award-favorite');
  if (!displayedAward) return;
  const chosen = favoriteAwards.includes(displayedAward.id);
  button.textContent = chosen ? '★ Remove favorite' : '☆ Add to favorites';
  button.setAttribute('aria-pressed', chosen);
  const titleButton=document.querySelector('#award-title');
  titleButton.textContent=showcaseTitle===displayedAward.id?'Remove showcase title':'Use as showcase title';
  titleButton.setAttribute('aria-pressed',showcaseTitle===displayedAward.id);
  button.disabled = !chosen && favoriteAwards.length >= 3;
  document.querySelector('#award-favorite-hint').textContent = button.disabled ? 'You can choose 3 favorites. Remove another favorite first.' : '';
}
function toggleDisplayedFavorite() {
  if (!displayedAward || !awards[displayedAward.id]) return;
  const id = displayedAward.id;
  if (favoriteAwards.includes(id)) favoriteAwards = favoriteAwards.filter(item => item !== id);
  else if (favoriteAwards.length < 3) favoriteAwards.push(id);
  else return;
  save();
  render();
  updateAwardFavorite();
}
function replayAchievement(id) {
  const award = achievementList.find(item => item.id === id);
  if (!award || !awards[id] || document.querySelector('#award-popup').open) return;
  showAward(award);
}
function showNextAward() {
  if (document.querySelector('#award-popup').open || !awardQueue.length) return;
  showAward(awardQueue.shift());
}
let achievementFilter = 'all';
function renderAchievements() {
  const {stats,xp} = checkAchievements(false);
  view.innerHTML = `<h2>Achievements</h2><section class="card"><h3>Level ${Math.floor(xp/500)+1}</h3>${favoriteBadgesHTML()}<p>${xp} XP · ${500-xp%500} XP to next level</p><progress max="500" value="${xp%500}" aria-label="Level progress"></progress><p>${achievementList.filter(a=>awards[a.id]).length} of ${achievementList.length} unlocked</p><p>Choose up to 3 unlocked badges as favorites.</p><p>Tap any unlocked badge to watch its celebration again.</p><p>10 XP per set, 100 per full workout, 25 per run, 10 per sauna visit and per day weighed. A full workout means both original sets of all six exercises. Extra sets are optional.</p><p>Milestones add up across sessions. Unlocked badges stay yours if a log is corrected. XP follows your current logs. No rewards for heavier body weight, extreme temperatures, or long sauna stays.</p></section>`;
  view.append(achievementTools(),achievementSettings());
  const filters = [['all','All'],['unlocked','Unlocked'],['progress','In progress'],['favorites','Favorites']];
  const controls = document.createElement('div');controls.className='badge-filters';controls.setAttribute('role','group');controls.setAttribute('aria-label','Filter achievements');
  filters.forEach(([id,label])=>{const button=document.createElement('button');button.textContent=label;button.setAttribute('aria-pressed',achievementFilter===id);button.onclick=()=>{achievementFilter=id;renderAchievements();};controls.append(button);});
  view.append(controls);
  const matchesFilter = a => achievementFilter==='all' || achievementFilter==='unlocked' && awards[a.id] || achievementFilter==='progress' && a.known && !awards[a.id] && stats[a.metric]>0 || achievementFilter==='favorites' && favoriteAwards.includes(a.id) && awards[a.id];
  let visibleCount = 0;
  const groups = [
    ['Unlocked', a => Boolean(awards[a.id])],
    ['Goals to chase', a => a.known && !awards[a.id]],
    ['Mystery badges', a => !a.known && !awards[a.id]],
  ];
  for (const [title,inGroup] of groups) {
    const visible = achievementList.filter(a=>inGroup(a) && matchesFilter(a));
    if (!visible.length) continue;
    visibleCount += visible.length;
    const heading=document.createElement('h3'); heading.textContent=title; view.append(heading);
    const grid=document.createElement('div'); grid.className='award-grid';
    visible.forEach(a=>{
      const card=document.createElement('section');card.className='award-card'+(awards[a.id]?' unlocked':'')+(awards[a.id] && a.tier==='challenge'?' challenge-unlocked':'')+(awards[a.id] && isGreenFlame(a)?' green-unlocked':'')+(awards[a.id] && isSuperBadge(a)?' super-unlocked':'');
      if (!a.known && !awards[a.id]) card.innerHTML=`<div class="badge-art-slot"><div class="locked-badge" aria-hidden="true">?</div></div><h4 class="badge-name">#${achievementList.filter(item=>!item.known).findIndex(item=>item.id===a.id)+1}</h4><p class="badge-reason"></p><p class="badge-status">Locked</p>`;
      else { card.innerHTML=`<div class="badge-art-slot">${badgeArt(a)}</div>`; const name=document.createElement('h4');name.className='badge-name';name.textContent=a.name;card.append(name);const reason=document.createElement('p');reason.className='badge-reason';reason.textContent=achievementDescription(a,Boolean(awards[a.id]));card.append(reason);const detail=document.createElement('p');detail.className='badge-status';detail.textContent=awards[a.id]?'Unlocked · '+new Date(awards[a.id]).toLocaleDateString(): Math.min(stats[a.metric],a.target).toFixed(a.metric==='miles'?1:0)+' / '+a.target+' '+metricLabels[a.metric];if (awards[a.id] && (a.tier==='challenge' || isSuperBadge(a))) detail.textContent=badgeTierName(a)+' · '+detail.textContent;card.append(detail); }
      if (awards[a.id]) {
        const art = card.querySelector('.badge-art-slot');
        const replay = document.createElement('button');replay.type='button';replay.className='badge-replay';replay.dataset.replayAchievement=a.id;replay.setAttribute('aria-label','View '+a.name+' badge');replay.title='View badge animation';
        replay.append(...art.childNodes);art.append(replay);
        if (favoriteAwards.includes(a.id)) {
          const star=document.createElement('span');star.className='favorite-marker';star.textContent='★';star.setAttribute('role','img');star.setAttribute('aria-label','Favorite');card.append(star);
        }
        card.onclick=event=>{if (!event.target.closest('button')) replayAchievement(a.id);};
        const space=document.createElement('div');space.className='badge-action-space';space.setAttribute('aria-hidden','true');card.append(space);
      }
      if (!awards[a.id]) {
        const space=document.createElement('div');
        if (a.known && stats[a.metric] > 0) {
          space.className='badge-progress-slot';
          const progress=document.createElement('progress');progress.className='badge-progress-track';progress.max=a.target;progress.value=Math.min(a.target,Math.max(0,stats[a.metric]));progress.setAttribute('aria-label',a.name+' progress');
          const percent=document.createElement('small');percent.setAttribute('aria-hidden','true');percent.textContent=Math.floor(progress.value / a.target * 100)+'%';
          space.append(progress,percent);
        } else { space.className='badge-action-space';space.setAttribute('aria-hidden','true'); }
        card.append(space);
      }
      grid.append(card);
    });view.append(grid);
  }
  if (!visibleCount) { const empty=document.createElement('p');empty.textContent=achievementFilter==='favorites'?'Choose up to 3 unlocked badges as favorites to see them here.':'No badges match this filter yet.';view.append(empty); }
  requestAnimationFrame(equalizeBadgePanels);
}
function equalizeBadgePanels() {
  const grids = view.querySelectorAll('.award-grid');
  if (!grids.length) return;
  for (const [selector, variable] of [['.badge-name','--badge-name-height'], ['.award-card .badge-reason','--badge-description-height'], ['.badge-status','--badge-status-height']]) {
    const elements = [...view.querySelectorAll(selector)];
    const height = Math.ceil(Math.max(0, ...elements.map(element => element.getBoundingClientRect().height)));
    grids.forEach(grid => grid.style.setProperty(variable, height + 'px'));
  }
}
// Defer binding until the document and the main application have initialized.
document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('resize', () => requestAnimationFrame(equalizeBadgePanels));
  document.addEventListener('click', event => {
    const replay=event.target.closest('[data-replay-achievement]');
    if (replay) replayAchievement(replay.dataset.replayAchievement);
  });
  document.querySelector('#award-favorite').onclick=toggleDisplayedFavorite;
  document.querySelector('#award-title').onclick=()=>{
    if(!displayedAward||!awards[displayedAward.id])return;
    showcaseTitle=showcaseTitle===displayedAward.id?'':displayedAward.id;
    save();render();updateAwardFavorite();
  };
  const popup=document.querySelector('#award-popup');
  document.querySelector('#award-next').onclick=()=>popup.close();
  popup.addEventListener('close',()=>showNextAward());
});
