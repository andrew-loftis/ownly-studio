"use client";

import React, { useEffect, useRef } from "react";

type DotFieldProps = {
  density?: number; // pixels between dots
  radius?: number; // influence radius in px
  baseAlpha?: number; // base dot alpha
  peakAlpha?: number; // brightest alpha at cursor/tilt hotspot
  color?: string; // CSS color for dots
  className?: string;
  fixed?: boolean; // position canvas fixed to viewport
};

// Lightweight canvas dot grid with hotspot brightness reacting to mouse, touch, or device tilt.
export default function DotField({
  density = 28,
  radius = 250,
  baseAlpha = 0.035,
  peakAlpha = 0.65,
  color = "#f2fffb", // soft mint-tinted white
  className = "",
  fixed = false,
}: DotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0, y: 0, has: false });
  const smoothRef = useRef({ sx: 0, sy: 0, intensity: 0 });
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize handling
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

  const bounds = () => ({ w: canvas.clientWidth, h: canvas.clientHeight });

    // Render loop
    const render = () => {
  const { w, h } = bounds();
      ctx.clearRect(0, 0, w, h);

  const px = pointerRef.current;
  const sm = smoothRef.current;

  // Smoothly follow pointer and ease intensity in/out
  const targetX = px.x;
  const targetY = px.y;
  const targetI = px.has ? 1 : 0;
  const follow = 0.1; // position easing factor (smoother)
  const fade = 0.08;  // intensity easing factor (gentle)
  sm.sx += (targetX - sm.sx) * follow;
  sm.sy += (targetY - sm.sy) * follow;
  sm.intensity += (targetI - sm.intensity) * fade;

      // Pre-compute radius squared for falloff
      const r2 = radius * radius;

      ctx.fillStyle = color;
      // Start positions snapped to integer pixels for cleaner lines while scrolling
      const startY = Math.round(density / 2);
      const startX = Math.round(density / 2);
      for (let y = startY; y < h; y += density) {
        for (let x = startX; x < w; x += density) {
          let a = baseAlpha; // clean straight lines; no shimmer
          if (sm.intensity > 0.001) {
            const dx = x - sm.sx;
            const dy = y - sm.sy;
            const d = Math.hypot(dx, dy);
            if (d < radius) {
              // Radial ramp that increases toward center
              // factor: 0 at edge, 1 at center
              const factor = 1 - d / radius;
              // Shape the ramp to make center noticeably brighter
              const shaped = Math.pow(Math.max(0, factor), 2.6); // brighter, tighter core
              // Smoothstep easing for intensity to feel more natural
              const i = Math.max(0, Math.min(1, sm.intensity));
              const easedIntensity = i * i * (3 - 2 * i);
              const eased = shaped * easedIntensity;
              a = Math.max(a, baseAlpha + eased * (peakAlpha - baseAlpha));
            }
          }
          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.arc(Math.round(x), Math.round(y), 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(render);
    };

    const start = () => {
      if (animRef.current == null) animRef.current = requestAnimationFrame(render);
    };
    const stop = () => {
      if (animRef.current != null) cancelAnimationFrame(animRef.current);
      animRef.current = null;
    };

    // Respect reduced motion
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mql.matches) start();

    const onMouse = (e: MouseEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY, has: true };
    };
    const onLeave = () => { pointerRef.current.has = false; };
    const onTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      pointerRef.current = { x: touch.clientX, y: touch.clientY, has: true };
    };

  window.addEventListener("mousemove", onMouse, { passive: true });
  window.addEventListener("mouseout", onLeave, { passive: true });
  window.addEventListener("touchstart", onTouch, { passive: true });
  window.addEventListener("touchmove", onTouch, { passive: true });

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse as any);
      window.removeEventListener("mouseout", onLeave as any);
      window.removeEventListener("touchstart", onTouch as any);
      window.removeEventListener("touchmove", onTouch as any);
    };
  }, [baseAlpha, density, peakAlpha, radius, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`${fixed ? "fixed" : "absolute"} inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
