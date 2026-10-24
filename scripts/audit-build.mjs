import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
const root = process.cwd();
const dist = path.join(root, 'dist');
const site = 'https://vaultkeeperirl-design.github.io';
const base = '/wmrs-wiki/';
const files = (await fs.readdir(dist, { recursive: true })).filter(p => p.endsWith('.html'));
const errors = [];
const fileChecks = new Map();
const anchorChecks = new Map();
async function checkFile(candidate) {
  if (!fileChecks.has(candidate)) fileChecks.set(candidate, fs.stat(candidate).then(s=>s.isFile()).catch(()=>false));
  return await fileChecks.get(candidate);
}
// Pages Actions serves the static artifact directly; retain the conventional marker too.
await fs.writeFile(path.join(dist,'.nojekyll'),'');
let links = 0, images = 0;
for (const file of files) {
  const html = await fs.readFile(path.join(dist, file), 'utf8');
  const $ = load(html);
  const current = site + base + file.replaceAll('\\', '/').replace(/index\.html$/, '');
  if (!$('title').text() || !$('meta[name="description"]').attr('content') || !$('link[rel="canonical"]').attr('href')) errors.push(`Missing SEO: ${file}`);
  if ($('h1').length !== 1) errors.push(`Expected one h1: ${file}`);
  if (/green.sun|green-sun-demo|production\.env|STEAM_WEB_API_KEY|rogue_protocol/i.test(html)) errors.push(`Restricted text: ${file}`);
  for (const el of $('a[href],img[src],script[src],link[rel="stylesheet"]')) {
    const attr = el.name === 'a' || el.name === 'link' ? 'href' : 'src';
    const value = $(el).attr(attr);
    if (!value || /^(mailto:|tel:|data:|#)/.test(value)) continue;
    const url = new URL(value, current);
    if (url.origin !== site) continue;
    if (!url.pathname.startsWith(base)) { errors.push(`Missing base prefix ${file}: ${value}`); continue; }
    const relative = decodeURIComponent(url.pathname.slice(base.length));
    const candidate = path.join(dist, relative, relative.endsWith('/') || !path.extname(relative) ? 'index.html' : '');
    try {
      if (!await checkFile(candidate)) throw new Error('not file');
      if (el.name === 'img') { images++; if ($(el).attr('alt') === undefined) errors.push(`Missing alt: ${file}`); } else links++;
      if (url.hash && el.name === 'a' && candidate.endsWith('.html')) {
        if (!anchorChecks.has(candidate)) {
          const target = load(await fs.readFile(candidate, 'utf8'));
          anchorChecks.set(candidate,new Set(target('[id]').toArray().map(e=>target(e).attr('id'))));
        }
        if (!anchorChecks.get(candidate).has(decodeURIComponent(url.hash.slice(1)))) errors.push(`Broken anchor ${file}: ${value}`);
      }
    } catch { errors.push(`Broken ${el.name} in ${file}: ${value}`); }
  }
}
for (const required of ['sitemap-index.xml', 'robots.txt', 'search-index.json', '.nojekyll']) await fs.access(path.join(dist, required));
if (errors.length) throw new Error(errors.slice(0, 45).join('\n') + `\n${errors.length} failures`);
const result = { pages: files.length, internalLinks: links, imageReferences: images, brokenLinks: 0, basePath: base };
await fs.mkdir(path.join(root, 'reports'), { recursive: true });
await fs.writeFile(path.join(root, 'reports/build-audit.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
