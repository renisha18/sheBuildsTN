import { useEffect, useState } from 'react'
import './JoinPuzzle.css'

// One puzzle cell is a 380 x 320 box. The piece itself is drawn slightly
// smaller inside it, so neighbouring pieces end up GAP apart (the cream
// seam). Every outline is built by piecePath(), so the knob on one piece
// always fits the socket on its neighbour. Edit these numbers to restyle.
const W = 380
const H = 320
const GAP = 14 // cream seam between pieces, in drawing units
const CORNER = 6 // corner radius: small = sharp, 22 = soft
const HEAD = 38 // radius of a knob's round head (bigger = bolder knob)
const NECK = 17 // half the width of the narrowest part of a knob's neck
const FILLET = 20 // radius of the small curves where the neck meets the edge
const MOUTH = FILLET - GAP // radius of the small rounding at the mouth of a socket
// Distance from a knob's neck-curve centres to its middle, and from the piece
// edge to the middle of its round head (worked out so all the curves touch
// exactly, which is what keeps the shapes crisp).
const INSET = GAP / 2
const FILLET_X = NECK + FILLET
const HEAD_CENTRE = FILLET + Math.sqrt((HEAD + FILLET) ** 2 - FILLET_X ** 2)

// Each edge is 'flat', 'knob' (bulges out) or 'socket' (dents in).
// The four pieces of the 2 x 2 puzzle, in reading order. bodyBottom, artBottom
// and artWidth (percent of the piece) place the text and the character when
// there is character art. Without art the text is centred in the piece, and
// textLeft / textRight keep it clear of that piece's socket. Knobs and sockets
// are paired so neighbours lock together: 1 right knob -> 2 left socket,
// 1 bottom socket <- 3 top knob, 2 bottom knob -> 4 top socket,
// 3 right socket <- 4 left knob.
const SLOTS = [
  { edges: { top: 'flat', right: 'knob', bottom: 'socket', left: 'flat' }, art: 'left', anchor: 'top', bodyBottom: 20, artBottom: 58, artWidth: 40, textLeft: 8, textRight: 8 },
  { edges: { top: 'flat', right: 'flat', bottom: 'knob', left: 'socket' }, art: 'right', anchor: 'top', bodyBottom: 9, artBottom: 56, artWidth: 40, textLeft: 34, textRight: 8 },
  { edges: { top: 'knob', right: 'socket', bottom: 'flat', left: 'flat' }, art: 'left', anchor: 'bottom', bodyBottom: 9, artBottom: 56, artWidth: 36, textLeft: 8, textRight: 34 },
  { edges: { top: 'socket', right: 'flat', bottom: 'flat', left: 'knob' }, art: 'right', anchor: 'bottom', bodyBottom: 9, artBottom: 56, artWidth: 40, textLeft: 8, textRight: 8 },
]
const FLAT = { top: 'flat', right: 'flat', bottom: 'flat', left: 'flat' }

// Walks the outline clockwise. Outward is always on the left of the direction
// of travel, so a knob is a bulge to the left and a socket a dent to the right.
// A knob is a round head on a narrow neck, joined to the edge by two small
// curves that touch the head and the edge exactly. A socket is the neighbour's
// knob made GAP bigger all round, so the seam between the two has an even width.
function piecePath({ top, right, bottom, left }) {
  const w = W - 2 * INSET // the piece itself, inside its cell
  const h = H - 2 * INSET
  const edges = [
    { type: top, start: [CORNER, 0], d: [1, 0], n: [0, -1], len: w - 2 * CORNER },
    { type: right, start: [w, CORNER], d: [0, 1], n: [1, 0], len: h - 2 * CORNER },
    { type: bottom, start: [w - CORNER, h], d: [-1, 0], n: [0, 1], len: w - 2 * CORNER },
    { type: left, start: [0, h - CORNER], d: [0, -1], n: [-1, 0], len: h - 2 * CORNER },
  ]
  const f = (v) => Math.round(v * 100) / 100
  // (along the edge, out from the edge) -> a point on the drawing
  const pt = (e, along, out) =>
    [e.start[0] + e.d[0] * along + e.n[0] * out, e.start[1] + e.d[1] * along + e.n[1] * out]
      .map(f)
      .join(' ')

  // Knob: where each neck curve touches the round head.
  const touch = FILLET / (HEAD + FILLET)
  const knobTouchX = -FILLET_X + FILLET_X * touch
  const knobTouchOut = FILLET + (HEAD_CENTRE - FILLET) * touch

  // Socket: a circle GAP bigger than the head, with a tiny rounding at its mouth.
  const socketHead = HEAD + GAP
  const socketCentre = HEAD_CENTRE - GAP
  const mouthX = Math.sqrt((socketHead + MOUTH) ** 2 - (socketCentre - MOUTH) ** 2)
  const mouthTouch = MOUTH / (socketHead + MOUTH)
  const socketTouchX = -mouthX + mouthX * mouthTouch
  const socketTouchOut = -MOUTH - (socketCentre - MOUTH) * mouthTouch

  let d = `M ${CORNER} 0`
  edges.forEach((e, i) => {
    const mid = e.len / 2
    if (e.type === 'knob') {
      d +=
        ` L ${pt(e, mid - FILLET_X, 0)}` +
        ` A ${FILLET} ${FILLET} 0 0 0 ${pt(e, mid + knobTouchX, knobTouchOut)}` +
        ` A ${HEAD} ${HEAD} 0 1 1 ${pt(e, mid - knobTouchX, knobTouchOut)}` +
        ` A ${FILLET} ${FILLET} 0 0 0 ${pt(e, mid + FILLET_X, 0)}`
    } else if (e.type === 'socket') {
      d +=
        ` L ${pt(e, mid - mouthX, 0)}` +
        ` A ${MOUTH} ${MOUTH} 0 0 1 ${pt(e, mid + socketTouchX, socketTouchOut)}` +
        ` A ${socketHead} ${socketHead} 0 1 0 ${pt(e, mid - socketTouchX, socketTouchOut)}` +
        ` A ${MOUTH} ${MOUTH} 0 0 1 ${pt(e, mid + mouthX, 0)}`
    }
    d += ` L ${pt(e, e.len, 0)}`
    d += ` A ${CORNER} ${CORNER} 0 0 1 ${edges[(i + 1) % 4].start.join(' ')}`
  })
  return `${d} Z`
}

// True from 768px up, where the pieces interlock in a 2 x 2 grid. Below that
// they stack as separate, flat-edged pieces.
function useInterlock() {
  const query = '(min-width: 768px)'
  const [wide, setWide] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setWide(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return wide
}

/**
 * cards: [{ id, tag, question, cta, href, color, art?, artAlt? }]
 *   color  any CSS color for the piece (use the colors of your Join us cards)
 *   art    optional: a transparent waist-up illustration (webp/png). Its top
 *          pokes out above the piece. If no card has art, no character
 *          space is reserved at all.
 */
export default function JoinPuzzle({ cards }) {
  const interlock = useInterlock()
  const hasArt = cards.some((card) => card.art)

  return (
    <ul className={hasArt ? 'puzzle' : 'puzzle puzzle--no-art'}>
      {cards.map((card, i) => {
        const slot = SLOTS[i % SLOTS.length]
        const edges = interlock ? slot.edges : FLAT
        return (
          <li
            key={card.id}
            className={`puzzle__item puzzle__item--art-${slot.art} puzzle__item--${slot.anchor}`}
            style={{
              '--piece-color': card.color,
              '--body-bottom': `${slot.bodyBottom}%`,
              '--art-bottom': `${slot.artBottom}%`,
              '--art-width': `${slot.artWidth}%`,
              '--text-left': `${slot.textLeft}%`,
              '--text-right': `${slot.textRight}%`,
            }}
          >
            <div className="puzzle__piece">
              <svg
                className="puzzle__shape"
                viewBox={`0 0 ${W} ${H}`}
                aria-hidden="true"
                focusable="false"
              >
                <path d={piecePath(edges)} transform={`translate(${INSET} ${INSET})`} />
              </svg>

              {hasArt && (
                <div className="puzzle__art">
                  {card.art ? (
                    <img src={card.art} alt={card.artAlt ?? ''} loading="lazy" decoding="async" />
                  ) : (
                    <span className="puzzle__art-placeholder">Character art</span>
                  )}
                </div>
              )}

              <div className="puzzle__body">
                <p className="puzzle__tag">{card.tag}</p>
                <h3 className="puzzle__question">{card.question}</h3>
                <a
  className="puzzle__cta"
  href={card.href}
  {...(card.external && { target: '_blank', rel: 'noopener noreferrer' })}
>
  {card.cta} <span aria-hidden="true">→</span>
  {card.external && <span className="sr-only"> (opens in a new tab)</span>}
</a>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}