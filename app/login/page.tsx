import { BlueprintBackground } from "@/components/blueprint-background";
import { BlueprintLeftSection } from "@/components/blueprint-left-section";
import { FloatingToolbar } from "@/components/floating-toolbar";
import { LoginFooter } from "@/components/login-footer";
import {ClientLogin} from "@/components/clientloginform";


export default function LoginPage() {
  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-x-hidden blueprint-grid selection:bg-primary selection:text-white">
      {/* Navigation Header */}
     

      {/* Main Content */}
      <main className="relative flex flex-1 items-center justify-center px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        {/* Blueprint Background Elements */}

        <BlueprintBackground />

        {/* Login Container */}
        <div className="relative z-10 grid w-full max-w-[1000px] grid-cols-1 gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-12 lg:min-h-[520px] lg:max-h-[min(600px,calc(100svh-9rem))]">
 <div className="hidden lg:flex col-span-7 ">
          <BlueprintLeftSection />
</div>

          {/* Right Section - Login Form */}
          <ClientLogin />
          {/* <LoginForm /> */}
        </div>

        {/* Floating Toolbar */}
        <FloatingToolbar />
      </main>

      {/* Footer */}
      <LoginFooter />
    </div>
  )
}
