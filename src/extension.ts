import { getDictionaryPath } from "./assets";
import {
  convertToFurigana,
  createSafeFuriganaFragment,
} from "./reading-engine";
import {
  type FuriganaSettings,
  getFuriganaSettings,
  setFuriganaSettings,
  SETTING_CHANGE_EVENT,
} from "./settings";
import { LYRIC_SELECTOR } from "./lyrics";
import { PLAYBAR_FU_ICON } from "./icon";
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
      font-size: var(--spotify-furigana-size, 0.46em);
      font-weight: 500;
      line-height: 1;
      opacity: var(--spotify-furigana-opacity, 0.82);
      position: relative;
      top: calc(-1 * var(--spotify-furigana-gap, 0px));
      user-select: none;
    }

    [data-spotify-furigana="ready"] ruby.spotify-furigana__ruby rp {
      display: none;
    }
  `;
  document.head.appendChild(style);
}

function applyAppearance(settings: FuriganaSettings): void {
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty("--spotify-furigana-size", `${settings.size}em`);
  rootStyle.setProperty(
    "--spotify-furigana-opacity",
    String(settings.opacity),
  );
  rootStyle.setProperty("--spotify-furigana-gap", `${settings.gap}px`);
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
  const lineGeneration = new WeakMap<HTMLElement, number>();

  let settings = getFuriganaSettings();
  let enabled = settings.enabled;
  let generationCounter = 0;
  let engineUnavailable = false;
  let scanFrame: number | undefined;
  let reportedEngineError = false;

  function forgetLine(line: HTMLElement): void {
    line.removeAttribute(STATE_ATTRIBUTE);
    originalNodes.delete(line);
    sourceText.delete(line);
    lineGeneration.delete(line);
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
    const generation = ++generationCounter;
    lineGeneration.set(line, generation);
    line.setAttribute(STATE_ATTRIBUTE, "pending");

    try {
      const converted = await convertToFurigana(
        source,
        dictionaryPath,
        settings.readingMode,
      );

      if (lineGeneration.get(line) !== generation) {
        return;
      }

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
      if (lineGeneration.get(line) !== generation) {
        return;
      }

      engineUnavailable = true;
      restoreLine(line);
      if (!reportedEngineError) {
        reportedEngineError = true;
        console.warn("[Furigana for Spotify] Reading engine failed to load.", error);
        Spicetify.showNotification("Furigana 词典加载失败", true);
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

  function applySettings(
    nextSettings: FuriganaSettings,
    announce = false,
    broadcast = false,
  ): void {
    const enabledChanged = nextSettings.enabled !== enabled;
    const readingModeChanged = nextSettings.readingMode !== settings.readingMode;
    const appearanceChanged =
      nextSettings.size !== settings.size ||
      nextSettings.opacity !== settings.opacity ||
      nextSettings.gap !== settings.gap;

    if (!enabledChanged && !readingModeChanged && !appearanceChanged) {
      return;
    }

    settings = nextSettings;
    enabled = settings.enabled;
    setFuriganaSettings(settings);
    applyAppearance(settings);
    playbarButton.active = enabled;
    playbarButton.label = enabled ? "关闭歌词振假名" : "开启歌词振假名";

    if (readingModeChanged) {
      restoreAll();
    }

    if (enabled && (enabledChanged || readingModeChanged)) {
      engineUnavailable = false;
      scheduleScan();
    } else if (!enabled && enabledChanged) {
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
          detail: { enabled, settings },
        }),
      );
    }
  }

  const playbarButton = new Spicetify.Playbar.Button(
    enabled ? "关闭歌词振假名" : "开启歌词振假名",
    PLAYBAR_FU_ICON,
    () =>
      applySettings({ ...settings, enabled: !enabled }, true, true),
    false,
    enabled,
  );

  window.addEventListener(SETTING_CHANGE_EVENT, (event) => {
    const detail = (event as CustomEvent<{ settings?: unknown }>).detail;
    if (detail?.settings !== settings) {
      applySettings(getFuriganaSettings());
    }
  });

  const observer = new MutationObserver(scheduleScan);
  observer.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  applyAppearance(settings);
  scheduleScan();
}

void main();
