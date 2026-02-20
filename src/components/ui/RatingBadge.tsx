export interface RatingBadgeProps {
  rating: "E" | "T" | "M";
}

const ratingStyles = {
  E: "bg-rating-e/15 text-rating-e border-rating-e/30",
  T: "bg-rating-t/15 text-rating-t border-rating-t/30",
  M: "bg-rating-m/15 text-rating-m border-rating-m/30",
};

const ratingLabels = {
  E: "E",
  T: "T",
  M: "M",
};

export default function RatingBadge({ rating }: RatingBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-bold ${ratingStyles[rating]}`}
    >
      {ratingLabels[rating]}
    </span>
  );
}
