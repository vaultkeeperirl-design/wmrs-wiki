import type {Entry} from '../lib/data';
export interface SearchEntry extends Entry {url: string; searchText: string;}
export interface Catalog {entries: SearchEntry[];rules:{uniqueFamilies:string[];signaturePairs:{pilotBaseName:string;warmachineBaseName:string}[];chassisCounters:Record<string,string>};}
let pending: Promise<Catalog> | undefined;
export const base = import.meta.env.BASE_URL.replace(/\/$/,'');
export const url = (path: string) => `${base}/${path.replace(/^\//,'')}`;
export function getCatalog(){return pending??=fetch(url('search-index.json')).then(async response=>{if(!response.ok)throw new Error('Database could not be loaded. Reload the page.');return await response.json() as Catalog;});}
export function node<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, className?: string){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
export function link(text:string,href:string,className='text-link'){const el=node('a',text,className);el.href=href;return el;}
export function art(entry:SearchEntry){const wrapper=node('div',undefined,'art');if(entry.background){const image=node('img');image.src=url(entry.background);image.alt='';image.className='art-bg';image.loading='lazy';wrapper.append(image);}if(entry.image){const image=node('img');image.src=url(entry.image);image.alt=`${entry.name} official artwork`;image.className='art-fg';image.loading='lazy';image.width=400;image.height=400;wrapper.append(image);}else wrapper.append(node('span','WMRS','art-fallback'));return wrapper;}
export const rarityRank:Record<string,number>={Common:1,Rare:2,Epic:3,Legendary:4};
