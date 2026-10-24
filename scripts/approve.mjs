import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { digest, assertSafePath, validateDatabase } from './lib.mjs';
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const game = path.resolve(process.env.WMRS_GAME_ROOT ?? path.join(root, '..'));
const read = async p => JSON.parse(await fs.readFile(path.join(root, p), 'utf8'));
const db = await read('.review/candidate.json');
const report = await read('.review/report.json');
const hash = process.argv[process.argv.indexOf('--reviewed-hash') + 1];
if (!process.argv.includes('--reviewed-hash') || hash !== digest(db) || hash !== report.candidateHash) throw new Error('Review .review/report.json, then pass the exact candidate hash with --reviewed-hash. This promotes data locally only.');
validateDatabase(db);
const manifest = await read('.review/assets.json');
const assetHashes = {};
for (const relative of manifest) {
  assertSafePath(relative);
  const content = await fs.readFile(path.join(game, 'public', relative));
  const destination = path.join(root, 'public', relative);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, content);
  assetHashes[relative] = digest(content.toString('base64'));
}
// Asset copying is allowlisted. Build validation rejects any stale/unapproved files.
// Hand-authored tutorial art is independent of the generated game-data snapshot.
let editorial = {assets: []};
try { editorial = await read('data/editorial-assets.json'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
for (const item of editorial.assets) {
  assertSafePath(item.destination);
  if (!/^assets\/wiki-(ui|guides)\//.test(item.destination)) throw new Error('Editorial asset namespace is not approved.');
  const content = await fs.readFile(path.join(root, 'public', item.destination));
  const actual = digest(content.toString('base64'));
  if (actual !== item.approvedHash) throw new Error(`Editorial asset changed without review: ${item.destination}`);
  assetHashes[item.destination] = actual;
}
let preservedLore = {};
try {
  const previousApproval = await read('data/approved.json');
  if (previousApproval.loreHash) {
    const lore = await read('src/data/lore.json');
    if (digest(lore) !== previousApproval.loreHash) throw new Error('Lore changed without review; review and approve its hash first.');
    preservedLore = {loreHash: previousApproval.loreHash};
  }
} catch (error) { if (error.code !== 'ENOENT') throw error; }
await fs.mkdir(path.join(root, 'src/data'), { recursive: true });
await fs.mkdir(path.join(root, 'data'), { recursive: true });
await fs.mkdir(path.join(root, 'reports'), { recursive: true });
await fs.writeFile(path.join(root, 'src/data/database.json'), JSON.stringify(db, null, 2) + '\n');
await fs.copyFile(path.join(root, '.review/identity.json'), path.join(root, 'data/identity.json'));
await fs.copyFile(path.join(root, '.review/planner-fixtures.json'), path.join(root, 'data/planner-fixtures.json'));
await fs.writeFile(path.join(root, 'data/approved.json'), JSON.stringify({ schemaVersion: 1, gameVersion: db.gameVersion, databaseHash: hash, ...preservedLore, assetHashes }, null, 2) + '\n');
const coverage = {
  ...report.coverage, gameVersion: db.gameVersion,
  withheldCount: report.withheld.length, missingArt: report.missingArt,
  changes: report.changes,
  investigations: [
    'Released story details and hidden rewards are approved behind click-to-reveal controls; unreleased DLC remains excluded.',
    'Game achievement text for Rare Find claims an SP Scout pull, but Scout excludes SP cards. Withheld pending correction.',
    'Steam DLC catalog is empty; expansion details are excluded.',
    'Live regional prices, active Twitch Drop campaigns, server event schedules and Steam achievement configuration are not inferred from source.',
    'The versioned package is prepared for Steam upload. Public Steam rollout has not been independently confirmed.',
  ],
};
await fs.writeFile(path.join(root, 'reports/coverage.json'), JSON.stringify(coverage, null, 2) + '\n');
console.log(`Promoted ${db.entries.length} entries and ${manifest.length} official assets locally. No publication performed.`);
