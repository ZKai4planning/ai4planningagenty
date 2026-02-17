"use client"

import { useState, useEffect, useMemo } from "react"
import Sidebar from "../../../components/sidebar"
import GetStarted from "../../../components/getstarted"
import HelpWidget from "../../../components/HelpWidget"
import { DashboardFooter } from "../../../components/dashboard-footer"
import { FiX } from "react-icons/fi"
import { useMediaQuery } from "../../../lib/hooks/useMediaQuery"
import { useParams } from "next/navigation"
import { useAuthStore } from "../../../lib/zustand"
import { USERS_STORAGE_KEY } from "../../../lib/agent-users"
import type { SidebarItem } from "../../../lib/sidebar"
import { FiClock, FiLayers, FiMessageSquare } from "react-icons/fi"
import { Bell, ChevronDown } from "lucide-react"

const PROJECT_LAST_ID_KEY = "ai4planning_last_project_id"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isLaptopUp = useMediaQuery("(min-width: 1024px)")

  const [collapsed, setCollapsed] = useState(false)
  const [showGetStarted, setShowGetStarted] = useState(false)
  const [dataCleared, setDataCleared] = useState(false)
  const params = useParams()
  const rawProjectId = (params?.projectId as string) ?? ""
  const decodedProjectId = decodeProjectId(rawProjectId)
  const initialProjectHref = decodedProjectId
    ? `/Projects/${encodeURIComponent(decodedProjectId)}`
    : "/Projects"
  const [projectHref, setProjectHref] = useState(initialProjectHref)
  const userName = useAuthStore((state) => state.userName) || "User"

  useEffect(() => {
    setCollapsed(!isLaptopUp)
  }, [isLaptopUp])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(USERS_STORAGE_KEY)
    } catch {
      // Ignore storage failures for static UI.
    } finally {
      setDataCleared(true)
    }
  }, [])

  useEffect(() => {
    if (decodedProjectId) {
      setProjectHref(
        `/Projects/${encodeURIComponent(decodedProjectId)}`
      )
      return
    }
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem(PROJECT_LAST_ID_KEY)
      if (stored) {
        setProjectHref(`/Projects/${encodeURIComponent(stored)}`)
      } else {
        setProjectHref("/Projects")
      }
    } catch {
      setProjectHref("/Projects")
    }
  }, [decodedProjectId])

  const toggleSidebar = () => setCollapsed((prev) => !prev)
  const workspaceItems = useMemo<SidebarItem[]>(
    () => [
      {
        id: "projects",
        label: "Projects",
        icon: FiLayers,
        href: projectHref,
      },
      {
        id: "chat",
        label: "Chat",
        icon: FiMessageSquare,
        href: "/Projects/chat",
      },
      {
        id: "logs",
        label: "Logs",
        icon: FiClock,
        href: "/Projects/logs",
      },
    ],
    [projectHref]
  )

  if (!dataCleared) {
    return null
  }

  return (
    // 🔒 Root: no horizontal scroll ever
    <div className="h-screen w-full overflow-x-hidden overflow-y-hidden flex bg-gray-100 relative">

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleSidebar}
        onGetStarted={() => setShowGetStarted(true)}
        isOverlay={!isLaptopUp}
        items={workspaceItems}
      />

      {/* Overlay (mobile/tablet) */}
      {!isLaptopUp && !collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Content wrapper */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="border-b border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                AY
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Agent Y Project Workflow
                </p>
                <p className="text-xs text-slate-500">
                  Active workspace context
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-4 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase text-slate-400">
                    Overall
                  </span>
                  <span className="text-slate-900">65%</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase text-slate-400">
                    Tasks
                  </span>
                  <span className="text-slate-900">12</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase text-slate-400">
                    Bottlenecks
                  </span>
                  <span className="text-rose-500">2</span>
                </div>
              </div>

              <button className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50">
                <Bell size={16} />
              </button>

              <button className="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline">
                  {userName}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Main scroll area */}
        <main className="flex-1 min-w-0 w-full max-w-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Footer */}
        <DashboardFooter />
      </div>

      {/* Get Started Modal */}
      {showGetStarted && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setShowGetStarted(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="relative">
              <button
                onClick={() => setShowGetStarted(false)}
                className="absolute -top-3 -right-3 bg-black text-white p-2 rounded-full"
              >
                <FiX size={14} />
              </button>
              <GetStarted />
            </div>
          </div>
        </>
      )}

      <HelpWidget />
    </div>
  )
}

const decodeProjectId = (value: string) => {
  let decoded = value
  for (let i = 0; i < 5; i += 1) {
    try {
      const next = decodeURIComponent(decoded)
      if (next === decoded) break
      decoded = next
    } catch {
      break
    }
  }
  return decoded
}
