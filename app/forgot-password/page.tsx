import { LoginHeader } from "@/components/login-header"
import { BlueprintBackground } from "@/components/blueprint-background"
import { LoginFooter } from "@/components/login-footer"
import { FloatingToolbarPassword } from "@/components/floating-toolbar"
import { ForgotPasswordForm } from "@/components/forgot-password-form"


export const metadata = {
  title: "Forgot Password - Blueprint AI",
  description: "Recover your account access",
}

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-x-hidden blueprint-grid selection:bg-primary selection:text-white">
      <LoginHeader />

      <main className="relative flex flex-1 items-center justify-center px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <BlueprintBackground />
        <ForgotPasswordForm />
        <FloatingToolbarPassword />
      </main>

      <LoginFooter />
    </div>
  )
}
