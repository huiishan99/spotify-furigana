import { describe, expect, it } from "vitest";
import { getDictionaryPath } from "../src/assets";

describe("Spicetify asset paths", () => {
  it("points at the custom app dictionary directory", () => {
    expect(getDictionaryPath("https://xpui.app.spotify.com")).toBe(
      "https://xpui.app.spotify.com/assets/spotify-furigana/dict/",
    );
  });
});
