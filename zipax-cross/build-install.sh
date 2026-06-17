#!/usr/bin/env bash
# ============================================================================
# zipax-cross 构建 + 安装脚本
#
# 用法:
#   ./build-install.sh              # 构建并安装到 ~/Applications
#   ./build-install.sh --system     # 构建并安装到 /Applications
#   ./build-install.sh --open       # 构建、安装、打开
#   ./build-install.sh --no-install # 仅构建，不安装
#   ./build-install.sh --help       # 显示帮助
#
# 每次修改完前端/后端代码后，执行此脚本即可完成"构建→安装→(可选)启动"全流程。
# ============================================================================
set -euo pipefail

APP_NAME="zipax"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# 解析参数
INSTALL_TARGET="user"  # user → ~/Applications, system → /Applications
DO_OPEN=false
DO_INSTALL=true

for arg in "$@"; do
  case "$arg" in
    --system)   INSTALL_TARGET="system" ;;
    --user)     INSTALL_TARGET="user" ;;
    --open)     DO_OPEN=true ;;
    --no-install) DO_INSTALL=false ;;
    --help|help|-h)
      echo "用法: $0 [--system|--user] [--open] [--no-install]"
      echo ""
      echo "  --system     安装到 /Applications（需要 sudo）"
      echo "  --user       安装到 ~/Applications（默认）"
      echo "  --open       安装后打开应用"
      echo "  --no-install 仅构建，不安装"
      exit 0
      ;;
  esac
done

echo "=========================================="
echo " zipax-cross 构建 + 安装"
echo "=========================================="

# ── 步骤 1: 停止正在运行的 zipax ──
echo ""
echo "📦 [1/4] 停止正在运行的 $APP_NAME ..."
pkill -x "$APP_NAME" 2>/dev/null || true
sleep 0.5

# ── 步骤 2: 构建前端 ──
echo ""
echo "📦 [2/4] 构建前端 (npm run build) ..."
cd "$SCRIPT_DIR"
npm run build 2>&1 | tail -5
echo "     前端构建完成 ✓"

# ── 步骤 3: Tauri 构建 ──
echo ""
echo "📦 [3/4] Tauri 构建 (npx tauri build --bundles app) ..."
npx tauri build --bundles app 2>&1 | tail -10
echo "     Tauri 构建完成 ✓"

# 定位生成的 .app
# Tauri v2 macOS 输出路径
TAURI_TARGET="$SCRIPT_DIR/target/release"
APP_BUNDLE_SOURCE=""
BUNDLE_DIR="$TAURI_TARGET/bundle/macos"

if [[ -d "$BUNDLE_DIR" ]]; then
  # 查找目录下第一个 .app
  for f in "$BUNDLE_DIR"/*.app; do
    if [[ -d "$f" ]]; then
      APP_BUNDLE_SOURCE="$f"
      break
    fi
  done
fi

if [[ -z "$APP_BUNDLE_SOURCE" || ! -d "$APP_BUNDLE_SOURCE" ]]; then
  echo ""
  echo "❌ 错误: 未找到构建产物 .app 包"
  echo "   预期路径: $BUNDLE_DIR/${APP_NAME}.app"
  echo "   请检查构建输出。"
  exit 1
fi

echo ""
echo "     构建产物: $APP_BUNDLE_SOURCE"

# ── 步骤 4: 安装到 Applications ──
if [[ "$DO_INSTALL" == "true" ]]; then
  echo ""
  echo "📦 [4/4] 安装 $APP_NAME ..."

  if [[ "$INSTALL_TARGET" == "system" ]]; then
    DEST="/Applications"
    RM_CMD="sudo rm -rf"
    CP_CMD="sudo cp -R"
  else
    DEST="$HOME/Applications"
    mkdir -p "$DEST"
    RM_CMD="rm -rf"
    CP_CMD="cp -R"
  fi

  # 移除旧版本
  if [[ -d "$DEST/$APP_NAME.app" ]]; then
    echo "     移除旧版本: $DEST/$APP_NAME.app"
    $RM_CMD "$DEST/$APP_NAME.app"
  fi

  # 复制新版本
  echo "     安装到: $DEST/$APP_NAME.app"
  $CP_CMD "$APP_BUNDLE_SOURCE" "$DEST/$APP_NAME.app"

  # 签名（确保本地运行正常）
  codesign --force --deep --sign - "$DEST/$APP_NAME.app" 2>/dev/null || true

  echo "     安装完成 ✓"

  # 可选: 打开应用
  if [[ "$DO_OPEN" == "true" ]]; then
    echo ""
    echo "🚀 启动 $APP_NAME ..."
    open -a "$DEST/$APP_NAME.app" 2>/dev/null || \
      /usr/bin/open -n "$DEST/$APP_NAME.app"
  fi
fi

echo ""
echo "=========================================="
echo " ✅ zipax-cross 构建完成"
echo "    构建产物: $APP_BUNDLE_SOURCE"
if [[ "$DO_INSTALL" == "true" ]]; then
  DEST_PATH="${INSTALL_TARGET}/Applications"
  echo "    安装位置: $DEST_PATH/$APP_NAME.app"
fi
echo "=========================================="
