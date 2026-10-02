import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import logo from '../assets/logo.png'
import { sections, scrollToSection } from '../siteSections.js'

// Each link is its own brutal pill button: teal when active, white otherwise; presses into its shadow
const linkClass = (isActive) =>
  [
    'inline-block rounded-full border-2 border-ink px-5 py-2 font-body text-ink shadow-brutal-sm',
    'transition motion-reduce:transition-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
    isActive ? 'bg-accent-alt' : 'bg-surface hover:bg-accent-alt/20 focus-visible:bg-accent-alt/20',
  ].join(' ')

function Navbar() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef(null)
  const sentinelRef = useRef(null)
  const buttonRef = useRef(null)
  const { pathname } = useLocation()

  // Publish the rendered navbar height as --nav-height (drives html scroll-padding-top and
  // section min-height). Measured, not hardcoded: it differs between desktop and mobile.
  // The mobile panel is absolutely positioned, so opening it doesn't change this.
  useLayoutEffect(() => {
    const nav = navRef.current
    const publish = () => document.documentElement.style.setProperty('--nav-height', `${nav.offsetHeight}px`)
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(nav)
    return () => observer.disconnect()
  }, [])

  // "Scrolled" state once a 20px sentinel at the top of the page leaves the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting))
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [])

  // Active section = whichever section crosses a thin band at the middle of the viewport.
  // Sections are at least a screen tall, so exactly one is always in the band.
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean)
    if (!els.length) return
    const inBand = new Set()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? inBand.add(e.target.id) : inBand.delete(e.target.id)))
        const current = sections.find((s) => inBand.has(s.id))
        if (!current) return
        setActive(current.id)
        if (window.location.hash !== `#${current.id}`) {
          history.replaceState(history.state, '', `#${current.id}`)
        }
      },
      { rootMargin: '-45% 0px -54% 0px' },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [pathname])

  // Escape closes the mobile menu and returns focus to the toggle
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Real #anchors work without JS; with JS we smooth-scroll and replace (not push) the hash
  const go = (e, id) => {
    e.preventDefault()
    setOpen(false)
    scrollToSection(id)
  }

  const renderLinks = () =>
    sections.map(({ id, label }) => (
      <li key={id}>
        <a href={`#${id}`} onClick={(e) => go(e, id)} aria-current={active === id ? 'true' : undefined} className={linkClass(active === id)}>
          {label}
        </a>
      </li>
    ))

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="absolute top-0 left-0 h-5 w-px pointer-events-none" />

      {/* Border is always 1px (transparent at rest) so the scrolled state causes no layout shift */}
      <nav
        ref={navRef}
        className={`sticky top-0 z-50 bg-background border-b transition motion-reduce:transition-none ${
          scrolled ? 'border-ink shadow-brutal-sm' : 'border-transparent'
        }`}
      >
        <div className="flex items-center justify-between px-12 py-4">
          <a href="#home" onClick={(e) => go(e, 'home')} className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
            {/* Logo PNG has a white background; multiply blends it into the page color */}
            <img src={logo} alt="SheBuilds home" className="h-10 md:h-12 w-auto mix-blend-multiply" />
          </a>

          <ul className="hidden navbar:flex items-center gap-3">{renderLinks()}</ul>

          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
            className="navbar:hidden font-body text-ink border-2 border-ink rounded-lg px-3 py-1 shadow-brutal-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>

        {/* Drops down over the page (absolute) so opening it doesn't push content */}
        {open && (
          <ul
            id="mobile-nav"
            className="navbar:hidden absolute inset-x-0 top-full flex flex-col items-start gap-3 bg-surface border-y border-ink px-12 py-6"
          >
            {renderLinks()}
          </ul>
        )}
      </nav>
    </>
  )
}

export default Navbar
