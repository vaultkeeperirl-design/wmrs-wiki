import type {Entry} from './data';

/** Player-facing acquisition routes, matched against an entry's extracted sources. */
export const acquisitionRoutes = [
  {value:'scout', label:'Scout packs', pattern:/^Scout/},
  {value:'story', label:'Story rewards', pattern:/^Story reward/},
  {value:'dossier', label:'Enemy dossiers', pattern:/^Enemy dossier/},
  {value:'twitch', label:'Twitch Drops', pattern:/Twitch Drop/},
  {value:'red-book', label:'Faction Red Book (HSP)', pattern:/Red Book/},
  {value:'completionist', label:'Rogue completionist', pattern:/Rogue completionist/},
  {value:'referral', label:'Invite a friend', pattern:/referral/i},
  {value:'battle-pass', label:'Battle Pass', pattern:/Battle Pass/},
  {value:'shop', label:'Premium Shop & Founders', pattern:/Premium Shop|Founders Pack/},
  {value:'starter', label:'Starter & daily login', pattern:/starter|Starting equipment|Daily login/i},
  {value:'workshop', label:'Workshop evolution', pattern:/^Workshop/},
] as const;

export const matchesRoute = (e: Pick<Entry,'sources'>, route: string) =>
  !route || e.sources.some(source => acquisitionRoutes.find(r => r.value === route)?.pattern.test(source));
