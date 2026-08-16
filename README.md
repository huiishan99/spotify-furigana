<p align="center">
  <strong>English</strong> · <a href="./docs/README.zh-CN.md">简体中文</a> · <a href="./docs/README.ja.md">日本語</a>
</p>

<p align="center">
  <img src="./assets/logo.png" alt="Furigana for Spotify logo" width="168" />
</p>

<h1 align="center">Furigana for Spotify</h1>

<p align="center">
  <strong>Show furigana above Japanese kanji in Spotify lyrics on Windows.</strong>
  <br />
  Local processing · No lyrics API · No lyrics uploaded
</p>

<p align="center">
  <a href="https://github.com/huiishan99/spotify-furigana/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/huiishan99/spotify-furigana/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://github.com/huiishan99/spotify-furigana/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/huiishan99/spotify-furigana?display_name=tag&amp;label=release&amp;color=00A77D" /></a>
  <a href="https://github.com/huiishan99/spotify-furigana/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/huiishan99/spotify-furigana?style=flat&amp;logo=github&amp;color=00A77D" /></a>
  <img alt="Windows 10 and 11" src="https://img.shields.io/badge/Windows-10%20%7C%2011-4F46E5" />
  <img alt="Spotify Desktop 1.2.96 tested" src="https://img.shields.io/badge/Spotify%20Desktop-1.2.96%20tested-16A34A?logo=spotify&amp;logoColor=1ED760&amp;labelColor=191414" />
  <img alt="Spicetify 2.44 tested" src="https://img.shields.io/badge/Spicetify-2.44%20tested-F97366" />
  <a href="./LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-4338CA" /></a>
</p>

> [!IMPORTANT]
> This is an independent community project. It is not affiliated with, sponsored by, or endorsed by Spotify AB. The project mark does not use the official Spotify logo; the mark inside the compatibility badge only identifies the target platform.

> [!TIP]
> If this project helps you read even one Japanese song more comfortably, consider [giving it a star](https://github.com/huiishan99/spotify-furigana). Stars help other Japanese learners discover it.

## See it in action

<p align="center">
  <img src="./assets/marketing/demo.gif" alt="Animated close-up of live Japanese furigana displayed in Spotify lyrics on Windows" width="100%" />
</p>

<p align="center">
  <sub>Animated from a real capture on Windows 11 · Spotify 1.2.96.518 · Spicetify 2.44.0. <a href="./assets/screenshots/lyrics-view.png">View the full screenshot.</a> Lyrics, artwork, and Spotify UI elements belong to their respective rights holders and appear here only to demonstrate the extension.</sub>
</p>

The extension enhances lyrics already displayed by Spotify and uses standard HTML `<ruby>` annotations to place readings above kanji.

| Original lyric | With furigana |
| --- | --- |
| 声も聞かさないで | <ruby>声<rt>こえ</rt></ruby>も<ruby>聞<rt>き</rt></ruby>かさないで |
| 明日は晴れる | <ruby>明日<rt>あした</rt></ruby>は<ruby>晴<rt>は</rt></ruby>れる |

## Why use it

- **Works with Spotify's lyrics view**: automatically processes the current desktop layout and known fullscreen lyrics layouts.
- **Runs entirely on your machine**: Kuroshiro + Kuromoji perform tokenization and reading conversion locally.
- **Does not replace the lyrics source**: it only enhances text already visible in Spotify and does not fetch, store, or redistribute lyrics.
- **Easy to toggle**: use the lyrics button in the player bar or the custom app page in the sidebar.
- **Safe DOM output**: only allowlisted `<ruby>`, `<rt>`, and `<rp>` nodes are created.

## Requirements

- Windows 10 or Windows 11
- Spotify desktop for Windows
- [Spicetify](https://spicetify.app/docs/getting-started)
- Node.js 22 or later (build time only)

Verified on real hardware with:

| Component | Verified version |
| --- | --- |
| Windows | Windows 11 Pro 10.0.26200 |
| Spotify | Microsoft Store build 1.2.96.518 |
| Spicetify | 2.44.0 |

Other versions may work, but have not been individually verified.

## Install

### Release package (recommended)

<p>
  <a href="https://github.com/huiishan99/spotify-furigana/releases/latest"><img alt="Download the latest release" src="https://img.shields.io/badge/Download-latest%20release-00A77D?style=for-the-badge&amp;logo=github" /></a>
</p>

1. Download `spotify-furigana-vX.Y.Z.zip` from the [latest release](https://github.com/huiishan99/spotify-furigana/releases/latest).
2. Extract the ZIP completely.
3. Open PowerShell in the extracted folder and run:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

The release already contains the compiled extension and Kuromoji dictionary. The installer preserves an existing installation as a timestamped backup, copies the app into Spicetify, enables it, and runs `spicetify apply`.

### Build from source

```powershell
git clone https://github.com/huiishan99/spotify-furigana.git
Set-Location spotify-furigana
npm ci
npm run build
```

### Install the source build into Spicetify

```powershell
$target = Join-Path $env:APPDATA "spicetify\CustomApps\spotify-furigana"
New-Item -ItemType Directory -Force $target | Out-Null
Copy-Item -Recurse -Force "dist\spotify-furigana\*" $target

spicetify config custom_apps spotify-furigana
spicetify apply
```

Restart Spotify, play a Japanese song with lyrics, and open the lyrics view. The local dictionary may take a moment to load on the first conversion.

> [!NOTE]
> Spicetify support for the Microsoft Store build of Spotify is limited. If your regular shortcut does not load the extension, launch Spotify with `spicetify auto`. See the [Spicetify FAQ](https://spicetify.app/docs/faq) if you encounter `Cannot find pref_file`.

## Update

Download and extract the newest Release ZIP, then run its installer again:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

The installer preserves the previous installation as a timestamped backup before updating it.

## Uninstall

```powershell
powershell -ExecutionPolicy Bypass -File .\uninstall.ps1
```

## How it works

```text
Spotify lyrics DOM
        ↓
Find lyric lines containing kanji
        ↓
Convert locally with Kuroshiro + Kuromoji
        ↓
Build safe <ruby> / <rt> annotations
```

## Repository layout

```text
spotify-furigana/
├── app/          # Spicetify Custom App page, styles, and manifest
├── assets/       # Project logo, live screenshots, and launch artwork
├── docs/         # Chinese and Japanese README translations
├── packaging/    # Release installer, uninstaller, and offline instructions
├── scripts/      # Build and asset-copy scripts
├── src/          # Lyrics observer, selectors, settings, and reading engine
├── tests/        # Vitest unit tests
├── types/        # Kuroshiro and Spicetify type declarations
├── manifest.json # Spicetify Marketplace discovery metadata
└── README.md     # Canonical English entry point
```

Key files:

- `src/extension.ts`: observes the lyrics DOM, manages the toggle, and updates lyric lines.
- `src/lyrics.ts`: contains selectors for current and legacy Spotify lyrics layouts.
- `src/reading-engine.ts`: performs local reading conversion and builds safe DOM nodes.
- `scripts/build.mjs`: bundles the extension and copies the Kuromoji dictionary.

The runtime, source, tests, build tooling, types, assets, and documentation already have clear boundaries, so the source directories do not need a cosmetic reorganization.

## Development

```powershell
npm ci
npm run check
npm run marketing-assets
npm run package
```

`npm run check` runs TypeScript checks, Vitest, and the production build. `npm run marketing-assets` deterministically rebuilds the social preview and animated demo from the original project logo and real screenshot. `npm run package` creates the ready-to-install ZIP and SHA-256 checksum under the ignored `release/` directory.

## Known limitations

- Names, place names, wordplay, and intentionally unusual lyric readings may be annotated incorrectly.
- Spotify updates can change the lyrics DOM. If the extension stops working, include your Spotify and Spicetify versions in the issue.
- The project currently targets Spotify desktop for Windows only. Web Player, macOS, and mobile are not supported.

## Roadmap

- [ ] Furigana size, opacity, and spacing controls
- [ ] Katakana and romaji display modes
- [x] One-command install and update script
- [ ] Verification across more Spotify and Spicetify versions
- [ ] Spicetify Marketplace release

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting a change, and use the compatibility report template when Spotify changes its lyrics layout.

Before submitting a change, run:

```powershell
npm run check
```

For compatibility reports, include the Spotify version, Spicetify version, lyrics view type, and console errors with account information removed. Do not paste complete lyrics.

Security issues should be reported privately as described in [SECURITY.md](./SECURITY.md).

## Share the project

The ready-to-post English, Chinese, and Japanese launch copy is available in [docs/LAUNCH_KIT.md](./docs/LAUNCH_KIT.md). If the extension helps you, a [GitHub star](https://github.com/huiishan99/spotify-furigana) or a thoughtful compatibility report is the most useful support.

## Trademark notice

Furigana for Spotify is an independent open-source project. Spotify, the Spotify logo, and related brand elements are trademarks of Spotify AB. This project is not affiliated with, sponsored by, or endorsed by Spotify AB. “for Spotify” is used only to describe platform compatibility.

The project logo is an original design combining “ふ”, a ruby-annotation bar, and a music note. Its near-black, teal-emerald, and off-white palette suggests a music-streaming product while remaining distinct from Spotify Green; it does not use Spotify's circle, waves, or official logo. See the [Spotify Design & Branding Guidelines](https://developer.spotify.com/documentation/design).

## License

[MIT](./LICENSE)
