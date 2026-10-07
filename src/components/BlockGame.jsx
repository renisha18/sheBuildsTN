import { useEffect, useRef } from 'react'
import { COLS, ROWS, SHAPES, useBlockGame } from './useBlockGame.js'
import './BlockGame.css'

const REPEAT_DELAY_MS = 220
const REPEAT_MS = 70

const btnClass = [
  'inline-flex min-h-11 flex-1 items-center justify-center rounded-full border-2 border-ink bg-surface px-2 font-body text-sm font-semibold text-ink shadow-brutal-sm',
  'transition motion-reduce:transition-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
].join(' ')

// Small falling-block Easter egg for the footer. No score, no game over.
function BlockGame() {
  const boardRef = useRef(null)
  const repeatRef = useRef(null)
  const { board, piece, clearing, move, drop } = useBlockGame(boardRef)

  useEffect(() => () => clearTimeout(repeatRef.current), [])

  const stopRepeat = () => clearTimeout(repeatRef.current)
  // Fires once, then repeats while the button is held
  const startRepeat = (action) => {
    stopRepeat()
    action()
    const loop = (delay) => {
      repeatRef.current = setTimeout(() => {
        action()
        loop(REPEAT_MS)
      }, delay)
    }
    loop(REPEAT_DELAY_MS)
  }

  const controls = [
    { label: 'Left', aria: 'Move block left', action: () => move(-1) },
    { label: 'Drop', aria: 'Drop block faster', action: drop },
    { label: 'Right', aria: 'Move block right', action: () => move(1) },
  ]

  // Only fires while the board has focus, so page scrolling is untouched otherwise
  const onKeyDown = (e) => {
    const action = { ArrowLeft: () => move(-1), ArrowRight: () => move(1), ArrowDown: drop }[e.key]
    if (!action) return
    e.preventDefault()
    action()
  }

  const clearingRows = clearing?.kind === 'rows' ? clearing.rows : []

  return (
    <div className="block-game">
      <div
        ref={boardRef}
        tabIndex={0}
        role="application"
        aria-label="Block puzzle. Left and right arrows move the block, down arrow drops it faster."
        onKeyDown={onKeyDown}
        className={`block-game__board${clearing?.kind === 'reset' ? ' is-resetting' : ''}`}
        style={{ '--cols': COLS, '--rows': ROWS }}
      >
        <div className="block-game__well" aria-hidden="true">
          {board.map((cells, r) =>
            cells.map((shape, c) => (
              <span
                key={`${r}-${c}`}
                className={`block-game__cell${clearingRows.includes(r) ? ' is-clearing' : ''}`}
                data-shape={shape ?? undefined}
              />
            )),
          )}
          {piece && (
            <div key={piece.id} className="block-game__piece" style={{ '--row': piece.row, '--col': piece.col }}>
              {SHAPES[piece.shape].map(([r, c]) => (
                <span key={`${r}-${c}`} className="block-game__cell" data-shape={piece.shape} style={{ '--r': r, '--c': c }} />
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="block-game__hint font-body text-xs text-muted">Click the board, then use arrow keys</p>

      <div className="block-game__controls">
        {controls.map(({ label, aria, action }) => (
          <button
            key={label}
            type="button"
            aria-label={aria}
            className={btnClass}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture?.(e.pointerId)
              startRepeat(action)
            }}
            onPointerUp={stopRepeat}
            onPointerCancel={stopRepeat}
            onLostPointerCapture={stopRepeat}
            onContextMenu={(e) => e.preventDefault()}
            // Keyboard activation (Enter/Space) arrives as a click with detail 0
            onClick={(e) => e.detail === 0 && action()}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default BlockGame
