"use client";

export interface ButtonProps {
  variant: "primary" | "secondary" | "ghost";
  size: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const variantClasses = {
  primary:
    "bg-forge-500 text-void-950 font-medium hover:bg-forge-300 active:bg-forge-600",
  secondary:
    "border border-forge-500 text-forge-500 font-medium hover:bg-forge-500/10 active:bg-forge-500/20",
  ghost:
    "text-foreground-muted hover:text-foreground hover:bg-surface-hover",
};

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function Button({
  variant,
  size,
  isLoading = false,
  disabled = false,
  children,
  onClick,
  type = "button",
  className = "",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
}
