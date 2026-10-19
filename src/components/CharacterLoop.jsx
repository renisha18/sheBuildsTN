import { useEffect, useRef, useState } from 'react'
import './CharacterLoop.css'

// The loop only plays on desktop, for people who haven't asked for less
// motion, in browsers that can show a transparent WebM. Everyone else, and
// anyone whose video fails to load, sees the still image.
const DESKTOP = '(min-width: 1024px)'
const MOTION_OK = '(prefers-reduced-motion: no-preference)'

// Safari (and every browser on iPhone) can't show transparent WebM: it would
// draw a black box. So they keep the still image.
const IS_WEBKIT = typeof navigator !== 'undefined' && /Apple/.test(navigator.vendor || '')

function useMedia(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/**
 * still     the image shown when the loop can't play (required)
 * video     path to the transparent loop, e.g. "/character/builder-loop.webm"
 * alt       description of the picture (for the still image)
 * priority  true for the first thing on the page (Home); loads sooner
 */
export default function CharacterLoop({ still, video, alt, priority = false, className = '' }) {
  const wide = useMedia(DESKTOP)
  const motionOk = useMedia(MOTION_OK)
  const [failed, setFailed] = useState(false)
  const wrapRef = useRef(null)
  const videoRef = useRef(null)

  const showVideo = Boolean(video) && wide && motionOk && !IS_WEBKIT && !failed

  // Play while the character is on screen, pause when it isn't.
  useEffect(() => {
    if (!showVideo) return undefined
    const el = videoRef.current
    const wrap = wrapRef.current
    if (!el || !wrap) return undefined
    el.muted = true
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {})
        else el.pause()
      },
      { threshold: 0.1 },
    )
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [showVideo])

  // The video comes first so the stylesheet can hide the still image (the
  // sibling after it) once the video is actually playing.
  return (
    <div ref={wrapRef} className={`character-loop ${className}`.trim()}>
      {showVideo && (
        <video
          ref={videoRef}
          className="character-loop__video"
          src={video}
          muted
          loop
          autoPlay
          playsInline
          preload={priority ? 'auto' : 'metadata'}
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={(e) => {
            e.currentTarget.dataset.playing = 'true'
          }}
          onError={() => setFailed(true)}
        />
      )}
      <img
        className="character-loop__still"
        src={still}
        alt={alt}
        decoding="async"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
      />
    </div>
  )
}
