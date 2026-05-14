export function LoginFooter() {
  return (
    <footer className="flex flex-col items-center justify-between border-t border-primary/10 bg-white/50 px-4 py-3 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 backdrop-blur-sm dark:bg-slate-950/50 dark:text-slate-500 md:flex-row sm:px-6">
      <div className="mb-3 flex items-center gap-4 md:mb-0 md:gap-6">
        <span>Coord: 40.7128° N, 74.0060° W</span>
        <span className="hidden sm:inline">|</span>
        <span>Scale: 1:500 (AUTO)</span>
      </div>
      <div className="flex items-center gap-5 sm:gap-8">
        <a className="hover:text-primary transition-colors" href="#">
          Privacy_Protocol
        </a>
        <a className="hover:text-primary transition-colors" href="#">
          Usage_Terms
        </a>
        <span className="text-primary font-bold">© 2026 AI4Planning</span>
      </div>
    </footer>
  )
}
