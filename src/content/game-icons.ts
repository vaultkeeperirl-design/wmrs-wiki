/** Existing WMRS interface artwork. Optimized assets retain the original pixels. */
export const gameIcons = {
  logo: 'assets/wiki-ui/logo.webp',
  home: 'assets/wiki-ui/hangar.webp',
  guides: 'assets/wiki-ui/red-book.webp',
  search: 'assets/wiki-ui/lookup.webp',
  expansions: 'assets/wiki-ui/story.webp',
  compare: 'assets/wiki-ui/lookup.webp',
  packExplorer: 'assets/wiki-ui/scout.webp',
  teamBuilder: 'assets/wiki-ui/hangar.webp',
  collection: 'assets/wiki-ui/collection.webp',
  progression: 'assets/wiki-ui/evolution.webp',
  glossary: 'assets/wiki-ui/faction-lore.webp',
  factions: 'assets/wiki-ui/faction-lore.webp',
  tierList: 'assets/wiki-ui/pits.webp',
} as const;

export const categoryIcons: Record<string, string> = {
  warmachines: 'assets/wiki-ui/warmachines.webp',
  pilots: 'assets/wiki-ui/pilot.webp',
  items: 'assets/wiki-ui/gear.webp',
  packs: 'assets/wiki-ui/scout.webp',
  abilities: 'assets/wiki-ui/energy.webp',
  campaigns: 'assets/wiki-ui/story.webp',
  missions: 'assets/wiki-ui/active-patrols.webp',
  enemies: 'assets/wiki-ui/enemies.webp',
  bosses: 'assets/wiki-ui/pits.webp',
  upgrades: 'assets/wiki-ui/upgrade.webp',
  achievements: 'assets/wiki-ui/achievements-tab.webp',
};

export const playerToolNavigation = [
  { path: 'tier-list/', label: 'Tier list', icon: gameIcons.tierList },
  { path: 'tools/compare/', label: 'Compare cards', icon: gameIcons.compare },
  { path: 'tools/pack-explorer/', label: 'Pack explorer', icon: gameIcons.packExplorer },
  { path: 'tools/team-builder/', label: 'Team builder', icon: gameIcons.teamBuilder },
  { path: 'tools/collection/', label: 'My collection', icon: gameIcons.collection },
  { path: 'tools/progression/', label: 'Progression', icon: gameIcons.progression },
  { path: 'tools/glossary/', label: 'Glossary', icon: gameIcons.glossary },
] as const;
