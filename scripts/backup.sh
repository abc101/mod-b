#!/usr/bin/env bash
set -Eeuo pipefail

# ------------------------------------------------------------
# Mod-B backup script
#
# Usage:
#   ./backup.sh
#   ./backup.sh compose.prod.yml
#   ./backup.sh -f compose.prod.yml
#   ./backup.sh --file compose.prod.yml
# ------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "$PROJECT_DIR"

ENV_FILE=".env"
BACKUP_DIR="./scripts/backups"
DATE="$(date +%Y%m%d_%H%M%S)"

COMPOSE_FILE=""

show_usage() {
  echo "Usage:"
  echo "  ./backup.sh"
  echo "  ./backup.sh compose.prod.yml"
  echo "  ./backup.sh -f compose.prod.yml"
  echo "  ./backup.sh --file compose.prod.yml"
}

select_compose_file() {
  local files=()
  local selected=""
  local choice=""

  while IFS= read -r file; do
    files+=("$file")
  done < <(
    find . \
      -maxdepth 1 \
      -type f \
      \( \
        -name "compose*.yml" \
        -o -name "compose*.yaml" \
        -o -name "docker-compose*.yml" \
        -o -name "docker-compose*.yaml" \
      \) \
      -printf "%f\n" \
      | sort
  )

  if [ "${#files[@]}" -eq 0 ]; then
    echo "❌ No Docker Compose YAML files were found in:"
    echo "   $PROJECT_DIR"
    exit 1
  fi

  if [ "${#files[@]}" -eq 1 ]; then
    COMPOSE_FILE="${files[0]}"
    echo "ℹ️ Using the only Compose file found: $COMPOSE_FILE"
    return
  fi

  echo "Select the Docker Compose file to use:"
  echo ""

  local i
  for i in "${!files[@]}"; do
    printf "  %d) %s\n" "$((i + 1))" "${files[$i]}"
  done

  echo ""

  while true; do
    read -r -p "Enter selection [1-${#files[@]}]: " choice

    if [[ "$choice" =~ ^[0-9]+$ ]] &&
      [ "$choice" -ge 1 ] &&
      [ "$choice" -le "${#files[@]}" ]; then

      selected="${files[$((choice - 1))]}"
      COMPOSE_FILE="$selected"
      break
    fi

    echo "❌ Invalid selection. Please enter a number between 1 and ${#files[@]}."
  done
}

# ------------------------------------------------------------
# Read arguments
# ------------------------------------------------------------

case "${1:-}" in
  -f | --file)
    if [ -z "${2:-}" ]; then
      echo "❌ A Compose file must be provided after $1."
      show_usage
      exit 1
    fi

    COMPOSE_FILE="$2"
    shift 2
    ;;

  -h | --help)
    show_usage
    exit 0
    ;;

  "")
    select_compose_file
    ;;

  *)
    COMPOSE_FILE="$1"
    shift
    ;;
esac

if [ "$#" -gt 0 ]; then
  echo "❌ Unexpected argument: $1"
  show_usage
  exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "❌ Compose file not found:"
  echo "   $COMPOSE_FILE"
  exit 1
fi

COMPOSE=(docker compose -f "$COMPOSE_FILE")

# ------------------------------------------------------------
# Load environment variables
# ------------------------------------------------------------

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
else
  echo "❌ .env file not found:"
  echo "   $PROJECT_DIR/$ENV_FILE"
  exit 1
fi

required_variables=(
  POSTGRES_USER
  POSTGRES_DB
)

for variable in "${required_variables[@]}"; do
  if [ -z "${!variable:-}" ]; then
    echo "❌ Required environment variable is missing: $variable"
    exit 1
  fi
done

DB_BACKUP="${BACKUP_DIR}/db_${DATE}.sql.gz"
MEDIA_BACKUP="${BACKUP_DIR}/media_${DATE}.tar.gz"
PUBLIC_BACKUP="${BACKUP_DIR}/public_${DATE}.tar.gz"

mkdir -p "$BACKUP_DIR"

echo ""
echo "========================================"
echo " Mod-B Backup"
echo "========================================"
echo "Compose file : $COMPOSE_FILE"
echo "Database     : $POSTGRES_DB"
echo "Backup date  : $DATE"
echo "Backup path  : $BACKUP_DIR"
echo "========================================"
echo ""

# ------------------------------------------------------------
# Check Docker and database
# ------------------------------------------------------------

echo "🔍 Checking Docker Compose configuration..."

if ! "${COMPOSE[@]}" config --services | grep -qx "db"; then
  echo "❌ The selected Compose file does not define a 'db' service."
  echo "   Compose file: $COMPOSE_FILE"
  exit 1
fi

if ! "${COMPOSE[@]}" ps --status running --services | grep -qx "db"; then
  echo "❌ The database service is not running."
  echo ""
  echo "Try:"
  echo "  docker compose -f \"$COMPOSE_FILE\" up -d db"
  exit 1
fi

if ! "${COMPOSE[@]}" exec -T db \
  pg_isready \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" >/dev/null 2>&1; then

  echo "❌ PostgreSQL is unavailable or not ready."
  echo ""
  echo "Try:"
  echo "  docker compose -f \"$COMPOSE_FILE\" up -d db"
  exit 1
fi

echo "✅ Database connection OK."

# ------------------------------------------------------------
# Back up PostgreSQL
# ------------------------------------------------------------

echo ""
echo "📦 Backing up PostgreSQL database..."

"${COMPOSE[@]}" exec -T db \
  pg_dump \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  | gzip >"$DB_BACKUP"

if [ ! -s "$DB_BACKUP" ]; then
  echo "❌ The database backup file is empty."
  rm -f "$DB_BACKUP"
  exit 1
fi

if ! gzip -t "$DB_BACKUP"; then
  echo "❌ The database backup gzip file is invalid."
  rm -f "$DB_BACKUP"
  exit 1
fi

echo "✅ DB backup created:"
echo "   $DB_BACKUP"

# ------------------------------------------------------------
# Back up public files
# ------------------------------------------------------------

echo ""
echo "🗂️ Backing up public files..."

if [ -d "./public" ]; then
  tar -czf "$PUBLIC_BACKUP" public

  if [ -s "$PUBLIC_BACKUP" ]; then
    echo "✅ Public backup created:"
    echo "   $PUBLIC_BACKUP"
  else
    echo "❌ Public backup creation failed."
    rm -f "$PUBLIC_BACKUP"
    exit 1
  fi
else
  echo "⚠️ ./public directory not found. Skipping public backup."
fi

# ------------------------------------------------------------
# Back up media files
# ------------------------------------------------------------

echo ""
echo "🖼️ Backing up media files..."

if [ -d "./media" ]; then
  tar -czf "$MEDIA_BACKUP" media

  if [ -s "$MEDIA_BACKUP" ]; then
    echo "✅ Media backup created:"
    echo "   $MEDIA_BACKUP"
  else
    echo "❌ Media backup creation failed."
    rm -f "$MEDIA_BACKUP"
    exit 1
  fi
else
  echo "⚠️ ./media directory not found. Skipping media backup."
fi

# ------------------------------------------------------------
# Remove old backups
# ------------------------------------------------------------

echo ""
echo "🧹 Removing backups older than 7 days..."

find "$BACKUP_DIR" \
  -type f \
  \( \
    -name "db_*.sql.gz" \
    -o -name "media_*.tar.gz" \
    -o -name "public_*.tar.gz" \
  \) \
  -mtime +7 \
  -delete

# ------------------------------------------------------------
# Summary
# ------------------------------------------------------------

echo ""
echo "========================================"
echo " Backup completed"
echo "========================================"
echo "Compose file : $COMPOSE_FILE"
echo "Database     : $DB_BACKUP"

if [ -f "$MEDIA_BACKUP" ]; then
  echo "Media        : $MEDIA_BACKUP"
else
  echo "Media        : skipped"
fi

if [ -f "$PUBLIC_BACKUP" ]; then
  echo "Public       : $PUBLIC_BACKUP"
else
  echo "Public       : skipped"
fi

echo "========================================"