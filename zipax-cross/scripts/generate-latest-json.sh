#!/usr/bin/env bash
# ============================================================================
# 生成 latest.json — Tauri updater 所需的静态更新清单
#
# 用法:
#   ./scripts/generate-latest-json.sh <version> [notes]
#
# 示例:
#   ./scripts/generate-latest-json.sh 0.23.0
#   ./scripts/generate-latest-json.sh 0.23.0 "修复了 XYZ 问题"
#
# 前置条件:
#   1. 先执行 npx tauri build --bundles app（需设置 TAURI_SIGNING_PRIVATE_KEY）
#   2. 构建产物在 target/release/bundle/ 下
#   3. 此脚本读取 .sig 文件并生成 latest.json
# ============================================================================
set -euo pipefail

VERSION="${1:-}"
NOTES="${2:-Release $VERSION}"

if [[ -z "$VERSION" ]]; then
  echo "用法: $0 <version> [notes]"
  echo "示例: $0 0.23.0"
  exit 1
fi

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUNDLE_DIR="$PROJECT_DIR/target/release/bundle"

PUB_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# 构建 JSON 片段: platform|signature|url
entries=()

# macOS
sig_file=$(find "$BUNDLE_DIR/macos" -name "*.tar.gz.sig" -maxdepth 1 2>/dev/null | head -1 || true)
if [[ -n "$sig_file" ]]; then
  signature=$(tr -d '\n' < "$sig_file")
  url="https://github.com/2716190547/zipax/releases/download/v$VERSION/zipax.app.tar.gz"
  entries+=("darwin-aarch64|$signature|$url")
  entries+=("darwin-x86_64|$signature|$url")
fi

# Windows
if [[ -d "$BUNDLE_DIR/msi" ]]; then
  sig_file=$(find "$BUNDLE_DIR/msi" -name "*.sig" -maxdepth 1 2>/dev/null | head -1)
  if [[ -n "$sig_file" ]]; then
    signature=$(tr -d '\n' < "$sig_file")
    url="https://github.com/2716190547/zipax/releases/download/v$VERSION/zipax-setup.exe"
    entries+=("windows-x86_64|$signature|$url")
  fi
fi

# Linux
if [[ -d "$BUNDLE_DIR/appimage" ]]; then
  sig_file=$(find "$BUNDLE_DIR/appimage" -name "*.sig" -maxdepth 1 2>/dev/null | head -1)
  if [[ -n "$sig_file" ]]; then
    signature=$(tr -d '\n' < "$sig_file")
    url="https://github.com/2716190547/zipax/releases/download/v$VERSION/zipax.AppImage.tar.gz"
    entries+=("linux-x86_64|$signature|$url")
  fi
fi

if [[ ${#entries[@]} -eq 0 ]]; then
  echo "❌ 未找到 .sig 文件。请先执行 npx tauri build --bundles app。"
  echo "   查找路径: $BUNDLE_DIR"
  exit 1
fi

# 输出 JSON
echo "{"
echo "  \"version\": \"$VERSION\","
echo "  \"notes\": \"$NOTES\","
echo "  \"pub_date\": \"$PUB_DATE\","
echo "  \"platforms\": {"

i=0
for entry in "${entries[@]}"; do
  IFS='|' read -r platform signature url <<< "$entry"
  if [[ $i -gt 0 ]]; then echo ","; fi
  echo -n "    \"$platform\": {"
  echo -n "\"signature\": \"$signature\", "
  echo -n "\"url\": \"$url\"}"
  ((i++))
done

echo ""
echo "  }"
echo "}"
