"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface Page {
  id: string;
  pageNumber: number;
  imageUrl: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
}

interface ComicPageViewerProps {
  pages: Page[];
}

export default function ComicPageViewer({ pages }: ComicPageViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<"single" | "scroll">("single");
  const [chromeVisible, setChromeVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);

  const goToPage = useCallback(
    (index: number) => {
      if (index >= 0 && index < pages.length) {
        setCurrentPage(index);
      }
    },
    [pages.length]
  );

  // Auto-hide chrome after 3s of inactivity
  const resetHideTimer = useCallback(() => {
    setChromeVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setChromeVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (viewMode !== "single") return;
    resetHideTimer();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [viewMode, resetHideTimer]);

  useEffect(() => {
    if (viewMode !== "single") return;

    function handleActivity() {
      resetHideTimer();
    }

    function handleKeyDown(e: KeyboardEvent) {
      handleActivity();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goToPage(currentPage - 1);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goToPage(currentPage + 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
    };
  }, [viewMode, currentPage, goToPage, resetHideTimer]);

  // Scroll current thumbnail into view in scrubber
  useEffect(() => {
    if (!scrubberRef.current) return;
    const thumb = scrubberRef.current.children[currentPage] as HTMLElement;
    if (thumb) {
      thumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentPage]);

  if (viewMode === "scroll") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mb-4 flex items-center justify-between px-4 pt-4">
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
        <div className="space-y-2 px-4 pb-4">
          {pages.map((p) => (
            <div
              key={p.id}
              className="mx-auto overflow-hidden rounded-lg"
              style={{ maxWidth: Math.min(p.width, 800) }}
            >
              <img
                src={p.imageUrl}
                alt={`Page ${p.pageNumber}`}
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

  // Preload next 2 pages
  const preloadPages = pages.slice(currentPage + 1, currentPage + 3);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Preload next pages */}
      {preloadPages.map((p) => (
        <link key={p.id} rel="preload" as="image" href={p.imageUrl} />
      ))}

      {/* Top chrome — page indicator + view toggle */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-4 py-3 transition-opacity duration-300 ${
          chromeVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <p className="text-sm text-white/80">
          Page {currentPage + 1} of {pages.length}
        </p>
        <button
          onClick={() => setViewMode("scroll")}
          className="text-sm text-gold transition-colors hover:text-gold-light"
        >
          Scroll View
        </button>
      </div>

      {/* Main page display */}
      <div className="flex flex-1 items-center justify-center">
        <div
          className="relative mx-auto cursor-pointer"
          style={{ maxWidth: Math.min(page.width, 800) }}
        >
          <img
            src={page.imageUrl}
            alt={`Page ${page.pageNumber}`}
            className="w-full"
          />
          {/* Click zones */}
          <div
            className="absolute inset-y-0 left-0 w-1/3"
            onClick={() => goToPage(currentPage - 1)}
          />
          <div
            className="absolute inset-y-0 right-0 w-2/3"
            onClick={() => goToPage(currentPage + 1)}
          />
        </div>
      </div>

      {/* Bottom chrome — navigation buttons + page scrubber */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent pb-4 pt-8 transition-opacity duration-300 ${
          chromeVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* Nav buttons */}
        <div className="mb-3 flex items-center justify-center gap-4 px-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="rounded-md border border-white/20 px-3 py-2 text-sm text-white/80 transition-colors hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Previous
          </button>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === pages.length - 1}
            className="rounded-md border border-white/20 px-3 py-2 text-sm text-white/80 transition-colors hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next
          </button>
        </div>

        {/* Page scrubber — horizontal thumbnail strip */}
        <div
          ref={scrubberRef}
          className="flex gap-2 overflow-x-auto px-4 pb-2"
          style={{ scrollbarWidth: "thin" }}
        >
          {pages.map((p, i) => (
            <button
              key={p.id}
              onClick={() => goToPage(i)}
              className={`shrink-0 overflow-hidden rounded transition-transform hover:scale-110 ${
                i === currentPage
                  ? "ring-2 ring-gold ring-offset-1 ring-offset-black"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={p.thumbnailUrl || p.imageUrl}
                alt={`Page ${p.pageNumber}`}
                className="h-16 w-12 object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>

      <p
        className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-white/40 transition-opacity duration-300 ${chromeVisible ? "opacity-100" : "opacity-0"}`}
      >
        Use arrow keys or click to navigate
      </p>
    </div>
  );
}
