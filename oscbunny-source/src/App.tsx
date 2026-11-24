import { useEffect, useRef, useState } from "react";
import {
  Mail,
  ArrowRight,
  ArrowUpRight,
  Upload,
  Camera,
  Check,
  LoaderCircle,
  Heart,
  RotateCcw,
  Download,
  BookOpen,
  Pause,
  Play,
  Settings2,
} from "lucide-react";
import Bunny from "./components/Bunny";
import PostalScene, { type PostalPhase } from "./components/PostalScene";
import ResearchNotebook, { Video } from "./components/ResearchNotebook";
import Modal from "./components/Modal";
import { experiment } from "./config";
import {
  loadModel,
  prepareInput,
  imageFromUrl,
  validatePredictions,
  type ImageModel,
  type Prediction,
} from "./lib/model";
/**
 * App.tsx: the whole Teachable Machine ("Oscbunny") page.
 *
 * How a prediction works, end to end:
 *   1. On page load, connect() downloads our trained Teachable Machine model
 *      (link set in src/config.ts) using loadModel() from lib/model.ts.
 *   2. The visitor adds a handwriting photo, either by uploading a file
 *      (upload()) or taking a picture with the webcam (startCamera() then
 *      capture()). The photo is held in `src` as a browser-local URL.
 *   3. sort() crops the photo to a centre square (prepareInput()), asks the
 *      model for a score for every class (Hindi / Telugu / English), and shows
 *      the result as a "delivery slip".
 *   4. Each result is also saved to `history` ("My deliveries") for this visit
 *      only. Nothing is uploaded to a server; the model runs in the browser.
 *
 * The page has three views (post office, deliveries, project statement),
 * switched with navigate() rather than separate HTML pages.
 */

/** Where the visitor's photo comes from. */
type Mode = "upload" | "camera";
/** One classified photo, as shown on the delivery slip and in "My deliveries". */
type Delivery = {
  id: number; // running number for this visit (DELIVERY 001, 002, ...)
  src: string; // the cropped image the model actually saw, as a data URL
  name: string; // file name, or "A letter from the camera"
  predictions: Prediction[]; // every class with its probability, highest first
  time: string; // when it was sorted, in the visitor's local format
  feedback?: { expected: string; note: string }; // optional visitor correction
};
export default function App() {
  // ---- Page state ----
  // view: which of the three views is showing. mode: upload tab or camera tab.
  const [view, setView] = useState<"office" | "deliveries" | "notebook">(
      "office",
    ),
    [mode, setMode] = useState<Mode>("upload");
  // src/filename: the current photo. busy: a prediction is running.
  // phase: drives the bunny animation (idle -> sorting -> delivered/error).
  const [src, setSrc] = useState(""),
    [filename, setFilename] = useState(""),
    [busy, setBusy] = useState(false),
    [phase, setPhase] = useState<PostalPhase>("idle");
  // result: the slip currently shown. history: up to 20 past results.
  // drag: true while a file is being dragged over the upload box.
  const [result, setResult] = useState<Delivery | null>(null),
    [history, setHistory] = useState<Delivery[]>([]),
    [error, setError] = useState(""),
    [drag, setDrag] = useState(false);
  // Model state. modal: the "brains behind the bunny" dialog is open.
  // modelUrl: the link typed in that dialog (starts as our config.ts link).
  // labels: the model's class names; once filled, the model is connected.
  const [modal, setModal] = useState(false),
    [modelUrl, setModelUrl] = useState(experiment.modelUrl),
    [modelError, setModelError] = useState(""),
    // Start in the loading state when a model link is configured, so the
    // first paint shows "Loading" rather than a false "couldn't load" message.
    [connecting, setConnecting] = useState(() =>
      Boolean(experiment.modelUrl.trim()),
    ),
    [labels, setLabels] = useState<string[]>([]);
  // Webcam state.
  const [cameraOn, setCameraOn] = useState(false),
    [cameraStarting, setCameraStarting] = useState(false),
    [cameraError, setCameraError] = useState("");
  // motion: decorative animation on/off. It starts off for visitors whose
  // system asks for reduced motion. The feedback* values belong to the
  // "Did Oscbunny get it wrong?" form.
  const [motion, setMotion] = useState(
      () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [feedbackOpen, setFeedbackOpen] = useState(false),
    [expected, setExpected] = useState(""),
    [note, setNote] = useState("");
  // Refs hold values that must survive re-renders without causing one.
  const file = useRef<HTMLInputElement>(null), // hidden <input type="file">
    video = useRef<HTMLVideoElement>(null), // live webcam preview
    stream = useRef<MediaStream | null>(null), // open webcam, so we can stop it
    model = useRef<ImageModel | null>(null), // the loaded Teachable Machine model
    // "Epoch" counters: each camera start / model load bumps its counter.
    // When an older async request finishes late, its epoch no longer matches,
    // so its result is thrown away instead of overwriting a newer one.
    cameraEpoch = useRef(0),
    modelEpoch = useRef(0),
    alive = useRef(true), // false after the page unmounts
    scanLock = useRef(false), // stops double-clicks running two predictions
    nextId = useRef(1), // next delivery number
    sourceUrl = useRef(""); // blob: URL to free when the photo is replaced
  const connected = labels.length > 0;
  // Clean-up when the page closes: stop the webcam, cancel pending loads and
  // free the uploaded photo's memory.
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      cameraEpoch.current++;
      modelEpoch.current++;
      stream.current?.getTracks().forEach((t) => t.stop());
      if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current);
    };
  }, []);
  // Follow the visitor's system "reduce motion" setting if it changes.
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setMotion(!media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  // Load the group's final model automatically, so visitors never have to
  // paste a link or click "Connect model" themselves.
  useEffect(() => {
    if (experiment.modelUrl.trim()) void connect(experiment.modelUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /** Turns the webcam off and releases it so the camera light goes out. */
  function stopCamera() {
    cameraEpoch.current++;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
    setCameraOn(false);
    setCameraStarting(false);
  }
  /** Switches between the three views and scrolls back to the top. */
  function navigate(next: typeof view) {
    stopCamera();
    setView(next);
    window.scrollTo({ top: 0, behavior: motion ? "smooth" : "auto" });
  }
  /** Switches between the Upload and Camera tabs and clears the old result. */
  function switchMode(next: Mode) {
    stopCamera();
    setMode(next);
    setError("");
    setCameraError("");
    setResult(null);
    setPhase("idle");
  }
  /** Sets a new photo to classify, freeing the previous uploaded file's memory. */
  function replaceSource(next: string, name: string) {
    if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current);
    sourceUrl.current = next.startsWith("blob:") ? next : "";
    setSrc(next);
    setFilename(name);
    setResult(null);
    setPhase("idle");
    setError("");
  }
  /** Handles a chosen or dropped file: checks it is an image under 20 MB and
   * that the browser can decode it, then makes it the current photo. */
  async function upload(image: File) {
    if (busy) return;
    if (!image.type.startsWith("image/")) {
      setError("Please choose an image file, such as JPG, PNG or WebP.");
      return;
    }
    if (image.size > 20 * 1024 * 1024) {
      setError("That letter is a little heavy. Choose an image under 20 MB.");
      return;
    }
    // A blob: URL lets the browser show the file without uploading it anywhere.
    const url = URL.createObjectURL(image);
    try {
      await imageFromUrl(url); // fails early if the file is not a readable image
      stopCamera();
      setMode("upload");
      replaceSource(url, image.name);
    } catch {
      URL.revokeObjectURL(url);
      setError(
        "Oscbunny could not open that image. Try saving it as JPG, PNG or WebP.",
      );
    }
  }
  /** Asks for webcam permission and starts the live preview. Prefers the back
   * camera on phones ("environment"). Browsers only allow this on HTTPS or
   * localhost. */
  async function startCamera() {
    const epoch = ++cameraEpoch.current;
    setCameraStarting(true);
    setCameraError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw Error("Camera access needs localhost or HTTPS.");
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      // The visitor may have switched tabs or left while the permission prompt
      // was open. If so, close this camera stream straight away.
      if (epoch !== cameraEpoch.current || !alive.current) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      const v = video.current;
      if (!v) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      v.srcObject = media;
      await v.play();
      if (epoch !== cameraEpoch.current) return;
      setCameraOn(true);
    } catch (e) {
      if (epoch !== cameraEpoch.current) return;
      stream.current?.getTracks().forEach((t) => t.stop());
      stream.current = null;
      // Turn the browser's error name into a plain-language message.
      const name = e instanceof DOMException ? e.name : "";
      setCameraError(
        name === "NotAllowedError"
          ? "Camera permission was declined. Allow camera access in your browser and try again, or upload a photo."
          : name === "NotFoundError"
            ? "No camera was found. Try uploading a photo instead."
            : "The camera could not start. Check that it is not being used by another app, or upload a photo.",
      );
      setCameraOn(false);
    } finally {
      if (epoch === cameraEpoch.current) setCameraStarting(false);
    }
  }
  /** Takes a still from the webcam at full resolution, saves it as a PNG and
   * makes it the current photo. The camera then turns off. */
  function capture() {
    const v = video.current;
    if (!v?.videoWidth) {
      setCameraError("The camera is still warming up. Try again in a moment.");
      return;
    }
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    replaceSource(c.toDataURL("image/png"), "A letter from the camera");
    stopCamera();
    setMode("upload");
  }
  /** Downloads a Teachable Machine model (model.json, metadata.json, weights)
   * from `url` and keeps it ready for predictions. Runs once on page load with
   * our model, and again if someone connects a different model in the dialog. */
  async function connect(url = modelUrl) {
    const epoch = ++modelEpoch.current;
    setConnecting(true);
    setModelError("");
    try {
      const next = await loadModel(url);
      if (!alive.current || epoch !== modelEpoch.current) return; // stale load
      model.current = next;
      setLabels(next.getClassLabels());
      setModal(false);
      setError("");
      setResult(null);
      setPhase("idle");
    } catch (e) {
      if (alive.current && epoch === modelEpoch.current)
        setModelError(
          e instanceof Error
            ? e.message
            : "The model could not load. Try again.",
        );
    } finally {
      if (alive.current && epoch === modelEpoch.current) setConnecting(false);
    }
  }
  /** The main step: runs the current photo through the model and shows the
   * result. Called by the "Sort my letter" button. */
  async function sort() {
    if (scanLock.current) return;
    // Check there is a photo and a loaded model before doing anything.
    setError("");
    if (!src) {
      setError(
        mode === "camera"
          ? "Take a photo of your letter first."
          : "A letter first, please. Upload a photo or use the camera.",
      );
      return;
    }
    if (!model.current && connecting) {
      setError("The model is still loading. Try again in a moment.");
      return;
    }
    if (!model.current) {
      setModelError(
        "Your final model is not connected yet. Add your trained image-model link to start real sorting.",
      );
      setModal(true);
      return;
    }
    scanLock.current = true;
    setBusy(true);
    setPhase("sorting");
    setResult(null);
    setFeedbackOpen(false);
    try {
      // Crop to a centre square, the same framing Teachable Machine used on
      // our training photos (see prepareInput in lib/model.ts).
      const input = prepareInput(await imageFromUrl(src));
      const started = performance.now();
      // predict() returns one probability per class. `false` = do not mirror
      // the image. validatePredictions() checks the numbers and sorts them
      // highest first, so predictions[0] is the model's top guess.
      const predictions = validatePredictions(
        await model.current.predict(input, false),
      );
      // Purely for the animation: keep the "sorting" bunny on screen for at
      // least 1.8 s. This does not change the prediction.
      if (motion) {
        const remaining = 1800 - (performance.now() - started);
        if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      }
      if (!alive.current) return;
      const delivery: Delivery = {
        id: nextId.current++,
        src: input.toDataURL("image/png"),
        name: filename,
        predictions,
        time: new Date().toLocaleString(),
      };
      setResult(delivery);
      setHistory((h) => [delivery, ...h].slice(0, 20)); // newest first, max 20
      setPhase("delivered");
    } catch (e) {
      if (alive.current) {
        setError(
          e instanceof Error
            ? e.message
            : "This letter got a little lost. Try again or reload the model.",
        );
        setPhase("error");
      }
    } finally {
      scanLock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  /** Saves the visitor's "correct language" note on the current result. This
   * only records it for this visit; it does NOT retrain the model. */
  function saveFeedback() {
    if (!result || !expected.trim()) return;
    const next = {
      ...result,
      feedback: { expected: expected.trim(), note: note.trim() },
    };
    setResult(next);
    setHistory((h) => h.map((d) => (d.id === result.id ? next : d)));
    setFeedbackOpen(false);
  }
  /** Downloads this visit's results and corrections as a JSON file, so a
   * tester can keep notes. Photos are left out (`src` is dropped). */
  function exportRecords() {
    const records = history.map(({ src, ...delivery }) => delivery);
    const blob = new Blob(
      [
        JSON.stringify(
          {
            description:
              "User-recorded trials from this visit; not an accuracy evaluation or retraining dataset.",
            records,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "oscbunny-test-notes.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  const top = result?.predictions[0]; // the model's top guess for the current photo
  // ---- Page layout ----
  return (
    <main className={motion ? "" : "motion-paused"}>
      {/* Oscbunny's own header and view switcher (the group site's header is
          added above this by the build script). */}
      <header>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("office");
          }}
          aria-label="Oscbunny home"
        >
          <span className="brand-stamp">
            <Mail size={22} />
            <i>81</i>
          </span>
          <span>
            oscbunny<span className="brand-sub">THE LITTLE POST OFFICE</span>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <button
            onClick={() => navigate("office")}
            className={view === "office" ? "active" : ""}
          >
            The post office
          </button>
          <button
            onClick={() => navigate("deliveries")}
            className={view === "deliveries" ? "active" : ""}
          >
            My deliveries{" "}
            {history.length > 0 && (
              <span className="count">{history.length}</span>
            )}
          </button>
          <button
            onClick={() => navigate("notebook")}
            className={view === "notebook" ? "active" : ""}
          >
            Project statement <BookOpen size={13} />
          </button>
        </nav>
        <button
          className="motion-toggle"
          aria-pressed={!motion}
          onClick={() => setMotion((m) => !m)}
          title={
            motion ? "Pause decorative motion" : "Enable decorative motion"
          }
        >
          {motion ? <Pause size={13} /> : <Play size={13} />}
          <span>{motion ? "Pause motion" : "Motion paused"}</span>
        </button>
      </header>
      {/* VIEW 1: the post office (hero, demo video, sorting counter). It is
          hidden rather than removed so the photo and camera survive switching. */}
      <div hidden={view !== "office"}>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> SPECIAL DELIVERY, EXTRA FLOPPY EARS.
            </div>
            <h1>
              Little letters.
              <br />
              Big{" "}
              <span>
                hopportunities.
                <svg viewBox="0 0 500 24" aria-hidden="true">
                  <path
                    d="M4 14Q200 -1 493 12M80 21Q283 5 433 19"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p>
              A handwritten hello deserves a proper delivery.
              <br />
              Let Oscbunny take a little look and guess its language.
            </p>
            <div className="hero-bottom">
              <span className="mini-envelope">✉</span>
              <span>
                One bunny. Many languages.
                <br />
                <b>Absolutely no sense of urgency.</b>
              </span>
              <span className="handwritten hero-note">
                he’s doing his best. ↗
              </span>
            </div>
          </div>
          <div className="hero-art">
            <div className="art-halo" />
            <div className="speech handwritten" aria-live="polite">
              {busy
                ? "“On my way. Slowly.”"
                : phase === "delivered"
                  ? "“A special delivery for you.”"
                  : "“Looks like a letter.\nGood start.”"}
            </div>
            <PostalScene phase={phase} motion={motion} />
            <span className="postmark">
              <span>OSCBUNNY POST</span>
              <b>81</b>
              <small>EXPRESS-ISH DELIVERY</small>
            </span>
          </div>
        </section>
        <div className="airmail-rule" />
        {/* Demonstration video (source set in config.ts). */}
        <div className="home-video">
          <Video />
        </div>
        <div className="airmail-rule" />
        {/* The sorting counter: the actual classifier interface. */}
        <section id="counter" className="counter">
          <div className="counter-title">
            <div>
              <span className="eyebrow">01 / THE SORTING COUNTER</span>
              <h2>Got a letter for me?</h2>
            </div>
            <span className="handwritten counter-note">
              leave it right here ↴
            </span>
            <button
              className={"model-status " + (connected ? "connected" : "")}
              disabled={busy}
              onClick={() => setModal(true)}
            >
              <span />
              {connected
                ? "MODEL CONNECTED"
                : connecting
                  ? "LOADING MODEL…"
                  : "MODEL NOT CONNECTED"}{" "}
              <Settings2 size={12} />
            </button>
          </div>
          {/* Banner shown until the model is ready: loading, failed, or no
              model link set. */}
          {!connected &&
            (connecting ? (
              <div className="model-placeholder" role="status">
                <LoaderCircle size={18} className="spin" />
                <p>
                  <b>Waking up the sorter…</b> Loading our trained Teachable
                  Machine model. This takes a few seconds on the first visit.
                </p>
              </div>
            ) : experiment.modelUrl.trim() ? (
              <div className="model-placeholder" role="alert">
                <Mail size={18} />
                <p>
                  <b>The model couldn’t load.</b> Check your internet
                  connection or content blocker, then try again.
                </p>
                <button onClick={() => connect(experiment.modelUrl)}>
                  Try again <RotateCcw size={14} />
                </button>
              </div>
            ) : (
              <div className="model-placeholder">
                <Mail size={18} />
                <p>
                  <b>The post office is waiting for its training.</b> You can
                  upload and capture letters now. Real predictions start
                  after you connect your trained Teachable Machine model.
                </p>
                <button onClick={() => setModal(true)}>
                  Connect model <ArrowRight size={14} />
                </button>
              </div>
            ))}
          <div className="counter-grid">
            {/* LEFT: where the photo comes in (Upload / Camera tabs). */}
            <div className="letter-panel">
              <div
                className="mode-tabs"
                role="tablist"
                aria-label="Letter input"
              >
                {(
                  [
                    { id: "upload", label: "Upload a letter", icon: Upload },
                    { id: "camera", label: "Camera", icon: Camera },
                  ] as const
                ).map((t) => (
                  <button
                    id={`tab-${t.id}`}
                    aria-controls={`panel-${t.id}`}
                    key={t.id}
                    role="tab"
                    aria-selected={mode === t.id}
                    disabled={busy}
                    className={mode === t.id ? "selected" : ""}
                    onClick={() => switchMode(t.id)}
                  >
                    <t.icon size={14} />
                    {t.label}
                  </button>
                ))}
              </div>
              {/* Upload tab: click to choose a file, or drag and drop one. */}
              <div
                id="panel-upload"
                role="tabpanel"
                aria-labelledby="tab-upload"
                hidden={mode !== "upload"}
              >
                <div
                  className={"letter-area " + (drag ? "dragging" : "")}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!busy) setDrag(true);
                  }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDrag(false);
                    const f = e.dataTransfer.files[0];
                    if (f && !busy) void upload(f);
                  }}
                >
                  {src ? (
                    <>
                      <img
                        src={src}
                        className="uploaded-letter"
                        alt={filename}
                      />
                      <span className="paper-clip" />
                      <button
                        className="replace"
                        disabled={busy}
                        onClick={() => file.current?.click()}
                      >
                        <RotateCcw size={12} /> Change letter
                      </button>
                    </>
                  ) : (
                    <button
                      className="upload-empty upload-target"
                      disabled={busy}
                      onClick={() => file.current?.click()}
                    >
                      <span className="envelope-doodle">
                        <Mail size={53} strokeWidth={1.2} />
                        <Heart size={18} fill="currentColor" />
                      </span>
                      <h3>A little letter goes a long way.</h3>
                      <p>
                        Drop a photo of your handwriting here,
                        <br />
                        or choose one from your device.
                      </p>
                      <span className="choose-file">
                        Choose a letter <span>+</span>
                      </span>
                      <small>JPG, PNG, WEBP · UP TO 20 MB</small>
                    </button>
                  )}
                </div>
              </div>
              {/* Camera tab: live preview, then "Take letter photo". */}
              <div
                id="panel-camera"
                role="tabpanel"
                aria-labelledby="tab-camera"
                hidden={mode !== "camera"}
              >
                <div className="letter-area camera-area">
                  <video
                    ref={video}
                    autoPlay
                    muted
                    playsInline
                    aria-label="Live camera preview"
                    className={cameraOn ? "" : "invisible"}
                  />
                  {!cameraOn && (
                    <div className="upload-empty">
                      <Camera size={40} strokeWidth={1.2} />
                      <h3>A letter, live from your desk.</h3>
                      <p>Keep the page clear, bright, and facing the camera.</p>
                      <button
                        className="choose-file"
                        disabled={cameraStarting}
                        onClick={startCamera}
                      >
                        {cameraStarting ? "Opening camera…" : "Open camera"}{" "}
                        {cameraStarting ? (
                          <LoaderCircle size={14} className="spin" />
                        ) : (
                          <Camera size={14} />
                        )}
                      </button>
                      <small>
                        Camera access is requested only when you click.
                      </small>
                    </div>
                  )}
                  {cameraOn && (
                    <div className="camera-buttons">
                      <button className="choose-file" onClick={capture}>
                        <Camera size={14} /> Take letter photo
                      </button>
                      <button className="choose-file" onClick={stopCamera}>
                        Stop camera
                      </button>
                    </div>
                  )}
                </div>
                {cameraError && (
                  <div className="error" role="alert">
                    {cameraError}
                  </div>
                )}
              </div>
              <div className="letter-bottom">
                <span>
                  <Heart size={11} /> Photos stay in your browser.
                </span>
                <span>A clear photo helps a little.</span>
              </div>
            </div>
            {/* RIGHT: the delivery slip. Shows the result if there is one,
                otherwise the "Sort my letter" button. */}
            <div
              className={"sorting-desk " + (result ? "has-result" : "")}
              aria-live="polite"
              aria-busy={busy}
            >
              <span className="desk-pin" />
              <div className="desk-head">
                <span>OSCBUNNY’S DELIVERY SLIP</span>
                <Mail size={14} />
              </div>
              {result && top ? (
                <div className="delivery-content">
                  <div className="delivery-stamp">
                    LETTER SORTED <Check size={12} />
                  </div>
                  {/* Below 65% top confidence the bunny sounds unsure. This
                      only changes the caption, not the predicted label. */}
                  <p className="handwritten result-quote">
                    {top.probability < 0.65
                      ? "“Hmm. A bit of a mystery.”"
                      : "“A special delivery for you.”"}
                  </p>
                  <h3>{top.className}</h3>
                  <div className="confidence">
                    <strong>
                      {(top.probability * 100).toFixed(1)}
                      <span>%</span>
                    </strong>
                    <span>model confidence</span>
                  </div>
                  <p className="letter-recipient">
                    FOR: {result.name}
                    <br />
                    DELIVERY {String(result.id).padStart(3, "0")} ·{" "}
                    {result.time}
                  </p>
                  {/* Every class's score as a bar, not just the winner, so
                      close calls are visible. */}
                  <div className="predictions">
                    {result.predictions.map((p) => (
                      <div key={p.className}>
                        <div>
                          <span>{p.className}</span>
                          <b>{(p.probability * 100).toFixed(1)}%</b>
                        </div>
                        <div
                          className="meter"
                          role="meter"
                          aria-label={`${p.className} confidence`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={p.probability * 100}
                        >
                          <i style={{ width: `${p.probability * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="result-note">
                    Confidence is the model’s estimate, not a guarantee. It must
                    choose among its trained classes, even for an unfamiliar
                    language.
                  </p>
                  {result.feedback ? (
                    <p className="feedback-saved">
                      <Check size={13} /> You recorded:{" "}
                      {result.feedback.expected}. Saved for this visit only.
                    </p>
                  ) : (
                    <button
                      className="text-link"
                      onClick={() => {
                        setFeedbackOpen((v) => !v);
                        setExpected("");
                        setNote("");
                      }}
                    >
                      Did Oscbunny get it wrong?
                    </button>
                  )}
                  {feedbackOpen && (
                    <div className="feedback-form">
                      <label>
                        What language should this be?
                        <input
                          value={expected}
                          maxLength={100}
                          onChange={(e) => setExpected(e.target.value)}
                          placeholder="Your observed correct label"
                        />
                      </label>
                      <label>
                        Your test note (optional)
                        <textarea
                          maxLength={1000}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />
                      </label>
                      <button
                        className="choose-file"
                        disabled={!expected.trim()}
                        onClick={saveFeedback}
                      >
                        Save my observation
                      </button>
                      <small>
                        This records your observation. It does not retrain the
                        model.
                      </small>
                    </div>
                  )}
                  <button
                    className="sort-button"
                    onClick={() => {
                      setResult(null);
                      setPhase("idle");
                      setError("");
                    }}
                  >
                    Another little letter <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="waiting-content">
                  {busy ? (
                    <div className="desk-postal">
                      <PostalScene
                        phase="sorting"
                        motion={motion}
                        interactive={false}
                      />
                    </div>
                  ) : (
                    <div className="tiny-bunny">
                      <Bunny small />
                    </div>
                  )}
                  <h3>
                    {busy ? "One moment, please." : "Signed, sealed… sorted?"}
                  </h3>
                  <p>
                    {busy
                      ? "Oscbunny is sorting your handwriting. Very important bunny business."
                      : "Your letter is in good paws. Add handwriting, then let the little postbun take a look."}
                  </p>
                  <div className="three-steps">
                    <span>
                      <b>1</b> Add a letter
                    </span>
                    <i>···</i>
                    <span>
                      <b>2</b> Bunny thinks
                    </span>
                    <i>···</i>
                    <span>
                      <b>3</b> Delivery!
                    </span>
                  </div>
                  <button
                    className="sort-button"
                    onClick={sort}
                    disabled={busy || connecting}
                  >
                    {busy ? (
                      <LoaderCircle className="spin" size={17} />
                    ) : (
                      <Mail size={17} />
                    )}{" "}
                    {busy ? "Sorting your letter…" : "Sort my letter"}
                    {!busy && <ArrowRight size={17} />}
                  </button>
                  <p className="under-button">
                    {connected
                      ? `${labels.length} model classes · all confidence scores shown`
                      : "No trained model yet · no predictions are invented."}
                  </p>
                </div>
              )}
              {error && (
                <div className="error" role="alert">
                  {error}
                </div>
              )}
              <span className="slip-foot">
                POSTBUN NO. 81 <Heart size={10} /> HANDLE WITH A LITTLE LOVE
              </span>
            </div>
          </div>
        </section>
        {/* Two postcards that jump to the Upload or Camera tab. */}
        <section className="sample-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">02 / EVERY HELLO HAS A WAY HOME</span>
              <h2>Two ways to send a little letter.</h2>
              <p>Your own handwriting. Your own hello.</p>
            </div>
            <span className="handwritten">sent with love, obviously. ♡</span>
          </div>
          <div className="postcard-grid">
            {(
              [
                {
                  mode: "upload",
                  title: "A little photo",
                  sub: "From paper to post.",
                  color: "blue",
                  icon: Upload,
                },
                {
                  mode: "camera",
                  title: "Hello, camera!",
                  sub: "Straight from your desk.",
                  color: "yellow",
                  icon: Camera,
                },
              ] as const
            ).map((c, i) => (
              <button
                className={`postcard ${c.color}`}
                key={c.mode}
                disabled={busy}
                onClick={() => {
                  switchMode(c.mode);
                  document
                    .getElementById("counter")
                    ?.scrollIntoView({ behavior: motion ? "smooth" : "auto" });
                }}
              >
                <div className="postcard-top">
                  <span>LITTLE LETTER NO. 0{i + 1}</span>
                  <span className="stamp">
                    <c.icon size={18} />
                    <small>81</small>
                  </span>
                </div>
                <div className="postcard-writing">
                  {c.title}
                  <small>{c.sub}</small>
                </div>
                <div className="postcard-bottom">
                  <span>
                    {c.mode === "upload"
                      ? "Choose an original handwriting photo"
                      : "Open the camera counter"}
                  </span>
                  <ArrowUpRight size={17} />
                </div>
              </button>
            ))}
          </div>
        </section>
        <section className="about-strip">
          <div className="post-office-icon">
            ✉<span>81</span>
          </div>
          <div>
            <h3>Small post office. Bigger questions.</h3>
            <p>
              Our dataset, methods, findings, and original LIS 500 writing
              are in our project statement.
            </p>
          </div>
          <button onClick={() => navigate("notebook")}>
            Read the project statement <ArrowUpRight size={15} />
          </button>
        </section>
      </div>
      {/* VIEW 2: the project statement (components/ResearchNotebook.tsx). */}
      {view === "notebook" && <ResearchNotebook />}
      {/* VIEW 3: "My deliveries", the results from this visit. Clicking a
          card reopens it on the delivery slip. */}
      {view === "deliveries" && (
        <section className="deliveries-page">
          <div className="eyebrow">THE LETTERS THAT MADE IT</div>
          <h1>
            Your little <span>deliveries.</span>
          </h1>
          <p>
            Your last 20 real predictions from this visit. Refreshing clears
            these records.
          </p>
          {history.length ? (
            <>
              <button className="choose-file" onClick={exportRecords}>
                <Download size={14} /> Export my test notes (JSON)
              </button>
              <p className="export-help">
                Includes predictions and your corrections, without photos.
                Export before refreshing.
              </p>
              <div className="delivery-grid">
                {history.map((h) => (
                  <button
                    className="delivery-card"
                    key={h.id}
                    onClick={() => {
                      setResult(h);
                      setFeedbackOpen(false);
                      setView("office");
                      setPhase("delivered");
                      setTimeout(
                        () =>
                          document.getElementById("counter")?.scrollIntoView({
                            behavior: motion ? "smooth" : "auto",
                          }),
                        0,
                      );
                    }}
                  >
                    <img src={h.src} alt={h.name} />
                    <div>
                      <span>DELIVERY {String(h.id).padStart(3, "0")}</span>
                      <h3>{h.predictions[0].className}</h3>
                      <p>
                        {(h.predictions[0].probability * 100).toFixed(1)}%
                        confidence <ArrowUpRight size={16} />
                      </p>
                      {h.feedback && (
                        <small>Your correction: {h.feedback.expected}</small>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-deliveries">
              <Bunny />
              <h2>Not a single letter. Peaceful.</h2>
              <p>Connect your model and send a handwritten hello.</p>
              <button
                className="sort-button"
                onClick={() => navigate("office")}
              >
                Visit the sorting counter <ArrowRight size={16} />
              </button>
            </div>
          )}
        </section>
      )}
      {/* The shared group footer is added outside the app by tools/build-oscbunny.mjs. */}
      {/* Hidden file picker, opened by the upload buttons. Clearing its value
          lets the same file be chosen twice in a row. */}
      <input
        ref={file}
        className="hidden"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const image = e.target.files?.[0];
          if (image) void upload(image);
          e.target.value = "";
        }}
      />
      {/* Model dialog: explains the model and lets a tester load a different
          exported Teachable Machine image model by URL. */}
      {modal && (
        <Modal
          title="The brains behind the bunny."
          close={() => setModal(false)}
        >
          <div className="eyebrow">
            OUR GOOGLE TEACHABLE MACHINE IMAGE MODEL
          </div>
          <p>
            This page runs our <b>V3 model</b>, trained in Google Teachable
            Machine on <b>322 of our own handwriting photos</b> in Hindi, Telugu
            and English, and tested on 9 held-out images.
          </p>
          <div className="model-card">
            <label htmlFor="model-url">
              Exported image-model URL (or local model folder)
            </label>
            <input
              id="model-url"
              type="text"
              placeholder="https://teachablemachine.withgoogle.com/models/YOUR_ID/"
              value={modelUrl}
              onChange={(e) => setModelUrl(e.target.value)}
              disabled={connecting}
            />
            <button
              className="sort-button"
              disabled={connecting || !modelUrl.trim()}
              onClick={() => connect()}
            >
              {connecting ? (
                <LoaderCircle className="spin" size={16} />
              ) : (
                <Mail size={16} />
              )}{" "}
              {connecting
                ? "Opening the mailbag…"
                : connected
                  ? "Connect a different model"
                  : "Connect my trained model"}
              <ArrowRight size={16} />
            </button>
            {modelError && (
              <div className="error" role="alert">
                {modelError}
              </div>
            )}
            {connected && (
              <p className="connected-note">
                Current model: {labels.join(", ")}
              </p>
            )}
            <small>
              You can try a different exported Teachable Machine image model
              here. It resets to our model when the page is refreshed.
            </small>
          </div>
          <p>
            Photos are processed on your device. Connecting
            downloads model files and libraries; your letter is not sent to a
            prediction server.
          </p>
          <details>
            <summary>What happens if the language is unfamiliar?</summary>
            <p>
              The model only knows its training classes. It can return a
              confident wrong answer for other handwriting, blank pages, or
              unrelated images. Record corrections on the delivery slip; these
              notes do not retrain it.
            </p>
          </details>
          <details>
            <summary>Preparing input consistently</summary>
            <p>
              Every photo is cropped to its centre square, the same way
              Teachable Machine crops training images, then passed to the
              model. Edges of very wide or tall photos are cut off, so keep the
              writing near the middle. Use comparable framing and backgrounds
              when collecting and testing your original photos.
            </p>
          </details>
          <div className="modal-bottom">
            The bunny is a bunny. The research is yours.
          </div>
        </Modal>
      )}
    </main>
  );
}
