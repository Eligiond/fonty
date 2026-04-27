"use client";

import { useState } from "react";
import {
  SquareLock02Icon,
  SquareUnlock02Icon,
  Copy01Icon,
  Tick02Icon,
} from "@hugeicons/react";
import { cssFamily, type FontPairing, type FontRole } from "@/lib/fonts";
import EditableText from "@/components/EditableText";
import IconButton from "@/components/IconButton";
import type { Adjustments } from "@/components/SidePanel";
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
      <div className="grid h-full grid-rows-3 pt-8">
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
      className="flex items-center gap-4 px-6 md:px-10 transition-colors duration-500"
      style={{ 
        background: locked 
          ? `color-mix(in oklch, var(--accent) 4%, ${STRIPE_VAR[role]})` 
          : STRIPE_VAR[role], 
        color: "var(--text)" 
      }}
    >
      <div className="min-w-0 flex-1">
        <EditableText
          value={text}
          onChange={onTextChange}
          ariaLabel={`Edit ${meta.label.toLowerCase()} sample`}
          className="overflow-hidden break-words"
          style={buildStyle(family, role, adj, VERTICAL_WEIGHT[role])}
        />
      </div>

      <aside className="flex flex-shrink-0 items-center gap-3 text-right">
        <div className="w-[140px]">
          <div
            className="text-[11px] uppercase tracking-[0.16em] opacity-80 truncate"
            style={{ color: "var(--text)" }}
          >
            {meta.tag} · {meta.label}
          </div>
          <div
            className="mt-0.5 truncate text-[14px] font-medium"
            style={{ fontFamily: cssFamily(family), color: "var(--text)" }}
          >
            {family}
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <CopyButton family={family} role={role} label={`${meta.tag} · ${meta.label}`} locked={locked} />
          <LockButton locked={locked} onToggle={onToggleLock} />
        </div>
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
      className="relative flex h-full flex-col justify-between border-r px-6 pb-12 pt-32 last:border-r-0 md:px-12 md:pb-16 md:pt-32 transition-colors duration-500"
      style={{
        background: locked 
          ? `color-mix(in oklch, var(--accent) 4%, ${STRIPE_VAR[role]})` 
          : STRIPE_VAR[role],
        color: "var(--text)",
        borderColor: "var(--border)",
      }}
    >
      <header className="flex items-start justify-between gap-3">
        <div
          className="text-[11px] uppercase tracking-[0.16em] opacity-80"
          style={{ color: "var(--text)" }}
        >
          {meta.tag} · {meta.label}
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <CopyButton family={family} role={role} label={`${meta.tag} · ${meta.label}`} locked={locked} />
          <LockButton locked={locked} onToggle={onToggleLock} />
        </div>
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
  return (
    <IconButton
      onClick={onToggle}
      active={locked}
      ariaLabel={locked ? "Unlock font" : "Lock font"}
      title={locked ? "Unlock font" : "Lock font"}
    >
      {locked ? <SquareLock02Icon size={18} /> : <SquareUnlock02Icon size={18} />}
    </IconButton>
  );
}

function CopyButton({
  family,
  role,
  label,
  locked,
}: {
  family: string;
  role: FontRole;
  label: string;
  locked: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const config = `// font: ${label}\nfamily: '${family}',\nrole: '${role}',\nlocked: ${locked}`;
      await navigator.clipboard.writeText(config);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <IconButton
      onClick={handleCopy}
      active={copied}
      ariaLabel="Copy font config"
      title="Copy font config"
    >
      {copied ? <Tick02Icon size={18} /> : <Copy01Icon size={18} />}
    </IconButton>
  );
}
