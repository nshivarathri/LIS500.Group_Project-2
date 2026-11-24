import { useEffect, useRef, useState } from "react";
import type P5 from "p5";
import Bunny from "./Bunny";
/** Animation state, set by App.tsx as a prediction runs. */
export type PostalPhase = "idle" | "sorting" | "delivered" | "error";
/**
 * The animated scene around the bunny. Decoration only: it has no effect on
 * the classifier. The bunny itself is an SVG (Bunny.tsx); the floating hearts,
 * sparkles, mailbox and flying envelope are drawn on a p5.js canvas behind it.
 *
 * - idle: hearts and sparkles drift.
 * - sorting: an envelope flies along a curve into the mailbox.
 * - delivered: a green tick appears on the mailbox.
 * Clicking the bunny ("pat") releases a few hearts.
 *
 * To save battery, the canvas stops redrawing when motion is paused, the tab
 * is hidden, or the scene is scrolled off screen.
 */
export default function PostalScene({
  phase,
  motion,
  interactive = true,
}: {
  phase: PostalPhase;
  motion: boolean;
  interactive?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null), // element the p5 canvas goes in
    instance = useRef<P5 | null>(null), // the running p5 sketch
    // p5's draw loop is created once, so it reads the latest props from this
    // ref instead of from (stale) closure variables.
    status = useRef({ phase, motion }),
    start = useRef(0), // when the current phase began (envelope flight timing)
    burst = useRef(0), // when the bunny was last patted (heart burst timing)
    [petted, setPetted] = useState(false);
  status.current = { phase, motion };
  // Restart the phase timer and repaint whenever the phase or motion changes.
  useEffect(() => {
    start.current = performance.now();
    instance.current?.redraw();
  }, [phase, motion]);
  useEffect(() => {
    let cancelled = false,
      observer: IntersectionObserver | undefined;
    let visible = true;
    // p5 is loaded lazily (a separate file) so the classifier can appear
    // before the decorative graphics finish downloading.
    import("p5")
      .then(({ default: Constructor }) => {
        if (cancelled || !host.current) return;
        // p5 "instance mode": all drawing calls go through `p`, so the sketch
        // does not pollute the global scope.
        const p = new Constructor((p: P5) => {
          /** Draws a small pink heart centred at (x, y), scaled by s. */
          const heart =(x: number, y: number, s: number) => {
            p.push();
            p.translate(x, y);
            p.scale(s);
            p.noStroke();
            p.fill("#e7b2af");
            p.beginShape();
            p.vertex(0, 5);
            p.bezierVertex(-17, -6, -10, -16, 0, -7);
            p.bezierVertex(10, -16, 17, -6, 0, 5);
            p.endShape(p.CLOSE);
            p.pop();
          };
          /** Draws a sealed envelope centred at (x, y), tilted by `rotation` radians. */
          const envelope = (x: number, y: number, rotation: number) => {
            p.push();
            p.translate(x, y);
            p.rotate(rotation);
            p.fill("#fffaf0");
            p.stroke("#c7ab8c");
            p.strokeWeight(1.5);
            p.rect(-23, -15, 46, 30, 4);
            p.line(-22, -14, 0, 2);
            p.line(0, 2, 22, -14);
            heart(0, 4, 0.35);
            p.pop();
          };
          // Canvas matches the bunny SVG's 430x360 viewBox so they line up.
          // 24 fps is plenty for gentle decoration and keeps CPU use low.
          p.setup = () => {
            const c = p.createCanvas(430, 360);
            p.pixelDensity(1);
            c.elt.setAttribute("aria-hidden", "true");
            p.frameRate(24);
          };
          p.draw = () => {
            p.clear();
            const { phase, motion } = status.current;
            const t = motion ? p.millis() / 1000 : 0; // seconds; frozen at 0 when paused
            // Five fixed decorations: odd ones are hearts, even ones are
            // slowly spinning sparkles. All bob up and down a little.
            for (let i = 0; i < 5; i++) {
              const x = [57, 353, 381, 42, 329][i],
                y = [112, 53, 180, 252, 112][i];
              const drift = motion ? Math.sin(t * 0.6 + i) * 5 : 0;
              if (i % 2) heart(x, y + drift, 0.35);
              else {
                p.push();
                p.translate(x, y + drift);
                p.rotate(t * 0.1);
                p.stroke("#c6b98e");
                p.strokeWeight(1.5);
                p.line(-4, 0, 4, 0);
                p.line(0, -4, 0, 4);
                p.pop();
              }
            }
            // While sorting or delivered, draw a mailbox in the bottom right.
            if (phase === "sorting" || phase === "delivered") {
              p.push();
              p.translate(329, 260);
              p.fill("#b9ced0");
              p.stroke("#829da0");
              p.strokeWeight(1.5);
              p.rect(0, 0, 53, 52, 15, 15, 3, 3);
              p.fill("#8ba9ad");
              p.rect(6, 15, 41, 7, 3);
              p.fill("#ecd3b8");
              p.rect(23, 52, 7, 28);
              p.stroke("#b49a7c");
              p.line(25, 11, 39, 11);
              p.pop();
              if (phase === "sorting") {
                // Envelope flies along a Bezier curve into the mailbox,
                // repeating every 1.7 s (paused mid-flight if motion is off).
                const progress = motion
                  ? ((performance.now() - start.current) % 1700) / 1700
                  : 0.65;
                const x = p.bezierPoint(62, 145, 282, 355, progress),
                  y = p.bezierPoint(240, 76, 145, 275, progress);
                envelope(x, y, -0.15 + progress * 0.35);
              } else {
                // Delivered: green circle with a tick on the mailbox.
                p.noStroke();
                p.fill("#a5b392");
                p.circle(355, 249, 24);
                p.stroke("#fffaf0");
                p.strokeWeight(2);
                p.noFill();
                p.beginShape();
                p.vertex(349, 249);
                p.vertex(354, 254);
                p.vertex(362, 245);
                p.endShape();
              }
            }
            // After a pat, five hearts float upward for 1.8 s.
            const age = performance.now() - burst.current;
            if (burst.current && age < 1800) {
              for (let i = 0; i < 5; i++)
                heart(
                  170 + (i - 2) * 23,
                  180 - age / 22 + Math.sin(i) * 9,
                  0.25,
                );
            }
            // Stop the loop when nobody can see it; it restarts below.
            if (!motion || !visible || document.hidden) p.noLoop();
          };
        }, host.current);
        instance.current = p;
        // Pause drawing while the scene is scrolled out of view.
        observer = new IntersectionObserver((entries) => {
          visible = entries[0].isIntersecting;
          if (visible && status.current.motion) p.loop();
          else p.noLoop();
        });
        observer.observe(host.current);
      })
      .catch(() => {
        /* The SVG bunny and classifier remain usable if decorative graphics fail. */
      });
    // Pause drawing while the browser tab is in the background.
    const visibility = () => {
      if (!document.hidden && visible && status.current.motion)
        instance.current?.loop();
      else instance.current?.noLoop();
    };
    document.addEventListener("visibilitychange", visibility);
    // Clean-up: remove the canvas and listeners when the scene unmounts.
    return () => {
      cancelled = true;
      observer?.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      instance.current?.remove();
      instance.current = null;
    };
  }, []);
  // Resume the loop when motion is switched back on; otherwise draw one still frame.
  useEffect(() => {
    if (motion) instance.current?.loop();
    else instance.current?.redraw();
  }, [motion]);
  // The "A tiny pat? For me?" caption goes back to normal after 2 s.
  useEffect(() => {
    if (!petted) return;
    const timer = setTimeout(() => setPetted(false), 2000);
    return () => clearTimeout(timer);
  }, [petted]);
  /** Clicking the bunny: start a heart burst and show the pat caption. */
  const pet = () => {
    burst.current = performance.now();
    setPetted(true);
    instance.current?.redraw();
  };
  return (
    <div className={"postal-scene " + (petted ? "petted" : "")}>
      <div className="postal-effects" ref={host} />
      {/* The small copy on the delivery slip is not clickable (interactive=false). */}
      {interactive ? (
        <button
          className="pet-bunny"
          onClick={pet}
          aria-label="Give Oscbunny a gentle pat"
        >
          <Bunny thinking={motion && phase === "sorting"} />
        </button>
      ) : (
        <div className="pet-bunny" aria-hidden="true">
          <Bunny thinking={motion && phase === "sorting"} />
        </div>
      )}
      <span className="scene-caption handwritten" aria-live="polite">
        {petted
          ? "A tiny pat? For me? ♡"
          : phase === "sorting"
            ? "Very important bunny business…"
            : phase === "delivered"
              ? "One little letter, delivered."
              : "a gentle pat is always welcome ♡"}
      </span>
    </div>
  );
}
