import Kuroshiro from "kuroshiro";
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";
import { browser } from "wxt/browser";

let enginePromise: Promise<Kuroshiro> | undefined;

async function createEngine(): Promise<Kuroshiro> {
  const engine = new Kuroshiro();
  const dictionaryAsset = browser.runtime.getURL("/kuromoji/base.dat.gz");
  const dictPath = dictionaryAsset.slice(0, dictionaryAsset.lastIndexOf("/") + 1);

  await engine.init(new KuromojiAnalyzer({ dictPath }));
  return engine;
}

function getEngine(): Promise<Kuroshiro> {
  enginePromise ??= createEngine().catch((error: unknown) => {
    enginePromise = undefined;
    throw error;
  });

  return enginePromise;
}

export async function convertToFurigana(value: string): Promise<string> {
  const engine = await getEngine();
  return engine.convert(value, {
    mode: "furigana",
    to: "hiragana",
  });
}

export function createSafeFuriganaFragment(
  convertedHtml: string,
  targetDocument: Document,
): DocumentFragment {
  const parsed = new DOMParser().parseFromString(convertedHtml, "text/html");
  const fragment = targetDocument.createDocumentFragment();

  for (const child of parsed.body.childNodes) {
    appendSafeNode(child, fragment, targetDocument);
  }

  return fragment;
}

function appendSafeNode(
  source: Node,
  destination: Node,
  targetDocument: Document,
): void {
  if (source.nodeType === Node.TEXT_NODE) {
    destination.appendChild(
      targetDocument.createTextNode(source.textContent ?? ""),
    );
    return;
  }

  if (!(source instanceof Element)) {
    return;
  }

  const tagName = source.tagName.toLowerCase();
  if (tagName !== "ruby" && tagName !== "rt" && tagName !== "rp") {
    destination.appendChild(
      targetDocument.createTextNode(source.textContent ?? ""),
    );
    return;
  }

  const element = targetDocument.createElement(tagName);
  if (tagName === "ruby") {
    element.className = "spotify-furigana__ruby";
  }

  for (const child of source.childNodes) {
    appendSafeNode(child, element, targetDocument);
  }

  destination.appendChild(element);
}
