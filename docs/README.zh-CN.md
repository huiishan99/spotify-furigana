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
  本地处理 · 无需歌词 API · 不上传歌词
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
- **完全本地运行**：Kuroshiro + Kuromoji 在电脑上完成分词与读音转换。
- **自由调整显示**：可切换平假名、片假名与罗马字，并调整字号、透明度和上下间距。
- **不接管歌词来源**：只增强 Spotify 当前显示的文本，不抓取、保存或重新分发歌词。
- **随时开关**：通过播放器底部的歌词图标按钮，或左侧插件页面控制。
- **安全插入 DOM**：只生成经过白名单处理的 `<ruby>`、`<rt>` 和 `<rp>` 节点。

## 环境要求

- Windows 10 或 Windows 11
- Windows Spotify 桌面客户端
- [Spicetify](https://spicetify.app/docs/getting-started)
- Node.js 22 或更高版本（仅构建时需要）

当前已实机验证：

| 组件 | 验证版本 |
| --- | --- |
| Windows | Windows 11 Pro 10.0.26200 |
| Spotify | Microsoft Store 版 1.2.96.518 |
| Spicetify | 2.44.0 |

其他版本可能也能工作，但尚未逐一验证。

请查看[兼容性矩阵](./COMPATIBILITY.md)，其中明确区分实机验证与自动化歌词布局覆盖。

## 安装

### Release 安装包（推荐）

<p>
  <a href="https://github.com/huiishan99/spotify-furigana/releases/latest"><img alt="下载最新版本" src="https://img.shields.io/badge/下载-最新版本-00A77D?style=for-the-badge&amp;logo=github" /></a>
</p>

1. 从[最新 Release](https://github.com/huiishan99/spotify-furigana/releases/latest)下载 `spotify-furigana-vX.Y.Z.zip`。
2. 完整解压 ZIP。
3. 在解压目录中打开 PowerShell，运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

安装包已包含编译后的扩展和 Kuromoji 词典。安装器会先把现有版本保存为带时间戳的备份，然后复制到 Spicetify、启用插件并运行 `spicetify apply`。

### 从源码构建

```powershell
git clone https://github.com/huiishan99/spotify-furigana.git
Set-Location spotify-furigana
npm ci
npm run build
```

### 将源码构建安装到 Spicetify

```powershell
$target = Join-Path $env:APPDATA "spicetify\CustomApps\spotify-furigana"
New-Item -ItemType Directory -Force $target | Out-Null
Copy-Item -Recurse -Force "dist\spotify-furigana\*" $target

spicetify config custom_apps spotify-furigana
spicetify apply
```

重新启动 Spotify，播放一首带歌词的日语歌曲，然后打开歌词页面。第一次转换时，本地词典需要短暂加载。

> [!NOTE]
> Microsoft Store 版 Spotify 只受到 Spicetify 的部分支持。若普通快捷方式没有加载插件，请使用 `spicetify auto` 启动；若遇到 `Cannot find pref_file`，请参阅 [Spicetify FAQ](https://spicetify.app/docs/faq)。

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

设置会保存在本地并立即生效。切换读音形式会重新生成当前可见歌词；外观滑块不需要重新运行分词器。

## 卸载

```powershell
powershell -ExecutionPolicy Bypass -File .\uninstall.ps1
```

## 工作原理

```text
Spotify 歌词 DOM
        ↓
识别含汉字的歌词行
        ↓
Kuroshiro + Kuromoji 转换为所选读音形式
        ↓
安全生成 <ruby> / <rt> 注音
```

## 仓库结构

```text
spotify-furigana/
├── app/          # Spicetify Custom App 页面、样式与 manifest
├── assets/       # 项目 Logo、实机截图与推广素材
├── docs/         # 中文、日文 README
├── packaging/    # Release 安装器、卸载器与离线说明
├── scripts/      # 构建与资源复制脚本
├── src/          # 歌词观察、选择器、设置与读音引擎
├── tests/        # Vitest 单元测试
├── types/        # Kuroshiro 与 Spicetify 类型声明
├── manifest.json # Spicetify Marketplace 发现元数据
└── README.md     # 英文默认入口
```

关键代码：

- `src/extension.ts`：观察歌词 DOM、管理开关并更新歌词行。
- `src/lyrics.ts`：维护新旧 Spotify 歌词布局选择器。
- `src/reading-engine.ts`：本地读音转换与安全 DOM 构建。
- `scripts/build.mjs`：打包扩展并复制 Kuromoji 词典。

当前结构已经按运行层、源码、测试、构建、类型和文档分开，无需为了目录美观重排代码。

## 开发

```powershell
npm ci
npm run check
npm run marketing-assets
npm run package
```

`npm run check` 会依次执行 TypeScript 检查、Vitest 测试和生产构建。`npm run marketing-assets` 会使用项目原始 Logo 和真实截图，确定性地重新生成社交封面与演示动图。`npm run package` 会在被 Git 忽略的 `release/` 目录中生成可直接安装的 ZIP 和 SHA-256 校验文件。

## 已知限制

- 人名、地名、歌词双关和刻意变化的读法可能标注错误。
- Spotify 更新可能改变歌词 DOM；若插件突然失效，请在 issue 中附上 Spotify 与 Spicetify 版本。
- 当前只面向 Windows Spotify 桌面客户端，不支持 Web Player、macOS 或移动端。

## 路线图

- [x] 调整注音字号、透明度和上下间距
- [x] 平假名、片假名与罗马字显示模式
- [x] 一条命令安装与更新
- [x] 公开兼容性矩阵及当前/旧版歌词布局自动化覆盖
- [x] 发布到 Spicetify Marketplace 发现机制

最初的 v0.1 路线图已经全部完成。后续功能通过 [GitHub Issues](https://github.com/huiishan99/spotify-furigana/issues) 跟踪，新的实机验证结果会加入[兼容性矩阵](./COMPATIBILITY.md)。

## 参与贡献

欢迎提交 Issue 和 Pull Request。提交改动前请阅读 [CONTRIBUTING.md](../CONTRIBUTING.md)；Spotify 更新歌词布局后，请优先使用兼容性报告模板。

提交前请先运行：

```powershell
npm run check
```

报告兼容性问题时，请提供 Spotify 版本、Spicetify 版本、歌词视图类型，以及不包含账号信息的控制台错误。请不要粘贴完整歌词。

安全问题请按照 [SECURITY.md](../SECURITY.md) 私下报告。

## 分享项目

[docs/LAUNCH_KIT.md](./LAUNCH_KIT.md) 已准备好中、日、英三种发布文案。如果插件对你有帮助，[给仓库一个 Star](https://github.com/huiishan99/spotify-furigana)或提交一份可靠的兼容性报告，就是最有价值的支持。

## 商标声明

Furigana for Spotify 是一个独立开源项目。Spotify、Spotify logo 及相关品牌元素是 Spotify AB 的商标。本项目与 Spotify AB 没有关联，也未获得其赞助或认可。“for Spotify”仅用于说明兼容平台。

项目图标为原创设计，使用“ふ”、注音条和音符表达日语歌词辅助功能。近黑、青翠绿和米白配色用于建立音乐流媒体产品的视觉联想；青翠绿与 Spotify Green 不同，图形也不使用 Spotify 的圆形、波纹或官方标识。参见 [Spotify Design & Branding Guidelines](https://developer.spotify.com/documentation/design)。

## License

[MIT](../LICENSE)
