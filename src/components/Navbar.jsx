import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import logo from '../assets/logo.png'

const links = [
  { to: '/about', label: 'About' },
  { to: '/join', label: 'Join us' },
  { to: '/events', label: 'Events' },
  { to: '/blogs', label: 'Blogs' },
]

// 2px primary underline drawn by ::after, scaled in from the left on hover/focus; always shown when active
const linkClass = ({ isActive }) =>
  [
    'relative font-body transition-colors hover:text-primary focus-visible:text-primary',
    'after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:bg-primary',
    'after:origin-left after:transition-transform motion-reduce:after:transition-none',
    'hover:after:scale-x-100 focus-visible:after:scale-x-100',
    isActive ? 'text-primary after:scale-x-100' : 'text-ink after:scale-x-0',
  ].join(' ')

function Navbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <nav className="border-b border-ink">
      <div className="flex items-center justify-between px-12 py-4">
        <Link to="/" onClick={close} className="shrink-0">
          {/* Logo PNG has a white background; multiply blends it into the page color */}
          <img src={logo} alt="SheBuilds home" className="h-10 md:h-12 w-auto mix-blend-multiply" />
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink to={to} className={linkClass}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden font-body text-ink border-2 border-ink rounded-lg px-3 py-1 shadow-brutal-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open && (
        <ul id="mobile-nav" className="md:hidden flex flex-col gap-4 bg-surface border-t border-ink px-12 py-6">
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink to={to} onClick={close} className={linkClass}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}

export default Navbar
