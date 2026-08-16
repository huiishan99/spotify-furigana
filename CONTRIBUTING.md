# Contributing to Furigana for Spotify

Thanks for helping make Japanese lyrics easier to read.

## Before opening an issue

- Check the existing issues first.
- Confirm that Spotify, Spicetify, and Furigana for Spotify are up to date.
- Do not paste complete song lyrics, account details, access tokens, or other private data.

Compatibility reports are most useful when they include:

- Windows version
- Spotify version and installation source
- Spicetify version
- Furigana for Spotify version
- Normal or fullscreen lyrics view
- A short, redacted console error or screenshot

## Development

Requirements: Node.js 22 or later and npm.

Read the [development guide](./docs/DEVELOPMENT.md) for the architecture, repository layout, source-build installation, and verification boundaries.

```powershell
npm ci
npm run check
npm run package
```

Keep changes focused. Add or update tests when changing lyric selectors, text handling, the reading engine, or generated DOM behavior.

## Pull requests

1. Explain the user-visible reason for the change.
2. Keep unrelated refactors out of the same pull request.
3. Run `npm run check` before submitting.
4. Include screenshots for visible UI changes.

By contributing, you agree that your contribution is licensed under the repository's MIT License.
