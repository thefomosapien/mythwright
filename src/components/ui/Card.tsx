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
      className={`rounded-lg border border-border bg-surface ${
        interactive ? "cursor-pointer" : ""
      } ${
        glow
          ? "transition-shadow hover:shadow-[0_0_20px_rgba(212,168,67,0.15)]"
          : ""
      } ${interactive && !glow ? "transition-colors hover:bg-surface-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
