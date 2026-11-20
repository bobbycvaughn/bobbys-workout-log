'use strict';
let saunaWeekOffset=0;
function saunaWeekData(entries, offset=0) {
  const {start,end}=weekRange(offset);
  const visits=entries.filter(entry=>entry.type==='sauna'&&entry.date>=start&&entry.date<=end&&entry.date<=today);
  const minutes=visits.reduce((sum,entry)=>sum+entry.amount,0);
  const days=Array.from({length:7},(_,index)=>{
    const date=new Date(start+'T12:00:00');date.setDate(date.getDate()+index);
    const day=localDate(date);
    return {date:day,minutes:day>today?null:visits.filter(entry=>entry.date===day).reduce((sum,entry)=>sum+entry.amount,0)};
  });
  return {start,end,visits:visits.length,minutes,average:visits.length?minutes/visits.length:0,days};
}
function renderSaunaProgress(showTitle=false) {
  view.querySelector('#activity-progress')?.remove();
  if(showTitle)view.innerHTML='<h2>Sauna progress</h2>';
  const data=saunaWeekData(activities,saunaWeekOffset);
  const card=document.createElement('section');card.id='activity-progress';card.className='card sauna-week';
  const title=document.createElement('h3');title.textContent=saunaWeekOffset===0?'This week · Sauna':'Sauna · Previous week';
  const dates=document.createElement('p');dates.className='sauna-week-dates';dates.textContent=dateLabel(data.start)+' – '+dateLabel(data.end);
  const controls=document.createElement('div');controls.className='recap-controls';
  const earlier=document.createElement('button');earlier.type='button';earlier.textContent='Earlier week';
  const later=document.createElement('button');later.type='button';later.textContent='Later week';later.disabled=saunaWeekOffset===0;
  earlier.onclick=()=>{saunaWeekOffset--;renderSaunaProgress(false);};later.onclick=()=>{saunaWeekOffset=Math.min(0,saunaWeekOffset+1);renderSaunaProgress(false);};controls.append(earlier,later);
  if(saunaWeekOffset!==0){const current=document.createElement('button');current.type='button';current.textContent='This week';current.onclick=()=>{saunaWeekOffset=0;renderSaunaProgress(false);};controls.append(current);}
  const stats=document.createElement('div');stats.className='stats sauna-stats';
  for(const [value,label] of [[data.visits,'Visits'],[Number(data.minutes.toFixed(1))+' min','Total time'],[Number(data.average.toFixed(1))+' min','Average visit']]){
    const cell=document.createElement('div');cell.className='stat';const amount=document.createElement('strong');amount.textContent=value;cell.append(amount,label);stats.append(cell);
  }
  card.append(title,dates,controls,stats);
  const max=Math.max(1,...data.days.map(day=>day.minutes||0));
  const points=data.days.flatMap((day,index)=>day.minutes===null?[]:[{x:30+index*49,y:128-102*day.minutes/max,day}]);
  const chart=document.createElementNS('http://www.w3.org/2000/svg','svg');chart.classList.add('sauna-distance-chart');chart.setAttribute('viewBox','0 0 360 170');chart.setAttribute('role','img');chart.setAttribute('aria-label','Daily sauna minutes, '+dateLabel(data.start)+' to '+dateLabel(data.end));
  chart.innerHTML=`<path d="M26 24V128H338" fill="none" stroke="#75413c"/><text x="23" y="28" text-anchor="end" fill="#d7c7c0" font-size="12">${Number(max.toFixed(1))}</text><text x="23" y="132" text-anchor="end" fill="#d7c7c0" font-size="12">0</text><polyline points="${points.map(point=>point.x+','+point.y).join(' ')}" fill="none" stroke="#ff8177" stroke-width="2"/>${points.map(point=>`<circle cx="${point.x}" cy="${point.y}" r="4" fill="#ff8177"><title>${point.day.date}: ${Number(point.day.minutes.toFixed(1))} minutes</title></circle>`).join('')}${data.days.map((day,index)=>`<text x="${30+index*49}" y="151" text-anchor="middle" fill="#d7c7c0" font-size="12">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][index]}</text>`).join('')}`;
  card.append(chart);
  const note=document.createElement('p');note.className='badge-reason';note.textContent='Daily total minutes. Days with no entries show zero; upcoming days are left blank.';card.append(note);
  const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Daily totals';details.append(summary);
  const list=document.createElement('ul');for(const day of data.days){const item=document.createElement('li');item.textContent=dateLabel(day.date)+' · '+(day.minutes===null?'Upcoming':Number(day.minutes.toFixed(1))+' min');list.append(item);}details.append(list);card.append(details);
  if(!data.visits){const empty=document.createElement('p');empty.textContent='No sauna visits logged for this week.';card.append(empty);}
  const history=view.querySelector('#inline-activity-history');if(history)history.before(card);else view.append(card);
}
