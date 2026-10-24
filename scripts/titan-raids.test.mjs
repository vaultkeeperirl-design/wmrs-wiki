import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const db = JSON.parse(fs.readFileSync(new URL('../src/data/database.json', import.meta.url)));
const find = name => db.entries.find(e => e.name === name);
test('raid catalogue keeps all reward tiers optional and separate from Scout', () => {
  const cards = db.entries.filter(e => e.multiplayerOnly);
  assert.equal(cards.length, 35);
  assert.equal(new Set(cards.map(e => e.family)).size, 11);
  for (const card of cards) { assert.ok(card.image); assert.match(card.note, /excluded from collection rewards/); }
  for (const name of ['Breach Hound', 'Mira Flint']) for (const tier of ['', ' [P]', ' [SP]', ' [HSP]']) {
    const card = find(name + tier);
    assert.ok(card.multiplayerOnly);
    assert.ok(card.image.endsWith((tier ? '-' + tier.slice(2, -1).toLowerCase() : '') + '-fg.webp'));
  }
  for (const banner of db.entries.filter(e => e.type === 'Scout banner')) {
    assert.ok(!banner.rewardIds.some(id => cards.some(e => e.id === id)));
    assert.match(banner.probabilityNote, /conditional 1% bonus/);
    assert.ok(banner.rewardIds.includes(find('Corrupted Leviathan [P]').id));
    assert.ok(!banner.rewardIds.includes(find('Corrupted Leviathan [SP]').id));
  }
});
test('raid cache odds, milestone rewards and combat references match the release', () => {
  assert.deepEqual(db.rules.titanRaids, { sharedHealth: 2500000, battleHealth: 15000, cooldownMs: 60000, cacheMinDamage: 100, legendaryPity: 20, rewardFamilies: 11 });
  const cache = find('Titan Raid Cache');
  assert.equal(cache.rewardIds.length, 8);
  assert.deepEqual(cache.rarityRates, { Common: .54, Rare: .28, Epic: .15, Legendary: .03 });
  for (const name of ['Oblivion Bastion', 'Riftmaw Colossus']) {
    const boss = find(name);
    assert.equal(boss.category, 'bosses'); assert.ok(boss.combatOnly && boss.image);
    assert.equal(boss.stats.HP, 15000); assert.equal(boss.stats.Attack, 450); assert.equal(boss.stats['Deployment bays'], 2);
  }
  assert.equal(db.entries.filter(e => e.type === 'Multiplayer damage milestone').length, 3);
});
