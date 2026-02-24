"use client";

import {
  User,
  Shield,
  MapPin,
  Calendar,
  Package,
  BookOpen,
  Sparkles,
  Layers,
} from "lucide-react";

export interface LoreTypeNavProps {
  universeSlug: string;
  activeType?: string;
  typeCounts: Record<string, number>;
  /** Base path prefix for links. Defaults to /u/{universeSlug}/lore */
  basePath?: string;
  /** Callback when type changes (client-side filtering). If set, no navigation occurs. */
  onTypeChange?: (type: string | undefined) => void;
}

const TYPES = [
  { key: "character", label: "Characters", Icon: User },
  { key: "faction", label: "Factions", Icon: Shield },
  { key: "location", label: "Locations", Icon: MapPin },
  { key: "event", label: "Events", Icon: Calendar },
  { key: "item", label: "Items", Icon: Package },
  { key: "lore", label: "Lore", Icon: BookOpen },
  { key: "custom", label: "Custom", Icon: Sparkles },
] as const;

export default function LoreTypeNav({
  universeSlug,
  activeType,
  typeCounts,
  basePath,
  onTypeChange,
}: LoreTypeNavProps) {
  const base = basePath || `/u/${universeSlug}/lore`;
  const totalCount = Object.values(typeCounts).reduce((a, b) => a + b, 0);

  function handleClick(type: string | undefined) {
    if (onTypeChange) {
      onTypeChange(type);
    }
  }

  const items = [
    { key: undefined, label: "All", Icon: Layers, count: totalCount },
    ...TYPES.map((t) => ({ ...t, key: t.key as string | undefined, count: typeCounts[t.key] || 0 })),
  ];

  return (
    <nav className="mb-6 flex flex-wrap gap-2" aria-label="Lore type filter">
      {items.map((item) => {
        const isActive = activeType === item.key;
        const isEmpty = item.count === 0 && item.key !== undefined;
        const Icon = item.Icon;

        if (onTypeChange) {
          return (
            <button
              key={item.key ?? "all"}
              type="button"
              onClick={() => handleClick(item.key)}
              disabled={isEmpty}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? "border-gold bg-gold/20 text-gold"
                  : isEmpty
                    ? "border-border text-foreground-subtle opacity-40 cursor-not-allowed"
                    : "border-border text-foreground-muted hover:border-border-hover hover:text-foreground"
              }`}
            >
              <Icon size={14} />
              {item.label}
              <span className="text-xs opacity-70">{item.count}</span>
            </button>
          );
        }

        const href = item.key ? `${base}?type=${item.key}` : base;
        return (
          <a
            key={item.key ?? "all"}
            href={href}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              isActive
                ? "border-gold bg-gold/20 text-gold"
                : isEmpty
                  ? "border-border text-foreground-subtle opacity-40 pointer-events-none"
                  : "border-border text-foreground-muted hover:border-border-hover hover:text-foreground"
            }`}
          >
            <Icon size={14} />
            {item.label}
            <span className="text-xs opacity-70">{item.count}</span>
          </a>
        );
      })}
    </nav>
  );
}
