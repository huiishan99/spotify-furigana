[CmdletBinding()]
param(
  [switch]$SkipApply
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$appName = "spotify-furigana"
$spicetifyCommand = $null
if (-not $SkipApply) {
  $spicetifyCommand = Get-Command "spicetify" -CommandType Application -ErrorAction SilentlyContinue
  if (-not $spicetifyCommand) {
    throw "Spicetify was not found in PATH."
  }

  & $spicetifyCommand.Path config custom_apps "${appName}-"
  if ($LASTEXITCODE -ne 0) {
    throw "spicetify config failed with exit code ${LASTEXITCODE}."
  }

  & $spicetifyCommand.Path apply
  if ($LASTEXITCODE -ne 0) {
    throw "spicetify apply failed with exit code ${LASTEXITCODE}."
  }
}

$customAppsRoot = Join-Path $env:APPDATA "spicetify\CustomApps"
$targetApp = Join-Path $customAppsRoot $appName
$expectedPrefix = [System.IO.Path]::GetFullPath($customAppsRoot).TrimEnd('\') + '\'
$resolvedTarget = [System.IO.Path]::GetFullPath($targetApp)
if (-not $resolvedTarget.StartsWith($expectedPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to move a path outside the Spicetify CustomApps directory: ${resolvedTarget}"
}

if (Test-Path -LiteralPath $targetApp) {
  $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $removedPath = "${targetApp}.removed-${timestamp}"
  Move-Item -LiteralPath $targetApp -Destination $removedPath
  Write-Host "Furigana for Spotify was disabled and moved to ${removedPath}."
} else {
  Write-Host "No installed Furigana for Spotify directory was found."
}

if ($SkipApply) {
  Write-Host "Spicetify configuration was skipped."
}
