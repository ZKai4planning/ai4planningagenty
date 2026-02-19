"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  PROJECTS_STORAGE_KEY,
  initialProjects,
  normalizeProjects,
  type Project,
} from "@/lib/projects-data"

type CalendarEvent = {
  date: string
  title: string
  color: string
}

const PROJECT_LAST_ID_KEY = "ai4planning_last_project_id"

export default function WorkspaceCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [projects, setProjects] =
    useState<Project[]>(initialProjects)
  const [lastProjectId, setLastProjectId] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY)
      if (stored) {
        setProjects(normalizeProjects(JSON.parse(stored)))
      }
      const last = localStorage.getItem(PROJECT_LAST_ID_KEY)
      if (last) setLastProjectId(last)
    } catch {
      // Keep defaults if storage is unavailable.
    }
  }, [])

  const project = useMemo(() => {
    if (lastProjectId) {
      return projects.find((item) => item.id === lastProjectId)
    }
    return projects[0]
  }, [projects, lastProjectId])

  const events = useMemo<CalendarEvent[]>(() => {
    const baseDate = project?.createdAt
      ? parseIsoDate(project.createdAt)
      : new Date()
    return [
      {
        date: formatIsoDate(shiftToNextBusinessDay(baseDate)),
        title: "Agent X: Project Assigned",
        color: "bg-indigo-600/15 text-indigo-700",
      },
      {
        date: formatIsoDate(shiftToNextBusinessDay(baseDate)),
        title: "Agent Y: Project Started",
        color: "bg-blue-600/15 text-blue-700",
      },
      {
        date: formatIsoDate(
          shiftToNextBusinessDay(addDays(baseDate, 1))
        ),
        title: "Agent Z: Automation Run",
        color: "bg-emerald-600/15 text-emerald-700",
      },
      {
        date: formatIsoDate(
          shiftToNextBusinessDay(addDays(baseDate, 2))
        ),
        title: "Agent Z: CIL Form Generated",
        color: "bg-emerald-600 text-white",
      },
      {
        date: formatIsoDate(
          shiftToNextBusinessDay(addDays(baseDate, 3))
        ),
        title: "Agent Y: Submitted to Agent X",
        color: "bg-blue-600 text-white",
      },
      {
        date: formatIsoDate(
          shiftToNextBusinessDay(addDays(baseDate, 5))
        ),
        title: "Agent Y: Follow-up Received",
        color: "bg-indigo-600/15 text-indigo-700",
      },
    ]
  }, [project?.createdAt])

  const monthLabel = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const calendarCells = () => {
    const cells: React.ReactNode[] = []
    const today = new Date()

    for (let i = 0; i < startOffset; i += 1) {
      cells.push(
        <div
          key={`empty-${i}`}
          className="border border-slate-100"
        />
      )
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const isoDate = `${year}-${String(month + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`
      const dayEvents = events.filter(
        (event) => event.date === isoDate
      )
      const isToday =
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day

      cells.push(
        <div
          key={day}
          className={`min-h-[130px] border border-slate-100 p-2 transition ${
            isToday ? "bg-blue-50" : "bg-white"
          }`}
        >
          <div
            className={`mb-2 text-xs ${
              isToday
                ? "font-semibold text-blue-600"
                : "text-slate-400"
            }`}
          >
            {day}
          </div>

          <div className="space-y-1">
            {dayEvents.map((event) => (
              <div
                key={event.title}
                className={`truncate rounded-md px-2 py-1 text-[11px] ${event.color}`}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return cells
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Workspace Calendar
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">
              {monthLabel}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Agent Y/Z milestones for project{" "}
              <span className="font-semibold text-slate-700">
                {project?.id ?? "Unknown"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={goToToday}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-7 text-[11px] font-semibold text-slate-400">
          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
            (day) => (
              <div key={day} className="p-2">
                {day}
              </div>
            )
          )}
        </div>

        <div className="grid grid-cols-7 border border-slate-100">
          {calendarCells()}
        </div>
      </div>
    </div>
  )
}

const parseIsoDate = (value: string) => {
  const parts = value.split("-").map((item) => Number(item))
  if (parts.length !== 3 || parts.some((item) => Number.isNaN(item))) {
    return new Date()
  }
  const [year, month, day] = parts
  return new Date(year, month - 1, day)
}

const formatIsoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const shiftToNextBusinessDay = (date: Date) => {
  const shifted = new Date(date)
  const day = shifted.getDay()
  if (day === 6) {
    shifted.setDate(shifted.getDate() + 2)
  } else if (day === 0) {
    shifted.setDate(shifted.getDate() + 1)
  }
  return shifted
}
