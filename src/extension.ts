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
import {
  clearOnlineReadingCache,
  fetchOnlineReadingResult,
  findOnlineRomanization,
  getCachedOnlineReading,
  ONLINE_CACHE_CLEAR_EVENT,
  ONLINE_STATUS_EVENT,
  ONLINE_STATUS_KEY,
  type OnlineReadingIndex,
  type OnlineReadingStatus,
  type OnlineTrackMetadata,
  setCachedOnlineReading,
} from "./online-readings";

const STATE_ATTRIBUTE = "data-spotify-furigana";
const STYLE_ID = "spotify-furigana-styles";
const READY_INTERVAL_MS = 100;
const ONLINE_REQUEST_TIMEOUT_MS = 10_000;

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
    Boolean(Spicetify.CosmosAsync) &&
    Boolean(Spicetify.Playbar?.Button) &&
    typeof Spicetify.showNotification === "function"
  );
}

async function waitForSpicetify(): Promise<void> {
  while (!isSpicetifyReady()) {
    await new Promise((resolve) => window.setTimeout(resolve, READY_INTERVAL_MS));
  }
}

function getCurrentTrackMetadata(): OnlineTrackMetadata | null {
  const item = Spicetify.Player.data?.item;
  const metadata = item?.metadata ?? {};
  const uri = item?.uri;
  const title = item?.name ?? metadata.title;
  const artist =
    metadata.artist_name ?? metadata.artist ?? metadata.artist_names;
  const album = metadata.album_title ?? metadata.album_name ?? "";

  if (
    typeof uri !== "string" ||
    !uri.startsWith("spotify:track:") ||
    typeof title !== "string" ||
    !title.trim() ||
    typeof artist !== "string" ||
    !artist.trim()
  ) {
    return null;
  }

  return {
    uri,
    title: title.trim(),
    artist: artist.trim(),
    album: typeof album === "string" ? album.trim() : "",
  };
}

async function requestOnlineJson(
  url: string,
  headers?: Record<string, string>,
): Promise<unknown> {
  let timeoutId: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(
      () => reject(new Error("Online reading request timed out.")),
      ONLINE_REQUEST_TIMEOUT_MS,
    );
  });

  try {
    return await Promise.race([
      Spicetify.CosmosAsync.get(url, null, headers),
      timeout,
    ]);
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
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
  let activeOnlineTrackUri: string | undefined;
  let onlineReadings: OnlineReadingIndex | undefined;
  let onlineLoadGeneration = 0;

  function publishOnlineStatus(status: OnlineReadingStatus): void {
    Spicetify.LocalStorage.set(ONLINE_STATUS_KEY, JSON.stringify(status));
    window.dispatchEvent(
      new CustomEvent(ONLINE_STATUS_EVENT, { detail: status }),
    );
  }

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

  async function refreshOnlineReadings(): Promise<void> {
    const generation = ++onlineLoadGeneration;
    const track = getCurrentTrackMetadata();
    activeOnlineTrackUri = track?.uri;
    onlineReadings = undefined;

    if (!settings.onlineReadings) {
      publishOnlineStatus({
        state: "idle",
        message: "在线精准读音未开启",
      });
      return;
    }

    if (!track) {
      publishOnlineStatus({
        state: "fallback",
        message: "当前没有可查询的 Spotify 曲目，使用本地词典",
      });
      return;
    }

    const cached = getCachedOnlineReading(Spicetify.LocalStorage, track.uri);
    if (cached.found) {
      onlineReadings = cached.result?.readings;
      publishOnlineStatus(
        cached.result
          ? { state: "ready", message: "已从本地缓存加载同步读音" }
          : {
              state: "fallback",
              message: "当前歌曲暂无同步读音，使用本地词典",
            },
      );
      restoreAll();
      scheduleScan();
      return;
    }

    publishOnlineStatus({
      state: "loading",
      message: "正在查询当前歌曲的同步读音…",
    });

    try {
      const result = await fetchOnlineReadingResult(track, requestOnlineJson);
      if (
        generation !== onlineLoadGeneration ||
        activeOnlineTrackUri !== track.uri
      ) {
        return;
      }

      setCachedOnlineReading(Spicetify.LocalStorage, track.uri, result);
      onlineReadings = result?.readings;
      publishOnlineStatus(
        result
          ? {
              state: "ready",
              message: `已匹配 ${Object.keys(result.readings).length} 行同步读音`,
            }
          : {
              state: "fallback",
              message: "当前歌曲暂无同步读音，使用本地词典",
            },
      );
    } catch (error: unknown) {
      if (generation !== onlineLoadGeneration) {
        return;
      }
      console.warn(
        "[Furigana for Spotify] Online readings were unavailable.",
        error,
      );
      publishOnlineStatus({
        state: "error",
        message: "在线读音暂时不可用，已自动使用本地词典",
      });
    }

    restoreAll();
    scheduleScan();
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

    const sungRomanization =
      activeOnlineTrackUri === getCurrentTrackMetadata()?.uri
        ? findOnlineRomanization(onlineReadings, source)
        : undefined;
    if (engineUnavailable && !sungRomanization) {
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
        sungRomanization,
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
    if (!enabled || (engineUnavailable && !onlineReadings)) {
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
    const onlineReadingsChanged =
      nextSettings.onlineReadings !== settings.onlineReadings;

    if (
      !enabledChanged &&
      !readingModeChanged &&
      !appearanceChanged &&
      !onlineReadingsChanged
    ) {
      return;
    }

    settings = nextSettings;
    enabled = settings.enabled;
    setFuriganaSettings(settings);
    applyAppearance(settings);
    playbarButton.active = enabled;
    playbarButton.label = enabled ? "关闭歌词振假名" : "开启歌词振假名";

    if (readingModeChanged || onlineReadingsChanged) {
      restoreAll();
    }

    if (enabled && (enabledChanged || readingModeChanged)) {
      engineUnavailable = false;
      scheduleScan();
    } else if (!enabled && enabledChanged) {
      restoreAll();
    }

    if (onlineReadingsChanged) {
      if (enabled) {
        scheduleScan();
      }
      void refreshOnlineReadings();
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

  window.addEventListener(ONLINE_CACHE_CLEAR_EVENT, () => {
    onlineLoadGeneration += 1;
    clearOnlineReadingCache(Spicetify.LocalStorage);
    onlineReadings = undefined;
    restoreAll();
    if (settings.onlineReadings) {
      void refreshOnlineReadings();
    } else {
      publishOnlineStatus({
        state: "idle",
        message: "在线缓存已清除",
      });
    }
    if (enabled && !settings.onlineReadings) {
      scheduleScan();
    }
  });

  const observer = new MutationObserver(scheduleScan);
  observer.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  applyAppearance(settings);
  Spicetify.Player.addEventListener("songchange", () => {
    restoreAll();
    void refreshOnlineReadings();
  });
  void refreshOnlineReadings();
  scheduleScan();
}

void main();
