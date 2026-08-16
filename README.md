# Spotify Furigana

一个为 [Spotify Web Player](https://open.spotify.com/) 日语歌词添加振假名（ふりがな）的浏览器扩展。

听日语歌时，扩展会识别 Spotify 歌词页面中的汉字，并把平假名读音显示在汉字上方。分词和读音转换完全在浏览器本地完成，不上传歌词。

## 当前状态

这是一个可构建、可手动安装的 MVP，目标浏览器为 Chrome 和 Edge：

- 自动识别 Spotify 普通歌词视图和全屏歌词视图
- 使用 Kuromoji 做日语形态分析
- 使用标准 HTML `<ruby>` / `<rt>` 显示振假名
- 可在扩展弹窗里随时开关
- 字典随扩展打包，运行时不依赖第三方读音 API

## 本地安装

需要 Node.js 22 或更高版本。

```bash
npm install
npm run build
```

然后：

1. 打开 `chrome://extensions`（Edge 使用 `edge://extensions`）。
2. 开启“开发者模式”。
3. 选择“加载已解压的扩展程序”。
4. 选择项目中的 `.output/chrome-mv3` 目录。
5. 打开 Spotify Web Player，播放一首有歌词的日语歌曲并进入歌词视图。

首次遇到日语歌词时，需要短暂加载本地词典。人名、特殊读法、双关语和刻意变化的歌词可能仍会标错。

## 开发

```bash
npm run dev       # 开发模式
npm run check     # TypeScript、单元测试、生产构建
npm run zip       # 生成可发布压缩包
```

主要入口：

- `entrypoints/spotify.content/`：观察 Spotify 歌词 DOM 并添加振假名
- `entrypoints/popup/`：扩展开关界面
- `src/reading-engine.ts`：本地读音转换和安全的 ruby DOM 构建
- `scripts/copy-kuromoji-dict.mjs`：构建前复制 Kuromoji 字典

## 隐私与边界

- 扩展只在 `https://open.spotify.com/*` 运行。
- 扩展不读取账号凭据，不记录播放历史，不向外部服务发送歌词。
- 扩展不会抓取、保存或重新分发 Spotify 歌词，只增强当前页面已经显示的文本。
- Spotify 的页面结构可能变化；如果选择器失效，请提交 issue 并附上浏览器版本和歌词视图类型，不要附上账号信息。

## 路线图

- 在真实 Spotify 页面上覆盖更多歌词布局
- 增加振假名字号和透明度设置
- 增加片假名/罗马字显示选项
- 打包商店发布所需图标、截图和隐私说明
- 增加 Firefox 构建验证

## License

[MIT](LICENSE)
