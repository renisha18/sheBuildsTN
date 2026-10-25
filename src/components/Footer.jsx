import logo from '../assets/logo.jpeg'
import { sections, scrollToSection } from '../siteSections.js'
import BlockGame from './BlockGame.jsx'
import SocialLinks from './SocialLinks.jsx'

const navLinkClass =
  'rounded-sm font-body font-bold text-ink underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'

function Footer() {
  // Real #anchors work without JS; with JS we smooth-scroll like the navbar does
  const go = (e, id) => {
    e.preventDefault()
    scrollToSection(id)
  }

  return (
    <footer className="border-t-2 border-ink bg-background">
      {/* Below lg the left column is display: contents, so its items and the game form one stack
          (© moved last via order). On lg it becomes a real column beside the game. */}
      <div className="flex flex-col items-start gap-6 px-6 py-10 md:px-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:items-start lg:gap-5">
          <a
            href="#home"
            onClick={(e) => go(e, 'home')}
            className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {/* Logo PNG has a white background; multiply blends it into the page color */}
            <img src={logo} alt="SheBuilds home" className="h-12 w-auto mix-blend-multiply" />
          </a>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {sections.map(({ id, label }) => (
                <li key={id}>
                  <a href={`#${id}`} onClick={(e) => go(e, id)} className={navLinkClass}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Same style as the Hero's "Join the community" button */}
          <a
            href="#join"
            onClick={(e) => go(e, 'join')}
            className="rounded-full border-2 border-ink bg-accent px-6 py-3 font-body font-semibold text-ink shadow-brutal transition motion-reduce:transition-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-brutal-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Join the community <span aria-hidden="true">→</span>
          </a>

          <SocialLinks lift />

          <p className="order-last w-full border-t border-muted/30 pt-4 font-body text-sm text-muted lg:order-none">
            © SheBuilds Tamil Nadu - developed by Fathima Sameeha & Renisha Ensalaita
          </p>
        </div>

        <div className="self-center lg:shrink-0">
          <BlockGame />
        </div>
      </div>
    </footer>
  )
}

export default Footer
