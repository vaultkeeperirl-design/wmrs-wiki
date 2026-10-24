import raw from '../data/database.json';
import {rankPower,type PowerResult} from './power';
export interface Entry {
  id: string; category: string; name: string; description: string;
  type?: string; family?: string; faction?: string; rarity?: string; tier?: string;
  spoiler?: boolean; spoilerTitle?: string; storyOverview?: string; encounters?: string; recommendedRating?: number;
  bosses?: {name?: string; pilot?: string; floor?: number; frameId?: string; pilotId?: string}[];
  image?: string; background?: string; artworkNote?: string;
  stats?: Record<string, number>; sources: string[]; evidence: string[];
  packIds?: string[]; rewardIds?: string[]; abilityIds?: string[]; relatedIds?: string[]; missionIds?: string[];
  campaignId?: string; chapterNumber?: number; floorCount?: number; difficulty?: string | number;
  rating?: number; power?: PowerResult; combatOnly?: boolean; pilotSlots?: number; prototypeAdvantages?: string[]; chassisClass?: string;
  guaranteed?: boolean; cost?: string; acquisition?: string;
  rarityRates?: Record<string, number>; favoredFactions?: string[]; probabilityNote?: string;
  currencyRewards?: { name: string; amount: number }[]; dossierRate?: number;
  prices?: number[]; directPriceLabels?: string[]; note?: string;
  upgrades?: {rank: number; multiplier: number; nanites: number; duplicates: number; resources: {alloy: number; dataFragments: number} | null}[];
  productionCost?: {alloy: number; nanites: number; dataFragments: number};
}
export const database = raw as unknown as { entries: Entry[]; gameVersion: string; rules: {chassisCounters: Record<string,string>; [key: string]: unknown} };
export const entries = database.entries;
export const byId = new Map(entries.map(e => [e.id, e]));
for (const [id, result] of rankPower(entries)) byId.get(id)!.power = result;
export const categories: Record<string, {label: string; short: string; description: string}> = {
  warmachines: {label: 'War Machines', short: 'WM', description: 'Find your next frame. Browse chassis, compare base stats and trace every acquisition route.'},
  pilots: {label: 'Pilots', short: 'PL', description: 'Meet your crew. Explore pilot bonuses, faction passives and signature pairings.'},
  items: {label: 'Equipment', short: 'EQ', description: 'Weapons, armor, cores, thrusters and shields. Build a loadout around your chassis.'},
  packs: {label: 'Packs & rewards', short: 'PK', description: 'Know what you are getting. Every eligible Scout reward and every guaranteed shop bundle.'},
  abilities: {label: 'Abilities', short: 'AB', description: 'Chassis Specials, pilot passives and faction Defend effects, with their implemented descriptions.'},
  campaigns: {label: 'Campaigns', short: 'CP', description: 'Follow the base-game campaign order. Explore mission prerequisites without story revelations.'},
  missions: {label: 'Missions', short: 'MS', description: 'Chapter-by-chapter prerequisites, floor counts and public catalog rewards. Story reveals are withheld.'},
  enemies: {label: 'Enemies', short: 'EN', description: 'Know your opposition. Template stats, encounter sources and verified dossier chances.'},
  bosses: {label: 'Bosses', short: 'BS', description: 'Major threats and special encounters. Boss identities are hidden until you choose to reveal spoilers.'},
  upgrades: {label: 'Upgrades', short: 'UP', description: 'Permanent command improvements and their catalog prices. For item ranks, see each card’s page.'},
  achievements: {label: 'Achievements', short: 'AC', description: 'Track player-facing milestones in your browser. Hidden completion rewards are withheld.'},
};
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const href = (path = '') => `${base}/${path.replace(/^\//, '')}`;
export const entryHref = (e: Entry) => href(`${e.category}/${e.category === 'guides' ? e.id.replace(/^guide-/, '') : e.id}/`);
export const related = (ids?: string[]) => (ids ?? []).map(id => byId.get(id)).filter((e): e is Entry => !!e);
export const rarityColor = (r?: string) => ({ Common: '#aab8c4', Rare: '#6dbaff', Epic: '#c193ff', Legendary: '#edbf70' }[r ?? ''] ?? '#8fe8d3');
