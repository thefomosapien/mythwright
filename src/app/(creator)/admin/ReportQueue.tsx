"use client";

import { useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import type { ReportStatus } from "@/lib/types/database";

interface Report {
  id: string;
  target_type: string;
  target_id: string;
  category: string;
  description: string | null;
  status: ReportStatus;
  resolution_note: string | null;
  created_at: string;
  reporter: {
    username: string;
    display_name: string;
  } | null;
}

interface ReportQueueProps {
  initialReports: Report[];
  adminId: string;
}

const STATUS_COLORS: Record<ReportStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  reviewing: "bg-mist-500/15 text-mist-400 border-mist-500/30",
  resolved: "bg-verdant-500/15 text-verdant-400 border-verdant-500/30",
  dismissed: "bg-void-500/15 text-void-300 border-void-500/30",
};

const CATEGORY_LABELS: Record<string, string> = {
  misrated: "Misrated Content",
  stolen_content: "Stolen Content",
  prohibited: "Prohibited Content",
  harassment: "Harassment",
  spam: "Spam",
  other: "Other",
};

export default function ReportQueue({ initialReports, adminId }: ReportQueueProps) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const updateStatus = useCallback(
    async (reportId: string, newStatus: ReportStatus) => {
      const note = resolutionNotes[reportId]?.trim();

      if ((newStatus === "resolved" || newStatus === "dismissed") && !note) {
        return;
      }

      setUpdating(reportId);

      const updateData: Record<string, unknown> = {
        status: newStatus,
        resolved_by: adminId,
        resolved_at: new Date().toISOString(),
      };

      if (note) {
        updateData.resolution_note = note;
      }

      const { error } = await supabase
        .from("reports")
        .update(updateData)
        .eq("id", reportId);

      if (!error) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId
              ? { ...r, status: newStatus, resolution_note: note || r.resolution_note }
              : r
          )
        );

        // Log content event
        await supabase.from("content_events").insert({
          actor_id: adminId,
          event_type: newStatus === "resolved" ? "approved" : "rejected",
          target_type: "profile",
          target_id: reportId,
          metadata: { action: `report_${newStatus}`, note },
        });
      }

      setUpdating(null);
    },
    [supabase, adminId, resolutionNotes]
  );

  return (
    <div className="space-y-3">
      {reports.length === 0 ? (
        <div className="rounded-lg border border-void-700 bg-void-800 px-8 py-12 text-center">
          <p className="font-prose text-void-200">
            No reports to review. The community is in good shape.
          </p>
        </div>
      ) : (
        reports.map((report) => {
          const isExpanded = expandedId === report.id;
          return (
            <div
              key={report.id}
              className="rounded-lg border border-void-700 bg-void-800"
            >
              {/* Report header */}
              <button
                onClick={() =>
                  setExpandedId(isExpanded ? null : report.id)
                }
                className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-void-700/50 transition-colors"
              >
                <span
                  className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium ${STATUS_COLORS[report.status]}`}
                >
                  {report.status}
                </span>
                <span className="text-sm font-medium text-void-100 capitalize">
                  {report.target_type.replace("_", " ")}
                </span>
                <span className="text-sm text-void-300">
                  {CATEGORY_LABELS[report.category] || report.category}
                </span>
                <span className="ml-auto text-xs text-void-400">
                  by @{report.reporter?.username || "unknown"}
                </span>
                <span className="text-xs text-void-400">
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
                <svg
                  className={`h-4 w-4 text-void-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-void-700 px-4 py-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase text-void-400">
                        Target
                      </p>
                      <p className="mt-1 text-sm text-void-200">
                        {report.target_type} / {report.target_id.slice(0, 8)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-void-400">
                        Reporter
                      </p>
                      <p className="mt-1 text-sm text-void-200">
                        {report.reporter?.display_name || "Unknown"} (@
                        {report.reporter?.username || "?"})
                      </p>
                    </div>
                  </div>

                  {report.description && (
                    <div>
                      <p className="text-xs font-medium uppercase text-void-400">
                        Description
                      </p>
                      <p className="mt-1 text-sm text-void-200 whitespace-pre-wrap">
                        {report.description}
                      </p>
                    </div>
                  )}

                  {report.resolution_note && (
                    <div>
                      <p className="text-xs font-medium uppercase text-void-400">
                        Resolution Note
                      </p>
                      <p className="mt-1 text-sm text-void-200">
                        {report.resolution_note}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {(report.status === "pending" || report.status === "reviewing") && (
                    <div className="space-y-3 border-t border-void-700 pt-3">
                      <div>
                        <label
                          htmlFor={`note-${report.id}`}
                          className="mb-1 block text-xs font-medium text-void-400"
                        >
                          Resolution note
                          {report.status === "reviewing" && " (required to resolve/dismiss)"}
                        </label>
                        <textarea
                          id={`note-${report.id}`}
                          value={resolutionNotes[report.id] || ""}
                          onChange={(e) =>
                            setResolutionNotes((prev) => ({
                              ...prev,
                              [report.id]: e.target.value,
                            }))
                          }
                          rows={2}
                          className="w-full rounded-md border border-void-700 bg-void-900 px-3 py-2 text-sm text-void-100 placeholder-void-500 focus:border-forge-500 focus:outline-none focus:ring-1 focus:ring-forge-500"
                          placeholder="Describe the resolution..."
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {report.status === "pending" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => updateStatus(report.id, "reviewing")}
                            isLoading={updating === report.id}
                          >
                            Mark Reviewing
                          </Button>
                        )}
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => updateStatus(report.id, "resolved")}
                          isLoading={updating === report.id}
                          disabled={!resolutionNotes[report.id]?.trim()}
                        >
                          Resolve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(report.id, "dismissed")}
                          isLoading={updating === report.id}
                          disabled={!resolutionNotes[report.id]?.trim()}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
