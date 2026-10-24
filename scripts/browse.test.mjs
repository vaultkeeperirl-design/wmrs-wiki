import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
const compiled=await build({entryPoints:[fileURLToPath(new URL('../src/lib/browse.ts',import.meta.url))],bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'});
const browse=await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
const db=JSON.parse(await fs.readFile(new URL('../src/data/database.json',import.meta.url),'utf8'));
const lookup=new Map(db.entries.map(entry=>[entry.id,entry]));
const cards=db.entries.filter(entry=>['warmachines','pilots','items'].includes(entry.category));

test('tier sorting chooses the actual highest tier as a grouped card representative',()=>{
  const variants=cards.filter(entry=>entry.category==='warmachines'&&entry.family==='Aegis Custom');
  const [high]=browse.sortedBrowseGroups(variants,'tier-high',true);
  const [low]=browse.sortedBrowseGroups(variants,'tier-low',true);
  assert.equal(high[0].tier,'HSP');assert.equal(low[0].tier,'Base');
  assert.equal(high.length,variants.length);assert.equal(low.length,variants.length);
});
test('stat sorting groups by each card’s highest matching value rather than reverting to Base',()=>{
  for(const sort of ['hp','attack','defense','shield','evasion','energy','ranged-bonus','melee-bonus']){
    const option=browse.statSorts.find(option=>option.value===sort);
    const groups=browse.sortedBrowseGroups(cards,sort,true);
    let previous=Infinity;
    for(const group of groups){
      const expected=Math.max(...group.map(entry=>entry.stats?.[option.stat]??-Infinity));
      const shown=group[0].stats?.[option.stat]??-Infinity;
      assert.equal(shown,expected,`${sort}: ${group[0].name} must represent its group’s maximum`);
      assert.ok(shown<=previous,`${sort}: grouped results must remain in displayed statistic order`);
      previous=shown;
    }
  }
});
test('normal tier sorting does not expose hidden rewards and the HSP filter stays separate from rarity',()=>{
  const normal=cards.filter(entry=>browse.matchesTierVisibility(entry,'',false));
  const groups=browse.sortedBrowseGroups(normal,'tier-high',true);
  assert.ok(groups.flat().every(entry=>!entry.spoiler));
  assert.ok(groups.flat().every(entry=>entry.tier!=='HSP'));
  const hidden=cards.filter(entry=>browse.matchesTierVisibility(entry,'HSP',false));
  assert.equal(hidden.length,0);
  const revealed=cards.filter(entry=>browse.matchesTierVisibility(entry,'HSP',true));
  assert.ok(revealed.length>0);assert.ok(revealed.every(entry=>entry.tier==='HSP'));
  const prototypes=cards.filter(entry=>browse.matchesTierVisibility(entry,'P',false));
  assert.ok(new Set(prototypes.map(entry=>entry.rarity)).size>1,'P is a card tier, not a single rarity');
});
test('a strict tier filter cannot append other variants to a grouped result',()=>{
  const filtered=cards.filter(entry=>browse.matchesTierVisibility(entry,'SP',true));
  const groups=browse.sortedBrowseGroups(filtered,'hp',true);
  assert.ok(groups.length>0);assert.ok(groups.every(group=>group.every(entry=>entry.tier==='SP')));
});
test('missing stats sort after real negative equipment bonuses',()=>{
  const items=[{id:'missing',category:'items',name:'No stat'},{id:'negative',category:'items',name:'Tradeoff',stats:{Defense:-5}},{id:'zero',category:'items',name:'Zero',stats:{Defense:0}}];
  assert.deepEqual(browse.sortedBrowseGroups(items,'defense',false).map(group=>group[0].id),['zero','negative','missing']);
});
test('campaign directory follows the implemented base progression route',()=>{
  const campaigns=db.entries.filter(entry=>entry.category==='campaigns');
  const sorted=browse.sortedBrowseGroups(campaigns,'campaign-order',false,lookup).map(group=>group[0]);
  assert.deepEqual(sorted.map(entry=>entry.name),['Mecha Hearts','The Aegis Initiative','The Zenith War','The Crimson Vanguard','No Masters']);
});
test('mission directory sorts numeric chapters within campaign order',()=>{
  const missions=db.entries.filter(entry=>entry.category==='missions');
  const sorted=browse.sortedBrowseGroups(missions,'campaign-order',false,lookup).map(group=>group[0]);
  const campaigns=browse.sortedBrowseGroups(db.entries.filter(entry=>entry.category==='campaigns'),'campaign-order',false,lookup).map(group=>group[0]);
  let index=0;
  for(const campaign of campaigns){
    const expected=[...campaign.missionIds].map(id=>lookup.get(id)).sort((a,b)=>a.chapterNumber-b.chapterNumber);
    assert.deepEqual(sorted.slice(index,index+expected.length).map(entry=>entry.id),expected.map(entry=>entry.id));
    index+=expected.length;
  }
  assert.equal(index,missions.length);
});
