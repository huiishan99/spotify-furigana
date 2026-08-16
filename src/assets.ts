export function getDictionaryPath(origin: string): string {
  return new URL("/assets/spotify-furigana/dict/", origin).href;
}
