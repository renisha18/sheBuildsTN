import { useEffect, useRef } from 'react'
import { COLS, ROWS, SHAPES, TARGET_ROWS, useBlockGame } from './useBlockGame.js'
import './BlockGame.css'

const REPEAT_DELAY_MS = 220
const REPEAT_MS = 70

const btnClass = [
  'inline-flex min-h-11 flex-1 items-center justify-center rounded-full border-2 border-ink bg-surface px-2 font-body text-sm font-semibold text-ink shadow-brutal-sm',
  'transition motion-reduce:transition-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
].join(' ')

const startBtnClass = [
  'inline-flex min-h-10 items-center justify-center rounded-full border-2 border-ink bg-ink px-5 font-body text-sm font-semibold text-surface shadow-brutal-sm',
  'transition motion-reduce:transition-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
].join(' ')

const OVERLAY = {
  idle: { title: `Clear ${TARGET_ROWS} rows to win`, action: 'Start' },
  won: { title: 'You built it!', action: 'Play again' },
  lost: { title: 'Board full. Try again', action: 'Play again' },
}

// Short footer game: clear TARGET_ROWS rows to win; losing when a new block can't spawn.
function BlockGame() {
  const boardRef = useRef(null)
  const repeatRef = useRef(null)
  const actionRef = useRef(null)
  const { board, piece, clearing, status, rowsCleared, score, best, message, move, drop, start } = useBlockGame(boardRef)

  useEffect(() => () => clearTimeout(repeatRef.current), [])

  // Focus follows the game: board when play starts, overlay button when it ends
  const prevStatus = useRef(status)
  useEffect(() => {
    const prev = prevStatus.current
    prevStatus.current = status
    if (prev === status) return
    if (status === 'playing') boardRef.current?.focus({ preventScroll: true })
    else if (status !== 'idle') actionRef.current?.focus({ preventScroll: true })
  }, [status])

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
    if (status !== 'playing') {
      // Enter/Space on the board starts; on the overlay button they already click it
      if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
        e.preventDefault()
        start()
      }
      return
    }
    const action = { ArrowLeft: () => move(-1), ArrowRight: () => move(1), ArrowDown: drop }[e.key]
    if (!action) return
    e.preventDefault()
    action()
  }

  const clearingRows = clearing?.rows ?? []
  const overlay = OVERLAY[status]

  return (
    <div className="block-game" style={{ '--cols': COLS, '--rows': ROWS }}>
      <div className="block-game__window">
        {/* Visual HUD; screen readers get the aria-live messages below instead */}
        <p className="block-game__titlebar font-display" aria-hidden="true">
          <span>Take a break</span>
          <span>
            Rows {Math.min(rowsCleared, TARGET_ROWS)}/{TARGET_ROWS} · <span className="block-game__score-label">Score </span>
            {score}
          </span>
        </p>
        <div
          ref={boardRef}
          tabIndex={0}
          role="application"
          aria-label={`Block puzzle: clear ${TARGET_ROWS} rows to win. Enter starts. Left and right arrows move the block, down arrow drops it faster.`}
          onKeyDown={onKeyDown}
          className="block-game__board"
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

          {overlay && (
            <div className="block-game__overlay">
              <div className="block-game__card">
                <p className="block-game__card-title font-display">{overlay.title}</p>
                {status !== 'idle' && (
                  <p className="font-body text-sm">
                    Score {score} · Best {best}
                  </p>
                )}
                <button ref={actionRef} type="button" onClick={start} className={startBtnClass}>
                  {overlay.action}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {message}
      </p>

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

      <p className="block-game__hint font-body text-xs text-muted">Click the board, then use arrow keys</p>
    </div>
  )
}

export default BlockGame
