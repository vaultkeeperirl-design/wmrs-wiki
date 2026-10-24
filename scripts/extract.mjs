import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { digest, slug, categoryOf, familyOf, diffData, assertSafePath, validateDatabase } from './lib.mjs';
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const game = path.resolve(process.env.WMRS_GAME_ROOT ?? path.join(root, '..'));
const review = path.join(root, '.review');
await fs.mkdir(review, { recursive: true });
const read = async (p, fallback) => { try { return JSON.parse(await fs.readFile(p, 'utf8')); } catch (e) { if (e.code === 'ENOENT') return fallback; throw e; } };
// Explicit entrypoint: no directory crawling, environment files or backend imports.
let adapter = await fs.readFile(path.join(root, 'scripts/game-adapter.ts'), 'utf8');
adapter = adapter.replaceAll("'../../", `'${game.replaceAll('\\', '/')}/`);
const bundled = await build({ stdin: { contents: adapter, resolveDir: game, loader: 'ts' }, bundle: true, platform: 'node', format: 'esm', write: false, logLevel: 'silent', define: { 'import.meta.env': '{}' } });
const G = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);
const C = G.C;
const pkg = await read(path.join(game, 'package.json'));
const releaseAudit = await read(path.join(game, 'release', pkg.version, 'PACKAGE-AUDIT.json'), null);
if (!releaseAudit?.baseGameOnly || releaseAudit.developerDlcIncluded || releaseAudit.privateFilesIncluded) throw new Error('Require a base-game-only release audit with no developer DLC or private files.');
const identity = await read(path.join(root, 'data/identity.json'), {});
const entries = new Map();
const assets = new Map();
const omitted = [];
const idFor = (category, key) => identity[`${category}:${key}`] ??= `${slug(key).slice(0, 65)}-${digest(`${category}:${key}`).slice(0, 7)}`;
async function asset(candidates) {
  for (const candidate of candidates) {
    const relative = candidate.split('?')[0];
    try { assertSafePath(relative); } catch { continue; }
    const absolute = path.resolve(game, 'public', relative);
    if (!absolute.startsWith(path.resolve(game, 'public') + path.sep)) throw new Error('Asset traversal');
    try { await fs.access(absolute); assets.set(relative, absolute); return relative; } catch { /* next official candidate */ }
  }
  return undefined;
}
function entry(category, key, fields) {
  const id = idFor(category, key);
  const e = { id, category, name: key, description: '', sources: [], evidence: [], ...fields };
  entries.set(id, e);
  return e;
}
const sources = new Map();
const note = (item, label) => { const key = `${categoryOf(item)}:${item.name}`; sources.set(key, [...new Set([...(sources.get(key) ?? []), label])]); };
const scoutPool = [...C.WARMACHINE_POOL, ...C.SCOUT_PILOT_POOL, ...C.GEAR_POOL].filter(i => !i.dlcPackId && !i.bannerOnly);
scoutPool.forEach(i => note(i, 'Scout: any base-game banner. Ownership and duplicate limits apply.'));
C.STARTER_PROTOTYPES.forEach(i => note(i, 'New-game starter selection: only your selected frame is granted.'));
C.STARTER_GEAR_PACKAGE.gear.forEach(i => note(i, 'Starting equipment package.'));
G.PremiumPilots.PREMIUM_PILOT_OFFERS.forEach(o => o.pilots.forEach(i => note(i, `Premium Shop: ${o.name} (guaranteed Base card).`)));
G.PremiumFrames.PREMIUM_WARMACHINE_OFFERS.forEach(o => o.warmachines.forEach(i => note(i, `Premium Shop: ${o.name} (guaranteed SP card).`)));
G.Founders.FOUNDERS_PACK_PREVIEW_ITEMS.forEach(i => note(i, 'Founders Pack: guaranteed Base card; one-time purchase.'));
Object.values(G.Twitch.TWITCH_DROP_PILOTS).flat().forEach(i => note(i, i.name.includes('[') ? 'Recovery of a Twitch Drop card; campaign availability varies.' : 'Twitch Drops: requires an active reward campaign; availability varies.'));
Object.values(G.Twitch.TWITCH_DROP_WARMACHINES).flat().forEach(i => note(i, i.name.includes('[') ? 'Recovery of a Twitch Drop card; campaign availability varies.' : 'Twitch Drops: requires an active reward campaign; availability varies.'));
G.Referrals.REFERRAL_WARMACHINES.forEach(i => note(i, i.name.includes('[') ? 'Workshop recovery of your referral Warbear.' : 'Invite a friend: both accounts qualify after Mecha Hearts Chapter 1, one Patrol and one Pits run with at least one wave cleared.'));
for (const key of ['SORTIE_EXCLUSIVE_VAGRANT_STAR', 'SORTIE_EXCLUSIVE_MIRA']) if (G.Sorties[key]) note(G.Sorties[key], 'Rare Sortie: shown as a guaranteed reward on the mission board. Sorties unlock at Player Level 10.');
for (const set of G.BATTLE_PASS_SETS) for (const tier of set.tiers) for (const [track, reward] of [['Free', tier.freeReward], ['Premium', tier.premiumReward]]) if (reward && reward.type !== 'currency') note(reward.item, `Battle Pass ${track}: ${set.name}, tier ${tier.level}.`);
for (const reward of C.DAILY_LOGIN_REWARDS) if (reward.type === 'item' && reward.item) note(reward.item, `Daily login: day ${reward.day}.`);
const all = [...C.FULL_UNIVERSE_OF_ITEMS, ...Object.values(G.PremiumPilots.PREMIUM_PILOT_FAMILIES).flat(), ...Object.values(G.PremiumFrames.PREMIUM_WARMACHINE_FAMILIES).flat(), ...Object.values(G.Founders.FOUNDERS_PACK_PILOTS).flat(), ...Object.values(G.Founders.FOUNDERS_PACK_WARMACHINES).flat(), ...Object.values(G.Twitch.TWITCH_DROP_PILOTS).flat(), ...Object.values(G.Twitch.TWITCH_DROP_WARMACHINES).flat(), ...G.Referrals.REFERRAL_WARMACHINES, G.Sorties.SORTIE_EXCLUSIVE_VAGRANT_STAR, G.Sorties.SORTIE_EXCLUSIVE_MIRA].filter(Boolean);
const publicFamilies = new Set(all.filter(i => sources.has(`${categoryOf(i)}:${i.name}`)).map(i => `${categoryOf(i)}:${familyOf(i.name)}`));
const publicItems = new Map();
// Boss and guest templates the player can never own. They keep their own key and never replace a real card that shares the name.
const combatOnly = new Set();
const addCombatOnly = i => { const key = `${categoryOf(i)}:${i.name}`; if (!publicItems.has(key)) { publicItems.set(key, i); combatOnly.add(key); } };
for (const i of all) {
  if (i.dlcPackId || i.bannerOnly) { omitted.push({ name: i.name, reason: 'Unreleased DLC not approved' }); continue; }
  const key = `${categoryOf(i)}:${i.name}`;
  if (!publicItems.has(key)) publicItems.set(key, i);
}
// Dossiers, guests and bosses are part of the game's inspectable card catalog.
for (const enemy of G.ENEMY_CODEX_ENTRIES) {
  const i = G.createEnemyBlueprint(enemy);
  note(i, `Enemy dossier: defeat ${enemy.name} in ${enemy.source}. ${(G.ENEMY_DOSSIER_DROP_CHANCE[enemy.rarity] * 100).toFixed(0)}% per defeat; unlocks base Workshop production.`);
  addCombatOnly(i);
  combatOnly.delete(`${categoryOf(i)}:${i.name}`);
}
for (const c of C.STORY_CAMPAIGNS.filter(c => !c.dlcPackId)) for (const chapter of c.chapters) {
  note(chapter.reward, `Story reward: ${c.name}, Chapter ${c.chapters.indexOf(chapter) + 1}.`);
  for (const boss of chapter.bosses ?? []) for (const i of [boss.warmachine, boss.pilot].filter(Boolean)) if (!i.dlcPackId) addCombatOnly(i);
  for (const i of [chapter.guestLoadout?.warmachine, chapter.guestLoadout?.pilot].filter(Boolean)) if (!i.dlcPackId) addCombatOnly(i);
}
for (const i of [...publicItems.values()].filter(i => !i.isHsp && !i.name.includes(' [P]') && !i.name.includes(' [SP]'))) {
  const variants = G.createRecoveryVariants(i);
  for (const variant of [variants.prototype, variants.secretPrototype]) if (!publicItems.has(`${categoryOf(variant)}:${variant.name}`)) {
    publicItems.set(`${categoryOf(variant)}:${variant.name}`, variant);
    if (combatOnly.has(`${categoryOf(i)}:${i.name}`)) combatOnly.add(`${categoryOf(variant)}:${variant.name}`);
  }
}
for (const i of [...publicItems.values()].filter(i => i.name.endsWith(' [SP]') && categoryOf(i) !== 'items')) {
  const hsp = categoryOf(i) === 'warmachines' ? G.evolveWarmachineToHsp(i, 0) : G.evolvePilotToHsp(i, 0);
  if (publicItems.has(`${categoryOf(hsp)}:${hsp.name}`)) continue;
  publicItems.set(`${categoryOf(hsp)}:${hsp.name}`, hsp);
  if (combatOnly.has(`${categoryOf(i)}:${i.name}`)) combatOnly.add(`${categoryOf(hsp)}:${hsp.name}`);
  else note(hsp, 'Workshop HSP Evolution: complete the mastery objectives for this exact SP card.');
}
const statMap = { baseHp: 'HP', baseAttack: 'Attack', baseDefense: 'Defense', baseEvasion: 'Evasion', baseShield: 'Shield', baseMaxEnergy: 'Energy', baseEnergyRegen: 'Energy regen', baseShieldRegen: 'Shield regen', hp: 'HP', attack: 'Attack', defense: 'Defense', evasion: 'Evasion', shield: 'Shield', maxEnergy: 'Energy', energyRegen: 'Energy regen', shieldRegen: 'Shield regen', hpRegen: 'Hull regen', rangedBonus: 'Ranged bonus', meleeBonus: 'Melee bonus' };
const itemId = i => entries.get(idFor(categoryOf(i), i.name))?.id;
for (const i of publicItems.values()) {
  const category = categoryOf(i);
  let route = sources.get(`${category}:${i.name}`);
  if (!route && i.isHsp && Object.values(C.HSP_REWARDS).some(r => r.name === i.name)) route = [`Faction Red Book completion reward: unlock all ${i.faction} lore entries.`];
  if (!route && /^(Vaultkeeper|V-X Excalivault) \[HSP\]$/.test(i.name)) route = ['Rogue completionist reward: collect every required title and claim the Rogue title.'];
  const isCombatOnly = !route && combatOnly.has(`${category}:${i.name}`);
  if (isCombatOnly) route = ['Combat-only: appears as a story boss or guest. It cannot be recruited, recovered or evolved.'];
  route ??= [Object.values(G.PremiumFrames.PREMIUM_WARMACHINE_FAMILIES).flat().some(p => p.name === i.name) ? 'Reference template only: the Premium Shop grants this family at SP. No direct Base/P acquisition is established.' : i.name.includes('[') ? `Workshop recovery/evolution of ${familyOf(i.name)}; this variant is not a direct Scout reward.` : 'Acquisition requires investigation. Combat/guest catalog inclusion alone does not establish recruitability.'];
  let image = await asset(G.getItemLayerAssetCandidates(i, 'fg').filter(p => !p.includes('placeholder')));
  let familyArtwork = false;
  if (!image) {
    const siblings = [...publicItems.values()].filter(s => categoryOf(s) === category && familyOf(s.name) === familyOf(i.name));
    image = await asset(siblings.flatMap(s => G.getItemLayerAssetCandidates(s, 'fg')).filter(p => !p.includes('placeholder')));
    familyArtwork = !!image;
  }
  const background = await asset(G.getItemLayerAssetCandidates(i, 'bg'));
  const sourceModule = i.name.includes('Warbear') ? 'data/referrals.ts' : i.id?.startsWith('premium-wm') ? 'data/premiumWarmachines.ts' : i.id?.startsWith('premium-pilot') ? 'data/premiumPilots.ts' : 'constants.ts';
  entry(category, i.name, {
    family: familyOf(i.name), description: i.description, rarity: i.rarity, type: i.chassisType ?? i.type ?? (i.isAI ? 'AI pilot' : 'Pilot'), faction: i.faction,
    spoiler: !!i.isHsp || !publicFamilies.has(`${category}:${familyOf(i.name)}`),
    tier: i.isHsp ? 'HSP' : i.name.endsWith(' [SP]') ? 'SP' : i.name.endsWith(' [P]') ? 'P' : 'Base',
    stats: Object.fromEntries(Object.entries(statMap).filter(([k]) => typeof i[k] === 'number').map(([k, label]) => [label, i[k]])),
    // The card's in-game iLvl at level 1, rank 0 (same helpers the Hangar uses).
    rating: category === 'pilots' ? G.getPilotItemLevel({ ...i, level: 1, upgradeRank: 0 }) : G.toCombatRating((i.itemLevel ?? 0) + G.getTierRatingBonus(i)),
    image, background, artworkNote: familyArtwork ? 'Official family artwork is shown; a distinct foreground for this tier is not available.' : image ? undefined : 'Official foreground artwork not found; faction background shown.',
    combatOnly: isCombatOnly || undefined,
    pilotSlots: category === 'warmachines' ? C.getWarmachinePilotSlotCount(i) : undefined,
    prototypeAdvantages: i.prototypeAdvantages ?? [], chassisClass: i.chassisClass,
    sources: route, evidence: [sourceModule, 'utils/itemFactory.ts', 'utils/assetPaths.ts'],
    packIds: [], abilityIds: [], relatedIds: [],
    upgrades: Array.from({ length: 9 }, (_, rank) => ({ rank: rank + 1, multiplier: G.getUpgradeRankMultiplier(rank + 1), nanites: G.getUpgradeNaniteCost(i, rank), resources: G.getUpgradeResourceCost(i, rank), duplicates: rank < 4 ? 1 : 2 })),
    productionCost: G.getMassProductionCost(i),
  });
}
for (const c of C.STORY_CAMPAIGNS.filter(c => !c.dlcPackId)) for (const chapter of c.chapters) for (const boss of chapter.bosses ?? []) {
  const i = boss.warmachine;
  if (!i || i.dlcPackId) continue;
  const key = `${i.name} · story encounter`;
  const existing = entries.get(idFor('bosses', key));
  const source = `${c.name}, Chapter ${c.chapters.indexOf(chapter) + 1}. Authored boss card; encounter scaling can change combat stats.`;
  if (existing) { if (!existing.sources.includes(source)) existing.sources.push(source); continue; }
  // A same-named card can be a different template (e.g. Kenji's Bulwark vs the Aegis frame), so boss stats and art come from the boss itself.
  const named = entries.get(itemId(i));
  const frame = named && named.rarity === i.rarity && named.type === i.chassisType ? named : undefined;
  const image = await asset(G.getItemLayerAssetCandidates(i, 'fg').filter(p => !p.includes('placeholder'))) ?? frame?.image;
  const background = await asset(G.getItemLayerAssetCandidates(i, 'bg')) ?? frame?.background;
  entry('bosses', key, { spoiler: true, description: i.description, type: i.chassisType, rarity: i.rarity, faction: i.faction, image, background, stats: Object.fromEntries(Object.entries(statMap).filter(([k]) => typeof i[k] === 'number').map(([k, label]) => [label, i[k]])), sources: [source], evidence: ['constants.ts', 'data/story/bossPools.ts'], relatedIds: frame ? [frame.id] : [], note: 'Boss encounter reference. Appearance does not establish recruitability or a direct drop.' });
}
for (const [faction, kinds] of Object.entries(G.FACTION_ABILITY_INFO)) for (const [kind, info] of Object.entries(kinds)) {
  const a = entry('abilities', `${info.name}`, { description: info.description, faction, type: kind === 'chassis' ? 'Chassis Special' : kind === 'pilot' ? 'Pilot passive' : 'Defend effect', stats: info.cooldownTurns ? { 'Cooldown (turns)': info.cooldownTurns } : {}, sources: [`${faction}: ${kind} ability.`], evidence: ['utils/factionAbilities.ts'] });
  for (const e of entries.values()) if (e.faction === faction && ((e.category === 'warmachines' && kind !== 'pilot') || (e.category === 'pilots' && kind === 'pilot'))) e.abilityIds.push(a.id);
}
for (const i of publicItems.values()) for (const a of i.abilities ?? []) {
  const ability = entry('abilities', a.name, { spoiler: !!entries.get(itemId(i)).spoiler, description: a.description, type: 'Pilot active', stats: { 'Energy cost': a.energyCost }, effect: a.effect, sources: [`Equipped pilot: ${i.name}.`], evidence: ['data/abilities.ts', 'constants.ts'] });
  entries.get(itemId(i)).abilityIds.push(ability.id);
}
const pack = async (key, fields, rewards, imageCandidates) => {
  const p = entry('packs', key, { ...fields, image: await asset(imageCandidates), rewardIds: [...new Set(rewards.map(itemId).filter(Boolean))], sources: [fields.acquisition], evidence: fields.evidence });
  for (const id of p.rewardIds) entries.get(id).packIds.push(p.id);
  return p;
};
for (const b of C.SCOUT_BANNER_POOL.filter(b => !b.dlcPackId)) await pack(b.name, { description: b.description, type: 'Scout banner', acquisition: `${C.SCOUT_COST} Nanites per pull in Scout.`, cost: `${C.SCOUT_COST} Nanites / pull`, guaranteed: false, rarityRates: C.SCOUT_PROBABILITY, favoredFactions: b.rateUpFactions ?? [], probabilityNote: 'Rarity rates shown are before pity. Category roll: 20% War Machine, 20% pilot, 60% equipment. A 50% branch favors this banner’s faction when eligible. Empty categories fall back to the combined pool. Owned unique families and families at three copies are excluded. Per-card odds depend on your inventory and pity.', evidence: ['constants.ts', 'utils/scoutPool.ts', 'utils/scoutPity.ts'] }, scoutPool, [b.image]);
for (const o of G.PremiumPilots.PREMIUM_PILOT_OFFERS) await pack(o.name, { description: o.description, type: o.kind === 'pack' ? 'Guaranteed pilot bundle' : 'Guaranteed pilot', acquisition: 'Premium Shop; Steam purchase. Check the in-game checkout for current regional pricing.', cost: `${o.priceLabel} USD (game catalog)`, guaranteed: true, evidence: ['data/premiumPilots.ts'] }, o.pilots, o.pilots.flatMap(i => G.getItemLayerAssetCandidates(i, 'fg')));
for (const o of G.PremiumFrames.PREMIUM_WARMACHINE_OFFERS) await pack(o.name, { description: o.description, type: o.kind === 'pack' ? 'Guaranteed frame bundle' : 'Guaranteed frame', acquisition: 'Premium Shop; guaranteed SP frame(s). Check checkout for current regional pricing.', cost: `${o.priceLabel} USD (game catalog)`, guaranteed: true, evidence: ['data/premiumWarmachines.ts'] }, o.warmachines, o.warmachines.flatMap(i => G.getItemLayerAssetCandidates(i, 'fg')));
const f = G.Founders.FOUNDERS_PACK;
await pack(f.name, { description: f.description, type: 'Guaranteed mixed bundle', acquisition: 'Premium Shop; one-time Steam purchase.', cost: `${f.priceLabel} USD (game catalog)`, guaranteed: true, currencyRewards: [{ name: 'Nanites', amount: f.nanites + (f.bonusNanites ?? 0) }], evidence: ['data/foundersPack.ts'] }, G.Founders.FOUNDERS_PACK_PREVIEW_ITEMS, ['assets/shop/founders-pack.png']);
for (const n of G.Cosmetics.NANITE_PACKS) await pack(n.name, { description: `A currency purchase granting ${n.nanites + (n.bonusNanites ?? 0)} Nanites including the listed bonus.`, type: 'Currency pack', acquisition: 'Shop → Nanite Packs. Check Steam checkout for current regional pricing.', cost: `${n.priceLabel} USD (game catalog)`, guaranteed: true, currencyRewards: [{ name: 'Nanites', amount: n.nanites + (n.bonusNanites ?? 0) }], evidence: ['data/cosmetics.ts'] }, [], [`assets/shop/nanite-packs/${n.artSlug}.webp`]);
for (const enemy of G.ENEMY_CODEX_ENTRIES) {
  const blueprint = G.createEnemyBlueprint(enemy);
  const image = await asset(G.getItemLayerAssetCandidates(blueprint, 'fg').filter(p => !p.includes('placeholder')));
  entry(/boss waves|mini-boss/i.test(enemy.source) ? 'bosses' : 'enemies', enemy.name,  { spoiler: /boss waves|mini-boss/i.test(enemy.source), description: enemy.description, type: enemy.chassisType, faction: enemy.faction, rarity: enemy.rarity, image, stats: { HP: enemy.baseHp, Attack: enemy.baseAttack, Defense: enemy.baseDefense, Evasion: enemy.baseEvasion, Shield: enemy.baseShield }, sources: [enemy.source], dossierRate: G.ENEMY_DOSSIER_DROP_CHANCE[enemy.rarity], evidence: ['services/geminiService.ts', 'utils/enemyDossiers.ts'], note: 'Template stats before encounter scaling; actual combat values depend on mission/wave. Dossiers unlock the base Workshop blueprint.' });
}
for (const u of G.COMMAND_UPGRADES) entry('upgrades', u.name, { description: u.description, type: 'Command upgrade', image: await asset([u.icon]), prices: u.nanitePrices, directPriceLabels: u.directPriceLabels, sources: ['Shop → Command Upgrades. Permanent account upgrade.'], evidence: ['data/commandUpgrades.ts'] });
for (const [key, a] of Object.entries(G.ACHIEVEMENTS)) {
  if (/secretprototype/i.test(key)) { omitted.push({ name: a.name, reason: 'Description conflicts with implemented Scout pool: SP is excluded' }); continue; }
  entry('achievements', a.name, { spoiler: /hsp|allcampaign/i.test(key), description: a.description, type: 'Achievement', sources: ['Gameplay achievement.'], evidence: ['services/achievements.ts'], note: 'Game achievement definition. Steam configuration and account unlock state can differ.' });
}
const campaignOrder = ['mecha-hearts', 'aegis-initiative', 'zenith-war', 'crimson-vanguard', 'kuro-campaign'];
for (const [index, c] of C.STORY_CAMPAIGNS.filter(c => !c.dlcPackId && campaignOrder.includes(c.id)).entries()) {
  const campaign = entry('campaigns', c.name, { description: `A base-game story campaign with ${c.chapters.length} chapters. Mission details below avoid story revelations.`, type: 'Story campaign', image: await asset([c.image, c.imagePath, `assets/campaigns/${c.id}.png`].filter(Boolean)), sources: [index === 0 ? 'Story Mode: first base campaign.' : `Complete ${C.STORY_CAMPAIGNS[index - 1].name} to unlock the next base campaign.`], evidence: ['constants.ts', 'utils/storyProgression.ts'], missionIds: [] });
  for (const [position, chapter] of c.chapters.entries()) {
    const rewardId = itemId(chapter.reward);
    const m = entry('missions', `${c.name} · Chapter ${position + 1}`, { description: `Clear ${chapter.floorCount} ${chapter.floorCount === 1 ? 'floor' : 'floors'} to complete this chapter. Open the spoiler section for the story title, synopsis, encounters and reward details.`, type: 'Story mission', spoilerTitle: chapter.title, storyOverview: chapter.description, encounters: chapter.theme, recommendedRating: chapter.recommendedILvl, bosses: (chapter.bosses ?? []).map(b => ({ name: b.warmachine?.name, pilot: b.pilot?.name, floor: b.floor, frameId: b.warmachine ? itemId(b.warmachine) : undefined, pilotId: b.pilot ? itemId(b.pilot) : undefined })), campaignId: campaign.id, chapterNumber: position + 1, floorCount: chapter.floorCount, difficulty: chapter.difficulty ?? undefined, sources: [position === 0 ? `Unlock ${c.name}.` : `Complete Chapter ${position} of ${c.name}.`], rewardIds: rewardId ? [rewardId] : [], evidence: ['constants.ts', `data/story/${({ 'mecha-hearts':'mechaHearts', 'aegis-initiative':'aegisInitiative', 'zenith-war':'zenithWar', 'crimson-vanguard':'crimsonVanguard', 'kuro-campaign':'kuroCampaign' })[c.id]}.ts`], note: rewardId ? 'Reward details are behind the spoiler control.' : 'Reward route requires investigation.', image: campaign.image });
    campaign.missionIds.push(m.id);
  }
}
for (const pair of G.SIGNATURE_PAIRS) {
  const pilots = [...entries.values()].filter(e => e.category === 'pilots' && e.family === pair.pilotBaseName);
  const frames = [...entries.values()].filter(e => e.category === 'warmachines' && e.family === pair.warmachineBaseName);
  for (const p of pilots) for (const f of frames) { p.relatedIds.push(f.id); f.relatedIds.push(p.id); }
}
for (const e of entries.values()) if (e.abilityIds) e.abilityIds = [...new Set(e.abilityIds)];
for (const relative of ['assets/branding/logo.png', 'assets/title/base/ares-full-title.webp', 'assets/factions/republic-of-horizon.png', 'assets/placeholder-fg.png']) await asset([relative]);
const database = { schemaVersion: 1, gameVersion: pkg.version, releasePolicy: 'base-game; released spoilers available behind reveal controls; deployment requires reviewed snapshot', entries: [...entries.values()].sort((a,b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)), rules: { scoutCost: C.SCOUT_COST, rarityRates: C.SCOUT_PROBABILITY, chassisCounters: C.CHASSIS_TYPE_COUNTERS, chassisMultiplier: C.CHASSIS_TYPE_ADVANTAGE_MULTIPLIER, copilotContribution: C.COPILOT_STAT_CONTRIBUTION, pityThreshold: C.SCOUT_PITY_THRESHOLD, pityIncrease: C.SCOUT_PITY_INCREASE, recoveryCost: C.RECOVERY_ATTEMPT_COST, recoveryOdds: C.RECOVERY_ODDS, statDescriptions: C.STAT_DESCRIPTIONS, uniqueFamilies: [...C.UNIQUE_UNIT_NAMES], signaturePairs: G.SIGNATURE_PAIRS } };
const coverage = validateDatabase(database);
// Oracle fixtures are computed by the game itself; browser planner tests compare its model against these.
const templates = [...publicItems.values()];
const fixtureIds = [];
for (const frame of templates.filter(i => categoryOf(i) === 'warmachines').filter((_, n) => n % 37 === 0).slice(0, 18)) {
  const pilots = templates.filter(i => categoryOf(i) === 'pilots');
  const gear = templates.filter(i => categoryOf(i) === 'items');
  const n = fixtureIds.length;
  const member = { warmachine: frame, pilot: pilots[n % pilots.length], copilot: C.getWarmachinePilotSlotCount(frame) === 2 ? pilots[(n + 7) % pilots.length] : null, weapon1: gear.find(i => i.type === 'Weapon'), weapon2: gear.find(i => i.type === 'Weapon'), armor: gear.find(i => i.type === 'Armor'), core: gear.find(i => i.type === 'Core'), thrusters: gear.find(i => i.type === 'Thrusters'), shield: gear.find(i => i.type === 'Shield') };
  const actual = G.calculateTotalStats(member);
  fixtureIds.push({ loadout: Object.fromEntries(Object.entries(member).filter(([,i]) => i).map(([slot,i]) => [slot, itemId(i)])), expected: Object.fromEntries(Object.entries(statMap).filter(([k]) => !k.startsWith('base') && !['rangedBonus','meleeBonus'].includes(k)).map(([key,label]) => [label, actual[key] ?? 0])) });
}
await fs.writeFile(path.join(review, 'planner-fixtures.json'), JSON.stringify(fixtureIds, null, 2) + '\n');
const previous = await read(path.join(root, 'src/data/database.json'), null);
const changes = diffData(previous, database);
await fs.writeFile(path.join(review, 'candidate.json'), JSON.stringify(database, null, 2) + '\n');
await fs.writeFile(path.join(review, 'identity.json'), JSON.stringify(identity, null, 2) + '\n');
await fs.writeFile(path.join(review, 'assets.json'), JSON.stringify([...assets.keys()].sort(), null, 2) + '\n');
await fs.writeFile(path.join(review, 'report.json'), JSON.stringify({ candidateHash: digest(database), gameVersion: pkg.version, coverage, changes, withheld: [...new Map(omitted.map(i => [i.name, i])).values()], missingArt: database.entries.filter(e => ['warmachines', 'pilots', 'items', 'packs', 'enemies'].includes(e.category) && !e.image).map(e => e.id) }, null, 2) + '\n');
console.log(JSON.stringify({ ...coverage, changes: { added: changes.added.length, removed: changes.removed.length, changed: changes.changed.length }, withheld: omitted.length, review: '.review/report.json' }, null, 2));
