import { browser, type Browser } from "wxt/browser";

const ENABLED_KEY = "enabled";

export async function isFuriganaEnabled(): Promise<boolean> {
  const stored = await browser.storage.local.get(ENABLED_KEY);
  return stored[ENABLED_KEY] !== false;
}

export async function setFuriganaEnabled(enabled: boolean): Promise<void> {
  await browser.storage.local.set({ [ENABLED_KEY]: enabled });
}

export function isEnabledChange(
  changes: Record<string, Browser.storage.StorageChange>,
): boolean | undefined {
  const change = changes[ENABLED_KEY];
  return typeof change?.newValue === "boolean" ? change.newValue : undefined;
}
