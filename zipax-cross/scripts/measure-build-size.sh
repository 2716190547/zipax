#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_PATH="${1:-$HOME/Applications/zipax.app}"

bytes() {
  local path="$1"
  if [[ -e "$path" ]]; then
    stat -f%z "$path"
  else
    printf '0'
  fi
}

human() {
  local value="$1"
  awk -v bytes="$value" '
    BEGIN {
      if (bytes >= 1073741824) {
        printf "%.1f GB", bytes / 1073741824
      } else if (bytes >= 1048576) {
        printf "%.1f MB", bytes / 1048576
      } else if (bytes >= 1024) {
        printf "%.1f KB", bytes / 1024
      } else {
        printf "%d B", bytes
      }
    }
  '
}

print_size() {
  local label="$1"
  local path="$2"
  if [[ -e "$path" ]]; then
    local value
    if [[ -d "$path" ]]; then
      value="$(du -sk "$path" | awk '{ print $1 * 1024 }')"
    else
      value="$(bytes "$path")"
    fi
    printf "%-20s %10s  %s\n" "$label" "$(human "$value")" "$path"
  else
    printf "%-20s %10s  %s\n" "$label" "missing" "$path"
  fi
}

VERSION="$(node -p "require('$PROJECT_DIR/package.json').version")"
BIN="$PROJECT_DIR/target/release/zipax-app"
DMG="$PROJECT_DIR/target/release/bundle/dmg/zipax_${VERSION}_aarch64.dmg"
UPDATER="$PROJECT_DIR/target/release/bundle/macos/zipax.app.tar.gz"
SIGNATURE="$PROJECT_DIR/target/release/bundle/macos/zipax.app.tar.gz.sig"

echo "zipax build size report"
echo "version: $VERSION"
echo
print_size "installed app" "$APP_PATH"
print_size "release binary" "$BIN"
print_size "dmg" "$DMG"
print_size "updater tar" "$UPDATER"
print_size "updater sig" "$SIGNATURE"
