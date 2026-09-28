import { Link, NavLink } from 'react-router'
import logo from '../assets/logo.png'

const links = [
  { to: '/about', label: 'About' },
  { to: '/join', label: 'Join us' },
  { to: '/events', label: 'Events' },
  { to: '/blogs', label: 'Blogs' },
]

function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-ink p-4">
      <Link to="/" className="shrink-0">
        {/* Logo PNG has a white background; multiply blends it into the page color */}
        <img src={logo} alt="SheBuilds home" className="h-12 md:h-16 w-auto mix-blend-multiply" />
      </Link>
      <ul className="flex gap-6">
        {links.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `font-body text-ink underline-offset-4 hover:underline ${isActive ? 'underline' : ''}`
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navbar
