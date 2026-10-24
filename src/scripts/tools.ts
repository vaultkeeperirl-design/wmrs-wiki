import {getCatalog,node,link,art,type SearchEntry,type Catalog} from './catalog';
import {readState,writeState,refreshState,toast} from './global';
import {fitsSlot,totalStats,validateTeam,slots,type Loadout} from '../lib/planner';
const compare=document.querySelector<HTMLElement>('#compare-tool');
const teamTool=document.querySelector('#team-tool');
if(compare||teamTool||document.querySelector('#collection-export'))getCatalog().then(c=>{if(compare)initCompare(c);if(teamTool)initTeam(c);if(document.querySelector('#collection-export'))initCollection(c);}).catch(e=>toast(e.message));
function initCompare(c:Catalog){
  const category=document.querySelector<HTMLSelectElement>('#compare-category')!;
  const query=document.querySelector<HTMLInputElement>('#compare-query')!;
  const spoilers=document.querySelector<HTMLInputElement>('#compare-spoilers')!;
  const selects=[0,1,2].map(i=>document.querySelector<HTMLSelectElement>(`#compare-${i}`)!);
  const params=new URLSearchParams(location.search);
  category.value=compare!.dataset.packOnly==='true'?'packs':['warmachines','pilots','items','packs'].includes(params.get('category')??'')?params.get('category')!:'warmachines';
  if(compare!.dataset.packOnly==='true')category.disabled=true;
  function choices(){
    const available=c.entries.filter(e=>e.category===category.value&&(!e.spoiler||spoilers.checked)&&[e.name,e.type,e.faction].join(' ').toLowerCase().includes(query.value.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name));
    selects.forEach((select,index)=>{const previous=select.value;select.replaceChildren(new Option('Choose a card',''),...available.map(e=>new Option(e.name,e.id)));if(available.some(e=>e.id===previous))select.value=previous;else if(index<2&&available[index])select.value=available[index].id;});render();
  }
  function render(){
    const selected=selects.map(s=>c.entries.find(e=>e.id===s.value)).filter((e):e is SearchEntry=>!!e);
    const output=document.querySelector('#comparison-output')!;output.replaceChildren();if(!selected.length){output.append(node('p','Choose at least one card.','tool-note'));return;}
    const table=node('table',undefined,'comparison-table');const head=node('thead');const row=node('tr');row.append(node('th','Property'));
    for(const e of selected){const cell=node('th');const image=art(e);image.style.width='110px';cell.append(image,link(e.name,e.url));row.append(cell);}head.append(row);table.append(head);const body=node('tbody');
    const textRow=(label:string,get:(e:SearchEntry)=>string)=>{const r=node('tr');r.append(node('th',label));for(const e of selected)r.append(node('td',get(e)));body.append(r);};
    textRow('Type',e=>e.type??'—');textRow('Rarity',e=>e.rarity??'—');textRow('Faction',e=>e.faction??'—');
    for(const stat of [...new Set(selected.flatMap(e=>Object.keys(e.stats??{})))]){const r=node('tr');r.append(node('th',stat));const max=Math.max(...selected.map(e=>e.stats?.[stat]??-Infinity));for(const e of selected){const v=e.stats?.[stat];r.append(node('td',v===undefined?'—':String(v),v===max?'best':''));}body.append(r);}
    if(category.value==='packs'){textRow('Reward rule',e=>e.guaranteed?'Guaranteed listed rewards':'One random eligible reward');textRow('Cost',e=>e.cost??'Not specified');textRow('Eligible / guaranteed cards',e=>String(e.rewardIds?.length??0));textRow('Currency',e=>e.currencyRewards?.map(r=>`${r.amount.toLocaleString()} ${r.name}`).join(', ')??'None listed');for(const rewardCategory of ['warmachines','pilots','items'])textRow(rewardCategory,e=>String(e.rewardIds?.filter(id=>c.entries.find(r=>r.id===id)?.category===rewardCategory).length??0));textRow('Rates',e=>e.rarityRates?Object.entries(e.rarityRates).map(([r,p])=>`${r} ${Math.round(p*100)}%`).join(' · '):'Not random');}
    if(category.value==='warmachines'){textRow('Pilot slots',e=>String(e.pilotSlots??1));textRow('Equipment',()=> '2 weapons · armor · core · thrusters · shield');}
    textRow('Abilities',e=>e.abilityIds?.map(id=>c.entries.find(a=>a.id===id)?.name).filter(Boolean).join(' · ')??'See card');textRow('Acquisition',e=>e.sources.join(' '));
    table.append(body);output.append(table);
  }
  category.addEventListener('change',choices);query.addEventListener('input',choices);spoilers.addEventListener('change',choices);selects.forEach(s=>s.addEventListener('change',render));choices();
}
function initTeam(c:Catalog){
  const lookup=new Map(c.entries.map(e=>[e.id,e]));const saved=readState().team;
  let team:Loadout[]=Array.from({length:6},(_,i)=>Object.fromEntries(Object.entries(saved?.[i]??{}).filter(([slot,id])=>slots.includes(slot as typeof slots[number])&&typeof id==='string'&&lookup.has(id))));
  let active=0;const filter=document.querySelector<HTMLInputElement>('#team-query')!;const spoiler=document.querySelector<HTMLInputElement>('#team-spoilers')!;
  const frameParam=new URLSearchParams(location.search).get('frame');if(frameParam&&lookup.get(frameParam)?.category==='warmachines'&&!lookup.get(frameParam)?.spoiler)team[0].warmachine=frameParam;
  // Hidden selections are cleared until the user explicitly opts in on this visit.
  team=team.map(bay=>Object.fromEntries(Object.entries(bay).filter(([,id])=>!lookup.get(id)?.spoiler)));
  function render(){
    const tabs=document.querySelector('#team-tabs')!;tabs.replaceChildren(...team.map((bay,i)=>{const button=node('button',`0${i+1} / ${lookup.get(bay.warmachine)?.name??'Empty bay'}`,'team-tab');button.type='button';button.setAttribute('aria-pressed',String(active===i));button.addEventListener('click',()=>{active=i;render();});return button;}));
    document.querySelector('#team-bay-title')!.textContent=`Bay ${active+1} loadout`;
    const fields=document.querySelector('#team-fields')!;fields.replaceChildren();const frame=lookup.get(team[active].warmachine);
    for(const slot of slots){
      if(slot==='copilot'&&frame?.pilotSlots!==2)continue;
      const field=node('div',undefined,'field');const label=node('label',({warmachine:'War Machine',pilot:'Primary pilot',copilot:'Co-pilot',weapon1:'Weapon I',weapon2:'Weapon II'} as Record<string,string>)[slot]??slot[0].toUpperCase()+slot.slice(1));label.htmlFor=`team-${slot}`;
      const select=node('select');select.id=`team-${slot}`;select.append(new Option('None',''));
      const items=c.entries.filter(e=>fitsSlot(e,slot,frame)&&(!e.spoiler||spoiler.checked)&&(e.id===team[active][slot]||[e.name,e.faction,e.type].join(' ').toLowerCase().includes(filter.value.toLowerCase()))).sort((a,b)=>a.name.localeCompare(b.name));
      select.append(...items.map(e=>new Option(e.name,e.id)));select.value=team[active][slot]??'';select.disabled=slot!=='warmachine'&&!frame;
      select.addEventListener('change',()=>{const previous=structuredClone(team);team[active][slot]=select.value;if(slot==='warmachine'&&!select.value)team[active]={};if(slot==='warmachine'&&lookup.get(select.value)?.pilotSlots!==2)delete team[active].copilot;
        const errors=validateTeam(team,lookup,c.rules).filter(s=>!s.includes('assign a primary pilot'));
        if(errors.length){team=previous;toast(errors[0]);}else {const state=readState();state.team=team;writeState(state);}render();});field.append(label,select);fields.append(field);
    }
    const stats=totalStats(team[active],lookup,c.rules);const output=document.querySelector('#team-stats')!;output.replaceChildren(...Object.entries(stats).map(([key,value])=>{const cell=node('div',undefined,'stat-cell');cell.append(node('span',key),node('strong',String(value)));return cell;}));
    const errors=validateTeam(team,lookup,c.rules);document.querySelector('#team-errors')!.textContent=errors.length?errors.join(' '):team.some(b=>b.warmachine)?'Selected loadouts satisfy the modeled base-game rules. Check owned copies, activity locks and mode limits in-game.':'Choose a frame to begin.';
  }
  filter.addEventListener('input',render);spoiler.addEventListener('change',()=>{if(!spoiler.checked)team=team.map(b=>Object.fromEntries(Object.entries(b).filter(([,id])=>!lookup.get(id)?.spoiler)));render();});
  document.querySelector('#team-clear')?.addEventListener('click',()=>{team=Array.from({length:6},()=>({}));const state=readState();state.team=team;writeState(state);render();});render();
}
function initCollection(c:Catalog){
  const known=new Set(c.entries.map(e=>e.id));
  function summary(){const state=readState();const cards=state.collection.filter(id=>known.has(id));document.querySelector('#collection-summary')!.textContent=`${cards.length} cards / achievements tracked on this device. Spoiler entries remain hidden until revealed.`;}
  document.querySelector('#collection-export')!.addEventListener('click',()=>{const state=readState();const blob=new Blob([JSON.stringify({schemaVersion:1,collection:state.collection,journey:state.journey},null,2)],{type:'application/json'});const download=URL.createObjectURL(blob);const a=link('',download);a.download='wmrs-wiki-checklist.json';a.click();setTimeout(()=>URL.revokeObjectURL(download),1000);});
  document.querySelector<HTMLInputElement>('#collection-import')!.addEventListener('change',async event=>{const input=event.target as HTMLInputElement;const file=input.files?.[0];if(!file)return;try{if(file.size>2_000_000)throw new Error('Checklist file is too large.');const data=JSON.parse(await file.text());if(data.schemaVersion!==1||!Array.isArray(data.collection)||!Array.isArray(data.journey)||!data.collection.every((x:unknown)=>typeof x==='string')||!data.journey.every((x:unknown)=>typeof x==='string'))throw new Error('This is not a valid WMRS wiki checklist.');const state=readState();state.collection=[...new Set([...state.collection,...data.collection.filter((id:string)=>known.has(id))])];const journey=['start-here','first-battle','first-team','upgrades','packs','advanced-strategy'];state.journey=[...new Set([...state.journey,...data.journey.filter((id:string)=>journey.includes(id))])];writeState(state);refreshState();document.dispatchEvent(new CustomEvent('wmrs-state-change'));toast('Checklist merged with your existing progress.');}catch(e){toast((e as Error).message);}input.value='';});
  document.addEventListener('wmrs-state-change',summary);summary();
}
