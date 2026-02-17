import Logo from "./logo";

export default function Footer() {
  return (
    <footer className="border-t border-[#dbdfe6] dark:border-[#2d3748] px-10 py-8 bg-white dark:bg-[#101622]">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-[#616f89] dark:text-[#a0aec0]">
        <div className="flex items-center gap-3 text-primary">
          <a href="/" className="flex items-center gap-3">
            <Logo />
            <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">
              Ai4Planning
            </h2>
          </a>
        </div>
        <div className="flex gap-8">
          <a className="hover:text-[#135bec]" href="#">
            Documentation
          </a>
          <a className="hover:text-[#135bec]" href="#">
            Privacy Policy
          </a>
          <a className="hover:text-[#135bec]" href="#">
            Terms of Service
          </a>
        </div>
        <div className="mt-4 md:mt-0">© 2026 Ai4Planning</div>
      </div>
    </footer>
  )
}
