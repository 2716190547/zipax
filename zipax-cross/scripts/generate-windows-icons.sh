#!/usr/bin/env bash

set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
output_dir="$(mktemp -d "${TMPDIR:-/tmp}/zipax-windows-icons.XXXXXX")"
trap 'rm -rf "$output_dir"' EXIT

cd "$project_dir"
npm run tauri -- icon ../Resources/AppIcon-Windows.svg --output "$output_dir"

cp "$output_dir/icon.ico" src-tauri/icons/icon.ico
cp "$output_dir/StoreLogo.png" src-tauri/icons/StoreLogo.png
cp "$output_dir"/Square*Logo.png src-tauri/icons/

echo "Windows icons regenerated from Resources/AppIcon-Windows.svg"
