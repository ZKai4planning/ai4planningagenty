

// "use client"
 
// import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
// import { SIDEBAR_ITEMS } from "@/lib/sidebar"
// import { cn } from "@/lib/utils"
// import Logo from "@/components/logo"
// import Link from "next/link"
// import { useState } from "react"
// import { usePathname } from "next/navigation"
 
// /* ---------------- Divider ---------------- */
// function SidebarDivider({ label }: { label: string }) {
//   return (
//     <div className="flex items-center gap-3 my-4 px-4">
//       <div className="flex-1 h-px bg-slate-400" />
//       <span className="text-[10px] uppercase font-semibold tracking-widest text-black/40">
//         {label}
//       </span>
//       <div className="flex-1 h-px bg-slate-400" />
//     </div>
//   )
// }
 
// /* ---------------- Sidebar ---------------- */
// export default function Sidebar({
//   collapsed,
//   onToggle,
//   onGetStarted,
// }: {
//   collapsed: boolean
//   onToggle: () => void
//   onGetStarted: () => void
// }) {
//   const [openGroup, setOpenGroup] = useState<string | null>(null)
//   const pathname = usePathname()
 
//   const userName = "Gajala"
//   const email = "gajala143@gmail.com"
 
//   return (
//     <aside
//       className={cn(
//         "h-full bg-white text-slate-700 flex flex-col transition-all duration-300 border-r border-slate-200",
//         collapsed ? "w-20" : "w-64"
//       )}
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200">
//         <Logo collapsed={collapsed} />
       
//       </div>
 
//       {/* Menu */}
//       <nav className="px-0 py-3 space-y-1 overflow-y-auto">
//         {SIDEBAR_ITEMS.map((item) => {
//           const Icon = item.icon
//           const isOpen = openGroup === item.id
//           const isActive = item.href
//             ? pathname === item.href ||
//               pathname.startsWith(item.href + "/")
//             : false
 
//           /* -------- Section Dividers -------- */
//           if (item.id === "employees") {
//             return (
//               <div key={item.id}>
//                 {!collapsed && <SidebarDivider label="Employee" />}
//               </div>
//             )
//           }
 
//           if (item.id === "reports") {
//             return (
//               <div key={item.id}>
//                 {!collapsed && <SidebarDivider label="Cases" />}
//               </div>
//             )
//           }
 
//           /* -------- Simple Link -------- */
//           if (!item.children && item.href) {
//             return (
//               <Link
//                 key={item.id}
//                 href={item.href}
//                 className={cn(
//                   "relative flex items-center rounded-md transition group",
//                   collapsed
//                     ? "justify-center px-3 py-3"
//                     : "gap-3 px-4 py-2",
//                   isActive
//                     ? "bg-blue-50 text-blue-600"
//                     : "hover:bg-slate-100"
//                 )}
//               >
//                 {isActive && (
//                   <span className="absolute right-0 top-0 h-full w-1 bg-blue-600 rounded-r-md" />
//                 )}
 
//                 <Icon
//                   className={cn(
//                     "text-lg",
//                     isActive
//                       ? "text-blue-600"
//                       : "text-slate-500 group-hover:text-slate-700"
//                   )}
//                 />
 
//                 {!collapsed && (
//                   <span className="text-sm font-medium">
//                     {item.label}
//                   </span>
//                 )}
//               </Link>
//             )
//           }
 
//           /* -------- Button (no href) -------- */
//           if (!item.children && !item.href) {
//             return (
//               <button
//                 key={item.id}
//                 className={cn(
//                   "w-full flex items-center rounded-md transition hover:bg-slate-100",
//                   collapsed
//                     ? "justify-center px-3 py-3"
//                     : "gap-3 px-4 py-2"
//                 )}
//               >
//                 <Icon className="text-lg text-slate-500" />
//                 {!collapsed && (
//                   <span className="text-sm font-medium">
//                     {item.label}
//                   </span>
//                 )}
//               </button>
//             )
//           }
 
//           /* -------- Parent With Children -------- */
//           return (
//             <div key={item.id}>
//               <button
//                 onClick={() =>
//                   setOpenGroup(isOpen ? null : item.id)
//                 }
//                 className={cn(
//                   "w-full flex items-center rounded-md transition hover:bg-slate-100",
//                   collapsed
//                     ? "justify-center px-3 py-3"
//                     : "gap-3 px-4 py-2"
//                 )}
//               >
//                 <Icon className="text-lg text-slate-500" />
//                 {!collapsed && (
//                   <span className="text-sm font-medium">
//                     {item.label}
//                   </span>
//                 )}
//               </button>
 
//               {!collapsed && isOpen && (
//                 <div className="ml-9 mt-1 space-y-1">
//                   {item.children?.map((child) => {
//                     const childActive =
//                       pathname === child.href ||
//                       pathname.startsWith(child.href + "/")
 
//                     return (
//                       <Link
//                         key={child.id}
//                         href={child.href}
//                         className={cn(
//                           "relative block px-3 py-2 rounded-md text-sm transition",
//                           childActive
//                             ? "bg-blue-900 text-blue-600"
//                             : "text-slate-500 hover:bg-slate-100"
//                         )}
//                       >
//                         {childActive && (
//                           <span className="absolute right-0 top-0 h-full w-1 bg-blue-600 rounded-r-md" />
//                         )}
//                         {child.label}
//                       </Link>
//                     )
//                   })}
//                 </div>
//               )}
//             </div>
//           )
//         })}
//       </nav>
 
//       {/* -------- Bottom Section -------- */}
//       <div className="mt-auto border-t border-slate-200">
//         <div className="p-3">
//           <button
//             onClick={onGetStarted}
//             className="w-full px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-sm"
//           >
//             💬 {!collapsed && "Got Feedback?"}
//           </button>
//         </div>
 
//         {!collapsed && (
//           <div className="px-4 py-3 border-t border-slate-200">
//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
//                 {userName.charAt(0)}
//               </div>
//               <div className="min-w-0">
//                 <p className="text-sm font-medium truncate">
//                   {userName}
//                 </p>
//                 <p className="text-xs text-slate-400 truncate">
//                   {email}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </aside>
//   )
// }
 

"use client"

import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { SIDEBAR_ITEMS, type SidebarItem } from "@/lib/sidebar"
import { cn } from "@/lib/utils"
import Logo from "@/components/logo"
import Link from "next/link"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/zustand"

/* ---------------- Divider ---------------- */
function SidebarDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4 px-4">
      <div className="flex-1 h-px bg-slate-300" />
      <span className="text-[10px] uppercase font-semibold tracking-widest text-black/40">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-300" />
    </div>
  )
}

/* ---------------- Sidebar ---------------- */
export default function Sidebar({
  collapsed,
  onToggle,
  onGetStarted,
  isOverlay = false,
  items,
}: {
  collapsed: boolean
  onToggle: () => void
  onGetStarted: () => void
  isOverlay?: boolean
  items?: SidebarItem[]
}) {
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const menuItems = items ?? SIDEBAR_ITEMS

  const userName = useAuthStore((state) => state.userName) || "Admin"
  const userRole = useAuthStore((state) => state.role)
  const userRegion = useAuthStore((state) => state.region)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const userSubtitle = userRole
    ? `${userRole === "admin" ? "Admin" : "Employee"}${
        userRegion ? ` · ${userRegion}` : ""
      }`
    : "Signed in"

  const handleLogout = () => {
    clearAuth()
    if (isOverlay) onToggle()
    router.push("/login")
  }

  return (
    <aside
      className={cn(
        "bg-white text-slate-700 flex flex-col border-r border-slate-200",
        "transition-all duration-300 ease-in-out",
        // positioning
        isOverlay
          ? "fixed top-0 left-0 z-40 h-full"
          : "relative h-full",
        // width & animation
        collapsed
          ? isOverlay
            ? "-translate-x-full w-64"
            : "w-20"
          : "translate-x-0 w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200">
        <Logo collapsed={collapsed && !isOverlay} />

        {/* Toggle only on desktop */}
        {/* {!isOverlay && (
          <button
            onClick={onToggle}
            className="p-2 rounded hover:bg-slate-100"
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        )} */}
      </div>

      {/* Menu */}
      <nav className="px-0 py-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isOpen = openGroup === item.id
          const isActive = item.href
            ? pathname === item.href ||
              pathname.startsWith(item.href + "/")
            : false

          /* -------- Section Dividers -------- */
          // if (item.id === "employees") {
          //   return (
          //     <div key={item.id}>
          //       {!collapsed && <SidebarDivider label="Employee" />}
          //     </div>
          //   )
          // }

          if (item.id === "reports") {
            return (
              <div key={item.id}>
                {!collapsed && <SidebarDivider label="Cases" />}
              </div>
            )
          }

          /* -------- Simple Link -------- */
          if (!item.children && item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "relative flex items-center rounded-md transition group",
                  collapsed
                    ? "justify-center px-3 py-3"
                    : "gap-3 px-4 py-2",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-slate-100"
                )}
                onClick={isOverlay ? onToggle : undefined}
              >
                {isActive && (
                  <span className="absolute right-0 top-0 h-full w-1 bg-blue-600 rounded-r-md" />
                )}

                <Icon
                  className={cn(
                    "text-lg",
                    isActive
                      ? "text-blue-600"
                      : "text-slate-500 group-hover:text-slate-700"
                  )}
                />

                {!collapsed && (
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          }

          /* -------- Button (no href) -------- */
          if (!item.children && !item.href) {
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "logout") {
                    handleLogout()
                  }
                }}
                className={cn(
                  "w-full flex items-center rounded-md transition hover:bg-slate-100",
                  collapsed
                    ? "justify-center px-3 py-3"
                    : "gap-3 px-4 py-2"
                )}
              >
                <Icon className="text-lg text-slate-500" />
                {!collapsed && (
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </button>
            )
          }

          /* -------- Parent With Children -------- */
          return (
            <div key={item.id}>
              <button
                onClick={() =>
                  setOpenGroup(isOpen ? null : item.id)
                }
                className={cn(
                  "w-full flex items-center rounded-md transition hover:bg-slate-100",
                  collapsed
                    ? "justify-center px-3 py-3"
                    : "gap-3 px-4 py-2"
                )}
              >
                <Icon className="text-lg text-slate-500" />
                {!collapsed && (
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </button>

              {!collapsed && isOpen && (
                <div className="ml-9 mt-1 space-y-1">
                  {item.children?.map((child) => {
                    const childActive =
                      pathname === child.href ||
                      pathname.startsWith(child.href + "/")

                    return (
                      <Link
                        key={child.id}
                        href={child.href}
                        onClick={isOverlay ? onToggle : undefined}
                        className={cn(
                          "relative block px-3 py-2 rounded-md text-sm transition",
                          childActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-500 hover:bg-slate-100"
                        )}
                      >
                        {childActive && (
                          <span className="absolute right-0 top-0 h-full w-1 bg-blue-600 rounded-r-md" />
                        )}
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto border-t border-slate-200">
        <div className="p-3">
          <button
            onClick={onGetStarted}
            className="w-full px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-sm"
          >
            💬 {!collapsed && "Got Feedback?"}
          </button>
        </div>

        {!collapsed && (
          <div className="px-4 py-3 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                {userName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {userName}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {userSubtitle}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}




