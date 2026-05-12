#!/bin/bash
# ============================================
#  Portfolio Margot Tournier — Lancer le site
# ============================================
#
#  Double-cliquer sur ce fichier pour demarrer.
#  Le site s'ouvrira automatiquement dans le navigateur.
#  Pour arreter : fermer cette fenetre.
#

cd "$(dirname "$0")"

echo ""
echo "  ┌─────────────────────────────────────────┐"
echo "  │  Portfolio Margot Tournier               │"
echo "  │  Demarrage en cours...                   │"
echo "  └─────────────────────────────────────────┘"
echo ""

# ── 1. Verifier / installer Node.js ──────────────────────

if ! command -v node &> /dev/null; then
    echo "  ⚙️  Node.js non trouve, tentative d'installation via Homebrew..."

    # Installer Homebrew si absent
    if ! command -v brew &> /dev/null; then
        echo "  ⚙️  Installation de Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

        # Ajouter Homebrew au PATH (Apple Silicon vs Intel)
        if [ -f /opt/homebrew/bin/brew ]; then
            eval "$(/opt/homebrew/bin/brew shellenv)"
        elif [ -f /usr/local/bin/brew ]; then
            eval "$(/usr/local/bin/brew shellenv)"
        fi
    fi

    brew install node
    if [ $? -ne 0 ]; then
        echo ""
        echo "  ❌ Impossible d'installer Node.js automatiquement."
        echo "     Va sur https://nodejs.org et installe la version LTS."
        echo ""
        read -p "  Appuie sur Entree pour fermer..."
        exit 1
    fi
    echo "  ✅ Node.js installe."
    echo ""
fi

echo "  Node.js $(node -v) detecte."

# ── 2. Verifier / installer pnpm ─────────────────────────

if ! command -v pnpm &> /dev/null; then
    echo "  ⚙️  Installation de pnpm..."
    npm install -g pnpm
    if [ $? -ne 0 ]; then
        echo "  ❌ Impossible d'installer pnpm."
        read -p "  Appuie sur Entree pour fermer..."
        exit 1
    fi
    echo "  ✅ pnpm installe."
    echo ""
fi

# ── 3. Installer les dependances (ou reinstaller si binaires manquants) ──

NEEDS_INSTALL=false

if [ ! -d "node_modules" ]; then
    NEEDS_INSTALL=true
fi

# Detecter si les binaires natifs correspondent a la plateforme actuelle
# (ex: node_modules installe sur Windows, lance sur Mac)
if [ -d "node_modules" ]; then
    # Verifier la presence du binaire SWC pour la plateforme courante
    ARCH=$(node -e "console.log(process.arch)")
    PLATFORM=$(node -e "console.log(process.platform)")

    if [ "$PLATFORM" = "darwin" ] && [ ! -d "node_modules/@next/swc-darwin-$ARCH" ]; then
        echo "  ⚠️  Dependances installees pour une autre plateforme."
        echo "     Reinstallation pour macOS ($ARCH)..."
        NEEDS_INSTALL=true
        rm -rf node_modules pnpm-lock.yaml
    elif [ "$PLATFORM" = "win32" ] && [ ! -d "node_modules/@next/swc-win32-$ARCH-msvc" ]; then
        echo "  ⚠️  Dependances installees pour une autre plateforme."
        echo "     Reinstallation pour Windows ($ARCH)..."
        NEEDS_INSTALL=true
        rm -rf node_modules pnpm-lock.yaml
    fi
fi

if [ "$NEEDS_INSTALL" = true ]; then
    echo "  ⚙️  Installation des dependances..."
    echo "     (ca peut prendre 1-2 minutes)"
    echo ""
    pnpm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "  ❌ Erreur lors de l'installation."
        read -p "  Appuie sur Entree pour fermer..."
        exit 1
    fi
    echo ""
    echo "  ✅ Dependances installees."
    echo ""
fi

# ── 4. Creer .env.local si absent ────────────────────────

if [ ! -f ".env.local" ]; then
    echo "ADMIN_PASSWORD=margot2026" > .env.local
    echo "  ✅ Fichier .env.local cree."
fi

# ── 5. Lancer le serveur ─────────────────────────────────

echo ""
echo "  ✅ Serveur en cours de demarrage..."
echo ""
echo "  ┌─────────────────────────────────────────┐"
echo "  │                                         │"
echo "  │  Site : http://localhost:3000            │"
echo "  │  Admin : http://localhost:3000/admin     │"
echo "  │                                         │"
echo "  │  Pour arreter : fermer cette fenetre     │"
echo "  │                                         │"
echo "  └─────────────────────────────────────────┘"
echo ""

# Ouvrir le navigateur apres un court delai (macOS: open, Windows: start)
if [ "$(uname)" = "Darwin" ]; then
    (sleep 4 && open "http://localhost:3000/admin") &
else
    (sleep 4 && start "http://localhost:3000/admin") &
fi

# Lancer le serveur de dev
pnpm dev
