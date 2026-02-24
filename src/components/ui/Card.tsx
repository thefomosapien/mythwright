export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
}

export default function Card({
  children,
  className = "",
  onClick,
  glow = false,
}: CardProps) {
  const interactive = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-border bg-void-800 ${
        interactive ? "cursor-pointer" : ""
      } ${
        glow
          ? "transition-shadow hover:shadow-glow-md"
          : ""
      } ${interactive && !glow ? "transition-colors hover:bg-surface-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
