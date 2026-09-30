// Decorative sticker badges that straddle the hero frame's border.
// Sizes, stroke, shadow and animation are tuned via CSS variables in src/index.css ("Hero frame + badges").

const icons = {
  code: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />,
  braces: (
    <path d="M8 4c-2 0-3 1-3 3v2c0 1.5-1 2.5-2 3 1 .5 2 1.5 2 3v2c0 2 1 3 3 3M16 4c2 0 3 1 3 3v2c0 1.5 1 2.5 2 3-1 .5-2 1.5-2 3v2c0 2-1 3-3 3" />
  ),
  terminal: <path d="M4 7l5 5-5 5M12 18h8" />,
  branch: (
    <>
      <circle cx="6" cy="5" r="2.5" />
      <circle cx="6" cy="19" r="2.5" />
      <circle cx="18" cy="7" r="2.5" />
      <path d="M6 7.5v9M18 9.5c0 4-4 5-9.5 7.5" />
    </>
  ),
  sigma: <path d="M18 5H6l6 7-6 7h12" />,
  network: (
    <>
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="18" r="2.5" />
      <circle cx="19" cy="18" r="2.5" />
      <path d="M10.8 7.2l-4.6 8.6M13.2 7.2l4.6 8.6M7.5 18h9" />
    </>
  ),
}

// Positions are % along the frame; the badge is centered on that point so it sits half in, half out.
// Every shape + color pair is unique. `hideSm` badges drop out on small screens.
const badges = [
  { shape: 'square', color: 'teal', icon: 'code', top: '0%', left: '17%', delay: '0s' },
  { shape: 'pill', color: 'maroon', icon: 'terminal', top: '0%', left: '64%', delay: '-1.4s' },
  { shape: 'circle', color: 'coral', icon: 'branch', top: '27%', left: '100%', delay: '-2.6s' },
  { shape: 'hexagon', color: 'red', icon: 'sigma', top: '76%', left: '100%', delay: '-0.7s', hideSm: true },
  { shape: 'squircle', color: 'cream', icon: 'network', top: '100%', left: '81%', delay: '-3.3s' },
  { shape: 'diamond', color: 'coral', icon: 'braces', top: '100%', left: '36%', delay: '-2s', hideSm: true },
  { shape: 'circle', color: 'maroon', icon: 'code', top: '61%', left: '0%', delay: '-1s' },
]

function HeroBadges() {
  return (
    <div aria-hidden="true" className="hero-badges">
      {badges.map(({ shape, color, icon, top, left, delay, hideSm }, i) => (
        <span
          key={i}
          className={`hero-badge hero-badge--${color}${hideSm ? ' hero-badge--hide-sm' : ''}`}
          style={{ top, left, animationDelay: delay }}
        >
          <span className={`hero-badge__shape hero-badge__shape--${shape}`}>
            {shape === 'hexagon' && (
              <svg className="hero-badge__hex" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon points="26,3 74,3 97,50 74,97 26,97 3,50" />
              </svg>
            )}
            <svg
              className="hero-badge__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {icons[icon]}
            </svg>
          </span>
        </span>
      ))}
    </div>
  )
}

export default HeroBadges
