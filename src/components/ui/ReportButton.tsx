"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "./Modal";
import Button from "./Button";

export interface ReportButtonProps {
  targetType: "universe" | "comic" | "comic_page" | "lore_entry" | "profile";
  targetId: string;
  onReport?: () => void;
}

const CATEGORIES = [
  { value: "misrated", label: "Misrated content" },
  { value: "stolen_content", label: "Stolen content" },
  { value: "prohibited", label: "Prohibited content" },
  { value: "harassment", label: "Harassment" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
];

export default function ReportButton({
  targetType,
  targetId,
  onReport,
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  async function handleSubmit() {
    if (!category) {
      setError("Please select a category.");
      return;
    }

    setError(null);
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to submit a report.");
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("reports").insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      category,
      description: description || null,
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSubmitted(true);
    onReport?.();

    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setCategory("");
      setDescription("");
    }, 2000);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded p-1.5 text-foreground-subtle hover:text-foreground-muted hover:bg-surface-hover transition-colors"
        aria-label="Report content"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5"
          />
        </svg>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          if (!submitting) {
            setIsOpen(false);
            setError(null);
          }
        }}
        title="Report Content"
      >
        {submitted ? (
          <div className="py-4 text-center">
            <p className="text-success font-medium">Report submitted. Thank you.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-foreground-muted">
                Category
              </legend>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat.value}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-surface-hover transition-colors"
                  >
                    <input
                      type="radio"
                      name="report-category"
                      value={cat.value}
                      checked={category === cat.value}
                      onChange={(e) => setCategory(e.target.value)}
                      className="accent-gold"
                    />
                    <span className="text-sm text-foreground">{cat.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label
                htmlFor="report-description"
                className="mb-1 block text-sm font-medium text-foreground-muted"
              >
                Description (optional)
              </label>
              <textarea
                id="report-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={3}
                className="w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-foreground placeholder-foreground-subtle focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                placeholder="Provide additional details..."
              />
              <p className="mt-1 text-right text-xs text-foreground-subtle">
                {description.length} / 2000
              </p>
            </div>

            {error && (
              <p className="text-sm text-error">{error}</p>
            )}

            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setIsOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                isLoading={submitting}
              >
                Submit Report
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
