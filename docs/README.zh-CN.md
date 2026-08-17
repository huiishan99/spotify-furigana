<p align="center">
  <a href="../README.md">English</a> · <strong>简体中文</strong> · <a href="./README.ja.md">日本語</a>
</p>

<p align="center">
  <img src="../assets/logo.png" alt="Furigana for Spotify logo" width="168" />
</p>

<h1 align="center">Furigana for Spotify</h1>

<p align="center">
  <strong>在 Windows Spotify 桌面歌词上，为日语汉字实时显示平假名、片假名或罗马字读音。</strong>
  <br />
  默认本地处理 · 可选同步读音 · 无需 Spotify 凭据
</p>

<p align="center">
  <a href="https://github.com/huiishan99/spotify-furigana/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/huiishan99/spotify-furigana/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://github.com/huiishan99/spotify-furigana/releases/latest"><img alt="最新版本" src="https://img.shields.io/github/v/release/huiishan99/spotify-furigana?display_name=tag&amp;label=release&amp;color=00A77D" /></a>
  <a href="https://github.com/huiishan99/spotify-furigana/stargazers"><img alt="GitHub Stars" src="https://img.shields.io/github/stars/huiishan99/spotify-furigana?style=flat&amp;logo=github&amp;color=00A77D" /></a>
  <img alt="Windows 10 and 11" src="https://img.shields.io/badge/Windows-10%20%7C%2011-4F46E5" />
  <img alt="Spotify Desktop 1.2.96 tested" src="https://img.shields.io/badge/Spotify%20Desktop-1.2.96%20tested-16A34A?logo=spotify&amp;logoColor=1ED760&amp;labelColor=191414" />
  <img alt="Spicetify 2.44 tested" src="https://img.shields.io/badge/Spicetify-2.44%20tested-F97366" />
  <a href="../LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-4338CA" /></a>
</p>

> [!IMPORTANT]
> 这是独立社区项目，与 Spotify AB 没有关联，也未获得其赞助或认可。项目自身标志不使用 Spotify 官方 logo；兼容性徽章中的标识仅用于说明目标平台。

> [!TIP]
> 如果这个项目让你更轻松地读完哪怕一首日语歌，欢迎[给它一个 Star](https://github.com/huiishan99/spotify-furigana)。Star 能帮助更多日语学习者发现它。

## 效果

<p align="center">
  <img src="../assets/marketing/demo.gif" alt="Windows Spotify 歌词页面中的实时日语振假名动态效果" width="100%" />
</p>

<p align="center">
  <sub>动图来自真实环境：Windows 11 · Spotify 1.2.96.518 · Spicetify 2.44.0。<a href="../assets/screenshots/lyrics-view.png">查看完整截图。</a>歌词、封面及 Spotify 界面元素的权利归各自权利方所有，仅用于展示插件运行效果。</sub>
</p>

插件直接增强 Spotify 已经显示的歌词，把汉字转换为标准 HTML `<ruby>` 注音：

| 原歌词 | 开启振假名后 |
| --- | --- |
| 声も聞かさないで | <ruby>声<rt>こえ</rt></ruby>も<ruby>聞<rt>き</rt></ruby>かさないで |
| 明日は晴れる | <ruby>明日<rt>あした</rt></ruby>は<ruby>晴<rt>は</rt></ruby>れる |

## 为什么用它

- **跟随原生歌词**：自动处理当前桌面歌词页，并兼容已知的全屏歌词布局。
- **默认完全本地**：Kuroshiro + Kuromoji 在电脑上完成分词与读音转换，不联系歌词服务。
- **可选精准读音**：有同步罗马音时优先采用，可处理 `二人` → `ふたり` 以及歌词中的特殊唱法。
- **自由调整显示**：可切换平假名、片假名与罗马字，并调整字号、透明度和上下间距。
- **保留 Spotify 原生歌词**：只增强 Spotify 当前显示的文字，不替换播放器或歌词时间轴。
- **随时开关**：通过播放器底部的歌词图标按钮，或左侧插件页面控制。

## 环境要求

- Windows 10 或 Windows 11
- Windows Spotify：[spotify.com 桌面版](https://www.spotify.com/download/windows/)或 Microsoft Store 版（二选一，不要同时安装）
- [Spicetify](https://spicetify.app/docs/getting-started)

当前已实机验证：

| 组件 | 验证版本 |
| --- | --- |
| Windows | Windows 11 Pro 10.0.26200 |
| Spotify | Microsoft Store 版 1.2.96.518 |
| Spicetify | 2.44.0 |

其他版本可能也能工作，但尚未逐一验证。

更多版本信息请查看[兼容性矩阵](./COMPATIBILITY.md)。

## 安装

<p>
  <a href="https://github.com/huiishan99/spotify-furigana/releases/latest"><img alt="下载最新版本" src="https://img.shields.io/badge/下载-最新版本-00A77D?style=for-the-badge&amp;logo=github" /></a>
</p>

1. 从[最新 Release](https://github.com/huiishan99/spotify-furigana/releases/latest)下载 `spotify-furigana-vX.Y.Z.zip`。
2. 完整解压 ZIP。
3. 在解压目录中打开 PowerShell，运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

安装器会识别唯一的 Spotify 安装、备份现有 Furigana 版本、安装并启用插件、应用 Spicetify 配置，并在开始菜单创建 **Furigana for Spotify** 启动入口。这个入口使用项目原创的 **「ふ」图标**，方便与 Spotify 原版快捷方式区分。

安装完成后，请从开始菜单打开 **Furigana for Spotify**。它会在启动 Spotify 前检查并重新应用 Spicetify，因此普通重启后插件仍然有效；在受支持的 Spotify 更新后，它也能自动修复。接着播放一首带歌词的日语歌曲并打开歌词页面。第一次转换时，本地词典需要短暂加载。

> [!IMPORTANT]
> Microsoft Store 用户必须使用 **Furigana for Spotify**，不能使用 Spotify 原来的普通快捷方式。安装器生成的入口会通过 `spicetify auto` 带上所需的应用目录；直接打开 Store 应用只会显示未修改的 Spotify。Spicetify 2.44 官方兼容范围只到 Spotify 1.2.93；上表的 Store 1.2.96 已由本项目实机验证，但仍超出 Spicetify 官方范围。

## 更新

下载并解压最新版 Release ZIP，然后再次运行其中的安装器：

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

更新前，安装器会把旧版本保留为带时间戳的备份。

## 调整注音显示

从 Spotify 左侧边栏打开 **Furigana for Spotify**，可以：

- 在平假名、片假名和罗马字之间切换；
- 将注音字号调整为 30%–75%；
- 将透明度调整为 40%–100%；
- 增加最多 8 px 的上下间距；
- 一键恢复默认显示。
- 开启实验性的在线精准读音，并随时清除其本地缓存。

设置会保存在本地并立即生效。

## 在线精准读音与隐私

在线精准读音**默认关闭**。开启后，插件会把当前公开的歌曲名和歌手发送到 GD Studio 搜索接口，再从网易云音乐获取选中曲目的同步歌词与罗马音；Spotify 专辑名只在本机用于筛选，发音数据只用于标注相匹配的 Spotify 歌词行。

插件不会发送 Spotify 凭据、Cookie、账号数据，也不会上传 Spotify 当前显示的歌词。成功结果最多在本机缓存 30 天；无结果会记录 6 小时，避免反复请求；最多保留 30 首歌。可以随时从设置页清除缓存。第三方服务和歌曲覆盖率不作保证，无法匹配时会自动使用本地词典。

## 卸载

```powershell
powershell -ExecutionPolicy Bypass -File .\uninstall.ps1
```

## 常见问题

- **左侧栏没有 Furigana 页面：**运行 `spicetify apply`，然后重新启动 Spotify。
- **按钮出现但歌词没有变化：**确认歌曲有包含汉字的日语歌词、歌词按钮处于开启状态，并等待首次本地词典加载。
- **在线精准读音仍显示“使用本地词典”：**可能是歌词源没有同步罗马音、专辑或歌曲版本无法安全匹配，或者服务暂时不可用。插件会主动拒绝把不可靠结果套到当前歌曲。
- **Spotify 更新后插件消失：**关闭 Spotify，然后从开始菜单打开 **Furigana for Spotify**；必要时手动运行一次 `spicetify backup apply`。
- **安装器检测到两个 Spotify：**保留 Microsoft Store 版或 [spotify.com 桌面版](https://www.spotify.com/download/windows/)中的一个，卸载另一个，打开保留版本至少 60 秒，再重新运行安装器。
- **Microsoft Store 版打开后没有 Furigana：**关闭它，从开始菜单使用 **Furigana for Spotify**；不要使用原来的 Store 快捷方式。

## 已知限制

- 本地模式仍可能读错人名、地名、双关及特殊唱法；在线精准读音能改善已覆盖歌曲，但无法覆盖所有曲目和歌词行。
- Spotify 更新可能改变歌词 DOM；若插件突然失效，请在 issue 中附上 Spotify 与 Spicetify 版本。
- 当前只面向 Windows Spotify 桌面客户端，不支持 Web Player、macOS 或移动端。

## 参与贡献

遇到问题或有新想法？可以提交 [Issue](https://github.com/huiishan99/spotify-furigana/issues)；准备 Pull Request 前请先阅读 [CONTRIBUTING.md](../CONTRIBUTING.md)。

安全问题请按照 [SECURITY.md](../SECURITY.md) 私下报告。

## 分享项目

[docs/LAUNCH_KIT.md](./LAUNCH_KIT.md) 已准备好中、日、英三种发布文案。如果插件对你有帮助，[给仓库一个 Star](https://github.com/huiishan99/spotify-furigana)或提交一份可靠的兼容性报告，就是最有价值的支持。

## 商标声明

Furigana for Spotify 是一个独立开源项目。Spotify、Spotify logo 及相关品牌元素是 Spotify AB 的商标。本项目与 Spotify AB 没有关联，也未获得其赞助或认可。“for Spotify”仅用于说明兼容平台。

项目图标为原创设计，使用“ふ”、注音条和音符表达日语歌词辅助功能。近黑、青翠绿和米白配色用于建立音乐流媒体产品的视觉联想；青翠绿与 Spotify Green 不同，图形也不使用 Spotify 的圆形、波纹或官方标识。参见 [Spotify Design & Branding Guidelines](https://developer.spotify.com/documentation/design)。

## License

[MIT](../LICENSE)
