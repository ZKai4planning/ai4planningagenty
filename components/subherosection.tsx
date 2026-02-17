export function SubHeroSection() {
  return (
    <section className="relative z-20 bg-white min-h-screen px-10 py-24">
      
      {/* Title */}
      <h2 className="text-4xl text-centerfont-bold mb-6">
        Intelligent Planning Starts Here
      </h2>

      {/* Video Section */}
      <div className="relative w-full max-w-6xl mx-auto h-[500px] overflow-hidden rounded-2xl shadow-xl">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/blueprinttobuilding.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Optional overlay */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

    </section>
  )
}
