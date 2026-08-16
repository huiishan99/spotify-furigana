const react = Spicetify.React;
const furiganaSettingKey = "spotify-furigana:enabled";
const furiganaSettingEvent = "spotify-furigana:setting-change";

function SpotifyFuriganaApp() {
  const [enabled, setEnabled] = react.useState(
    () => Spicetify.LocalStorage.get(furiganaSettingKey) !== "false",
  );

  const toggle = () => {
    const nextEnabled = !enabled;
    Spicetify.LocalStorage.set(furiganaSettingKey, String(nextEnabled));
    window.dispatchEvent(
      new CustomEvent(furiganaSettingEvent, {
        detail: { enabled: nextEnabled },
      }),
    );
    setEnabled(nextEnabled);
  };

  react.useEffect(() => {
    const syncEnabled = (event) => {
      if (typeof event.detail?.enabled === "boolean") {
        setEnabled(event.detail.enabled);
      }
    };

    window.addEventListener(furiganaSettingEvent, syncEnabled);
    return () => window.removeEventListener(furiganaSettingEvent, syncEnabled);
  }, []);

  return react.createElement(
    "section",
    { className: "contentSpacing spotify-furigana-app" },
    react.createElement("p", { className: "spotify-furigana-app__eyebrow" }, "日本語歌词辅助"),
    react.createElement("h1", null, "Furigana for Spotify"),
    react.createElement(
      "p",
      { className: "spotify-furigana-app__lead" },
      "在 Windows Spotify 桌面端的日语歌词汉字上方显示平假名读音。分析完全在本地完成。",
    ),
    react.createElement(
      "div",
      { className: "spotify-furigana-app__card" },
      react.createElement("div", null,
        react.createElement("strong", null, "歌词振假名"),
        react.createElement("p", null, enabled ? "当前已开启" : "当前已关闭"),
      ),
      react.createElement(
        "button",
        {
          className: "spotify-furigana-app__toggle",
          type: "button",
          "aria-pressed": enabled,
          onClick: toggle,
        },
        enabled ? "关闭" : "开启",
      ),
    ),
    react.createElement(
      "p",
      { className: "spotify-furigana-app__hint" },
      "也可以点击播放器底部带歌词图标的 Furigana 按钮快速开关。首次显示日语歌词时，本地词典需要短暂加载。",
    ),
  );
}

function render() {
  return react.createElement(SpotifyFuriganaApp);
}
