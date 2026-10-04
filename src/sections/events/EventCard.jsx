const iconProps = {
  'aria-hidden': true,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-4 w-4 shrink-0',
}

export default function EventCard({ event }) {
  const { category, title, description, attendees, date, location, image, featured } = event

  // Border, radius and shadow match .journey__card (Journey.css); overflow-hidden clips the image to the rounded top
  return (
    <article className="relative flex h-full w-full flex-col overflow-hidden rounded-md border-2 border-ink bg-surface shadow-brutal">
      {/* Image area — gray placeholder until a real photo is added in eventsData.js */}
      <div className="relative aspect-5/2 w-full border-b-2 border-ink bg-muted/30">
        {image ? (
          <>
            <img src={image} alt="" className="h-full w-full object-cover" />
            {/* Flat tint so the overlaid title stays readable on busy photos */}
            <div aria-hidden="true" className="absolute inset-0 bg-background/30" />
          </>
        ) : (
          <span className="absolute bottom-2 left-4 font-body text-xs text-ink">Image placeholder</span>
        )}

        {/* Decorative repeat of the title; the real heading is the h3 below */}
        <p
          aria-hidden="true"
          className="absolute left-4 right-28 top-3 font-display text-xl font-bold leading-tight text-ink line-clamp-2 md:text-2xl"
        >
          {title}
        </p>

        {featured && (
          <span className="absolute right-3 top-3 bg-ink px-2 py-1 font-body text-xs font-bold tracking-wide text-surface">
            FEATURED
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className="self-start rounded-full border-2 border-ink bg-accent-alt px-2 py-0.5 font-body text-xs font-semibold text-ink">
          {category}
        </span>

        <h3 className="font-display text-xl font-bold leading-tight text-ink">{title}</h3>

        <p className="font-body text-sm text-muted">{description}</p>

        <p className="inline-flex items-center gap-1.5 font-body text-sm text-muted">
          <svg {...iconProps}>
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
          </svg>
          {attendees == null ? 'Attendee count TBA' : `${attendees} attendees`}
        </p>

        <hr className="border-muted/30" />

        <div className="flex flex-col items-center gap-1.5 font-body text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <svg {...iconProps}>
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M8 3v4M16 3v4M3 10h18" />
            </svg>
            {date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg {...iconProps}>
              <path d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21Z" />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
            {location}
          </span>
        </div>

        {/* No destination yet — swap for an <a href> once event pages exist */}
        <button
          type="button"
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink bg-accent px-5 py-2.5 font-body font-bold text-ink shadow-brutal-sm transition motion-reduce:transition-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          View Event<span className="sr-only">: {title}</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  )
}
