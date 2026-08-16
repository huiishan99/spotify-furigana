declare module "kuroshiro" {
  interface ConvertOptions {
    mode?: "normal" | "spaced" | "okurigana" | "furigana";
    romajiSystem?: "nippon" | "passport" | "hepburn";
    to?: "hiragana" | "katakana" | "romaji";
  }

  export default class Kuroshiro {
    init(analyzer: unknown): Promise<void>;
    convert(value: string, options?: ConvertOptions): Promise<string>;
  }
}

declare module "kuroshiro-analyzer-kuromoji" {
  interface KuromojiAnalyzerOptions {
    dictPath?: string;
  }

  export default class KuromojiAnalyzer {
    constructor(options?: KuromojiAnalyzerOptions);
  }
}
