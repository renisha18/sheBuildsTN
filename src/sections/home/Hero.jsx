function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border border-dashed m-4 p-8"
    >
      <div className="flex flex-col items-start gap-4">
        <h1 id="hero-heading" className="font-display">Headline goes here</h1>
        <p>
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
