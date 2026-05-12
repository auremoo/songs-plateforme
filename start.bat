@echo off
chcp 65001 >nul 2>&1
title Portfolio Margot Tournier

echo.
echo   ┌─────────────────────────────────────────┐
echo   │  Portfolio Margot Tournier               │
echo   │  Demarrage en cours...                   │
echo   └─────────────────────────────────────────┘
echo.

cd /d "%~dp0"

:: Verifier que Node.js est installe
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo   Node.js n'est pas installe.
    echo.
    echo   Pour l'installer :
    echo   1. Va sur https://nodejs.org
    echo   2. Telecharge la version LTS
    echo   3. Installe-la
    echo   4. Relance ce fichier
    echo.
    pause
    exit /b 1
)

:: Verifier que pnpm est installe
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo   Installation de pnpm...
    call npm install -g pnpm
    if %errorlevel% neq 0 (
        echo   Impossible d'installer pnpm.
        pause
        exit /b 1
    )
)

:: Installer les dependances si necessaire
if not exist "node_modules" (
    echo   Premiere utilisation : installation des dependances...
    echo   (ca peut prendre 1-2 minutes^)
    echo.
    call pnpm install
    if %errorlevel% neq 0 (
        echo.
        echo   Erreur lors de l'installation.
        pause
        exit /b 1
    )
    echo.
)

echo   Serveur en cours de demarrage...
echo.
echo   ┌─────────────────────────────────────────┐
echo   │                                         │
echo   │  Site : http://localhost:3000            │
echo   │  Admin : http://localhost:3000/admin     │
echo   │                                         │
echo   │  Pour arreter : fermer cette fenetre     │
echo   │                                         │
echo   └─────────────────────────────────────────┘
echo.

:: Ouvrir le navigateur apres un court delai
start "" /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000/admin"

:: Lancer le serveur de dev
call pnpm dev
