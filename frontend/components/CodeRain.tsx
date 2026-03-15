"use client";

import { useState, useEffect, useMemo } from "react";

const CHARS = "01{}[]();:.,/|&^%*+=→⇒λ∫∑∂<>~";
const COLS = 24;
const ROWS = 14;

function pickChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

export default function CodeRain() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const columns = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: COLS }, (_, colIndex) => ({
      id: colIndex,
      delay: Math.random() * 12,
      duration: 14 + Math.random() * 8,
      cells: Array.from({ length: ROWS }, (_, rowIndex) => ({
        id: `${colIndex}-${rowIndex}`,
        char: pickChar(),
        delay: rowIndex * 0.4 + Math.random() * 0.5,
      })),
    }));
  }, [mounted]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {columns.map((col) => (
        <div
          key={col.id}
          className="absolute top-0 flex flex-col gap-0.5 font-mono text-[11px] tracking-widest text-blue-400/30"
          style={{
            left: `${(col.id / COLS) * 100}%`,
            animation: `rain-fall ${col.duration}s linear infinite`,
            animationDelay: `-${col.delay}s`,
          }}
        >
          {col.cells.map((cell) => (
            <span key={cell.id} className="whitespace-nowrap">
              {cell.char}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
