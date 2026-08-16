export const LYRIC_SELECTORS = [
  '[data-testid="lyrics-line"]',
  '[data-testid="fullscreen-lyric"]',
  ".lyrics-lyricsContent-text",
  '[class*="lyricsContent-lyric"] > [class*="lyricsContent-text"]',
] as const;

export const LYRIC_SELECTOR = LYRIC_SELECTORS.join(",");
