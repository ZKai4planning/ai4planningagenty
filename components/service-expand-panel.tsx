// "use client"

// interface Service {
//   id: string
//   number: string
//   title: string
//   shortTitle: string
//   description: string
//   features: string[]
//   cta: string
//   icon: string
//   label: string
//   image: string
// }

// interface ServiceExpandPanelProps {
//   service: Service
//   isExpanded: boolean
//   onExpand: () => void
// }

// export default function ServiceExpandPanel({ service, isExpanded, onExpand }: ServiceExpandPanelProps) {
//   return (
//     <div
//       className="group relative bg-white dark:bg-[#1a202c] border border-[#dbdfe6] dark:border-[#2d3748] rounded-xl cursor-pointer overflow-hidden transition-all duration-500"
//       style={{
//         flex: isExpanded ? 3 : undefined,
//         width: isExpanded ? "auto" : "64px",
//       }}
//       onClick={onExpand}
//     >
//       {/* Collapsed State - Vertical Label */}
//       <div
//         className="absolute inset-0 flex flex-col items-center justify-center p-4 transition-opacity duration-300"
//         style={{ opacity: isExpanded ? 0 : 1, pointerEvents: isExpanded ? "none" : "auto" }}
//       >
//         <span
//           className="vertical-text font-bold text-[#616f89] dark:text-[#4a5568] uppercase tracking-[0.4em] text-xs text-center"
//           style={{ transform: "rotate(180deg)" }}
//         >
//           {service.label}
//         </span>
//       </div>

//       {/* Expanded State - Full Content Layout */}
//       <div
//         className="absolute inset-0 flex h-full w-full"
//         style={{
//           opacity: isExpanded ? 1 : 0,
//           transition: "opacity 0.4s ease-in-out 0.1s",
//           pointerEvents: isExpanded ? "auto" : "none",
//         }}
//       >
//         {/* Left Section - Visualization/Image */}
//         <div className="w-3/5 relative flex items-center justify-center bg-white/50 dark:bg-[#1a202c]/50 backdrop-blur-sm p-8 border-r border-[#dbdfe6] dark:border-[#2d3748] overflow-hidden">
//           <div className="relative w-full h-full flex items-center justify-center">
//             <div className="relative w-64 h-96 border-4 border-[#135bec]/40 rounded-sm shadow-[0_0_50px_rgba(19,91,236,0.2)] flex flex-col">
//               <div className="flex-1 grid grid-cols-3 grid-rows-6 gap-2 p-2">
//                 {/* Grid visualization */}
//                 {Array.from({ length: 18 }).map((_, i) => (
//                   <div
//                     key={i}
//                     className={`border border-[#135bec] ${
//                       i === 4 || i === 9 ? "bg-[#135bec]/20 animate-pulse" : "bg-[#135bec]/5"
//                     }`}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Section - Content */}
//         <div className="w-2/5 p-10 flex flex-col justify-start bg-white/50 dark:bg-[#1a202c]/50 backdrop-blur-sm overflow-y-auto">
//           <span className="text-[#135bec] font-bold tracking-widest text-xs uppercase mb-3">Core Technology</span>
//           <h2 className="text-3xl font-bold mb-4">{service.title}</h2>
//           <p className="text-[#616f89] dark:text-[#a0aec0] mb-6 text-base leading-relaxed">{service.description}</p>

//           {/* Features List */}
//           <div className="flex flex-col gap-3 mb-6">
//             {service.features.map((feature, index) => (
//               <div key={index} className="flex items-start gap-3">
//                 <span className="material-symbols-outlined text-[#135bec] text-lg flex-shrink-0 mt-1">
//                   check_circle
//                 </span>
//                 <span className="text-sm">{feature}</span>
//               </div>
//             ))}
//           </div>

//           {/* Buttons */}
//           <div className="flex flex-col gap-3 mt-auto">
//             <button className="bg-[#135bec] hover:bg-[#135bec]/90 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 w-full transition-all text-base shadow-xl shadow-[#135bec]/20 active:scale-95">
//               <span>{service.cta}</span>
//               <span className="material-symbols-outlined text-lg">rocket_launch</span>
//             </button>
//             <button className="border border-[#dbdfe6] dark:border-[#2d3748] hover:bg-gray-50 dark:hover:bg-white/5 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 w-full transition-all text-sm">
//               Download Specs
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// dark one 

// "use client"

// interface Service {
//   id: string
//   number: string
//   title: string
//   shortTitle: string
//   description: string
//   features: string[]
//   cta: string
//   icon: string
//   label: string
//   image: string
// }

// interface ServiceExpandPanelProps {
//   service: Service
//   isExpanded: boolean
//   onExpand: () => void
// }

// export default function ServiceExpandPanel({
//   service,
//   isExpanded,
//   onExpand,
// }: ServiceExpandPanelProps) {
//   return (
//     <div
//       className="
//         group
//         relative
//         bg-white/5
//         backdrop-blur-xl
//         border border-white/10
//         rounded-2xl
//         cursor-pointer
//         overflow-hidden
//         transition-all
//         duration-500
//       "
//       style={{
//         flex: isExpanded ? 3 : undefined,
//         width: isExpanded ? "auto" : "64px",
//       }}
//       onClick={onExpand}
//     >
//       {/* Collapsed Vertical Label */}
//       <div
//         className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
//         style={{ opacity: isExpanded ? 0 : 1 }}
//       >
//         <span
//           className="vertical-text font-bold text-white/50 uppercase tracking-[0.4em] text-xs"
//           style={{ transform: "rotate(180deg)" }}
//         >
//           {service.label}
//         </span>
//       </div>

//       {/* Expanded Content */}
//       <div
//         className="absolute inset-0 flex h-full w-full"
//         style={{
//           opacity: isExpanded ? 1 : 0,
//           transition: "opacity 0.4s ease-in-out 0.1s",
//         }}
//       >
//         {/* Left Visual */}
//         <div className="w-3/5 relative flex items-center justify-center bg-white/5 p-8 border-r border-white/10 overflow-hidden">
//           <div className="relative w-64 h-96 border-2 border-blue-400/40 rounded-md shadow-[0_0_60px_rgba(96,165,250,0.25)]">
//             <div className="grid grid-cols-3 grid-rows-6 gap-2 p-2 h-full">
//               {Array.from({ length: 18 }).map((_, i) => (
//                 <div
//                   key={i}
//                   className={`border border-blue-400/40 ${
//                     i === 4 || i === 9
//                       ? "bg-blue-400/30 animate-pulse"
//                       : "bg-blue-400/10"
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Right Content */}
//         <div className="w-2/5 p-10 flex flex-col bg-white/5 overflow-y-auto">
//           <span className="text-blue-400 font-bold tracking-widest text-xs uppercase mb-3">
//             Core Technology
//           </span>

//           <h2 className="text-3xl font-bold mb-4">
//             {service.title}
//           </h2>

//           <p className="text-white/70 mb-6 leading-relaxed">
//             {service.description}
//           </p>

//           {/* Features */}
//           <div className="flex flex-col gap-3 mb-6">
//             {service.features.map((feature, index) => (
//               <div key={index} className="flex gap-3">
//                 <span className="material-symbols-outlined text-blue-400 text-lg">
//                   check_circle
//                 </span>
//                 <span className="text-sm text-white/80">{feature}</span>
//               </div>
//             ))}
//           </div>

//           {/* Actions */}
//           <div className="flex flex-col gap-3 mt-auto">
//             <button className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/30 active:scale-95">
//               {service.cta}
//               <span className="material-symbols-outlined text-lg">
//                 rocket_launch
//               </span>
//             </button>

//             <button className="border border-white/15 hover:bg-white/5 font-semibold py-3 px-6 rounded-xl transition text-sm">
//               Download Specs
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// framer motion working

// "use client"
// import { motion } from "framer-motion"

// interface Service {
//   id: string
//   number: string
//   title: string
//   shortTitle: string
//   description: string
//   features: string[]
//   cta: string
//   icon: string
//   label: string
//   image: string
// }

// interface ServiceExpandPanelProps {
//   service: Service
//   isExpanded: boolean
//   onExpand: () => void
//   mobile?: boolean
//   onClose?: () => void
// }

// export default function ServiceExpandPanel({
//   service,
//   isExpanded,
//   onExpand,
//   mobile = false,
//   onClose,
// }: ServiceExpandPanelProps) {
//   return (
//     <motion.div
//       layout
//       initial={false}
//       style={{
//         flex: isExpanded && !mobile ? "3 1 0%" : "0 0 64px",
//         width: isExpanded && !mobile ? "auto" : "64px",
//       }}
//       transition={{
//         layout: {
//           duration: 0.5,
//           ease: [0.4, 0, 0.2, 1]
//         }
//       }}
//       onClick={!mobile ? onExpand : undefined}
//       className={`
//         relative
//         bg-white/5
//         backdrop-blur-xl
//         border border-white/10
//         rounded-2xl
//         overflow-hidden
//         cursor-pointer
//         ${mobile ? "h-full w-full" : "h-full"}
//       `}
//     >
//       {/* MOBILE HEADER */}
//       {mobile && (
//         <div className="flex items-center justify-between p-5 border-b border-white/10">
//           <h3 className="font-bold text-lg">{service.title}</h3>
//           <button
//             onClick={onClose}
//             className="text-white/60 hover:text-white"
//           >
//             <span className="material-symbols-outlined">close</span>
//           </button>
//         </div>
//       )}

//       {/* COLLAPSED LABEL */}
//       <motion.div
//         className="absolute inset-0 flex items-center justify-center pointer-events-none"
//         initial={false}
//         animate={{ opacity: isExpanded || mobile ? 0 : 1 }}
//         transition={{ duration: 0.3 }}
//       >
//         <span
//           className="vertical-text font-bold text-white/50 uppercase tracking-[0.4em] text-xs"
//           style={{ transform: "rotate(180deg)" }}
//         >
//           {service.label}
//         </span>
//       </motion.div>

//       {/* EXPANDED CONTENT */}
//       <motion.div
//         className="absolute inset-0 flex h-full w-full"
//         initial={false}
//         animate={{ opacity: isExpanded || mobile ? 1 : 0 }}
//         transition={{ duration: 0.4, delay: isExpanded || mobile ? 0.1 : 0 }}
//         style={{ pointerEvents: isExpanded || mobile ? 'auto' : 'none' }}
//       >
//         {/* Left Visual */}
//         <div className="hidden md:flex w-3/5 items-center justify-center bg-white/5 p-8 border-r border-white/10 overflow-hidden">
//           <div className="relative w-64 h-96 border-2 border-blue-400/40 rounded-md shadow-[0_0_60px_rgba(96,165,250,0.25)]">
//             <div className="grid grid-cols-3 grid-rows-6 gap-2 p-2 h-full">
//               {Array.from({ length: 18 }).map((_, i) => (
//                 <div
//                   key={i}
//                   className={`border border-blue-400/40 ${
//                     i === 4 || i === 9
//                       ? "bg-blue-400/30 animate-pulse"
//                       : "bg-blue-400/10"
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Right Content */}
//         <div className="flex-1 md:w-2/5 p-6 md:p-10 flex flex-col bg-white/5 overflow-y-auto">
//           <span className="text-blue-400 font-bold tracking-widest text-xs uppercase mb-3">
//             Core Technology
//           </span>
//           <h2 className="text-3xl font-bold mb-4">{service.title}</h2>
//           <p className="text-white/70 mb-6 leading-relaxed">
//             {service.description}
//           </p>

//           {/* Features */}
//           <div className="flex flex-col gap-3 mb-6">
//             {service.features.map((feature, index) => (
//               <div key={index} className="flex gap-3">
//                 <span className="material-symbols-outlined text-blue-400 text-lg">
//                   check_circle
//                 </span>
//                 <span className="text-sm text-white/80">{feature}</span>
//               </div>
//             ))}
//           </div>

//           {/* Actions */}
//           <div className="flex flex-col gap-3 mt-auto">
//             <button className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/30 active:scale-95">
//               {service.cta}
//               <span className="material-symbols-outlined text-lg">
//                 rocket_launch
//               </span>
//             </button>
//             <button className="border border-white/15 hover:bg-white/5 font-semibold py-3 px-6 rounded-xl transition text-sm">
//               Download Specs
//             </button>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   )
// }

// with mobile fix

"use client"
import { motion } from "framer-motion"

interface Service {
  id: string
  number: string
  title: string
  shortTitle: string
  description: string
  features: string[]
  cta: string
  icon: string
  label: string
  image: string
}

interface ServiceExpandPanelProps {
  service: Service
  isExpanded: boolean
  onExpand: () => void
  mobile?: boolean
  onClose?: () => void
}

export default function ServiceExpandPanel({
  service,
  isExpanded,
  onExpand,
  mobile = false,
  onClose,
}: ServiceExpandPanelProps) {
  return (
    <motion.div
      layout
      initial={false}
      style={{
        flex: mobile ? undefined : (isExpanded ? "3 1 0%" : "0 0 64px"),
        width: mobile ? undefined : (isExpanded ? "auto" : "64px"),
      }}
      transition={{
        layout: {
          duration: 0.5,
          ease: [0.4, 0, 0.2, 1]
        }
      }}
      onClick={!mobile ? onExpand : undefined}
      className={`
        relative
        bg-white/5
        backdrop-blur-xl
        border border-white/10
        rounded-2xl
        overflow-hidden
        cursor-pointer
        ${mobile ? "h-full w-full" : "h-full"}
      `}
    >
      {/* MOBILE HEADER */}
      {mobile && (
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="font-bold text-lg">{service.title}</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* COLLAPSED LABEL */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={false}
        animate={{ opacity: isExpanded || mobile ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <span
          className="vertical-text font-bold text-white/50 uppercase tracking-[0.4em] text-xs"
          style={{ transform: "rotate(180deg)" }}
        >
          {service.label}
        </span>
      </motion.div>

      {/* EXPANDED CONTENT */}
      <motion.div
        className="absolute inset-0 flex h-full w-full"
        initial={false}
        animate={{ opacity: isExpanded || mobile ? 1 : 0 }}
        transition={{ duration: 0.4, delay: isExpanded || mobile ? 0.1 : 0 }}
        style={{ pointerEvents: isExpanded || mobile ? 'auto' : 'none' }}
      >
        {/* Left Visual */}
        <div className="hidden md:flex w-3/5 items-center justify-center bg-white/5 p-8 border-r border-white/10 overflow-hidden">
          <div className="relative w-64 h-96 border-2 border-blue-400/40 rounded-md shadow-[0_0_60px_rgba(96,165,250,0.25)]">
            <div className="grid grid-cols-3 grid-rows-6 gap-2 p-2 h-full">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className={`border border-blue-400/40 ${
                    i === 4 || i === 9
                      ? "bg-blue-400/30 animate-pulse"
                      : "bg-blue-400/10"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 md:w-2/5 p-6 md:p-10 flex flex-col bg-white/5 overflow-y-auto">
          <span className="text-blue-400 font-bold tracking-widest text-xs uppercase mb-3">
            Core Technology
          </span>
          <h2 className="text-3xl font-bold mb-4">{service.title}</h2>
          <p className="text-white/70 mb-6 leading-relaxed">
            {service.description}
          </p>

          {/* Features */}
          <div className="flex flex-col gap-3 mb-6">
            {service.features.map((feature, index) => (
              <div key={index} className="flex gap-3">
                <span className="material-symbols-outlined text-blue-400 text-lg">
                  check_circle
                </span>
                <span className="text-sm text-white/80">{feature}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-auto">
            <button className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/30 active:scale-95">
              {service.cta}
              <span className="material-symbols-outlined text-lg">
                rocket_launch
              </span>
            </button>
            <button className="border border-white/15 hover:bg-white/5 font-semibold py-3 px-6 rounded-xl transition text-sm">
              Download Specs
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}