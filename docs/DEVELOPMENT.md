# Development guide

This document contains the implementation and build details intentionally kept out of the user-facing READMEs.

## Requirements

- Node.js 22 or later
- npm
- Windows or macOS and Spicetify for real-client verification

## Architecture

```text
Spotify lyrics DOM
        ↓
Find lyric lines containing kanji
        ↓
Convert locally with Kuroshiro + Kuromoji
        ↓
Build allowlisted <ruby> / <rt> annotations
```

The custom app and startup extension run separately. They share settings through `Spicetify.LocalStorage` and synchronize changes with a window event.

## Repository layout

```text
spotify-furigana/
├── app/          # Spicetify Custom App page, styles, and manifest
├── assets/       # Project logo, screenshots, and launch artwork
├── docs/         # User translations, compatibility, and developer docs
├── packaging/    # Release installer, uninstaller, and offline instructions
├── scripts/      # Build, package, and generated-asset scripts
├── src/          # Lyrics observer, selectors, settings, and reading engine
├── tests/        # Vitest tests
├── types/        # Kuroshiro and Spicetify declarations
└── manifest.json # Spicetify Marketplace discovery metadata
```

Key entry points:

- `src/extension.ts`: observes lyrics, coordinates settings, and updates lyric lines;
- `src/lyrics.ts`: maintains current and legacy Spotify lyrics selectors;
- `src/reading-engine.ts`: performs local reading conversion and safe DOM construction;
- `src/settings.ts`: validates and persists the display configuration;
- `src/icon.ts`: provides the original 「ふ」 playbar mark;
- `src/online-readings.ts`: strictly matches optional NetEase synchronized romanization, aligns it to Spotify lyric lines, and manages the bounded local cache;
- `app/index.js`: renders the Spicetify settings page;
- `scripts/build.mjs`: bundles the extension and copies the local dictionary.

## Build and verify

```powershell
npm ci
npm run check
npm run marketing-assets
npm run package
```

- `npm run check` runs TypeScript checks, app syntax validation, Vitest, and the production build.
- `npm run marketing-assets` deterministically rebuilds launch artwork from the project logo and real screenshot.
- `npm run package` creates the installable ZIP and SHA-256 checksum under the ignored `release/` directory.
- `packaging/install.ps1` and `packaging/uninstall.ps1` implement the Windows lifecycle; `packaging/install.sh` and `packaging/uninstall.sh` implement the macOS lifecycle and create a branded app launcher under `~/Applications`.

## Install a source build

```powershell
npm run build

$target = Join-Path $env:APPDATA "spicetify\CustomApps\spotify-furigana"
New-Item -ItemType Directory -Force $target | Out-Null
Copy-Item -Recurse -Force "dist\spotify-furigana\*" $target

spicetify config custom_apps spotify-furigana
spicetify apply
```

Restart Spotify and verify the standard lyrics view, the playbar toggle, all three reading modes, and each appearance control. Record real-client results in `docs/COMPATIBILITY.md`; do not describe automated selector coverage as real-client verification.

On macOS, use the equivalent source install:

```sh
npm run build
target="${XDG_CONFIG_HOME:-$HOME/.config}/spicetify/CustomApps/spotify-furigana"
mkdir -p "$target"
cp -R dist/spotify-furigana/. "$target/"
spicetify config spotify_path "/Applications/Spotify.app/Contents/Resources" \
  prefs_path "$HOME/Library/Application Support/Spotify/prefs" \
  custom_apps spotify-furigana
spicetify apply
```
