"use client";

import { useEffect, useState } from "react";

type Props = {
  onStartReorder: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  label: string;
};

export default function DragHandleButton({ onStartReorder, icon, label }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;
    const onUp = () => setIsDragging(false);
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    onStartReorder(e);
  };

  return (
    <button
      type="button"
      onMouseDown={handleMouseDown}
      aria-label={label}
      title={label}
      className={`group/drag relative inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-[transform,background-color,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] text-[var(--text)] ${
        isDragging
          ? "cursor-grabbing scale-[0.92] bg-[color-mix(in_oklch,var(--text)_12%,transparent)]"
          : "cursor-grab active:cursor-grabbing active:scale-[0.92] bg-transparent hover:bg-[color-mix(in_oklch,var(--text)_12%,transparent)]"
      }`}
    >
      <span className="relative z-10 transition-transform duration-200 group-hover/drag:scale-110">
        {icon}
      </span>
    </button>
  );
}
