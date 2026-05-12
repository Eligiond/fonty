"use client";

import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (next: string) => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  multiline?: boolean;
};

/**
 * Lightweight contentEditable wrapper. Commits on blur, supports paste-as-plain-text,
 * and stays out of React's way during editing — value sync happens via useEffect when
 * the element is NOT focused, so external updates (like a synonym roll) never clobber
 * what the user is typing.
 */
export default function EditableText({
  value,
  onChange,
  className,
  style,
  ariaLabel,
  multiline = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.textContent !== value) {
      el.textContent = value;
    }
  }, [value]);

  return (
    <div
      ref={ref}
      role="textbox"
      contentEditable
      suppressContentEditableWarning
      aria-label={ariaLabel}
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="off"
      data-gramm="false"
      data-gramm_editor="false"
      data-enable-grammarly="false"
      onBlur={(e) => {
        const next = e.currentTarget.textContent ?? "";
        if (next !== value) onChange(next);
      }}
      onKeyDown={(e) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          (e.currentTarget as HTMLDivElement).blur();
        }
      }}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      }}
      className={`cursor-text rounded-sm outline-none transition-[background-color,box-shadow] duration-150 focus:bg-[color:var(--surface)]/40 focus:shadow-[inset_0_0_0_1px_var(--border)] py-[0.25em] -my-[0.25em] ${className ?? ""}`}
      style={style}
    />
  );
}
