import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(projectRoot, "assets", "logo.png");
const outputPath = resolve(projectRoot, "assets", "launcher.ico");
const iconSizes = [16, 24, 32, 48, 64, 128, 256];

const source = await readFile(sourcePath);
const trimmed = await sharp(source).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
const images = await Promise.all(
  iconSizes.map((size) => {
    const inset = Math.max(1, Math.round(size * 0.06));
    return sharp(trimmed)
      .resize(size - inset * 2, size - inset * 2, {
        fit: "contain",
        kernel: sharp.kernel.lanczos3,
      })
      .extend({
        top: inset,
        bottom: inset,
        left: inset,
        right: inset,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toBuffer();
  }),
);

const headerSize = 6;
const directoryEntrySize = 16;
let imageOffset = headerSize + directoryEntrySize * images.length;
const header = Buffer.alloc(headerSize);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);

const directory = Buffer.alloc(directoryEntrySize * images.length);
images.forEach((image, index) => {
  const offset = index * directoryEntrySize;
  const size = iconSizes[index];
  directory.writeUInt8(size === 256 ? 0 : size, offset);
  directory.writeUInt8(size === 256 ? 0 : size, offset + 1);
  directory.writeUInt8(0, offset + 2);
  directory.writeUInt8(0, offset + 3);
  directory.writeUInt16LE(1, offset + 4);
  directory.writeUInt16LE(32, offset + 6);
  directory.writeUInt32LE(image.length, offset + 8);
  directory.writeUInt32LE(imageOffset, offset + 12);
  imageOffset += image.length;
});

await writeFile(outputPath, Buffer.concat([header, directory, ...images]));
console.log(`Created Windows launcher icon: ${outputPath}`);
