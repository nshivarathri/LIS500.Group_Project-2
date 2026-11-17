export type Prediction = { className: string; probability: number };
export type ImageModel = {
  predict: (
    input: HTMLImageElement | HTMLCanvasElement,
    flipped?: boolean,
  ) => Promise<Prediction[]>;
  getClassLabels: () => string[];
};
declare global {
  interface Window {
    tf?: { ready: () => Promise<void> };
    tmImage?: { load: (url: string, metadata: string) => Promise<ImageModel> };
  }
}
const scripts = new Map<string, Promise<void>>();
function loadScript(url: string) {
  const existing = scripts.get(url);
  if (existing) return existing;
  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    let done = false;
    const finish = (err?: Error) => {
      if (done) return;
      done = true;
      clearTimeout(timeout);
      if (err) {
        script.remove();
        scripts.delete(url);
        reject(err);
      } else resolve();
    };
    const timeout = window.setTimeout(
      () =>
        finish(
          new Error(
            "The model library timed out. Check your internet connection, then try again.",
          ),
        ),
      30000,
    );
    script.src = url;
    script.async = true;
    script.onload = () => finish();
    script.onerror = () =>
      finish(
        new Error(
          "The model library could not load. Check your connection or content blocker.",
        ),
      );
    document.head.appendChild(script);
  });
  scripts.set(url, promise);
  return promise;
}
export function normalizeModelUrl(value: string) {
  const url = new URL(value.trim(), document.baseURI);
  if (
    url.protocol !== "https:" &&
    !(url.origin === location.origin && url.protocol === "http:")
  )
    throw new Error(
      "Use an HTTPS model link or a model folder on this local website.",
    );
  if (url.username || url.password || url.search || url.hash)
    throw new Error(
      "Use the exported model folder link without credentials, query parameters or fragments.",
    );
  url.pathname = url.pathname
    .replace(/(?:model|metadata)\.json$/, "")
    .replace(/\/?$/, "/");
  return url.href;
}
export async function loadModel(value: string): Promise<ImageModel> {
  if (!value.trim())
    throw new Error(
      "Add your trained Teachable Machine image-model URL first.",
    );
  const url = normalizeModelUrl(value);
  if (!window.tf)
    await loadScript(
      "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js",
    );
  await window.tf!.ready();
  if (!window.tmImage)
    await loadScript(
      "https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.5/dist/teachablemachine-image.min.js",
    );
  try {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const loaded = await Promise.race([
      window.tmImage!.load(url + "model.json", url + "metadata.json"),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Model download timed out.")),
          45000,
        );
      }),
    ]).finally(() => clearTimeout(timer));
    if (!loaded.getClassLabels().length)
      throw new Error("No class labels were found.");
    return loaded;
  } catch {
    throw new Error(
      "This model could not load. Check that model.json, metadata.json and all weights are available, and that the export is an image model with cross-origin access enabled.",
    );
  }
}
/** Centre square crop of the image: uploads and camera use the same framing.
 * This matches how Teachable Machine crops training images. Letterboxing onto a
 * white sheet instead skewed predictions toward English (17/30 vs 28/30 correct
 * on the test images), because the model never saw padded images in training. */
export function prepareInput(source: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 720;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff"; // backdrop for transparent PNGs
  ctx.fillRect(0, 0, 720, 720);
  const width = source.naturalWidth;
  const height = source.naturalHeight;
  if (!width || !height)
    throw new Error("This image could not be read. Try another image file.");
  const side = Math.min(width, height);
  ctx.drawImage(
    source,
    (width - side) / 2,
    (height - side) / 2,
    side,
    side,
    0,
    0,
    720,
    720,
  );
  return canvas;
}
export async function imageFromUrl(src: string) {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}
export function validatePredictions(values: Prediction[]) {
  if (
    !values.length ||
    values.some(
      (p) =>
        !p.className ||
        !Number.isFinite(p.probability) ||
        p.probability < 0 ||
        p.probability > 1,
    )
  )
    throw new Error(
      "The model returned an unreadable result. Try reloading it.",
    );
  return [...values].sort((a, b) => b.probability - a.probability);
}
