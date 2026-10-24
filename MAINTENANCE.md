# Maintaining the WMRS Wiki

## Extract a proposed update

The extractor runs locally beside the game checkout. In a standalone wiki clone, point `WMRS_GAME_ROOT` at the game directory. It imports only the explicit modules in `scripts/game-adapter.ts`; it does not crawl environment files, backends, SDKs, player saves or release archives. No imported module's source code is written to the public site.

```powershell
$env:WMRS_GAME_ROOT = 'Z:\Github Projects\Warmachine-Rouge-Scout'
npm run extract
```

The game version must have a `release/<version>/PACKAGE-AUDIT.json` proving a base-game-only package with no developer DLC or private files. This is packaging evidence, not independent confirmation that a Steam rollout has completed. Confirm the public release boundary with the owner before promoting new content.

Extraction writes only `.review/`:

- `candidate.json`: proposed normalized database.
- `report.json`: added/removed/changed IDs and changed fields, coverage, exclusions and missing artwork.
- `assets.json`: exact artwork allowlist.
- `identity.json`: proposed stable identity mappings.
- `planner-fixtures.json`: expected loadout results computed by the game's own stat calculator.

The current deployed database and manually authored guides remain untouched.

## Review and promote locally

Review every new/removed entity, balance field, pack relationship, source and image. Verify the version is public. For new DLC, add a specific approved production adapter and provenance policy; do not register developer packs or weaken the base-game guard. Review spoiler classifications so names cannot appear during ordinary browsing.

After reviewing the candidate, copy its `candidateHash` from the report and run:

```powershell
node scripts/approve.mjs --reviewed-hash THE_EXACT_REVIEWED_CANDIDATE_HASH
npm run check
npm test
npm run build
```

Hash promotion is a local review acknowledgment; it is not permission to publish. Approval writes the snapshot, identities, oracle fixtures, coverage report and individually allowlisted assets. Unexpected or changed public files fail validation. Remove a stale asset only after confirming it is no longer in the candidate allowlist, then re-run validation. Do not recursively delete the game asset tree.

Review `reports/build-audit.json`, verify responsive browser behavior and stage the standalone checkout. Deploy only after the owner's publication approval or within an established approval process for that repository.

## Stable links and renames

Game templates frequently assign random UUIDs at import. Those UUIDs are deliberately not exported. `data/identity.json` maps category and source name to a persistent ID. Once assigned, keep the ID unchanged. When a name changes, add the new `category:new name` alias with the existing ID before extraction and retire the old active name. This preserves the route while the change report identifies the changed fields. A rename without an alias appears as added/removed and must be reviewed; it is never silently treated as the same card.

Do not use the wiki ID as an in-game inventory ID. Template identities and owned physical copies are different concepts.

## Guides, evidence and tools

### Original interface art and tutorial captures

`data/editorial-assets.json` preserves reviewed icon and screenshot recipes, their exact source/crop dimensions and hashes. Assets under `assets/wiki-ui/` are resized original game artwork; assets under `assets/wiki-guides/` are exact-pixel crops from reviewed clean game captures. No game control, text or artwork is repainted. Screenshot values are examples and can differ from a player's current run.

When an original image is available beside the game checkout, `python scripts/prepare-visual-assets.py --game-root PATH` can reproduce the tracked recipes (requires Pillow for authoring). New recipes are reviewed in `.review/*-assets.json` before this helper is run. Production does not require Python or the private game checkout. Ordinary data promotion verifies and preserves these editorial assets instead of discarding them.

Edit `src/content/guides.ts` manually when a mechanic changes; extraction does not overwrite it. Every guide records its source modules. Keep developer descriptions distinct from engine-verified behavior and inferred strategies. Never introduce an optimal farming claim without evidence. The tier list (`src/lib/power.ts`) is derived only from extracted stats, the combat engine's defense/evasion rules and the game's iLvl rating (`rating`, exported by the extractor); keep its method note on `tier-list.astro` in step with any formula change.

The planner models fresh level-1/rank-0 loadouts, primary and eligible secondary crew, signature pairs and class gear sets. The extraction pipeline calculates oracle fixtures with the game implementation; tests compare the browser model against those expected values. Expand those fixtures when the model adds support for new rules.

Browser storage key: `wmrs-wiki-v1`. Checklist import merges recognized IDs and rejects invalid input. It does not import a game save or connect to multiplayer. Changes to this schema require a migration and persistence tests.

## External state

Regional prices, live matchmaking, mail, seasons, tournament schedules, Steam achievements and active Twitch campaigns are not determined by a static catalog. Link to the game/Steam and mark availability as variable. Never call live payment or multiplayer APIs from the wiki.
