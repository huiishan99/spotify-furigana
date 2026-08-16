const KANJI_PATTERN = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff々〆ヵヶ]/u;

export function hasKanji(value: string): boolean {
  return KANJI_PATTERN.test(value);
}

export function normalizeLyricText(value: string | null): string {
  return value?.replace(/\s+/gu, " ").trim() ?? "";
}

export function shouldAnnotateLyric(value: string | null): boolean {
  const normalized = normalizeLyricText(value);
  return normalized.length > 0 && normalized.length <= 300 && hasKanji(normalized);
}
