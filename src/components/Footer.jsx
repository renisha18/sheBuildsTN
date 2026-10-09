import logo from '../assets/logo.png'
import { sections, scrollToSection } from '../siteSections.js'
import BlockGame from './BlockGame.jsx'

// Verify the WhatsApp invite link: real invite URLs usually end in a random code.
const SOCIAL_LINKS = [
  { id: 'whatsapp',  label: 'WhatsApp',  href: 'https://chat.whatsapp.com/shebuilds' },
  { id: 'discord',   label: 'Discord',   href: 'https://discord.gg/shebuilds' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/shebuilds_chennai/' },
]

const iconProps = {
  'aria-hidden': true,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-5 w-5',
}

// Simple line icons, keyed by SOCIAL_LINKS id
const SOCIAL_ICONS = {
  whatsapp: (
    <svg {...iconProps}>
      <path d="M3.5 20.5 4.8 16A8.5 8.5 0 1 1 8 19.2Z" />
      <path d="M9 8.5c0 3.6 2.9 6.5 6.5 6.5l1-1.6-2-1-1 .8a4 4 0 0 1-1.7-1.7l.8-1-1-2Z" />
    </svg>
  ),
  discord: (
    <svg {...iconProps}>
      <path d="M8 6.5a13 13 0 0 1 8 0l1.2-1.3C19 6 20.6 9.5 21 15.3c-1.4 1.4-3 2.2-4.6 2.6l-1.1-1.8M8.7 16.1l-1.1 1.8C6 17.5 4.4 16.7 3 15.3 3.4 9.5 5 6 6.8 5.2Z" />
      <path d="M7.5 15.2c3 1.3 6 1.3 9 0" />
      <circle cx="9" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  instagram: (
    <svg {...iconProps}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
}

const navLinkClass =
  'rounded-sm font-body font-bold text-ink underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'

const socialClass = [
  'grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-surface text-ink shadow-brutal-sm',
  'transition hover:-translate-x-px hover:-translate-y-px hover:bg-accent-alt/20',
  'active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
  'motion-reduce:transition-none motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0',
].join(' ')

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

          <ul className="flex flex-wrap gap-3" aria-label="SheBuilds on social media">
            {SOCIAL_LINKS.filter(({ href }) => href).map(({ id, label, href }) => (
              <li key={id}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`SheBuilds on ${label} (opens in a new tab)`}
                  className={socialClass}
                >
                  {SOCIAL_ICONS[id]}
                </a>
              </li>
            ))}
          </ul>

          <p className="order-last w-full border-t border-muted/30 pt-4 font-body text-sm text-muted lg:order-none">
            © SheBuilds Tamil Nadu
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
