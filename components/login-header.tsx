"use client"

import { useEffect, useState } from "react"
import  Logo  from "./logo"

export function LoginHeader() {
  // Hidden at top, shows after scroll
  const [hideBrand, setHideBrand] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setHideBrand(window.scrollY <= 40)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-60 w-full border-b border-white/10 bg-[#050B18]/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        
        {/* Brand */}
        <a href="/" className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 transition-all duration-300 ease-in-out ${
              hideBrand
                ? "opacity-0 scale-90 w-0 overflow-hidden"
                : "opacity-100 scale-100"
            }`}
          >
            <Logo />
            <h2 className="whitespace-nowrap text-base font-bold text-white sm:text-lg">
              Ai4Planning
            </h2>
          </div>
        </a>

        {/* Right */}
        <a
          href="/"
          className="text-[10px] font-bold uppercase tracking-widest text-white"
        >
          Login
        </a>
      </div>
    </header>
  )
}
