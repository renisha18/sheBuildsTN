import { SOCIAL_LINKS } from '../data/socialLinks.js'

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
  instagram: (
    <svg {...iconProps}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  linkedin: (
    <svg {...iconProps}>
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
      <path d="M10 21v-7a6 6 0 0 1 12 0v7h-4v-7a2 2 0 0 0-4 0v7Z" />
    </svg>
  ),
  mail: (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
}

// 44px round button: white, ink border, small hard shadow; light-teal hover and the press effect
// like the navbar pills
const linkBaseClass = [
  'grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-surface text-ink shadow-brutal-sm',
  'transition hover:bg-accent-alt/20',
  'active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
  'motion-reduce:transition-none',
].join(' ')

// The footer's buttons also lift 1px on hover
const LIFT_CLASS = 'hover:-translate-x-px hover:-translate-y-px motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0'

/**
 * The social icon links (data in src/data/socialLinks.js).
 * className  classes for the outer element
 * nav        true: the list inside <nav aria-label="Social media"> (the hero); false: just the list
 * lift       true: the 1px hover lift the footer uses
 */
export default function SocialLinks({ className = '', nav = false, lift = false }) {
  const linkClass = lift ? `${linkBaseClass} ${LIFT_CLASS}` : linkBaseClass

  const items = SOCIAL_LINKS.map(({ id, label, href }) => {
    // mailto opens the mail app; a target on it would leave a blank tab behind
    const isMail = href.startsWith('mailto:')
    return (
      <li key={id}>
        <a
          href={href}
          {...(isMail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
          aria-label={isMail ? `${label} SheBuilds` : `SheBuilds on ${label} (opens in a new tab)`}
          className={linkClass}
        >
          {SOCIAL_ICONS[id]}
        </a>
      </li>
    )
  })

  if (!nav) {
    return (
      <ul className={`flex flex-wrap gap-3 ${className}`.trim()} aria-label="SheBuilds on social media">
        {items}
      </ul>
    )
  }

  return (
    <nav aria-label="Social media" className={className || undefined}>
      <ul className="flex flex-wrap items-center gap-3">{items}</ul>
    </nav>
  )
}
