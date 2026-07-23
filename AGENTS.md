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

# SDK

- `npm run build` — compile src/ → dist/
- `npm run typecheck` — tsc --noEmit
- `npm test` — vitest run
- `npm run test:watch` — vitest en mode watch
