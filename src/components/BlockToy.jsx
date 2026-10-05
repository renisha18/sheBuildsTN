import { useEffect, useRef, useState } from 'react'
import { icons } from '../sections/home/badgeIcons.jsx'
import { prefersReducedMotion, scrollToSection } from '../siteSections.js'

// "Build with blocks" footer toy. Matter.js is loaded only when the play area first scrolls
// into view. Blocks are DOM elements positioned from their physics bodies every frame (not a
// canvas), so the empty area still scrolls on touch screens; only the blocks use touch-action: none.

// Shapes/colours/icons follow the Hero badges. w/h are px and must match the size classes.
const SHAPES = {
  square: { w: 56, h: 56, className: 'size-14 rounded-md' },
  circle: { w: 56, h: 56, className: 'size-14 rounded-full' },
  rect: { w: 96, h: 48, className: 'h-12 w-24 rounded-md' },
}
const COLORS = {
  maroon: 'bg-primary text-background',
  red: 'bg-danger text-background',
  teal: 'bg-accent-alt text-ink',
  coral: 'bg-accent text-ink',
  cream: 'bg-background text-primary',
}
const BLOCKS = [
  { shape: 'square', color: 'teal', icon: 'code' },
  { shape: 'circle', color: 'coral', icon: 'branch' },
  { shape: 'rect', color: 'maroon', icon: 'terminal' },
  { shape: 'square', color: 'cream', icon: 'network' },
  { shape: 'circle', color: 'red', icon: 'sigma' },
  { shape: 'rect', color: 'teal', icon: 'braces' },
  { shape: 'circle', color: 'maroon', icon: 'code' },
  { shape: 'square', color: 'coral', icon: 'terminal' },
].map((b) => ({ ...b, ...SHAPES[b.shape] }))

const FLOOR_H = 8 // matches the floor bar's h-2
const WALL = 200 // thick static walls so fast throws can't tunnel through
const STEP = 1000 / 60
const MAX_SPEED = 25
const STACK_HEIGHT = 4
const STILL_MS = 2000

function createSim(Matter, { area, els, reduced, onBuilt }) {
  const { Engine, Bodies, Body, Composite, Constraint, Sleeping } = Matter
  const engine = Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8 })
  const world = engine.world

  const floor = Bodies.rectangle(0, 0, 10000, WALL, { isStatic: true })
  const left = Bodies.rectangle(0, 0, WALL, 4000, { isStatic: true })
  const right = Bodies.rectangle(0, 0, WALL, 4000, { isStatic: true })
  const material = { friction: 0.8, frictionStatic: 1, restitution: 0.1, slop: 0.05 }
  const bodies = BLOCKS.map((b) =>
    b.shape === 'circle'
      ? Bodies.circle(0, 0, b.w / 2, material)
      : Bodies.rectangle(0, 0, b.w, b.h, { ...material, chamfer: { radius: 12 } }),
  )
  const indexOf = new Map(bodies.map((b, i) => [b.id, i]))
  Composite.add(world, [floor, left, right, ...bodies])

  let width = 0
  let height = 0
  const layoutWalls = () => {
    width = area.clientWidth
    height = area.clientHeight
    Body.setPosition(floor, { x: width / 2, y: height - FLOOR_H + WALL / 2 })
    Body.setPosition(left, { x: -WALL / 2, y: height - 2000 })
    Body.setPosition(right, { x: width + WALL / 2, y: height - 2000 })
  }

  const dropPosition = (i) => {
    const { w, h } = BLOCKS[i]
    // Golden-ratio spread: evenly scattered but the same every time
    return { x: w / 2 + ((i * 0.618) % 1) * Math.max(0, width - w), y: -h - i * 60 }
  }

  // drop: blocks fall in from above. Otherwise (reduced motion) they start resting on the floor,
  // filling rows left to right.
  const place = (drop) => {
    const gap = 8
    let x = gap
    let y = height - FLOOR_H
    let rowH = 0
    bodies.forEach((body, i) => {
      const { w, h } = BLOCKS[i]
      Sleeping.set(body, false)
      Body.setAngle(body, 0)
      Body.setVelocity(body, { x: 0, y: 0 })
      Body.setAngularVelocity(body, 0)
      if (drop) {
        Body.setPosition(body, dropPosition(i))
        return
      }
      if (x + w > width - gap) {
        x = gap
        y -= rowH
        rowH = 0
      }
      Body.setPosition(body, { x: x + w / 2, y: y - h / 2 })
      x += w + gap
      rowH = Math.max(rowH, h)
    })
  }

  const render = () => {
    bodies.forEach((body, i) => {
      const { w, h } = BLOCKS[i]
      els[i].style.transform = `translate(${body.position.x - w / 2}px, ${body.position.y - h / 2}px) rotate(${body.angle}rad)`
    })
  }

  // ---- Dragging: a spring constraint from the pointer to the grabbed point on the block ----
  let drag = null
  const toLocal = (e) => {
    const rect = area.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }
  const release = () => {
    if (!drag) return
    Composite.remove(world, drag.constraint)
    const { body } = drag
    const v = body.velocity
    const speed = Math.hypot(v.x, v.y)
    if (speed > MAX_SPEED) Body.setVelocity(body, { x: (v.x / speed) * MAX_SPEED, y: (v.y / speed) * MAX_SPEED })
    drag = null
  }
  const handlers = els.map((el, i) => {
    const down = (e) => {
      if (drag) return
      e.preventDefault()
      el.setPointerCapture(e.pointerId)
      const body = bodies[i]
      const p = toLocal(e)
      Sleeping.set(body, false)
      const constraint = Constraint.create({
        pointA: p,
        bodyB: body,
        pointB: { x: p.x - body.position.x, y: p.y - body.position.y },
        stiffness: 0.2,
        damping: 0.1,
        length: 0,
      })
      Composite.add(world, constraint)
      drag = { body, constraint, pointerId: e.pointerId }
    }
    const move = (e) => {
      if (drag?.pointerId === e.pointerId) drag.constraint.pointA = toLocal(e)
    }
    const up = (e) => {
      if (drag?.pointerId === e.pointerId) release()
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return { el, down, move, up }
  })

  // ---- Stack detection: longest chain of blocks resting on each other, starting at the floor ----
  let built = false
  let stillSince = 0
  const checkStack = (t) => {
    if (built) return
    const n = bodies.length
    const onFloor = new Array(n).fill(false)
    const supports = bodies.map(() => []) // supports[i] = blocks directly under block i
    for (const pair of engine.pairs.list) {
      if (!pair.isActive) continue
      const a = pair.bodyA.parent
      const b = pair.bodyB.parent
      const ia = indexOf.get(a.id)
      const ib = indexOf.get(b.id)
      if (ia !== undefined && b === floor) onFloor[ia] = true
      else if (ib !== undefined && a === floor) onFloor[ib] = true
      else if (ia !== undefined && ib !== undefined) {
        const dy = b.position.y - a.position.y
        if (dy > 20) supports[ia].push(ib)
        else if (dy < -20) supports[ib].push(ia)
      }
    }
    const level = onFloor.map((f) => (f ? 1 : 0))
    const below = new Array(n).fill(-1)
    for (let pass = 0; pass < n; pass++) {
      for (let i = 0; i < n; i++) {
        for (const j of supports[i]) {
          if (level[j] && level[j] + 1 > level[i]) {
            level[i] = level[j] + 1
            below[i] = j
          }
        }
      }
    }
    let top = -1
    level.forEach((l, i) => {
      if (l >= STACK_HEIGHT && (top < 0 || l > level[top])) top = i
    })
    let still = top >= 0
    for (let i = top; still && i >= 0; i = below[i]) {
      const b = bodies[i]
      if (drag?.body === b || (!b.isSleeping && (b.speed > 0.15 || b.angularSpeed > 0.01))) still = false
    }
    if (!still) {
      stillSince = 0
    } else if (!stillSince) {
      stillSince = t
    } else if (t - stillSince >= STILL_MS) {
      built = true
      onBuilt()
    }
  }

  // ---- Loop (fixed timestep), paused while offscreen ----
  let raf = 0
  let last = 0
  let acc = 0
  let running = false
  const frame = (t) => {
    raf = requestAnimationFrame(frame)
    if (!last) last = t
    acc += Math.min(t - last, 100)
    last = t
    while (acc >= STEP) {
      Engine.update(engine, STEP)
      acc -= STEP
    }
    // Anything that escaped the area drops back in
    bodies.forEach((body, i) => {
      const { x, y } = body.position
      if (y > height + 100 || x < -100 || x > width + 100) {
        if (drag?.body === body) release()
        Body.setVelocity(body, { x: 0, y: 0 })
        Body.setPosition(body, { x: width / 2, y: -BLOCKS[i].h })
      }
    })
    render()
    checkStack(t)
  }

  const resizeObserver = new ResizeObserver(() => {
    layoutWalls()
    bodies.forEach((body, i) => {
      const half = BLOCKS[i].w / 2
      const x = Math.min(Math.max(body.position.x, half), Math.max(half, width - half))
      if (x !== body.position.x) Body.setPosition(body, { x, y: body.position.y })
    })
  })

  layoutWalls()
  place(!reduced)
  render()
  resizeObserver.observe(area)

  return {
    start() {
      if (running) return
      running = true
      last = 0
      acc = 0
      stillSince = 0
      raf = requestAnimationFrame(frame)
    },
    stop() {
      running = false
      cancelAnimationFrame(raf)
    },
    reset() {
      release()
      built = false
      stillSince = 0
      place(!prefersReducedMotion())
      render()
    },
    destroy() {
      running = false
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      handlers.forEach(({ el, down, move, up }) => {
        el.removeEventListener('pointerdown', down)
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerup', up)
        el.removeEventListener('pointercancel', up)
      })
      Composite.clear(world, false)
      Engine.clear(engine)
    },
  }
}

export default function BlockToy() {
  const areaRef = useRef(null)
  const blockRefs = useRef([])
  const simRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [built, setBuilt] = useState(false)

  useEffect(() => {
    const area = areaRef.current
    let cancelled = false
    let started = false
    let visible = false

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (simRef.current) {
          if (visible) simRef.current.start()
          else simRef.current.stop()
          return
        }
        if (!visible || started) return
        started = true
        import('matter-js').then((mod) => {
          if (cancelled) return
          const sim = createSim(mod.default ?? mod, {
            area,
            els: blockRefs.current,
            reduced: prefersReducedMotion(),
            onBuilt: () => setBuilt(true),
          })
          simRef.current = sim
          setReady(true)
          if (visible) sim.start()
        })
      },
      { threshold: 0.15 },
    )
    observer.observe(area)

    return () => {
      cancelled = true
      observer.disconnect()
      simRef.current?.destroy()
      simRef.current = null
    }
  }, [])

  const reset = () => {
    simRef.current?.reset()
    setBuilt(false)
  }

  const goJoin = (e) => {
    e.preventDefault()
    scrollToSection('join')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-body text-sm text-muted">Drag the blocks. Build something.</p>
        <button
          type="button"
          onClick={reset}
          disabled={!ready}
          className="rounded-full border-2 border-ink bg-surface px-4 py-1.5 font-body text-sm text-ink shadow-brutal-sm transition motion-reduce:transition-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-accent-alt/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-40"
        >
          Reset
        </button>
      </div>

      <p aria-live="polite" className="min-h-6 font-display font-bold text-primary">
        {built && (
          <>
            You built it.{' '}
            <a
              href="#join"
              onClick={goJoin}
              className="text-ink underline underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Join the community <span aria-hidden="true">→</span>
            </a>
          </>
        )}
      </p>

      <div ref={areaRef} className="relative h-70 overflow-hidden md:h-80">
        {/* Decorative: pointer-only toy, hidden from assistive tech. Reset and links live outside it. */}
        <div aria-hidden="true" className="absolute inset-0">
          {BLOCKS.map((b, i) => (
            <div
              key={i}
              ref={(el) => {
                blockRefs.current[i] = el
              }}
              className={`absolute left-0 top-0 grid touch-none select-none place-items-center border-2 border-ink shadow-brutal-sm will-change-transform cursor-grab active:cursor-grabbing ${b.className} ${COLORS[b.color]} ${ready ? '' : 'invisible'}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-7">
                {icons[b.icon]}
              </svg>
            </div>
          ))}
          <div className="absolute inset-x-0 bottom-0 h-2 bg-ink" />
        </div>
      </div>
    </div>
  )
}
