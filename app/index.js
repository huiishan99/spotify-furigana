const react = Spicetify.React;
const settingEvent = "spotify-furigana:setting-change";

const settingKeys = {
  enabled: "spotify-furigana:enabled",
  readingMode: "spotify-furigana:reading-mode",
  size: "spotify-furigana:size",
  opacity: "spotify-furigana:opacity",
  gap: "spotify-furigana:gap",
};

const defaultSettings = {
  enabled: true,
  readingMode: "hiragana",
  size: 0.46,
  opacity: 0.82,
  gap: 0,
};

const readingModes = ["hiragana", "katakana", "romaji"];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function readNumber(key, fallback, min, max) {
  const raw = Spicetify.LocalStorage.get(key);
  if (raw === null || raw.trim() === "") {
    return fallback;
  }

  const value = Number(raw);
  return Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

function readSettings() {
  const readingMode = Spicetify.LocalStorage.get(settingKeys.readingMode);
  return {
    enabled: Spicetify.LocalStorage.get(settingKeys.enabled) !== "false",
    readingMode: readingModes.includes(readingMode) ? readingMode : "hiragana",
    size: readNumber(settingKeys.size, defaultSettings.size, 0.3, 0.75),
    opacity: readNumber(
      settingKeys.opacity,
      defaultSettings.opacity,
      0.4,
      1,
    ),
    gap: readNumber(settingKeys.gap, defaultSettings.gap, 0, 8),
  };
}

function persistSettings(settings) {
  Object.entries(settings).forEach(([name, value]) => {
    Spicetify.LocalStorage.set(settingKeys[name], String(value));
  });
  window.dispatchEvent(
    new CustomEvent(settingEvent, {
      detail: { enabled: settings.enabled, settings, source: "app" },
    }),
  );
}

function SettingSlider({ label, value, min, max, step, valueLabel, onChange }) {
  return react.createElement(
    "label",
    { className: "spotify-furigana-app__slider" },
    react.createElement(
      "span",
      { className: "spotify-furigana-app__slider-heading" },
      react.createElement("strong", null, label),
      react.createElement("output", null, valueLabel),
    ),
    react.createElement("input", {
      type: "range",
      min,
      max,
      step,
      value,
      onChange: (event) => onChange(Number(event.target.value)),
    }),
  );
}

function SpotifyFuriganaApp() {
  const [settings, setSettings] = react.useState(readSettings);
  const settingsRef = react.useRef(settings);
  settingsRef.current = settings;

  const updateSettings = (patch) => {
    const next = { ...settingsRef.current, ...patch };
    settingsRef.current = next;
    persistSettings(next);
    setSettings(next);
  };

  react.useEffect(() => {
    const syncSettings = (event) => {
      if (event.detail?.source !== "app") {
        const next = readSettings();
        settingsRef.current = next;
        setSettings(next);
      }
    };
    window.addEventListener(settingEvent, syncSettings);
    return () => window.removeEventListener(settingEvent, syncSettings);
  }, []);

  const runtimeVersion = Spicetify.Config?.version || "unknown";
  const runtimeReady = Boolean(
    Spicetify.Player && Spicetify.LocalStorage && Spicetify.Playbar,
  );

  return react.createElement(
    "section",
    { className: "contentSpacing spotify-furigana-app" },
    react.createElement(
      "p",
      { className: "spotify-furigana-app__eyebrow" },
      "日本語歌词辅助",
    ),
    react.createElement("h1", null, "Furigana for Spotify"),
    react.createElement(
      "p",
      { className: "spotify-furigana-app__lead" },
      "在 Windows Spotify 桌面端的日语歌词汉字上方显示平假名、片假名或罗马字。分析完全在本地完成。",
    ),
    react.createElement(
      "div",
      { className: "spotify-furigana-app__card" },
      react.createElement(
        "div",
        null,
        react.createElement("strong", null, "歌词注音"),
        react.createElement(
          "p",
          null,
          settings.enabled ? "当前已开启" : "当前已关闭",
        ),
      ),
      react.createElement(
        "button",
        {
          className: "spotify-furigana-app__toggle",
          type: "button",
          "aria-pressed": settings.enabled,
          onClick: () => updateSettings({ enabled: !settings.enabled }),
        },
        settings.enabled ? "关闭" : "开启",
      ),
    ),
    react.createElement(
      "div",
      { className: "spotify-furigana-app__panel" },
      react.createElement(
        "div",
        { className: "spotify-furigana-app__panel-heading" },
        react.createElement(
          "div",
          null,
          react.createElement("h2", null, "注音显示"),
          react.createElement("p", null, "所有调整都会自动保存并实时应用。"),
        ),
        react.createElement(
          "button",
          {
            className: "spotify-furigana-app__reset",
            type: "button",
            onClick: () =>
              updateSettings({
                ...defaultSettings,
                enabled: settings.enabled,
              }),
          },
          "恢复默认",
        ),
      ),
      react.createElement(
        "strong",
        { className: "spotify-furigana-app__label" },
        "读音形式",
      ),
      react.createElement(
        "div",
        {
          className: "spotify-furigana-app__segments",
          role: "group",
          "aria-label": "读音形式",
        },
        ...[
          ["hiragana", "平假名"],
          ["katakana", "片假名"],
          ["romaji", "罗马字"],
        ].map(([mode, label]) =>
          react.createElement(
            "button",
            {
              key: mode,
              type: "button",
              className:
                settings.readingMode === mode
                  ? "spotify-furigana-app__segment is-active"
                  : "spotify-furigana-app__segment",
              "aria-pressed": settings.readingMode === mode,
              onClick: () => updateSettings({ readingMode: mode }),
            },
            label,
          ),
        ),
      ),
      react.createElement(
        "div",
        { className: "spotify-furigana-app__sliders" },
        react.createElement(SettingSlider, {
          label: "字号",
          value: settings.size,
          min: 0.3,
          max: 0.75,
          step: 0.01,
          valueLabel: `${Math.round(settings.size * 100)}%`,
          onChange: (size) => updateSettings({ size }),
        }),
        react.createElement(SettingSlider, {
          label: "透明度",
          value: settings.opacity,
          min: 0.4,
          max: 1,
          step: 0.01,
          valueLabel: `${Math.round(settings.opacity * 100)}%`,
          onChange: (opacity) => updateSettings({ opacity }),
        }),
        react.createElement(SettingSlider, {
          label: "上下间距",
          value: settings.gap,
          min: 0,
          max: 8,
          step: 1,
          valueLabel: `${settings.gap}px`,
          onChange: (gap) => updateSettings({ gap }),
        }),
      ),
    ),
    react.createElement(
      "div",
      { className: "spotify-furigana-app__status" },
      react.createElement("span", {
        className: runtimeReady ? "is-ready" : "is-error",
      }),
      react.createElement(
        "span",
        null,
        runtimeReady
          ? `运行时正常 · Spicetify ${runtimeVersion}`
          : "运行时 API 不完整，请重新运行 spicetify apply",
      ),
    ),
    react.createElement(
      "p",
      { className: "spotify-furigana-app__hint" },
      "也可以点击播放器底部的歌词图标快速开关。切换读音形式时会重新生成当前歌词；本地词典首次加载可能需要片刻。",
    ),
  );
}

function render() {
  return react.createElement(SpotifyFuriganaApp);
}
