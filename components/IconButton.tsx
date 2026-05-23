"use client";

import React from "react";

type Props = {
  onClick: () => void;
  active?: boolean;
  ariaLabel: string;
  title: string;
  iconHover?: "scale" | "rotate";
  children: React.ReactNode;
};

export default function IconButton({
  onClick,
  active = false,
  ariaLabel,
  title,
  iconHover = "scale",
  children,
}: Props) {
  const iconTransform =
    iconHover === "rotate"
      ? "group-hover/icon:-rotate-6"
      : "group-hover/icon:scale-110";

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      className={`group/icon relative inline-flex flex-shrink-0 items-center justify-center rounded-full w-8 h-8 transition-[transform,background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.92] ${
        active
          ? "bg-[var(--bg)] text-[var(--text)] shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_0_1px_var(--border)]"
          : "bg-transparent text-[var(--text)] hover:bg-[color-mix(in_oklch,var(--text)_12%,transparent)]"
      }`}
    >
      <div className={`relative z-10 transition-transform duration-200 ${iconTransform}`}>
        {children}
      </div>
    </button>
  );
}
