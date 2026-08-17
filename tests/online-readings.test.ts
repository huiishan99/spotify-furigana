import { describe, expect, it, vi } from "vitest";
import {
  buildOnlineReadingIndex,
  clearOnlineReadingCache,
  convertSungReadingToFurigana,
  fetchOnlineReadingResult,
  findOnlineRomanization,
  getCachedOnlineReading,
  normalizeLyricLookupText,
  ONLINE_CACHE_KEY,
  parseTimestampedLyrics,
  romanizationToHiragana,
  selectBestSearchCandidate,
  setCachedOnlineReading,
  type OnlineReadingResult,
  type StorageAdapter,
} from "../src/online-readings";

function createStorage(): { storage: StorageAdapter; values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    storage: {
      get: (key) => values.get(key) ?? null,
      set: (key, value) => values.set(key, value),
    },
  };
}

const track = {
  uri: "spotify:track:test",
  title: "夜に駆ける",
  artist: "YOASOBI",
  album: "THE BOOK",
};

const lyrics = [
  "[00:01.430]沈むように溶けてゆくように",
  "[00:08.831]二人だけの空が広がる夜に",
].join("\n");

const romanizedLyrics = [
  "[00:01.430]shi zu mu yo u ni to ke te yu ku yo u ni",
  "[00:08.831]fu ta ri da ke no so ra ga hi ro ga ru yo ru ni",
].join("\n");

describe("online synchronized readings", () => {
  it("parses timestamps and pairs Japanese lines with synchronized romaji", () => {
    expect(parseTimestampedLyrics(lyrics)[1]).toEqual({
      startTimeMs: 8831,
      text: "二人だけの空が広がる夜に",
    });

    const index = buildOnlineReadingIndex(lyrics, romanizedLyrics);
    expect(findOnlineRomanization(index, "二人だけの空が広がる夜に")).toBe(
      "fu ta ri da ke no so ra ga hi ro ga ru yo ru ni",
    );
  });

  it("normalizes provider-side parenthesized readings for Spotify lookup", () => {
    expect(normalizeLyricLookupText("明けない夜に溢(こぼ)れた涙も")).toBe(
      normalizeLyricLookupText("明けない夜に溢れた涙も"),
    );
  });

  it("converts synchronized romaji into phrase-level furigana", () => {
    expect(romanizationToHiragana("fu ta ri da ke")).toBe("ふたりだけ");

    const converted = convertSungReadingToFurigana(
      "二人だけの空が広がる夜に",
      "fu ta ri da ke no so ra ga hi ro ga ru yo ru ni",
      "hiragana",
    );

    expect(converted).toContain(
      "<ruby>二人<rp>(</rp><rt>ふたり</rt><rp>)</rp></ruby>だけの",
    );
    expect(converted).toContain("<ruby>空<rp>(</rp><rt>そら</rt>");
    expect(converted).toContain("<ruby>夜<rp>(</rp><rt>よる</rt>");
  });

  it("handles sung particle pronunciation and display modes", () => {
    const converted = convertSungReadingToFurigana(
      "明日は晴れる",
      "a shi ta wa ha re ru",
      "katakana",
    );

    expect(converted).toContain("<rt>アシタ</rt>");
    expect(converted).toContain("<rt>ハ</rt>");
    expect(converted).toContain("は");
  });

  it("requires an exact title and artist, then prefers the matching album", () => {
    const candidate = selectBestSearchCandidate(
      [
        {
          id: "1",
          name: "夜に駆ける",
          artist: ["YOASOBI"],
          album: "夜に駆ける",
        },
        {
          id: "2",
          name: "夜に駆ける",
          artist: ["YOASOBI"],
          album: "THE BOOK",
        },
        {
          id: "3",
          name: "夜に駆ける",
          artist: ["Cover Artist"],
          album: "THE BOOK",
        },
        {
          id: "4",
          name: "夜に駆ける",
          artist: ["YOASOBI Tribute"],
          album: "THE BOOK",
        },
      ],
      track,
    );

    expect(candidate?.id).toBe("2");
  });

  it("fetches only after a strict match and builds a usable index", async () => {
    const request = vi.fn(async (url: string) => {
      if (url.includes("types=search")) {
        return [
          {
            id: "1409311773",
            lyric_id: "1409311773",
            name: "夜に駆ける",
            artist: ["YOASOBI"],
            album: "THE BOOK",
          },
        ];
      }
      return {
        lrc: { lyric: lyrics },
        romalrc: { lyric: romanizedLyrics },
      };
    });

    const result = await fetchOnlineReadingResult(track, request);

    expect(result?.providerTrackId).toBe("1409311773");
    expect(Object.keys(result?.readings ?? {})).toHaveLength(2);
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[1]?.[0]).toContain("rv=-1");
  });

  it("caches successful and negative lookups with different expiry windows", () => {
    const { storage, values } = createStorage();
    const result: OnlineReadingResult = {
      provider: "netease",
      providerTrackId: "1409311773",
      readings: buildOnlineReadingIndex(lyrics, romanizedLyrics),
    };
    const now = 1_000_000;

    setCachedOnlineReading(storage, track.uri, result, now);
    expect(getCachedOnlineReading(storage, track.uri, now + 1).result).toEqual(
      result,
    );
    expect(values.get(ONLINE_CACHE_KEY)).toContain("1409311773");

    setCachedOnlineReading(storage, "spotify:track:missing", null, now);
    expect(
      getCachedOnlineReading(storage, "spotify:track:missing", now + 1),
    ).toEqual({ found: true, result: null });
    expect(
      getCachedOnlineReading(
        storage,
        "spotify:track:missing",
        now + 7 * 60 * 60 * 1000,
      ).found,
    ).toBe(false);

    clearOnlineReadingCache(storage);
    expect(getCachedOnlineReading(storage, track.uri, now + 1).found).toBe(
      false,
    );
  });
});
