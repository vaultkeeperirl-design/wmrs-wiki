import {entries,entryHref,href,database,byId} from '../lib/data';
import {guides} from '../content/guides';
import {factionSearchEntries} from '../lib/lore';
export function GET(){
  const indexed=entries.map(e=>({...e,url:entryHref(e),searchText:[e.name,e.description,e.category,e.rarity,e.type,e.faction,e.tier,...e.sources,...(e.packIds??[]).map(id=>byId.get(id)?.name??''),...(e.abilityIds??[]).map(id=>byId.get(id)?.name??'')].join(' ').toLocaleLowerCase()}));
  const articles=guides.map(g=>({id:`guide-${g.slug}`,category:'guides',name:g.title,description:g.summary,type:'Guide',sources:[],evidence:g.sources,url:href(`guides/${g.slug}/`),searchText:[g.title,g.summary,...g.sections.flatMap(s=>[s.title,...s.paragraphs])].join(' ').toLocaleLowerCase()}));
  const factionEntries=factionSearchEntries().map(e=>({...e,url:entryHref(e),searchText:[e.name,e.description,e.category,e.faction,'lore','allegiance'].join(' ').toLocaleLowerCase()}));
  return new Response(JSON.stringify({entries:[...indexed,...articles,...factionEntries],rules:database.rules}),{headers:{'Content-Type':'application/json'}});
}
