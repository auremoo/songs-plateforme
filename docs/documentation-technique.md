# Documentation Technique — Portfolio Musical

---

## 1. Stack technique

| Couche | Choix | Justification |
|--------|-------|---------------|
| **Framework** | Next.js 15 (App Router) | SSG/SSR, routing file-based, middleware, API routes |
| **Langage** | TypeScript | Typage fort, DX, maintenabilite |
| **Styling** | Tailwind CSS 4 | Styling utilitaire, CSS variables pour theming dynamique |
| **Animations** | Framer Motion | Transitions de pages, scroll reveal, micro-interactions |
| **i18n** | next-intl | Internationalisation FR/EN, routing localise |
| **Images** | next/image + sharp | Optimisation automatique, compression WebP a l'upload |
| **Donnees** | Fichiers JSON locaux | Pas de CMS — edition via admin panel, donnees versionnees |
| **Deploiement** | Fly.io + Docker + GitHub Actions | CI/CD automatique, standalone output |
| **Package manager** | pnpm | Rapide, efficient disk usage |

---

## 2. Structure du projet

```
songs-plateforme/
├── app/
│   ├── [locale]/                     # Pages publiques i18n (FR/EN)
│   │   ├── layout.tsx                # Layout racine : header, footer, transitions, password gate
│   │   ├── page.tsx                  # Accueil : ArchivesSection (masonry) + EditorialGrid (tableau)
│   │   ├── about/page.tsx            # Page a propos
│   │   └── release/[slug]/page.tsx   # Detail sortie : ReleaseHero + ReleaseInfo + ReleaseGallery + ReleaseNav
│   ├── admin/
│   │   ├── layout.tsx                # Layout admin (auth check)
│   │   ├── page.tsx                  # Redirect → /admin/releases
│   │   ├── releases/page.tsx         # Liste des sorties
│   │   ├── releases/new/page.tsx     # Nouvelle sortie
│   │   ├── releases/[slug]/page.tsx  # Edition sortie
│   │   ├── personal/page.tsx         # Edition infos personnelles
│   │   ├── design/page.tsx           # Settings design
│   │   ├── mosaic/page.tsx           # Editeur grille masonry drag-and-drop
│   │   └── backup/page.tsx           # Export/import backup JSON
│   ├── api/
│   │   ├── auth/route.ts             # POST: login, DELETE: logout
│   │   ├── releases/route.ts         # GET: liste, POST: creer
│   │   ├── releases/[slug]/route.ts  # GET/PUT/DELETE sortie
│   │   ├── personal/route.ts         # GET/PUT infos personnelles
│   │   ├── design/route.ts           # GET/PUT design settings
│   │   ├── upload/route.ts           # POST: upload image/audio/video
│   │   ├── backup/route.ts           # GET: export, POST: import
│   │   └── gate/route.ts             # POST: verification password gate
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Header.tsx                # Header fixe, burger mobile, nav desktop
│   │   ├── Footer.tsx                # Footer minimal, socials, lien admin (dev)
│   │   ├── PageTransition.tsx        # Wrapper Framer Motion pour transitions
│   │   └── LocaleSwitcher.tsx        # Switch FR/EN
│   ├── home/
│   │   ├── ArchivesSection.tsx       # Grille masonry de covers (CSS column-count)
│   │   ├── EditorialGrid.tsx         # Tableau editorial filtrable (annee/sortie/type/genre)
│   │   ├── CategoryFilter.tsx        # Filtres par genre musical
│   │   └── HoverPreview.tsx          # Preview cover carree au hover + indicateur audio
│   ├── release/
│   │   ├── ReleaseHero.tsx           # Hero 2 colonnes (cover + metadonnees)
│   │   ├── ReleaseInfo.tsx           # Grille suisse : description + liens streaming
│   │   ├── ReleaseGallery.tsx        # Audio player + tracklist table + galerie photos
│   │   └── ReleaseNav.tsx            # Navigation sortie precedente/suivante
│   ├── about/
│   │   ├── AboutGrid.tsx             # Grid two-column : bio + infos structurees
│   │   ├── Manifesto.tsx             # Premier paragraphe bio en display
│   │   ├── Skills.tsx                # Tags/pills competences
│   │   ├── ExperienceTimeline.tsx    # Timeline experiences
│   │   ├── EducationSection.tsx      # Section formations
│   │   └── ContactSection.tsx        # Email + socials + press kit
│   ├── admin/
│   │   ├── AdminNav.tsx              # Navigation admin (Sorties / Infos / Design / Grille / Backup)
│   │   ├── AdminAuthGuard.tsx        # Protection authentification
│   │   ├── ReleaseForm.tsx           # Formulaire sortie : tracklist, audio, streaming links
│   │   ├── PersonalForm.tsx          # Formulaire infos personnelles
│   │   ├── DesignForm.tsx            # Formulaire design (fonts, couleurs, categories)
│   │   ├── ImageUploader.tsx         # Upload drag & drop (images + videos)
│   │   ├── CropPicker.tsx            # Outil recadrage image
│   │   └── FocalPointPicker.tsx      # Point focal image
│   ├── gate/
│   │   └── PasswordGate.tsx          # Page password gate (prod only)
│   └── ui/
│       ├── CustomCursor.tsx          # Curseur personnalise (desktop)
│       ├── Loader.tsx                # Splash screen (name configurable via personal.json)
│       └── ScrollReveal.tsx          # Animation au scroll (Framer Motion useInView)
├── data/
│   ├── releases.json                 # Sorties musicales (bilingues)
│   ├── personal.json                 # Bio, competences, experiences, password gate
│   └── design.json                   # Settings design (fonts, couleurs, genres, grille)
├── lib/
│   ├── data.ts                       # CRUD fichiers JSON (getReleases, saveReleases...)
│   ├── auth.ts                       # Session admin (cookies httpOnly)
│   ├── gate.ts                       # Hash SHA-256 + constantes password gate
│   └── backup.ts                     # Utilitaires export/import backup
├── i18n/
│   ├── routing.ts                    # Locales supportees (fr, en)
│   ├── request.ts                    # Config requete i18n
│   └── navigation.ts                 # Link, usePathname, useRouter localises
├── messages/
│   ├── fr.json                       # Traductions francaises
│   └── en.json                       # Traductions anglaises
├── middleware.ts                      # next-intl redirect + protection admin
├── types/index.ts                    # Interfaces TypeScript
├── public/images/                    # Images des sorties (par slug/)
├── public/audio/                     # Previews audio (par slug/)
├── Dockerfile                        # Multi-stage : deps → builder → runner
├── fly.toml                          # Config Fly.io
└── .github/workflows/deploy.yml      # CI/CD GitHub Actions
```

---

## 3. Modele de donnees

### Release

```typescript
type ReleaseType = "single" | "album" | "ep" | "mixtape";
type Genre = string; // "electronic" | "hip-hop" | "ambient" | "r&b" | custom

interface StreamingLinks {
  spotify?:    string;
  appleMusic?: string;
  soundcloud?: string;
  youtube?:    string;
  bandcamp?:   string;
}

interface Track {
  title:    string;
  duration: string;    // format "3:45"
  features: string[];
}

interface Release {
  slug:          string;
  title:         LocalizedText;        // { fr: string; en: string }
  genre:         Genre;
  releaseType:   ReleaseType;
  year:          string;
  features:      string[];             // artistes en featuring (niveau release)
  description:   LocalizedText;
  cover:         string;               // chemin image carree (WebP)
  color:         string;               // couleur de fond placeholder
  tracklist:     Track[];              // vide si single
  audioPreview:  string;               // URL fichier audio court
  streamingLinks: StreamingLinks;
  gallery:       GalleryItem[];        // photos press, visuels bonus
  scatter:       ScatterPosition;
  coverRatio?:   "square" | "landscape" | "portrait";
  coverCrop?:    CropRect;
}
```

### GalleryItem

```typescript
interface GalleryItem {
  src:            string;
  alt:            LocalizedText;
  layout:         "full" | "half" | "third";
  type?:          "image" | "video";
  inMosaic?:      boolean;
  mosaicRatio?:   "landscape" | "portrait" | "square" | "wide" | "tall";
  focalPoint?:    { x: number; y: number };
  cropRect?:      CropRect;
}
```

### Donnees personnelles

```typescript
interface PersonalInfo {
  name:                string;
  title:               LocalizedText;
  bio:                 LocalizedText;
  portrait:            string;
  email:               string;
  location:            LocalizedText;
  pressKitUrl:         string;
  socials:             { label: string; url: string; visible?: boolean }[];
  skills:              LocalizedText[];
  experiences:         Experience[];
  education:           Education[];
  showPressKit:        boolean;
  showSkills:          boolean;
  showExperience:      boolean;
  showEducation:       boolean;
  sitePassword:        string;
  sitePasswordEnabled: boolean;
}
```

### Design Settings

```typescript
interface DesignSettings {
  fontDisplay:             string;   // nom Google Font ou custom
  fontBody:                string;
  colorOffwhite:           string;
  colorNoir:               string;
  colorGris:               string;
  colorGrisClair:          string;
  adobeFontsUrl?:          string;
  customFontDisplayFile?:  string;
  customFontBodyFile?:     string;
  gridColumns?:            number;   // colonnes masonry (2-6)
  categories:              { value: string; label: string }[];
  mosaicOrder:             string[]; // slugs ordonnances pour la grille
}
```

---

## 4. Animations

### Transitions de pages (Framer Motion)
- `AnimatePresence` dans le layout
- Chaque page : opacity 0→1 + translateY 20px→0, duree 0.5s
- Guard `useReducedMotion()` : si actif, duree = 0

### Scroll Reveal
- Composant `ScrollReveal` wrappant les elements
- Detection viewport via Framer Motion `useInView`
- Variants : fade-up avec delay optionnel
- `useReducedMotion()` desactive la translation

### Hover Preview (accueil)
- Cover carree 240x240 qui suit le curseur au hover du tableau editorial
- Prop `hasAudioPreview` : icone ▶ si preview audio disponible
- Desktop uniquement (masque sur mobile)

### Masonry Grid
- CSS `column-count` avec responsive overrides
- 2 colonnes mobile → 3 tablette → N colonnes desktop (configurable 2-6)

### Tracklist Stagger (page sortie)
- Chaque ligne du tableau `<table>` anime avec stagger 0.05s
- `useReducedMotion()` : si actif, pas d'animation

### ReleaseHero (page sortie)
- Fade-in from bottom : opacity 0→1 + translateY 30px→0
- `useReducedMotion()` desactive le translateY

---

## 5. Page Sortie — Structure

```
/[locale]/release/[slug]
├── ReleaseHero     — cover (priority) + metadonnees (type, annee, titre, genre, featurings)
├── ReleaseInfo     — grille suisse : description + liens streaming (Spotify, Apple Music...)
├── ReleaseGallery
│   ├── AudioPreview  — <audio controls> si audioPreview non vide
│   ├── Tracklist     — <table> semantique si tracklist.length > 0
│   └── PhotoGallery  — carousel + lightbox si gallery.length > 0
└── ReleaseNav      — liens sortie precedente / suivante / toutes les sorties
```

### Audio Preview
- Element HTML5 `<audio controls>`
- `aria-label` localise
- Pas d'autoplay
- `prefers-reduced-motion` via `useReducedMotion()` garde sur les animations autour

### Tracklist
- Tableau `<table>` semantique : colonnes #, Titre, Durée, Feat.
- Animation stagger Framer Motion sur les `<tr>`

---

## 6. Securite

### Admin
- Protection par `ADMIN_PASSWORD` (variable d'environnement)
- Session cookie httpOnly, 24h
- Middleware bloque `/admin/*` et `/api/*` (sauf `/api/gate`) en production

### Password Gate (production)
- Mot de passe site configurable via admin (champ `sitePassword` dans personal.json)
- Toggle on/off (`sitePasswordEnabled`)
- Hash SHA-256
- Cookie httpOnly, secure (HTTPS), sameSite strict
- Verification cote serveur dans le layout
- Actif uniquement en `NODE_ENV === "production"`

---

## 7. Upload et compression

### Images
- Upload via API `/api/upload`
- Compression automatique avec sharp :
  - Redimensionnement max 1920px de large
  - Conversion WebP qualite 82
- Stockage dans `public/images/[slug]/`
- Covers : format carre recommande (1:1)

### Audio
- Formats acceptes : MP3, OGG, WAV
- Taille max : 20MB
- Pas de compression (stockage direct)
- Stockage dans `public/audio/[slug]/`

### Videos (galerie)
- Formats acceptes : MP4, WebM, QuickTime
- Taille max : 50MB
- Pas de compression (stockage direct)
- Lecture HTML5 : autoPlay, loop, muted, playsInline

---

## 8. Deploiement

### Docker
- Build multi-stage : `deps` → `builder` → `runner`
- Next.js `output: "standalone"` pour image legere
- Image finale ~150MB

### Fly.io
- Region : `cdg` (Paris)
- VM : shared-cpu-1x, 256MB RAM
- Auto-stop : machines s'arretent quand inactives
- Health check : GET `/` toutes les 30s

### CI/CD
- GitHub Actions sur push main
- Workflow : checkout → setup flyctl → deploy
- Secret requis : `FLY_API_TOKEN`

### Backup JSON
- Export complet via `/admin/backup` : releases + personal + design
- Import pour restaurer l'etat complet du site
- Versionne (`_meta.version: 2`)

---

## 9. Responsive

### Breakpoints (Tailwind CSS 4)
| Breakpoint | Largeur | Utilisation |
|------------|---------|-------------|
| default | < 640px | Mobile |
| `sm` | >= 640px | Petit ecran |
| `md` | >= 768px | Tablette |
| `lg` | >= 1024px | Desktop |
| `xl` | >= 1280px | Grand desktop |
| `2xl` | >= 1536px | Tres grand ecran |

### Adaptations mobiles
- Header : hauteur reduite (h-16), burger menu
- Masonry : 2 colonnes mobile, 3 tablette, N desktop
- Tableau editorial : layout carte empilee sur mobile
- ReleaseHero : 1 colonne sur mobile (cover + infos en dessous)
- Footer : empilage vertical sur mobile
- Paddings : px-4 mobile → px-6 → px-12 → px-24+ desktop

---

## 10. Convention de code

- **Composants** : PascalCase (`ReleaseGallery.tsx`)
- **Utilitaires** : camelCase (`data.ts`)
- **Styling** : Tailwind only (pas de CSS Modules)
- **Commits** : Conventional Commits (`feat:`, `fix:`, `style:`, `docs:`)
- **Branches** : `main` (production)
- **i18n** : toutes les strings UI dans `messages/fr.json` et `en.json`
- **Types** : centralises dans `types/index.ts`
- **Donnees** : fichiers JSON dans `data/`, lus/ecrits via `lib/data.ts`
- **prefers-reduced-motion** : guard `useReducedMotion()` sur TOUTES les animations Framer Motion

---

## 11. Performance

| Aspect | Strategie |
|--------|-----------|
| **Images** | Compression WebP a l'upload, next/image avec `sizes` responsive, lazy loading, `priority` sur cover hero |
| **Audio** | Pas de preload automatique (`preload="metadata"`) |
| **Videos** | Formats natifs, pas de transcoding |
| **Fonts** | Google Fonts / Adobe Fonts avec preconnect, `font-display: swap` |
| **JS** | Code-splitting par route, tree-shaking |
| **CSS** | Tailwind purge automatique |
| **Build** | Next.js standalone output, Docker multi-stage |
