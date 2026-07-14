#!/usr/bin/env bash
set -Eeuo pipefail

# Mod-B backup script
#
# Usage:
#   ./scripts/backup.sh
#   ./scripts/backup.sh -f compose.prod.yml
#   ./scripts/backup.sh --restore-safety -f compose.prod.yml

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "$PROJECT_DIR"

ENV_FILE=".env"
COMPOSE_FILE=""
BACKUP_MODE="normal"

show_usage() {
  cat <<'EOF'
Usage:
  ./scripts/backup.sh
  ./scripts/backup.sh -f compose.prod.yml
  ./scripts/backup.sh --restore-safety -f compose.prod.yml

Options:
  -f, --file FILE       Docker Compose YAML file
  --restore-safety      Save under scripts/backups/restore-safety
  -h, --help            Show help
EOF
}

select_compose_file() {
  local files=()
  local choice

  while IFS= read -r file; do
    files+=("$file")
  done < <(
    find . -maxdepth 1 -type f \
      \( -name "compose*.yml" -o -name "compose*.yaml" \
         -o -name "docker-compose*.yml" -o -name "docker-compose*.yaml" \) \
      -printf "%f\n" | sort
  )

  if [ "${#files[@]}" -eq 0 ]; then
    echo "❌ No Docker Compose file found in: $PROJECT_DIR"
    exit 1
  fi

  if [ "${#files[@]}" -eq 1 ]; then
    COMPOSE_FILE="${files[0]}"
    echo "ℹ️ Using Compose file: $COMPOSE_FILE"
    return
  fi

  echo "Select a Docker Compose file:"
  for i in "${!files[@]}"; do
    printf "  %d) %s\n" "$((i + 1))" "${files[$i]}"
  done

  while true; do
    read -r -p "Selection [1-${#files[@]}]: " choice
    if [[ "$choice" =~ ^[0-9]+$ ]] \
      && [ "$choice" -ge 1 ] \
      && [ "$choice" -le "${#files[@]}" ]; then
      COMPOSE_FILE="${files[$((choice - 1))]}"
      return
    fi
    echo "❌ Invalid selection."
  done
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    -f|--file)
      [ -n "${2:-}" ] || { echo "❌ Missing Compose file."; exit 1; }
      COMPOSE_FILE="$2"
      shift 2
      ;;
    --restore-safety)
      BACKUP_MODE="restore-safety"
      shift
      ;;
    -h|--help)
      show_usage
      exit 0
      ;;
    *)
      echo "❌ Unknown option: $1"
      show_usage
      exit 1
      ;;
  esac
done

[ -n "$COMPOSE_FILE" ] || select_compose_file
[ -f "$COMPOSE_FILE" ] || { echo "❌ Compose file not found: $COMPOSE_FILE"; exit 1; }

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
else
  echo "❌ .env file not found: $PROJECT_DIR/$ENV_FILE"
  exit 1
fi

extract_database_name() {
  local url="${1:-}"

  if [ -z "$url" ]; then
    return 1
  fi

  url="${url%%\?*}"
  url="${url%/}"

  printf '%s\n' "${url##*/}"
}

validate_database_target() {
  local app_database_url=""
  local app_database_name=""

  if [ -n "${DATABASE_URI:-}" ]; then
    app_database_url="$DATABASE_URI"
  elif [ -n "${DATABASE_URL:-}" ]; then
    app_database_url="$DATABASE_URL"
  else
    echo "⚠️ DATABASE_URI and DATABASE_URL are not set."
    echo "   Backup/restore will use POSTGRES_DB=$POSTGRES_DB"
    return
  fi

  app_database_name="$(extract_database_name "$app_database_url")"

  echo ""
  echo "🔍 Checking database configuration..."
  echo "   POSTGRES_DB : $POSTGRES_DB"
  echo "   App DB name : $app_database_name"

  if [ "$POSTGRES_DB" != "$app_database_name" ]; then
    echo ""
    echo "❌ Database name mismatch."
    echo "   POSTGRES_DB points to: $POSTGRES_DB"
    echo "   The application points to: $app_database_name"
    echo ""
    echo "Update .env so both values use the same database."
    exit 1
  fi

  echo "✅ Database names match."
}

: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"

DATE="$(date +%Y%m%d_%H%M%S)"

if [ "$BACKUP_MODE" = "restore-safety" ]; then
  BACKUP_DIR="./scripts/backups/restore-safety"
  PREFIX="before_restore_"
else
  BACKUP_DIR="./scripts/backups"
  PREFIX=""
fi

DB_BACKUP="${BACKUP_DIR}/db_${PREFIX}${DATE}.sql.gz"
MEDIA_BACKUP="${BACKUP_DIR}/media_${PREFIX}${DATE}.tar.gz"
PUBLIC_BACKUP="${BACKUP_DIR}/public_${PREFIX}${DATE}.tar.gz"

mkdir -p "$BACKUP_DIR"
COMPOSE=(docker compose -f "$COMPOSE_FILE")

echo "🔍 Checking Docker Compose..."

"${COMPOSE[@]}" config --services | grep -qx "db" || {
  echo "❌ The selected Compose file does not define a db service."
  exit 1
}

"${COMPOSE[@]}" ps --status running --services | grep -qx "db" || {
  echo "❌ The db service is not running."
  echo "Run: docker compose -f \"$COMPOSE_FILE\" up -d db"
  exit 1
}

"${COMPOSE[@]}" exec -T db \
  pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null || {
  echo "❌ PostgreSQL is not ready."
  exit 1
}

echo "📦 Backing up PostgreSQL..."

"${COMPOSE[@]}" exec -T db \
  pg_dump \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
  | gzip > "$DB_BACKUP"

gzip -t "$DB_BACKUP" || {
  rm -f "$DB_BACKUP"
  echo "❌ Database backup validation failed."
  exit 1
}

echo "✅ Database: $DB_BACKUP"

if [ -d "./media" ]; then
  echo "🖼️ Backing up media..."
  tar -czf "$MEDIA_BACKUP" media
  tar -tzf "$MEDIA_BACKUP" >/dev/null || {
    rm -f "$MEDIA_BACKUP"
    echo "❌ Media backup validation failed."
    exit 1
  }
  echo "✅ Media: $MEDIA_BACKUP"
else
  echo "⚠️ ./media not found. Skipped."
fi

if [ -d "./public" ]; then
  echo "🗂️ Backing up public..."
  tar -czf "$PUBLIC_BACKUP" public
  tar -tzf "$PUBLIC_BACKUP" >/dev/null || {
    rm -f "$PUBLIC_BACKUP"
    echo "❌ Public backup validation failed."
    exit 1
  }
  echo "✅ Public: $PUBLIC_BACKUP"
else
  echo "⚠️ ./public not found. Skipped."
fi

if [ "$BACKUP_MODE" = "restore-safety" ]; then
  find "$BACKUP_DIR" -type f -name "*.gz" -mtime +14 -delete
else
  find "$BACKUP_DIR" -maxdepth 1 -type f -name "*.gz" -mtime +7 -delete
fi

echo "🎉 Backup completed."