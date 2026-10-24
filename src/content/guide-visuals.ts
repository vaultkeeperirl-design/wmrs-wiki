/** Manually maintained teaching illustrations. Every image is original game artwork. */
export interface IconFact { icon: string; label: string; description: string; path?: string; }
export interface GuideCapture {
  guide: string;
  /** One-based section number in guides.ts. */
  section: number;
  title: string;
  image: string;
  alt: string;
  caption: string;
  callouts?: { number: number; x: number; y: number; label: string; description: string }[];
  details?: { image: string; alt: string; label: string; description: string }[];
}
/** Add only reviewed captures from a clean demonstration save, never real player data. */
export const guideCaptures: GuideCapture[] = [
  {guide:'start-here',section:4,title:'IN THE GAME: CHOOSING A PATROL',image:'assets/wiki-guides/patrol-overview.webp',alt:'Actual Patrol Board showing mission intel, the guaranteed reward and Launch Patrol controls.',caption:'Captured game UI example. Patrol selection changes over time; the values shown here belong to these sample missions.',callouts:[{number:1,x:7,y:38,label:'Read the mission intel',description:'Check floor count and recommended rating before committing your squad.'},{number:2,x:18,y:56,label:'Check the guaranteed reward',description:'The displayed card is the target clear reward for that Patrol.'},{number:3,x:18,y:83,label:'Launch when prepared',description:'Equip your team in the Hangar, then select Launch Patrol.'}],details:[{image:'assets/wiki-guides/patrol-intel.webp',alt:'Close-up of Floors, iLvl and Bonus in the game mission panel.',label:'Mission intel close-up',description:'Floors tell you the length; recommended rating describes the mission challenge.'},{image:'assets/wiki-guides/patrol-reward.webp',alt:'Close-up of the actual Red Wolf Berserker reward card in a Patrol.',label:'Reward card close-up',description:'The rarity badge, card name, level and stat icons tell you exactly which template is shown.'}]},
  {guide:'first-battle',section:2,title:'IN THE GAME: READING A CARD',image:'assets/wiki-guides/card-tooltip.webp',alt:'Actual Scout Frame tooltip with its tier, rank, class, level, statistics and faction abilities.',caption:'A real Scout Frame tooltip, cropped from a clean demonstration capture. The numbers are this card’s example values, not a universal combat stat line.',callouts:[{number:1,x:88,y:13,label:'Card tier and rank',description:'The Base label identifies the variant; the star belongs to the separate Workshop rank system.'},{number:2,x:92,y:36,label:'Combat statistics',description:'The icon and label identify each value: Health, Attack, Defense and Evasion.'},{number:3,x:91,y:72,label:'Frame abilities',description:'Read the Chassis Special and Tactical Defend descriptions below the stats.'}],details:[{image:'assets/wiki-guides/card-stats.webp',alt:'Close-up of the real stat panel and Accuracy 95% line.',label:'Stat panel close-up',description:'Accuracy and target evasion are separate checks. Defense is a mitigation curve.'},{image:'assets/wiki-guides/card-abilities.webp',alt:'Close-up of Field Overdrive and Standard Brace descriptions.',label:'Ability panel close-up',description:'The frame’s own faction defines its Chassis Special and Defend effect.'}]},
  {guide:'packs',section:3,title:'IN THE GAME: YOUR NEXT-PULL ODDS',image:'assets/wiki-guides/scout-odds.webp',alt:'Actual Scout Drop Rates dialog listing base rarity rates and an example with active pity.',caption:'This capture has active pity: its displayed 47% Legendary and 53% Epic values are example next-pull odds. Ordinary base rates remain 60% Common, 32% Rare, 7% Epic and 1% Legendary.',callouts:[{number:1,x:35,y:16,label:'Base rates are explained at the top',description:'Use this line to distinguish ordinary rates from the current pity-adjusted roll.'},{number:2,x:67,y:33,label:'The large percentage is current rarity chance',description:'It applies to the next pull for this capture’s pity state; it is not a fixed individual-card chance.'},{number:3,x:26,y:38,label:'Favored and general entries',description:'The dialog separates favored-faction candidates from the wider eligible pool.'}]},
  {guide:'modes',section:1,title:'IN THE GAME: PICK A PITS FORMAT',image:'assets/wiki-guides/pits-formats.webp',alt:'Actual Solo Gauntlet 1v1, Double Battle 2v2 and Triple Battle 3v3 buttons.',caption:'The game’s format selectors. Pick the format before selecting your eligible fighters.'},
  {guide:'modes',section:2,title:'IN THE GAME: ASSEMBLE A SORTIE',image:'assets/wiki-guides/sortie-assembly.webp',alt:'Actual Sortie assembly dialog showing available spare frames, pilots and its assignment button.',caption:'Captured Parts Fetch assignment example. Active-squad cards and cards committed to other Sorties are unavailable.',callouts:[{number:1,x:45,y:19,label:'Read the assignment rules',description:'The dialog states how many spare frames and pilots the mission accepts.'},{number:2,x:18,y:46,label:'Choose an available frame',description:'Assign a spare War Machine rather than a card already committed elsewhere.'},{number:3,x:21,y:76,label:'Assign its pilot',description:'Each deployed frame needs an eligible pilot for this Sortie.'}],details:[{image:'assets/wiki-guides/sortie-card.webp',alt:'Actual Parts Fetch Sortie card displaying a 15-minute duration, squad size, preferred chassis and reward ranges.',label:'Read the mission card first',description:'Duration, recommended rating, squad size, preferred chassis and resource ranges are shown before you assemble.'}]},
];

export const uiIcon = (name: string) => `assets/wiki-ui/${name}.webp`;
export const menuFacts: IconFact[] = [
  {icon:'hangar',label:'Hangar',description:'Assign your frames, crew and equipment.',path:'guides/first-team/'},
  {icon:'patrol',label:'Patrol',description:'Repeat missions for their displayed rewards.',path:'guides/modes/'},
  {icon:'story',label:'Story',description:'Clear chapters to advance the campaign.',path:'campaigns/'},
  {icon:'scout',label:'Scout',description:'Spend Nanites on one eligible random card.',path:'guides/packs/'},
  {icon:'workshop',label:'Workshop',description:'Produce, recover and improve your cards.',path:'guides/upgrades/'},
  {icon:'red-book',label:'Red Book',description:'Look up your collection and reference entries.',path:'guides/faq/'},
];
export const currencyFacts: IconFact[] = [
  {icon:'nanites',label:'Nanites',description:'Scout, recovery and selected upgrades or convenience options.'},
  {icon:'alloy',label:'Alloy',description:'Frame and equipment production; early resource upgrades.'},
  {icon:'data-fragments',label:'Data Fragments',description:'Pilot production, early resource upgrades and recalibration.'},
];
export const combatFacts: IconFact[] = [
  {icon:'health',label:'Hull / HP',description:'The unit’s hull integrity. Incoming damage reaches this after shields.'},
  {icon:'shield',label:'Shield',description:'Absorbs damage first. Shield regeneration is a separate stat.'},
  {icon:'attack',label:'Attack',description:'Damage before defense, matchups and other attack multipliers.'},
  {icon:'defense',label:'Defense',description:'Reduces damage using the defense curve; it is not a flat subtraction.'},
  {icon:'evasion',label:'Evasion',description:'A separate avoidance check after accuracy, capped at 60%.'},
  {icon:'energy',label:'Energy',description:'Resource shown for abilities; read the attached ability’s actual requirements.'},
];
export const chassisFacts = [
  {icon:'assault',name:'Assault',target:'Skirmisher'},
  {icon:'skirmisher',name:'Skirmisher',target:'Siege'},
  {icon:'siege',name:'Siege',target:'Guardian'},
  {icon:'guardian',name:'Guardian',target:'Assault'},
];
export const workshopFacts: IconFact[] = [
  {icon:'production',label:'Production',description:'Make an unlocked blueprint; the displayed cost depends on the card.'},
  {icon:'recovery',label:'Recovery',description:'Attempt to recover a lost card. Success and tier-upgrade rolls are separate.'},
  {icon:'upgrade',label:'Upgrade',description:'Raise the individual card’s star/gear rank.'},
  {icon:'salvage',label:'Salvage',description:'Turn a card into resources; check its future use before consuming it.'},
];
export const equipmentSlots = [
  {icon:'attack',label:'Weapon I',description:'Weapon'},
  {icon:'attack',label:'Weapon II',description:'Weapon'},
  {icon:'defense',label:'Armor',description:'Armor'},
  {icon:'core',label:'Core',description:'Core'},
  {icon:'evasion',label:'Thrusters',description:'Thrusters'},
  {icon:'shield',label:'Shield',description:'Shield'},
];
export const rarities = [
  {name:'Common',chance:60,color:'#aab8c4'},
  {name:'Rare',chance:32,color:'#6dbaff'},
  {name:'Epic',chance:7,color:'#c193ff'},
  {name:'Legendary',chance:1,color:'#edbf70'},
];
export const tierFacts: IconFact[] = [
  {icon:'prototype-base',label:'Base',description:'The ordinary card template.'},
  {icon:'prototype-p',label:'P',description:'Prototype. Read the variant’s own statistics.'},
  {icon:'prototype-sp',label:'SP',description:'Secret Prototype. Recovery and special reward routes differ from Scout.'},
  {icon:'prototype-hsp',label:'HSP',description:'Hidden Secret Prototype. Individual mastery and completion rewards have separate unlock routes.'},
];
