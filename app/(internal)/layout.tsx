
// "use client"

// import { useState, useEffect } from "react"
// import Sidebar from "../../components/sidebar"
// import GetStarted from "../../components/getstarted"
// import HelpWidget from "../../components/HelpWidget"
// import { DashboardFooter } from "../../components/dashboard-footer"
// import { FiX } from "react-icons/fi"
// import { useMediaQuery } from "../../lib/hooks/useMediaQuery"

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const isLaptopUp = useMediaQuery("(min-width: 1024px)") // lg breakpoint

//   const [collapsed, setCollapsed] = useState(false)
//   const [showGetStarted, setShowGetStarted] = useState(false)

//   // 🔁 Auto adjust sidebar on screen change
//   useEffect(() => {
//     if (isLaptopUp) {
//       setCollapsed(false) // open on laptop/desktop
//     } else {
//       setCollapsed(true) // closed on tablet/mobile
//     }
//   }, [isLaptopUp])

//   return (
//     <div className="h-screen flex bg-gray-100 w-full  relative">

//       {/* Sidebar */}
//       <Sidebar
//         collapsed={collapsed}
//         onToggle={() => setCollapsed(p => !p)}
//         onGetStarted={() => setShowGetStarted(true)}
//         isOverlay={!isLaptopUp}
//       />

//       {/* Overlay for tablet/mobile */}
//       {!isLaptopUp && !collapsed && (
//         <div
//           className="fixed inset-0 bg-black/50 z-30"
//           onClick={() => setCollapsed(true)}
//         />
//       )}

//       {/* Content + Footer */}
//       <div
//         className={`flex flex-col flex-1 transition-all duration-300
//           ${!isLaptopUp && !collapsed ? "pointer-events-none" : ""}
//         `}
//       >
//         <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
//           {children}
//         </main>

//         <DashboardFooter />
//       </div>

//       {/* Get Started Modal */}
//       {showGetStarted && (
//         <>
//           <div
//             className="fixed inset-0 bg-black/60 z-40"
//             onClick={() => setShowGetStarted(false)}
//           />

//           <div className="fixed inset-0 z-50 flex items-center justify-center">
//             <div className="relative">
//               <button
//                 onClick={() => setShowGetStarted(false)}
//                 className="absolute -top-3 -right-3 bg-black text-white p-2 rounded-full"
//               >
//                 <FiX size={14} />
//               </button>
//               <GetStarted />
//             </div>
//           </div>
//         </>
//       )}

//       <HelpWidget />
//     </div>
//   )
// }


"use client"

import { useState, useEffect, useMemo } from "react"
import Sidebar from "../../components/sidebar"
import GetStarted from "../../components/getstarted"
import HelpWidget from "../../components/HelpWidget"
import { DashboardFooter } from "../../components/dashboard-footer"
import { FiX } from "react-icons/fi"
import { useMediaQuery } from "../../lib/hooks/useMediaQuery"
import { DashboardHeader } from "../../components/header"
import { usePathname } from "next/navigation"
import { useAuthStore } from "../../lib/zustand"
import { PROJECTS_STORAGE_KEY } from "../../lib/projects-data"
import { USERS_STORAGE_KEY } from "../../lib/agent-users"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isLaptopUp = useMediaQuery("(min-width: 1024px)")

  const [collapsed, setCollapsed] = useState(false)
  const [showGetStarted, setShowGetStarted] = useState(false)
  const [dataCleared, setDataCleared] = useState(false)
  const pathname = usePathname()
  const userName = useAuthStore((state) => state.userName)
  const userRegion = useAuthStore((state) => state.region)

  useEffect(() => {
    setCollapsed(!isLaptopUp)
  }, [isLaptopUp])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(PROJECTS_STORAGE_KEY)
      localStorage.removeItem(USERS_STORAGE_KEY)
    } catch {
      // Ignore storage failures for static UI.
    } finally {
      setDataCleared(true)
    }
  }, [])

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean)
    const withDashboard =
      segments[0]?.toLowerCase() === "dashboard"
        ? segments
        : ["Dashboard", ...segments]

    const formatLabel = (value: string) =>
      decodeURIComponent(value)
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())

    return withDashboard.map((segment, index) => ({
      label: formatLabel(segment),
      href:
        index < withDashboard.length - 1
          ? `/${withDashboard.slice(0, index + 1).join("/")}`
          : undefined,
    }))
  }, [pathname])

  const toggleSidebar = () => setCollapsed((prev) => !prev)

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
        <DashboardHeader
          breadcrumbs={breadcrumbs}
          userName={userName || "Admin"}
          userRegion={userRegion}
          collapsed={collapsed}
          onToggle={toggleSidebar}
        />

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
