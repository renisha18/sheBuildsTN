import { eventLink, parseEventDate } from './eventDates.js'
import { tagLabel } from './eventTags.js'

// The coral pill button (Register / View post)
const VIEW_EVENT_CLASS =
  'mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink bg-accent px-5 py-2.5 font-body font-bold text-ink shadow-brutal-sm transition motion-reduce:transition-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink max-sm:py-1.5 max-sm:text-sm'

const MONTH_FMT = new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' })
const DAY_FMT = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const DATETIME_PARTS = { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' }
const IST_YEAR_FMT = new Intl.DateTimeFormat('en-IN', { year: 'numeric', timeZone: 'Asia/Kolkata' })

// "Oct 2024" (month only), "15 Nov 2026" (date only), "Sun, 15 Nov, 10:00 am" (date-time, India
// time, plus the year when it isn't this year), or "Date TBA". Month and date values are formatted
// in UTC from their written parts, so they never shift a day or month with the viewer's time zone.
function formatStart(value, now = new Date()) {
  const when = parseEventDate(value)
  if (!when) return 'Date TBA'
  if (when.precision === 'month') return MONTH_FMT.format(Date.UTC(when.year, when.month - 1, 1))
  if (when.precision === 'date') return DAY_FMT.format(Date.UTC(when.year, when.month - 1, when.day))
  const sameYear = IST_YEAR_FMT.format(when.from) === IST_YEAR_FMT.format(now)
  return new Intl.DateTimeFormat('en-IN', sameYear ? DATETIME_PARTS : { ...DATETIME_PARTS, year: 'numeric' }).format(when.from)
}

const iconProps = {
  'aria-hidden': true,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-4 w-4 shrink-0 max-sm:size-3.5',
}

// Crop focus for the photo. Full class names so Tailwind can find them; anything else falls back to center.
const IMAGE_POSITION_CLASS = {
  top: 'object-top',
  center: 'object-center',
  bottom: 'object-bottom',
}

export default function EventCard({ event }) {
  const { format, tags, title, description, attendees, start, venue, image, imagePosition, featured } = event
  const positionClass = IMAGE_POSITION_CLASS[imagePosition] ?? IMAGE_POSITION_CLASS.center
  // Register / View post / no button at all, decided once in eventDates.js
  const link = eventLink(event)
  const shownTags = tags.slice(0, 3)

  // Border, radius and shadow match .journey__card (Journey.css); overflow-hidden clips the image to the rounded top
  return (
    <article className="relative flex h-full w-full flex-col overflow-hidden rounded-md border-2 border-ink bg-surface shadow-brutal">
      {/* Image area — gray placeholder until the event's JSON file has an "image" */}
      {/* Fixed-ratio box: the photo is absolutely positioned, so it can never change the box's height */}
      <div className="relative aspect-5/2 w-full overflow-hidden border-b-2 border-ink bg-muted/30 max-sm:aspect-2/1">
        {image ? (
          <img src={image} alt="" className={`absolute inset-0 h-full w-full object-cover ${positionClass}`} />
        ) : (
          <span className="absolute bottom-2 left-4 font-body text-xs text-ink">Image placeholder</span>
        )}

        {featured === true && (
          <span className="absolute right-3 top-3 bg-ink px-2 py-1 font-body text-xs font-bold tracking-wide text-surface">
            FEATURED
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 max-sm:gap-1.5 max-sm:p-2.5">
        {/* Format and tags, 640px and up only: the phone card stays compact */}
        {(format || shownTags.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 max-sm:hidden">
            {format && (
              <span className="rounded-full border-2 border-ink bg-accent-alt px-2 py-0.5 font-body text-xs font-semibold text-ink">{format}</span>
            )}
            {shownTags.map((tag) => (
              <span key={tag} className="rounded-full border-2 border-ink bg-surface px-2 py-0.5 font-body text-xs font-semibold text-ink">
                {tagLabel(tag)}
              </span>
            ))}
          </div>
        )}

        <h3 className="font-display text-xl font-bold leading-tight text-ink max-sm:line-clamp-2 max-sm:text-sm max-sm:leading-tight">{title}</h3>

        <p className="font-body text-sm text-muted max-sm:sr-only">{description}</p>

        <p className="inline-flex items-center gap-1.5 font-body text-sm text-muted max-sm:sr-only">
          <svg {...iconProps}>
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
          </svg>
          {attendees == null ? 'Attendee count TBA' : `${attendees} attendees`}
        </p>

        <hr className={`border-muted/30 max-sm:hidden ${link ? '' : 'mt-auto'}`} />

        <div className={`flex flex-col items-center gap-1.5 font-body text-sm text-muted max-sm:items-start max-sm:text-xs ${link ? '' : 'max-sm:mt-auto'}`}>
          <span className="inline-flex items-center gap-1.5">
            <svg {...iconProps}>
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M8 3v4M16 3v4M3 10h18" />
            </svg>
            {formatStart(start)}
          </span>
          <span className="inline-flex items-center gap-1.5 max-sm:max-w-full">
            <svg {...iconProps}>
              <path d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21Z" />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
            <span className="max-sm:line-clamp-2">{venue ?? 'Venue TBA'}</span>
          </span>
        </div>

        {/* Only when there is somewhere to go: never a dead button. Without one, the date and venue
            sit at the bottom of the card instead, so it stays balanced. */}
        {link && (
          <a href={link.href} target="_blank" rel="noopener noreferrer" className={VIEW_EVENT_CLASS}>
            {link.label}
            <span className="sr-only">: {title} (opens in a new tab)</span>
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  )
}
