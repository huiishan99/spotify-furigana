import { describe, expect, it } from "vitest";
import { LYRIC_SELECTOR, LYRIC_SELECTORS } from "../src/lyrics";

describe("Spotify lyric selectors", () => {
  it("supports the current desktop lyric line classes", () => {
    expect(LYRIC_SELECTORS).toContain(".lyrics-lyricsContent-text");
    expect(LYRIC_SELECTOR).toContain("lyricsContent-text");
  });

  it("keeps compatibility with older Spotify lyric layouts", () => {
    expect(LYRIC_SELECTORS).toContain('[data-testid="lyrics-line"]');
    expect(LYRIC_SELECTORS).toContain('[data-testid="fullscreen-lyric"]');
  });
});
