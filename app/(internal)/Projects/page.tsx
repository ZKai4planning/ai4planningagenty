"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import DataTable, { type Column } from "@/components/datatable"
import {
  PROJECTS_STORAGE_KEY,
  normalizeProjects,
  type Project,
} from "@/lib/projects-data"
import { fetchAdminProjectsWithEligibility } from "@/lib/project-api"

type ProjectRow = Project & {
  applicantDisplayName: string
  stageDisplayName: string
  eligibilityDisplayName: string
  progress: number
  isActive: boolean
  lastUpdated: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    isRecord(error) &&
    typeof error.message === "string" &&
    error.message.trim() !== ""
  ) {
    return error.message
  }

  return fallback
}

const formatDate = (value: string) => {
  if (!value) return "Not set"

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleDateString("en-GB")
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)

  const statusBadge = (status: Project["status"]) => {
    if (status === "Completed") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100"
    }
    if (status === "Closed") {
      return "bg-rose-50 text-rose-700 border-rose-100"
    }
    if (status === "In Progress") {
      return "bg-blue-50 text-blue-700 border-blue-100"
    }
    return "bg-amber-50 text-amber-700 border-amber-100"
  }

  const eligibilityBadge = (status: string) => {
    if (status === "Completed") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100"
    }
    if (status === "Not Started") {
      return "bg-slate-100 text-slate-600 border-slate-200"
    }
    return "bg-amber-50 text-amber-700 border-amber-100"
  }

  const syncProjectsToStorage = useCallback((nextProjects: Project[]) => {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(
        PROJECTS_STORAGE_KEY,
        JSON.stringify(nextProjects)
      )
    } catch {
      // Ignore storage failures for cached project data.
    }
  }, [])

  const loadStoredProjects = useCallback(() => {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY)
      if (!stored) return []

      return normalizeProjects(JSON.parse(stored))
    } catch {
      return []
    }
  }, [])

  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const nextProjects = await fetchAdminProjectsWithEligibility()
      setProjects(nextProjects)
      syncProjectsToStorage(nextProjects)
      setLastSyncedAt(new Date().toISOString())
    } catch (nextError: unknown) {
      const fallbackProjects = loadStoredProjects()

      if (fallbackProjects.length > 0) {
        setProjects(fallbackProjects)
      }

      setError(
        getErrorMessage(
          nextError,
          "Unable to load projects from the API right now."
        )
      )
    } finally {
      setLoading(false)
    }
  }, [loadStoredProjects, syncProjectsToStorage])

  useEffect(() => {
    const storedProjects = loadStoredProjects()
    if (storedProjects.length > 0) {
      setProjects(storedProjects)
    }

    void loadProjects()
  }, [loadProjects, loadStoredProjects])

  const tableData = useMemo<ProjectRow[]>(() => {
    return projects.map((project) => {
      const progress =
        typeof project.eligibilityProgress === "number"
          ? project.eligibilityProgress
          : project.status === "Completed"
            ? 100
            : project.status === "Closed"
              ? 0
              : 0

      return {
        ...project,
        applicantDisplayName:
          project.applicantName ||
          project.clientName ||
          "Not provided",
        stageDisplayName:
          project.projectStageLabel || "Stage not available",
        eligibilityDisplayName:
          project.eligibilityStatus || "Not Started",
        progress,
        isActive: project.status === "In Progress",
        lastUpdated:
          project.eligibilityUpdatedAt ||
          project.startAt ||
          project.createdAt ||
          "",
      }
    })
  }, [projects])

  const columns: Column<ProjectRow>[] = [
    {
      key: "id",
      label: "Project ID",
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.id}</p>
          <p className="text-xs text-slate-500">
            {row.projectStatusRaw || row.status}
          </p>
        </div>
      ),
    },
    {
      key: "applicantDisplayName",
      label: "Applicant",
      sortable: true,
      render: (_, row) => (
        <div className="text-sm text-slate-700">
          <p className="font-semibold text-slate-800">
            {row.applicantDisplayName}
          </p>
          <p className="text-xs text-slate-500">
            {row.clientQuestionnaire?.propertyDetails
              ?.purposeOfDevelopment || "Purpose not provided"}
          </p>
        </div>
      ),
    },
    {
      key: "serviceName",
      label: "Service",
      sortable: true,
      render: (_, row) => (
        <div className="text-sm text-slate-700">
          <p className="font-semibold text-slate-800">
            {row.serviceName}
          </p>
          <p className="text-xs text-slate-500">
            {row.subServices[0] || "Subservice not provided"}
          </p>
        </div>
      ),
    },
    {
      key: "stageDisplayName",
      label: "Stage",
      sortable: true,
      render: (_, row) => (
        <div className="text-sm text-slate-700">
          <p className="font-semibold text-slate-800">
            {row.stageDisplayName}
          </p>
          <p className="text-xs text-slate-500">
            {row.projectStageRoute || "Route unavailable"}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Project Status",
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${statusBadge(
            value as Project["status"]
          )}`}
        >
          {String(value ?? "")}
        </span>
      ),
    },
    {
      key: "eligibilityDisplayName",
      label: "Eligibility",
      sortable: true,
      render: (_, row) => (
        <div className="min-w-[180px] space-y-1">
          <span
            className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${eligibilityBadge(
              row.eligibilityDisplayName
            )}`}
          >
            {row.eligibilityDisplayName}
          </span>
          <p className="text-xs text-slate-500">
            {typeof row.eligibilityCompletedSteps === "number" &&
            typeof row.eligibilityTotalSteps === "number" &&
            row.eligibilityTotalSteps > 0
              ? `${row.eligibilityCompletedSteps}/${row.eligibilityTotalSteps} steps completed`
              : "Eligibility form not available"}
          </p>
          <p className="text-xs text-slate-500">
            Next: {row.eligibilityNextStepLabel || "Not available"}
          </p>
        </div>
      ),
    },
    {
      key: "progress",
      label: "Progress",
      sortable: true,
      render: (_, row) => (
        <div className="min-w-[140px]">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Eligibility</span>
            <span className="font-semibold text-slate-700">
              {row.progress}%
            </span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${row.progress}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "lastUpdated",
      label: "Last Updated",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-slate-700">
          {formatDate(String(value ?? ""))}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <Link
          href={`/Projects/${encodeURIComponent(row.id)}`}
          className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-600 transition hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-sm active:translate-y-0 active:scale-95"
        >
          View Project
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <section
        id="projects"
        className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-col gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Projects Overview
            </h2>
            <p className="text-xs text-slate-500">
              Live projects from `/projects/all` with eligibility
              progress from `/eligibility/:projectId`.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {projects.length} total projects
            </div>
            {lastSyncedAt && (
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Synced {formatDate(lastSyncedAt)}
              </div>
            )}
            <button
              type="button"
              onClick={() => void loadProjects()}
              disabled={loading}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800">
            {error}
            {projects.length > 0
              ? " Showing the latest cached data."
              : ""}
          </div>
        )}

        <div className="p-6">
          {loading && projects.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Loading projects...
            </div>
          ) : tableData.length > 0 ? (
            <DataTable data={tableData} columns={columns} />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No projects were returned by the API.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
