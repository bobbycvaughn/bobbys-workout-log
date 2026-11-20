'use strict';
// First observations establish a baseline. Records compare separate calendar dates.
function recordAndWeekStats() {
  const result = {weightRecords:0,repRecords:0,distanceRecords:0,completeWeeks:0,balancedWeeks:0,evidence:{}};
  for (const metric of ['weightRecords','repRecords','distanceRecords','completeWeeks','balancedWeeks']) result.evidence[metric] = [];
  const daily = new Map(), weeks = new Map();
  const mondayFor = day => { const d=new Date(day+'T12:00:00');d.setDate(d.getDate()-(d.getDay()+6)%7);return localDate(d); };
  const weekFor = day => { const key=mondayFor(day);if(!weeks.has(key))weeks.set(key,{days:new Set(),runs:[]});return weeks.get(key); };
  for (const log of loggedSessions().filter(log=>log.date<=today).sort((a,b)=>a.date.localeCompare(b.date)||a.key.localeCompare(b.key))) {
    if (isCompleteWorkout(log)) weekFor(log.date).days.add(log.date);
    for (const group of workoutResults(log)) {
      const sets=group.sets.filter(set=>set.done);
      if (!sets.length) continue;
      const key=log.date+'|'+group.id;
      if(!daily.has(key))daily.set(key,{date:log.date,id:group.id,name:group.name,sets:[],plans:[],source:'Workout '+log.plan+' · '+group.name});
      const entry=daily.get(key);entry.sets.push(...sets);if(!entry.plans.includes(log.plan))entry.plans.push(log.plan);entry.source='Workout '+entry.plans.join('/')+' · '+group.name;
    }
  }
  const weights = new Map(), reps = new Map();
  for(const group of [...daily.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id))) {
    const weighted=group.sets.filter(s=>typeof s.weight==='number'&&s.weight>0);
    if(weighted.length) {
      const top=Math.max(...weighted.map(s=>s.weight));
      if(weights.has(group.id)&&top>weights.get(group.id)) result.evidence.weightRecords.push({activityDate:group.date,source:group.source+' · new best weight '+top+' lb'});
      weights.set(group.id,Math.max(top,weights.get(group.id)||0));
    }
    const byWeight=new Map();
    for(const set of group.sets) {
      if(set.weight===null&&!group.id.startsWith('custom:')&&(set.unit||'sec')!=='reps')continue;
      const key=group.id+'|'+(set.weight===null?'bodyweight':set.weight);
      byWeight.set(key,Math.max(set.count,byWeight.get(key)||0));
    }
    let improved=false, bestCount=0;
    for(const [key,count] of byWeight) {
      if(reps.has(key)&&count>reps.get(key)){improved=true;bestCount=Math.max(bestCount,count);}
      reps.set(key,Math.max(count,reps.get(key)||0));
    }
    if(improved)result.evidence.repRecords.push({activityDate:group.date,source:group.source+' · rep record at a previously logged weight ('+bestCount+' reps)'});
  }
  const runDays=new Map();
  for(const run of activities.filter(e=>isRunningEntry(e)&&e.date<=today)) {
    runDays.set(run.date,Math.max(run.miles,runDays.get(run.date)||0));weekFor(run.date).runs.push(run.date);
  }
  let bestDistance=null;
  for(const [day,miles] of [...runDays].sort(([a],[b])=>a.localeCompare(b))) {
    if(bestDistance!==null&&miles>bestDistance)result.evidence.distanceRecords.push({activityDate:day,source:'Run · new longest distance '+miles+' mi'});
    bestDistance=Math.max(bestDistance||0,miles);
  }
  for(const [week,row] of [...weeks].sort(([a],[b])=>a.localeCompare(b))) {
    const days=[...row.days].sort();
    if(days.length<3)continue;
    result.evidence.completeWeeks.push({activityDate:days[2],source:'Week of '+dateLabel(week)+' · 3 full workouts on different days'});
    if(row.runs.length)result.evidence.balancedWeeks.push({activityDate:[days[2],row.runs.sort()[0]].sort().at(-1),source:'Week of '+dateLabel(week)+' · 3 full workout days and a run'});
  }
  for(const metric of Object.keys(result.evidence))result[metric]=result.evidence[metric].length;
  return result;
}
function updateShowcaseTitle() {
  const title=document.querySelector('#showcase-title');
  if(!title)return;
  const achievement=achievementList.find(a=>a.id===showcaseTitle&&awards[a.id]);
  title.textContent=achievement?.name||'';title.hidden=!achievement;
}
function achievementHighlights(stats, compact = false) {
  const section=document.createElement('section');section.className='card achievement-highlights';
  const heading=document.createElement('h3');heading.textContent='Almost there';section.append(heading);
  const closest=achievementList.filter(a=>a.known&&!awards[a.id]&&stats[a.metric]>0).sort((a,b)=>(stats[b.metric]/b.target)-(stats[a.metric]/a.target)||a.target-b.target).slice(0,3);
  if(!closest.length){const p=document.createElement('p');p.textContent='Log your activities to find your next goals.';section.append(p);}
  for(const a of closest) {
    const row=document.createElement('div');row.className='close-goal';
    const name=document.createElement('strong');name.textContent=a.name;
    const amount=document.createElement('p');amount.textContent=Number(Math.min(stats[a.metric],a.target).toFixed(1))+' / '+a.target+' '+metricLabels[a.metric];
    const progress=document.createElement('progress');progress.className='badge-progress-track';progress.max=a.target;progress.value=Math.min(stats[a.metric],a.target);progress.setAttribute('aria-label',a.name+' progress');
    row.append(name,amount,progress);section.append(row);
  }
  return section;
}
function achievementSettings() {
  const section=document.createElement('section');section.className='card achievement-highlights';
  const weekly=weekSummary();
  const weekdays=new Set(loggedSessions().filter(log=>log.date>=weekly.start&&log.date<=today&&isCompleteWorkout(log)).map(log=>log.date)).size;
  const h=document.createElement('h3');h.textContent='This week’s challenges';
  const p=document.createElement('p');p.textContent=Math.min(weekdays,3)+' / 3 full workout days · '+Math.min(weekly.runs,1)+' / 1 run';
  const note=document.createElement('p');note.className='badge-reason';note.textContent='Three full workouts on different days earn a consistency week. Add a run for a balanced week. Weeks do not need to be consecutive.';
  section.append(h,p,note);
  const label=document.createElement('label');label.textContent='Showcase title';
  const select=document.createElement('select');select.id='showcase-choice';
  const none=document.createElement('option');none.value='';none.textContent='No title';select.append(none);
  achievementList.filter(a=>awards[a.id]).sort((a,b)=>a.name.localeCompare(b.name)).forEach(a=>{const option=document.createElement('option');option.value=a.id;option.textContent=a.name;select.append(option);});
  select.value=showcaseTitle;
  select.onchange=()=>{showcaseTitle=select.value;save();updateShowcaseTitle();};
  label.append(select);section.append(label);
  return section;
}
function achievementTools() {
  const tools=document.createElement('div');tools.className='achievement-tools';
  for(const [kind,label] of [['almost','Almost There'],['timeline','Achievement Timeline']]) {
    const button=document.createElement('button');button.type='button';button.textContent=label;
    button.onclick=()=>openAchievementPanel(kind);tools.append(button);
  }
  return tools;
}
function openAchievementPanel(kind) {
  const dialog=document.querySelector('#achievement-panel');
  const title=document.querySelector('#achievement-panel-title');
  const body=document.querySelector('#achievement-panel-body');
  title.textContent=kind==='timeline'?'Achievement Timeline':'Almost There';
  const content=kind==='timeline'?achievementTimeline():achievementHighlights(achievementStats(),true);
  if(kind!=='timeline')content.querySelector('h3')?.remove();
  body.replaceChildren(content);
  if(!dialog.open)dialog.showModal();
}
function achievementTimeline() {
  const section=document.createElement('section');section.className='achievement-timeline';
  const earned=achievementList.filter(a=>awards[a.id]).sort((a,b)=>Date.parse(awards[a.id])-Date.parse(awards[b.id])||a.id.localeCompare(b.id));
  const note=document.createElement('p');note.className='timeline-instructions';note.textContent='Oldest to newest · Swipe left or right. Tap a badge to open it.';section.append(note);
  if(!earned.length){const p=document.createElement('p');p.textContent='Your earned badges will appear here.';section.append(p);return section;}
  const navigation=document.createElement('div');navigation.className='timeline-navigation';
  const earlier=document.createElement('button');earlier.type='button';earlier.textContent='Earlier';earlier.setAttribute('aria-label','Scroll to earlier achievements');
  const later=document.createElement('button');later.type='button';later.textContent='Later';later.setAttribute('aria-label','Scroll to later achievements');
  const count=document.createElement('span');count.textContent=earned.length+' earned';navigation.append(earlier,count,later);section.append(navigation);
  const track=document.createElement('ol');track.className='timeline-track';track.tabIndex=0;track.setAttribute('aria-label','Achievement timeline, scroll horizontally');
  for(const a of earned) {
    const row=document.createElement('li');
    const time=document.createElement('time');time.className='timeline-date';const stamp=new Date(awards[a.id]);
    time.textContent=Number.isFinite(stamp.getTime())?stamp.toLocaleDateString(undefined,{dateStyle:'medium'})+' · '+stamp.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'}):'Unlock date not recorded';
    if(Number.isFinite(stamp.getTime()))time.dateTime=stamp.toISOString();
    const card=document.createElement('div');card.className='timeline-card';
    const button=document.createElement('button');button.type='button';button.className='timeline-badge';button.dataset.replayAchievement=a.id;button.setAttribute('aria-label','View '+a.name+' badge');button.innerHTML=badgeArt(a);
    const name=document.createElement('h3');name.textContent=a.name;
    const why=document.createElement('p');why.textContent=achievementDescription(a);
    const source=document.createElement('p');source.className='badge-reason';const info=awardDetails[a.id];source.textContent=info?(info.activityDate?dateLabel(info.activityDate)+' · ':'')+info.source:'From earlier saved logs. The original unlock activity was not recorded.';
    card.append(button,name,why,source);row.append(time,card);track.append(row);
  }
  section.append(track);
  const update=()=>{earlier.disabled=track.scrollLeft<=2;later.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-2;};
  const move=direction=>track.scrollBy({left:direction*((track.firstElementChild?.getBoundingClientRect().width||240)+16),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  earlier.onclick=()=>move(-1);later.onclick=()=>move(1);
  track.addEventListener('scroll',update,{passive:true});
  track.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1);}});
  requestAnimationFrame(()=>{track.scrollLeft=track.scrollWidth;update();});
  return section;
}
