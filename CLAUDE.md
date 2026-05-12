# CLAUDE.md — Portfolio Musical

## Projet
Portfolio web pour un musicien / producteur.
Grille masonry de covers en accueil + tableau éditorial filtrable par genre, pages de sortie avec tracklist et liens streaming, design suisse minimaliste.
Bilingue FR/EN avec panel d'administration intégré.

## Stack
- **Framework** : Next.js 15 (App Router) + TypeScript
- **Styling** : Tailwind CSS 4
- **Animations** : Framer Motion (transitions, scroll reveal, stagger)
- **i18n** : next-intl (FR/EN)
- **Package manager** : pnpm
- **Déploiement** : Fly.io (auto-deploy via GitHub Actions)

## Structure
- `app/` — Pages Next.js (App Router)
- `components/` — Composants React organisés par page (home/, release/, about/, layout/, admin/, ui/)
- `data/` — Données (releases.json, personal.json, design.json) — pas de CMS
- `types/index.ts` — Types TypeScript (Release, Track, StreamingLinks...)
- `public/images/` — Images des sorties (par slug)
- `public/audio/` — Previews audio (par slug)
- `messages/` — Traductions FR/EN (next-intl)
- `docs/` — Documentation technique
- `tmp-clone/` — Clone original DA (exclu du TS par tsconfig, NE PAS MODIFIER)

## Pages publiques
1. **Accueil** (`/[locale]`) — Grille masonry covers + tableau éditorial filtré par genre
2. **Sortie** (`/[locale]/release/[slug]`) — Hero 2 colonnes, grille suisse, audio player, tracklist, liens streaming, galerie photos
3. **À propos** (`/[locale]/about`) — Bio, compétences, parcours, formation, press kit

## Admin (`/admin`)
- **Sorties** (`/admin/releases`) — CRUD sorties musicales
- **Infos** (`/admin/personal`) — Bio, compétences, socials, password gate
- **Design** (`/admin/design`) — Fonts, couleurs, colonnes grille
- **Grille** (`/admin/mosaic`) — Éditeur drag-and-drop grille masonry
- **Backup** (`/admin/backup`) — Export/import JSON

## Modèle principal

```typescript
interface Release {
  slug: string;
  title: { fr: string; en: string };
  genre: string;           // "electronic" | "hip-hop" | "ambient" | "r&b"
  releaseType: "single" | "album" | "ep" | "mixtape";
  year: string;
  features: string[];
  description: { fr: string; en: string };
  cover: string;           // chemin image carrée
  color: string;
  tracklist: Track[];      // vide si single
  audioPreview: string;    // URL fichier audio
  streamingLinks: StreamingLinks;
  gallery: GalleryItem[];
  scatter: ScatterPosition;
}
```

## Conventions
- Composants : PascalCase
- Fichiers utilitaires : camelCase
- Commits : Conventional Commits (`feat:`, `fix:`, `style:`, `docs:`)
- CSS : Tailwind only (pas de CSS Modules)
- Toujours respecter `prefers-reduced-motion` sur toutes les animations Framer Motion
- **Mettre à jour README.md et les docs à chaque nouvelle fonctionnalité**

## Commandes

```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Build prod
pnpm lint         # ESLint
pnpm type-check   # TypeScript check
```

## Design
- Fond off-white (`#F8F7F4`) sur pages normales, noir (`#1A1A1A`) sur page about
- Typo display : Playfair Display (serif) pour titres
- Typo corps : Inter (sans-serif)
- Header et footer s'adaptent automatiquement au fond (clair/sombre)
- Marges généreuses : px-8 / md:px-12 / lg:px-16
- Animations subtiles (Framer Motion), jamais flashy
- Mobile : grille simplifiée, nav overlay, burger animé
- Transitions fluides entre pages (400–600ms)

## Inspirations
- **BrestBrestBrest** — grille éditoriale archives, filtres, espacement
- **MNISW Studio** — page about fond sombre, nom display
- **Design suisse** — grille typographique label/contenu, rigueur des marges

## Points d'attention
- Les images DOIVENT avoir des alt text
- Toujours tester sur mobile
- `prefers-reduced-motion` requis sur toutes les animations Framer Motion
- Les covers sont carrées (1:1) — auto-compressées en WebP via sharp à l'upload
- L'audio preview est un extrait court (≤ 90s recommandé, max 20MB)
- Les docs (`README.md`, `docs/`) doivent rester à jour avec le code
