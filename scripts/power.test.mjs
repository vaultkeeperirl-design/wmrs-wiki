import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
const compiled=await build({entryPoints:[fileURLToPath(new URL('../src/lib/power.ts',import.meta.url))],bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'});
const power=await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
const db=JSON.parse(await fs.readFile(new URL('../src/data/database.json',import.meta.url),'utf8'));
const ranks=power.rankPower(db.entries);
const named=(category,name)=>db.entries.find(e=>e.category===category&&e.name===name);

test('every frame, pilot and equipment card gets exactly one power rank',()=>{
  const cards=db.entries.filter(e=>['warmachines','pilots','items'].includes(e.category));
  assert.equal(ranks.size,cards.length);
  for(const card of cards)assert.ok(power.powerRanks.includes(ranks.get(card.id).rank),card.name);
});
test('combat score follows the defense curve and the 60% evasion cap',()=>{
  assert.equal(power.combatScore({HP:100,Attack:10}),316);
  assert.ok(power.combatScore({HP:100,Attack:10,Defense:50})>power.combatScore({HP:100,Attack:10}));
  assert.equal(power.combatScore({HP:100,Attack:10,Evasion:90}),power.combatScore({HP:100,Attack:10,Evasion:60}));
});
test('defensive pilots with no attack are still ranked by what they add to a frame',()=>{
  const tank=named('pilots','Aegis Guardian [SP]');
  assert.equal(tank.stats.Attack,0);
  assert.ok(ranks.get(tank.id).score>0);
});
test('a card ranks at or above its own lower tiers',()=>{
  const family=db.entries.filter(e=>e.category==='warmachines'&&e.family==='Aegis Custom'&&e.tier!=='HSP');
  const order={Base:0,P:1,SP:2};
  const byTier=family.sort((a,b)=>order[a.tier]-order[b.tier]).map(e=>ranks.get(e.id).score);
  assert.deepEqual(byTier,[...byTier].sort((a,b)=>a-b));
});
test('equal scores share a position and rank',()=>{
  const result=power.rankScores([{id:'a',score:5},{id:'b',score:5},{id:'c',score:1}]);
  assert.equal(result.get('a').position,1);assert.equal(result.get('b').position,1);
  assert.equal(result.get('a').rank,result.get('b').rank);
});
