# Analyse Fonctionnelle — Portfolio Musical

---

## 1. Objectif du site

Créer un **portfolio musical en ligne** pour un musicien / producteur. Le site doit :

- Mettre en valeur les sorties musicales (singles, EPs, albums, mixtapes)
- Offrir une expérience immersive pour découvrir la musique (audio preview, tracklist, liens streaming)
- Affirmer l'identité artistique avec un design suisse minimaliste
- Faciliter la prise de contact et le téléchargement du press kit
- Fonctionner comme une **vitrine éditoriale** — archive soignée plutôt que site vitrine classique

---

## 2. Architecture du site

### 3 pages publiques :

| Page | URL | Rôle |
|------|-----|------|
| **Accueil** | `/[locale]` | Grille masonry de covers + tableau éditorial filtré par genre |
| **Sortie** | `/[locale]/release/[slug]` | Page détail d'une sortie musicale |
| **À propos** | `/[locale]/about` | Bio, compétences, parcours, press kit |

### Navigation :
- **Header fixe minimal** : nom artiste (à gauche) + `Musique` / `À propos` (à droite) + sélecteur FR/EN
- Pas de menu hamburger sur desktop
- Menu overlay simple sur mobile

---

## 3. Page Accueil

### Concept
Deux vues complémentaires sur la même page :
1. **Grille masonry** en haut — covers carrées empilées, entrée visuelle immédiate
2. **Tableau éditorial** en dessous — archive textuelle filtrable, inspiré de BrestBrestBrest

### Grille masonry (ArchivesSection)
- CSS `column-count` : 2 colonnes mobile → 3 tablette → N desktop (configurable 2-6)
- Chaque cover est carrée (1:1), `next/image` lazy
- Hover : opacité légère, curseur pointer
- Clic → `/release/[slug]`
- Ordre configurable via éditeur drag-and-drop `/admin/mosaic`

### Tableau éditorial (EditorialGrid)
- 4 colonnes : Année / Sortie (titre) / Type / Genre
- Filtre par genre (CategoryFilter) : Tout / Electronic / Hip-Hop / Ambient / R&B / ...
- Hover preview : cover carrée 240×240 qui suit le curseur + icône ▶ si audio disponible
- Desktop uniquement pour la preview hover

### Wireframe ASCII — Desktop :

```
┌──────────────────────────────────────────────────────────┐
│  Artist Name                          Musique  À propos  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐         │
│  │        │  │        │  │        │  │        │         │
│  │ Cover  │  │ Cover  │  │ Cover  │  │ Cover  │         │
│  │        │  │        │  │        │  │        │         │
│  └────────┘  └────────┘  └────────┘  └────────┘         │
│                                                          │
│  ┌────────┐  ┌────────┐                                  │
│  │        │  │        │                                  │
│  │ Cover  │  │ Cover  │                                  │
│  │        │  │        │                                  │
│  └────────┘  └────────┘                                  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Tout · Electronic · Hip-Hop · Ambient · R&B             │
├──────────────────────────────────────────────────────────┤
│  Année   Sortie              Type      Genre             │
│  ──────────────────────────────────────────────────────  │
│  2024    Night Drive         Single    Electronic        │
│  2023    Echoes              EP        Ambient           │
│  2023    Fragments           Album     Hip-Hop           │
│  2022    Aurora              Single    Electronic        │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Page Sortie — Détail

### Concept
Page immersive dédiée à une sortie musicale. Structure en 4 blocs verticaux.

### Structure :

```
┌──────────────────────────────────────────────────────────┐
│  Artist Name                          Musique  À propos  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────┐   EP · 2023                      │
│  │                    │                                  │
│  │                    │   Echoes                         │
│  │     Cover art      │                                  │
│  │     (carré)        │   Ambient                        │
│  │                    │                                  │
│  └────────────────────┘   Avec Artiste B, Artiste C      │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Type    │  Echoes                                       │
│  ─────────────────────────────────────────────────────   │
│  Année   │  Description de la release sur plusieurs      │
│          │  lignes. Contexte, ambiance, influences.      │
│  Genre   │                                               │
│  ─────────────────────────────────────────────────────   │
│  [Spotify]  [Apple Music]  [SoundCloud]  [Bandcamp]      │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ▶ ████████░░░░░░░░  Extrait audio                       │
│                                                          │
│  Tracklist                                               │
│  ─────────────────────────────────────────────────────   │
│  01  Echoes I          4:23                              │
│  02  Drift             5:11    feat. Artiste B           │
│  03  Echoes II         3:47                              │
│                                                          │
│  [Photos galerie...]                                     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  ← Night Drive                         Fragments →      │
└──────────────────────────────────────────────────────────┘
```

### Comportement :
- **ReleaseHero** : 2 colonnes desktop (cover + métadonnées), 1 colonne mobile
- **ReleaseInfo** : grille suisse typographique, liens streaming en boutons outline
- **AudioPreview** : `<audio controls>` HTML5, pas d'autoplay, visible seulement si `audioPreview` non vide
- **Tracklist** : `<table>` sémantique, animation stagger au chargement, visible seulement si `tracklist.length > 0`
- **PhotoGallery** : carousel + lightbox, visible seulement si `gallery.length > 0`
- **ReleaseNav** : liens précédente/suivante/toutes les sorties

---

## 5. Page À propos

### Concept
Page fond noir (`#1A1A1A`), sobre et personnelle. Accent sur le texte et le manifeste.

### Structure :

```
┌──────────────────────────────────────────────────────────┐
│  Artist Name                          Musique  À propos  │  ← Header blanc sur fond noir
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Premier paragraphe bio en grand (Manifesto)             │
│  — affiché en Playfair Display, taille display           │
│                                                          │
│  ┌──────────────────┐   Artist Name                      │
│  │                  │   Musicien · Producteur             │
│  │    Portrait      │                                    │
│  │                  │   Texte bio complet                 │
│  └──────────────────┘   Paragraphe 2, 3...               │
│                                                          │
│  Compétences                                             │
│  ─────────                                               │
│  Production · Mixage · Direction artistique · ...        │
│                                                          │
│  Expériences                                             │
│  ─────────                                               │
│  2022–2025  Studio XYZ — Producteur senior               │
│  2020–2022  ...                                          │
│                                                          │
│  ┌──────────────────────────┐                            │
│  │  Télécharger Press Kit   │                            │
│  └──────────────────────────┘                            │
│                                                          │
│  Instagram · Spotify · SoundCloud · Bandcamp             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Comportement :
- Layout **2 colonnes** sur desktop (portrait + bio), 1 colonne sur mobile
- Premier paragraphe de bio → `<Manifesto>` en grand display
- Section compétences en **tags/pills** (configurable via admin)
- Expériences en **timeline** verticale (configurable via admin)
- Sections conditionnelles : `showSkills`, `showExperience`, `showEducation`, `showPressKit`
- **Press Kit** (PDF) en remplacement du CV

---

## 6. Panel Admin

### Accès : `/admin`
Protection par `ADMIN_PASSWORD` (env var). Session cookie 24h.

### Sorties (`/admin/releases`)
| Fonctionnalité | Description |
|----------------|-------------|
| Liste | Slug / titre FR / année / type / genre |
| Créer | `+ Nouvelle sortie` |
| Modifier | Formulaire complet (voir ci-dessous) |
| Supprimer | Avec confirmation |

**Formulaire sortie (ReleaseForm) :**
- Slug (auto-généré depuis titre FR)
- Titre FR / EN
- Genre (select configurable)
- Type de release (single / album / ep / mixtape)
- Année
- Featurings (liste)
- Description FR / EN
- Cover (upload + CropPicker)
- Couleur de fond
- Audio preview (input URL ou upload MP3/OGG/WAV)
- Liens streaming : Spotify, Apple Music, SoundCloud, YouTube, Bandcamp
- Tracklist dynamique : titre / durée / featurings par piste
- Galerie : images/videos avec layout, alt text, toggle mosaic

### Infos personnelles (`/admin/personal`)
- Nom, titre FR/EN
- Bio FR/EN
- Portrait (upload)
- Email, localisation FR/EN
- Press Kit URL
- Réseaux sociaux (toggle visible/masqué)
- Compétences FR/EN
- Expériences (période, entreprise, rôle FR/EN)
- Formation (année, école, diplôme FR/EN)
- Sections conditionnelles (toggles)
- Password gate (toggle + mot de passe visiteurs)

### Design (`/admin/design`)
- Police titres (Google Fonts / Adobe / custom)
- Police corps
- Adobe Fonts URL (Typekit)
- Fichiers police custom (upload .woff2)
- Couleurs (offwhite, noir, gris, gris clair)
- Colonnes grille masonry (2-6)
- Genres musicaux (liste configurable)

### Grille masonry (`/admin/mosaic`)
- Éditeur drag-and-drop visuel
- Réordonnancement des covers via clavier + boutons
- Preview temps réel

### Backup (`/admin/backup`)
- Export JSON complet (releases + personal + design)
- Import JSON pour restaurer

---

## 7. Éléments transversaux

### Transitions de pages
- Fade + translate subtil (opacity + translateY), 400-600ms
- `prefers-reduced-motion` : animations désactivées si requis

### Loader / Splash screen
- Nom configurable depuis `personal.json` (plus hardcodé)
- Rapide (~1.5s), bloque le premier rendu

### Curseur custom
- Petit cercle qui suit la souris (desktop)
- Agrandissement au hover sur éléments cliquables

### Internationalisation
- Routes `/fr/*` et `/en/*` via next-intl
- Toutes les strings UI dans `messages/fr.json` et `messages/en.json`
- Switcher FR/EN dans le header

### Responsive
- **Desktop** : tableau éditorial + hover preview + grille N colonnes
- **Tablette** : grille 3 colonnes, tableau simplifié
- **Mobile** : grille 2 colonnes, nav overlay, pas de hover preview

### Password Gate (production)
- Protection site entier (utile avant lancement ou partage privé)
- Mot de passe visiteurs configurable via admin (différent du mot de passe admin)
- Désactivable en un clic

---

## 8. Contenu attendu

Pour alimenter le site :

| Élément | Détail |
|---------|--------|
| **Sorties** (1 à N) | Titre, genre, type, année, description FR/EN, cover 1:1, tracklist, liens streaming |
| **Audio previews** | Extraits MP3 courts (≤ 90s recommandé) |
| **Photos** | Photos presse, visuels bonus (pour la galerie des sorties) |
| **Portrait** | Photo artiste (pour la page À propos) |
| **Bio** | Texte FR/EN (premier paragraphe = manifeste en display) |
| **Press Kit** | PDF téléchargeable |
| **Réseaux** | Spotify, SoundCloud, Instagram, Bandcamp, YouTube... |
