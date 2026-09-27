import { Link, NavLink } from 'react-router'

const links = [
  { to: '/about', label: 'About' },
  { to: '/join', label: 'Join us' },
  { to: '/events', label: 'Events' },
  { to: '/blogs', label: 'Blogs' },
]

function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b p-4">
      <Link to="/">SheBuilds Tamil Nadu</Link>
      <ul className="flex gap-6">
        {links.map(({ to, label }) => (
          <li key={to}>
            <NavLink to={to} className={({ isActive }) => (isActive ? 'underline' : '')}>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navbar
