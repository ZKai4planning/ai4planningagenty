"use client"
 
import Link from "next/link"
import { useMemo } from "react"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
 
type Breadcrumb = {
  label: string
  href?: string
}
 
interface DashboardHeaderProps {
  breadcrumbs: Breadcrumb[]
  userName: string
  userEmail?: string | null
  userRegion?: string | null
  collapsed: boolean
  onToggle: () => void
}
 
export function DashboardHeader({
  breadcrumbs,
  userName,
  userEmail,
  userRegion,
  collapsed,
  onToggle,
}: DashboardHeaderProps) {
  const userLabel = userRegion ? `${userName} (${userRegion})` : userName
  const profileLabel = userEmail || "Open profile"
  const initials =
    userName
      .trim()
      .split(/\s+/)
      .map((segment) => segment[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "EM"
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    if (hour < 21) return "Good evening"
    return "Good night"
  }, [])

  const wish = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Wishing you a focused start to the day."
    if (hour < 17) return "Hope your day is going smoothly."
    if (hour < 21) return "Wishing you a calm and productive evening."
    return "Hope you get some well-earned rest."
  }, [])

  return (
    <header className="flex items-center justify-between whitespace-nowrap bg-gray-100 dark:bg-[#101622]/80 backdrop-blur-md px-10 py-3 z-50 sticky top-0">
 
      {/* ================= LEFT ================= */}
      <div className="flex items-center gap-4">
       
        {/* ✅ Sidebar Toggle (EXTRACTED from Sidebar) */}
        <button
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
 
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index !== 0 && <span>/</span>}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-[#135bec] transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-900 dark:text-white font-medium">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>
 
      {/* ================= RIGHT ================= */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
            {greeting}, {userLabel}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{wish}</p>
        </div>

        <Link
          href="/Profile"
          className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition hover:border-blue-300 hover:bg-blue-50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="block max-w-[180px] truncate text-xs font-semibold text-slate-700">
              {userName}
            </span>
            <span className="block max-w-[180px] truncate text-[11px] text-slate-500">
              {profileLabel}
            </span>
          </span>
        </Link>
      </div>
    </header>
  )
}
 
 
