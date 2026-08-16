[CmdletBinding()]
param(
  [switch]$SkipApply
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$appName = "spotify-furigana"
$sourceApp = Join-Path $PSScriptRoot $appName
$sourceManifest = Join-Path $sourceApp "manifest.json"
if (-not (Test-Path -LiteralPath $sourceManifest)) {
  throw "The release package is incomplete: ${sourceManifest} is missing."
}

$spicetifyCommand = $null
if (-not $SkipApply) {
  $spicetifyCommand = Get-Command "spicetify" -CommandType Application -ErrorAction SilentlyContinue
  if (-not $spicetifyCommand) {
    throw "Spicetify was not found in PATH. Install Spicetify first, then run this installer again."
  }
}

$customAppsRoot = Join-Path $env:APPDATA "spicetify\CustomApps"
$targetApp = Join-Path $customAppsRoot $appName
$expectedPrefix = [System.IO.Path]::GetFullPath($customAppsRoot).TrimEnd('\') + '\'
$resolvedTarget = [System.IO.Path]::GetFullPath($targetApp)
if (-not $resolvedTarget.StartsWith($expectedPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to install outside the Spicetify CustomApps directory: ${resolvedTarget}"
}

New-Item -ItemType Directory -Path $customAppsRoot -Force | Out-Null
$backupPath = $null
if (Test-Path -LiteralPath $targetApp) {
  $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $backupPath = "${targetApp}.backup-${timestamp}"
  if (Test-Path -LiteralPath $backupPath) {
    throw "Backup path already exists: ${backupPath}"
  }
  Move-Item -LiteralPath $targetApp -Destination $backupPath
}

try {
  Copy-Item -LiteralPath $sourceApp -Destination $targetApp -Recurse

  if (-not $SkipApply) {
    & $spicetifyCommand.Path config custom_apps $appName
    if ($LASTEXITCODE -ne 0) {
      throw "spicetify config failed with exit code ${LASTEXITCODE}."
    }

    & $spicetifyCommand.Path apply
    if ($LASTEXITCODE -ne 0) {
      throw "spicetify apply failed with exit code ${LASTEXITCODE}."
    }
  }
} catch {
  if (Test-Path -LiteralPath $targetApp) {
    Remove-Item -LiteralPath $targetApp -Recurse -Force
  }
  if ($backupPath -and (Test-Path -LiteralPath $backupPath)) {
    Move-Item -LiteralPath $backupPath -Destination $targetApp
  }
  throw
}

Write-Host "Furigana for Spotify was installed to ${targetApp}."
if ($backupPath) {
  Write-Host "The previous installation was preserved at ${backupPath}."
}
if ($SkipApply) {
  Write-Host "Spicetify configuration was skipped."
} else {
  Write-Host "Restart Spotify if it does not reopen automatically."
}
