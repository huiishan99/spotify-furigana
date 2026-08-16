export const ENABLED_KEY = "spotify-furigana:enabled";
export const SETTING_CHANGE_EVENT = "spotify-furigana:setting-change";

export function isFuriganaEnabled(): boolean {
  return Spicetify.LocalStorage.get(ENABLED_KEY) !== "false";
}

export function setFuriganaEnabled(enabled: boolean): void {
  Spicetify.LocalStorage.set(ENABLED_KEY, String(enabled));
}
