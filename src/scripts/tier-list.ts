import {getCatalog,node,url,type SearchEntry} from './catalog';
import {toast} from './global';
import {familyKey} from '../lib/families';
import {powerGroup,powerRanks,rankScores} from '../lib/power';
import {createTierBadge,createTierName} from '../lib/tier-icons';
import {matchesRoute} from '../lib/acquisition';
import '../styles/tier-icons.css';

const page=document.querySelector<HTMLElement>('[data-tier-list]');
if(page)init().catch(error=>toast(error.message));

async function init(){
  const catalog=await getCatalog();
  const ranked=catalog.entries.filter(e=>!!e.power);
  const $=<T extends HTMLElement>(selector:string)=>page!.querySelector<T>(selector)!;
  const tabs=[...page!.querySelectorAll<HTMLButtonElement>('[data-view]')];
  const route=$<HTMLSelectElement>('#tl-route'),tier=$<HTMLSelectElement>('#tl-tier'),faction=$<HTMLSelectElement>('#tl-faction'),chassis=$<HTMLSelectElement>('#tl-class');
  const query=$<HTMLInputElement>('#tl-query'),family=$<HTMLInputElement>('#tl-family'),spoilers=$<HTMLInputElement>('#tl-spoilers');
  const params=new URLSearchParams(location.search);
  const revealed=new Set<string>();
  let view=tabs.find(tab=>tab.dataset.view===params.get('category'))?.dataset.view??tabs[0].dataset.view!;

  function render(){
    tabs.forEach(tab=>tab.setAttribute('aria-selected',String(tab.dataset.view===view)));
    page!.querySelectorAll<HTMLElement>('[data-frames-only]').forEach(el=>el.hidden=view!=='warmachines');
    let cards=ranked.filter(e=>powerGroup(e)===view&&matchesRoute(e,route.value)&&(!tier.value||e.tier===tier.value)&&(!faction.value||e.faction===faction.value)&&(view!=='warmachines'||!chassis.value||e.type===chassis.value));
    if(family.checked){
      const best=new Map<string,SearchEntry>();
      for(const e of cards){const key=familyKey(e);const current=best.get(key);if(!current||e.power!.score>current.power!.score)best.set(key,e);}
      cards=[...best.values()];
    }
    // Ranks are recomputed for exactly this set, so "Base only" shows the best Base cards.
    const ranks=rankScores(cards.map(e=>({id:e.id,score:e.power!.score})));
    const term=query.value.trim().toLocaleLowerCase();
    for(const rank of powerRanks){
      const row=page!.querySelector<HTMLElement>(`[data-rank-cards="${rank}"]`)!;
      const inRank=cards.filter(e=>ranks.get(e.id)!.rank===rank).sort((a,b)=>b.power!.score-a.power!.score||a.name.localeCompare(b.name));
      // Hidden cards keep their true rank but collapse into one chip, so they never bury the visible ones.
      const secret=inRank.filter(isHidden);
      const tiles:HTMLElement[]=inRank.filter(e=>!isHidden(e)).map(e=>tile(e,ranks.get(e.id)!.position,!!term&&!e.name.toLocaleLowerCase().includes(term)));
      if(secret.length)tiles.push(secretChip(secret));
      row.replaceChildren(...tiles);
      row.closest<HTMLElement>('.tl-row')!.dataset.empty=String(!inRank.length);
    }
    const label=tabs.find(tab=>tab.dataset.view===view)!.textContent!.trim();
    const hidden=cards.filter(isHidden).length;
    $('#tl-count').textContent=`Ranking ${cards.length.toLocaleString()} ${label.toLowerCase()} against each other${hidden?` · ${hidden} spoiler cards hidden (click a ? to reveal a rank)`:''}`;
    const next=new URLSearchParams(location.search);next.set('category',view);history.replaceState(null,'',`?${next}`);
  }

  const isHidden=(e:SearchEntry)=>!!e.spoiler&&!spoilers.checked&&!revealed.has(e.id);

  // One spoiler chip per rank row: names and art stay hidden until the player asks.
  function secretChip(secret:SearchEntry[]){
    const button=node('button',undefined,'tl-tile tl-mystery');button.type='button';
    button.setAttribute('aria-label',`Spoiler: ${secret.length} hidden cards also rank here. Click to reveal them.`);
    const art=node('span',undefined,'tl-art');art.append(node('span','?','tl-question'),node('span',`×${secret.length}`,'tl-secret-count'));
    button.append(art,node('span','SPOILER','tl-name'),node('span',`${secret.length} hidden · reveal`,'tl-score'));
    button.addEventListener('click',()=>{secret.forEach(e=>revealed.add(e.id));render();});
    return button;
  }

  function tile(e:SearchEntry,position:number,dimmed:boolean){
    const link=node('a',undefined,'tl-tile');link.href=e.url;link.title=`#${position} · ${e.name}`;
    if(dimmed)link.classList.add('dimmed');
    const art=node('span',undefined,'tl-art');
    if(e.background){const bg=node('img');bg.src=url(e.background);bg.alt='';bg.loading='lazy';bg.className='tl-bg';art.append(bg);}
    if(e.image){const fg=node('img');fg.src=url(e.image);fg.alt='';fg.loading='lazy';fg.width=96;fg.height=96;art.append(fg);}
    if(e.tier)art.append(createTierBadge(e.tier,url,'tl-tier'));
    if(e.spoiler)link.classList.add('is-secret');
    link.append(art,createTierName(e.name,url,'span','tl-name'),node('span',`#${position} · ${e.category==='items'?'iLvl':'Power'} ${e.power!.score}`,'tl-score'));
    return link;
  }

  tabs.forEach(tab=>tab.addEventListener('click',()=>{view=tab.dataset.view!;render();}));
  [route,tier,faction,chassis,query,family,spoilers].forEach(control=>control.addEventListener('input',()=>{
    if(control===spoilers&&!spoilers.checked)revealed.clear();
    render();
  }));
  render();
}
