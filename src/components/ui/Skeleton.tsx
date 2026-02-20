export interface SkeletonProps {
  variant: "text" | "card" | "image";
  count?: number;
}

const variantClasses = {
  text: "h-4 w-full rounded",
  card: "h-64 w-full rounded-lg",
  image: "aspect-[3/4] w-full rounded-lg",
};

export default function Skeleton({ variant, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-surface-hover ${variantClasses[variant]}`}
        />
      ))}
    </>
  );
}
