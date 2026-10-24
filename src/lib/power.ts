import type {Entry} from './data';

/**
 * Power ranks (S–D) answer "is this card good?". They are separate from card
 * tiers (Base/P/SP/HSP). Frames and pilots are scored with the combat engine's
 * own rules; equipment is ranked inside its slot by the game's iLvl rating,
 * because slots contribute different kinds of stats.
 */
export const powerRanks = ['S','A','B','C','D'] as const;
export type PowerRank = typeof powerRanks[number];
export const powerRankInfo: Record<PowerRank,{label:string;color:string;blurb:string}> = {
  S: {label:'Top pick', color:'#ff8a5c', blurb:'Top 10%. Build around it.'},
  A: {label:'Strong', color:'#edbf70', blurb:'Next 20%. Reliable in any squad.'},
  B: {label:'Solid', color:'#8fe8d3', blurb:'Middle 30%. Good with the right crew and gear.'},
  C: {label:'Filler', color:'#6dbaff', blurb:'Next 25%. Use until you find better.'},
  D: {label:'Weak', color:'#8d9aa5', blurb:'Bottom 15%. Recover, salvage or replace.'},
};
/** Cumulative share of the group that lands at or above each rank. */
const cutoffs: [PowerRank, number][] = [['S',.10],['A',.30],['B',.60],['C',.85],['D',1]];

// utils/combatEngine.ts: damage taken × (1 − DEF/(DEF+100)); shields absorb first.
// utils/evasion.ts: evasion is a separate dodge roll capped at 60%.
export const durabilityScore = (stats: Record<string,number> = {}) =>
  ((stats.HP ?? 0) + (stats.Shield ?? 0)) * (1 + (stats.Defense ?? 0) / 100) / (1 - Math.min(60, stats.Evasion ?? 0) / 100);
export const damageScore = (stats: Record<string,number> = {}) =>
  (stats.Attack ?? 0) * (1 + Math.max(stats['Ranged bonus'] ?? 0, stats['Melee bonus'] ?? 0) / 100);
export function combatScore(stats: Record<string,number> = {}) {
  return Math.round(Math.sqrt(durabilityScore(stats) * damageScore(stats)) * 10);
}

/** What the tier list can rank by. Power is the overall score; the rest isolate one strength. */
export const rankMetrics: {value: string; label: string; short: string; value_of: (e: Entry) => number | undefined}[] = [
  {value: 'power', label: 'Overall power', short: 'PWR', value_of: e => e.power?.score},
  {value: 'damage', label: 'Damage output', short: 'DMG', value_of: e => Math.round(damageScore(e.stats) * 10) / 10},
  {value: 'durability', label: 'Durability (effective HP)', short: 'EHP', value_of: e => Math.round(durabilityScore(e.stats))},
  ...['HP','Attack','Defense','Evasion','Shield','Shield regen','Energy','Energy regen','Hull regen','Ranged bonus','Melee bonus'].map(stat => ({value: stat, label: stat, short: ({Attack:'ATK',Defense:'DEF',Evasion:'EVA',Shield:'SHD','Shield regen':'SHD+','Energy regen':'EN+','Hull regen':'HP+','Ranged bonus':'RNG%','Melee bonus':'MEL%',Energy:'EN'} as Record<string,string>)[stat] ?? stat, value_of: (e: Entry) => e.stats?.[stat]})),
];

/** Median public Base frame. Pilots are scored by how much they add to it. */
export const referenceFrame = {HP: 140, Attack: 20, Defense: 10};
function crewedScore(stats: Record<string,number> = {}) {
  const combined = {...stats};
  for (const [key, value] of Object.entries(referenceFrame)) combined[key] = (combined[key] ?? 0) + value;
  return combatScore(combined) - combatScore(referenceFrame);
}

export const powerGroup = (e: Entry) => e.category === 'items' ? `items:${e.type}` : e.category;
// Combat-only boss/guest templates can never be owned, so they are not ranked.
export const isRankable = (e: Entry) => ['warmachines','pilots','items'].includes(e.category) && !!e.stats && !e.combatOnly;
export const powerScore = (e: Entry) => e.category === 'items' ? (e.rating ?? 0) : e.category === 'pilots' ? crewedScore(e.stats) : combatScore(e.stats);

export interface PowerResult {score: number; rank: PowerRank; position: number; of: number;}

/** Rank every entry against the others in its group (all card tiers together). */
export function rankPower(items: Entry[], score: (e: Entry) => number = powerScore): Map<string, PowerResult> {
  const groups = new Map<string, Entry[]>();
  for (const e of items.filter(isRankable)) {
    const key = powerGroup(e);
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }
  const results = new Map<string, PowerResult>();
  for (const group of groups.values()) for (const [id, result] of rankScores(group.map(e => ({id: e.id, score: score(e)})).filter(s => score === powerScore || s.score > 0))) results.set(id, result);
  return results;
}

/** Percentile ranks for one comparable set; the tier list re-ranks filtered views with it. */
export function rankScores(scores: {id: string; score: number}[]): Map<string, PowerResult> {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const firstPosition = new Map<number, number>();
  sorted.forEach(({score}, index) => { if (!firstPosition.has(score)) firstPosition.set(score, index + 1); });
  // Equal scores share a position, so identical cards never split across ranks.
  return new Map(sorted.map(({id, score}) => {
    const position = firstPosition.get(score)!;
    const rank = cutoffs.find(([, limit]) => position / sorted.length <= limit)![0];
    return [id, {score, rank, position, of: sorted.length}];
  }));
}

/** Client-rendered counterpart to PowerBadge.astro. */
export function createPowerBadge(power: PowerResult | undefined, className = '') {
  const badge = document.createElement('span');
  if (!power) return badge;
  badge.className = ['power-badge', className].filter(Boolean).join(' ');
  badge.dataset.rank = power.rank;
  badge.title = `${power.rank} rank · ${powerRankInfo[power.rank].label}: #${power.position} of ${power.of}`;
  badge.textContent = power.rank;
  return badge;
}
