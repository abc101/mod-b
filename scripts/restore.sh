#!/usr/bin/env bash
set -Eeuo pipefail

# ------------------------------------------------------------
# Mod-B restore script
#
# Usage:
#   ./scripts/restore.sh
#   ./scripts/restore.sh YYYYMMDD_HHMMSS
#   ./scripts/restore.sh -f compose.prod.yml
#   ./scripts/restore.sh -f compose.prod.yml YYYYMMDD_HHMMSS
#   ./scripts/restore.sh compose.prod.yml YYYYMMDD_HHMMSS
# ------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "$PROJECT_DIR"

ENV_FILE=".env"
BACKUP_DIR="./scripts/backups"

COMPOSE_FILE=""
BACKUP_DATE=""
APP_WAS_RUNNING="no"

show_usage() {
  echo "Usage:"
  echo "  ./scripts/restore.sh"
  echo "  ./scripts/restore.sh YYYYMMDD_HHMMSS"
  echo "  ./scripts/restore.sh -f compose.prod.yml"
  echo "  ./scripts/restore.sh -f compose.prod.yml YYYYMMDD_HHMMSS"
  echo "  ./scripts/restore.sh compose.prod.yml YYYYMMDD_HHMMSS"
}

select_compose_file() {
  local files=()
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

  echo ""
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

      COMPOSE_FILE="${files[$((choice - 1))]}"
      return
    fi

    echo "❌ Invalid selection. Enter a number between 1 and ${#files[@]}."
  done
}

select_backup_date() {
  local backup_files=()
  local backup_dates=()
  local choice=""

  while IFS= read -r file; do
    backup_files+=("$file")

    local basename
    basename="$(basename "$file")"

    backup_dates+=(
      "${basename#db_}"
    )
  done < <(
    find "$BACKUP_DIR" \
      -maxdepth 1 \
      -type f \
      -name "db_*.sql.gz" \
      | sort -r
  )

  if [ "${#backup_files[@]}" -eq 0 ]; then
    echo "❌ No database backups were found in:"
    echo "   $BACKUP_DIR"
    exit 1
  fi

  echo ""
  echo "Select a backup to restore:"
  echo ""

  local i
  for i in "${!backup_files[@]}"; do
    local date_value
    local file_size

    date_value="${backup_dates[$i]}"
    date_value="${date_value%.sql.gz}"

    file_size="$(du -h "${backup_files[$i]}" | awk '{print $1}')"

    printf "  %d) %s  (%s)\n" \
      "$((i + 1))" \
      "$date_value" \
      "$file_size"
  done

  echo ""

  while true; do
    read -r -p "Enter selection [1-${#backup_files[@]}]: " choice

    if [[ "$choice" =~ ^[0-9]+$ ]] &&
      [ "$choice" -ge 1 ] &&
      [ "$choice" -le "${#backup_files[@]}" ]; then

      BACKUP_DATE="${backup_dates[$((choice - 1))]}"
      BACKUP_DATE="${BACKUP_DATE%.sql.gz}"
      return
    fi

    echo "❌ Invalid selection. Enter a number between 1 and ${#backup_files[@]}."
  done
}

# ------------------------------------------------------------
# Parse arguments
# ------------------------------------------------------------

while [ "$#" -gt 0 ]; do
  case "$1" in
    -f | --file)
      if [ -z "${2:-}" ]; then
        echo "❌ A Compose file must follow $1."
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

    *.yml | *.yaml)
      if [ -n "$COMPOSE_FILE" ]; then
        echo "❌ More than one Compose file was provided."
        exit 1
      fi

      COMPOSE_FILE="$1"
      shift
      ;;

    *)
      if [ -n "$BACKUP_DATE" ]; then
        echo "❌ Unexpected argument: $1"
        show_usage
        exit 1
      fi

      BACKUP_DATE="$1"
      shift
      ;;
  esac
done

# ------------------------------------------------------------
# Select missing values interactively
# ------------------------------------------------------------

if [ -z "$COMPOSE_FILE" ]; then
  select_compose_file
fi

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "❌ Compose file not found:"
  echo "   $COMPOSE_FILE"
  exit 1
fi

if [ ! -d "$BACKUP_DIR" ]; then
  echo "❌ Backup directory not found:"
  echo "   $BACKUP_DIR"
  exit 1
fi

if [ -z "$BACKUP_DATE" ]; then
  select_backup_date
fi

COMPOSE=(docker compose -f "$COMPOSE_FILE")

# ------------------------------------------------------------
# Load environment
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

DB_BACKUP="${BACKUP_DIR}/db_${BACKUP_DATE}.sql.gz"
MEDIA_BACKUP="${BACKUP_DIR}/media_${BACKUP_DATE}.tar.gz"
PUBLIC_BACKUP="${BACKUP_DIR}/public_${BACKUP_DATE}.tar.gz"

if [ ! -f "$DB_BACKUP" ]; then
  echo "❌ Database backup not found:"
  echo "   $DB_BACKUP"
  exit 1
fi

if ! gzip -t "$DB_BACKUP"; then
  echo "❌ Database backup is not a valid gzip file:"
  echo "   $DB_BACKUP"
  exit 1
fi

# ------------------------------------------------------------
# Display restore summary
# ------------------------------------------------------------

echo ""
echo "========================================"
echo " Mod-B Restore"
echo "========================================"
echo "Compose file : $COMPOSE_FILE"
echo "Database     : $POSTGRES_DB"
echo "Backup date  : $BACKUP_DATE"
echo "DB backup    : $DB_BACKUP"

if [ -f "$MEDIA_BACKUP" ]; then
  echo "Media backup : $MEDIA_BACKUP"
else
  echo "Media backup : not found — will be skipped"
fi

if [ -f "$PUBLIC_BACKUP" ]; then
  echo "Public backup: $PUBLIC_BACKUP"
else
  echo "Public backup: not found — will be skipped"
fi

echo "========================================"
echo ""

# ------------------------------------------------------------
# Check Docker and PostgreSQL
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

echo "✅ PostgreSQL is ready."

# ------------------------------------------------------------
# Confirmation
# ------------------------------------------------------------

echo ""
echo "⚠️ WARNING"
echo "This operation will:"
echo "  1. Create a safety backup"
echo "  2. Stop the application"
echo "  3. DROP the current public schema"
echo "  4. Restore the selected database backup"
echo "  5. Replace media/public folders when backups exist"
echo ""

read -r -p "Type 'yes' to continue: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

# ------------------------------------------------------------
# Create safety backup
# ------------------------------------------------------------

echo ""
echo "📦 Creating a safety backup before restore..."

if [ ! -x "${SCRIPT_DIR}/backup.sh" ]; then
  echo "❌ backup.sh is not executable or was not found:"
  echo "   ${SCRIPT_DIR}/backup.sh"
  echo ""
  echo "Fix with:"
  echo "   chmod +x \"${SCRIPT_DIR}/backup.sh\""
  exit 1
fi

"${SCRIPT_DIR}/backup.sh" -f "$COMPOSE_FILE"

echo "✅ Safety backup completed."

# ------------------------------------------------------------
# Stop app before database replacement
# ------------------------------------------------------------

if "${COMPOSE[@]}" config --services | grep -qx "app"; then
  if "${COMPOSE[@]}" ps --status running --services | grep -qx "app"; then
    APP_WAS_RUNNING="yes"

    echo ""
    echo "⏸️ Stopping application..."
    "${COMPOSE[@]}" stop app
  fi
fi

# ------------------------------------------------------------
# Reset database schema
# ------------------------------------------------------------

echo ""
echo "🧹 Resetting database schema..."

"${COMPOSE[@]}" exec -T db \
  psql \
  -v ON_ERROR_STOP=1 \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  -c "
    DROP SCHEMA IF EXISTS public CASCADE;
    CREATE SCHEMA public AUTHORIZATION \"$POSTGRES_USER\";
    GRANT ALL ON SCHEMA public TO \"$POSTGRES_USER\";
    GRANT ALL ON SCHEMA public TO public;
  "

echo "✅ Database schema reset."

# ------------------------------------------------------------
# Restore database
# ------------------------------------------------------------

echo ""
echo "♻️ Restoring PostgreSQL database..."

gunzip -c "$DB_BACKUP" |
  "${COMPOSE[@]}" exec -T db \
    psql \
    -v ON_ERROR_STOP=1 \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB"

echo "✅ Database SQL restore completed."

# ------------------------------------------------------------
# Verify database
# ------------------------------------------------------------

echo ""
echo "🔍 Verifying restored database..."

TABLE_COUNT="$(
  "${COMPOSE[@]}" exec -T db \
    psql \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -tAc "
      SELECT count(*)
      FROM information_schema.tables
      WHERE table_schema = 'public';
    "
)"

TABLE_COUNT="$(echo "$TABLE_COUNT" | tr -d '[:space:]')"

if ! [[ "$TABLE_COUNT" =~ ^[0-9]+$ ]]; then
  echo "❌ Could not verify the restored database."
  echo "   Received table count: $TABLE_COUNT"
  exit 1
fi

if [ "$TABLE_COUNT" -eq 0 ]; then
  echo "❌ Restore completed, but no public tables were found."
  echo "The application will remain stopped for safety."
  exit 1
fi

echo "✅ Restored public tables: $TABLE_COUNT"

# ------------------------------------------------------------
# Restore media directory
# ------------------------------------------------------------

if [ -f "$MEDIA_BACKUP" ]; then
  echo ""
  echo "🖼️ Restoring media files..."

  rm -rf ./media
  tar -xzf "$MEDIA_BACKUP" -C "$PROJECT_DIR"

  if [ ! -d "./media" ]; then
    echo "❌ Media archive was extracted, but ./media was not created."
    exit 1
  fi

  echo "✅ Media files restored."
else
  echo ""
  echo "⚠️ Media backup not found. Skipping media restore:"
  echo "   $MEDIA_BACKUP"
fi

# ------------------------------------------------------------
# Restore public directory
# ------------------------------------------------------------

if [ -f "$PUBLIC_BACKUP" ]; then
  echo ""
  echo "🗂️ Restoring public files..."

  rm -rf ./public
  tar -xzf "$PUBLIC_BACKUP" -C "$PROJECT_DIR"

  if [ ! -d "./public" ]; then
    echo "❌ Public archive was extracted, but ./public was not created."
    exit 1
  fi

  echo "✅ Public files restored."
else
  echo ""
  echo "⚠️ Public backup not found. Skipping public restore:"
  echo "   $PUBLIC_BACKUP"
fi

# ------------------------------------------------------------
# Start application
# ------------------------------------------------------------

if "${COMPOSE[@]}" config --services | grep -qx "app"; then
  echo ""
  echo "🚀 Starting application..."

  "${COMPOSE[@]}" up -d app

  echo "✅ Application started."
fi

# ------------------------------------------------------------
# Summary
# ------------------------------------------------------------

echo ""
echo "========================================"
echo " Restore completed"
echo "========================================"
echo "Compose file    : $COMPOSE_FILE"
echo "Database backup : $DB_BACKUP"
echo "Restored tables : $TABLE_COUNT"

if [ -f "$MEDIA_BACKUP" ]; then
  echo "Media           : restored"
else
  echo "Media           : skipped"
fi

if [ -f "$PUBLIC_BACKUP" ]; then
  echo "Public          : restored"
else
  echo "Public          : skipped"
fi

echo "========================================"