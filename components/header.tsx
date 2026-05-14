"use client"
 
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiUser,
} from "react-icons/fi"
import { useAuthStore } from "@/lib/zustand"
 
type Breadcrumb = {
  label: string
  href?: string
}
 
interface DashboardHeaderProps {
  breadcrumbs: Breadcrumb[]
  userName: string
  userEmail?: string | null
  userAvatarUrl?: string | null
  userRegion?: string | null
  profileCompletionPercentage?: number | null
  completedFields?: number | null
  totalFields?: number | null
  collapsed: boolean
  onToggle: () => void
}
 
export function DashboardHeader({
  breadcrumbs,
  userName,
  userEmail,
  userAvatarUrl,
  userRegion,
  profileCompletionPercentage,
  completedFields,
  totalFields,
  collapsed,
  onToggle,
}: DashboardHeaderProps) {
  const router = useRouter()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const userLabel = userRegion ? `${userName} (${userRegion})` : userName
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
  }, [])

  const wish = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Wishing you a focused start to the day."
    if (hour < 17) return "Hope your day is going smoothly."
    if (hour < 21) return "Wishing you a calm and productive evening."
    return "Hope you get some well-earned rest."
  }, [])
  const completionPercentage = Math.max(
    0,
    Math.min(100, profileCompletionPercentage ?? 0)
  )
  const hasCompletionData =
    profileCompletionPercentage !== null &&
    profileCompletionPercentage !== undefined
  const completionSummary =
    completedFields !== null &&
    completedFields !== undefined &&
    totalFields !== null &&
    totalFields !== undefined
      ? `${completedFields} of ${totalFields} fields done`
      : "Keep your profile up to date."

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const handleLogout = () => {
    setMenuOpen(false)
    clearAuth()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 bg-gray-100/95 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-[#101622]/80 sm:px-6 lg:px-8">
 
      {/* ================= LEFT ================= */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
       
        {/* ✅ Sidebar Toggle (EXTRACTED from Sidebar) */}
        <button
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
 
        {/* Breadcrumbs */}
        <nav className="hidden min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 sm:flex">
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
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <div className="hidden lg:flex flex-col items-end">
          <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
            {greeting}, {userLabel}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{wish}</p>
        </div>

        <div className="hidden min-w-[180px] flex-col rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm xl:flex">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-700">
              {hasCompletionData
                ? `Profile ${completionPercentage}% complete`
                : "Profile status unavailable"}
            </p>
            <span className="text-[11px] text-slate-500">
              {hasCompletionData ? `${completionPercentage}%` : "--"}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
    
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Open profile menu"
            className="flex items-center justify-center rounded-full border border-slate-200 bg-white p-1 transition hover:border-blue-300 hover:bg-blue-50"
          >
            {userAvatarUrl ? (
              <img
                src={userAvatarUrl}
                alt={`${userName} avatar`}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                {initials}
              </span>
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="flex items-center gap-3 rounded-xl px-3 py-3">
                {userAvatarUrl ? (
                  <img
                    src={userAvatarUrl}
                    alt={`${userName} avatar`}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {initials}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {userName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {userEmail || "No email available"}
                  </p>
                </div>
              </div>

              <div className="px-3 pb-3">
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-700">
                      Profile completion
                    </span>
                    <span className="text-xs text-slate-500">
                      {hasCompletionData ? `${completionPercentage}%` : "--"}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1 border-t border-slate-100 pt-2">
                <Link
                  href="/Profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <FiUser className="text-slate-500" />
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                >
                  <FiLogOut className="text-rose-500" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
 
 
