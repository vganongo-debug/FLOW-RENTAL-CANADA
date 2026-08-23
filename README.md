# Flow Rentals OS

Système d'exploitation intégré — hébergement, mobilité et services de
proximité pour Flow Rentals Global Inc. (filiale de VBMS Holdings Inc.,
Canada).

Le réseau couvre la Basse-Côte-Nord et la Côte-Nord du Québec, avec le
Labrador en phase 2 : des communautés desservies par vols régionaux, où
le service au sol est rare. L'application réunit stations d'hébergement,
location de véhicules, pods d'isolement et distributrices sur une seule
plateforme.

## Stack

- React 18 + TypeScript + Vite 8 (Rolldown)
- Tailwind CSS (jetons de marque Flow)
- React Router v7
- Recharts · Lucide icons
- i18next (français / anglais)
- Vitest + Testing Library

## Démarrage

```bash
npm install
```

```bash
npm run dev
```

Ouvrir http://localhost:5173 et choisir un profil de démonstration sur
l'écran de connexion.

| Script | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production dans `dist/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Suite Vitest |

## Profils de démonstration

L'écran de connexion permet d'entrer sous n'importe quel profil ; chacun
arrive sur sa page d'accueil.

| Profil | Arrive sur |
|---|---|
| SuperAdmin (co-fondateur) | `/admin/portfolio` |
| Directeur d'hôtel | `/hotels/dashboard` |
| Agent location | `/fleet/dashboard` |
| Responsable Fidélité | `/rewards/members` |
| Client | `/booking/search` |

Le réseau étant limité au Canada, il n'y a pas de profil « directeur
pays ». Les parcs partenaires restent des données métier — parc,
commissions, versements — mais ne disposent pas d'un profil de connexion :
le portail partenaire (`/fleet/partner-portal`) est consultable par le
SuperAdmin.

## Géographie et devise

- **Provinces** — les 13 provinces et territoires, chacun avec son régime
  de taxes de vente (TPS+TVQ, TVH, TPS+TVP…), son autorité fiscale et son
  format d'export comptable. Voir `src/lib/canada.ts`.
- **Aéroports** — catalogue de 445 aéroports canadiens dans
  `src/lib/airports.ts`, dont 430 régionaux. Fichier **généré**, à ne pas
  éditer à la main :

  ```bash
  node scripts/import-airports.mjs
  ```

  La source est le jeu de données ouvert OurAirports. Les champs propres
  au déploiement Flow (nom d'usage, phase, sous-réseau, transporteurs)
  sont maintenus dans `OVERRIDES` du script d'import et réappliqués à
  chaque génération.
- **Devise** — le dollar canadien est la devise de référence : tous les
  montants sont stockés en CAD (`*Cad`). USD et EUR restent disponibles à
  l'affichage pour les clients internationaux.

## Données de démonstration

Les jeux de données vivent dans `localStorage` sous le préfixe
`flow-os.`. `SEED_VERSION` dans `src/lib/api.ts` les purge quand leur
forme change — sans ce jalon, un navigateur ayant visité une version
antérieure servirait des données incompatibles avec le schéma courant.

## Arborescence

```
scripts/
  import-airports.mjs    Génère le catalogue des aéroports
src/
  components/
    flow/                Bibliothèque de composants Flow*
    layout/              AppLayout (back-office) + PublicLayout (public)
  context/               Fournisseurs Auth, Theme, Locale
  i18n/                  Catalogues fr / en
  lib/                   canada, airports, api, types, sampleData, utils
  pages/                 Écrans par domaine
```

## Marque

Les couleurs vivent dans `tailwind.config.js` et `src/index.css`, à la
fois en utilitaires Tailwind (`bg-teal`, `text-copper`, `bg-panel-mid`)
et en variables CSS (`--color-teal`, etc).

Typographie :
- Titres : Palatino Linotype
- Corps / interface : Calibri / Segoe UI
- Étiquettes : Trebuchet MS, majuscules, interlettrage 0.08em
