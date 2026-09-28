function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border border-dashed m-4 p-8"
    >
      <div className="flex flex-col items-start gap-4">
        <h1 id="hero-heading" className="flex flex-col gap-1">
          <span className="text-primary font-bold leading-none text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
            SheBuilds
          </span>
          <span className="text-ink font-normal uppercase leading-tight text-2xl md:text-3xl lg:text-4xl">
            Tamilnadu
          </span>
        </h1>
        <p className="font-body text-muted text-base md:text-lg">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <button type="button" className="border px-4 py-2">
          Button
        </button>
      </div>
      <div
        role="img"
        aria-label="Character image placeholder"
        className="bg-gray-200 aspect-square w-full"
      />
    </section>
  )
}

export default Hero
