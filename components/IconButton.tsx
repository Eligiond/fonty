"use client";

import React from "react";

type Props = {
  onClick: () => void;
  active?: boolean;
  ariaLabel: string;
  title: string;
  children: React.ReactNode;
};

export default function IconButton({
  onClick,
  active = false,
  ariaLabel,
  title,
  children,
}: Props) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      className={`group relative inline-flex flex-shrink-0 items-center justify-center rounded-full w-8 h-8 transition-[transform,background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.92] ${
        active 
          ? "bg-[var(--bg)] text-[var(--text)] shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_0_1px_var(--border)]" 
          : "bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
      }`}
    >
      <div className="relative z-10 transition-transform duration-200 group-hover:scale-110">
        {children}
      </div>
    </button>
  );
}
