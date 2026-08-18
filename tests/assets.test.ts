import { access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { getDictionaryPath } from "../src/assets";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("Spicetify asset paths", () => {
  it("uses a root-relative path compatible with path-browserify", () => {
    expect(getDictionaryPath()).toBe("/assets/spotify-furigana/dict/");
  });

  it("includes launcher artwork for Windows and macOS builds", async () => {
    await Promise.all([
      access(resolve(projectRoot, "assets", "launcher.ico")),
      access(resolve(projectRoot, "assets", "launcher.icns")),
    ]);
  });
});
