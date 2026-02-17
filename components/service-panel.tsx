interface ServicePanelProps {
  service: {
    id: string
    number: string
    title: string
    subtitle: string
    description: string
    features: string[]
    cta: string
    icon: string
    label: string
    image: string
  }
}

export default function ServicePanel({ service }: ServicePanelProps) {
  return (
    <div className="flex-[3] bg-white dark:bg-[#1a202c] border border-[#dbdfe6] dark:border-[#2d3748] rounded-xl relative flex overflow-hidden shadow-2xl service-transition">
      {/* Left side - Visualization */}
      <div className="w-3/5 relative flex items-center justify-center p-12 bg-gradient-to-br from-white to-gray-50 dark:from-[#0f1419] dark:to-[#1a202c] architectural-grid opacity-50">
        <div className="relative w-80 h-[500px] border-4 border-[#135bec]/40 rounded-sm shadow-[0_0_50px_rgba(19,91,236,0.2)] flex flex-col service-transition">
          <div className="flex-1 grid grid-cols-3 grid-rows-6 gap-2 p-2">
            {[...Array(18)].map((_, i) => (
              <div
                key={i}
                className={`border border-[#135bec] ${
                  [4, 9].includes(i) ? "bg-[#135bec]/20 animate-pulse" : "bg-[#135bec]/5"
                }`}
              />
            ))}
          </div>

          {/* Data Callouts */}
          <div className="absolute -top-10 -right-20 data-callout bg-white/90 dark:bg-[#1a202c]/90 p-3 rounded-lg shadow-lg flex items-center gap-3 service-transition">
            <div className="text-green-500 text-xl">✓</div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500">Material Efficiency</p>
              <p className="text-sm font-bold text-[#135bec]">94.2% Optimized</p>
            </div>
          </div>

          <div className="absolute top-1/2 -left-32 data-callout bg-white/90 dark:bg-[#1a202c]/90 p-3 rounded-lg shadow-lg flex items-center gap-3 service-transition">
            <div className="text-red-500 text-xl">⚠</div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500">Stress Points</p>
              <p className="text-sm font-bold text-red-600">3 Critical Zones</p>
            </div>
          </div>

          <div className="absolute bottom-10 -right-24 data-callout bg-white/90 dark:bg-[#1a202c]/90 p-3 rounded-lg shadow-lg flex items-center gap-3 service-transition">
            <div className="text-blue-500 text-xl">⚙</div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500">Load Distribution</p>
              <p className="text-sm font-bold">Uniform (0.02σ)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Content */}
      <div className="w-2/5 p-16 flex flex-col justify-center bg-white/50 dark:bg-[#1a202c]/50 backdrop-blur-sm border-l border-[#dbdfe6] dark:border-[#2d3748] relative z-10 service-transition">
        <span className="text-[#135bec] font-bold tracking-widest text-xs uppercase mb-4">{service.subtitle}</span>
        <h2 className="text-4xl font-bold mb-6 service-transition">{service.title}</h2>
        <h3 className="text-xl font-semibold mb-4 text-[#111318] dark:text-white">Learn More</h3>
        <p className="text-[#616f89] dark:text-[#a0aec0] mb-8 text-lg leading-relaxed">{service.description}</p>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {service.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-[#111318] dark:text-white">
              <svg className="w-5 h-5 text-[#135bec] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-4">
          <button className="bg-[#135bec] hover:bg-[#0d47a1] text-white font-bold py-5 px-10 rounded-lg flex items-center justify-center gap-3 w-full transition-all text-lg shadow-xl shadow-[#135bec]/20">
            <span>{service.cta}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <button className="border border-[#dbdfe6] dark:border-[#2d3748] hover:bg-gray-50 dark:hover:bg-white/5 font-semibold py-4 px-10 rounded-lg flex items-center justify-center gap-2 w-full transition-all">
            Download Specs
          </button>
        </div>
      </div>
    </div>
  )
}
