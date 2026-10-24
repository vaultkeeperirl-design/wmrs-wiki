import type {Entry} from './data';
export const tierOrder:Record<string,number>={Base:0,P:1,SP:2,HSP:3};
export function familyKey(e:Entry){return ['warmachines','pilots','items'].includes(e.category)&&e.family?`${e.category}:${e.family}`:`${e.category}:${e.id}`;}
export function groupFamilies<T extends Entry>(items:T[]):T[][]{
  const map=new Map<string,T[]>();
  for(const item of items){const key=familyKey(item);const group=map.get(key)??[];group.push(item);map.set(key,group);}
  return [...map.values()].map(group=>group.sort((a,b)=>(tierOrder[a.tier??'Base']??0)-(tierOrder[b.tier??'Base']??0)));
}
