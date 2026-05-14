import { LoginHeader } from "@/components/login-header"
import { BlueprintBackground } from "@/components/blueprint-background"
import { SignupLeftSection } from "@/components/signup-left-section"
import { SignupForm } from "@/components/signup-form"
import { LoginFooter } from "@/components/login-footer"
// import { FloatingToolbar } from "@/components/floating-toolbar"

export default function SignupPage() {
  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-x-hidden blueprint-grid selection:bg-primary selection:text-white">
      {/* Navigation Header */}
      <LoginHeader />

      {/* Main Content */}
      <main className="relative flex flex-1 items-center justify-center px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        {/* Blueprint Background Elements */}
        <BlueprintBackground />

        {/* Signup Container */}
        <div className="relative z-10 grid w-full max-w-[1100px] grid-cols-1 gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-12">
          {/* Left Section */}
          <SignupLeftSection />

          {/* Right Section - Signup Form */}
          <SignupForm />
        </div>

        {/* Floating Toolbar */}
        {/* <FloatingToolbar /> */}
      </main>

      {/* Footer */}
      <LoginFooter />
    </div>
  )
}
