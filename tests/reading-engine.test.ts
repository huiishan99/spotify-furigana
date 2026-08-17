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

  it.each([
    ["hiragana", "<rt>よる</rt>"],
    ["katakana", "<rt>ヨル</rt>"],
    ["romaji", "<rt>yoru</rt>"],
  ] as const)("supports %s readings", async (mode, expectedReading) => {
    const converted = await convertToFurigana("夜に駆ける", dictionaryPath, mode);

    expect(converted).toContain(expectedReading);
  });

  it("prefers a synchronized sung reading when one is available", async () => {
    const converted = await convertToFurigana(
      "二人だけの空",
      dictionaryPath,
      "hiragana",
      "fu ta ri da ke no so ra",
    );

    expect(converted).toContain("<rt>ふたり</rt>");
    expect(converted).not.toContain("<rt>にん</rt>");
  });
});
