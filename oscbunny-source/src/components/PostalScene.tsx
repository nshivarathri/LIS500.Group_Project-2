import { useEffect, useRef, useState } from "react";
import type P5 from "p5";
import Bunny from "./Bunny";
export type PostalPhase = "idle" | "sorting" | "delivered" | "error";
export default function PostalScene({
  phase,
  motion,
  interactive = true,
}: {
  phase: PostalPhase;
  motion: boolean;
  interactive?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null),
    instance = useRef<P5 | null>(null),
    status = useRef({ phase, motion }),
    start = useRef(0),
    burst = useRef(0),
    [petted, setPetted] = useState(false);
  status.current = { phase, motion };
  useEffect(() => {
    start.current = performance.now();
    instance.current?.redraw();
  }, [phase, motion]);
  useEffect(() => {
    let cancelled = false,
      observer: IntersectionObserver | undefined;
    let visible = true;
    import("p5")
      .then(({ default: Constructor }) => {
        if (cancelled || !host.current) return;
        const p = new Constructor((p: P5) => {
          const heart = (x: number, y: number, s: number) => {
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
          p.setup = () => {
            const c = p.createCanvas(430, 360);
            p.pixelDensity(1);
            c.elt.setAttribute("aria-hidden", "true");
            p.frameRate(24);
          };
          p.draw = () => {
            p.clear();
            const { phase, motion } = status.current;
            const t = motion ? p.millis() / 1000 : 0;
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
                const progress = motion
                  ? ((performance.now() - start.current) % 1700) / 1700
                  : 0.65;
                const x = p.bezierPoint(62, 145, 282, 355, progress),
                  y = p.bezierPoint(240, 76, 145, 275, progress);
                envelope(x, y, -0.15 + progress * 0.35);
              } else {
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
            const age = performance.now() - burst.current;
            if (burst.current && age < 1800) {
              for (let i = 0; i < 5; i++)
                heart(
                  170 + (i - 2) * 23,
                  180 - age / 22 + Math.sin(i) * 9,
                  0.25,
                );
            }
            if (!motion || !visible || document.hidden) p.noLoop();
          };
        }, host.current);
        instance.current = p;
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
    const visibility = () => {
      if (!document.hidden && visible && status.current.motion)
        instance.current?.loop();
      else instance.current?.noLoop();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelled = true;
      observer?.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      instance.current?.remove();
      instance.current = null;
    };
  }, []);
  useEffect(() => {
    if (motion) instance.current?.loop();
    else instance.current?.redraw();
  }, [motion]);
  useEffect(() => {
    if (!petted) return;
    const timer = setTimeout(() => setPetted(false), 2000);
    return () => clearTimeout(timer);
  }, [petted]);
  const pet = () => {
    burst.current = performance.now();
    setPetted(true);
    instance.current?.redraw();
  };
  return (
    <div className={"postal-scene " + (petted ? "petted" : "")}>
      <div className="postal-effects" ref={host} />
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
