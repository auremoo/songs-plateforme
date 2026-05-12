#!/bin/sh
set -e

PERSISTENT="/app/persistent"

# Initialize persistent storage on first deploy
if [ -d "$PERSISTENT" ]; then
  # Data (JSON files) — only on first deploy
  if [ ! -d "$PERSISTENT/data" ]; then
    cp -r /app/data "$PERSISTENT/data"
  fi

  # Images — init on first deploy, then sync new build files without overwriting
  if [ ! -d "$PERSISTENT/images" ]; then
    cp -r /app/public/images "$PERSISTENT/images"
  else
    # Copy new files from build that don't exist in persistent storage yet (e.g. CV)
    cp -rn /app/public/images/. "$PERSISTENT/images/" 2>/dev/null || true
  fi

  # Symlink so the app reads/writes to persistent volume
  rm -rf /app/data
  ln -sf "$PERSISTENT/data" /app/data

  # Symlink entire images dir into public/ for serving
  rm -rf /app/public/images
  ln -sf "$PERSISTENT/images" /app/public/images

  # Fonts directory
  mkdir -p "$PERSISTENT/fonts"
  rm -rf /app/public/fonts
  ln -sf "$PERSISTENT/fonts" /app/public/fonts

  echo "Persistent storage linked."
else
  echo "No persistent volume found, using ephemeral storage."
fi

exec node server.js
