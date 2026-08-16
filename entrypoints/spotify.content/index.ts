import { browser, type Browser } from "wxt/browser";
import {
  convertToFurigana,
  createSafeFuriganaFragment,
} from "../../src/reading-engine";
import {
  isEnabledChange,
  isFuriganaEnabled,
} from "../../src/settings";
import {
  normalizeLyricText,
  shouldAnnotateLyric,
} from "../../src/text";
import "./style.css";

const LYRIC_SELECTOR = [
  '[data-testid="lyrics-line"]',
  '[data-testid="fullscreen-lyric"]',
].join(",");

const STATE_ATTRIBUTE = "data-spotify-furigana";

export default defineContentScript({
  matches: ["https://open.spotify.com/*"],
  runAt: "document_idle",
  async main(ctx) {
    let enabled = await isFuriganaEnabled();
    let scanFrame: number | undefined;
    let reportedEngineError = false;

    const originalNodes = new WeakMap<HTMLElement, Node[]>();
    const sourceText = new WeakMap<HTMLElement, string>();

    function restoreLine(line: HTMLElement): void {
      const originals = originalNodes.get(line);
      if (originals) {
        line.replaceChildren(...originals);
      } else {
        const source = sourceText.get(line);
        if (source !== undefined) {
          line.textContent = source;
        }
      }

      line.removeAttribute(STATE_ATTRIBUTE);
      originalNodes.delete(line);
      sourceText.delete(line);
    }

    function restoreAll(): void {
      document
        .querySelectorAll<HTMLElement>(`[${STATE_ATTRIBUTE}]`)
        .forEach(restoreLine);
    }

    async function annotateLine(line: HTMLElement): Promise<void> {
      const state = line.getAttribute(STATE_ATTRIBUTE);
      if (
        state === "pending" ||
        (state === "ready" &&
          line.querySelector("ruby.spotify-furigana__ruby"))
      ) {
        return;
      }

      if (state === "ready") {
        originalNodes.delete(line);
        sourceText.delete(line);
        line.removeAttribute(STATE_ATTRIBUTE);
      }

      const source = normalizeLyricText(line.textContent);
      if (!shouldAnnotateLyric(source)) {
        return;
      }

      const originals = Array.from(line.childNodes);
      originalNodes.set(line, originals);
      sourceText.set(line, source);
      line.setAttribute(STATE_ATTRIBUTE, "pending");

      try {
        const converted = await convertToFurigana(source);

        if (
          !enabled ||
          !line.isConnected ||
          line.getAttribute(STATE_ATTRIBUTE) !== "pending" ||
          normalizeLyricText(line.textContent) !== source
        ) {
          if (line.isConnected && line.getAttribute(STATE_ATTRIBUTE)) {
            restoreLine(line);
          }
          return;
        }

        line.replaceChildren(
          createSafeFuriganaFragment(converted, line.ownerDocument),
        );
        line.setAttribute(STATE_ATTRIBUTE, "ready");
      } catch (error: unknown) {
        restoreLine(line);
        if (!reportedEngineError) {
          reportedEngineError = true;
          console.warn("[Spotify Furigana] Reading engine failed to load.", error);
        }
      }
    }

    function scan(): void {
      scanFrame = undefined;
      if (!enabled) {
        return;
      }

      document
        .querySelectorAll<HTMLElement>(LYRIC_SELECTOR)
        .forEach((line) => void annotateLine(line));
    }

    function scheduleScan(): void {
      if (scanFrame === undefined) {
        scanFrame = requestAnimationFrame(scan);
      }
    }

    const observer = new MutationObserver(scheduleScan);
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    const onStorageChanged = (
      changes: Record<string, Browser.storage.StorageChange>,
      areaName: string,
    ): void => {
      if (areaName !== "local") {
        return;
      }

      const nextEnabled = isEnabledChange(changes);
      if (nextEnabled === undefined || nextEnabled === enabled) {
        return;
      }

      enabled = nextEnabled;
      if (enabled) {
        scheduleScan();
      } else {
        restoreAll();
      }
    };

    browser.storage.onChanged.addListener(onStorageChanged);
    scheduleScan();

    ctx.onInvalidated(() => {
      observer.disconnect();
      browser.storage.onChanged.removeListener(onStorageChanged);
      if (scanFrame !== undefined) {
        cancelAnimationFrame(scanFrame);
      }
      restoreAll();
    });
  },
});
