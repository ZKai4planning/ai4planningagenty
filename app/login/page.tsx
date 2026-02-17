import { BlueprintBackground } from "@/components/blueprint-background";
import { BlueprintLeftSection } from "@/components/blueprint-left-section";
import { FloatingToolbar } from "@/components/floating-toolbar";
import { LoginFooter } from "@/components/login-footer";
import { LoginForm } from "@/components/login-form";
import {ClientLogin} from "@/components/clientloginform";
import { LoginHeader } from "@/components/login-header";


export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col blueprint-grid selection:bg-primary selection:text-white">
      {/* Navigation Header */}
     

      {/* Main Content */}
      <main className="relative flex flex-1 items-center justify-center p-6">
        {/* Blueprint Background Elements */}

        <BlueprintBackground />

        {/* Login Container */}
        <div className="relative z-10 w-full max-w-[1000px] h-[600px] grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white dark:bg-slate-900 shadow-2xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
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
