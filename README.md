# songs-plateforme — Portfolio Musical

Portfolio web pour un **musicien / producteur**.
Grille masonry de covers en accueil + tableau editorial filtrable par genre, pages de sortie avec tracklist et liens streaming, design suisse minimaliste.
Bilingue FR/EN avec panel d'administration integre.

---

## Demo rapide

```bash
pnpm install
cp .env.example .env.local   # configurer ADMIN_PASSWORD
pnpm dev
# → http://localhost:3000
```

---

## Stack

| Techno | Role |
|--------|------|
| [Next.js 15](https://nextjs.org/) (App Router) | Framework React, SSG, routing |
| TypeScript | Typage strict |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling utilitaire |
| [Framer Motion](https://www.framer.com/motion/) | Animations (transitions, scroll reveal, stagger) |
| [next-intl](https://next-intl.dev/) | Internationalisation FR/EN |
| [sharp](https://sharp.pixelplumbing.com/) | Compression images automatique (WebP) |
| pnpm | Package manager |
| [Fly.io](https://fly.io/) | Deploiement (Docker + GitHub Actions) |

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Accueil | `/[locale]` | Grille masonry de covers + tableau editorial filtre par genre avec preview hover |
| Release | `/[locale]/release/[slug]` | Cover art, infos en grille suisse, audio preview, tracklist, liens streaming, galerie photos |
| A propos | `/[locale]/about` | Bio, competences, parcours, formation, press kit |
| Admin | `/admin` | Panel d'administration protege par mot de passe |
| Admin Sorties | `/admin/releases` | Liste, creation, edition et suppression de sorties musicales |
| Admin Infos | `/admin/personal` | Edition des informations personnelles, socials, press kit |
| Admin Design | `/admin/design` | Fonts, couleurs, colonnes grille |
| Admin Grille | `/admin/mosaic` | Editeur visuel drag-and-drop de la grille masonry |

---

## Arborescence

```
songs-plateforme/
├── app/
│   ├── [locale]/                     # Pages publiques i18n
│   │   ├── layout.tsx                # Layout (header, footer, transitions, password gate)
│   │   ├── page.tsx                  # Accueil — masonry + tableau editorial
│   │   ├── about/page.tsx            # A propos
│   │   └── release/[slug]/page.tsx   # Detail d'une sortie musicale
│   ├── admin/                        # Panel d'administration
│   │   ├── layout.tsx                # Layout admin avec auth
│   │   ├── page.tsx                  # Redirect → /admin/releases
│   │   ├── releases/                 # CRUD sorties musicales
│   │   ├── personal/                 # Edition infos personnelles
│   │   ├── design/                   # Settings design (fonts, couleurs)
│   │   ├── mosaic/                   # Editeur grille masonry
│   │   └── backup/                   # Export/import JSON
│   ├── api/
│   │   ├── auth/route.ts             # Auth admin (POST login, DELETE logout)
│   │   ├── releases/route.ts         # GET/POST sorties
│   │   ├── releases/[slug]/route.ts  # GET/PUT/DELETE sortie
│   │   ├── personal/route.ts         # GET/PUT infos personnelles
│   │   ├── design/route.ts           # GET/PUT design settings
│   │   ├── upload/route.ts           # Upload images/audio/videos
│   │   ├── backup/route.ts           # Export/import backup JSON
│   │   └── gate/route.ts             # Password gate (prod)
│   └── globals.css
├── components/
│   ├── layout/                       # Header, Footer, PageTransition, LocaleSwitcher
│   ├── home/                         # EditorialGrid, CategoryFilter, HoverPreview, ArchivesSection
│   ├── release/                      # ReleaseHero, ReleaseInfo, ReleaseGallery, ReleaseNav
│   ├── about/                        # Manifesto, ContactSection, Skills, ExperienceTimeline, EducationSection
│   ├── admin/                        # AdminNav, ReleaseForm, PersonalForm, ImageUploader, CropPicker
│   ├── gate/                         # PasswordGate (prod only)
│   └── ui/                           # CustomCursor, Loader, ScrollReveal
├── data/
│   ├── releases.json                 # Sorties musicales (bilingues)
│   ├── personal.json                 # Bio, competences, experiences, password gate
│   └── design.json                   # Settings design (fonts, couleurs, grille)
├── i18n/                             # Configuration next-intl
├── lib/
│   ├── data.ts                       # Lecture/ecriture des fichiers JSON
│   ├── auth.ts                       # Session admin (cookies)
│   └── gate.ts                       # Password gate (hash SHA-256, cookies)
├── messages/
│   ├── fr.json                       # Traductions francaises
│   └── en.json                       # Traductions anglaises
├── middleware.ts                      # Middleware next-intl + protection admin
├── types/index.ts                    # Types TypeScript (Release, Track, StreamingLinks...)
├── public/images/                    # Images des sorties (par slug)
├── public/audio/                     # Previews audio (par slug)
├── Dockerfile                        # Multi-stage build Next.js standalone
├── fly.toml                          # Configuration Fly.io
├── .github/workflows/deploy.yml      # CI/CD GitHub Actions → Fly.io
├── CLAUDE.md                         # Instructions Claude Code
└── README.md                         # Ce fichier
```

---

## Modele de donnees — Release

```typescript
interface Release {
  slug:           string;
  title:          { fr: string; en: string };
  genre:          string;               // "electronic" | "hip-hop" | "ambient" | ...
  releaseType:    "single" | "album" | "ep" | "mixtape";
  year:           string;
  features:       string[];             // artistes en featuring
  description:    { fr: string; en: string };
  cover:          string;               // chemin image (carre)
  color:          string;               // couleur de fond placeholder
  tracklist:      Track[];              // vide si single
  audioPreview:   string;               // URL fichier audio court
  streamingLinks: StreamingLinks;       // spotify / appleMusic / soundcloud / youtube / bandcamp
  gallery:        GalleryItem[];        // photos press, visuels bonus
  scatter:        ScatterPosition;
}
```

---

## Fonctionnalites

### v1.0 — Portfolio Musical (transformation DA → Musical)

- [x] **Modele Release** : type, genre, tracklist, audioPreview, streamingLinks
- [x] **Page release** : hero two-columns (cover + infos), grille suisse, audio player, tracklist `<table>`, liens streaming
- [x] **Tableau editorial** : colonnes Annee / Titre / Type / Genre (plus client/categorie DA)
- [x] **Hover preview** : cover carree au survol + icone audio si preview disponible
- [x] **Grille masonry** : covers carrées par défaut
- [x] **Admin releases** : formulaire avec tracklist dynamique, upload cover + audio, 5 liens streaming
- [x] **Upload audio** : support mp3/ogg/wav (20MB max) dans la route upload
- [x] **i18n** : terminologie musicale FR/EN (sorties, genres, tracklist, press kit...)
- [x] **Header** : "Musique" / "Music" → `/`
- [x] **Loader** : nom configurable depuis `personal.json`

### v0.4 — Base technique (héritage)

- [x] **Deploiement Fly.io** : Dockerfile multi-stage, fly.toml, GitHub Actions CI/CD
- [x] **Password gate** : protection site public en prod
- [x] **Compression images** : upload auto-compresse en WebP via sharp
- [x] **Support video** : MP4/WebM/MOV dans les galeries
- [x] **Admin Design** : fonts (Google/Adobe/custom), couleurs, colonnes grille
- [x] **Editeur grille mosaic** : drag-and-drop visuel (clavier + boutons)
- [x] **Sections conditionnelles** : toggles admin pour skills/experience/education
- [x] **Backup JSON** : export/import complet des donnees
- [x] **Responsive mobile** : paddings adaptatifs, nav projet lisible, footer flexible

---

## Admin

Panel accessible a `/admin` (mot de passe defini dans `.env.local` via `ADMIN_PASSWORD`).

- CRUD complet des sorties musicales (textes bilingues, cover, tracklist, audio, streaming)
- Edition informations personnelles (bio, competences, parcours, formation)
- Gestion des socials (Spotify, SoundCloud, Instagram, Bandcamp...)
- Upload images et audio (auto-compression WebP pour images)
- Configuration design (fonts, couleurs, colonnes grille)
- Editeur visuel de la grille masonry
- Password gate du site public (mot de passe + toggle on/off)
- Export/import backup JSON

---

## Deploiement

### Fly.io

```bash
# Premier deploiement
fly launch --no-deploy
fly secrets set ADMIN_PASSWORD=votre_mot_de_passe
fly deploy

# Suivants (automatiques via GitHub Actions)
git push origin main
```

### Configuration requise

- **`ADMIN_PASSWORD`** : mot de passe admin (Fly secret)
- **GitHub Actions** : secret `FLY_API_TOKEN` dans le repo

### Architecture

- Docker multi-stage (Next.js `output: "standalone"`)
- Fly.io region `cdg` (Paris), 256MB shared CPU
- Auto-stop machines (free tier compatible)

---

## Password Gate (production)

- Mot de passe configurable depuis l'admin (champ `sitePassword` dans `personal.json`)
- Toggle on/off via l'interface admin
- Verification cote serveur (SHA-256 hash + cookie httpOnly)
- Actif uniquement en production

---

## Design

| Element | Valeur |
|---------|--------|
| Fond (pages normales) | Off-white `#F8F7F4` (configurable) |
| Fond (about) | Noir `#1A1A1A` (configurable) |
| Gris secondaire | `#6B6B6B` (configurable) |
| Bordures | `#E0DEDA` (configurable) |
| Typo titres | Playfair Display (configurable) |
| Typo corps | Inter (configurable) |
| Grille masonry | 2-6 colonnes (configurable) |

### Inspirations
- **BrestBrestBrest** — grille editoriale archives, filtres, espacement
- **MNISW Studio** — page about fond sombre, nom display
- **Design suisse** — grille typographique label/contenu, rigueur des marges

---

## Scripts

```bash
pnpm dev          # Serveur de dev (Turbopack)
pnpm build        # Build de production
pnpm start        # Serveur de production
pnpm lint         # ESLint
pnpm type-check   # Verification TypeScript
```

---

## Documentation

- [Documentation technique](docs/documentation-technique.md) — stack, modeles, animations, conventions
