# Furigana for Spotify — Release package

## English

Requirements: Windows 10/11, one Spotify for Windows installation (the [spotify.com build](https://www.spotify.com/download/windows/) or Microsoft Store build), and [Spicetify](https://spicetify.app/docs/getting-started). Open Spotify and sign in for at least 60 seconds before installing.

1. Extract the ZIP completely.
2. Open PowerShell in the extracted folder.
3. Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

To uninstall:

```powershell
powershell -ExecutionPolicy Bypass -File .\uninstall.ps1
```

The installer preserves an existing installation as a timestamped backup before replacing it. It applies Spicetify and creates **Spotify with Furigana** in the Start menu. Use that launcher for future starts so `spicetify auto` can repair supported Spotify updates automatically. This launcher is required for Microsoft Store Spotify; the regular Store shortcut opens the unmodified UI.

## 简体中文

需要 Windows 10/11、一个 Windows Spotify 安装（[spotify.com 桌面版](https://www.spotify.com/download/windows/)或 Microsoft Store 版），以及 [Spicetify](https://spicetify.app/docs/getting-started)。安装前请打开 Spotify 并登录至少 60 秒。

1. 完整解压 ZIP。
2. 在解压目录中打开 PowerShell。
3. 运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

卸载命令：

```powershell
powershell -ExecutionPolicy Bypass -File .\uninstall.ps1
```

覆盖安装前，安装器会把现有版本保留为带时间戳的备份。它会应用 Spicetify，并在开始菜单创建 **Spotify with Furigana**。以后请用这个入口启动，让 `spicetify auto` 在受支持的 Spotify 更新后自动修复。Microsoft Store 版必须使用此入口；原来的 Store 快捷方式只会打开未修改界面。

## 日本語

Windows 10/11、Windows版Spotifyのいずれか一つ（[spotify.com版](https://www.spotify.com/download/windows/)またはMicrosoft Store版）、および[Spicetify](https://spicetify.app/docs/getting-started)が必要です。インストール前にSpotifyを開き、60秒以上ログインしてください。

1. ZIPを完全に展開します。
2. 展開したフォルダーでPowerShellを開きます。
3. 次を実行します。

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

アンインストール：

```powershell
powershell -ExecutionPolicy Bypass -File .\uninstall.ps1
```

上書きインストールの前に、既存バージョンはタイムスタンプ付きのバックアップとして保存されます。Spicetifyを適用し、スタートメニューに **Spotify with Furigana** を作成します。今後はこのランチャーを使用すると、`spicetify auto` が対応済みのSpotify更新後に自動復旧します。Microsoft Store版ではこのランチャーが必須で、通常のStoreショートカットは未変更のUIを開きます。

Project: https://github.com/huiishan99/spotify-furigana
