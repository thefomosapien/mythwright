"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableThumbnailProps {
  page: {
    id: string;
    page_number: number;
    image_url: string;
    thumbnail_url: string | null;
    width: number;
    height: number;
  };
  index: number;
  onDelete: () => void;
}

export default function SortableThumbnail({
  page,
  index,
  onDelete,
}: SortableThumbnailProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab overflow-hidden rounded-lg border border-border bg-surface active:cursor-grabbing"
      >
        <img
          src={page.thumbnail_url || page.image_url}
          alt={`Page ${index + 1}`}
          className="aspect-[3/4] w-full object-cover"
          draggable={false}
        />
      </div>
      <div className="mt-1 text-center text-xs text-foreground-muted">
        {index + 1}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute -top-1.5 -right-1.5 hidden h-6 w-6 items-center justify-center rounded-full bg-error text-white text-xs group-hover:flex"
        aria-label={`Delete page ${index + 1}`}
      >
        &times;
      </button>
    </div>
  );
}
