import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("Windows release installer", () => {
  let installer = "";
  let uninstaller = "";

  beforeAll(async () => {
    [installer, uninstaller] = await Promise.all([
      readFile(resolve(projectRoot, "packaging", "install.ps1"), "utf8"),
      readFile(resolve(projectRoot, "packaging", "uninstall.ps1"), "utf8"),
    ]);
  });

  it("detects one unambiguous Spotify installation and its preferences", () => {
    expect(installer).toContain(
      'Get-AppxPackage -Name "SpotifyAB.SpotifyMusic"',
    );
    expect(installer).toContain(
      "Both Microsoft Store Spotify and spotify.com Spotify are installed",
    );
    expect(installer).toContain('$spotifyInstallType = "Microsoft Store"');
    expect(installer).toContain("$storeSpotify.PackageFamilyName");
    expect(installer).toContain(
      '$spotifyInstallType = "spotify.com desktop"',
    );
    expect(installer).toContain('Join-Path $env:APPDATA "Spotify"');
    expect(installer).toContain('Join-Path $spotifyRoot "prefs"');
  });

  it("always configures and applies Spicetify", () => {
    expect(installer).not.toContain("SkipApply");
    expect(installer).toContain('"spotify_path", $spotifyRoot');
    expect(installer).toContain('"prefs_path", $prefsPath');
    expect(installer).toContain("& $spicetifyExecutable -n apply");
    expect(installer).toContain('@("-n", "backup", "apply")');
    expect(installer).toContain("if ($LASTEXITCODE -ne 0)");
    expect(installer).toContain('Arguments @("auto")');
  });

  it("installs a self-repairing launcher and removes it on uninstall", () => {
    expect(installer).toContain("Spotify with Furigana.lnk");
    expect(installer).toContain('$shortcut.Arguments = "auto"');
    expect(uninstaller).toContain("Spotify with Furigana.lnk");
    expect(uninstaller).toContain("removedShortcutPath");
  });
});
