import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {digest} from './lib.mjs';

const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const review=path.join(root,'.review');
const game=path.resolve(process.env.WMRS_GAME_ROOT??path.join(root,'..'));
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const pkg=await read(path.join(game,'package.json'));
const audit=await read(path.join(game,'release',pkg.version,'PACKAGE-AUDIT.json'));
if(!audit.baseGameOnly||audit.developerDlcIncluded||audit.privateFilesIncluded)throw new Error('Require the audited base-game release boundary before extracting lore.');
const knownCampaigns=['mecha-hearts','aegis-initiative','zenith-war','crimson-vanguard','kuro-campaign'];
const gamePath=game.replaceAll('\\','/');
// Explicit public-content entrypoint; no server, environment, account or developer-DLC loaders.
const adapter=`import {STORY_CAMPAIGNS} from '${gamePath}/constants.ts';\nimport {FACTION_LORE} from '${gamePath}/data/lore.ts';\nimport {getChapterComms} from '${gamePath}/data/story/comms/index.ts';\nexport {STORY_CAMPAIGNS,FACTION_LORE,getChapterComms};`;
const bundle=await build({stdin:{contents:adapter,loader:'ts',resolveDir:game},bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent',define:{'import.meta.env':'{}'}});
const source=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const factionSlugs={'Liberté':'liberte','Republic of Horizon':'republic-of-horizon','Kingdom of Aurora':'kingdom-of-aurora','Red Wolves':'red-wolves','The Zenith Concord':'zenith-concord','The Rustfang Clans':'rustfang-clans','Cygnus Corporation':'cygnus-corporation','Aegis Alliance':'aegis-alliance','No Faction':'no-faction'};
const normalizeBeats=beats=>(beats??[]).map(beat=>({afterFloor:beat.afterFloor,lines:beat.lines.map(line=>({speaker:line.speaker,text:line.text}))}));
const factions=Object.entries(source.FACTION_LORE).map(([faction,lore])=>{
  const id=factionSlugs[faction];if(!id)throw new Error(`Unexpected faction: ${faction}`);
  return {id,faction,name:lore.name,description:lore.description,emblem:`assets/wiki-ui/faction-${id}.webp`,pages:lore.pages.map((text,index)=>({page:index+1,text})).filter(p=>p.text.trim()),evidence:['data/lore.ts']};
}).sort((a,b)=>a.name.localeCompare(b.name));
if(factions.length!==9)throw new Error('Expected exactly nine released faction lore entries.');
const campaigns=knownCampaigns.map(id=>{
  const campaign=source.STORY_CAMPAIGNS.find(c=>c.id===id);if(!campaign)throw new Error(`Missing released campaign ${id}`);
  return {id,name:campaign.name,description:campaign.description,chapters:campaign.chapters.map((chapter,index)=>({chapter:index+1,sourceChapterId:chapter.id,title:chapter.title,description:chapter.description,floorCount:chapter.floorCount,dialogue:normalizeBeats(chapter.dialogue),comms:normalizeBeats(source.getChapterComms(id,chapter.id))})),evidence:['constants.ts',`data/story/${({'mecha-hearts':'mechaHearts','aegis-initiative':'aegisInitiative','zenith-war':'zenithWar','crimson-vanguard':'crimsonVanguard','kuro-campaign':'kuroCampaign'})[id]}.ts`,`data/story/comms/${({'mecha-hearts':'mechaHearts','aegis-initiative':'aegisInitiative','zenith-war':'zenithWar','crimson-vanguard':'crimsonVanguard','kuro-campaign':'kuroCampaign'})[id]}.ts`]};
});
const snapshot={schemaVersion:1,gameVersion:pkg.version,policy:'Released base-game lore and story; full text is opt-in behind spoiler controls. Unreleased DLC is excluded.',factions,campaigns};
const countLines=key=>campaigns.reduce((sum,c)=>sum+c.chapters.reduce((n,ch)=>n+ch[key].reduce((l,b)=>l+b.lines.length,0),0),0);
const countBeats=key=>campaigns.reduce((sum,c)=>sum+c.chapters.reduce((n,ch)=>n+ch[key].length,0),0);
const unalignedGates=campaigns.flatMap(c=>c.chapters.flatMap(ch=>['dialogue','comms'].flatMap(kind=>ch[kind].filter(b=>b.afterFloor>ch.floorCount).map(b=>({campaign:c.id,chapter:ch.chapter,kind,authoredAfterFloor:b.afterFloor,currentFloorCount:ch.floorCount})))));
for(const campaign of campaigns)for(const chapter of campaign.chapters)for(const kind of ['dialogue','comms'])for(const beat of chapter[kind])for(const line of beat.lines)if(typeof line.speaker!=='string'||typeof line.text!=='string')throw new Error('Invalid story line');
const report={candidateHash:digest(snapshot),gameVersion:pkg.version,factions:factions.length,lorePages:factions.reduce((n,f)=>n+f.pages.length,0),campaigns:campaigns.length,chapters:campaigns.reduce((n,c)=>n+c.chapters.length,0),dialogueBeats:countBeats('dialogue'),dialogueLines:countLines('dialogue'),commsBeats:countBeats('comms'),commsLines:countLines('comms'),unalignedGates};
await fs.mkdir(review,{recursive:true});
await fs.writeFile(path.join(review,'lore-candidate.json'),JSON.stringify(snapshot,null,2)+'\n');
await fs.writeFile(path.join(review,'lore-report.json'),JSON.stringify(report,null,2)+'\n');
await fs.writeFile(path.join(review,'lore-assets.json'),JSON.stringify(factions.map(f=>({source:`assets/factions/${f.id}.png`,destination:f.emblem,width:128,height:128})),null,2)+'\n');
if(process.argv.includes('--reviewed-hash')){
  const reviewedHash=process.argv[process.argv.indexOf('--reviewed-hash')+1];
  if(reviewedHash!==report.candidateHash)throw new Error('Reviewed lore hash does not match this extraction.');
  await fs.writeFile(path.join(root,'src/data/lore.json'),JSON.stringify(snapshot,null,2)+'\n');
}
console.log(JSON.stringify({...report,unalignedGates:unalignedGates.length,promoted:process.argv.includes('--reviewed-hash')},null,2));
