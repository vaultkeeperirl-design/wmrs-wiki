"""Crop/resize reviewed original game pixels; never invent or repaint game UI.

Authoring helper only. Production CI consumes the committed reviewed results.
"""
import argparse
import base64
import hashlib
import json
from pathlib import Path
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('--game-root', type=Path, default=Path(__file__).resolve().parents[2])
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
game = args.game_root.resolve()
recipes = {}
tracked = root / 'data' / 'editorial-assets.json'
if tracked.exists():
    for previous in json.loads(tracked.read_text(encoding='utf-8'))['assets']:
        recipes[previous['destination']] = {key: previous[key] for key in ['source','destination','width','height','crop','kind'] if key in previous}
for name in ['navigation-assets.json', 'guide-assets.json', 'tier-assets.json', 'capture-assets.json', 'lore-assets.json']:
    manifest = root / '.review' / name
    if not manifest.exists():
        continue
    for row in json.loads(manifest.read_text(encoding='utf-8-sig')):
        destination = row['destination']
        if not destination.startswith(('assets/wiki-ui/', 'assets/wiki-guides/')) or '..' in destination:
            raise ValueError(f'Unapproved visual destination: {destination}')
        previous = recipes.get(destination)
        if previous:
            if previous['source'] != row['source'] or previous.get('crop') != row.get('crop'):
                raise ValueError(f'Conflicting source recipes: {destination}')
            row = dict(row, width=max(row['width'], previous['width']), height=max(row['height'], previous['height']))
        recipes[destination] = row

def digest(data):
    # Same contract as scripts/lib.mjs: hash the base64 representation of a file.
    return hashlib.sha256(base64.b64encode(data)).hexdigest()

approved_path = root / 'data' / 'approved.json'
approved = json.loads(approved_path.read_text(encoding='utf-8'))
editorial = []
for destination, row in sorted(recipes.items()):
    source = row['source']
    if source.startswith('assets/'):
        source_path = (game / 'public' / source).resolve()
    elif source.startswith('output/') and row.get('kind') == 'reviewed-game-capture':
        source_path = (game / source).resolve()
    else:
        raise ValueError(f'Unapproved original source: {source}')
    if not source_path.is_relative_to(game) or any(s in source.lower() for s in ['/dlc/', '-demo', 'admin-badge', 'mod-badge']):
        raise ValueError(f'Restricted source: {source}')
    image = Image.open(source_path).convert('RGBA')
    if row.get('crop'):
        left, top, right, bottom = row['crop']
        if not (0 <= left < right <= image.width and 0 <= top < bottom <= image.height):
            raise ValueError(f'Invalid exact-pixel crop: {destination}')
        image = image.crop((left, top, right, bottom))
    # Transparent source margins are preserved unless the explicit reviewed crop says otherwise.
    image.thumbnail((row['width'], row['height']), Image.Resampling.LANCZOS)
    target = root / 'public' / destination
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, 'WEBP', quality=92, method=6)
    file_hash = digest(target.read_bytes())
    approved['assetHashes'][destination] = file_hash
    editorial.append({**row, 'outputWidth': image.width, 'outputHeight': image.height,
                      'sourceHash': digest(source_path.read_bytes()), 'approvedHash': file_hash})

(root / 'data' / 'editorial-assets.json').write_text(json.dumps({'schemaVersion': 1, 'assets': editorial}, indent=2) + '\n', encoding='utf-8')
approved_path.write_text(json.dumps(approved, indent=2) + '\n', encoding='utf-8')
print(f'Prepared {len(editorial)} reviewed official icons and exact-pixel game UI crops.')
