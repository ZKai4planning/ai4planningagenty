"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  PROJECTS_STORAGE_KEY,
  initialProjects,
  normalizeProjects,
  type Project,
} from "@/lib/projects-data"
import { useAuthStore } from "@/lib/zustand"

export default function DashboardPage() {
  const [projects, setProjects] =
    useState<Project[]>(initialProjects)
  const userId = useAuthStore((state) => state.userId)

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
    }
  }, [])

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
    let completedProjects = 0
    let closedProjects = 0
    let pendingAcceptance = 0
    let acceptedProjects = 0
    let rejectedProjects = 0
    let documentProjects = 0
    let cadProjects = 0
    let documentsSent = 0
    let drawingsSent = 0
    let messagesSent = 0
    const assignees = new Set<string>()

    projects.forEach((project) => {
      if (project.status === "In Progress") inProgressProjects += 1
      if (project.status === "Completed") completedProjects += 1
      if (project.status === "Closed") closedProjects += 1

      if (project.acceptance === "Pending") pendingAcceptance += 1
      if (project.acceptance === "Accepted") acceptedProjects += 1
      if (project.acceptance === "Rejected") rejectedProjects += 1

      if (project.documents.length > 0) documentProjects += 1
      if (project.drawings.length > 0) cadProjects += 1

      if (project.documentsSentToAgentX) documentsSent += 1
      if (project.drawingsSentToAgentX) drawingsSent += 1

      messagesSent += project.messages.filter(
        (msg) => msg.type !== "Chat"
      ).length

      if (project.documentAssignee) {
        assignees.add(project.documentAssignee)
      }
      if (project.drawingAssignee) {
        assignees.add(project.drawingAssignee)
      }
      project.assignees.forEach((assignee) => {
        assignees.add(assignee)
      })

      project.documents.forEach((doc) => {
        docCounts.total += 1
        const status = project.documentStatuses[doc] ?? "Pending"
        if (status === "Validated") docCounts.validated += 1
        if (status === "Not Validated") docCounts.notValidated += 1
        if (status === "Pending") docCounts.pending += 1
      })
      project.drawings.forEach((drawing) => {
        drawingCounts.total += 1
        const status =
          project.drawingStatuses[drawing] ?? "Pending"
        if (status === "Validated") drawingCounts.validated += 1
        if (status === "Not Validated") drawingCounts.notValidated += 1
        if (status === "Pending") drawingCounts.pending += 1
      })
    })

    return {
      totalProjects: projects.length,
      inProgressProjects,
      completedProjects,
      closedProjects,
      pendingAcceptance,
      acceptedProjects,
      rejectedProjects,
      documentProjects,
      cadProjects,
      documentsSent,
      drawingsSent,
      messagesSent,
      activeAssignees: assignees.size,
      docCounts,
      drawingCounts,
    }
  }, [projects])

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => {
        const aTime = Date.parse(a.createdAt || "") || 0
        const bTime = Date.parse(b.createdAt || "") || 0
        return bTime - aTime
      })
      .slice(0, 6)
  }, [projects])

  const recentActivity = useMemo(() => {
    const items = projects.flatMap((project) =>
      project.messages.map((message) => ({
        ...message,
        projectId: project.id,
        serviceName: project.serviceName,
      }))
    )
    return items
      .sort((a, b) => {
        const aTime = Date.parse(a.createdAt || "") || 0
        const bTime = Date.parse(b.createdAt || "") || 0
        return bTime - aTime
      })
      .slice(0, 6)
  }, [projects])

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Operations Center
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
              Application Dashboard
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              Overall system health, workload distribution, and
              delivery progress across all projects.
            </p>
           
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/Projects"
              className="rounded-full bg-[#13ec5b] px-4 py-2 text-xs font-semibold text-[#102216] shadow-sm transition hover:bg-[#13ec5b]/90"
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
            Total Projects
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {analytics.totalProjects}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {analytics.documentProjects} document � {" "}
            {analytics.cadProjects} CAD
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            In Progress
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {analytics.inProgressProjects}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Active workstreams
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Completed
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {analytics.completedProjects}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Delivered to Agent X
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Closed
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {analytics.closedProjects}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Archived projects
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Pending Acceptance
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {analytics.pendingAcceptance}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {analytics.acceptedProjects} accepted � {" "}
            {analytics.rejectedProjects} rejected
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Active Assignees
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {analytics.activeAssignees}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Contributors on live work
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Documents
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {analytics.docCounts.total}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {analytics.docCounts.validated} validated � {" "}
            {analytics.docCounts.pending} pending
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Drawings
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {analytics.drawingCounts.total}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {analytics.drawingCounts.validated} validated � {" "}
            {analytics.drawingCounts.pending} pending
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Delivery Snapshot
          </h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Agent X Deliveries
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {analytics.documentsSent + analytics.drawingsSent}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {analytics.documentsSent} document packs � {" "}
                {analytics.drawingsSent} drawing packs
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Messages Sent
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {analytics.messagesSent}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Non-chat updates delivered
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Validation Health
          </h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Documents
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {analytics.docCounts.notValidated}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Not validated � {analytics.docCounts.pending} pending
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Drawings
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {analytics.drawingCounts.notValidated}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Not validated � {analytics.drawingCounts.pending} pending
              </p>
            </div>
          </div>
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
                    {project.createdAt || "Not set"}
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

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Recent Activity
        </h2>
        <div className="mt-4 space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {activity.type}
                    </p>
                    <p className="text-xs text-slate-500">
                      {activity.projectId} � {activity.serviceName}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {activity.createdAt || ""}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  {activity.message}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-400">
              No recent activity logged yet.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

