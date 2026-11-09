import { useEffect, useRef, useState } from "react";
import type P5 from "p5";
import { RotateCcw, Undo2, Download } from "lucide-react";
type Point = { x: number; y: number };
type Stroke = { points: Point[]; weight: number };
export type PadApi = { canvas: HTMLCanvasElement; hasInk: () => boolean };
type Props = {
  disabled: boolean;
  onReady: (api: PadApi | null) => void;
  onChange: (hasInk: boolean) => void;
};
export default function HandwritingPad({ disabled, onReady, onChange }: Props) {
  const host = useRef<HTMLDivElement>(null),
    instance = useRef<P5 | null>(null);
  const strokes = useRef<Stroke[]>([]),
    active = useRef<Stroke | null>(null),
    locked = useRef(disabled),
    weight = useRef(6);
  const callbacks = useRef({ onReady, onChange });
  callbacks.current = { onReady, onChange };
  locked.current = disabled;
  const [ready, setReady] = useState(false),
    [count, setCount] = useState(0),
    [size, setSize] = useState(6),
    [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false,
      cleanup: (() => void) | undefined;
    import("p5")
      .then(({ default: Constructor }) => {
        if (cancelled || !host.current) return;
        const sketch = new Constructor((p: P5) => {
          p.setup = () => {
            p.pixelDensity(1);
            const renderer = p.createCanvas(720, 720);
            const canvas = renderer.elt as HTMLCanvasElement;
            canvas.setAttribute("role", "img");
            canvas.setAttribute(
              "aria-label",
              "Handwriting paper. Draw with a mouse, pen or touch. Upload or camera are available as alternatives.",
            );
            canvas.style.touchAction = "none";
            p.noLoop();
            const point = (e: PointerEvent): Point => {
              const r = canvas.getBoundingClientRect();
              return {
                x: Math.max(
                  0,
                  Math.min(720, ((e.clientX - r.left) * 720) / r.width),
                ),
                y: Math.max(
                  0,
                  Math.min(720, ((e.clientY - r.top) * 720) / r.height),
                ),
              };
            };
            let pointer: number | null = null;
            const down = (e: PointerEvent) => {
              if (
                locked.current ||
                pointer !== null ||
                (e.pointerType === "mouse" && e.button !== 0)
              )
                return;
              e.preventDefault();
              canvas.setPointerCapture(e.pointerId);
              pointer = e.pointerId;
              setCount(strokes.current.length + 1);
              active.current = { points: [point(e)], weight: weight.current };
              p.redraw();
            };
            const move = (e: PointerEvent) => {
              if (pointer !== e.pointerId || !active.current) return;
              e.preventDefault();
              active.current.points.push(point(e));
              p.redraw();
            };
            const end = (e: PointerEvent) => {
              if (pointer !== e.pointerId) return;
              if (active.current) {
                strokes.current.push(active.current);
                active.current = null;
              }
              pointer = null;
              if (canvas.hasPointerCapture(e.pointerId))
                canvas.releasePointerCapture(e.pointerId);
              p.redraw();
              setCount(strokes.current.length);
              callbacks.current.onChange(strokes.current.length > 0);
            };
            canvas.addEventListener("pointerdown", down);
            canvas.addEventListener("pointermove", move);
            canvas.addEventListener("pointerup", end);
            canvas.addEventListener("pointercancel", end);
            cleanup = () => {
              canvas.removeEventListener("pointerdown", down);
              canvas.removeEventListener("pointermove", move);
              canvas.removeEventListener("pointerup", end);
              canvas.removeEventListener("pointercancel", end);
            };
            callbacks.current.onReady({
              canvas,
              hasInk: () => strokes.current.length > 0 || !!active.current,
            });
            setReady(true);
          };
          p.draw = () => {
            p.background(255);
            p.stroke("#55463d");
            p.strokeCap(p.ROUND);
            p.strokeJoin(p.ROUND);
            p.noFill();
            for (const stroke of [
              ...strokes.current,
              ...(active.current ? [active.current] : []),
            ]) {
              p.strokeWeight(stroke.weight);
              if (stroke.points.length === 1)
                p.point(stroke.points[0].x, stroke.points[0].y);
              else {
                p.beginShape();
                for (const a of stroke.points) p.vertex(a.x, a.y);
                p.endShape();
              }
            }
          };
        }, host.current);
        instance.current = sketch;
      })
      .catch(() => {
        if (!cancelled)
          setError(
            "The writing pad could not open. Refresh the page or use an upload instead.",
          );
      });
    return () => {
      cancelled = true;
      cleanup?.();
      instance.current?.remove();
      instance.current = null;
      callbacks.current.onReady(null);
    };
  }, []);
  const redraw = () => {
    instance.current?.redraw();
    setCount(strokes.current.length);
    callbacks.current.onChange(strokes.current.length > 0);
  };
  return (
    <div className="pad">
      <div className="pad-paper">
        <div ref={host} className="p5-handwriting" />
        {!ready && !error && (
          <div className="pad-message">Unfolding your paper…</div>
        )}
        {ready && !count && (
          <div className="pad-message handwritten">
            Dear Oscbunny…<small>Write with your mouse, finger or pen.</small>
          </div>
        )}
        {error && (
          <div role="alert" className="pad-message">
            {error}
          </div>
        )}
      </div>
      <div className="pad-tools">
        <label>
          Pen{" "}
          <select
            aria-label="Pen thickness"
            value={size}
            disabled={disabled}
            onChange={(e) => {
              const v = Number(e.target.value);
              setSize(v);
              weight.current = v;
            }}
          >
            <option value={3}>Fine</option>
            <option value={6}>Medium</option>
            <option value={10}>Bold</option>
          </select>
        </label>
        <button
          disabled={disabled || !count}
          onClick={() => {
            strokes.current.pop();
            redraw();
          }}
        >
          <Undo2 size={14} /> Undo
        </button>
        <button
          disabled={disabled || !count}
          onClick={() => {
            strokes.current = [];
            active.current = null;
            redraw();
          }}
        >
          <RotateCcw size={14} /> Clear
        </button>
        <button
          disabled={disabled || !count}
          onClick={() => {
            const c = host.current?.querySelector("canvas");
            if (c) {
              const a = document.createElement("a");
              a.href = c.toDataURL();
              a.download = "oscbunny-handwritten-note.png";
              a.click();
            }
          }}
        >
          <Download size={14} /> Save note
        </button>
      </div>
      <p className="pad-help">
        Only the ink on white paper goes to the model. Decorations stay outside
        your letter.
      </p>
    </div>
  );
}
