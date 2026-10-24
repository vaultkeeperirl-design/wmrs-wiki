import type {Entry} from './data';
export type Loadout = Record<string,string>;
export interface PlannerRules {uniqueFamilies: string[];signaturePairs:{pilotBaseName:string;warmachineBaseName:string}[];}
export const slots=['warmachine','pilot','copilot','weapon1','weapon2','armor','core','thrusters','shield'] as const;
export function fitsSlot(item:Entry,slot:string,frame?:Entry){
  if(slot==='warmachine')return item.category==='warmachines';
  if(!frame)return false;
  if(slot==='pilot'||slot==='copilot')return item.category==='pilots'&&(slot!=='copilot'||frame.pilotSlots===2);
  if(item.category!=='items')return false;
  return slot==='weapon1'||slot==='weapon2'?item.type==='Weapon':item.type?.toLowerCase()===slot;
}
export function validateTeam(team:Loadout[],lookup:Map<string,Entry>,rules:PlannerRules){
  const errors:string[]=[];const unique=new Set<string>();
  if(team.length>6)errors.push('Base Hangar has six bays.');
  team.forEach((bay,index)=>{
    const frame=lookup.get(bay.warmachine);
    for(const slot of slots){
      const id=bay[slot];if(!id)continue;const item=lookup.get(id);
      if(!item||!fitsSlot(item,slot,frame)){errors.push(`Bay ${index+1}: item does not fit ${slot}.`);continue;}
      if(rules.uniqueFamilies.includes(item.family??item.name)){
        const key=`${item.category}:${item.family??item.name}`;
        if(unique.has(key))errors.push(`Bay ${index+1}: unique family ${item.family??item.name} is already assigned.`);
        unique.add(key);
      }
    }
  });return errors;
}
export function totalStats(bay:Loadout,lookup:Map<string,Entry>,rules:PlannerRules){
  const frame=lookup.get(bay.warmachine);if(!frame)return {};
  const keys=['HP','Attack','Defense','Evasion','Energy','Energy regen','Shield','Shield regen','Hull regen'];
  const stats:Record<string,number>=Object.fromEntries(keys.map(k=>[k,frame.stats?.[k]??0]));
  const gear:Entry[]=[];
  for(const slot of slots.filter(s=>s!=='warmachine')){
    const item=lookup.get(bay[slot]);if(!item||!fitsSlot(item,slot,frame))continue;
    const factor=slot==='copilot'?0.45:1;
    for(const key of keys)stats[key]+=Math.round((item.stats?.[key]??0)*factor);
    if(item.category==='items')gear.push(item);
  }
  const pilot=lookup.get(bay.pilot);
  const signature=rules.signaturePairs.some(pair=>pair.warmachineBaseName===frame.family&&pair.pilotBaseName===pilot?.family)?0.08:0;
  const setCount=gear.filter(item=>item.rarity==='Legendary'&&item.chassisClass===frame.type).length;
  const setBonus=setCount>=4?0.15:setCount>=2?0.06:0;
  for(const k of ['HP','Attack','Defense'])stats[k]=Math.round(stats[k]*(1+signature+setBonus));
  stats.Evasion=Math.min(60,Math.max(0,stats.Evasion));
  return stats;
}
