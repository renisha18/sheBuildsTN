import { useCallback, useEffect, useRef, useState } from 'react'
import EventCard from './EventCard.jsx'
import { prefersReducedMotion } from '../../siteSections.js'

const arrowClass = [
  'grid h-10 w-10 shrink-0 place-items-center rounded-sm border-2 border-ink bg-surface text-ink shadow-brutal-sm md:h-14 md:w-14',
  'transition motion-reduce:transition-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  'hover:bg-accent-alt/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
  // aria-disabled (not disabled) so keyboard focus stays on the arrow when it reaches the end
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-surface',
  'aria-disabled:active:translate-x-0 aria-disabled:active:translate-y-0 aria-disabled:active:shadow-brutal-sm',
].join(' ')

function Arrow({ direction }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      {direction === 'prev' ? <path d="M19 12H5M11 6l-6 6 6 6" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
    </svg>
  )
}

// Scroll-snap carousel: 1 card per view on mobile, 2 on tablet, 3 on desktop.
// The parent remounts it (via key) when filters change, which resets it to the first slide.
export default function EventCarousel({ events }) {
  const trackRef = useRef(null)
  const [start, setStart] = useState(0) // index of the first visible card
  const [perView, setPerView] = useState(1)
  // Card a smooth scroll is heading to. `start` only updates once the scroll lands, so quick
  // repeated presses step from here instead (otherwise five fast clicks would only move one card).
  const targetRef = useRef(null)
  const settleTimer = useRef(0)

  const slideWidth = () => trackRef.current?.firstElementChild?.offsetWidth || 1

  // Read the current position from the scroll offset, so swipes, arrows, and dots all stay in sync
  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const w = slideWidth()
    setPerView(Math.max(1, Math.round(track.clientWidth / w)))
    setStart(Math.round(track.scrollLeft / w))
  }, [])

  useEffect(() => {
    const track = trackRef.current
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    measure()
    const onScrollEnd = () => (targetRef.current = null)
    track.addEventListener('scroll', onScroll, { passive: true })
    track.addEventListener('scrollend', onScrollEnd)
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(settleTimer.current)
      track.removeEventListener('scroll', onScroll)
      track.removeEventListener('scrollend', onScrollEnd)
      observer.disconnect()
    }
  }, [measure])

  const maxStart = Math.max(0, events.length - perView)
  const canScroll = events.length > perView

  const current = () => targetRef.current ?? start

  const goTo = (index) => {
    const target = Math.min(Math.max(index, 0), maxStart)
    targetRef.current = target
    // Fallback for browsers without the scrollend event
    clearTimeout(settleTimer.current)
    settleTimer.current = setTimeout(() => (targetRef.current = null), 700)
    trackRef.current.scrollTo({
      left: target * slideWidth(),
      behavior: prefersReducedMotion() ? 'instant' : 'smooth',
    })
  }

  const onKeyDown = (e) => {
    const moves = { ArrowLeft: current() - 1, ArrowRight: current() + 1, Home: 0, End: maxStart }
    if (!(e.key in moves)) return
    e.preventDefault()
    goTo(moves[e.key])
  }

  const lastVisible = Math.min(start + perView, events.length)

  const atStart = start <= 0
  const atEnd = start >= maxStart

  // Mobile: track on top, then [prev] dots [next] in one row so the card gets the full width.
  // md+: arrows sit on either side of the track, dots wrap onto their own row below.
  // DOM order (track, prev, dots, next) matches the mobile visual order so Tab follows what you see.
  return (
    <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-4 md:gap-x-6">
      {/* Track: focusable so ←/→/Home/End work once it has focus */}
      <div
        id="events-track"
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Events"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="relative order-1 flex min-w-0 basis-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain py-2 scrollbar-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink md:order-2 md:basis-0 md:flex-1"
      >
        {events.map((event, i) => (
          <div
            key={event.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${events.length}`}
            // Padding (not gap) spaces the cards so each slide is exactly 1/n of the track; pr leaves room for the shadow
            className="flex w-full shrink-0 snap-start px-2 pb-2 pr-3 md:w-1/2 xl:w-1/3"
          >
            <EventCard event={event} />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous events"
        aria-controls="events-track"
        aria-disabled={atStart}
        onClick={() => goTo(current() - 1)}
        className={`order-2 md:order-1 ${arrowClass} ${canScroll ? '' : 'invisible'}`}
      >
        <Arrow direction="prev" />
      </button>

      <div className="order-3 flex min-w-0 flex-1 justify-center gap-0.5 md:order-4 md:basis-full md:gap-1">
        {canScroll &&
          events.map((event, i) => {
            const visible = i >= start && i < lastVisible
            return (
              <button
                key={event.id}
                type="button"
                aria-label={`Go to ${event.title}`}
                aria-current={visible ? 'true' : undefined}
                aria-controls="events-track"
                onClick={() => goTo(i)}
                className="rounded-full p-1.5 focus-visible:outline-2 focus-visible:outline-ink"
              >
                <span
                  className={`block h-2 w-5 rounded-full transition-colors motion-reduce:transition-none md:w-8 ${
                    visible ? 'bg-accent-alt' : 'bg-muted/30'
                  }`}
                />
              </button>
            )
          })}
      </div>
      <button
        type="button"
        aria-label="Next events"
        aria-controls="events-track"
        aria-disabled={atEnd}
        onClick={() => goTo(current() + 1)}
        className={`order-4 md:order-3 ${arrowClass} ${canScroll ? '' : 'invisible'}`}
      >
        <Arrow direction="next" />
      </button>

      <p className="sr-only" aria-live="polite">
        Showing events {start + 1}–{lastVisible} of {events.length}
      </p>

    </div>
  )
}
