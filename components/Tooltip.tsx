"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function Kbd({ shortcut, size = "sm" }: { shortcut: string; size?: "sm" | "md" }) {
  const sizing =
    size === "md"
      ? "px-2 py-0.5 text-[11px] gap-0.5"
      : "px-1.5 py-0.5 text-[9px] gap-[1px]";
  const cmdSize = size === "md" ? "text-[12px]" : "text-[10px]";
  return (
    <span
      className={`inline-flex select-none items-center rounded border font-mono font-medium leading-none ${sizing}`}
      style={{
        borderColor: "var(--border)",
        background: "var(--bg)",
        color: "var(--text-muted)",
      }}
    >
      <span className={cmdSize}>⌘</span>
      <span>{shortcut}</span>
    </span>
  );
}

export function Tooltip({
  shortcut,
  label,
  children,
  delay = 0,
  direction = "right",
  className = "inline-flex",
}: {
  shortcut?: string;
  label?: string;
  children: ReactNode;
  delay?: number;
  direction?: "left" | "right" | "top" | "bottom";
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
    };
  }, []);

  const place = () => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    
    if (direction === "right") {
        setCoords({
            top: rect.top + rect.height / 2,
            left: rect.right + 6,
        });
    } else if (direction === "left") {
        setCoords({
            top: rect.top + rect.height / 2,
            left: rect.left - 6,
        });
    } else if (direction === "top") {
        setCoords({
            top: rect.top - 6,
            left: rect.left + rect.width / 2,
        });
    } else if (direction === "bottom") {
        setCoords({
            top: rect.bottom + 6,
            left: rect.left + rect.width / 2,
        });
    }
  };

  const handleEnter = () => {
    place();
    if (showTimer.current) clearTimeout(showTimer.current);
    showTimer.current = setTimeout(() => setVisible(true), delay);
  };

  const handleLeave = () => {
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    setVisible(false);
  };

  const transformStyle = () => {
      if (!visible) {
          if (direction === "right") return "translate(-4px, -50%)";
          if (direction === "left") return "translate(4px, -50%)";
          if (direction === "top") return "translate(-50%, 4px)";
          if (direction === "bottom") return "translate(-50%, -4px)";
      }
      if (direction === "left" || direction === "right") return "translate(0, -50%)";
      return "translate(-50%, 0)";
  };

  const positionStyle = () => {
      if (direction === "right") return { top: coords.top, left: coords.left };
      if (direction === "left") return { top: coords.top, left: coords.left, transform: "translate(-100%, -50%)" };
      if (direction === "top") return { top: coords.top, left: coords.left, transform: "translate(-50%, -100%)" };
      return { top: coords.top, left: coords.left };
  };

  return (
    <>
      <span
        ref={wrapperRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        className={className}
      >
        {children}
      </span>
      {mounted &&
        createPortal(
          <div
            role="tooltip"
            aria-hidden={!visible}
            className="pointer-events-none fixed z-[100] transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{
              ...positionStyle(),
              opacity: visible ? 1 : 0,
              transform: visible ? (positionStyle().transform || transformStyle()) : transformStyle(),
            }}
          >
            {label ? (
              <div
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 shadow-md"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <span
                  className="whitespace-nowrap text-[11px] font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  {label}
                </span>
                {shortcut && (
                  <span
                    className="font-mono text-[11px] font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ⌘{shortcut}
                  </span>
                )}
              </div>
            ) : shortcut ? (
              <Kbd shortcut={shortcut} size="md" />
            ) : null}
          </div>,
          document.body,
        )}
    </>
  );
}
