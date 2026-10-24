export interface Guide { slug: string; title: string; summary: string; level: string; sources: string[]; sections: { title: string; paragraphs: string[]; bullets?: string[] }[]; related: string[]; }
export const guides: Guide[] = [
  {slug:'start-here',title:'Start here: your first deployment',summary:'From a new save to your first mission, learn what to do and why it matters.',level:'01 / BEGINNER',sources:['App.tsx','components/StarterSelectionScreen.tsx','components/HangarScreen.tsx','constants.ts'],related:['first-battle','first-team','economy'],sections:[
    {title:'What is Warmachine: Rogue Scout?',paragraphs:['WMRS is a mecha collection and squad combat game. You assemble War Machines, assign pilots, fit equipment and take that squad into Patrols, story missions and the Fighting Pits. Recruiting cards matters, but a complete loadout and the right chassis matchup matter too.','Your regular loop is: prepare in the Hangar → deploy → collect rewards and experience → improve your squad in the Workshop → attempt the next mission. Story progression opens the next base campaign; Patrols offer repeatable combat and displayed item rewards.']},
    {title:'Choose a starter you understand',paragraphs:['New-game selection grants the starter frame you choose, not every frame shown. The four starter prototypes are Ares (Assault), Aegis (Guardian), Juggernaut (Siege) and Spectre (Skirmisher). You also start with an Apex pilot and starter equipment.','There is no universal best starter established by the code. Pick a chassis whose matchup you can remember, then examine its real statistics in the database. Assault has an advantage against Skirmisher; Skirmisher against Siege; Siege against Guardian; Guardian against Assault.']},
    {title:'Read the main menu as a workflow',paragraphs:['The Hangar is where you assign frames, pilots and equipment. Patrol is the repeatable mission board. Story Mode advances chapters. Scout spends Nanites on random recruitment. Workshop handles production, recovery, upgrading and recalibration. The Red Book is the in-game reference and collection.','The Fighting Pits are wave combat. Multiplayer includes competitive and social features. Sorties unlock at Player Level 10 after the tutorial, and send available cards on timed assignments. Shops contain optional purchases and convenience upgrades.']},
    {title:'Your first mission checklist',paragraphs:['Finish the onboarding prompts. In the Hangar, select your frame, assign a pilot, and fill the equipment slots you own. Read the mission’s displayed reward and recommended combat rating before you deploy.','On the battle screen, watch hull, shields, the combat log and the Chassis Special cooldown. Clear every floor to complete the mission. If you retreat or lose, review the result and any recovery entries before deploying the same plan again.'],bullets:['Assign a pilot to gain crew stats and faction effects. The Fighting Pits requires a pilot for a valid fighter.','An empty gear slot contributes no equipment stats. Fill basic slots before comparing rare cards in isolation.','Keep some Nanites for recovery and upgrades rather than spending the entire balance on Scout.']},
    {title:'What to do next',paragraphs:['Play the first story chapters and repeat manageable Patrols. Use the first-battle guide to understand damage, then the first-team guide to build a balanced loadout. The homepage journey remembers which learning stages you have marked complete on this browser.']},
  ]},
  {slug:'first-battle',title:'Your first battle: reading combat',summary:'Understand turns, targets, damage, hull, shields and your active controls.',level:'02 / BEGINNER',sources:['components/RunSimulationScreen.tsx','utils/combatEngine.ts','utils/combatRules.ts','utils/accuracy.ts','utils/evasion.ts'],related:['first-team','advanced-strategy','status-effects'],sections:[
    {title:'How actions resolve',paragraphs:['In the Patrol/Story simulation, your side begins, then sides alternate. Each operational unit on the acting side resolves its action. A unit whose pilot has been killed needs a surviving co-pilot to continue; uncrewed drones remain operational. This is squad turn resolution, rather than movement on a tactical grid. The battle log shows misses, hits and triggered effects.','The run proceeds to the next floor after the enemy squad is defeated. Mission completion requires clearing the mission’s floor count. Losing the squad or retreating ends that attempt. Multiplayer and Pits reuse the shared attack engine, while their encounter and victory rules differ.']},
    {title:'Read hull and shields separately',paragraphs:['HP is hull integrity. Shields absorb resolved damage before hull: a 30-damage hit against 20 shield removes 20 shield and 10 hull. Shield and hull regeneration are separate stats; do not assume a large shield also repairs hull.','Attack controls damage before mitigation. Defense reduces damage using a curve, not a flat subtraction and not a direct percentage. Evasion is the chance to avoid a hit after the accuracy check, capped at 60%.']},
    {title:'Why attacks miss',paragraphs:['Normal attacks first face a 95% accuracy check and a separate target evasion check. With 10% target evasion and no special effects, the hit chance is 0.95 × 0.90 = 85.5%. A target can therefore be harder to hit than its evasion number alone suggests.','Suppression lowers accuracy by 15 percentage points to 80% for its duration. A phased target cannot be hit. Juggernaut stabilizers guarantee hits against Guardian targets unless they are phased. These are implemented exceptions, not a general accuracy equipment stat.']},
    {title:'Damage in a worked example',paragraphs:['A normal successful attack uses Attack × 100 / (Defense + 100), then applies chassis, crew and other active multipliers. It then rolls damage variance from 0.85 to 1.15 and rounds, with at least 1 damage.','With 100 Attack against 100 Defense, the neutral pre-variance result is 50. Standard chassis advantage multiplies by 1.3, giving 65 before variance. A critical multiplies by 1.5; the ordinary critical chance is 5%. Special attacks and named passives can add further multipliers. These numbers illustrate the formula; they are not a promise that a particular card has 100 Attack.']},
    {title:'Use Specials and Defend deliberately',paragraphs:['Every faction has a Chassis Special. Some consume an attack turn, while others apply an immediate support effect. Read the ability panel and cooldown on your frame’s page. The pilot’s faction passive is independent from the frame’s faction.','Defending holds the unit’s attack and changes how it handles incoming threats. Its faction-specific effect matters: check the linked Defend ability rather than assuming every faction braces identically. Automatic attacks still choose targets through the battle rules; there is no positional flanking system.']},
  ]},
  {slug:'first-team',title:'Build your first team',summary:'Fill the right slots, mix chassis roles, and make pilot and equipment bonuses count.',level:'03 / BEGINNER',sources:['utils/squadEquipment.ts','utils/gameLogic.ts','constants.ts','utils/typeHelpers.ts'],related:['equipment','advanced-strategy','upgrades'],sections:[
    {title:'Start with a complete loadout',paragraphs:['The base Hangar has six squad bays. Each ordinary War Machine uses one bay. A loadout has a frame, a pilot, two weapon slots, armor, a core, thrusters and a shield. Specific dual-crew frames have a co-pilot slot as well.','The equipment types are enforced by slot: Weapon I and II accept weapons, while armor, core, thrusters and shield accept their matching type. Base-game equipment is not locked to a faction or chassis class; class-tagged gear can instead earn a set bonus.']},
    {title:'How pilots contribute',paragraphs:['Your primary pilot contributes its stats to the frame. On a dual-crew frame the co-pilot contributes 45% of its scaled stats. Weapon specialty calculations separately use half of the co-pilot’s ranged or melee bonus, so do not apply 45% to every mechanic.','The pilot’s passive comes from its own faction, while the frame’s Special and Defend effect come from the frame’s faction. Mixing factions is allowed. A pilot’s ranged or melee bonus applies when the corresponding weapon type is being used.']},
    {title:'Match chassis to threats',paragraphs:['The standard cycle is Assault → Skirmisher → Siege → Guardian → Assault. An arrow means 30% more damage for the attacker. Prototype advantage entries can provide a stronger 1.5 multiplier against the listed chassis instead.','Use the comparator to see actual HP, Attack, Defense, shield and evasion together. A higher rarity is useful information, but it is not a replacement for examining the role and equipment you can field.']},
    {title:'Signature pairs and gear sets',paragraphs:['The game defines specific story-canonical pilot/frame signature pairs. A verified pair gives +8% HP, Attack and Defense. Sharing a faction or a similar name alone is not sufficient. Entity pages link the actual pair when it is present in the catalog.','Two matching-class Legendary/HSP gear pieces give a 6% HP/Attack/Defense bonus; four or more give 15%. The gear’s class must match the frame’s chassis. The signature and set bonuses add together before the resulting multiplier is applied to those three stats.']},
    {title:'Plan without guessing a tier list',paragraphs:['For a first squad, fill your available bays with equipped frames and assign pilots for their bonuses and cover more than one matchup. Compare a shielded frame’s total survivability with your current options, and keep a response to whichever chassis is stopping your progression. This is guidance derived from the counter cycle, not a tested ranking.','The team builder enforces base-game slot types, dual-pilot eligibility and unique card-family limits. It treats each repeated equipment selection as a separate owned copy and cannot check your in-game inventory. Its totals model fresh level-1, rank-0 loadouts; temporary combat effects are not forecasts.']},
  ]},
  {slug:'upgrades',title:'Upgrades, recovery and the Workshop',summary:'Understand duplicate costs, resource upgrades, blueprints and recovery before spending.',level:'04 / PROGRESSION',sources:['utils/upgradeRank.ts','utils/gameLogic.ts','constants.ts','components/WorkshopScreen.tsx','utils/evolution.ts','utils/pilotEvolution.ts'],related:['economy','equipment','packs'],sections:[
    {title:'Four different improvements',paragraphs:['Experience levels, Workshop rank, prototype tier and HSP evolution are different systems. Frame experience levels increase its combat stats by 1.5% per level above 1; pilot levels use 2%. Evasion scales more gently and remains capped.','Prototype tiers are Base, P, SP and HSP. These have different authored or game-generated template stats. Workshop rank is the star/gear ladder on an individual card. Do not read five stars as the same thing as SP rarity.']},
    {title:'The star and gear ladder',paragraphs:['Rank 0 is one star with a 1× stat multiplier. Ranks 1–4 add 7% each. Ranks 5–9 add 14% each beyond the completed star phase. At rank 9 the multiplier is 1 + 4×0.07 + 5×0.14 = 1.98.','Each early step consumes one same-family, same-category duplicate, or offers its Nanite alternative. Gear-phase steps need two duplicates. Farmable Alloy/Data Fragment payment is available for the early star steps only. Every card page lists its exact per-step costs from the game functions.']},
    {title:'Production and blueprints',paragraphs:['Common production recipes are available by default. Other ordinary family blueprints unlock through discovering an SP version. Enemy dossiers are a separate route: defeating a documented enemy can unlock its base production blueprint.','Frame and equipment production consume Alloy; pilot cloning uses Data Fragments. A Nanite alternative is also calculated. Card pages show the formula outputs, but an available template is not proof that its blueprint is unlocked or that every preview tier is directly producible.']},
    {title:'Recovering a lost unit',paragraphs:['The ordinary recovery attempt costs 500 Nanites and has 75% success. A failed attempt normally has a 60-minute retry cooldown. The Veteran Recovery Crew reduces that cooldown to 45 minutes without changing success odds.','Successful recovery has a 20% prototype upgrade branch; an eligible P recovery has a 1-in-30 chance to become SP. The first eligible starter recovery tutorial guarantees its upgrade. These upgrade chances are conditional on the relevant successful recovery path, not overall recruitment rates. Check the result screen before assuming a lost card is permanently gone.']},
    {title:'Evolution projects',paragraphs:['SP frames and pilots can undertake individual HSP mastery projects in the Workshop. Progress belongs to that exact card. Completing the required objectives turns the owned SP card into its HSP version while preserving its identity and investment.','Hidden and completionist results are protected by the wiki’s spoiler controls. A family’s generated evolution preview and an authored faction completion reward are separate acquisition routes even if both are HSP.']},
  ]},
  {slug:'packs',title:'Packs: know the reward before you spend',summary:'Distinguish random Scout banners, guaranteed bundles and currency purchases.',level:'05 / RECRUITMENT',sources:['constants.ts','utils/scoutPool.ts','utils/scoutPity.ts','data/premiumPilots.ts','data/premiumWarmachines.ts','data/foundersPack.ts','data/cosmetics.ts'],related:['economy','upgrades','advanced-strategy'],sections:[
    {title:'Random and guaranteed are different',paragraphs:['A Scout banner costs 150 Nanites per pull and selects one eligible card. A premium pilot bundle grants its listed Base pilots. Premium frame offers grant the listed SP frames. Nanite packs grant currency rather than rolling for units. The pack database labels these separately.','The complete Scout pool is shared across base-game banners. A faction banner favors a faction; it does not make that faction the only possible result. Every pack page shows eligible or guaranteed rewards and each reward links back to its packs.']},
    {title:'Rarity odds before pity',paragraphs:['The ordinary Scout rarity rates are 60% Common, 32% Rare, 7% Epic and 1% Legendary. These are rarity rates, not the probability of a specific card. The category roll is 20% War Machine, 20% pilot and 60% equipment, with fallback if a category has no eligible cards.','A separate 50% branch narrows to favored entries when that banner has eligible favored items. Another branch can select from the full eligible category. Your owned unique families and the three-copy family cap affect eligibility. A fixed per-unit probability would therefore be misleading.']},
    {title:'Pity and duplicate behavior',paragraphs:['After 50 consecutive qualifying low-rarity results, pity starts adding probability to Epic and Legendary. The formula adds 2 percentage points of total high-rarity probability per additional pity step, split evenly between Epic and Legendary and removed proportionally from Common/Rare.','An Epic or Legendary resets the pity counter. Ownership is also relevant: designated unique families are excluded once owned, and a family with three copies is excluded. The game does not treat all duplicates as a universal currency conversion; duplicates also have Workshop upgrade uses.']},
    {title:'How to choose a banner',paragraphs:['Search the card you want and look at its pack links first. If it is in Scout, a matching faction banner changes selection preference while keeping the shared pool. If it is a story or recovery-only card, changing Scout banners cannot add it to the pool.','Use Pack Explorer to filter reward type and rarity, then compare up to three packs. Guaranteed bundles state their exact listed rewards; they should not be compared to random banners as if both were lotteries. In-game checkout determines current regional purchase prices.']},
  ]},
  {slug:'advanced-strategy',title:'Advanced strategy from verified rules',summary:'Use mitigation, matchups, crew and set bonuses without relying on an invented tier list.',level:'06 / ADVANCED',sources:['utils/combatEngine.ts','utils/gameLogic.ts','utils/factionAbilities.ts','utils/combatRules.ts'],related:['first-battle','first-team','status-effects'],sections:[
    {title:'Compare a whole loadout',paragraphs:['Frame stats are only the starting point. Add a pilot, optional co-pilot and all six gear slots, then account for levels, rank and verified pair/set bonuses. A database card is a level-1 template; it is not your final combat stat sheet.','Combat rating is a progression summary with equipment and crew contributions. Signature and set bonuses are deliberately not included in that rating, although they improve combat HP/Attack/Defense. A higher displayed rating does not automatically predict a win in every matchup.']},
    {title:'Understand diminishing mitigation',paragraphs:['At 100 Defense, ordinary damage before other multipliers is halved. At 200 Defense, one third passes through. Adding another 100 Defense does not create another 50 percentage points of reduction.','Standard chassis advantage and critical hits multiply the damage that passes through. Use the counter cycle to address a difficult matchup before assuming more rarity is the only answer. This recommendation follows the formula and is not an experimentally proven optimal build.']},
    {title:'Separate shared rules from special cases',paragraphs:['Wraith and Le Spectre have Phase Shift behavior; Juggernaut has anti-Guardian stabilizers; Breacher Frame halves a Guardian’s effective defense on its attack. Named passives supplement faction abilities and should not be generalized to every card of that chassis.','Temporary marks, suppression, hack, taunt and linked effects alter individual turns. Read the ability and combat log. A card description may contain flavor alongside mechanics; the wiki labels extracted descriptions and verified formulas separately.']},
    {title:'Prepare for progression walls',paragraphs:['Check the mission’s recommended rating, fill empty slots, improve affordable Workshop ranks and train the cards you already field. Verify that a co-pilot is on a dual-crew frame and that any claimed signature pair is actually in the game’s defined pair list.','Keep a recovery budget and a second usable loadout when cards are committed to Sorties. Choose Patrols by displayed reward when hunting a particular prototype. These are source-based preparation steps, not claims about the fastest farming route or an unmeasured drop rate.']},
  ]},
  {slug:'equipment',title:'Equipment and loadout rules',summary:'What every slot does, how bonuses add up, and when class-tagged gear matters.',level:'REFERENCE',sources:['types.ts','utils/squadEquipment.ts','utils/gameLogic.ts'],related:['first-team','upgrades','advanced-strategy'],sections:[
    {title:'Six equipment slots',paragraphs:['A frame equips two weapons, one armor, one core, one set of thrusters and one shield. Gear fits by its equipment type. There is no additional base-game faction restriction in the slot validator.','Weapon statistics add to the loadout alongside other equipment. Weapon I and II alternate during the interactive simulation; ranged/melee pilot specialties are evaluated for the weapon used by the attack.']},
    {title:'Read the actual bonuses',paragraphs:['Equipment may contribute HP, Attack, Defense, evasion, energy, shields and regeneration. Some items have negative bonuses. A weapon can therefore trade defense for attack; do not assume its type makes every number beneficial.','Equipment does not use the pilot/frame XP-level multiplier. Workshop rank still multiplies its base stat contributions. Rolled gear modifiers are additional per-item bonuses; the wiki records template stats and cannot know the modifier roll on your owned copy.']},
    {title:'Class sets and recalibration',paragraphs:['Legendary/HSP class-tagged equipment counts toward a tier set only when its chassis class matches the frame. Two pieces award 6% and four award 15% to HP, Attack and Defense.','Recalibration rerolls gear modifiers for Data Fragments. The rarity costs are 50 Common, 120 Rare, 300 Epic and 600 Legendary. It is a repeatable resource sink, not a guaranteed upgrade in every resulting stat.']},
    {title:'Ownership and duplicates',paragraphs:['One physical card cannot occupy two equipment slots at once. Separate copies of the same weapon may fill Weapon I and II. Cards assigned to another loadout or activity can be unavailable to the selection you are making.','Use the equipment filters and compare tool to examine exact bonuses before spending upgrade materials. The collection checklist tracks which templates you own; it does not synchronize counts or rolled modifiers from the game.']},
  ]},
  {slug:'economy',title:'Currencies and progression',summary:'Nanites, Alloy, Data Fragments, experience and the difference between earning and buying.',level:'REFERENCE',sources:['constants.ts','utils/gameLogic.ts','data/commandUpgrades.ts','utils/rank.ts','data/battlePassData.ts','data/sorties.ts'],related:['packs','upgrades','modes'],sections:[
    {title:'Three currencies with different jobs',paragraphs:['Nanites pay for Scout, recovery and many convenience or upgrade options. Alloy is used for manufacturing frames and gear. Data Fragments support pilot production, resource-based upgrades and equipment recalibration.','Combat rewards, challenges, login rewards, progression systems and Sorties supply resources according to their own reward tables. Read the displayed reward rather than assuming one fixed payout for every mission. Nanite packs are an optional purchase; Alloy and Data Fragment spending paths remain relevant.']},
    {title:'Experience and leveling',paragraphs:['Player levels, frame levels and pilot levels are distinct. Player-level experience needed for a level is 100 × level + 5 × level². Frame level requirements are round(80 × 1.1^(level−1)); pilot requirements use 60 in place of 80.','Frame and pilot XP affects their combat contributions. Player Level 10 unlocks Sorties once onboarding has finished. The account level does not substitute for equipping or training the actual cards you deploy.']},
    {title:'Battle Pass and login rewards',paragraphs:['The game defines free and premium Battle Pass rewards at specific tiers. Login rewards follow a 28-day cycle with currency and item days. These are separate reward sources from Scout.','An available reward definition does not prove a server event is currently active. This wiki avoids inventing live season dates, store availability or future prices. Check the in-game tier and claim state.']},
    {title:'Permanent account upgrades',paragraphs:['Sortie Command Uplink grants one additional concurrent Sortie slot per rank. Its three Nanite prices are 6,500, 9,000 and 12,500. Veteran Recovery Crew costs 4,500 Nanites and shortens failed-recovery retry time by 25%.','These are convenience improvements, and the recovery crew does not improve success probability. Their upgrade pages carry the catalog’s direct purchase labels, while the current checkout is authoritative for regional pricing.']},
    {title:'Spend with a purpose',paragraphs:['Before a Scout pull, check whether the target exists in the eligible pool. Before a production purchase, check the blueprint unlock. Before burning duplicates, compare the card’s recovery tier and future use.','No farming route is labeled optimal here without measurement. Match a mission’s displayed rewards to the resource or item you need and compare the known cost against your available budget.']},
  ]},
  {slug:'status-effects',title:'Abilities, status effects and targeting',summary:'Separate faction Specials, pilot passives and temporary battle states.',level:'COMBAT REFERENCE',sources:['utils/factionAbilities.ts','utils/combatEngine.ts','components/RunSimulationScreen.tsx'],related:['first-battle','advanced-strategy','first-team'],sections:[
    {title:'Three faction identities per loadout',paragraphs:['Your frame supplies a faction Chassis Special and faction Defend effect. Your pilot supplies its own faction passive. The abilities database links all three to the relevant cards.','Chassis Specials have individual cooldowns and may consume a turn or apply immediate support. A passive triggers on its own condition; you do not spend the Special to turn every passive on.']},
    {title:'Temporary states that change an attack',paragraphs:['Suppression reduces base accuracy from 95% to 80% while active. Marked targets take a 1.15 damage multiplier in the shared attack engine. Phased targets cannot be hit. A hacked attacker can target its own allies for that action.','Taunt and Guardian redirection can change who is attacked. Defensive and evasion buffs are tracked separately in battle state. Check the named ability’s duration; there is no universal duration shared by every buff.']},
    {title:'Targeting is not grid movement',paragraphs:['The implementation selects targets from eligible combatants and applies redirection and special rules. Flavor text about lines, nearby allies or formations does not imply a player-controlled movement grid.','Spark and some Specials can affect a second target. A secondary hit may derive from the primary attack’s damage or use its own special multiplier. Do not assume every splash repeats all the primary attack’s critical rolls.']},
    {title:'Treat descriptions and formulas separately',paragraphs:['Entity ability descriptions are the game’s developer-provided text. The combat guide separately explains formulas verified in the shared engine. If those conflict, the coverage report records the uncertainty rather than inventing a new rule.','Energy-based legacy ability definitions exist alongside faction Specials. An unreferenced ability object is not automatically a selectable player action; only attached pilot abilities appear as entity relationships.']},
  ]},
  {slug:'campaign-progression',title:'Campaigns, mission preparation and unlocks',summary:'Follow the five base campaigns and read mission pages without spoiling the story.',level:'PROGRESSION',sources:['constants.ts','utils/storyProgression.ts','components/StoryModeScreen.tsx','utils/storyAchievements.ts'],related:['start-here','first-battle','modes'],sections:[
    {title:'The base campaign route',paragraphs:['The base order is Mecha Hearts → The Aegis Initiative → The Zenith War → Crimson Vanguard → Kuro’s campaign. Finishing one advances access to the next base campaign. The campaign directory lists the exact game names and chapters.','Chapter IDs in the game are not necessarily the same as a player’s chapter position inside a campaign. Wiki mission pages use a clear one-based chapter position and stable page IDs.']},
    {title:'Read a mission page',paragraphs:['Every mission page shows its campaign, prerequisite chapter and floor count. The click-to-reveal section contains the actual chapter title, story overview, rewards and named boss placements when provided by the game.','Some enemies are generated from the mission theme and recommended difficulty, so a fixed exhaustive enemy roster would be misleading. Authored bosses are distinguished from generated encounters.']},
    {title:'Victory, retreat and preparation',paragraphs:['Clear the final floor to complete a chapter. A retreat or squad defeat ends the attempt; the result screen determines loot and losses. Check recovery before committing to another difficult run.','Check crew, gear and recommended rating first. Use the counter cycle and inspect a boss’s chassis only if you have chosen to reveal spoilers. Story guests are temporary deployment participants; their appearance is not proof you permanently own that card.']},
    {title:'Achievements and secrets',paragraphs:['Campaign completion has associated achievement definitions. The achievement directory lets you mark milestones locally; it does not unlock Steam achievements or read the game save.','Spoiler controls prevent hidden reward identities from appearing during ordinary browsing. Revealing a spoiler is a reading preference, not an in-game unlock.']},
  ]},
  {slug:'modes',title:'Game modes and multiplayer',summary:'Know the role of Patrols, Story, Pits, Sorties, ranked combat and social systems.',level:'REFERENCE',sources:['data/coopModes.ts','utils/rank.ts','utils/sortieAccess.ts','utils/sortieLogic.ts','components/MultiplayerScreen.tsx','components/FightingPitsSelectionScreen.tsx','services/allegianceCommunity.ts'],related:['campaign-progression','economy','first-team'],sections:[
    {title:'Patrol, Story and Fighting Pits',paragraphs:['Patrols are repeatable multi-floor missions with displayed rewards. Story missions progress through fixed campaign chapters with authored scenarios mixed with generated encounters. Fighting Pits are wave combat with Solo, Double and Triple formats.','The Pits introduce mini-boss waves and major boss waves. Actual enemy values scale with the encounter; enemy wiki pages show their base templates. Pits leaderboards and competitive standings need the multiplayer service.']},
    {title:'Sorties: timed assignments',paragraphs:['Sorties unlock at Player Level 10 after the tutorial. You assign available cards to timed missions; they are committed while deployed. The mission board shows duration, squad capacity, recommended rating, preferred chassis and rewards.','Completion calculation starts at 55%, adjusts for assigned squad power, preferred chassis, relevant pilot traits and faction bonuses, then clamps to 5–98%. A high displayed chance is therefore not a guarantee. Lucky and Scavenger influence rewards rather than directly adding completion chance.']},
    {title:'Competitive and social multiplayer',paragraphs:['Multiplayer includes ranked combat, leaderboards, allegiance features, comms, direct messages and mail. Access to connected features depends on account and service state. Wiki tools work offline after loading but do not replace live matchmaking.','Ranked divisions are Bronze, Silver, Gold, Platinum, Diamond, Master and Rogue. Tier reward definitions grant Nanites, Alloy and Data Fragments. Live standings, seasons and tournament availability are server-controlled, so the wiki does not announce an event just because its UI exists.']},
    {title:'Faction War: cooperative Titan raids',paragraphs:['In 2.2.0, every Vanguard or Unbound commander fights a separate squad battle against their allegiance’s shared Titan. Damage is pooled across the allegiance; players do not enter the same battle. Recent strikes and damage leaders show the contribution of other commanders.','The local Titan has up to 15,000 health and occupies two enemy bays. A strong squad can break its battle hull and survive. A wiped squad still reduces the shared 2,500,000-health pool. The weekly operation resets Monday at 00:00 UTC. Read the Titan raids guide for rewards, cooldowns and progression.']},
    {title:'Choose a mode for its job',paragraphs:['Use Story for campaign progression, Patrols for repeatable displayed rewards, Pits for wave challenges, and Sorties for timed assignments. Competitive modes and community systems add goals beyond the campaign.','Before a run, check how many bays the format allows and which cards are free from assignments. The six-bay team planner is for base Hangar planning; it does not grant eligibility for every multiplayer format.']},
  ]},
  {slug:'faq',title:'New player questions and common mistakes',summary:'Straight answers to the questions that cause expensive misunderstandings.',level:'BEGINNER REFERENCE',sources:['constants.ts','utils/scoutPool.ts','utils/gameLogic.ts','utils/squadEquipment.ts','dlc/steamCatalog.ts'],related:['start-here','packs','upgrades'],sections:[
    {title:'Does a faction banner only contain that faction?',paragraphs:['No. The base banners share the Scout pool and apply a favored selection branch. The pack page lists every eligible card, with a favored-faction indicator. SP/HSP cards are not ordinary Scout pool rewards.']},
    {title:'Can I put any pilot in any frame?',paragraphs:['Base-game slot validation does not impose a faction match. You need an actual pilot card, and a co-pilot can only be fitted to frames with two pilot slots. A signature bonus requires a defined canonical pairing, not merely matching faction labels.']},
    {title:'Why do my stats differ from the wiki?',paragraphs:['Wiki card stats are fresh template values. Levels, Workshop ranks, equipment modifiers, crew, signature pairs, class sets and temporary battle effects change what you see in combat. Enemy values also scale with their encounter.']},
    {title:'Are purchased packs required?',paragraphs:['The game has earned rewards, production and recovery routes alongside optional purchases. Cash-only premium cards have their own offers; an optional shop card should not be described as a Scout reward. Prices on the wiki are source catalog USD labels, and Steam checkout controls current regional prices.']},
    {title:'Does collection tracking change my game?',paragraphs:['No. Collection, achievement and journey tracking stays in this browser’s local storage. It neither reads your save nor grants an item. Clearing browser data can remove the checklist; the collection tool provides export and import.']},
    {title:'Where are future expansions?',paragraphs:['The production Steam DLC catalog in this audited snapshot is empty. Unreleased expansion details are excluded. The expansion hub is ready to list approved releases when their public data is available.']},
  ]},

{
  "slug": "titan-raids",
  "title": "Faction Titan raids: shared damage and repeatable rewards",
  "summary": "Fight your own battle, wear down a shared allegiance boss, and earn multiplayer equipment, a frame and a pilot.",
  "level": "2.2.0 / MULTIPLAYER",
  "sources": [
    "data/titanRaids.ts",
    "data/titanRaidRewards.ts",
    "utils/titanRaidCombat.ts",
    "nakama-server/titanRaids.ts",
    "utils/collectionEligibility.ts"
  ],
  "related": [
    "modes",
    "upgrades",
    "packs",
    "update-2-2-0"
  ],
  "sections": [
    {
      "title": "One allegiance target, separate battles",
      "paragraphs": [
        "Choose Vanguard or Unbound, then open Multiplayer → Faction War. Vanguard faces Oblivion Bastion; Unbound faces Riftmaw Colossus. Each side has its own 2,500,000-health weekly pool. Your allies contribute through their own battles; no synchronous party or shared battle is required.",
        "The screen displays shared health, recent strike damage, local engagement victories and the leading contributors. A preview of what is coming."
      ]
    },
    {
      "title": "Win the engagement or make every hit count",
      "paragraphs": [
        "Deploy up to six occupied friendly bays against a Titan occupying two enemy bays. Its local hull is the smaller of 15,000 health and the shared hull remaining when your attempt starts. This makes a local win possible without requiring one squad to deal millions of damage.",
        "Empty the battle hull to win and withdraw with surviving frames. A squad wipe still contributes its damage. The server recalculates the battle result and clamps contributions to the remaining shared health, so simultaneous finishing strikes cannot overdraw the pool.",
        "The boss starts with 450 Attack and 120 Defense. Its attack increases 35% every three rounds, with the normal 20-round battle limit. Chassis specials are selected automatically. Raids do not permanently destroy your inventory or change your PvP/ranked results."
      ]
    },
    {
      "title": "Cooldown, resume and weekly reset",
      "paragraphs": [
        "Deployment has a 60-second server-time cooldown. An unfinished attempt can be resumed for 15 minutes, using its saved squad and random seed. Return and submit the result to record the contribution; submitting the same attempt twice does not award damage or rewards twice.",
        "Each allegiance receives a fresh operation Monday at 00:00 UTC. Career damage milestones and cache Legendary pity persist across weeks. After the shared boss reaches zero, contributors with positive damage can claim a 500-Nanite clear cache."
      ]
    },
    {
      "title": "Three career salvage milestones",
      "paragraphs": [
        "At 1,000 cumulative accepted damage, earn Breachline Driver, a Legendary ranged weapon. At 10,000, earn Last Line Carapace, Legendary armor. At 30,000, earn Resonance Anchor, a Legendary core. Each milestone is awarded once through Comms Mail."
      ]
    },
    {
      "title": "A repeatable cache for contributing strikes",
      "paragraphs": [
        "A strike with at least 100 accepted damage earns one cache in Comms Mail. Rates are Common 54%, Rare 28%, Epic 15%, Legendary 3%; a Legendary is guaranteed within 20 qualifying caches. The item is selected uniformly within its rarity. Duplicate rewards can strengthen matching items through normal Workshop upgrades."
      ],
      "bullets": [
        "Common: Field Patch Plating (armor), Signal Spool (core).",
        "Rare: Anchorstep Jets (thrusters), Breach Hound (Guardian War Machine).",
        "Epic: Colossus Breaker (melee weapon), Mira Flint (pilot).",
        "Legendary: Nullwake Screen (shield), Siegeheart Dynamo (core)."
      ]
    },
    {
      "title": "Upgrade the units through HSP",
      "paragraphs": [
        "Breach Hound and Mira Flint use the existing duplicate upgrade, recovery and mastery evolution systems. Both progress Base → P → SP → HSP, with distinct artwork at every unit tier. Acquiring their Base cards is the raid route; their higher tiers use normal Workshop progression.",
        "All raid rewards can be equipped in any mode. Multiplayer catalogue entries are optional for collection completion and do not change existing collection reward requirements. The wiki checklist is personal browser tracking and does not grant game rewards."
      ]
    },
    {
      "title": "Snapshot availability",
      "paragraphs": [
        "These rules and rewards describe the prepared 2.2.0 Steam build. The multiplayer backend is enabled, but access requires the matching game update. Steam publication may follow the wiki update; the wiki does not connect to or display live raid totals."
      ]
    }
  ]
},
{
  "slug": "update-2-2-0",
  "title": "What changes in 2.2.0",
  "summary": "Faction raids, repeatable multiplayer rewards and the expanded Scout bonus list.",
  "level": "UPDATE / 2.2.0",
  "sources": [
    "data/changelog.ts",
    "utils/scoutPool.ts",
    "data/titanRaids.ts",
    "data/titanRaidRewards.ts"
  ],
  "related": [
    "titan-raids",
    "packs",
    "modes",
    "upgrades"
  ],
  "sections": [
    {
      "title": "Prepared for Steam",
      "paragraphs": [
        "This wiki snapshot covers the 2.2.0 Windows base-game build. The package has passed its DLC exclusion audit. A prepared package does not independently confirm that Steam has published the update."
      ]
    },
    {
      "title": "Faction War becomes a cooperative raid",
      "paragraphs": [
        "Fight an allegiance-specific Titan in your own battle while every accepted strike reduces the side’s shared weekly health. A strong squad can win the local engagement; wiped squads still contribute. The operation screen includes recent strike damage and damage leaders."
      ]
    },
    {
      "title": "Eleven multiplayer reward families",
      "paragraphs": [
        "Three permanent career damage milestones join eight repeatable cache rewards spanning Common through Legendary. Breach Hound and Mira Flint support upgrades, recovery and HSP evolution. All multiplayer rewards remain optional for collection completion. See the Titan raids guide for the complete pool and rates."
      ]
    },
    {
      "title": "The 1% banner bonus list",
      "paragraphs": [
        "The four starter frames and five previously patrol-only prototypes are now eligible for a conditional 1% bonus list on every banner. The five prototypes are Corrupted Leviathan [P], Scrap Cannon [P], Welded Plates [P], Standard Reactor [P] and Rusty Thrusters [P].",
        "Common/Rare pulls can select the starter frames or gear; Legendary can select Corrupted Leviathan. Epic has no bonus entries. Unowned bonus items are preferred and owned unique frames are never repeated. Drop Rates shows these entries with an amber 1% tag, banner counters include them, and Red Book acquisition sources distinguish their P cards from SP recovery variants."
      ]
    },
    {
      "title": "Earlier fixes included in this build",
      "paragraphs": [
        "Pits boss waves occur every 25 waves, so The Juggernaut Prime and Apex Predator dossiers can drop starting at wave 25. Apex Pilots cannot be lost in the Pits. Units revived by Second Wind or Fierce Loyalty no longer create duplicate Recovery entries, and units still standing at the end are kept out of Recovery.",
        "V-X Excalivault [HSP] and the Vaultkeeper [HSP] pilot receive the strongest frame and pilot statistics, including automatic updates to owned copies. Pilot item level now uses the family’s original rarity, so a highly upgraded Common-family SP pilot does not outrate Legendary pilots merely because of the displayed SP rarity.",
        "Renamed female Apex Pilots and their HSP evolutions count correctly in Scout collection displays. Shop, Founders Pack and Twitch Drop pilots use the normal P/SP recovery progression. Scout banners, Drop Rates and relevant menus are translated across all nine supported languages."
      ]
    },
    {
      "title": "Recruit rewards",
      "paragraphs": [
        "Referral milestones are unchanged. Five qualified recruits earn the second Warbear colour; two recruits do not. Existing and returning players can participate when the game’s qualification requirements are satisfied."
      ]
    }
  ]
}
];
export const journey = [
  {slug:'start-here',label:'Start here',hint:'Learn the loop'}, {slug:'first-battle',label:'First battle',hint:'Read the battlefield'},
  {slug:'first-team',label:'First team',hint:'Assemble your squad'}, {slug:'upgrades',label:'Upgrades',hint:'Grow your collection'},
  {slug:'packs',label:'Packs',hint:'Understand rewards'}, {slug:'advanced-strategy',label:'Advanced strategy',hint:'Plan with confidence'},
];
export const glossary = [
  ['War Machine','A combat frame. Its chassis provides base stats, a faction Special and a faction Defend effect.'],['Pilot','Crew assigned to a frame. Contributes stats and the pilot faction’s passive.'],['Chassis','Assault, Skirmisher, Siege or Guardian; these form the damage-advantage cycle.'],['Nanites','Currency for Scout, recovery and various shop/Workshop options.'],['Alloy','Manufacturing resource, especially for frames and equipment.'],['Data Fragments','Resource used in pilot production, early resource upgrades and gear recalibration.'],['Combat rating','A summary of equipment and crew progression. It is not a direct damage stat or guaranteed matchup result.'],['Base / P / SP / HSP','Card progression tiers. P is Prototype, SP is Secret Prototype and HSP is Hidden Secret Prototype. These differ from rarity and Workshop rank.'],['Rarity','Common, Rare, Epic or Legendary. Scout uses rarity rates before selecting an eligible card.'],['Signature pair','A specifically defined pilot/frame pairing that gives +8% HP, Attack and Defense.'],['Tier set','A bonus for two or four matching-class Legendary/HSP gear pieces.'],['Dossier','An enemy defeat drop that unlocks the base frame’s Workshop blueprint.'],['Pity','Scout’s increasing high-rarity probability after a low-rarity streak. Epic/Legendary resets it.'],['Recovery','Workshop process for lost cards. Success and upgrade chances are separate checks.'],['Blueprint','Permission to mass-produce a family after its unlock condition is met.'],['Sortie','A timed assignment for available cards, unlocked at Player Level 10 after the tutorial.'],['Chassis Special','Faction active ability with its own cooldown and turn-consumption rule.'],['Defend','Hold an attack and brace using your frame faction’s defensive effect.'],['Phased','A temporary state preventing incoming attacks from hitting.'],['Suppression','A temporary 15-percentage-point accuracy penalty.'],['Ranged / Melee bonus','Pilot weapon specialization applying when that weapon combat type is used.'],['Rank','Context-dependent: Workshop star/gear rank or multiplayer competitive division. Check which screen you are reading.'],
];
