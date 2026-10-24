import raw from '../data/lore.json';
import {byId,entries,href,entryHref,type Entry} from './data';
export interface StoryLine {speaker:string;text:string;}
export interface StoryBeat {afterFloor:number;lines:StoryLine[];}
export interface StoryChapter {chapter:number;sourceChapterId:number;title:string;description:string;floorCount:number;dialogue:StoryBeat[];comms:StoryBeat[];}
export interface StoryCampaign {id:string;name:string;description:string;chapters:StoryChapter[];evidence:string[];}
export interface FactionLore {id:string;faction:string;name:string;description:string;emblem:string;pages:{page:number;text:string}[];evidence:string[];}
export const lore=raw as {schemaVersion:number;gameVersion:string;policy:string;factions:FactionLore[];campaigns:StoryCampaign[]};
export const factions=lore.factions;
export const factionHref=(faction:FactionLore)=>href(`factions/${faction.id}/`);
export function findStoryCampaign(id:string){return lore.campaigns.find(c=>c.id===id||c.name===id||c.name===byId.get(id)?.name);}
export function missionHref(campaign:StoryCampaign,chapter:number){const parent=entries.find(e=>e.category==='campaigns'&&e.name===campaign.name);const mission=parent?.missionIds?.map(id=>byId.get(id)).find(e=>e?.chapterNumber===chapter);return mission?entryHref(mission):undefined;}
export function factionSearchEntries():Entry[]{return factions.map(f=>({id:f.id,category:'factions',name:f.name,description:f.description,type:'Faction',faction:f.faction,image:f.emblem,sources:['Released faction overview; complete lore requires a spoiler reveal.'],evidence:f.evidence}));}
