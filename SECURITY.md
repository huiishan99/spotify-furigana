# Security Policy

## Supported versions

Security fixes are applied to the latest release.

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability.

Use GitHub's private vulnerability reporting feature for this repository. Include the affected version, impact, reproduction steps, and any suggested mitigation. Do not include Spotify credentials, cookies, account data, or complete lyrics.

You can expect an initial acknowledgement within seven days. A public advisory or fix will be coordinated after the issue has been assessed.

## Scope

Furigana for Spotify processes lyrics already rendered by Spotify and performs reading conversion locally by default. If the user explicitly enables experimental online accurate readings, the extension sends the current public track title and artist to the GD Studio search endpoint, then requests the selected track's synchronized lyrics and romanization from NetEase Cloud Music. When strict artist matching fails because providers use different scripts, the public artist name is sent to MusicBrainz for high-confidence alias verification. The Spotify album name is used only for local result ranking. It does not send Spotify credentials, cookies, or the lyrics rendered by Spotify. Matched reading data is cached only in Spotify's local storage.

Reports involving unsafe DOM insertion, network requests outside the three disclosed online-reading hosts, accidental online-mode activation, release package tampering, or installer path handling are especially useful.
