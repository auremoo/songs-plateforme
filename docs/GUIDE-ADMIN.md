# Guide Admin — Comment gérer ton portfolio musical

Le panel d'administration se gère directement depuis le navigateur.
Pas besoin d'installer quoi que ce soit.

---

## Accéder à l'admin

1. Ouvre ton navigateur
2. Va sur **https://ton-site.fly.dev/admin**
3. Entre le mot de passe admin (défini dans `ADMIN_PASSWORD`)
4. Tu restes connecté pendant 24h

---

## Les 5 onglets de l'admin

| Onglet | Ce que ça fait |
|--------|---------------|
| **Sorties** | Ajouter, modifier ou supprimer tes sorties musicales |
| **Infos** | Modifier ta bio, ton press kit, tes réseaux sociaux, tes expériences... |
| **Design** | Changer les polices, les couleurs, les genres, le nombre de colonnes |
| **Grille** | Réordonner les covers de la page d'accueil en drag-and-drop |
| **Backup** | Exporter ou importer toutes tes données en JSON |

---

## Onglet "Sorties"

### Liste des sorties

Liste avec slug / titre / année / type / genre. Pour chaque sortie :
- **"Modifier"** : ouvre le formulaire d'édition
- **"Supprimer"** : supprime avec confirmation

### Créer une sortie

Clique sur **"+ Nouvelle sortie"**. Champs disponibles :

**Informations de base :**

| Champ | Description |
|-------|-------------|
| **Slug** | Identifiant URL (ex: `night-drive`). Clique **"Auto"** pour générer depuis le titre FR. |
| **Titre (FR / EN)** | Nom de la sortie dans les deux langues |
| **Genre** | Electronic, Hip-Hop, Ambient, R&B... (liste configurable dans Design) |
| **Type** | Single, EP, Album, Mixtape |
| **Année** | Année de sortie |
| **Featurings** | Artistes en feat. (niveau release — liste séparée par virgules) |
| **Description (FR / EN)** | Texte de présentation bilingue |

**Visuels :**

| Champ | Description |
|-------|-------------|
| **Cover** | Image carrée (1:1). Auto-compressée en WebP. |
| **Couleur de fond** | Couleur affichée pendant le chargement de la cover (ex: `#1A1A1A`) |

**Audio :**

| Champ | Description |
|-------|-------------|
| **Audio preview** | URL d'un fichier audio ou upload direct (MP3, OGG, WAV — max 20MB). Extrait court recommandé (≤ 90s). |

**Liens streaming :**

Champs pour : Spotify, Apple Music, SoundCloud, YouTube, Bandcamp.
Colle directement l'URL complète du lien.

**Tracklist :**

Clique **"+ Ajouter une piste"** pour chaque titre :

| Champ | Description |
|-------|-------------|
| **Titre** | Nom de la piste |
| **Durée** | Format `3:45` |
| **Featurings** | Artistes en feat. sur cette piste (optionnel) |

Laisse la tracklist vide pour un single.

**Galerie :**

Clique **"+ Ajouter un média"** pour photos de presse et visuels bonus :

| Champ | Description |
|-------|-------------|
| **Fichier** | Image (JPG/PNG/WebP) ou vidéo (MP4/WebM) — max 50MB |
| **Taille** | Plein / Demi / Tiers (mise en page dans la galerie) |
| **Alt text (FR / EN)** | Description courte (important pour l'accessibilité) |
| **Afficher en mosaïque** | Si coché, l'image apparaît aussi dans la grille d'accueil |

---

## Onglet "Infos personnelles"

### Identité

| Champ | Description |
|-------|-------------|
| **Nom** | Ton nom d'artiste (affiché dans le header et le loader) |
| **Titre (FR / EN)** | Ex: "Musicien · Producteur" / "Musician · Producer" |

### Bio

| Champ | Description |
|-------|-------------|
| **Bio (FR / EN)** | Ta présentation. Le **premier paragraphe** s'affiche en grand (manifeste). Sépare les paragraphes par une ligne vide. |

### Contact

| Champ | Description |
|-------|-------------|
| **Email** | Adresse de contact |
| **Press Kit** | URL de ton PDF press kit |
| **Localisation (FR / EN)** | Ta ville (ex: "Paris, France") |

### Portrait

Upload ta photo pour la page À propos.

### Réseaux sociaux

Pour chaque réseau :
- **Case à cocher** : visible sur le site (décocher masque sans supprimer)
- **Nom** : Spotify, SoundCloud, Instagram, Bandcamp...
- **URL** : lien de ton profil
- **x** : supprime définitivement

Clique **"+ Ajouter"** pour un nouveau réseau.

### Password gate

Active la protection du site entier pour un lancement privé :
1. Coche **"Activer la protection"**
2. Définis un **mot de passe visiteurs** (différent du mot de passe admin)
3. Sauvegarde — partage ce mot de passe aux personnes que tu veux

Décoche pour rendre le site public.

### Sections visibles (page À propos)

| Toggle | Ce que ça contrôle |
|--------|--------------------|
| **Bouton Press Kit** | Affiche ou masque le bouton de téléchargement |
| **Compétences** | Affiche ou masque la section compétences |
| **Expériences** | Affiche ou masque les expériences pro |
| **Formation** | Affiche ou masque les diplômes |

### Compétences

Chaque compétence : champ FR + champ EN.
Exemples : "Production" / "Production", "Mixage" / "Mixing"

### Expériences professionnelles

| Champ | Description |
|-------|-------------|
| **Période** | Ex: "2022 — 2025" |
| **Entreprise** | Nom du studio, label, collectif... |
| **Rôle (FR / EN)** | Poste dans les deux langues |
| **Description (FR / EN)** | Optionnel — ce que tu faisais |

### Formations

| Champ | Description |
|-------|-------------|
| **Année** | Année d'obtention |
| **École** | Nom de l'établissement |
| **Diplôme (FR / EN)** | Nom du diplôme dans les deux langues |

---

## Onglet "Design"

### Typographie

Deux polices configurables :
- **Police titres (display)** : par défaut Playfair Display (grands titres)
- **Police corps (body)** : par défaut Inter (texte courant)

Choix : liste déroulante (Google Fonts, système) ou saisie libre.

> **Google Fonts** (Playfair Display, Inter...) : fonctionnent directement.
> **Adobe Fonts** : colle l'URL Typekit dans le champ dédié, puis tape le nom exact de la police.

### Adobe Fonts (Typekit)
1. Va sur https://fonts.adobe.com
2. Crée un "Web Project"
3. Copie l'URL CSS (`https://use.typekit.net/xxxxxxx.css`)
4. Colle dans **"Adobe Fonts — URL du projet"**

### Couleurs

| Couleur | Rôle | Défaut |
|---------|------|--------|
| **Fond (offwhite)** | Fond pages normales | `#F8F7F4` |
| **Texte (noir)** | Texte principal | `#1A1A1A` |
| **Gris** | Textes secondaires | `#6B6B6B` |
| **Gris clair** | Bordures | `#E0DEDA` |

### Colonnes grille

Curseur 2-6 colonnes pour la grille masonry d'accueil (desktop). Le mobile s'adapte automatiquement.

### Genres musicaux

Tu peux personnaliser la liste des genres affichés dans le filtre et dans le formulaire sortie.
- **"+ Ajouter un genre"** pour en créer un
- **"x"** pour supprimer
- Tu peux modifier le label à tout moment

---

## Onglet "Grille"

Éditeur visuel de l'ordre des covers sur la page d'accueil.
- Glisse-dépose pour réordonner
- Boutons fléchés pour déplacer au clavier
- L'ordre est sauvegardé en temps réel

---

## Onglet "Backup"

### Exporter
Clique **"Exporter"** — tu télécharges un fichier JSON contenant toutes tes sorties, tes infos personnelles et tes paramètres design. Garde ce fichier en lieu sûr.

### Importer
Pour restaurer une sauvegarde : glisse le fichier JSON ou clique **"Parcourir"**, puis **"Importer"**.

> **Attention** : l'import écrase toutes les données existantes.

---

## Voir le site

Le site est accessible à :

**https://ton-site.fly.dev**

- Version française : https://ton-site.fly.dev/fr
- Version anglaise : https://ton-site.fly.dev/en

Les changements sont visibles immédiatement après sauvegarde (recharge la page : Cmd+R / F5).

---

## Résolution de problèmes

| Problème | Solution |
|----------|----------|
| La page admin ne s'affiche pas | Vérifie l'URL (`/admin`) et que tu es en HTTPS |
| "Unauthorized" ou erreur 401 | Session expirée (24h). Recharge et reconnecte-toi. |
| L'image ne s'envoie pas | Vérifie que le fichier fait moins de 50MB (20MB pour l'audio) |
| L'audio ne se charge pas | Vérifie le format (MP3, OGG, WAV) et la taille (max 20MB) |
| Les changements n'apparaissent pas | Recharge la page (Cmd+R sur Mac, F5 sur Windows) |
| Le site est lent au premier chargement | Normal — le serveur se réveille après inactivité (30s max) |
| Une police ne s'affiche pas | Vérifie que le nom est correct. Pour Adobe Fonts, vérifie l'URL Typekit. |
