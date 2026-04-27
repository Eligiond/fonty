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
      className="group relative inline-flex flex-shrink-0 items-center justify-center rounded-full w-8 h-8 transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.92]"
      style={{
        background: active ? "var(--bg)" : "transparent",
        color: active ? "var(--text)" : "var(--text-muted)",
        boxShadow: active
          ? "0 1px 2px rgba(0,0,0,0.1), 0 0 0 1px var(--border)"
          : "none",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "var(--surface-muted)";
          e.currentTarget.style.color = "var(--text)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text-muted)";
        }
      }}
    >
      <div className="relative z-10 transition-transform duration-200 group-hover:scale-110">
        {children}
      </div>
    </button>
  );
}
