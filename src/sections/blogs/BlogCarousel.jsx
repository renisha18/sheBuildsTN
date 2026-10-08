import { useCallback, useEffect, useRef, useState } from 'react'
import BlogCard from './BlogCard.jsx'
import { prefersReducedMotion } from '../../siteSections.js'

function Arrow({ direction }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="blogs__arrow-icon">
      {direction === 'prev' ? <path d="M19 12H5M11 6l-6 6 6 6" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
    </svg>
  )
}

// Scroll-snap carousel, same layout as EventCarousel: arrows either side on md+, below the track on mobile.
// The parent remounts it (via key) when filters change, which resets the scroll to the start.
export default function BlogCarousel({ posts }) {
  const trackRef = useRef(null)
  const [edges, setEdges] = useState({ atStart: true, atEnd: true, canScroll: false })

  // Edges come from the scroll offset, so swipes and arrows stay in sync
  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const max = track.scrollWidth - track.clientWidth
    setEdges({ atStart: track.scrollLeft <= 1, atEnd: track.scrollLeft >= max - 1, canScroll: max > 1 })
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

  const step = (dir) => {
    const track = trackRef.current
    const slide = track.firstElementChild?.offsetWidth || track.clientWidth
    track.scrollBy({ left: dir * slide, behavior: prefersReducedMotion() ? 'instant' : 'smooth' })
  }

  const hidden = edges.canScroll ? '' : ' is-hidden'

  return (
    <div className="blogs__carousel">
      <div id="blogs-track" ref={trackRef} role="region" aria-label="Latest articles" className="blogs__track">
        {posts.map((post) => (
          <div key={post.id} className="blogs__slide">
            <BlogCard post={post} />
          </div>
        ))}
      </div>

      {/* aria-disabled (not disabled) so keyboard focus stays on the arrow at the ends, as in Events */}
      <button
        type="button"
        aria-label="Previous articles"
        aria-controls="blogs-track"
        aria-disabled={edges.atStart}
        onClick={() => !edges.atStart && step(-1)}
        className={`blogs__nav blogs__nav--prev${hidden}`}
      >
        <Arrow direction="prev" />
      </button>
      <button
        type="button"
        aria-label="Next articles"
        aria-controls="blogs-track"
        aria-disabled={edges.atEnd}
        onClick={() => !edges.atEnd && step(1)}
        className={`blogs__nav blogs__nav--next${hidden}`}
      >
        <Arrow direction="next" />
      </button>
    </div>
  )
}
