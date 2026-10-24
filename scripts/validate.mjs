import fs from 'node:fs/promises';
import path from 'node:path';
import { digest, validateDatabase } from './lib.mjs';
export async function validate(root = process.cwd()) {
  const db = JSON.parse(await fs.readFile(path.join(root, 'src/data/database.json'), 'utf8'));
  const approved = JSON.parse(await fs.readFile(path.join(root, 'data/approved.json'), 'utf8'));
  const summary = validateDatabase(db);
  if (digest(db) !== approved.databaseHash) throw new Error('Unreviewed database changes. Run extraction and review promotion first.');
  const publicFiles = (await fs.readdir(path.join(root, 'public'), { recursive: true, withFileTypes: true })).filter(e => e.isFile());
  for (const f of publicFiles) {
    const relative = path.relative(path.join(root, 'public'), path.join(f.parentPath, f.name)).replaceAll('\\', '/');
    if (!Object.hasOwn(approved.assetHashes, relative)) throw new Error(`Unapproved public file: ${relative}`);
    const content = await fs.readFile(path.join(root, 'public', relative));
    if (digest(content.toString('base64')) !== approved.assetHashes[relative]) throw new Error(`Unreviewed asset change: ${relative}`);
  }
  for (const e of db.entries) for (const relative of [e.image, e.background].filter(Boolean)) await fs.access(path.join(root, 'public', relative));
  if (publicFiles.length !== Object.keys(approved.assetHashes).length) throw new Error('Missing approved asset');
  console.log(`Validated ${summary.entries} entries, reciprocal pack links and ${publicFiles.length} approved images.`);
  return summary;
}
if (process.argv[1]?.endsWith('validate.mjs')) await validate();
