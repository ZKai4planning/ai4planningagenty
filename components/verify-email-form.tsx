"use client"

import Link from "next/link"

export function VerifyEmailForm() {
  const handleResendClick = () => {
    console.log("Resend verification email")
  }

  return (
    <div className="technical-border relative z-10 w-full max-w-[540px] rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
      <div className="p-6 text-center sm:p-8 lg:p-12">
        {/* Icon Section */}
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center sm:mb-8 sm:h-32 sm:w-32">
          <svg
            className="absolute inset-0 w-full h-full text-primary/10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 100 100"
          >
            <rect height="40" strokeWidth="1" width="50" x="25" y="40"></rect>
            <path d="M25 40L50 15L75 40" strokeWidth="1"></path>
            <path d="M10 90H90" strokeDasharray="2 2" strokeWidth="0.5"></path>
          </svg>
          <div className="relative z-10 rounded-full border border-primary/20 bg-primary/5 p-4 sm:p-6">
            <div className="relative">
              <span className="material-symbols-outlined text-4xl text-primary sm:text-5xl">domain_verification</span>
              <div className="absolute -top-1 -right-1 bg-white dark:bg-slate-900 rounded-full">
                <span className="material-symbols-outlined text-xl text-primary font-bold">check_circle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8 space-y-4 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
            Action Required: Verify Connection
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Check your connection</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
            We've sent a structural handshake link to{" "}
            <span className="text-primary font-semibold">architect@ai4planning.com</span>. Please verify to finalize your
            profile.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            className="stamp-effect w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded shadow-lg transition-all active:scale-95 group flex items-center justify-center gap-2"
            onClick={handleResendClick}
            type="button"
          >
            RESEND VERIFICATION
            <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
          </button>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest"
              href="/"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to System Login
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-xl border-t border-slate-100 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-800/50 sm:px-8">
        <span className="text-[9px] font-mono text-slate-400 uppercase">Packet_ID: #8821-X</span>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700"></div>
        </div>
      </div>
    </div>
  )
}
