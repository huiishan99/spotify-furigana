import { cp, copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = resolve(projectRoot, "dist", "spotify-furigana");
const expectedPrefix = `${resolve(projectRoot, "dist")}${sep}`;

if (!outputRoot.startsWith(expectedPrefix) || !outputRoot.endsWith("spotify-furigana")) {
  throw new Error(`Refusing to clear unexpected output path: ${outputRoot}`);
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

await build({
  entryPoints: [resolve(projectRoot, "src", "extension.ts")],
  outfile: resolve(outputRoot, "extension.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["chrome120"],
  sourcemap: true,
  alias: {
    path: "path-browserify",
  },
  logLevel: "info",
});

await Promise.all([
  copyFile(resolve(projectRoot, "app", "index.js"), resolve(outputRoot, "index.js")),
  copyFile(
    resolve(projectRoot, "app", "manifest.json"),
    resolve(outputRoot, "manifest.json"),
  ),
  copyFile(resolve(projectRoot, "app", "style.css"), resolve(outputRoot, "style.css")),
  copyFile(
    resolve(projectRoot, "assets", "launcher.ico"),
    resolve(outputRoot, "launcher.ico"),
  ),
  cp(
    resolve(projectRoot, "node_modules", "kuromoji", "dict"),
    resolve(outputRoot, "dict"),
    { recursive: true },
  ),
]);

console.log(`Built Spicetify app at ${outputRoot}`);
