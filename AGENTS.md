# Dev server

- Le dev server du portal Nuxt se lance sur `http://localhost:3006/`
- Commande : `npm run dev`
- Ne pas tuer le serveur pour appliquer des modifications. Nuxt a du HMR et se restart automatiquement au changement de fichiers de configuration.
- Le tuer/redémarrer uniquement si une raison valable (ex: port bloqué, plantage).

# Deploy

- Le portal est déployé sur `https://sdk.verbatims.cc`
- Commande de build : `npm run build:demo`
- Le preset Nitro est `cloudflare-module` (configuré dans `nuxt.config.ts`)
- Le déploiement est géré depuis le dashboard Cloudflare (connexion GitHub)
- **Tout push sur `main` trigger un build Cloudflare Pages**, même les commits sans rapport avec l'app.
- Pour éviter un build inutile, inclure `[skip ci]` ou `[ci skip]` dans le message de commit des changements qui ne touchent pas le dossier `app/` ou `nuxt.config.ts`.

# SDK

- `npm run build` — compile src/ → dist/
- `npm run typecheck` — tsc --noEmit
- `npm test` — vitest run
- `npm run test:watch` — vitest en mode watch

# Release (CI)

- **Release workflow** : `.github/workflows/release.yml`
- Déclenché sur push dans `main` touchant `src/`, `packages/cli/`, `package.json`, `tsconfig.json` ou le workflow lui-même
- Pas de semantic-release. La release SDK et CLI se fait via `npm version patch + npm publish` simple
- **Provenance OIDC désactivé** (`@semantic-release/npm` avec provenance cause des échecs `ENEEDAUTH` intempestifs)
- Le token npm (`NPM_TOKEN`) est stocké dans les secrets GitHub et passé via `NODE_AUTH_TOKEN` + `registry-url`
- Le bump se fait toujours depuis la dernière version publiée sur npm (pas depuis la version locale du git), car `--no-git-tag-version` ne commit pas le changement et les runs CI suivants perdraient la trace du bump
- Les deux jobs (`release-sdk` et `release-cli`) sont indépendants et peuvent échouer séparément
