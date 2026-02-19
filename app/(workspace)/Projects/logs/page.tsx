"use client"

import { useEffect, useMemo, useState } from "react"
import {
  User,
  Bot,
  FileText,
  Download,
} from "lucide-react"
import {
  PROJECTS_STORAGE_KEY,
  initialProjects,
  normalizeProjects,
  type Project,
} from "@/lib/projects-data"

/* ================= TYPES ================= */

type ActivityType =
  | "completed"
  | "triggered"
  | "auto-resolved"

type ActivityItem = {
  id: string
  timestamp: Date
  agent: string
  role: string
  type: ActivityType
  title: string
  description: string
  progress?: number
  attachment?: string
  tag?: string
}

/* ================= DATA ================= */

const PROJECT_LAST_ID_KEY = "ai4planning_last_project_id"

/* ================= PAGE ================= */

export default function LogsPage() {
  const [selectedAgent, setSelectedAgent] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [automatedOnly, setAutomatedOnly] = useState(false)
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

  const activityData = useMemo<ActivityItem[]>(() => {
    const baseDate = project?.createdAt
      ? parseIsoDate(project.createdAt)
      : new Date()
    const projectId = project?.id ?? "Z7@qL2"
    return [
      {
        id: "0",
        timestamp: setClock(
          shiftToNextBusinessDay(baseDate),
          8,
          30
        ),
        agent: "Agent X",
        role: "Initiator",
        type: "completed",
        title: "Project Assigned",
        description: `Agent X assigned project ${projectId} to Agent Y.`,
      },
      {
        id: "1",
        timestamp: setClock(
          shiftToNextBusinessDay(baseDate),
          9,
          15
        ),
        agent: "Agent Y",
        role: "Executor",
        type: "triggered",
        title: "Project Started",
        description: `Accepted project ${projectId} and initiated workspace setup.`,
      },
      {
        id: "2",
        timestamp: setClock(
          shiftToNextBusinessDay(addDays(baseDate, 1)),
          11,
          0
        ),
        agent: "Agent Z",
        role: "Automation",
        type: "auto-resolved",
        title: "Automation Run: Briefcase",
        description:
          "Automation executed eligibility briefcase and verified required inputs.",
        progress: 72,
      },
      {
        id: "3",
        timestamp: setClock(
          shiftToNextBusinessDay(addDays(baseDate, 2)),
          14,
          30
        ),
        agent: "Agent Z",
        role: "Automation",
        type: "completed",
        title: "CIL Form Generated",
        description:
          "CIL form generated and attached to project package.",
        attachment: `${projectId}_CIL_Form.pdf`,
      },
      {
        id: "4",
        timestamp: setClock(
          shiftToNextBusinessDay(addDays(baseDate, 3)),
          16,
          0
        ),
        agent: "Agent Y",
        role: "Executor",
        type: "completed",
        title: "Submitted to Agent X",
        description:
          "Missing details and generated documents submitted to Agent X for review.",
        tag: "HANDOFF COMPLETE",
      },
    ]
  }, [project])

  /* ========== FILTER LOGIC ========== */

  const filteredData = useMemo(() => {
    return activityData.filter((item) => {
      if (selectedAgent !== "All" && item.agent !== selectedAgent)
        return false

      if (
        selectedStatus !== "All" &&
        item.type !== selectedStatus
      )
        return false

      if (automatedOnly && item.type !== "auto-resolved")
        return false

      return true
    })
  }, [selectedAgent, selectedStatus, automatedOnly])

  /* ========== EXPORT ========== */

  const exportLogs = () => {
    const blob = new Blob(
      [JSON.stringify(filteredData, null, 2)],
      { type: "application/json" }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "activity-logs.json"
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* ================= FILTER BAR ================= */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between mb-8">
        <div className="flex gap-4 items-center">
          <select
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="All">All Agents</option>
            <option>Agent Y</option>
            <option>Agent Z</option>
          </select>

          <select
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="All">All Status</option>
            <option value="completed">completed</option>
            <option value="triggered">triggered</option>
            <option value="auto-resolved">auto-resolved</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={automatedOnly}
              onChange={() =>
                setAutomatedOnly(!automatedOnly)
              }
            />
            Automated Only
          </label>
        </div>

        <button
          onClick={exportLogs}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Download size={16} />
          Export Logs
        </button>
      </div>

      {/* ================= TIMELINE ================= */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gray-300" />

        <div className="space-y-10">
          {filteredData.map((item) => (
            <TimelineItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ================= TIMELINE ITEM ================= */

function TimelineItem({ item }: { item: ActivityItem }) {
  const iconMap: Record<string, any> = {
    completed: <User size={16} />,
    triggered: <User size={16} />,
    "auto-resolved": <Bot size={16} />,
  }

  const colorMap: Record<string, string> = {
    completed: "bg-blue-600",
    triggered: "bg-purple-600",
    "auto-resolved": "bg-green-600",
  }

  const badgeMap: Record<string, string> = {
    completed: "bg-blue-100 text-blue-600",
    triggered: "bg-purple-100 text-purple-600",
    "auto-resolved": "bg-green-100 text-green-600",
  }

  return (
    <div className="relative flex gap-6">
      {/* ICON */}
      <div
        className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full text-white ${
          colorMap[item.type]
        }`}
      >
        {iconMap[item.type]}
      </div>

      {/* CONTENT */}
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-xs text-gray-500">
            {item.timestamp.toLocaleDateString("en-GB")} ·{" "}
            {item.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          <span className="font-medium text-blue-600">
            {item.agent} ({item.role})
          </span>

          <span
            className={`ml-auto text-xs px-3 py-1 rounded-full ${
              badgeMap[item.type]
            }`}
          >
            {item.type}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold mb-1">
            {item.title}
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            {item.description}
          </p>

          {item.progress && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <div className="text-right text-xs text-gray-500 mt-1">
                {item.progress}%
              </div>
            </>
          )}

          {item.attachment && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
              <FileText size={14} />
              {item.attachment}
            </div>
          )}

          {item.tag && (
            <span className="text-xs px-3 py-1 bg-green-100 text-green-600 rounded-full mt-3 inline-block">
              {item.tag}
            </span>
          )}
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

const setClock = (date: Date, hours: number, minutes: number) => {
  const next = new Date(date)
  next.setHours(hours, minutes, 0, 0)
  return next
}
