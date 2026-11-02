"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scales a fixed-size card down (never up past `maxScale`) to fit its
 * container width, reserving the scaled height so layout doesn't jump.
 */
export function ScaledCard({
  width,
  height,
  maxScale = 1,
  children,
}: {
  width: number;
  height: number;
  maxScale?: number;
  children: ReactNode;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    const update = () => setScale(Math.min(maxScale, el.clientWidth / width));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, maxScale]);

  return (
    <div ref={outer} className="w-full">
      <div className="mx-auto" style={{ width: width * scale, height: height * scale }}>
        <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
      </div>
    </div>
  );
}
