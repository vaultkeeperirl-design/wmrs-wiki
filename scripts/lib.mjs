import { createHash } from 'node:crypto';
export const digest = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
export const slug = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const categoryOf = item => 'baseHp' in item ? 'warmachines' : 'type' in item ? 'items' : 'pilots';
export const familyOf = name => name.replace(/ \[(P|SP|HSP)\]$/, '');
export function diffData(before, after) {
  const previous = new Map((before?.entries ?? []).map(e => [e.id, e]));
  const next = new Map(after.entries.map(e => [e.id, e]));
  return {
    added: [...next.keys()].filter(id => !previous.has(id)),
    removed: [...previous.keys()].filter(id => !next.has(id)),
    changed: [...next.keys()].filter(id => previous.has(id) && digest(previous.get(id)) !== digest(next.get(id))).map(id => ({ id, fields: Object.keys(next.get(id)).filter(k => digest(previous.get(id)[k] ?? null) !== digest(next.get(id)[k] ?? null)) })),
  };
}
export function assertSafePath(path) {
  if (!/^(assets|media)\/[a-zA-Z0-9_./-]+\.(webp|png|jpg|gif|svg|woff2)$/.test(path) || path.includes('..') || /dlc|demo/i.test(path)) throw new Error(`Unsafe public asset: ${path}`);
  return path;
}
export function validateDatabase(db) {
  if (db.schemaVersion !== 1 || !db.entries?.length) throw new Error('Missing or unsupported database');
  const ids = new Set();
  const routes = new Set();
  for (const e of db.entries) {
    if (!/^[a-z0-9-]+$/.test(e.id) || ids.has(e.id)) throw new Error(`Invalid/duplicate ID: ${e.id}`);
    if (!e.name || !e.category || !e.description || !e.sources?.length || !e.evidence?.length) throw new Error(`Incomplete entry: ${e.id}`);
    ids.add(e.id);
    const route = `${e.category}/${e.id}`;
    if (routes.has(route)) throw new Error(`Duplicate route ${route}`);
    routes.add(route);
    for (const n of Object.values(e.stats ?? {})) if (typeof n !== 'number' || !Number.isFinite(n)) throw new Error(`Invalid stat: ${e.id}`);
    for (const path of [e.image, e.background].filter(Boolean)) assertSafePath(path);
    if (/green.sun|green-sun-demo|production\.env|STEAM_WEB_API_KEY/i.test(JSON.stringify(e))) throw new Error(`Restricted content: ${e.id}`);
  }
  const byId = new Map(db.entries.map(e => [e.id, e]));
  for (const e of db.entries) {
    for (const id of [...(e.packIds ?? []), ...(e.rewardIds ?? []), ...(e.abilityIds ?? []), ...(e.relatedIds ?? []), ...(e.missionIds ?? [])]) if (!ids.has(id)) throw new Error(`Broken relation ${e.id} -> ${id}`);
    if (e.category === 'packs') for (const id of e.rewardIds) if (!byId.get(id).packIds?.includes(e.id)) throw new Error(`One-way pack relation: ${id}`);
    for (const id of e.packIds ?? []) if (!byId.get(id).rewardIds.includes(e.id)) throw new Error(`One-way reward relation: ${id}`);
  }
  return { entries: ids.size, categories: Object.fromEntries([...new Set(db.entries.map(e => e.category))].map(c => [c, db.entries.filter(e => e.category === c).length])) };
}
