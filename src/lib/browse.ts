import type {Entry} from './data';
import {familyKey,tierOrder} from './families';
import {damageScore,durabilityScore} from './power';

/** Combined-stat sorts shared with the tier list's Rank by options. */
export const derivedSorts = [
  {value:'damage',label:'Damage output: highest',short:'DMG',of:(e:Entry)=>damageScore(e.stats)},
  {value:'durability',label:'Durability (effective HP): highest',short:'EHP',of:(e:Entry)=>durabilityScore(e.stats)},
] as const;

export const statSorts = [
  {value:'hp',stat:'HP',label:'HP: highest'},
  {value:'attack',stat:'Attack',label:'Attack: highest'},
  {value:'defense',stat:'Defense',label:'Defense: highest'},
  {value:'shield',stat:'Shield',label:'Shield: highest'},
  {value:'evasion',stat:'Evasion',label:'Evasion: highest'},
  {value:'energy',stat:'Energy',label:'Energy: highest'},
  {value:'ranged-bonus',stat:'Ranged bonus',label:'Ranged bonus: highest'},
  {value:'melee-bonus',stat:'Melee bonus',label:'Melee bonus: highest'},
] as const;

const rarityRank:Record<string,number>={Common:1,Rare:2,Epic:3,Legendary:4};
// Matches the base route in utils/storyProgression.ts; DLC is never chained into it.
export const baseCampaignNames=['Mecha Hearts','The Aegis Initiative','The Zenith War','The Crimson Vanguard','No Masters'] as const;
function campaignPosition(entry:Entry,lookup?:ReadonlyMap<string,Entry>){
  const campaign=entry.category==='missions'&&entry.campaignId?lookup?.get(entry.campaignId):entry;
  const name=campaign?.name??entry.name;
  const index=baseCampaignNames.findIndex(candidate=>name===candidate||name.startsWith(`${candidate} · Chapter `));
  return index<0?99:index;
}
export function matchesTierVisibility(entry:Entry,tier:string,revealSpoilers:boolean){
  return (!entry.spoiler||revealSpoilers)&&(!tier||entry.tier===tier);
}

export function compareBrowseEntries(a:Entry,b:Entry,sort:string,lookup?:ReadonlyMap<string,Entry>){
  let difference=0;
  if(sort==='campaign-order')difference=campaignPosition(a,lookup)-campaignPosition(b,lookup)||(a.chapterNumber??0)-(b.chapterNumber??0);
  else if(sort==='tier-high')difference=(tierOrder[b.tier??'']??-1)-(tierOrder[a.tier??'']??-1);
  else if(sort==='tier-low')difference=(tierOrder[a.tier??'']??4)-(tierOrder[b.tier??'']??4);
  else if(sort==='power-high'||sort==='power-low'){
    // Unranked records always trail ranked cards, whichever direction is chosen.
    // Percentile keeps frames, pilots and each gear slot comparable on mixed pages.
    const aScore=a.power&&1-a.power.position/a.power.of;const bScore=b.power&&1-b.power.position/b.power.of;
    if(aScore===undefined&&bScore!==undefined)return 1;
    if(aScore!==undefined&&bScore===undefined)return -1;
    difference=sort==='power-high'?(bScore??0)-(aScore??0):(aScore??0)-(bScore??0);
  }
  else if(derivedSorts.some(option=>option.value===sort)){
    const of=derivedSorts.find(option=>option.value===sort)!.of;
    if(!a.stats&&b.stats)return 1;
    if(a.stats&&!b.stats)return -1;
    difference=of(b)-of(a);
  }
  else if(sort==='rarity')difference=(rarityRank[b.rarity??'']??0)-(rarityRank[a.rarity??'']??0);
  else if(sort==='name-desc')difference=b.name.localeCompare(a.name);
  else {
    const stat=statSorts.find(option=>option.value===sort)?.stat;
    if(stat){
      const aValue=a.stats?.[stat];const bValue=b.stats?.[stat];
      if(aValue===undefined&&bValue!==undefined)return 1;
      if(aValue!==undefined&&bValue===undefined)return -1;
      difference=(bValue??0)-(aValue??0);
    }
  }
  return difference||a.name.localeCompare(b.name)||a.id.localeCompare(b.id);
}

/** Keep the best matching entry at the front; tier tabs are ordered separately. */
export function sortedBrowseGroups<T extends Entry>(items:T[],sort:string,grouped:boolean,lookup?:ReadonlyMap<string,Entry>):T[][]{
  const sorted=[...items].sort((a,b)=>compareBrowseEntries(a,b,sort,lookup));
  if(!grouped)return sorted.map(entry=>[entry]);
  const groups=new Map<string,T[]>();
  for(const entry of sorted){
    const key=familyKey(entry);const group=groups.get(key)??[];
    group.push(entry);groups.set(key,group);
  }
  return [...groups.values()];
}
