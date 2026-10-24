export const storageKey = 'wmrs-wiki-v1';
export interface LocalState { collection: string[]; journey: string[]; team?: Record<string,string>[]; }
export function readState(): LocalState {
  try { const v = JSON.parse(localStorage.getItem(storageKey) ?? '{}'); return {collection:Array.isArray(v.collection) ? v.collection.filter((i: unknown) => typeof i === 'string') : [],journey:Array.isArray(v.journey) ? v.journey.filter((i: unknown) => typeof i === 'string') : [],team:Array.isArray(v.team) ? v.team : undefined}; }
  catch {return {collection:[],journey:[]};}
}
export function toast(message: string){const el=document.querySelector('#toast');if(!el)return;el.textContent=message;el.classList.add('visible');setTimeout(()=>el.classList.remove('visible'),2800);}
export function writeState(state: LocalState){try {localStorage.setItem(storageKey,JSON.stringify(state));return true;}catch{toast('Browser storage is unavailable. Changes cannot be saved on this device.');return false;}}
export function refreshState(){
  const state=readState();
  document.querySelectorAll<HTMLButtonElement>('[data-collect]').forEach(button=>{const collected=state.collection.includes(button.dataset.collect!);button.setAttribute('aria-pressed',String(collected));button.textContent=collected?'✓ Collected':'＋ Collection';});
  document.querySelectorAll<HTMLButtonElement>('[data-journey]').forEach(button=>{const done=state.journey.includes(button.dataset.journey!);button.setAttribute('aria-pressed',String(done));button.textContent=done?'✓ Completed':'○ Mark complete';});
  document.querySelectorAll<HTMLElement>('[data-step]').forEach(step=>step.classList.toggle('complete',state.journey.includes(step.dataset.step!)));
  const known=['start-here','first-battle','first-team','upgrades','packs','advanced-strategy'];
  const done=known.filter(s=>state.journey.includes(s)).length;
  const counter=document.querySelector('#journey-count');if(counter)counter.textContent=`${done} / 6 COMPLETE`;
  const bar=document.querySelector<HTMLElement>('#journey-bar');if(bar)bar.style.width=`${done/6*100}%`;
}
document.querySelector('#menu-toggle')?.addEventListener('click',()=>{const button=document.querySelector('#menu-toggle')!;const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));document.querySelector('#sidebar')?.classList.toggle('open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){document.querySelector('#sidebar')?.classList.remove('open');document.querySelector('#menu-toggle')?.setAttribute('aria-expanded','false');}if(event.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes((event.target as HTMLElement)?.tagName)){event.preventDefault();const search=document.querySelector<HTMLInputElement>('#db-query');if(search)search.focus();else (document.querySelector('.header-search') as HTMLAnchorElement)?.click();}});
document.addEventListener('click',event=>{
  const button=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-collect],[data-journey]');if(!button)return;
  const state=readState();const key=button.dataset.collect?'collection':'journey';const id=button.dataset.collect??button.dataset.journey!;
  state[key]=state[key].includes(id)?state[key].filter(value=>value!==id):[...state[key],id];
  writeState(state);refreshState();document.dispatchEvent(new CustomEvent('wmrs-state-change'));
});
window.addEventListener('storage',refreshState);
refreshState();
