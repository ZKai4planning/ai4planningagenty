// // // "use client"

// // // import { useEffect, useState } from "react"

// // // export default function HomePage() {
// // //   const [released, setReleased] = useState(false)

// // //   useEffect(() => {
// // //     const onScroll = () => {
// // //       if (window.scrollY >= 300) {
// // //         setReleased(true)
// // //       } else {
// // //         setReleased(false)
// // //       }
// // //     }

// // //     window.addEventListener("scroll", onScroll)
// // //     return () => window.removeEventListener("scroll", onScroll)
// // //   }, [])

// // //   return (
// // //     <>
// // //       {/* ================= HERO SECTION ================= */}
// // //       <section
// // //         className={`
// // //           w-full h-[800px] overflow-hidden flex items-center justify-center
// // //           ${released ? "relative  z-0 " : "fixed inset-0 z-0"}
          
// // //         `}
// // //       >
       
// // //         <video
// // //           className="absolute inset-0 w-full h-full object-cover"
// // //           src="/loop.mp4"
// // //           autoPlay
// // //           loop
// // //           muted
// // //           playsInline
// // //         />

       
// // //         <div className="absolute inset-0 bg-black/50" />

// // //         {/* Hero Content */}
// // //         <div className="relative z-10 flex flex-col items-center text-center px-4 ">
// // //           <h1 className="text-4xl md:text-9xl font-bold text-white tracking-tight">
// // //             AI4Planning
// // //           </h1>
// // //         </div>
// // //       </section>

// // //       {/* ================= SPACER (only while hero is fixed) ================= */}
// // //       {!released && <div className="h-[800px]" />}

// // //       {/* ================= CONTENT SECTION ================= */}
// // //       <section
// // //         className="
// // //           relative z-10
// // //           bg-[#050B18]
// // //           min-h-screen
// // //           px-10 py-24
// // //           rounded-t-3xl
// // //           shadow-2xl
// // //           -mt-[200px]
// // //         "
// // //       >
// // //         <h2 className="text-4xl text-center text-white font-bold mb-16">
// // //           Intelligent Planning Starts Here
// // //         </h2>

// // //         <div className="relative w-full max-w-8xl mx-auto h-[900px] overflow-hidden rounded-2xl shadow-xl">
// // //           <video
// // //             className="absolute inset-0 w-full h-full object-cover"
// // //             src="/blueprinttobuilding.mp4"
// // //             autoPlay
// // //             loop
// // //             muted
// // //             playsInline
// // //           />
// // //           <div className="absolute inset-0 bg-black/20" />
// // //         </div>
// // //       </section>
// // //     </>
// // //   )
// // // }


// // "use client"

// // import { useEffect, useState } from "react"

// // export default function HomePage() {
// //   const [released, setReleased] = useState(false)

// //   useEffect(() => {
// //     const onScroll = () => {
// //       setReleased(window.scrollY >= 300)
// //     }

// //     window.addEventListener("scroll", onScroll)
// //     return () => window.removeEventListener("scroll", onScroll)
// //   }, [])

// //   return (
// //     <>
// //       {/* ================= HERO SECTION ================= */}
// //       <section
// //         className={`
// //           w-full h-[800px] overflow-hidden flex items-center justify-center
// //           sticky
// //           ${released ? "top-[-800px]" : "top-0"}
// //           z-0
// //         `}
// //       >
// //         {/* Background Video */}
// //         <video
// //           className="absolute inset-0 w-full h-full object-cover"
// //           src="/loop.mp4"
// //           autoPlay
// //           loop
// //           muted
// //           playsInline
// //         />

// //         {/* Overlay */}
// //         <div className="absolute inset-0 bg-black/50" />

// //         {/* Hero Content */}
// //         <div className="relative z-10 flex flex-col items-center text-center px-4">
// //           <h1 className="text-4xl md:text-9xl font-bold text-white tracking-tight">
// //             AI4Planning
// //           </h1>
// //         </div>
// //       </section>

// //       {/* ================= CONTENT SECTION ================= */}
// //       <section
// //         className="
// //           relative z-10
// //           bg-[#050B18]
// //           min-h-screen
// //           px-10 py-24
// //           rounded-t-3xl
// //           shadow-2xl
// //           -mt-[200px]
// //         "
// //       >
// //         <h2 className="text-4xl text-center text-white font-bold mb-16">
// //           Intelligent Planning Starts Here
// //         </h2>

// //         <div className="relative w-full max-w-8xl mx-auto h-[900px] overflow-hidden rounded-2xl shadow-xl">
// //           <video
// //             className="absolute inset-0 w-full h-full object-cover"
// //             src="/blueprinttobuilding.mp4"
// //             autoPlay
// //             loop
// //             muted
// //             playsInline
// //           />
// //           <div className="absolute inset-0 bg-black/20" />
// //         </div>
// //       </section>
// //     </>
// //   )
// // }


// "use client"

// import { useEffect, useRef } from "react"
// import gsap from "gsap"
// import { ScrollTrigger } from "gsap/ScrollTrigger"

// gsap.registerPlugin(ScrollTrigger)

// export default function HomePage() {
//   const heroRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     if (!heroRef.current) return

//     ScrollTrigger.create({
//       trigger: heroRef.current,
//       start: "top top",
//       end: "+=300",          // lock for 300px scroll
//       pin: true,             // this pins the hero
//       pinSpacing: true,      // allows scroll to continue naturally
//       scrub: false,
//     })

//     return () => {
//       ScrollTrigger.getAll().forEach(t => t.kill())
//     }
//   }, [])
//   const expandBoxRef = useRef<HTMLDivElement>(null)

// useEffect(() => {
//   if (!expandBoxRef.current) return

//   const tl = gsap.timeline({
//     scrollTrigger: {
//       trigger: expandBoxRef.current,
//       start: "top bottom",
//       end: "top top",
//       scrub: true,
//     },
//   })

//   tl.fromTo(
//     expandBoxRef.current,
//     {
//       width: 620,
//       height: 220,
//       borderRadius: 24,
//       y: 120,
//     },
//     {
//       width: "100%",
//       height: "100vh",
//       borderRadius: 48,
//       y: 0,
//       ease: "none",
//     }
//   )

//   tl.to(
//     ".content",
//     {
//       opacity: 1,
//       stagger: 0.1,
//       ease: "none",
//     },
//     "-=0.2"
//   )
// }, [])


//   return (
//     <>
//       {/* ================= HERO SECTION ================= */}
//       <section
//         ref={heroRef}
//         className="relative w-full h-[800px] overflow-hidden flex items-center justify-center"
//       >
//         {/* Background Video */}
//         <video
//           className="absolute inset-0 w-full h-full object-cover"
//           src="/loop.mp4"
//           autoPlay
//           loop
//           muted
//           playsInline
//         />

//         {/* Overlay */}
//         <div className="absolute inset-0 bg-black/50" />

//         {/* Hero Content */}
//         <div className="relative z-10 text-center -mt-90">
//           <h1 className="text-[140px]   font-bold text-white">
//             AI4Planning
//           </h1>
//         </div>
//       </section>

//       {/* ================= CONTENT SECTION ================= */}
//       {/* ================= CONTENT SECTION ================= */}
// <section
//   id="expand-section"
//   className="
//     relative z-10
//     min-h-screen
//     flex items-center justify-center
//     -mt-[200px]
//   "
// >
//   {/* EXPANDING BOX */}
//   <div
//     ref={expandBoxRef}
//     className="
//       bg-[#050B18]
//       w-[320px] h-[220px]
//       rounded-2xl
//       shadow-2xl
//       overflow-hidden
//       px-10 py-24
//       flex flex-col items-center justify-start
//     "
//   >
//     <h2 className="text-4xl text-center text-white font-bold mb-16 opacity-0 content">
//       Intelligent Planning Starts Here
//     </h2>

//     <div className="relative w-full max-w-7xl mx-auto h-[800px] overflow-hidden rounded-2xl shadow-xl opacity-0 content">
//       <video
//         className="absolute inset-0 w-full h-full object-cover"
//         src="/blueprinttobuilding.mp4"
//         autoPlay
//         loop
//         muted
//         playsInline
//       />
//       <div className="absolute inset-0 bg-black/20" />
//     </div>
//   </div>
// </section>

//     </>
//   )
// }

"use client"
 
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
 
gsap.registerPlugin(ScrollTrigger)
 
export default function LandorScene() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const pushRef = useRef<HTMLDivElement>(null)
 
  useEffect(() => {
    if (!sceneRef.current || !pushRef.current) return
 
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pushRef.current,
        {
          yPercent: 100,
          scale: 0.95,
        },
        {
          yPercent: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sceneRef.current,
            start: "top top",
            end: "+=150%",
            scrub: true,
            pin: true,
          },
        }
      )
    }, sceneRef)
 
    return () => ctx.revert()
  }, [])
 
  return (
    <>
      {/* ===== PINNED LANDOR SCENE ===== */}
      <section
        ref={sceneRef}
        className="relative h-screen z-50 overflow-hidden"
      >
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source
            src="https://cms.landor.com/media/q4xi5bvb/landor_water-bubble.mp4"
            type="video/mp4"
          />
        </video>
 
        {/* AI4Planning TEXT */}
        <div className="relative z-20 flex h-full items-center justify-center ">
 
          <h1 className="fixed top-0 text-white text-[10vw] font-bold tracking-tight mt-10">
            AI4Planning
          </h1>
        </div>
 
        {/* PUSH-UP SECTION */}
        <div
          ref={pushRef}
          className="absolute inset-0 z-30  bg-white flex items-center justify-center mt-72"
        >
          <div className="max-w-4xl  text-center px-6 mt-24">
            <h2 className="text-5xl font-semibold mb-6">
              Next Section
            </h2>
 
            <div className="mx-auto w-full overflow-hidden rounded-2xl shadow-xl">
              <video
                className="w-full h-auto object-cover"
                src="https://cms.landor.com/media/q4xi5bvb/landor_water-bubble.mp4"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}