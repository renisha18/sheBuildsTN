import HeroBadges from './HeroBadges.jsx'
import CharacterLoop from '../../components/CharacterLoop.jsx'
import '../../components/CharacterArt.css'

function Hero() {
  return (
    // Outer padding leaves room for badges to overhang the frame without clipping
    <section aria-labelledby="hero-heading" className="px-6 py-10 md:px-12 md:py-12">
      <div className="hero-frame grid grid-cols-1 lg:grid-cols-2 gap-x-8 items-center p-6 md:p-10 lg:p-14">
        <div className="flex flex-col items-start gap-4">
          <h1 id="hero-heading" className="flex flex-col gap-1" data-reveal>
            <span className="text-primary font-bold leading-none text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
              SheBuilds
            </span>
            <span className="text-ink font-normal uppercase leading-tight text-2xl md:text-3xl lg:text-4xl">
              Tamilnadu
            </span>
          </h1>
          <p className="font-body text-muted text-base md:text-lg" data-reveal>
           
          </p>
          <div data-reveal>
            <button
              type="button"
              className="font-body font-semibold text-ink bg-accent border-2 border-ink rounded-full px-6 py-3 shadow-brutal transition motion-reduce:transition-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-brutal-sm"
            >
              Join the community <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        {/* character-art keeps the slot's size and spacing; CharacterLoop fills it */}
        <div className="character-art" data-reveal>
          <CharacterLoop
            still="/character/builder-1100.webp"
            video="/character/builder-loop.webm"
            alt="Illustration of a young woman typing at a desk with a laptop, a plant and toy blocks"
            priority
          />
        </div>
        <HeroBadges />
      </div>
    </section>
  )
}

export default Hero
