import logo from '../assets/logo.png'
import { sections, scrollToSection } from '../siteSections.js'

// ⚠️ PLACEHOLDER social links — the networks and URLs are not real yet.
// Add the real `href` for each one (and remove any that don't apply). With href: null the
// item renders as plain text, not a dead link.
const SOCIAL_LINKS = [
  { id: 'instagram', label: 'Instagram', href: null },
  { id: 'linkedin', label: 'LinkedIn', href: null },
  { id: 'x', label: 'X', href: null },
]

// Same pill as the navbar links (inactive state)
const pillClass = [
  'inline-block rounded-full border-2 border-ink bg-surface px-5 py-2 font-body text-ink shadow-brutal-sm',
  'transition motion-reduce:transition-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  'hover:bg-accent-alt/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
].join(' ')

function Footer() {
  // Real #anchors work without JS; with JS we smooth-scroll like the navbar does
  const go = (e, id) => {
    e.preventDefault()
    scrollToSection(id)
  }

  return (
    <footer className="border-t-2 border-ink bg-background">
      <div className="flex flex-col gap-8 px-6 py-10 md:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <a
            href="#home"
            onClick={(e) => go(e, 'home')}
            className="self-start rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {/* Logo PNG has a white background; multiply blends it into the page color */}
            <img src={logo} alt="SheBuilds home" className="h-12 w-auto mix-blend-multiply" />
          </a>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-3">
              {sections.map(({ id, label }) => (
                <li key={id}>
                  <a href={`#${id}`} onClick={(e) => go(e, id)} className={pillClass}>
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
            className="self-start rounded-full border-2 border-ink bg-accent px-6 py-3 font-body font-semibold text-ink shadow-brutal transition motion-reduce:transition-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-brutal-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:self-auto"
          >
            Join the community <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="flex flex-col gap-4 border-t border-muted/30 pt-6 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 font-body text-sm text-muted" aria-label="Social links (placeholder)">
            {SOCIAL_LINKS.map(({ id, label, href }) => (
              <li key={id}>
                {href ? (
                  <a href={href} className="text-ink underline underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                    {label}
                  </a>
                ) : (
                  <span>{label} (placeholder)</span>
                )}
              </li>
            ))}
          </ul>

          <p className="font-body text-sm text-muted">© SheBuilds Tamil Nadu</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
