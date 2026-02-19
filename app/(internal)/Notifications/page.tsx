"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  PROJECTS_STORAGE_KEY,
  initialProjects,
  normalizeProjects,
  type Project,
} from "@/lib/projects-data"

export default function NotificationsPage() {
  const router = useRouter()
  const [showAcceptPopup, setShowAcceptPopup] =
    useState(false)
  const [projects, setProjects] =
    useState<Project[]>(initialProjects)
  const [lastProjectId, setLastProjectId] = useState("")

  const PROJECT_LAST_ID_KEY = "ai4planning_last_project_id"

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY)
      if (stored) {
        setProjects(normalizeProjects(JSON.parse(stored)))
      }
      const last = localStorage.getItem(PROJECT_LAST_ID_KEY)
      if (last) {
        setLastProjectId(last)
      }
    } catch {
      // Keep defaults if storage is unavailable.
    }
  }, [])

  const project = useMemo(() => {
    if (lastProjectId) {
      const found = projects.find(
        (item) => item.id === lastProjectId
      )
      if (found) return found
    }
    return projects[0]
  }, [projects, lastProjectId])

  const displayProjectId = project?.id || "Z7@qL2"
  const routeProjectId = displayProjectId
  const redactedProjectId = `${displayProjectId}-REDACTED-X`

  const clientName =
    project?.clientQuestionnaire?.propertyDetails?.applicantFullName ||
    project?.clientName ||
    "Unassigned"
  const siteLocation =
    project?.clientQuestionnaire?.propertyDetails?.siteAddress ||
    project?.location ||
    "Not set"
  const workload =
    project?.serviceName || project?.subServices?.[0] || "Standard"

  const tasksSource =
    project?.documents?.length && project?.documents?.length > 0
      ? project?.documents
      : project?.subServices
  const taskItems =
    tasksSource?.slice(0, 2) ?? [
      "Generate CIL Form",
      "Fetch Location Plan",
    ]

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Notification Preview
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Review how project assignments are displayed across
          different system channels. All sensitive data is
          redacted by default until project acceptance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            <span className="material-symbols-outlined text-sm">
              mail
            </span>
            Email Channel
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-800/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    New Project Assignment
                  </h2>
                  <p className="text-sm text-slate-500">
                    From:{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Agent X &lt;central-command@agenty.io&gt;
                    </span>
                  </p>
                </div>
                <div className="rounded border border-[#13ec5b]/30 bg-[#13ec5b]/10 px-3 py-1 text-xs font-bold text-[#13ec5b]">
                  #{displayProjectId}
                </div>
              </div>
            </div>

            <div className="space-y-6 p-8">
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                Agent X has assigned a new{" "}
                <span className="font-semibold">
                  technical workflow
                </span>{" "}
                to you. Please review the project scope and
                required tasks below to proceed.
              </p>

          

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#13ec5b]" />
                  Required Tasks
                </h3>
                <ul className="space-y-3">
                  {taskItems.map((task) => (
                    <li
                      key={task}
                      className="flex items-center gap-3 rounded-lg border border-[#13ec5b]/10 bg-[#13ec5b]/5 p-3"
                    >
                      <span className="material-symbols-outlined text-sm text-[#13ec5b]">
                        check_circle
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {task}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  className="rounded-lg bg-[#13ec5b] px-10 py-4 font-bold text-[#102216] shadow-lg shadow-[#13ec5b]/30 transition-all active:scale-[0.98]"
                  onClick={() => setShowAcceptPopup(true)}
                >
                  Start Project
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-8 py-6 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-sm text-slate-400">
                  lock
                </span>
                <p className="text-[11px] uppercase tracking-tight text-slate-400">
                  <span className="font-bold">Security Note:</span>{" "}
                  To maintain operational security, client
                  identifiers and specific location data have
                  been redacted until project commencement.
                  Full details will be decrypted upon clicking
                  "Start Project" within the secure
                  environment.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            <span className="material-symbols-outlined text-sm">
              notifications_active
            </span>
            In-App Toast
          </div>

          <div className="group relative">
            <div className="absolute -inset-0.5 rounded-2xl bg-[#13ec5b]/20 opacity-25 blur transition duration-1000 group-hover:opacity-50" />
            <div className="relative rounded-2xl border-l-4 border-[#13ec5b] bg-white p-6 shadow-2xl dark:bg-slate-900">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#13ec5b]/10">
                  <span className="material-symbols-outlined text-[#13ec5b]">
                    assignment_ind
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-slate-800 dark:text-white">
                      New Assignment
                    </h4>
                    <span className="text-[10px] font-medium text-slate-400">
                      Just now
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Agent X assigned{" "}
                    <span className="font-semibold text-[#13ec5b]">
                      #{displayProjectId}
                    </span>{" "}
                    to your queue.
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      className="rounded bg-[#13ec5b] px-4 py-2 text-xs font-bold text-[#102216] transition-colors hover:bg-[#13ec5b]/90"
                      onClick={() => setShowAcceptPopup(true)}
                    >
                      Accept
                    </button>
                    <button className="rounded bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                      View Details
                    </button>
                  </div>
                </div>
                <button className="text-slate-300 transition hover:text-slate-500">
                  <span className="material-symbols-outlined text-lg">
                    close
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#13ec5b]/20 bg-[#13ec5b]/5 p-6">
            <h5 className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#13ec5b]">
              Project Overview Card
            </h5>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#13ec5b]/10 py-2">
                <span className="text-sm text-slate-500">
                  Project ID
                </span>
                <span className="text-sm font-mono font-bold">
                  #{displayProjectId}
                </span>
              </div>
         
              <div className="flex items-center justify-between border-b border-[#13ec5b]/10 py-2">
                <span className="text-sm text-slate-500">
                  Workload
                </span>
                <span className="text-sm font-medium">{workload}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-500">
                  Priority
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#13ec5b]" />
                  <span className="text-sm font-bold">
                    Standard
                  </span>
                </span>
              </div>
            </div>
          </div>

        </section>
      </div>

      {showAcceptPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowAcceptPopup(false)}
          />

          <div className="relative mx-4 w-full max-w-sm">
            <button
              className="absolute right-0 top-0 -translate-y-12 text-xs font-semibold text-white/70 hover:text-white"
              onClick={() => setShowAcceptPopup(false)}
            >
              Skip Tour ×
            </button>

            <div className="relative mb-6 rounded-2xl border-2 border-[#13ec5b] bg-white px-6 py-4 text-center shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Unique Project ID
              </p>
              <div className="mt-3 rounded-xl border-2 border-[#13ec5b] px-4 py-3 text-base font-bold text-slate-900">
                {redactedProjectId}
              </div>

              <span className="absolute left-1/2 top-full h-4 w-4 -translate-x-1/2 -translate-y-2 rotate-45 border-b-2 border-r-2 border-[#13ec5b] bg-white" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-[#13ec5b]/15 text-[#13ec5b]">
                  <span className="material-symbols-outlined text-sm">
                    verified_user
                  </span>
                </span>
                <h3 className="text-sm font-semibold text-slate-900">
                  Privacy First
                </h3>
              </div>

              <p className="text-sm leading-relaxed text-slate-600">
                This is your{" "}
                <span className="font-semibold">
                  Unique Project ID
                </span>
                . To ensure security, all client Personal
                Identifiable Information (PII) is
                automatically redacted.
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#13ec5b]" />
                  <span className="h-2 w-2 rounded-full bg-slate-200" />
                  <span className="h-2 w-2 rounded-full bg-slate-200" />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                    onClick={() => setShowAcceptPopup(false)}
                  >
                    Back
                  </button>
                  <button
                    className="rounded-full bg-[#13ec5b] px-4 py-2 text-xs font-semibold text-[#102216] shadow-sm"
                    onClick={() => {
                      setShowAcceptPopup(false)
                      router.push(
                        `/Projects/${encodeURIComponent(
                          routeProjectId
                        )}`
                      )
                    }}
                  >
                    Next Step
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
