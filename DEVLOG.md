# Devlog

## 2026-08-16 — Open-source README and original branding

- 重写 README，加入项目视觉头图、状态徽章、效果示例、快速安装、更新/卸载、工作原理、兼容性范围与贡献指引。
- 新增原创透明背景图标，以“ふ”、注音条和音符表达日语歌词辅助功能，并避开 Spotify 的绿色、圆形和波纹品牌元素。
- 将用户可见名称统一为 `Furigana for Spotify`，并增加独立项目与商标免责声明，避免暗示官方关联。
- 保持仓库现有可见性不变，公开前由仓库所有者最终确认。

## 2026-08-16 — Spotify 1.2.96 runtime selector fix

- 在 Microsoft Store Spotify 1.2.96.518 + Spicetify 2.44.0 中完成真实运行时诊断。
- 确认扩展脚本、播放器开关和 12 个 Kuromoji 词典资源均已加载。
- 修复 Spotify 1.2.96 移除歌词行 `data-testid` 后无法匹配歌词的问题。
- 修复 Kuromoji 经 `path-browserify` 解析完整 URL 后产生重复域名、导致词典请求 404 的问题。
- 词典加载失败后停止自动重试，避免对同一批本地资源持续发起无效请求。
- 新增当前 `.lyrics-lyricsContent-text` 布局与旧版布局的回归测试。

## 2026-08-16 — 改为 Windows Spotify 桌面端

- 根据需求澄清，将目标从 Spotify Web Player 浏览器扩展改为 Windows Spotify 桌面客户端。
- 使用 Spicetify Custom App 的 `subfiles_extension` 在 Spotify 启动时加载歌词增强逻辑。
- 增加播放器底部快速开关和侧边栏设置页面，状态通过 Spicetify LocalStorage 保存。
- 将 Kuromoji 词典打包为 Custom App 本地 assets，继续保持歌词不上传。
- 新增 esbuild 桌面插件构建流程、资源路径测试和 Windows 手动安装说明。
- 当前机器安装的是 Microsoft Store 版 Spotify，且未安装 Spicetify；已完成静态验证，但尚未完成桌面端实际注入验证。

## 2026-08-16 — MVP scaffold

- 选择 WXT + TypeScript 构建 Manifest V3 浏览器扩展。
- 使用 Kuroshiro 和 Kuromoji 在本地生成振假名，不引入歌词上传服务。
- 为 Kuromoji 的浏览器构建加入 `path-browserify` 兼容层。
- 支持 Spotify 的 `lyrics-line` 与 `fullscreen-lyric` 两类歌词节点。
- 增加开关弹窗、单元测试、生产构建和 GitHub Actions CI。
- 明确 MVP 边界：尚未完成 Chrome Web Store 发布，也未在所有 Spotify 账号/地区布局中验证。
