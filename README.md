<p align="center">
  <strong>English</strong> · <a href="./docs/README.zh-CN.md">简体中文</a> · <a href="./docs/README.ja.md">日本語</a>
</p>

<p align="center">
  <img src="./assets/logo.png" alt="Furigana for Spotify logo" width="168" />
</p>

<h1 align="center">Furigana for Spotify</h1>

<p align="center">
  <strong>Show hiragana, katakana, or romaji readings above Japanese kanji in Spotify lyrics on Windows.</strong>
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
- **Choose how readings appear**: switch between hiragana, katakana, and romaji, then tune size, opacity, and vertical spacing.
- **Does not replace the lyrics source**: it only enhances text already visible in Spotify and does not fetch, store, or redistribute lyrics.
- **Easy to toggle**: use the lyrics button in the player bar or the custom app page in the sidebar.

## Requirements

- Windows 10 or Windows 11
- Spotify desktop for Windows
- [Spicetify](https://spicetify.app/docs/getting-started)

Verified on real hardware with:

| Component | Verified version |
| --- | --- |
| Windows | Windows 11 Pro 10.0.26200 |
| Spotify | Microsoft Store build 1.2.96.518 |
| Spicetify | 2.44.0 |

Other versions may work, but have not been individually verified.

See the [compatibility matrix](./docs/COMPATIBILITY.md) for more version information.

## Install

<p>
  <a href="https://github.com/huiishan99/spotify-furigana/releases/latest"><img alt="Download the latest release" src="https://img.shields.io/badge/Download-latest%20release-00A77D?style=for-the-badge&amp;logo=github" /></a>
</p>

1. Download `spotify-furigana-vX.Y.Z.zip` from the [latest release](https://github.com/huiishan99/spotify-furigana/releases/latest).
2. Extract the ZIP completely.
3. Open PowerShell in the extracted folder and run:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

The installer backs up an existing installation, installs and enables the app, and applies the Spicetify configuration.

Restart Spotify, play a Japanese song with lyrics, and open the lyrics view. The local dictionary may take a moment to load on the first conversion.

> [!NOTE]
> Spicetify support for the Microsoft Store build of Spotify is limited. If your regular shortcut does not load the extension, launch Spotify with `spicetify auto`. See the [Spicetify FAQ](https://spicetify.app/docs/faq) if you encounter `Cannot find pref_file`.

## Update

Download and extract the newest Release ZIP, then run its installer again:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

The installer preserves the previous installation as a timestamped backup before updating it.

## Customize the readings

Open **Furigana for Spotify** from Spotify's sidebar. The settings page lets you:

- switch between hiragana, katakana, and romaji readings;
- adjust reading size from 30% to 75%;
- adjust opacity from 40% to 100%;
- add up to 8 px of vertical spacing;
- restore the display defaults with one click.

Changes are saved locally and apply immediately.

## Uninstall

```powershell
powershell -ExecutionPolicy Bypass -File .\uninstall.ps1
```

## Troubleshooting

- **No Furigana page in the sidebar:** run `spicetify apply`, then restart Spotify.
- **The button appears but lyrics are unchanged:** make sure the song has Japanese lyrics containing kanji, enable the lyrics button, and wait briefly for the first local dictionary load.
- **The app disappeared after a Spotify update:** run `spicetify backup apply` and restart Spotify.
- **Microsoft Store Spotify does not load Spicetify:** try launching it with `spicetify auto` and check the [Spicetify FAQ](https://spicetify.app/docs/faq).

## Known limitations

- Names, place names, wordplay, and intentionally unusual lyric readings may be annotated incorrectly.
- Spotify updates can change the lyrics DOM. If the extension stops working, include your Spotify and Spicetify versions in the issue.
- The project currently targets Spotify desktop for Windows only. Web Player, macOS, and mobile are not supported.

## Contributing

Found a problem or have an idea? Open an [Issue](https://github.com/huiishan99/spotify-furigana/issues) or read [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting a pull request.

Security issues should be reported privately as described in [SECURITY.md](./SECURITY.md).

## Share the project

The ready-to-post English, Chinese, and Japanese launch copy is available in [docs/LAUNCH_KIT.md](./docs/LAUNCH_KIT.md). If the extension helps you, a [GitHub star](https://github.com/huiishan99/spotify-furigana) or a thoughtful compatibility report is the most useful support.

## Trademark notice

Furigana for Spotify is an independent open-source project. Spotify, the Spotify logo, and related brand elements are trademarks of Spotify AB. This project is not affiliated with, sponsored by, or endorsed by Spotify AB. “for Spotify” is used only to describe platform compatibility.

The project logo is an original design combining “ふ”, a ruby-annotation bar, and a music note. Its near-black, teal-emerald, and off-white palette suggests a music-streaming product while remaining distinct from Spotify Green; it does not use Spotify's circle, waves, or official logo. See the [Spotify Design & Branding Guidelines](https://developer.spotify.com/documentation/design).

## License

[MIT](./LICENSE)
