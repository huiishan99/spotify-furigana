# Spotify Furigana

一个为 **Windows Spotify 桌面客户端**日语歌词添加振假名（ふりがな）的 [Spicetify](https://spicetify.app/) 插件。

听日语歌时，插件会识别 Spotify 桌面端歌词页面中的汉字，并把平假名读音显示在汉字上方。分词和读音转换完全在电脑本地完成，不上传歌词。

## 当前状态

这是一个可构建、可手动安装的 Windows 桌面端 MVP：

- 自动识别 Spotify 普通歌词视图和全屏歌词视图
- 使用 Kuromoji 做日语形态分析
- 使用标准 HTML `<ruby>` / `<rt>` 显示振假名
- 可在播放器底部按钮或插件页面随时开关
- 字典随 Spicetify Custom App 打包，运行时不依赖第三方读音 API

## 本地安装

需要 Node.js 22 或更高版本，并先按照 [Spicetify 官方文档](https://spicetify.app/docs/getting-started)安装 Spicetify。

```bash
npm install
npm run build
```

构建结果位于 `dist/spotify-furigana/`。然后在 PowerShell 中运行：

```powershell
$target = Join-Path $env:APPDATA "spicetify\CustomApps\spotify-furigana"
New-Item -ItemType Directory -Force $target | Out-Null
Copy-Item -Recurse -Force "dist\spotify-furigana\*" $target
spicetify config custom_apps spotify-furigana
spicetify apply
```

重启 Spotify，播放一首有歌词的日语歌曲并进入歌词视图。插件也会出现在左侧栏，播放器底部的歌词按钮可快速开关注音。

> 注意：Spicetify 官方 FAQ 指出，若无法识别 Microsoft Store 版 Spotify，需卸载该版本并改装 [spotify.com](https://www.spotify.com/download/windows/) 提供的普通 Windows 安装版。

首次遇到日语歌词时，需要短暂加载本地词典。人名、特殊读法、双关语和刻意变化的歌词可能仍会标错。

## 开发

```bash
npm run check     # TypeScript、单元测试、生产构建
npm run build     # 生成可安装的 Spicetify Custom App
```

主要入口：

- `src/extension.ts`：全局观察 Spotify 桌面端歌词 DOM 并添加振假名
- `src/reading-engine.ts`：本地读音转换和安全的 ruby DOM 构建
- `app/`：Spicetify Custom App 页面、样式和 manifest
- `scripts/build.mjs`：打包扩展并复制 Kuromoji 字典

## 隐私与边界

- 插件只读取 Spotify 桌面端当前已经显示的歌词 DOM。
- 插件不读取账号凭据，不记录播放历史，不向外部服务发送歌词。
- 插件不会抓取、保存或重新分发 Spotify 歌词，只增强当前页面已经显示的文本。
- Spotify 或 Spicetify 的页面结构可能变化；如果选择器失效，请提交 issue 并附上 Spotify 与 Spicetify 版本，不要附上账号信息。

## 路线图

- 在真实 Windows Spotify + Spicetify 环境覆盖更多歌词布局
- 增加振假名字号和透明度设置
- 增加片假名/罗马字显示选项
- 准备 Spicetify Marketplace 发布所需图标、截图和清单

## License

[MIT](LICENSE)
