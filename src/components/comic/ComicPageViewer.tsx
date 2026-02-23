"use client";

import { useState, useCallback, useEffect } from "react";

interface Page {
  id: string;
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
}

interface ComicPageViewerProps {
  pages: Page[];
}

export default function ComicPageViewer({ pages }: ComicPageViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<"single" | "scroll">("single");

  const goToPage = useCallback(
    (index: number) => {
      if (index >= 0 && index < pages.length) {
        setCurrentPage(index);
      }
    },
    [pages.length]
  );

  useEffect(() => {
    if (viewMode !== "single") return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goToPage(currentPage - 1);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goToPage(currentPage + 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, currentPage, goToPage]);

  if (viewMode === "scroll") {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-foreground-subtle">
            {pages.length} {pages.length === 1 ? "page" : "pages"}
          </p>
          <button
            onClick={() => setViewMode("single")}
            className="text-sm text-gold transition-colors hover:text-gold-light"
          >
            Single Page View
          </button>
        </div>
        <div className="space-y-2">
          {pages.map((page) => (
            <div
              key={page.id}
              className="mx-auto overflow-hidden rounded-lg border border-border"
              style={{ maxWidth: Math.min(page.width, 800) }}
            >
              <img
                src={page.imageUrl}
                alt={`Page ${page.pageNumber}`}
                className="w-full"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const page = pages[currentPage];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-foreground-subtle">
          Page {currentPage + 1} of {pages.length}
        </p>
        <button
          onClick={() => setViewMode("scroll")}
          className="text-sm text-gold transition-colors hover:text-gold-light"
        >
          Scroll View
        </button>
      </div>

      {/* Page display */}
      <div
        className="relative mx-auto cursor-pointer overflow-hidden rounded-lg border border-border"
        style={{ maxWidth: Math.min(page.width, 800) }}
        onClick={() => goToPage(currentPage + 1)}
      >
        <img
          src={page.imageUrl}
          alt={`Page ${page.pageNumber}`}
          className="w-full"
        />
        {/* Click zones */}
        <div
          className="absolute inset-y-0 left-0 w-1/3"
          onClick={(e) => {
            e.stopPropagation();
            goToPage(currentPage - 1);
          }}
        />
      </div>

      {/* Page navigation */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0}
          className="rounded-md border border-border px-3 py-2 text-sm text-foreground-muted transition-colors hover:border-border-hover hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <div className="flex items-center gap-1">
          {pages.length <= 20 ? (
            pages.map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === currentPage ? "bg-gold" : "bg-border hover:bg-border-hover"
                }`}
                aria-label={`Go to page ${i + 1}`}
              />
            ))
          ) : (
            <select
              value={currentPage}
              onChange={(e) => goToPage(Number(e.target.value))}
              className="rounded border border-border bg-background-secondary px-2 py-1 text-sm text-foreground"
            >
              {pages.map((_, i) => (
                <option key={i} value={i}>
                  Page {i + 1}
                </option>
              ))}
            </select>
          )}
        </div>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === pages.length - 1}
          className="rounded-md border border-border px-3 py-2 text-sm text-foreground-muted transition-colors hover:border-border-hover hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      <p className="mt-2 text-center text-xs text-foreground-subtle">
        Use arrow keys or click to navigate
      </p>
    </div>
  );
}
