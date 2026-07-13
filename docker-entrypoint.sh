#!/bin/sh
set -e

APP_DIR="/home/node/app"
MEDIA_DIR="$APP_DIR/media"

echo "🔧 Preparing media directory..."

mkdir -p "$MEDIA_DIR"

chown -R node:node "$MEDIA_DIR"
chmod -R u+rwX,g+rwX "$MEDIA_DIR"

echo "✅ Media directory is ready."

cd "$APP_DIR"

exec gosu node "$@"