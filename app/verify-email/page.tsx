import { LoginHeader } from "@/components/login-header"
import { BlueprintBackground } from "@/components/blueprint-background"
import { LoginFooter } from "@/components/login-footer"
import { FloatingToolbarPassword } from "@/components/floating-toolbar"
import { VerifyEmailForm } from "@/components/verify-email-form"


export const metadata = {
  title: "Verify Email - Blueprint AI",
  description: "Verify your email to complete the connection",
}

export default function VerifyEmailPage() {
  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-x-hidden blueprint-grid selection:bg-primary selection:text-white">
      <LoginHeader />

      <main className="relative flex flex-1 items-center justify-center px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <BlueprintBackground />
        <VerifyEmailForm />
        <FloatingToolbarPassword />
      </main>

      <LoginFooter />
    </div>
  )
}
