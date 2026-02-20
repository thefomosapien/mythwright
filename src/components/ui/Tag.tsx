export interface TagProps {
  label: string;
  variant: "genre" | "status" | "canon";
  removable?: boolean;
  onRemove?: () => void;
}

const variantStyles = {
  genre: "border-gold/40 text-gold",
  status: {
    draft: "border-foreground-subtle/40 text-foreground-subtle",
    published: "border-success/40 text-success",
    archived: "border-foreground-subtle/40 text-foreground-subtle",
  },
  canon: {
    canon: "border-info/40 text-info",
    community: "border-purple-400/40 text-purple-400",
    fan_alt: "border-foreground-subtle/40 text-foreground-subtle",
  },
};

function getStatusStyle(label: string): string {
  const key = label.toLowerCase() as keyof typeof variantStyles.status;
  return variantStyles.status[key] || variantStyles.status.draft;
}

function getCanonStyle(label: string): string {
  const key = label.toLowerCase().replace("-", "_") as keyof typeof variantStyles.canon;
  return variantStyles.canon[key] || variantStyles.canon.fan_alt;
}

export default function Tag({
  label,
  variant,
  removable = false,
  onRemove,
}: TagProps) {
  let colorClasses: string;

  if (variant === "genre") {
    colorClasses = variantStyles.genre;
  } else if (variant === "status") {
    colorClasses = getStatusStyle(label);
  } else {
    colorClasses = getCanonStyle(label);
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClasses}`}
    >
      {label}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 hover:bg-white/10 transition-colors"
          aria-label={`Remove ${label}`}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
