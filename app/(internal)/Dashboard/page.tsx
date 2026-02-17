"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { FiBriefcase } from "react-icons/fi"
import {
  PROJECTS_STORAGE_KEY,
  Project,
  initialProjects,
  normalizeProjects,
} from "@/lib/projects-data"

export default function DashboardPage() {
  const [projects, setProjects] =
    useState<Project[]>(initialProjects)
  const [projectsLoaded, setProjectsLoaded] = useState(false)

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

  const analytics = useMemo(() => {
    const docCounts = {
      total: 0,
      pending: 0,
      validated: 0,
      notValidated: 0,
    }
    const drawingCounts = {
      total: 0,
      pending: 0,
      validated: 0,
      notValidated: 0,
    }
    let inProgressProjects = 0
    let inProgressDocuments = 0
    let inProgressDrawings = 0
    let documentProjects = 0
    let cadProjects = 0
    let completedProjects = 0
    let messagesSent = 0
    let documentsSent = 0
    let drawingsSent = 0

    projects.forEach((project) => {
      if (project.documents.length > 0) documentProjects += 1
      if (project.drawings.length > 0) cadProjects += 1
      if (project.status === "In Progress") {
        inProgressProjects += 1
        inProgressDocuments += project.documents.length
        inProgressDrawings += project.drawings.length
      }
      if (
        project.status === "Completed" ||
        project.status === "Closed" ||
        (project.documentsSentToAgentX && project.drawingsSentToAgentX)
      ) {
        completedProjects += 1
      }
      messagesSent += project.messages.filter(
        (msg) => msg.type !== "Chat"
      ).length
      if (project.documentsSentToAgentX) documentsSent += 1
      if (project.drawingsSentToAgentX) drawingsSent += 1

      project.documents.forEach((doc) => {
        docCounts.total += 1
        const status = project.documentStatuses[doc] ?? "Pending"
        if (status === "Validated") docCounts.validated += 1
        if (status === "Not Validated") docCounts.notValidated += 1
        if (status === "Pending") docCounts.pending += 1
      })
      project.drawings.forEach((drawing) => {
        drawingCounts.total += 1
        const status = project.drawingStatuses[drawing] ?? "Pending"
        if (status === "Validated") drawingCounts.validated += 1
        if (status === "Not Validated") drawingCounts.notValidated += 1
        if (status === "Pending") drawingCounts.pending += 1
      })
    })

    return {
      totalProjects: projects.length,
      docCounts,
      drawingCounts,
      inProgressProjects,
      inProgressDocuments,
      inProgressDrawings,
      documentProjects,
      cadProjects,
      completedProjects,
      messagesSent,
      documentsSent,
      drawingsSent,
    }
  }, [projects])

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => {
        const aTime = Date.parse(a.createdAt || "") || 0
        const bTime = Date.parse(b.createdAt || "") || 0
        return bTime - aTime
      })
      .slice(0, 5)
  }, [projects])

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Operations Hub
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
              Dashboard Overview
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              Track document and drawing validation, team assignments,
              and communication back to Agent X.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/Projects"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              View Projects
            </Link>
            <Link
              href="/Users"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              Manage Users
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            <span className="inline-flex items-center gap-2">
              Total Projects <FiBriefcase className="text-slate-400" />
            </span>
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {analytics.totalProjects}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Active transfers from Agent X.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            <span className="inline-flex items-center gap-2">
              Document Projects <FiBriefcase className="text-slate-400" />
            </span>
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {analytics.documentProjects}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Projects with document <FiBriefcase className="inline text-slate-400" />.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            <span className="inline-flex items-center gap-2">
              CAD Projects <FiBriefcase className="text-slate-400" />
            </span>
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {analytics.cadProjects}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Projects with CAD <FiBriefcase className="inline text-slate-400" />.
          </p>
        </div>
      
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Projects In Progress
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {analytics.inProgressProjects}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {analytics.inProgressDocuments} documents ·{" "}
            {analytics.inProgressDrawings} drawings
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Completed Projects
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {analytics.completedProjects}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Completed or closed projects.
          </p>
        </div>
    
 
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Projects
          </h2>
          <Link
            href="/Projects"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {recentProjects.length > 0 ? (
            recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {project.id}
                  </p>
                  <p className="text-xs text-slate-500">
                    {project.serviceName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {project.createdAt}
                  </span>
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {project.status}
                  </span>
                  <Link
                    href={`/Projects/${project.id}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-400">
              No recent projects available.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
