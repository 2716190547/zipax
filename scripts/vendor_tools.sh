#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOOLS_DIR="$ROOT_DIR/Resources/Tools"
BIN_DIR="$TOOLS_DIR/bin"
LIB_DIR="$TOOLS_DIR/lib"
SHARE_DIR="$TOOLS_DIR/share"

mkdir -p "$BIN_DIR" "$LIB_DIR" "$SHARE_DIR"
rm -rf "$BIN_DIR" "$LIB_DIR" "$SHARE_DIR"
mkdir -p "$BIN_DIR" "$LIB_DIR" "$SHARE_DIR"

copy_binary() {
  local name="$1"
  local source
  source="$(command -v "$name")"
  cp "$source" "$BIN_DIR/$name"
  chmod +x "$BIN_DIR/$name"
}

is_system_library() {
  local path="$1"
  [[ "$path" == /usr/lib/* || "$path" == /System/* ]]
}

resolve_dependency() {
  local dependency="$1"
  local loader="$2"

  if [[ "$dependency" == @rpath/* ]]; then
    local name="${dependency##*/}"
    local homebrew_match
    homebrew_match="$(find /opt/homebrew/lib /opt/homebrew/opt /opt/homebrew/Cellar -path "*/lib/$name" -print -quit 2>/dev/null || true)"
    if [[ -n "$homebrew_match" ]]; then
      printf '%s\n' "$homebrew_match"
      return
    fi
  fi

  if [[ "$dependency" == @loader_path/* ]]; then
    local base
    base="$(dirname "$loader")"
    printf '%s\n' "$base/${dependency#@loader_path/}"
    return
  fi

  printf '%s\n' "$dependency"
}

copy_library_tree() {
  local item="$1"
  local changed=1

  while [[ "$changed" -eq 1 ]]; do
    changed=0
    while IFS= read -r dependency; do
      local resolved name target
      resolved="$(resolve_dependency "$dependency" "$item")"
      is_system_library "$resolved" && continue
      [[ -f "$resolved" ]] || continue

      name="$(basename "$resolved")"
      target="$LIB_DIR/$name"
      if [[ ! -f "$target" ]]; then
        cp "$resolved" "$target"
        chmod u+w "$target"
        changed=1
      fi
    done < <(find "$BIN_DIR" "$LIB_DIR" \( -type f -perm +111 -o -name '*.dylib' \) | while read -r binary; do
      otool -L "$binary" | awk 'NR > 1 { print $1 }'
    done | sort -u)
  done
}

rewrite_links() {
  while IFS= read -r binary; do
    chmod u+w "$binary"
    while IFS= read -r dependency; do
      local resolved name replacement
      resolved="$(resolve_dependency "$dependency" "$binary")"
      is_system_library "$resolved" && continue
      [[ -f "$resolved" ]] || continue

      name="$(basename "$resolved")"
      replacement="@loader_path/../lib/$name"
      install_name_tool -change "$dependency" "$replacement" "$binary" 2>/dev/null || true
    done < <(otool -L "$binary" | awk 'NR > 1 { print $1 }')

    if [[ "$binary" == *.dylib ]]; then
      install_name_tool -id "@loader_path/../lib/$(basename "$binary")" "$binary" 2>/dev/null || true
    fi
  done < <(find "$BIN_DIR" "$LIB_DIR" \( -type f -perm +111 -o -name '*.dylib' \))
}

copy_binary pngquant
copy_binary cwebp
copy_binary gs
copy_library_tree "$BIN_DIR/pngquant"
rewrite_links

if [[ -d /opt/homebrew/opt/ghostscript/share/ghostscript ]]; then
  cp -R /opt/homebrew/opt/ghostscript/share/ghostscript "$SHARE_DIR/"
fi

codesign --force --sign - "$BIN_DIR"/* "$LIB_DIR"/*.dylib

echo "$TOOLS_DIR"
