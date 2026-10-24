import {getCatalog,node,link,art,rarityRank} from './catalog';
import {refreshState,readState,toast} from './global';
import {groupFamilies,familyKey,tierOrder} from '../lib/families';
const browser=document.querySelector<HTMLElement>('.database-browser');
if(browser) init().catch(error=>toast(error.message));
async function init(){
  const catalog=await getCatalog();const lookup=new Map(catalog.entries.map(e=>[e.id,e]));
  const category=browser!.dataset.category??'';
  const fixedIds=browser!.dataset.ids?new Set(JSON.parse(browser!.dataset.ids)):null;
  const all=catalog.entries.filter(e=>(!category||e.category===category)&&(!fixedIds||fixedIds.has(e.id)));
  const query=document.querySelector<HTMLInputElement>('#db-query')!;
  const select=(id:string)=>document.querySelector<HTMLSelectElement>(`#${id}`);
  const value=(id:string)=>select(id)?.value??'';
  const spoiler=document.querySelector<HTMLInputElement>('#db-spoilers')!;
  const grouping=document.querySelector<HTMLInputElement>('#db-group');
  const gallery=document.querySelector('#db-gallery')!;
  const count=document.querySelector('#result-count')!;
  const empty=document.querySelector<HTMLElement>('#db-empty')!;
  const previous=document.querySelector<HTMLButtonElement>('#db-prev')!;
  const next=document.querySelector<HTMLButtonElement>('#db-next')!;
  let page=0;const size=48;
  if(!query.value)query.value=new URLSearchParams(location.search).get('q')??'';
  function render(){
    const terms=query.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    const collection=readState().collection;
    let results=all.filter(e=>
      (!e.spoiler||spoiler.checked)&&(!value('db-category')||e.category===value('db-category'))&&(!value('db-rarity')||e.rarity===value('db-rarity'))&&(!value('db-type')||e.type===value('db-type'))&&(!value('db-faction')||e.faction===value('db-faction'))&&terms.every(t=>e.searchText.includes(t))&&
      (browser!.dataset.collection!=='true'||collection.includes(e.id))&&
      (!value('db-reward-type')||(value('db-reward-type')==='currency'?!!e.currencyRewards?.length:e.rewardIds?.some(id=>lookup.get(id)?.category===value('db-reward-type'))))&&
      (!value('db-reward-rarity')||e.rewardIds?.some(id=>lookup.get(id)?.rarity===value('db-reward-rarity'))));
    const sort=value('db-sort');
    results.sort((a,b)=>sort==='rarity'?(rarityRank[b.rarity??'']??0)-(rarityRank[a.rarity??'']??0)||a.name.localeCompare(b.name):['hp','attack','defense'].includes(sort)?(b.stats?.[sort==='hp'?'HP':sort==='attack'?'Attack':'Defense']??0)-(a.stats?.[sort==='hp'?'HP':sort==='attack'?'Attack':'Defense']??0)||a.name.localeCompare(b.name):a.name.localeCompare(b.name));
    const grouped=!!grouping&&grouping.checked;
    const groups=grouped?groupFamilies(results):results.map(e=>[e]);
    page=Math.min(page,Math.max(0,Math.ceil(groups.length/size)-1));
    function cardFor(e:typeof all[number],variants:typeof all){
      const card=node('article',undefined,'entry-card');card.style.setProperty('--rarity',({Common:'#aab8c4',Rare:'#6dbaff',Epic:'#c193ff',Legendary:'#edbf70'} as Record<string,string>)[e.rarity??'']??'#8fe8d3');
      const anchor=link('',e.url,'card-link');anchor.append(art(e));const info=node('div',undefined,'card-info');const meta=node('div',undefined,'card-meta');meta.append(node('span',e.rarity??e.type??e.category),node('span',e.spoiler?`${e.tier??''} SPOILER`:e.tier??''));info.append(meta,node('h3',variants.length?e.family??e.name:e.name),node('p',[e.type,e.faction].filter(Boolean).join(' / ')));
      if(e.stats){const values=node('div',undefined,'card-stats');for(const stat of ['HP','Attack','Defense'])if(e.stats[stat]!==undefined)values.append(node('span',`${stat==='Attack'?'ATK':stat==='Defense'?'DEF':stat} ${e.stats[stat]}`));info.append(values);}
      anchor.append(info);card.append(anchor);
      if(variants.length){const tabs=node('div',undefined,'variant-tabs');tabs.setAttribute('aria-label',`${e.family} variants`);for(const variant of variants){const button=node('button',`${variant.tier}${variant.spoiler&&!spoiler.checked?' ◇':''}`);button.type='button';button.classList.toggle('selected',variant.id===e.id);button.setAttribute('aria-pressed',String(variant.id===e.id));button.setAttribute('aria-label',variant.spoiler&&!spoiler.checked?`Reveal ${variant.tier} spoiler variant of ${e.family}`:`Show ${variant.tier} variant of ${e.family}`);button.addEventListener('click',()=>{card.replaceWith(cardFor(variant,variants));refreshState();});tabs.append(button);}card.append(tabs);}
      if(['warmachines','pilots','items','achievements'].includes(e.category)){const button=node('button','＋ Collection','collect-button');button.type='button';button.dataset.collect=e.id;button.setAttribute('aria-pressed','false');button.setAttribute('aria-label',`Mark ${e.name} as collected`);card.append(button);}return card;
    }
    gallery.replaceChildren(...groups.slice(page*size,(page+1)*size).map(group=>{const representative=group[0];const visible=grouped&&representative.family?group:[];const hiddenTiers=visible.length?all.filter(v=>v.spoiler&&familyKey(v)===familyKey(representative)&&!visible.some(e=>e.id===v.id)&&(!value('db-rarity')||v.rarity===value('db-rarity'))):[];const variants=[...visible,...hiddenTiers].sort((a,b)=>(tierOrder[a.tier??'Base']??0)-(tierOrder[b.tier??'Base']??0));return cardFor(representative,variants);}));
    empty.hidden=groups.length>0;count.textContent=`${groups.length.toLocaleString()} ${grouped?'families / records':'card variants / records'} · ${results.length.toLocaleString()} matching entries${!spoiler.checked?' · spoilers hidden':''}`;
    document.querySelector('#db-page')!.textContent=`Page ${page+1} of ${Math.max(1,Math.ceil(groups.length/size))}`;
    previous.disabled=page===0;next.disabled=(page+1)*size>=groups.length;refreshState();
  }
  browser!.querySelectorAll('input,select').forEach(control=>control.addEventListener('input',()=>{page=0;render();}));
  previous.addEventListener('click',()=>{page--;render();gallery.scrollIntoView({block:'start'});});next.addEventListener('click',()=>{page++;render();gallery.scrollIntoView({block:'start'});});
  document.addEventListener('wmrs-state-change',()=>{if(browser!.dataset.collection==='true')render();});render();browser!.dataset.ready='true';
}
