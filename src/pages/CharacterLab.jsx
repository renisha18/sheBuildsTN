import { useState } from 'react'

// Dev-only tool (route /character-lab, registered only when import.meta.env.DEV) for checking
// how the character frames swap. Edit the order here; files live in public/character/.
const FRAMES = ['sit-1200', 'rise-960', 'stand-960', 'teach-720', 'podium-720']

const CROSSFADES = [0, 150, 300] // ms

const pillClass = (isActive) =>
  [
    'rounded-full border-2 border-ink px-4 py-1.5 font-body text-sm text-ink shadow-brutal-sm',
    'transition motion-reduce:transition-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
    isActive ? 'bg-accent-alt' : 'bg-surface hover:bg-accent-alt/20',
  ].join(' ')

export default function CharacterLab() {
  const [index, setIndex] = useState(0)
  const [fadeMs, setFadeMs] = useState(150)
  const [status, setStatus] = useState({}) // frame name -> 'loaded' | 'error'

  const loaded = FRAMES.filter((f) => status[f] === 'loaded').length
  const failed = FRAMES.filter((f) => status[f] === 'error')
  const mark = (frame, state) => setStatus((s) => ({ ...s, [frame]: state }))

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:px-12">
      <h1 className="font-display text-3xl font-bold text-ink">Character lab</h1>
      <p className="mt-1 font-body text-sm text-muted">
        Dev only. Frames from /character/, all drawn at the same position and size.
      </p>

      {/* Every frame is rendered (and so preloaded) up front, stacked in one square; only the
          current one is opaque. They share one square canvas, so object-contain lines them up. */}
      <div className="relative mt-6 aspect-square w-full max-w-150">
        {FRAMES.map((frame, i) => (
          <img
            key={frame}
            src={`/character/${frame}.webp`}
            alt={i === index ? `Character frame ${frame}` : ''}
            aria-hidden={i === index ? undefined : true}
            loading="eager"
            decoding="async"
            onLoad={() => mark(frame, 'loaded')}
            onError={() => mark(frame, 'error')}
            className="absolute inset-0 h-full w-full object-contain transition-opacity ease-linear"
            style={{ opacity: i === index ? 1 : 0, transitionDuration: `${fadeMs}ms` }}
          />
        ))}
      </div>

      <div className="mt-6 flex max-w-150 flex-col gap-4">
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={FRAMES.length - 1}
            step={1}
            value={index}
            onChange={(e) => setIndex(Number(e.target.value))}
            aria-label="Frame"
            aria-valuetext={FRAMES[index]}
            className="flex-1 accent-primary"
          />
          <output className="w-28 font-body text-sm font-semibold text-ink">
            {index + 1}/{FRAMES.length} {FRAMES[index]}
          </output>
        </div>

        <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Crossfade duration">
          <span className="font-body text-sm text-muted">Crossfade</span>
          {CROSSFADES.map((ms) => (
            <button key={ms} type="button" aria-pressed={fadeMs === ms} onClick={() => setFadeMs(ms)} className={pillClass(fadeMs === ms)}>
              {ms} ms
            </button>
          ))}
        </div>

        <p className="font-body text-sm text-muted" aria-live="polite">
          Preloaded {loaded}/{FRAMES.length}
          {failed.length > 0 && <span className="text-danger"> · missing: {failed.map((f) => `${f}.webp`).join(', ')}</span>}
        </p>
      </div>
    </main>
  )
}
