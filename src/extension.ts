import { getDictionaryPath } from "./assets";
import {
  convertToFurigana,
  createSafeFuriganaFragment,
} from "./reading-engine";
import {
  isFuriganaEnabled,
  setFuriganaEnabled,
  SETTING_CHANGE_EVENT,
} from "./settings";
import { LYRIC_SELECTOR } from "./lyrics";
import { normalizeLyricText, shouldAnnotateLyric } from "./text";

const STATE_ATTRIBUTE = "data-spotify-furigana";
const STYLE_ID = "spotify-furigana-styles";
const READY_INTERVAL_MS = 100;

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    [data-spotify-furigana="ready"] ruby.spotify-furigana__ruby {
      ruby-align: center;
      ruby-position: over;
    }

    [data-spotify-furigana="ready"] ruby.spotify-furigana__ruby rt {
      color: inherit;
      font-size: 0.46em;
      font-weight: 500;
      line-height: 1;
      opacity: 0.82;
      user-select: none;
    }

    [data-spotify-furigana="ready"] ruby.spotify-furigana__ruby rp {
      display: none;
    }
  `;
  document.head.appendChild(style);
}

function isSpicetifyReady(): boolean {
  return (
    typeof Spicetify !== "undefined" &&
    Boolean(Spicetify.Player) &&
    Boolean(Spicetify.Platform) &&
    Boolean(Spicetify.LocalStorage) &&
    Boolean(Spicetify.Playbar?.Button) &&
    typeof Spicetify.showNotification === "function"
  );
}

async function waitForSpicetify(): Promise<void> {
  while (!isSpicetifyReady()) {
    await new Promise((resolve) => window.setTimeout(resolve, READY_INTERVAL_MS));
  }
}

async function main(): Promise<void> {
  await waitForSpicetify();
  injectStyles();

  const dictionaryPath = getDictionaryPath();
  const originalNodes = new WeakMap<HTMLElement, Node[]>();
  const sourceText = new WeakMap<HTMLElement, string>();

  let enabled = isFuriganaEnabled();
  let engineUnavailable = false;
  let scanFrame: number | undefined;
  let reportedEngineError = false;

  function forgetLine(line: HTMLElement): void {
    line.removeAttribute(STATE_ATTRIBUTE);
    originalNodes.delete(line);
    sourceText.delete(line);
  }

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

    forgetLine(line);
  }

  function restoreAll(): void {
    document
      .querySelectorAll<HTMLElement>(`[${STATE_ATTRIBUTE}]`)
      .forEach(restoreLine);
  }

  function getAnnotatedSource(line: HTMLElement): string {
    const copy = line.cloneNode(true) as HTMLElement;
    copy.querySelectorAll("rt, rp").forEach((annotation) => annotation.remove());
    return normalizeLyricText(copy.textContent);
  }

  async function annotateLine(line: HTMLElement): Promise<void> {
    const state = line.getAttribute(STATE_ATTRIBUTE);
    if (state === "pending") {
      return;
    }

    if (state === "ready") {
      const previousSource = sourceText.get(line);
      if (
        previousSource !== undefined &&
        line.querySelector("ruby.spotify-furigana__ruby") &&
        getAnnotatedSource(line) === previousSource
      ) {
        return;
      }

      forgetLine(line);
    }

    const source = normalizeLyricText(line.textContent);
    if (!shouldAnnotateLyric(source)) {
      return;
    }

    originalNodes.set(line, Array.from(line.childNodes));
    sourceText.set(line, source);
    line.setAttribute(STATE_ATTRIBUTE, "pending");

    try {
      const converted = await convertToFurigana(source, dictionaryPath);
      const currentText = normalizeLyricText(line.textContent);

      if (!line.isConnected || currentText !== source) {
        forgetLine(line);
        if (line.isConnected) {
          scheduleScan();
        }
        return;
      }

      if (!enabled || line.getAttribute(STATE_ATTRIBUTE) !== "pending") {
        if (line.isConnected && line.hasAttribute(STATE_ATTRIBUTE)) {
          restoreLine(line);
        }
        return;
      }

      line.replaceChildren(
        createSafeFuriganaFragment(converted, line.ownerDocument),
      );
      line.setAttribute(STATE_ATTRIBUTE, "ready");
    } catch (error: unknown) {
      engineUnavailable = true;
      restoreLine(line);
      if (!reportedEngineError) {
        reportedEngineError = true;
        console.warn("[Spotify Furigana] Reading engine failed to load.", error);
        Spicetify.showNotification("Spotify Furigana 词典加载失败", true);
      }
    }
  }

  function scan(): void {
    scanFrame = undefined;
    if (!enabled || engineUnavailable) {
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

  function applyEnabled(
    nextEnabled: boolean,
    announce = false,
    broadcast = false,
  ): void {
    if (nextEnabled === enabled) {
      return;
    }

    enabled = nextEnabled;
    setFuriganaEnabled(enabled);
    playbarButton.active = enabled;
    playbarButton.label = enabled ? "关闭歌词振假名" : "开启歌词振假名";

    if (enabled) {
      engineUnavailable = false;
      scheduleScan();
    } else {
      restoreAll();
    }

    if (announce) {
      Spicetify.showNotification(
        enabled ? "歌词振假名已开启" : "歌词振假名已关闭",
      );
    }

    if (broadcast) {
      window.dispatchEvent(
        new CustomEvent(SETTING_CHANGE_EVENT, {
          detail: { enabled },
        }),
      );
    }
  }

  const playbarButton = new Spicetify.Playbar.Button(
    enabled ? "关闭歌词振假名" : "开启歌词振假名",
    "lyrics",
    () => applyEnabled(!enabled, true, true),
    false,
    enabled,
  );

  window.addEventListener(SETTING_CHANGE_EVENT, (event) => {
    const nextEnabled = (event as CustomEvent<{ enabled?: unknown }>).detail
      ?.enabled;
    if (typeof nextEnabled === "boolean") {
      applyEnabled(nextEnabled);
    }
  });

  const observer = new MutationObserver(scheduleScan);
  observer.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  scheduleScan();
}

void main();
