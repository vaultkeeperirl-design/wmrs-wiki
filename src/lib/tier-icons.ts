/** Original game tier artwork. Labels stay visible so the art is never the only cue. */
export const tierAssets = {
  Base: { image: 'assets/wiki-ui/prototype-base.webp', label: 'Base', name: 'Base template' },
  P: { image: 'assets/wiki-ui/prototype-p.webp', label: 'P', name: 'Prototype' },
  SP: { image: 'assets/wiki-ui/prototype-sp.webp', label: 'SP', name: 'Secret Prototype' },
  HSP: { image: 'assets/wiki-ui/prototype-hsp.webp', label: 'HSP', name: 'Hidden Secret Prototype' },
} as const;

export type CardTier = keyof typeof tierAssets;
export function getTierAsset(tier?: string) {
  return tier && Object.hasOwn(tierAssets, tier) ? tierAssets[tier as CardTier] : undefined;
}

/** Client-rendered counterpart to TierBadge.astro, used by galleries and tools. */
export function createTierBadge(tier: string | undefined, pathFor: (path: string) => string, className = '') {
  const asset = getTierAsset(tier);
  const badge = document.createElement('span');
  badge.className = ['tier-badge', className].filter(Boolean).join(' ');
  if (!asset) { badge.textContent = tier ?? ''; return badge; }
  badge.dataset.tier = asset.label;
  badge.title = asset.name;
  const image = document.createElement('img');
  image.src = pathFor(asset.image);
  image.alt = '';
  image.width = 96;
  image.height = 96;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.className = 'tier-icon';
  const label = document.createElement('span');
  label.className = 'tier-label';
  label.textContent = asset.label;
  badge.append(image, label);
  return badge;
}

/** "Aegis [SP]" → {base: "Aegis", tier: "SP"}; names without a card-tier suffix are returned whole. */
export function splitTierName(name: string) {
  const match = /^(.*\S)\s\[(P|SP|HSP)\]$/.exec(name);
  return match ? {base: match[1], tier: match[2] as CardTier} : {base: name, tier: undefined};
}

/** Client counterpart to TierName.astro: the name with its [P]/[SP]/[HSP] suffix drawn as game art. */
export function createTierName(name: string, pathFor: (path: string) => string, tag: keyof HTMLElementTagNameMap = 'span', className = '') {
  const {base, tier} = splitTierName(name);
  const element = document.createElement(tag);
  element.className = ['tier-name', className].filter(Boolean).join(' ');
  element.append(base);
  const asset = getTierAsset(tier);
  if (asset) {
    const image = document.createElement('img');
    image.src = pathFor(asset.image);
    image.alt = `[${asset.label}]`;
    image.title = asset.name;
    image.className = 'tier-name-icon';
    image.dataset.tier = asset.label;
    element.append(' ', image);
  }
  return element;
}
