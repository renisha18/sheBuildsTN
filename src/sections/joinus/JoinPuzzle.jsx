import { useEffect, useState } from 'react'
import './JoinPuzzle.css'

// One puzzle cell is a 380 x 320 box. The piece itself is drawn slightly
// smaller inside it, so neighbouring pieces end up GAP apart (the cream
// seam). Every outline is built by piecePath(), so the knob on one piece
// always fits the socket on its neighbour. Edit these numbers to restyle.
const W = 380
const H = 320
const GAP = 10 // cream seam between pieces, in drawing units
const CORNER = 22 // rounded corner radius
const NECK = 13 // half the width of a knob's neck
const HEAD = 22 // radius of a knob's round head
const NECK_OUT = 12 // how far out the neck is, before the head starts
// Distance from the piece edge to the middle of a knob's head
const HEAD_CENTRE = NECK_OUT + Math.sqrt(HEAD * HEAD - NECK * NECK)

// Each edge is 'flat', 'knob' (bulges out) or 'socket' (dents in).
// The four pieces of the 2 x 2 puzzle, in reading order. bodyBottom, artBottom
// and artWidth (percent of the piece) place the text and the character when
// there is character art. Without art the text is centred in the piece, and
// textLeft / textRight keep it clear of that piece's socket. Knobs and sockets
// are paired so neighbours lock together: 1 right knob -> 2 left socket,
// 1 bottom socket <- 3 top knob, 2 bottom knob -> 4 top socket,
// 3 right socket <- 4 left knob.
const SLOTS = [
  { edges: { top: 'flat', right: 'knob', bottom: 'socket', left: 'flat' }, art: 'left', bodyBottom: 20, artBottom: 58, artWidth: 40, textLeft: 8, textRight: 8 },
  { edges: { top: 'flat', right: 'flat', bottom: 'knob', left: 'socket' }, art: 'right', bodyBottom: 9, artBottom: 56, artWidth: 40, textLeft: 21, textRight: 8 },
  { edges: { top: 'knob', right: 'socket', bottom: 'flat', left: 'flat' }, art: 'left', bodyBottom: 9, artBottom: 56, artWidth: 36, textLeft: 8, textRight: 21 },
  { edges: { top: 'socket', right: 'flat', bottom: 'flat', left: 'knob' }, art: 'right', bodyBottom: 9, artBottom: 56, artWidth: 40, textLeft: 8, textRight: 8 },
]
const FLAT = { top: 'flat', right: 'flat', bottom: 'flat', left: 'flat' }

// Walks the outline clockwise. Outward is always on the left of the direction
// of travel, so a knob is a bulge to the left and a socket a dent to the right.
// A socket is the neighbour's knob made GAP bigger all round, so the seam
// between the two pieces has an even width.
function piecePath({ top, right, bottom, left }) {
  const w = W - 2 * GAP // the piece itself, inside its cell
  const h = H - 2 * GAP
  const edges = [
    { type: top, start: [CORNER, 0], d: [1, 0], n: [0, -1], len: w - 2 * CORNER },
    { type: right, start: [w, CORNER], d: [0, 1], n: [1, 0], len: h - 2 * CORNER },
    { type: bottom, start: [w - CORNER, h], d: [-1, 0], n: [0, 1], len: w - 2 * CORNER },
    { type: left, start: [0, h - CORNER], d: [0, -1], n: [-1, 0], len: h - 2 * CORNER },
  ]
  const f = (v) => Math.round(v * 100) / 100
  const pt = (e, along, out) =>
    [e.start[0] + e.d[0] * along + e.n[0] * out, e.start[1] + e.d[1] * along + e.n[1] * out]
      .map(f)
      .join(' ')

  const socketHead = HEAD + GAP
  const socketCentre = HEAD_CENTRE - GAP
  const socketMouth = 3
  const socketHalf = Math.sqrt(socketHead ** 2 - (socketCentre - socketMouth) ** 2)

  let d = `M ${CORNER} 0`
  edges.forEach((e, i) => {
    const mid = e.len / 2
    if (e.type === 'knob') {
      d +=
        ` L ${pt(e, mid - 30, 0)}` +
        ` C ${pt(e, mid - 20, 0)} ${pt(e, mid - NECK, 2)} ${pt(e, mid - NECK, NECK_OUT)}` +
        ` A ${HEAD} ${HEAD} 0 1 1 ${pt(e, mid + NECK, NECK_OUT)}` +
        ` C ${pt(e, mid + NECK, 2)} ${pt(e, mid + 20, 0)} ${pt(e, mid + 30, 0)}`
    } else if (e.type === 'socket') {
      d +=
        ` L ${pt(e, mid - socketHalf - 14, 0)}` +
        ` C ${pt(e, mid - socketHalf - 6, 0)} ${pt(e, mid - socketHalf - 1, 0)} ${pt(e, mid - socketHalf, -socketMouth)}` +
        ` A ${socketHead} ${socketHead} 0 1 0 ${pt(e, mid + socketHalf, -socketMouth)}` +
        ` C ${pt(e, mid + socketHalf + 1, 0)} ${pt(e, mid + socketHalf + 6, 0)} ${pt(e, mid + socketHalf + 14, 0)}`
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
            className={`puzzle__item puzzle__item--art-${slot.art}`}
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
                <path d={piecePath(edges)} transform={`translate(${GAP} ${GAP})`} />
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
                <a className="puzzle__cta" href={card.href}>
                  {card.cta} <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
