# Warmachine: Rogue Scout Wiki

An image-rich Astro, TypeScript and Tailwind companion wiki. It builds to static files, with browser search and local player tools. No paid hosting, database, API key or backend is required.

## Local development

Use Node 22.12 or later.

```powershell
npm ci
npm run dev
```

Open the printed URL with `/wmrs-wiki/` appended. The project base path deliberately matches production.

```powershell
npm run check
npm test
npm run build
npm run preview
```

The production build validates the approved database and asset hashes, generates all entity and guide pages, then audits every local page link, script, stylesheet and image reference under the GitHub Pages base path.

## Content

- `src/data/database.json`: approved generated facts and relationships.
- `src/content/guides.ts`: manually authored beginner-to-advanced guides, journey stages and glossary. Extraction never overwrites this file.
- `data/approved.json`: approved database hash and exact public asset hashes.
- `data/identity.json`: persistent identity map; preserve assigned IDs when renaming content.
- `reports/coverage.json`: counts, missing artwork and unresolved questions.
- `scripts/game-adapter.ts`: explicit local source entrypoint, containing no game secrets.

Story and hidden rewards are included under the owner's instruction to use click-to-reveal controls. Normal galleries/search hide them. Unreleased DLC is excluded even when development files exist.

## Deploy to GitHub Pages — after owner approval

Intended repository: `vaultkeeperirl-design/wmrs-wiki`.

Intended URL: https://vaultkeeperirl-design.github.io/wmrs-wiki/

No repository or public website is created merely by building this project. The game repository must remain private and must never become the wiki repository.

1. Finish the local content review and checks above.
2. Run `npm run stage`. This writes a new, self-contained allowlisted checkout under `.staging/`; its path appears in `reports/staging.json`.
3. Obtain the owner's approval to create the public repository and publish this exact reviewed snapshot.
4. From that standalone checkout, initialize Git, create `wmrs-wiki` under the approved account, commit, and push `main`. Never copy the game root or its Git history.
5. In the dedicated repository, set Settings → Pages → Source to **GitHub Actions**.
6. Set the repository Actions variable `WIKI_PUBLISH_APPROVED` to `true` only after publication approval. The workflow will otherwise build without deploying.
7. Run the Pages workflow (or push the approved commit). Verify the deployment succeeds and the actual returned URL works.
8. Protect `main` with reviewed changes; optionally require deployment approval in the `github-pages` environment where account settings permit it.

The workflow builds only the committed approved snapshot. It never clones the private game repository, reads live server configuration or automatically extracts development content.

If a different owner or repository name is chosen, update `astro.config.mjs`, `robots.txt.ts`, `scripts/audit-build.mjs` and the intended URL documentation together, then repeat the full build/base-path audit.

See [MAINTENANCE.md](MAINTENANCE.md) for extraction and [AUDIT.md](AUDIT.md) for source coverage and limits.
