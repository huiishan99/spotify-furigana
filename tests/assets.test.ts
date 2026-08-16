import { describe, expect, it } from "vitest";
import { getDictionaryPath } from "../src/assets";

describe("Spicetify asset paths", () => {
  it("uses a root-relative path compatible with path-browserify", () => {
    expect(getDictionaryPath()).toBe("/assets/spotify-furigana/dict/");
  });
});
