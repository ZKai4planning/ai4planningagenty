"use client"

import type React from "react"

import { useState } from "react"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Handle login logic here
    console.log("Form submitted")
  }

  return (
    <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Enter your credentials to Ai4Planning.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
           {/* Google Sign In */}

 {/* Divider */}
          <div className="flex items-center gap-4 w-full">
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OR USE PEROSNAL CREDENTIALS</span>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          </div>
        {/* Email Input */}
        <div className="group">
          <div className="flex justify-between items-end mb-2">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Email
            </label>
            {/* <span className="text-[9px] text-primary opacity-0 group-focus-within:opacity-100 transition-opacity font-mono">
              FLOW_ACTIVE
            </span> */}
          </div>
          <div className="relative">
            <input
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg h-14 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all font-display"
              placeholder="architect@nexus.ai"
              type="email"
              required
            />
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 h-8 w-[2px] bg-primary scale-y-0 group-focus-within:scale-y-100 transition-transform origin-center"></div>
          </div>
        </div>

        {/* Password Input */}
        <div className="group">
          <div className="flex justify-between items-end mb-2">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Password
            </label>
            <a className="text-[10px] text-primary hover:underline" href="/forgot-password">
              Forgot Password?
            </a>
          </div>
          <div className="relative flex items-center">
            <input
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg h-14 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all font-display"
              placeholder="••••••••••••"
              type={showPassword ? "text" : "password"}
              required
            />
            <button
              className="absolute right-4 text-slate-400 hover:text-primary transition-colors"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 h-8 w-[2px] bg-primary scale-y-0 group-focus-within:scale-y-100 transition-transform origin-center"></div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex flex-col items-center gap-6">
         <button
  type="submit"
  className="
    stamp-effect w-full bg-primary hover:bg-primary/90
    text-white font-bold py-4 px-8 rounded shadow-lg
    transition-all duration-300 ease-out
    active:scale-95 group relative overflow-hidden
 hover:animate-none

+   origin-center
+   transform-gpu
+   will-change-transform

    rotate-[-3deg] hover:rotate-0
  "
>


  {/* Shimmer effect overlay */}
  {/* <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div> */}
  
  {/* Shine animation from left to right on hover */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
  
  <span className="relative flex items-center justify-center gap-2 group-hover:gap-4 transition-all duration-300">
    <span className="inline-block group-hover:scale-110 transition-transform duration-300">
      SIGN 
    </span>
    <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
      IN
    </span>
    {/* <span className="material-symbols-outlined text-[18px] group-hover:translate-x-2 transition-transform duration-300">
      approval
    </span> */}
  </span>
</button>

         

       
        </div>
      </form>

      {/* Sign Up Link */}
      <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
        New user?{" "}
        <a className="text-primary font-bold hover:underline" href="/signup">
          Signup
        </a>
      </p>
    </div>
  )
}
