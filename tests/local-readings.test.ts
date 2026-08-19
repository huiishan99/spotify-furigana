import { describe, expect, it } from "vitest";
import { protectLocalReadings } from "../src/local-readings";

describe("local phrase readings", () => {
  it.each([
    ["hiragana", "ひとり", "ふたり"],
    ["katakana", "ヒトリ", "フタリ"],
    ["romaji", "hitori", "futari"],
  ] as const)(
    "corrects common people counters in %s without an online result",
    (mode, onePerson, twoPeople) => {
      const protectedReadings = protectLocalReadings(
        "一人で歩く、二人だけの空、1人2人、１人２人",
        mode,
      );
      const restored = protectedReadings.restore(protectedReadings.value);

      expect(restored).toContain(`<ruby>一人<rp>(</rp><rt>${onePerson}</rt>`);
      expect(restored).toContain(`<ruby>二人<rp>(</rp><rt>${twoPeople}</rt>`);
      expect(restored).toContain(`<ruby>1人<rp>(</rp><rt>${onePerson}</rt>`);
      expect(restored).toContain(`<ruby>2人<rp>(</rp><rt>${twoPeople}</rt>`);
      expect(restored).toContain(`<ruby>１人<rp>(</rp><rt>${onePerson}</rt>`);
      expect(restored).toContain(`<ruby>２人<rp>(</rp><rt>${twoPeople}</rt>`);
    },
  );

  it("leaves grammatical terms, idioms, and larger numbers to the dictionary", () => {
    const value = "一人称 二人称 一人前 二人前 二人羽織 二人三脚 十二人 11人";
    const protectedReadings = protectLocalReadings(value, "hiragana");

    expect(protectedReadings.value).toBe(value);
    expect(protectedReadings.restore(value)).toBe(value);
  });
});
