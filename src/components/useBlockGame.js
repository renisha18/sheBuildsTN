import { useCallback, useEffect, useReducer, useState } from 'react'

// Board size: change freely (COLS must be at least 4 so the I block fits)
export const COLS = 10
export const ROWS = 8

const GRAVITY_MS = 650
// Must match the animation durations in BlockGame.css
const CLEAR_MS = 260
const RESET_MS = 420

// Fixed orientation (no rotation). [row, col] offsets from the block's top-left corner.
export const SHAPES = {
  I: [[0, 0], [0, 1], [0, 2], [0, 3]],
  O: [[0, 0], [0, 1], [1, 0], [1, 1]],
  L: [[0, 0], [1, 0], [2, 0], [2, 1]],
  T: [[0, 0], [0, 1], [0, 2], [1, 1]],
  S: [[0, 1], [0, 2], [1, 0], [1, 1]],
  Z: [[0, 0], [0, 1], [1, 1], [1, 2]],
}
const SHAPE_KEYS = Object.keys(SHAPES)

const randomShape = () => SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)]

// ---------- Pure helpers. A board is ROWS x COLS of null | shape key. ----------

export const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null))

export function collides(board, shape, row, col) {
  return SHAPES[shape].some(([r, c]) => {
    const y = row + r
    const x = col + c
    return x < 0 || x >= COLS || y < 0 || y >= ROWS || board[y][x] !== null
  })
}

export function lockPiece(board, { shape, row, col }) {
  const next = board.map((cells) => cells.slice())
  for (const [r, c] of SHAPES[shape]) next[row + r][col + c] = shape
  return next
}

export const fullRows = (board) => board.flatMap((cells, i) => (cells.every(Boolean) ? [i] : []))

export function clearRows(board, rows) {
  const kept = board.filter((_, i) => !rows.includes(i))
  return [...Array.from({ length: rows.length }, () => Array(COLS).fill(null)), ...kept]
}

// ---------- State ----------

// Spawns centred on row 0: every shape is at most 4 wide and 3 tall, so it starts fully inside the grid.
// If the new block doesn't fit, the board is cleared: instantly, or after a fade (clearing.kind 'reset')
function spawn(state, board, shape, instant) {
  const width = Math.max(...SHAPES[shape].map(([, c]) => c)) + 1
  const col = Math.floor((COLS - width) / 2)
  if (collides(board, shape, 0, col)) {
    if (!instant) return { ...state, board, piece: null, clearing: { kind: 'reset', rows: [] } }
    board = emptyBoard()
  }
  return { ...state, board, clearing: null, piece: { shape, row: 0, col, id: state.nextId }, nextId: state.nextId + 1 }
}

// Randomness comes in through action.next so the reducer stays pure (StrictMode-safe)
function reducer(state, action) {
  const { board, piece, clearing } = state
  switch (action.type) {
    case 'move': {
      if (!piece || collides(board, piece.shape, piece.row, piece.col + action.dx)) return state
      return { ...state, piece: { ...piece, col: piece.col + action.dx } }
    }
    case 'down': {
      if (!piece) return state
      if (!collides(board, piece.shape, piece.row + 1, piece.col)) {
        return { ...state, piece: { ...piece, row: piece.row + 1 } }
      }
      const locked = lockPiece(board, piece)
      const rows = fullRows(locked)
      if (rows.length === 0) return spawn(state, locked, action.next, action.instant)
      if (action.instant) return spawn(state, clearRows(locked, rows), action.next, true)
      return { ...state, board: locked, piece: null, clearing: { kind: 'rows', rows } }
    }
    case 'finishClear': {
      if (!clearing) return state
      const next = clearing.kind === 'reset' ? emptyBoard() : clearRows(board, clearing.rows)
      return spawn(state, next, action.next, action.instant)
    }
    default:
      return state
  }
}

const init = () =>
  spawn({ board: emptyBoard(), piece: null, clearing: null, nextId: 0 }, emptyBoard(), randomShape(), true)

// boardRef: the board element. Gravity pauses while it's off-screen or the tab is hidden.
export function useBlockGame(boardRef) {
  const [state, dispatch] = useReducer(reducer, null, init)
  const [onScreen, setOnScreen] = useState(() => typeof IntersectionObserver === 'undefined')
  const [tabVisible, setTabVisible] = useState(() => document.visibilityState === 'visible')
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const el = boardRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [boardRef])

  useEffect(() => {
    const onChange = () => setTabVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const move = useCallback((dx) => dispatch({ type: 'move', dx }), [])
  const drop = useCallback(() => dispatch({ type: 'down', next: randomShape(), instant: reduced }), [reduced])

  const running = onScreen && tabVisible
  useEffect(() => {
    if (!running) return
    const id = setInterval(drop, GRAVITY_MS)
    return () => clearInterval(id)
  }, [running, drop])

  const { clearing } = state
  useEffect(() => {
    if (!clearing) return
    const id = setTimeout(
      () => dispatch({ type: 'finishClear', next: randomShape(), instant: reduced }),
      clearing.kind === 'reset' ? RESET_MS : CLEAR_MS,
    )
    return () => clearTimeout(id)
  }, [clearing, reduced])

  return { board: state.board, piece: state.piece, clearing, move, drop }
}
