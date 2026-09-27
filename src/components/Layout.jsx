import { Outlet } from 'react-router'
import Navbar from './Navbar.jsx'

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
