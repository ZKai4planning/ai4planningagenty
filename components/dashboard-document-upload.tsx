"use client"

import type { ChangeEvent } from "react"

type DashboardDocumentUploadProps = {
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void
  uploadError: string
  invalidFiles: string[]
  variant?: "panel" | "inline"
  buttonLabel?: string
  disabled?: boolean
}

export function DashboardDocumentUpload({
  onUpload,
  uploadError,
  invalidFiles,
  variant = "panel",
  buttonLabel = "Upload Files",
  disabled = false,
}: DashboardDocumentUploadProps) {
  const showPanel = variant === "panel"

  return (
    <div
      className={
        showPanel
          ? "rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4"
          : "space-y-2"
      }
    >
      <div
        className={
          showPanel
            ? "flex items-center justify-between gap-4"
            : "flex items-center gap-2"
        }
      >
        {showPanel && (
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Upload CAD or PDF files
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Accepted formats: PDF, DWG.
            </p>
          </div>
        )}
        <label
          className={`inline-flex items-center rounded-lg border px-3 py-2 text-xs font-semibold transition ${
            disabled
              ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
              : "border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm active:translate-y-0 active:scale-95"
          }`}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.dwg,application/pdf"
            onChange={onUpload}
            className="hidden"
            disabled={disabled}
          />
          {buttonLabel}
        </label>
      </div>
      {uploadError && (
        <p className="text-xs text-red-500">
          {uploadError}
        </p>
      )}
      {invalidFiles.length > 0 && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
          Invalid files: {invalidFiles.join(", ")}
        </div>
      )}
    </div>
  )
}
