import { useRef } from 'react'
import { useReveal } from '../hooks/useReveal.js'

// One full-height anchor target on the single scrolling page.
// tabIndex -1 lets nav clicks move keyboard focus here without making it a tab stop.
function PageSection({ id, revealOn = 'scroll', children }) {
  const ref = useRef(null)
  useReveal(ref, revealOn)

  return (
    <div id={id} ref={ref} tabIndex={-1} className="page-section outline-none">
      {children}
    </div>
  )
}

export default PageSection
