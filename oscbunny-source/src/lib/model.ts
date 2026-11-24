/**
 * lib/model.ts: everything that talks to the Teachable Machine model.
 *
 * To reproduce our setup: train an Image Project at
 * teachablemachine.withgoogle.com, choose Export Model -> Upload my model, and
 * paste the shareable link into `modelUrl` in src/config.ts. loadModel() below
 * then fetches model.json (the network layout), metadata.json (the class
 * names) and the weights file(s) from that link.
 */

/** One class and how likely the model thinks the image belongs to it (0 to 1). */
export type Prediction = { className: string; probability: number };
/** The parts of Teachable Machine's model object that this site uses. */
export type ImageModel = {
  predict: (
    input: HTMLImageElement | HTMLCanvasElement,
    flipped?: boolean,
  ) => Promise<Prediction[]>;
  getClassLabels: () => string[];
};
// TensorFlow.js (`tf`) and the Teachable Machine library (`tmImage`) are
// loaded from a CDN as plain <script> tags, which put them on `window`.
declare global {
  interface Window {
    tf?: { ready: () => Promise<void> };
    tmImage?: { load: (url: string, metadata: string) => Promise<ImageModel> };
  }
}
/** Scripts already requested, so each library is only downloaded once. */
const scripts = new Map<string, Promise<void>>();
/** Adds a <script> tag for `url` and resolves when it has loaded. Gives up
 * after 30 s. On failure the tag is removed so a later retry can try again. */
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
/** Tidies a model link into a folder URL ending in "/". Accepts a link to
 * model.json or metadata.json too, and rejects non-HTTPS links (except a
 * folder on this same local site, for offline testing). */
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
/** Loads a Teachable Machine image model from its exported link.
 * Steps: (1) load TensorFlow.js, (2) load the Teachable Machine image library,
 * (3) download the model files (45 s limit), (4) check it has class labels.
 * Library versions are pinned so the site keeps working if newer versions
 * change behaviour. */
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
/** Loads an image from a URL (blob:, data: or http) and waits until it is
 * fully decoded, so its size is known before cropping. */
export async function imageFromUrl(src: string) {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}
/** Checks the model's output is sensible (a name and a probability between 0
 * and 1 for every class), then returns it sorted from most to least likely. */
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
