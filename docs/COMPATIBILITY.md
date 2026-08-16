# Compatibility matrix

This page separates real-client verification from automated layout coverage. A selector fixture or successful build is useful regression evidence, but it is not presented as a real Spotify runtime test.

## Verified on a real Windows client

| Date | Windows | Spotify Desktop | Spicetify | Lyrics layout | Result |
| --- | --- | --- | --- | --- | --- |
| 2026-08-16 | Windows 11 Pro 10.0.26200 | Microsoft Store 1.2.96.518 | 2.44.0 | `.lyrics-lyricsContent-text` | Pass |

The real-client check covered extension injection, playbar toggling, local dictionary loading, and live furigana rendering in the standard lyrics view.

## Automated compatibility contracts

Every CI run checks the following known Spotify lyrics layouts:

| Layout family | Selector | Evidence |
| --- | --- | --- |
| Current desktop | `.lyrics-lyricsContent-text` | Selector regression test |
| Earlier standard lyrics | `[data-testid="lyrics-line"]` | Selector regression test |
| Earlier fullscreen lyrics | `[data-testid="fullscreen-lyric"]` | Selector regression test |

CI runs TypeScript checks, unit tests, and the production bundle on both Windows and Linux. These checks catch selector removal, settings regressions, local reading-engine failures, unsafe package changes, and platform-specific build problems.

## Report another working version

Open a compatibility report using the repository's bug-report form and include:

- Windows, Spotify Desktop, and Spicetify versions;
- standard or fullscreen lyrics view;
- whether the playbar toggle and settings page work;
- whether hiragana, katakana, and romaji modes render;
- console errors with account information removed.

Do not paste complete copyrighted lyrics. Confirmed reports can be added to the real-client table through a pull request.
