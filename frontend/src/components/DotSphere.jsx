import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const BASE = [236, 236, 238];
const HOT = [240, 165, 97];

/**
 * A sphere of stippled dots rendered on a 2D canvas.
 * Drag to spin (with inertia), click for a ripple, hover to light dots near the cursor.
 */
export default function DotSphere({ count = 9000, className = "" }) {
  const wrap = useRef(null);
  const canvas = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = canvas.current;
    const box = wrap.current;
    const ctx = el.getContext("2d");

    // Fibonacci sphere
    const n = count;
    const px = new Float32Array(n);
    const py = new Float32Array(n);
    const pz = new Float32Array(n);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      px[i] = Math.cos(t) * r;
      py[i] = y;
      pz[i] = Math.sin(t) * r;
    }

    const st = {
      w: 0,
      h: 0,
      dpr: 1,
      rotY: 0.6,
      rotX: -0.25,
      vY: reduce ? 0 : 0.0028,
      vX: 0,
      dragging: false,
      lastX: 0,
      lastY: 0,
      mouse: { x: -999, y: -999 },
      ripples: [],
      visible: true,
      raf: 0,
    };

    function resize() {
      const rect = box.getBoundingClientRect();
      st.dpr = Math.min(window.devicePixelRatio || 1, 2);
      st.w = rect.width;
      st.h = rect.height;
      el.width = Math.round(st.w * st.dpr);
      el.height = Math.round(st.h * st.dpr);
      el.style.width = `${st.w}px`;
      el.style.height = `${st.h}px`;
    }

    const buckets = Array.from({ length: 6 }, () => new Float32Array(n * 3));
    const counts = new Int32Array(6);

    function frame(time) {
      const { w, h, dpr } = st;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (!st.dragging) {
        st.rotY += st.vY;
        st.rotX += st.vX;
        st.vX *= 0.95;
        st.vY += ((reduce ? 0 : 0.0028) - st.vY) * 0.02;
        st.rotX += (-0.25 - st.rotX) * 0.004;
      }

      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.4;
      const cosY = Math.cos(st.rotY);
      const sinY = Math.sin(st.rotY);
      const cosX = Math.cos(st.rotX);
      const sinX = Math.sin(st.rotX);
      const F = 3.2;
      const now = time / 1000;
      st.ripples = st.ripples.filter((r) => now - r.t < 1.8);
      counts.fill(0);
      let hotCount = 0;
      const hot = buckets[5];

      for (let i = 0; i < n; i++) {
        let x = px[i] * cosY + pz[i] * sinY;
        let z = -px[i] * sinY + pz[i] * cosY;
        let y = py[i] * cosX - z * sinX;
        z = py[i] * sinX + z * cosX;

        const s = F / (F + z);
        let sx = cx + x * R * s;
        let sy = cy + y * R * s;
        let size = 0.55 + (z * -0.5 + 0.5) * 1.15;

        for (let k = 0; k < st.ripples.length; k++) {
          const rp = st.ripples[k];
          const dx = sx - rp.x;
          const dy = sy - rp.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const wave = (now - rp.t) * 260;
          const delta = d - wave;
          if (delta > -40 && delta < 40) {
            const amp = Math.cos((delta / 40) * (Math.PI / 2)) * (1 - (now - rp.t) / 1.8);
            sx += (dx / (d || 1)) * amp * 10;
            sy += (dy / (d || 1)) * amp * 10;
            size += amp * 1.4;
          }
        }

        const mdx = sx - st.mouse.x;
        const mdy = sy - st.mouse.y;
        if (mdx * mdx + mdy * mdy < 6400 && z < 0.4) {
          const o = hotCount * 3;
          hot[o] = sx;
          hot[o + 1] = sy;
          hot[o + 2] = size * 1.5 + 0.4;
          hotCount++;
          continue;
        }

        const depth = (1 - z) / 2; // 0 far .. 1 near
        const b = Math.min(4, Math.floor(depth * 5));
        const bk = buckets[b];
        const o = counts[b] * 3;
        bk[o] = sx;
        bk[o + 1] = sy;
        bk[o + 2] = size;
        counts[b]++;
      }

      for (let b = 0; b < 5; b++) {
        const a = 0.08 + b * 0.19;
        ctx.fillStyle = `rgba(${BASE[0]},${BASE[1]},${BASE[2]},${a})`;
        const bk = buckets[b];
        for (let j = 0; j < counts[b]; j++) {
          const s2 = bk[j * 3 + 2];
          ctx.fillRect(bk[j * 3] - s2 / 2, bk[j * 3 + 1] - s2 / 2, s2, s2);
        }
      }
      ctx.fillStyle = `rgb(${HOT[0]},${HOT[1]},${HOT[2]})`;
      for (let j = 0; j < hotCount; j++) {
        const s2 = hot[j * 3 + 2];
        ctx.fillRect(hot[j * 3] - s2 / 2, hot[j * 3 + 1] - s2 / 2, s2, s2);
      }

      if (st.visible && !reduce) st.raf = requestAnimationFrame(frame);
    }

    function pos(e) {
      const rect = el.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function down(e) {
      st.dragging = true;
      const p = pos(e);
      st.lastX = p.x;
      st.lastY = p.y;
      st.downAt = { ...p, t: performance.now() };
      el.setPointerCapture(e.pointerId);
    }
    function move(e) {
      const p = pos(e);
      st.mouse = p;
      if (!st.dragging) return;
      const dx = p.x - st.lastX;
      const dy = p.y - st.lastY;
      st.rotY += dx * 0.006;
      st.rotX = Math.max(-1.2, Math.min(1.2, st.rotX + dy * 0.006));
      st.vY = dx * 0.006;
      st.vX = dy * 0.006;
      st.lastX = p.x;
      st.lastY = p.y;
      if (reduce) frame(performance.now());
    }
    function up(e) {
      st.dragging = false;
      const p = pos(e);
      const moved = st.downAt ? Math.hypot(p.x - st.downAt.x, p.y - st.downAt.y) : 99;
      if (moved < 5) {
        st.ripples.push({ x: p.x, y: p.y, t: performance.now() / 1000 });
        if (reduce) frame(performance.now());
      }
    }
    function leave() {
      st.mouse = { x: -999, y: -999 };
    }

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) frame(performance.now());
    });
    ro.observe(box);
    const io = new IntersectionObserver(([entry]) => {
      st.visible = entry.isIntersecting;
      if (st.visible && !reduce) {
        cancelAnimationFrame(st.raf);
        st.raf = requestAnimationFrame(frame);
      }
    });
    io.observe(box);

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointerleave", leave);
    st.raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(st.raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointerleave", leave);
    };
  }, [count, reduce]);

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <canvas ref={canvas} className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing" aria-hidden />
    </div>
  );
}
