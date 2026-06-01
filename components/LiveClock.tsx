'use client';

import { useState, useEffect } from 'react';

export default function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  // Only start after mount to avoid hydration mismatch
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const hh   = now.getHours().toString().padStart(2, '0');
  const mm   = now.getMinutes().toString().padStart(2, '0');
  const ss   = now.getSeconds().toString().padStart(2, '0');
  const date = now.toLocaleDateString('en-GB', {
    weekday: 'short',
    day:     '2-digit',
    month:   'short',
    year:    'numeric',
  });

  return (
    <div className="flex flex-col items-center leading-tight select-none">
      <span className="text-[15px] font-black text-neutral-900 tabular-nums tracking-tight">
        {hh}<span className="animate-pulse opacity-70">:</span>{mm}<span className="animate-pulse opacity-70">:</span>{ss}
      </span>
      <span className="text-[10px] font-medium text-neutral-400 tracking-wide">{date}</span>
    </div>
  );
}
