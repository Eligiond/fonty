"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { cssFamily, type FontPairing, type FontRole } from "@/lib/fonts";
import EditableText from "@/components/EditableText";
import type { Adjustments } from "@/components/ControlsPanel";
import type { ViewMode } from "@/components/TopBar";

const ROLE_ORDER: FontRole[] = ["heading", "subheading", "body"];

const STRIPE_VAR: Record<FontRole, string> = {
  heading: "var(--stripe-1)",
  subheading: "var(--stripe-2)",
  body: "var(--stripe-3)",
};

const ROLE_TAG: Record<FontRole, { tag: string; label: string }> = {
  heading: { tag: "H1", label: "Heading" },
  subheading: { tag: "H3", label: "Subheading" },
  body: { tag: "P", label: "Body" },
};

const BASE_LINE_HEIGHT: Record<FontRole, number> = {
  heading: 1.05,
  subheading: 1.35,
  body: 1.55,
};

export type Texts = Record<FontRole, string>;

type Props = {
  pairing: FontPairing;
  locks: Record<FontRole, boolean>;
  onToggleLock: (role: FontRole) => void;
  texts: Texts;
  onTextChange: (role: FontRole, value: string) => void;
  adjustments: Adjustments;
  viewMode: ViewMode;
};

export default function GenerateView({
  pairing,
  locks,
  onToggleLock,
  texts,
  onTextChange,
  adjustments,
  viewMode,
}: Props) {
  if (viewMode === "vertical") {
    return (
      <div className="grid h-full grid-rows-3">
        {ROLE_ORDER.map((role) => (
          <Stripe
            key={role}
            role={role}
            family={pairing[role]}
            locked={locks[role]}
            text={texts[role]}
            adj={adjustments[role]}
            onTextChange={(v) => onTextChange(role, v)}
            onToggleLock={() => onToggleLock(role)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-3">
      {ROLE_ORDER.map((role) => (
        <Column
          key={role}
          role={role}
          family={pairing[role]}
          locked={locks[role]}
          text={texts[role]}
          adj={adjustments[role]}
          onTextChange={(v) => onTextChange(role, v)}
          onToggleLock={() => onToggleLock(role)}
        />
      ))}
    </div>
  );
}

function buildStyle(
  family: string,
  role: FontRole,
  adj: { fontSize: number; lineHeight: number; letterSpacing: number },
  fontWeight: string,
): React.CSSProperties {
  return {
    fontFamily: cssFamily(family),
    fontSize: `${adj.fontSize}px`,
    lineHeight: BASE_LINE_HEIGHT[role] * adj.lineHeight,
    letterSpacing: `${adj.letterSpacing}em`,
    fontWeight,
  };
}

const VERTICAL_WEIGHT: Record<FontRole, string> = {
  heading: "600",
  subheading: "500",
  body: "400",
};

function Stripe({
  role,
  family,
  locked,
  text,
  adj,
  onTextChange,
  onToggleLock,
}: {
  role: FontRole;
  family: string;
  locked: boolean;
  text: string;
  adj: { fontSize: number; lineHeight: number; letterSpacing: number };
  onTextChange: (v: string) => void;
  onToggleLock: () => void;
}) {
  const meta = ROLE_TAG[role];
  return (
    <section
      className="flex items-center gap-4 px-6 md:px-10"
      style={{ background: STRIPE_VAR[role], color: "var(--text)" }}
    >
      {/* LEFT: sample text */}
      <div className="min-w-0 flex-1">
        <EditableText
          value={text}
          onChange={onTextChange}
          ariaLabel={`Edit ${meta.label.toLowerCase()} sample`}
          className="overflow-hidden break-words"
          style={buildStyle(family, role, adj, VERTICAL_WEIGHT[role])}
        />
      </div>

      {/* RIGHT: metadata + lock */}
      <aside className="flex w-40 flex-shrink-0 items-center justify-end gap-2.5 text-right">
        <div className="min-w-0">
          <div
            className="text-[10px] uppercase tracking-[0.16em]"
            style={{ color: "var(--text-muted)" }}
          >
            {meta.tag} · {meta.label}
          </div>
          <div
            className="mt-0.5 truncate text-[13px] font-medium"
            style={{ fontFamily: cssFamily(family), color: "var(--text)" }}
          >
            {family}
          </div>
        </div>
        <LockButton locked={locked} onToggle={onToggleLock} />
      </aside>
    </section>
  );
}

function Column({
  role,
  family,
  locked,
  text,
  adj,
  onTextChange,
  onToggleLock,
}: {
  role: FontRole;
  family: string;
  locked: boolean;
  text: string;
  adj: { fontSize: number; lineHeight: number; letterSpacing: number };
  onTextChange: (v: string) => void;
  onToggleLock: () => void;
}) {
  const meta = ROLE_TAG[role];
  return (
    <section
      className="relative flex h-full flex-col justify-between border-r px-6 py-8 last:border-r-0 md:px-8 md:py-10"
      style={{
        background: STRIPE_VAR[role],
        color: "var(--text)",
        borderColor: "var(--border)",
      }}
    >
      <header className="flex items-start justify-between">
        <div
          className="text-[10px] uppercase tracking-[0.16em]"
          style={{ color: "var(--text-muted)" }}
        >
          {meta.tag} · {meta.label}
        </div>
        <LockButton locked={locked} onToggle={onToggleLock} />
      </header>

      <div className="flex flex-1 items-center py-6">
        <EditableText
          value={text}
          onChange={onTextChange}
          ariaLabel={`Edit ${meta.label.toLowerCase()} sample`}
          multiline
          className="min-w-0 overflow-wrap-anywhere break-words"
          style={buildStyle(family, role, adj, VERTICAL_WEIGHT[role])}
        />
      </div>

      <footer
        className="truncate text-[13px] font-medium"
        style={{ fontFamily: cssFamily(family), color: "var(--text)" }}
      >
        {family}
      </footer>
    </section>
  );
}

function LockButton({
  locked,
  onToggle,
}: {
  locked: boolean;
  onToggle: () => void;
}) {
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    setAnimating(true);
    onToggle();
  };

  return (
    <button
      onClick={handleClick}
      onAnimationEnd={() => setAnimating(false)}
      aria-label={locked ? "Unlock font" : "Lock font"}
      className={`flex-shrink-0 rounded-full border p-1.5 transition-[background-color,color,border-color] duration-150 ${animating ? "fonty-lock-pop" : ""}`}
      style={
        locked
          ? {
              background: "var(--accent)",
              color: "var(--accent-text)",
              borderColor: "var(--accent)",
            }
          : {
              background: "var(--bg)",
              color: "var(--text-muted)",
              borderColor: "var(--border)",
            }
      }
    >
      {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
    </button>
  );
}
