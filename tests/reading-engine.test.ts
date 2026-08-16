import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { convertToFurigana } from "../src/reading-engine";

const dictionaryPath = fileURLToPath(
  new URL("../node_modules/kuromoji/dict/", import.meta.url),
);

describe("local reading engine", () => {
  it("converts Japanese kanji without a remote API", async () => {
    const converted = await convertToFurigana("夜に駆ける", dictionaryPath);

    expect(converted).toContain("<ruby>夜");
    expect(converted).toContain("<rt>よる</rt>");
    expect(converted).toContain("<ruby>駆");
  });
});
