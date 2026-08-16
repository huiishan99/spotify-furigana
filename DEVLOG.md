# Devlog

## 2026-08-16 — MVP scaffold

- 选择 WXT + TypeScript 构建 Manifest V3 浏览器扩展。
- 使用 Kuroshiro 和 Kuromoji 在本地生成振假名，不引入歌词上传服务。
- 为 Kuromoji 的浏览器构建加入 `path-browserify` 兼容层。
- 支持 Spotify 的 `lyrics-line` 与 `fullscreen-lyric` 两类歌词节点。
- 增加开关弹窗、单元测试、生产构建和 GitHub Actions CI。
- 明确 MVP 边界：尚未完成 Chrome Web Store 发布，也未在所有 Spotify 账号/地区布局中验证。
