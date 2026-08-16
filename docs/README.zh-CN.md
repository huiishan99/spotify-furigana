<p align="center">
  <a href="../README.md">English</a> · <strong>简体中文</strong> · <a href="./README.ja.md">日本語</a>
</p>

<p align="center">
  <img src="../assets/logo.png" alt="Furigana for Spotify logo" width="168" />
</p>

<h1 align="center">Furigana for Spotify</h1>

<p align="center">
  <strong>在 Windows Spotify 桌面歌词上，为日语汉字实时显示振假名。</strong>
  <br />
  本地处理 · 无需歌词 API · 不上传歌词
</p>

<p align="center">
  <a href="https://github.com/huiishan99/spotify-furigana/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/huiishan99/spotify-furigana/actions/workflows/ci.yml/badge.svg" /></a>
  <img alt="Windows 10 and 11" src="https://img.shields.io/badge/Windows-10%20%7C%2011-4F46E5" />
  <img alt="Spotify Desktop 1.2.96 tested" src="https://img.shields.io/badge/Spotify%20Desktop-1.2.96%20tested-16A34A?logo=spotify&amp;logoColor=1ED760&amp;labelColor=191414" />
  <img alt="Spicetify 2.44 tested" src="https://img.shields.io/badge/Spicetify-2.44%20tested-F97366" />
  <a href="../LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-4338CA" /></a>
</p>

> [!IMPORTANT]
> 这是独立社区项目，与 Spotify AB 没有关联，也未获得其赞助或认可。项目自身标志不使用 Spotify 官方 logo；兼容性徽章中的标识仅用于说明目标平台。

## 效果

<p align="center">
  <img src="../assets/screenshots/lyrics-view.png" alt="Windows Spotify 歌词页面中的实时日语振假名效果" width="100%" />
</p>

<p align="center">
  <sub>实机截图：Windows 11 · Spotify 1.2.96.518 · Spicetify 2.44.0。歌词、封面及 Spotify 界面元素的权利归各自权利方所有，仅用于展示插件运行效果。</sub>
</p>

插件直接增强 Spotify 已经显示的歌词，把汉字转换为标准 HTML `<ruby>` 注音：

| 原歌词 | 开启振假名后 |
| --- | --- |
| 声も聞かさないで | <ruby>声<rt>こえ</rt></ruby>も<ruby>聞<rt>き</rt></ruby>かさないで |
| 明日は晴れる | <ruby>明日<rt>あした</rt></ruby>は<ruby>晴<rt>は</rt></ruby>れる |

## 为什么用它

- **跟随原生歌词**：自动处理当前桌面歌词页，并兼容已知的全屏歌词布局。
- **完全本地运行**：Kuroshiro + Kuromoji 在电脑上完成分词与读音转换。
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

## 安装

### Release 安装包（推荐）

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

```powershell
git pull
npm ci
npm run build

$target = Join-Path $env:APPDATA "spicetify\CustomApps\spotify-furigana"
Copy-Item -Recurse -Force "dist\spotify-furigana\*" $target
spicetify apply
```

## 卸载

```powershell
spicetify config custom_apps spotify-furigana-
spicetify apply
```

## 工作原理

```text
Spotify 歌词 DOM
        ↓
识别含汉字的歌词行
        ↓
Kuroshiro + Kuromoji 本地转换
        ↓
安全生成 <ruby> / <rt> 注音
```

## 仓库结构

```text
spotify-furigana/
├── app/          # Spicetify Custom App 页面、样式与 manifest
├── assets/       # 项目 Logo 与实机截图
├── docs/         # 中文、日文 README
├── packaging/    # Release 安装器、卸载器与离线说明
├── scripts/      # 构建与资源复制脚本
├── src/          # 歌词观察、选择器、设置与读音引擎
├── tests/        # Vitest 单元测试
├── types/        # Kuroshiro 与 Spicetify 类型声明
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
npm run package
```

`npm run check` 会依次执行 TypeScript 检查、Vitest 测试和生产构建。`npm run package` 会在被 Git 忽略的 `release/` 目录中生成可直接安装的 ZIP 和 SHA-256 校验文件。

## 已知限制

- 人名、地名、歌词双关和刻意变化的读法可能标注错误。
- Spotify 更新可能改变歌词 DOM；若插件突然失效，请在 issue 中附上 Spotify 与 Spicetify 版本。
- 当前只面向 Windows Spotify 桌面客户端，不支持 Web Player、macOS 或移动端。

## 路线图

- [ ] 调整振假名字号、透明度和间距
- [ ] 片假名与罗马字显示模式
- [ ] 一键安装与更新脚本
- [ ] 更多 Spotify / Spicetify 版本验证
- [ ] Spicetify Marketplace 发布

## 参与贡献

Issue 和 Pull Request 都欢迎。提交前请先运行：

```powershell
npm run check
```

报告兼容性问题时，请提供 Spotify 版本、Spicetify 版本、歌词视图类型，以及不包含账号信息的控制台错误。请不要粘贴完整歌词。

## 商标声明

Furigana for Spotify 是一个独立开源项目。Spotify、Spotify logo 及相关品牌元素是 Spotify AB 的商标。本项目与 Spotify AB 没有关联，也未获得其赞助或认可。“for Spotify”仅用于说明兼容平台。

项目图标为原创设计，使用“ふ”、注音条和音符表达日语歌词辅助功能。近黑、青翠绿和米白配色用于建立音乐流媒体产品的视觉联想；青翠绿与 Spotify Green 不同，图形也不使用 Spotify 的圆形、波纹或官方标识。参见 [Spotify Design & Branding Guidelines](https://developer.spotify.com/documentation/design)。

## License

[MIT](../LICENSE)
