"use client"

import  Logo  from "./logo"

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#dbdfe6] dark:border-gray-800 bg-white/80 dark:bg-[#101622]/80 backdrop-blur-md px-10 py-3 z-50 sticky top-0">
      <div className="flex items-center gap-4 text-[#135bec]">
       <a href="/" className="flex items-center gap-3">
           <Logo />
           <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">
             Ai4Planning
           </h2>
         </a>
      </div>
      <div className="flex flex-1 justify-end gap-6 items-center">
        <div className="flex gap-2">
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-white dark:bg-gray-800 border border-[#dbdfe6] dark:border-gray-700 text-[#111318] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-white dark:bg-gray-800 border border-[#dbdfe6] dark:border-gray-700 text-[#111318] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-[#135bec]/20"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB1Eza0tCqKeHHruHdTH9YGuNFa5pP_cPv16-xSu6hAXMubQ4M_QbPu0QFCA8HXS9r8ZYiiKbUFvDGoIl5oBSAISX9qXNywyj5b_gZWNmf6oWR0iCV2Zh-zF7ixVi4dftP0VebfiOx9NZ3-eX5j6RAWaBf1BKFi3-YIMCo7RgRTMtSHe0PUiRrHFNb9PhT2kGjZnf9pfNUVxmkazvv2i1AZ2GMFo58EJLy7JTgrWkqn8HoLPmFdtGztHVFGk_vCV4_VpytTocJzWxg0")',
          }}
          title="User profile avatar"
        />
      </div>
    </header>
  )
}
