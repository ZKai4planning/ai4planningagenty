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
  userRegion?: string | null
  collapsed: boolean
  onToggle: () => void
}
 
export function DashboardHeader({
  breadcrumbs,
  userName,
  userRegion,
  collapsed,
  onToggle,
}: DashboardHeaderProps) {
  const userLabel = userRegion ? `${userName} (${userRegion})` : userName
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
      <div className="hidden sm:flex flex-col items-end">
        <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
          {greeting}, {userLabel}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{wish}</p>
      </div>
    </header>
  )
}
 
 
