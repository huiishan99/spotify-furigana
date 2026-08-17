[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Resolve-SpicetifyExecutable {
  $command = Get-Command "spicetify" -CommandType Application -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Path
  }

  $candidates = @(
    (Join-Path $env:USERPROFILE ".spicetify\spicetify.exe"),
    (Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Links\spicetify.exe")
  )

  $wingetPackages = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages"
  if (Test-Path -LiteralPath $wingetPackages) {
    $candidates += Get-ChildItem -LiteralPath $wingetPackages -Directory -Filter "Spicetify.Spicetify_*" -ErrorAction SilentlyContinue |
      ForEach-Object { Join-Path $_.FullName "spicetify.exe" }
  }

  foreach ($candidate in $candidates) {
    if (Test-Path -LiteralPath $candidate -PathType Leaf) {
      return [System.IO.Path]::GetFullPath($candidate)
    }
  }

  throw "Spicetify was not found. Install it from https://spicetify.app/docs/getting-started, open a new PowerShell window, then run this installer again."
}

function Invoke-Spicetify {
  param(
    [Parameter(Mandatory = $true)][string]$Executable,
    [Parameter(Mandatory = $true)][string[]]$Arguments
  )

  & $Executable @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "spicetify $($Arguments -join ' ') failed with exit code ${LASTEXITCODE}."
  }
}

function New-FuriganaShortcut {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$SpicetifyExecutable,
    [Parameter(Mandatory = $true)][string]$SpotifyExecutable
  )

  $shortcutRoot = Split-Path -Parent $Path
  New-Item -ItemType Directory -Path $shortcutRoot -Force | Out-Null

  $shell = New-Object -ComObject WScript.Shell
  $shortcut = $null
  try {
    $shortcut = $shell.CreateShortcut($Path)
    $shortcut.TargetPath = $SpicetifyExecutable
    $shortcut.Arguments = "auto"
    $shortcut.WorkingDirectory = Split-Path -Parent $SpicetifyExecutable
    $shortcut.IconLocation = "${SpotifyExecutable},0"
    $shortcut.Description = "Launch Spotify and keep Furigana for Spotify applied"
    $shortcut.WindowStyle = 7
    $shortcut.Save()
  } finally {
    if ($shortcut) {
      [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($shortcut)
    }
    [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($shell)
  }
}

$appName = "spotify-furigana"
$sourceApp = Join-Path $PSScriptRoot $appName
$sourceManifest = Join-Path $sourceApp "manifest.json"
if (-not (Test-Path -LiteralPath $sourceManifest)) {
  throw "The release package is incomplete: ${sourceManifest} is missing."
}

$storeSpotify = Get-AppxPackage -Name "SpotifyAB.SpotifyMusic" -ErrorAction SilentlyContinue | Select-Object -First 1
$websiteSpotifyRoot = Join-Path $env:APPDATA "Spotify"
$websiteSpotifyExecutable = Join-Path $websiteSpotifyRoot "Spotify.exe"
$websiteSpotifyInstalled = Test-Path -LiteralPath $websiteSpotifyExecutable -PathType Leaf
if ($storeSpotify -and $websiteSpotifyInstalled) {
  throw "Both Microsoft Store Spotify and spotify.com Spotify are installed. Keep only one version, open it and sign in for at least 60 seconds, then run this installer again."
}

if ($storeSpotify) {
  $spotifyInstallType = "Microsoft Store"
  $spotifyRoot = $storeSpotify.InstallLocation
  $spotifyExecutable = Join-Path $spotifyRoot "Spotify.exe"
  $prefsPath = Join-Path $env:LOCALAPPDATA "Packages\$($storeSpotify.PackageFamilyName)\LocalState\Spotify\prefs"
} elseif ($websiteSpotifyInstalled) {
  $spotifyInstallType = "spotify.com desktop"
  $spotifyRoot = $websiteSpotifyRoot
  $spotifyExecutable = $websiteSpotifyExecutable
  $prefsPath = Join-Path $spotifyRoot "prefs"
} else {
  throw "Spotify for Windows was not found. Install it from https://www.spotify.com/download/windows/, open it and sign in for at least 60 seconds, then run this installer again."
}
if (-not (Test-Path -LiteralPath $prefsPath -PathType Leaf)) {
  throw "Spotify's preferences file is missing at ${prefsPath}. Open Spotify, sign in for at least 60 seconds, close it, then run this installer again."
}

$spicetifyExecutable = Resolve-SpicetifyExecutable
$customAppsRoot = Join-Path $env:APPDATA "spicetify\CustomApps"
$targetApp = Join-Path $customAppsRoot $appName
$expectedPrefix = [System.IO.Path]::GetFullPath($customAppsRoot).TrimEnd('\') + '\'
$resolvedTarget = [System.IO.Path]::GetFullPath($targetApp)
if (-not $resolvedTarget.StartsWith($expectedPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to install outside the Spicetify CustomApps directory: ${resolvedTarget}"
}

$startMenuPrograms = Join-Path ([Environment]::GetFolderPath("StartMenu")) "Programs"
$shortcutPath = Join-Path $startMenuPrograms "Spotify with Furigana.lnk"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = $null
$shortcutBackupPath = $null

New-Item -ItemType Directory -Path $customAppsRoot -Force | Out-Null
if (Test-Path -LiteralPath $targetApp) {
  $backupPath = "${targetApp}.backup-${timestamp}"
  if (Test-Path -LiteralPath $backupPath) {
    throw "Backup path already exists: ${backupPath}"
  }
  Move-Item -LiteralPath $targetApp -Destination $backupPath
}
if (Test-Path -LiteralPath $shortcutPath) {
  $shortcutBackupPath = "${shortcutPath}.backup-${timestamp}"
  Move-Item -LiteralPath $shortcutPath -Destination $shortcutBackupPath
}

try {
  Copy-Item -LiteralPath $sourceApp -Destination $targetApp -Recurse

  Invoke-Spicetify -Executable $spicetifyExecutable -Arguments @(
    "config",
    "spotify_path", $spotifyRoot,
    "prefs_path", $prefsPath,
    "custom_apps", $appName
  )

  $spotifyProcesses = Get-Process -Name "Spotify" -ErrorAction SilentlyContinue
  if ($spotifyProcesses) {
    Write-Host "Closing Spotify before applying the extension..."
    $spotifyProcesses | Stop-Process -Force
    $spotifyProcesses | Wait-Process -ErrorAction SilentlyContinue
  }

  & $spicetifyExecutable -n apply
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "The existing Spotify backup could not be applied. Refreshing the backup for the current Spotify version..."
    Invoke-Spicetify -Executable $spicetifyExecutable -Arguments @("-n", "backup", "apply")
  }
  New-FuriganaShortcut -Path $shortcutPath -SpicetifyExecutable $spicetifyExecutable -SpotifyExecutable $spotifyExecutable
  Invoke-Spicetify -Executable $spicetifyExecutable -Arguments @("auto")
} catch {
  if (Test-Path -LiteralPath $targetApp) {
    Remove-Item -LiteralPath $targetApp -Recurse -Force
  }
  if ($backupPath -and (Test-Path -LiteralPath $backupPath)) {
    Move-Item -LiteralPath $backupPath -Destination $targetApp
  }
  if (Test-Path -LiteralPath $shortcutPath) {
    Remove-Item -LiteralPath $shortcutPath -Force
  }
  if ($shortcutBackupPath -and (Test-Path -LiteralPath $shortcutBackupPath)) {
    Move-Item -LiteralPath $shortcutBackupPath -Destination $shortcutPath
  }
  throw
}

Write-Host "Furigana for Spotify was installed to ${targetApp}."
if ($backupPath) {
  Write-Host "The previous installation was preserved at ${backupPath}."
}
if ($shortcutBackupPath) {
  Write-Host "The previous launcher shortcut was preserved at ${shortcutBackupPath}."
}
Write-Host "A self-repairing launcher was created at ${shortcutPath}."
Write-Host "Configured Spotify installation: ${spotifyInstallType}."
Write-Host "Open 'Spotify with Furigana' from the Start menu. It runs 'spicetify auto' so Spotify updates are reapplied before launch."
