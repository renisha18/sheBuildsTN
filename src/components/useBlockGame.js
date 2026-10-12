import { useCallback, useEffect, useReducer, useState } from 'react'

// Board size: change freely (COLS must be at least 4 so the I block fits)
export const COLS = 10
export const ROWS = 8

// Win by clearing this many rows in total
export const TARGET_ROWS = 5
// Points for rows cleared in one drop (index = rows); each row past 4 adds 300 more
export const ROW_SCORES = [0, 100, 300, 500, 800]

const GRAVITY_MS = 650
// Must match the animation duration in BlockGame.css
const CLEAR_MS = 260
const BEST_KEY = 'shebuilds-blocks-best'

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

// ---------- Pure helpers. A board is ROWS x COLS of null | shape key. ----------

export const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null))

export const rowScore = (n) => (n < ROW_SCORES.length ? ROW_SCORES[n] : ROW_SCORES[4] + (n - 4) * 300)

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

// Spawns centred on row 0: every shape is at most 4 wide and 3 tall, so it starts fully inside the grid
export const spawnCol = (shape) => Math.floor((COLS - (Math.max(...SHAPES[shape].map(([, c]) => c)) + 1)) / 2)

// Locks a piece and removes full rows: { board, cleared }
export function settle(board, piece) {
  const locked = lockPiece(board, piece)
  const rows = fullRows(locked)
  return { board: rows.length ? clearRows(locked, rows) : locked, cleared: rows.length }
}

// Holes, tallest column and surface roughness.
// Holes = covered empty cells, plus the cells of a 1-wide well below its top cell: with no rotation
// (no vertical I) nothing can fill those, so they're as dead as a covered hole.
export function boardStats(board) {
  const heights = []
  let holes = 0
  for (let x = 0; x < COLS; x++) {
    let top = ROWS
    for (let y = 0; y < ROWS; y++) {
      if (board[y][x] !== null) top = Math.min(top, y)
      else if (top < ROWS) holes++
    }
    heights.push(ROWS - top)
  }
  for (let x = 0; x < COLS; x++) {
    const left = x > 0 ? heights[x - 1] : ROWS // walls count as full columns
    const right = x < COLS - 1 ? heights[x + 1] : ROWS
    holes += Math.max(0, Math.min(left, right) - heights[x] - 1)
  }
  let bumpiness = 0
  for (let x = 1; x < COLS; x++) bumpiness += Math.abs(heights[x] - heights[x - 1])
  return { holes, maxHeight: Math.max(...heights), bumpiness }
}

// Every resting spot reachable by sliding along the top row from the spawn column, then dropping
export function placements(board, shape) {
  const start = spawnCol(shape)
  if (collides(board, shape, 0, start)) return []
  const spots = []
  for (const dir of [-1, 1]) {
    for (let col = dir < 0 ? start : start + 1; !collides(board, shape, 0, col); col += dir) {
      let row = 0
      while (!collides(board, shape, row + 1, col)) row++
      spots.push({ col, row })
    }
  }
  return spots
}

// ---------- Kind dealer ----------
// Picks which shape comes next (never where it goes): from the next few in a shuffled bag,
// deal the one with the best available spot. Keeps rounds winnable without rotation.

const LOOKAHEAD = 3
const CLEAR_BONUS = 20
const FLAT_SHAPES = ['I', 'O']

export function shuffledBag(rng = Math.random) {
  const bag = SHAPE_KEYS.slice()
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[bag[i], bag[j]] = [bag[j], bag[i]]
  }
  return bag
}

// Lower is better: 4*new holes + 2*max height + bumpiness, minus a bonus per cleared row
export function bestPlacementScore(board, shape) {
  const holesBefore = boardStats(board).holes
  let best = Infinity
  for (const spot of placements(board, shape)) {
    const { board: after, cleared } = settle(board, { shape, ...spot })
    const s = boardStats(after)
    best = Math.min(best, 4 * Math.max(0, s.holes - holesBefore) + 2 * s.maxHeight + s.bumpiness - CLEAR_BONUS * cleared)
  }
  return best
}

// (board, bag) -> { shape, bag }. Pure for a given rng.
export function dealPiece(board, bag, rng = Math.random) {
  let pool = bag
  while (pool.length < SHAPE_KEYS.length) pool = [...pool, ...shuffledBag(rng)]
  // The next LOOKAHEAD *different* shapes, so deferred pieces can't crowd out the choice
  const candidates = []
  pool.forEach((shape, index) => {
    if (candidates.length < LOOKAHEAD && !candidates.some((c) => c.shape === shape)) {
      candidates.push({ shape, index, score: bestPlacementScore(board, shape) + rng() * 0.5 })
    }
  })
  candidates.sort((a, b) => a.score - b.score)
  let pick = candidates[0]
  // Tall stack: prefer a flat piece if it's nearly as good
  if (boardStats(board).maxHeight > (ROWS * 2) / 3) {
    const limit = pick.score + Math.abs(pick.score) * 0.25
    pick = candidates.find((c) => FLAT_SHAPES.includes(c.shape) && c.score <= limit) ?? pick
  }
  return { shape: pick.shape, bag: pool.filter((_, i) => i !== pick.index) }
}

// ---------- State ----------

// Randomness arrives in each action as pre-rolled numbers so the reducer stays pure (StrictMode-safe)
const ROLLS = 16
const freshRolls = () => Array.from({ length: ROLLS }, Math.random)
const rollsRng = (rolls) => {
  let i = 0
  return () => rolls[i++ % rolls.length]
}

const initialState = {
  status: 'idle', // 'idle' | 'playing' | 'won' | 'lost'
  board: emptyBoard(),
  piece: null,
  clearing: null, // { rows } while the row-clear animation plays
  bag: [],
  rowsCleared: 0,
  score: 0,
  best: 0, // updated when a game ends; saved to localStorage by the hook
  nextId: 0,
  message: '', // for the aria-live region
}

function spawn(state, board, rng) {
  const { shape, bag } = dealPiece(board, state.bag, rng)
  const col = spawnCol(shape)
  if (collides(board, shape, 0, col)) {
    return { ...state, board, bag, piece: null, clearing: null, status: 'lost', best: Math.max(state.best, state.score), message: 'Board full' }
  }
  return { ...state, board, bag, clearing: null, piece: { shape, row: 0, col, id: state.nextId }, nextId: state.nextId + 1 }
}

// Once cleared rows are gone: win, or deal the next piece
function afterClear(state, board, rng) {
  if (state.rowsCleared >= TARGET_ROWS) {
    return { ...state, board, piece: null, clearing: null, status: 'won', best: Math.max(state.best, state.score), message: 'You won' }
  }
  return spawn(state, board, rng)
}

function reducer(state, action) {
  const { status, board, piece, clearing } = state
  const rng = rollsRng(action.rolls ?? [0])
  switch (action.type) {
    case 'start': {
      const fresh = { ...initialState, board: emptyBoard(), status: 'playing', best: state.best, nextId: state.nextId, message: 'Game started' }
      return spawn(fresh, fresh.board, rng)
    }
    case 'move': {
      if (status !== 'playing' || !piece || collides(board, piece.shape, piece.row, piece.col + action.dx)) return state
      return { ...state, piece: { ...piece, col: piece.col + action.dx } }
    }
    case 'down': {
      if (status !== 'playing' || !piece) return state
      if (!collides(board, piece.shape, piece.row + 1, piece.col)) {
        return { ...state, piece: { ...piece, row: piece.row + 1 } }
      }
      const locked = lockPiece(board, piece)
      const rows = fullRows(locked)
      if (rows.length === 0) return spawn(state, locked, rng)
      const rowsCleared = state.rowsCleared + rows.length
      const next = {
        ...state,
        rowsCleared,
        score: state.score + rowScore(rows.length),
        message: `${rows.length > 1 ? 'Rows' : 'Row'} cleared. ${Math.min(rowsCleared, TARGET_ROWS)} of ${TARGET_ROWS}`,
      }
      if (action.instant) return afterClear(next, clearRows(locked, rows), rng)
      return { ...next, board: locked, piece: null, clearing: { rows } }
    }
    case 'finishClear': {
      if (!clearing) return state
      return afterClear(state, clearRows(board, clearing.rows), rng)
    }
    default:
      return state
  }
}

// Best score survives reloads; storage may be blocked (private mode, sandboxed iframes)
function readBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

function writeBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value))
  } catch {
    // No storage: best just lasts for this visit
  }
}

// boardRef: the board element. Gravity only runs while playing, on-screen and with the tab visible.
export function useBlockGame(boardRef) {
  const [state, dispatch] = useReducer(reducer, null, () => ({ ...initialState, best: readBest() }))
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

  const start = useCallback(() => dispatch({ type: 'start', rolls: freshRolls() }), [])
  const move = useCallback((dx) => dispatch({ type: 'move', dx }), [])
  const drop = useCallback(() => dispatch({ type: 'down', rolls: freshRolls(), instant: reduced }), [reduced])

  const { status, clearing, best } = state
  const running = status === 'playing' && onScreen && tabVisible
  useEffect(() => {
    if (!running) return
    const id = setInterval(drop, GRAVITY_MS)
    return () => clearInterval(id)
  }, [running, drop])

  useEffect(() => {
    if (!clearing) return
    const id = setTimeout(() => dispatch({ type: 'finishClear', rolls: freshRolls() }), CLEAR_MS)
    return () => clearTimeout(id)
  }, [clearing])

  useEffect(() => {
    if (best > 0) writeBest(best)
  }, [best])

  return {
    ...state,
    move,
    drop,
    start,
    restart: start,
  }
}
