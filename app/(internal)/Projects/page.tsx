"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import DataTable, { Column } from "@/components/datatable"
import {
  AgentUser,
  INITIAL_USERS,
  USERS_STORAGE_KEY,
} from "@/lib/agent-users"
import {
  PROJECTS_STORAGE_KEY,
  Project,
  initialProjects,
  normalizeProjects,
} from "@/lib/projects-data"

type ProjectRow = Project & {
  consultantName: string
  isActive: boolean
  progress: number
  startDate: string
}

export default function ProjectsPage() {
  const [projects, setProjects] =
    useState<Project[]>(initialProjects)
  const [projectsLoaded, setProjectsLoaded] = useState(false)
  const [users, setUsers] =
    useState<AgentUser[]>(INITIAL_USERS)
  const [usersLoaded, setUsersLoaded] = useState(false)

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

  const userLookup = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users]
  )

  const tableData = useMemo<ProjectRow[]>(() => {
    return projects.map((project) => {
      const accessNames = project.accessUsers.map((id) =>
        userLookup.get(id)?.name ?? id
      )
      const consultantName =
        accessNames[0] ?? "Unassigned"
      const startDate = project.startAt || project.createdAt || ""
      const progress =
        project.status === "Completed"
          ? 100
          : project.status === "Closed"
          ? 0
          : 60
      return {
        ...project,
        consultantName,
        isActive: project.status === "In Progress",
        progress,
        startDate,
      }
    })
  }, [projects, userLookup])

  const columns: Column<ProjectRow>[] = [
    {
      key: "id",
      label: "Project ID",
      sortable: true,
      render: (_, row) => (
        <span className="font-semibold text-slate-900">
          {row.id}
        </span>
      ),
    },
    {
      key: "consultantName",
      label: "Consultant Name",
      sortable: true,
      render: (value) => (
        <span className="text-sm font-semibold text-slate-800">
          {String(value ?? "Unassigned")}
        </span>
      ),
    },
    {
      key: "serviceName",
      label: "Services",
      sortable: true,
      render: (value, row) => (
        <div className="text-sm text-slate-700">
          <p className="font-semibold text-slate-800">
            {String(value ?? "")}
          </p>
          <p className="text-xs text-slate-500">
            {String(row.serviceId ?? "")}
          </p>
        </div>
      ),
    },
    {
      key: "subServices",
      label: "Subservices",
      sortable: false,
      render: (_, row) => {
        const subServices = Array.isArray(row.subServices)
          ? row.subServices
          : row.subServices
          ? [row.subServices as unknown as string]
          : []
        if (subServices.length === 0) {
          return (
            <span className="text-xs text-slate-400">
              Not set
            </span>
          )
        }
        const preview = subServices.slice(0, 2)
        const extra = subServices.length - preview.length
        return (
          <div className="flex flex-wrap gap-1">
            {preview.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600"
              >
                {item}
              </span>
            ))}
            {extra > 0 && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-500">
                +{extra}
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: "status",
      label: "Status",
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
      key: "progress",
      label: "Progress",
      sortable: true,
      render: (value) => {
        const numeric =
          typeof value === "number" ? value : 0
        return (
          <div className="min-w-[140px]">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Progress</span>
              <span className="font-semibold text-slate-700">
                {numeric}%
              </span>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{ width: `${numeric}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      key: "startDate",
      label: "Start Date",
      sortable: true,
      render: (value) => {
        if (!value) {
          return <span className="text-xs text-slate-400">Not set</span>
        }
        const parsed = new Date(String(value))
        const formatted = Number.isNaN(parsed.getTime())
          ? String(value)
          : parsed.toLocaleDateString("en-GB")
        return (
          <span className="text-sm text-slate-700">
            {formatted}
          </span>
        )
      },
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

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setProjects(normalizeProjects(parsed))
      }
    } catch {
      // Keep defaults if storage is unavailable.
    } finally {
      setProjectsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!projectsLoaded || typeof window === "undefined") return
    try {
      localStorage.setItem(
        PROJECTS_STORAGE_KEY,
        JSON.stringify(projects)
      )
    } catch {
      // Ignore storage failures for static UI.
    }
  }, [projects, projectsLoaded])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as AgentUser[]
        if (Array.isArray(parsed)) {
          setUsers(parsed)
        }
      }
    } catch {
      // Keep defaults if storage is unavailable.
    } finally {
      setUsersLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!usersLoaded || typeof window === "undefined") return
    try {
      localStorage.setItem(
        USERS_STORAGE_KEY,
        JSON.stringify(users)
      )
    } catch {
      // Ignore storage failures for static UI.
    }
  }, [users, usersLoaded])

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
              Key project details at a glance.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {projects.length} total projects
          </div>
        </div>

        <div className="p-6">
          <DataTable data={tableData} columns={columns} />
        </div>
      </section>
    </div>
  )
}
