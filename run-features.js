'use strict';
const movementNames = {run:'Run',walk:'Walk',mixed:'Run/Walk'};
const runEnvironmentNames={treadmill:'Treadmill',outside:'Outside',event:'Event'};
let runProgressMode='all';
function movementMode(entry) { return entry.mode || 'run'; }
function isRunningEntry(entry) { return entry.type==='run' && movementMode(entry)==='run'; }
function sessionDuration(minutes) {
  const seconds=Math.round(minutes*60);
  return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
}
function runDistanceRecords(entries) {
  const standards=[['1 mile',1],['2 miles',2],['3 miles',3],['5K',5/1.609344],['5 miles',5],['10K',10/1.609344]];
  const best=new Map();
  for(const entry of entries.filter(e=>e.type==='run'&&e.date<=today)) {
    const standard=standards.find(([,miles])=>Math.abs(entry.miles-miles)<=miles*.005);
    const distance=standard?standard[0]:Number(entry.miles.toFixed(2))+' mi';
    const key=movementMode(entry)+'|'+distance;
    if(!best.has(key)||entry.amount<best.get(key).entry.amount)best.set(key,{distance,mode:movementMode(entry),entry});
  }
  return [...best.values()].sort((a,b)=>a.mode.localeCompare(b.mode)||a.entry.miles-b.entry.miles);
}
function weeklyMovementData(entries, mode='all') {
  return Array.from({length:8},(_,i)=>{
    const {start,end}=weekRange(i-7);
    const rows=entries.filter(e=>e.type==='run'&&e.date>=start&&e.date<=end&&e.date<=today&&(mode==='all'||movementMode(e)===mode));
    const totals={run:0,walk:0,mixed:0};
    rows.forEach(entry=>totals[movementMode(entry)]+=entry.miles);
    return {start,end,totals,total:Object.values(totals).reduce((a,b)=>a+b,0)};
  });
}
function renderRunProgress(entries) {
  const filter=document.createElement('label');filter.className='movement-filter';filter.textContent='Activity';
  const select=document.createElement('select');select.id='movement-filter';
  for(const [value,label] of [['all','All activities'],...Object.entries(movementNames)]){const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);}
  select.value=runProgressMode;select.onchange=()=>{runProgressMode=select.value;activityProgress();};filter.append(select);view.append(filter);
  const filtered=entries.filter(e=>e.date<=today&&(runProgressMode==='all'||movementMode(e)===runProgressMode));
  const weeks=weeklyMovementData(entries,runProgressMode), current=weeks.at(-1);
  const card=document.createElement('section');card.className='card';
  const minutes=filtered.filter(e=>e.date>=current.start&&e.date<=current.end).reduce((sum,e)=>sum+e.amount,0);
  const count=filtered.filter(e=>e.date>=current.start&&e.date<=current.end).length;
  card.innerHTML='<h3>This week</h3><p>'+Number(current.total.toFixed(2))+' mi · '+sessionDuration(minutes)+' min:sec · '+count+' sessions</p><h3>Weekly distance</h3><p>Last 8 weeks · Monday–Sunday · This week is still in progress.</p>';
  const max=Math.max(1,...weeks.map(week=>week.total));
  const colors={run:'#ff8177',walk:'#c9b4b0',mixed:'#e7aa65'};
  const bars=weeks.map((week,index)=>{
    const x=34+index*40;let bottom=136;
    const segments=Object.entries(week.totals).map(([mode,miles])=>{const height=112*miles/max;bottom-=height;return `<rect x="${x}" y="${bottom}" width="25" height="${height}" fill="${colors[mode]}"><title>${movementNames[mode]}: ${Number(miles.toFixed(2))} mi</title></rect>`;}).join('');
    const day=new Date(week.start+'T12:00:00');
    return segments+`<text x="${x+12}" y="157" text-anchor="middle" fill="#d7c7c0" font-size="12">${day.getMonth()+1}/${day.getDate()}</text>`;
  }).join('');
  card.insertAdjacentHTML('beforeend',`<svg class="weekly-distance-chart" viewBox="0 0 360 170" role="img" aria-label="Weekly distance in miles for the last eight weeks"><path d="M28 24V136H354" fill="none" stroke="#75413c"/><text x="24" y="28" text-anchor="end" fill="#d7c7c0" font-size="12">${Number(max.toFixed(1))}</text><text x="24" y="140" text-anchor="end" fill="#d7c7c0" font-size="12">0</text>${bars}</svg><p class="movement-legend"><span style="color:${colors.run}">Run</span> · <span style="color:${colors.walk}">Walk</span> · <span style="color:${colors.mixed}">Run/Walk</span></p>`);
  const values=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Weekly totals';values.append(summary);
  const list=document.createElement('ul');weeks.forEach(week=>{const li=document.createElement('li');li.textContent=dateLabel(week.start)+' · '+Number(week.total.toFixed(2))+' mi';list.append(li);});values.append(list);card.append(values);view.append(card);
  const heading=document.createElement('h3');heading.textContent='Records by distance';view.append(heading);
  const note=document.createElement('p');note.className='distance-record-note';note.textContent='Best whole-session time at each distance, kept separate for Run, Walk and Run/Walk. Standard distances allow 0.5% rounding; these are not estimated splits from longer sessions.';view.append(note);
  const records=runDistanceRecords(filtered);
  if(!records.length){const empty=document.createElement('p');empty.textContent='Log a session to start your distance records.';view.append(empty);}
  for(const record of records) {
    const row=document.createElement('section');row.className='card';
    const title=document.createElement('h3');title.textContent=movementNames[record.mode]+' · '+record.distance;
    const detail=document.createElement('p');detail.textContent=sessionDuration(record.entry.amount)+' min:sec · '+dateLabel(record.entry.date);
    const actual=document.createElement('p');actual.textContent='Logged distance · '+record.entry.miles+' mi'+(record.entry.environment?' · '+runEnvironmentNames[record.entry.environment]:'');row.append(title,detail,actual);view.append(row);
  }
}
