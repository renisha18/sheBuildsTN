import { useCallback, useEffect, useRef, useState } from 'react'
import EventCard from './EventCard.jsx'
import { prefersReducedMotion } from '../../siteSections.js'

const arrowClass = [
  'grid h-10 w-10 shrink-0 place-items-center rounded-sm border-2 border-ink bg-surface text-ink shadow-brutal-sm md:h-14 md:w-14',
  'transition motion-reduce:transition-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  'hover:bg-accent-alt/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
  'disabled:pointer-events-none disabled:opacity-40',
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
    track.addEventListener('scroll', onScroll, { passive: true })
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => {
      cancelAnimationFrame(frame)
      track.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [measure])

  const maxStart = Math.max(0, events.length - perView)
  const canScroll = events.length > perView

  const goTo = (index) => {
    const target = Math.min(Math.max(index, 0), maxStart)
    trackRef.current.scrollTo({
      left: target * slideWidth(),
      behavior: prefersReducedMotion() ? 'instant' : 'smooth',
    })
  }

  const onKeyDown = (e) => {
    const moves = { ArrowLeft: start - 1, ArrowRight: start + 1, Home: 0, End: maxStart }
    if (!(e.key in moves)) return
    e.preventDefault()
    goTo(moves[e.key])
  }

  const lastVisible = Math.min(start + perView, events.length)

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3 md:gap-6">
        <button
          type="button"
          aria-label="Previous events"
          aria-controls="events-track"
          onClick={() => goTo(start - 1)}
          disabled={start <= 0}
          className={`${arrowClass} ${canScroll ? '' : 'invisible'}`}
        >
          <Arrow direction="prev" />
        </button>

        {/* Track: focusable so ←/→/Home/End work once it has focus */}
        <div
          id="events-track"
          ref={trackRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Events"
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="flex min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain py-2 scrollbar-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          {events.map((event, i) => (
            <div
              key={event.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${events.length}`}
              // Padding (not gap) spaces the cards so each slide is exactly 1/n of the track; pr leaves room for the shadow
              className="flex w-full shrink-0 snap-start px-2 pb-2 pr-3 md:w-1/2 lg:w-1/3"
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Next events"
          aria-controls="events-track"
          onClick={() => goTo(start + 1)}
          disabled={start >= maxStart}
          className={`${arrowClass} ${canScroll ? '' : 'invisible'}`}
        >
          <Arrow direction="next" />
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing events {start + 1}–{lastVisible} of {events.length}
      </p>

      {canScroll && (
        <div className="mt-6 flex justify-center gap-1">
          {events.map((event, i) => {
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
                  className={`block h-2 w-8 rounded-full transition-colors motion-reduce:transition-none ${
                    visible ? 'bg-accent-alt' : 'bg-muted/30'
                  }`}
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
