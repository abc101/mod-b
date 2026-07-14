#!/usr/bin/env bash
set -Eeuo pipefail

# Mod-B restore script
#
# Usage:
#   ./scripts/restore.sh
#   ./scripts/restore.sh -f compose.prod.yml
#   ./scripts/restore.sh --include-safety
#   ./scripts/restore.sh --source normal
#   ./scripts/restore.sh --source safety
#   ./scripts/restore.sh -f compose.prod.yml --source safety

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "$PROJECT_DIR"

ENV_FILE=".env"
NORMAL_BACKUP_DIR="./scripts/backups"
SAFETY_BACKUP_DIR="./scripts/backups/restore-safety"

COMPOSE_FILE=""
BACKUP_SOURCE="normal"
BACKUP_DATE=""
CREATE_SAFETY_BACKUP="ask"

show_usage() {
  cat <<'EOF'
Usage:
  ./scripts/restore.sh
  ./scripts/restore.sh -f compose.prod.yml
  ./scripts/restore.sh --source normal
  ./scripts/restore.sh --source safety
  ./scripts/restore.sh --include-safety
  ./scripts/restore.sh -f compose.prod.yml --source safety

Options:
  -f, --file FILE       Docker Compose YAML file
  --source normal       Restore from scripts/backups
  --source safety       Restore from scripts/backups/restore-safety
  --include-safety      Show both normal and safety backups
  --date TIMESTAMP      Restore a specific timestamp
  --safety-backup       Always create a pre-restore safety backup
  --no-safety-backup    Do not create a pre-restore safety backup
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

select_backup() {
  local files=()
  local labels=()
  local choice
  local file
  local base
  local stamp
  local size

  if [ "$BACKUP_SOURCE" = "normal" ] || [ "$BACKUP_SOURCE" = "all" ]; then
    while IFS= read -r file; do
      files+=("$file")
      labels+=("normal")
    done < <(
      find "$NORMAL_BACKUP_DIR" -maxdepth 1 -type f \
        -name "db_*.sql.gz" | sort -r
    )
  fi

  if [ "$BACKUP_SOURCE" = "safety" ] || [ "$BACKUP_SOURCE" = "all" ]; then
    if [ -d "$SAFETY_BACKUP_DIR" ]; then
      while IFS= read -r file; do
        files+=("$file")
        labels+=("safety")
      done < <(
        find "$SAFETY_BACKUP_DIR" -maxdepth 1 -type f \
          -name "db_before_restore_*.sql.gz" | sort -r
      )
    fi
  fi

  if [ "${#files[@]}" -eq 0 ]; then
    echo "❌ No matching backups found."
    exit 1
  fi

  echo "Select a backup:"
  for i in "${!files[@]}"; do
    base="$(basename "${files[$i]}")"
    stamp="${base#db_}"
    stamp="${stamp#before_restore_}"
    stamp="${stamp%.sql.gz}"
    size="$(du -h "${files[$i]}" | awk '{print $1}')"
    printf "  %d) [%s] %s (%s)\n" \
      "$((i + 1))" "${labels[$i]}" "$stamp" "$size"
  done

  while true; do
    read -r -p "Selection [1-${#files[@]}]: " choice
    if [[ "$choice" =~ ^[0-9]+$ ]] \
      && [ "$choice" -ge 1 ] \
      && [ "$choice" -le "${#files[@]}" ]; then
      SELECTED_DB_BACKUP="${files[$((choice - 1))]}"
      SELECTED_SOURCE="${labels[$((choice - 1))]}"
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
    --source)
      [ -n "${2:-}" ] || { echo "❌ Missing source."; exit 1; }
      case "$2" in
        normal|safety|all) BACKUP_SOURCE="$2" ;;
        *) echo "❌ Source must be normal, safety, or all."; exit 1 ;;
      esac
      shift 2
      ;;
    --include-safety)
      BACKUP_SOURCE="all"
      shift
      ;;
    --date)
      [ -n "${2:-}" ] || { echo "❌ Missing timestamp."; exit 1; }
      BACKUP_DATE="$2"
      shift 2
      ;;
    --safety-backup)
      CREATE_SAFETY_BACKUP="yes"
      shift
      ;;
    --no-safety-backup)
      CREATE_SAFETY_BACKUP="no"
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

if [ -n "$BACKUP_DATE" ]; then
  case "$BACKUP_SOURCE" in
    normal)
      SELECTED_DB_BACKUP="${NORMAL_BACKUP_DIR}/db_${BACKUP_DATE}.sql.gz"
      SELECTED_SOURCE="normal"
      ;;
    safety)
      SELECTED_DB_BACKUP="${SAFETY_BACKUP_DIR}/db_before_restore_${BACKUP_DATE}.sql.gz"
      SELECTED_SOURCE="safety"
      ;;
    all)
      if [ -f "${NORMAL_BACKUP_DIR}/db_${BACKUP_DATE}.sql.gz" ]; then
        SELECTED_DB_BACKUP="${NORMAL_BACKUP_DIR}/db_${BACKUP_DATE}.sql.gz"
        SELECTED_SOURCE="normal"
      elif [ -f "${SAFETY_BACKUP_DIR}/db_before_restore_${BACKUP_DATE}.sql.gz" ]; then
        SELECTED_DB_BACKUP="${SAFETY_BACKUP_DIR}/db_before_restore_${BACKUP_DATE}.sql.gz"
        SELECTED_SOURCE="safety"
      else
        echo "❌ Backup not found for timestamp: $BACKUP_DATE"
        exit 1
      fi
      ;;
  esac
else
  select_backup
fi

[ -f "$SELECTED_DB_BACKUP" ] || {
  echo "❌ Database backup not found: $SELECTED_DB_BACKUP"
  exit 1
}

gzip -t "$SELECTED_DB_BACKUP" || {
  echo "❌ Database backup is corrupted: $SELECTED_DB_BACKUP"
  exit 1
}

BASE_NAME="$(basename "$SELECTED_DB_BACKUP")"
STAMP="${BASE_NAME#db_}"
STAMP="${STAMP#before_restore_}"
STAMP="${STAMP%.sql.gz}"

if [ "$SELECTED_SOURCE" = "safety" ]; then
  BACKUP_DIR="$SAFETY_BACKUP_DIR"
  PREFIX="before_restore_"
else
  BACKUP_DIR="$NORMAL_BACKUP_DIR"
  PREFIX=""
fi

MEDIA_BACKUP="${BACKUP_DIR}/media_${PREFIX}${STAMP}.tar.gz"
PUBLIC_BACKUP="${BACKUP_DIR}/public_${PREFIX}${STAMP}.tar.gz"

COMPOSE=(docker compose -f "$COMPOSE_FILE")

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

echo ""
echo "========================================"
echo " Mod-B Restore"
echo "========================================"
echo "Compose : $COMPOSE_FILE"
echo "Source  : $SELECTED_SOURCE"
echo "Database: $SELECTED_DB_BACKUP"
echo "Media   : $([ -f "$MEDIA_BACKUP" ] && echo "$MEDIA_BACKUP" || echo "not found")"
echo "Public  : $([ -f "$PUBLIC_BACKUP" ] && echo "$PUBLIC_BACKUP" || echo "not found")"
echo "========================================"
echo ""

read -r -p "Type 'yes' to continue: " CONFIRM
[ "$CONFIRM" = "yes" ] || { echo "Cancelled."; exit 0; }

if [ "$CREATE_SAFETY_BACKUP" = "ask" ]; then
  read -r -p "Create a safety backup before restore? (yes/no): " CREATE_SAFETY_BACKUP
fi

if [ "$CREATE_SAFETY_BACKUP" = "yes" ]; then
  echo "📦 Creating pre-restore safety backup..."
  "${SCRIPT_DIR}/backup.sh" --restore-safety -f "$COMPOSE_FILE"
fi

APP_WAS_RUNNING="no"

if "${COMPOSE[@]}" config --services | grep -qx "app" \
  && "${COMPOSE[@]}" ps --status running --services | grep -qx "app"; then
  APP_WAS_RUNNING="yes"
  echo "⏸️ Stopping app..."
  "${COMPOSE[@]}" stop app
fi

echo "🧹 Resetting public schema..."

"${COMPOSE[@]}" exec -T db \
  psql \
    -v ON_ERROR_STOP=1 \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public AUTHORIZATION \"$POSTGRES_USER\";"

echo "♻️ Restoring database..."

gunzip -c "$SELECTED_DB_BACKUP" \
  | "${COMPOSE[@]}" exec -T db \
      psql \
        -v ON_ERROR_STOP=1 \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB"

TABLE_COUNT="$(
  "${COMPOSE[@]}" exec -T db \
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';"
)"
TABLE_COUNT="$(echo "$TABLE_COUNT" | tr -d '[:space:]')"

if ! [[ "$TABLE_COUNT" =~ ^[0-9]+$ ]] || [ "$TABLE_COUNT" -eq 0 ]; then
  echo "❌ Restore verification failed. App remains stopped."
  exit 1
fi

echo "✅ Restored tables: $TABLE_COUNT"

if [ -f "$MEDIA_BACKUP" ]; then
  tar -tzf "$MEDIA_BACKUP" >/dev/null || {
    echo "❌ Media backup is corrupted."
    exit 1
  }
  rm -rf ./media
  tar -xzf "$MEDIA_BACKUP" -C "$PROJECT_DIR"
  echo "✅ Media restored."
fi

if [ -f "$PUBLIC_BACKUP" ]; then
  tar -tzf "$PUBLIC_BACKUP" >/dev/null || {
    echo "❌ Public backup is corrupted."
    exit 1
  }
  rm -rf ./public
  tar -xzf "$PUBLIC_BACKUP" -C "$PROJECT_DIR"
  echo "✅ Public restored."
fi

if "${COMPOSE[@]}" config --services | grep -qx "app"; then
  echo "🚀 Starting app..."
  "${COMPOSE[@]}" up -d app
fi

echo "🎉 Restore completed."
