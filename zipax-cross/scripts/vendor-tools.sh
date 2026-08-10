#!/usr/bin/env bash
# ============================================================================
# vendor-tools.sh — Bundle Ghostscript into app resources for Tauri builds
#
# Copies the Ghostscript binary and its required resources into
# src-tauri/gs-resources/ so that Tauri can bundle them with the app.
#
# Run BEFORE `npx tauri build`. Works on macOS (Homebrew) and Linux (apt).
# On Windows, install Ghostscript via Chocolatey first.
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
RESOURCE_DIR="$PROJECT_DIR/src-tauri/gs-resources"

BIN_DIR="$RESOURCE_DIR/bin"
LIB_DIR="$RESOURCE_DIR/lib"
SHARE_DIR="$RESOURCE_DIR/share"

echo "vendor-tools: bundling Ghostscript into $RESOURCE_DIR"

rm -rf "$RESOURCE_DIR"
mkdir -p "$BIN_DIR" "$LIB_DIR" "$SHARE_DIR"

copy_binary() {
  local name="$1"
  local source
  source="$(command -v "$name" 2>/dev/null || true)"
  if [[ -z "$source" ]]; then
    echo "vendor-tools: WARNING: $name not found in PATH"
    return 1
  fi
  cp "$source" "$BIN_DIR/$name"
  chmod +x "$BIN_DIR/$name"
  echo "vendor-tools: copied $name ($source)"
}

# ── macOS (Homebrew) ──
if [[ "$(uname)" == "Darwin" ]]; then
  copy_binary gs

  # Copy ghostscript share resources (Init, Resource, etc.)
  GS_SHARE=""
  for candidate in /opt/homebrew/opt/ghostscript/share/ghostscript /usr/local/opt/ghostscript/share/ghostscript; do
    if [[ -d "$candidate" ]]; then
      GS_SHARE="$candidate"
      break
    fi
  done
  if [[ -n "$GS_SHARE" ]]; then
    cp -R "$GS_SHARE" "$SHARE_DIR/"
    echo "vendor-tools: copied ghostscript share resources from $GS_SHARE"
  else
    echo "vendor-tools: WARNING: ghostscript share resources not found"
  fi

  # Copy dylib dependencies
  resolve_and_copy_libs() {
    while IFS= read -r binary; do
      chmod u+w "$binary" 2>/dev/null || true
      otool -L "$binary" 2>/dev/null | awk 'NR>1{print$1}' | while read -r dep; do
        # Skip system libraries
        if [[ "$dep" == /usr/lib/* || "$dep" == /System/* ]]; then continue; fi
        local resolved="$dep"
        if [[ "$dep" == @rpath/* ]]; then
          local name="${dep##*/}"
          resolved="$(find /opt/homebrew /usr/local -name "$name" -print 2>/dev/null | head -1 || true)"
          [[ -z "$resolved" ]] && continue
        fi
        if [[ "$dep" == @loader_path/* ]]; then
          resolved="$(dirname "$binary")/${dep#@loader_path/}"
        fi
        if [[ -f "$resolved" ]]; then
          local target="$LIB_DIR/$(basename "$resolved")"
          if [[ ! -f "$target" ]]; then
            cp "$resolved" "$target"
            chmod +w "$target" 2>/dev/null || true
            echo "  copied lib: $(basename "$resolved")"
          fi
        fi
      done
    done < <(find "$BIN_DIR" "$LIB_DIR" -type f 2>/dev/null)
  }

  resolve_and_copy_libs
  resolve_and_copy_libs  # second pass to catch transitive deps

  # Rewrite library load paths
  while IFS= read -r binary; do
    chmod u+w "$binary" 2>/dev/null || true
    otool -L "$binary" 2>/dev/null | awk 'NR>1{print$1}' | while read -r dep; do
      local base
      base="$(basename "$dep")"
      if [[ -f "$LIB_DIR/$base" ]]; then
        install_name_tool -change "$dep" "@loader_path/../lib/$base" "$binary" 2>/dev/null || true
      fi
    done
  done < <(find "$BIN_DIR" -type f 2>/dev/null)

  while IFS= read -r lib; do
    chmod u+w "$lib" 2>/dev/null || true
    install_name_tool -id "@loader_path/../lib/$(basename "$lib")" "$lib" 2>/dev/null || true
    otool -L "$lib" 2>/dev/null | awk 'NR>1{print$1}' | while read -r dep; do
      local base
      base="$(basename "$dep")"
      if [[ -f "$LIB_DIR/$base" ]]; then
        install_name_tool -change "$dep" "@loader_path/$base" "$lib" 2>/dev/null || true
      fi
    done
  done < <(find "$LIB_DIR" -type f 2>/dev/null)

  codesign --force --deep --sign - "$BIN_DIR"/gs 2>/dev/null || true
  codesign --force --deep --sign - "$LIB_DIR"/*.dylib 2>/dev/null || true

# ── Linux ──
elif [[ "$(uname)" == "Linux" ]]; then
  copy_binary gs

  # Copy libgs.so
  for libpath in /usr/lib/x86_64-linux-gnu/libgs.so.* /usr/lib/libgs.so.*; do
    if [[ -f "$libpath" ]]; then
      cp -L "$libpath" "$LIB_DIR/"
      echo "vendor-tools: copied $(basename "$libpath")"
    fi
  done

  # Copy ghostscript share resources
  GS_SHARE=""
  for candidate in /usr/share/ghostscript/*; do
    if [[ -d "$candidate" ]]; then
      GS_SHARE="$candidate"
      break
    fi
  done
  if [[ -n "$GS_SHARE" ]]; then
    cp -R "$GS_SHARE" "$SHARE_DIR/"
    echo "vendor-tools: copied ghostscript share resources from $GS_SHARE"
  fi

# ── Windows (MSYS2/Git Bash) ──
elif [[ "$(uname)" == MINGW* || "$(uname)" == MSYS* ]]; then
  copy_binary gswin64c || copy_binary gswin32c || true

  # Ghostscript on Windows is usually at C:\Program Files\gs\
  GS_DIR=""
  for candidate in "/c/Program Files/gs/gs"* "/c/Program Files (x86)/gs/gs"*; do
    if [[ -d "$candidate" ]]; then
      GS_DIR="$candidate"
      break
    fi
  done
  if [[ -n "$GS_DIR" ]]; then
    if [[ -d "$GS_DIR/bin" ]]; then
      cp "$GS_DIR"/bin/gswin*.exe "$BIN_DIR/" 2>/dev/null || true
      echo "vendor-tools: copied gswin*.exe from $GS_DIR/bin"
    fi
    if [[ -d "$GS_DIR/lib" ]]; then
      cp -R "$GS_DIR/lib" "$LIB_DIR/" 2>/dev/null || true
    fi
    if [[ -d "$GS_DIR/Resource" ]]; then
      cp -R "$GS_DIR/Resource" "$RESOURCE_DIR/" 2>/dev/null || true
    fi
    if [[ -d "$GS_DIR/Init" ]]; then
      cp -R "$GS_DIR/Init" "$RESOURCE_DIR/" 2>/dev/null || true
    fi
  fi
fi

echo ""
echo "vendor-tools: contents of $RESOURCE_DIR:"
find "$RESOURCE_DIR" -type f 2>/dev/null | head -20
echo "vendor-tools: done."