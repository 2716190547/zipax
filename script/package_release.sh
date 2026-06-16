#!/usr/bin/env bash
set -euo pipefail

APP_NAME="zipax"
VERSION="${1:-0.1.0}"
BUNDLE_ID="${BUNDLE_ID:-com.local.zipax}"
MIN_SYSTEM_VERSION="26.0"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
RELEASE_DIR="$DIST_DIR/release"
DMG_ROOT="$RELEASE_DIR/dmg-root"
APP_BUNDLE="$RELEASE_DIR/$APP_NAME.app"
APP_CONTENTS="$APP_BUNDLE/Contents"
APP_MACOS="$APP_CONTENTS/MacOS"
APP_FRAMEWORKS="$APP_CONTENTS/Frameworks"
APP_RESOURCES="$APP_CONTENTS/Resources"
APP_BINARY="$APP_MACOS/$APP_NAME"
INFO_PLIST="$APP_CONTENTS/Info.plist"
DMG_PATH="$DIST_DIR/${APP_NAME}-${VERSION}-macOS-arm64.dmg"
APP_ICON_SOURCE="$ROOT_DIR/Resources/AppIcon.icns"
SUPPORT_RESOURCES_SOURCE="$ROOT_DIR/Resources/Support"
TOOLS_RESOURCES_SOURCE="$ROOT_DIR/Resources/Tools"
SPARKLE_PUBLIC_KEY="T3B1iQ/BHEEELJyooISOWsPPwbwInZtGb9ZHrGpfEdw="
SPARKLE_FEED_URL="https://raw.githubusercontent.com/2716190547/zipax/master/appcast.xml"

cd "$ROOT_DIR"
swift build -c release
cargo build -p zipax-cli --release
BUILD_DIR="$(swift build -c release --show-bin-path)"
BUILD_BINARY="$BUILD_DIR/$APP_NAME"
RUST_CLI_BINARY="$ROOT_DIR/target/release/zipax-cli"
SPARKLE_FRAMEWORK="$BUILD_DIR/Sparkle.framework"

rm -rf "$RELEASE_DIR" "$DMG_PATH" "$DMG_PATH.sha256"
mkdir -p "$APP_MACOS" "$APP_FRAMEWORKS" "$APP_RESOURCES"
cp "$BUILD_BINARY" "$APP_BINARY"
chmod +x "$APP_BINARY"
if [[ -d "$SPARKLE_FRAMEWORK" ]]; then
  cp -R "$SPARKLE_FRAMEWORK" "$APP_FRAMEWORKS/"
  install_name_tool -add_rpath "@executable_path/../Frameworks" "$APP_BINARY" 2>/dev/null || true
fi
cp "$APP_ICON_SOURCE" "$APP_RESOURCES/AppIcon.icns"
if [[ -d "$SUPPORT_RESOURCES_SOURCE" ]]; then
  cp -R "$SUPPORT_RESOURCES_SOURCE" "$APP_RESOURCES/Support"
fi
if [[ -d "$TOOLS_RESOURCES_SOURCE" ]]; then
  cp -R "$TOOLS_RESOURCES_SOURCE" "$APP_RESOURCES/Tools"
fi
mkdir -p "$APP_RESOURCES/Tools/bin"
cp "$RUST_CLI_BINARY" "$APP_RESOURCES/Tools/bin/zipax-cli"
chmod +x "$APP_RESOURCES/Tools/bin/zipax-cli"

cat >"$INFO_PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key>
  <string>$APP_NAME</string>
  <key>CFBundleIdentifier</key>
  <string>$BUNDLE_ID</string>
  <key>CFBundleName</key>
  <string>$APP_NAME</string>
  <key>CFBundleDisplayName</key>
  <string>$APP_NAME</string>
  <key>CFBundleShortVersionString</key>
  <string>$VERSION</string>
  <key>CFBundleVersion</key>
  <string>$VERSION</string>
  <key>CFBundleIconFile</key>
  <string>AppIcon</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>LSMinimumSystemVersion</key>
  <string>$MIN_SYSTEM_VERSION</string>
  <key>NSPrincipalClass</key>
  <string>NSApplication</string>
  <key>SUFeedURL</key>
  <string>$SPARKLE_FEED_URL</string>
  <key>SUPublicEDKey</key>
  <string>$SPARKLE_PUBLIC_KEY</string>
  <key>SUEnableAutomaticChecks</key>
  <true/>
  <key>SUAutomaticallyUpdate</key>
  <true/>
  <key>SUAllowsAutomaticUpdates</key>
  <true/>
</dict>
</plist>
PLIST

codesign --force --deep --sign - "$APP_BUNDLE"

mkdir -p "$DMG_ROOT"
cp -R "$APP_BUNDLE" "$DMG_ROOT/"
ln -s /Applications "$DMG_ROOT/Applications"
hdiutil create -volname "$APP_NAME $VERSION" -srcfolder "$DMG_ROOT" -ov -format UDZO "$DMG_PATH"
shasum -a 256 "$DMG_PATH" > "$DMG_PATH.sha256"

echo "$DMG_PATH"
