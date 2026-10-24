# Game implementation audit

Audited 24 October 2026 (Australia/Sydney), against the local 2.1.7 source and its versioned base-only package audit. The release package was prepared for manual Steam upload; public rollout is not independently confirmed by this audit.

## Sources and interpretation

| Area | Source of truth | Wiki treatment |
| --- | --- | --- |
| Cards and rarity | `types.ts`, `constants.ts`, `data/factions/*`, `utils/itemFactory.ts` | Fresh templates, authored variants first, game helpers for missing recovery/evolution previews |
| Shop offers | `data/premiumPilots.ts`, `data/premiumWarmachines.ts`, `data/foundersPack.ts`, `data/cosmetics.ts`, `components/ShopScreen.tsx` | Exact guaranteed cards, currency amounts and USD catalog labels; regional checkout remains authoritative |
| Scout | `utils/scoutPool.ts`, `utils/scoutPity.ts`, `constants.ts` | Shared eligible pool, faction preference, ownership caps, rarity rates and pity; no invented per-card odds |
| Combat | `utils/combatEngine.ts`, `utils/combatRules.ts`, `utils/accuracy.ts`, `utils/evasion.ts` | Defense curve, ±15% variance, 5% crit/1.5× damage, separate accuracy/evasion, shield-first damage |
| Faction effects | `utils/factionAbilities.ts` | Frame Special, frame Defend and pilot passive linked independently |
| Loadouts | `utils/squadEquipment.ts`, `utils/gameLogic.ts`, `utils/typeHelpers.ts` | Slot validation, two weapon slots, dual crew, 45% co-pilot stats, signature pair/set bonuses |
| Progression | `utils/upgradeRank.ts`, `utils/evolution.ts`, `utils/pilotEvolution.ts`, `components/WorkshopScreen.tsx` | Rank costs, resource alternatives, recovery, production and mastery explained separately |
| Campaigns | `data/story/*`, `constants.ts`, `utils/storyProgression.ts` | Five directories and every chapter, floor counts and prerequisites; story/boss/reward sections require a reveal click |
| Enemy reference | `services/geminiService.ts`, `utils/enemyDossiers.ts` | Deterministic game templates and dossier probabilities; no generative API calls, no invented fixed encounter values |
| Sorties | `data/sorties.ts`, `utils/sortieAccess.ts`, `utils/sortieLogic.ts` | Level-10 access, timed assignment rules, documented completion factors and exclusive catalog cards |
| Multiplayer | `components/MultiplayerScreen.tsx`, `data/coopModes.ts`, `utils/rank.ts` | Modes, rank ladder, reserves, community features; live availability is qualified |
| Achievements | `services/achievements.ts`, `utils/storyAchievements.ts` | Game-defined conditions and local checklist; Steam configuration is not inferred |
| Referral/Twitch | `data/referrals.ts`, `data/twitchDrops.ts`, release notes | Explicit unit sources; no private referral codes, accounts or event schedule assumptions |
| DLC | `dlc/registry.ts`, `dlc/bootstrap.ts`, `dlc/steamCatalog.ts`, release audit | Production catalog empty; all developer packs/art excluded. Hub prepared for approved releases |
| Artwork | `utils/assetPaths.ts`, individual files under `public/assets` | Existing official foreground/background candidates resolved by filesystem existence; no wholesale public-directory copy |

## Safety boundary

The site exports normalized fields only. It includes no server configuration, environment files, API keys, player saves, telemetry, payment implementation, Steam SDK, development DLC or private Git history. Extraction executes deterministic local source data without initializing the game, Steam, multiplayer or purchase APIs.

The owner approved click-to-reveal controls for released spoilers during this task. Hidden rewards, story-only entities and boss identities are therefore included behind those controls. Search and galleries hide them initially; protected entry metadata is generic and marked noindex. Unreleased content is excluded regardless of spoiler settings.

## Coverage and unresolved details

`reports/coverage.json` contains generated counts, missing foreground artwork and investigations. A card tier or boss reference is not automatically a recruitable unit. Premium frame Base/P previews and combat-only entries explicitly distinguish reference templates from verified acquisition routes.

The “Rare Find” achievement text claims an SP Scout pull, while the actual Scout pool excludes SP cards. That definition is withheld from normal player guidance pending correction. No drop rate or reward pathway was invented to reconcile it.

A resolved official foreground does not guarantee the art is unique to that tier: the game itself can fall back to family artwork. Missing foregrounds use an identified faction background and a visible note. Exact missing IDs remain in the coverage report.

## Verification

Run `npm run check`, `npm test`, and `npm run build`. The build validates approved hashes and reciprocal pack edges, generates individual static pages and checks every internal reference. `reports/build-audit.json` records page/link/image totals. Browser QA should cover desktop/mobile navigation, journey persistence, search facets, card/pack comparisons, spoiler controls, collection export/import and team rules. Deployment is a separate external action requiring the owner's approval.
