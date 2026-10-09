// Events come from src/data/events/*.json (one file per event; the file name is the event id).
// scripts/validate-events.mjs checks those files before every build (npm run validate:events).
//
// Fields: title, category, description, start, end, venue, attendees, featured, image, registerUrl.
// start/end are month-only "2024-10", date-only "2026-11-15" or a date-time
// "2026-11-15T10:00:00+05:30". Any optional field may be null.

const modules = import.meta.glob('/src/data/events/*.json', { eager: true, import: 'default' })

const EVENTS = Object.entries(modules).map(([path, data]) => ({
  id: path.slice(path.lastIndexOf('/') + 1, -'.json'.length),
  title: data.title,
  category: data.category,
  description: data.description,
  start: data.start ?? null,
  end: data.end ?? null,
  venue: data.venue ?? null,
  attendees: data.attendees ?? null,
  featured: data.featured === true,
  image: data.image ?? null,
  registerUrl: data.registerUrl ?? null,
}))

// India Standard Time is a fixed UTC+5:30 (no daylight saving)
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000

// Parses a start/end value. Returns null if missing or not one of the three forms.
//   precision: 'month' | 'date' | 'datetime'
//   year, month, day: the calendar parts as written (month/date precision; day is 1 for months)
//   from: when the period begins (ms), until: when it is over (ms, exclusive).
//   Month and date periods are whole months/days in India time; a date-time is a single instant.
export function parseEventDate(value) {
  if (typeof value !== 'string') return null

  let m = /^(\d{4})-(\d{2})$/.exec(value)
  if (m) {
    const [year, month] = [Number(m[1]), Number(m[2])]
    if (month < 1 || month > 12) return null
    return {
      precision: 'month',
      year,
      month,
      day: 1,
      from: Date.UTC(year, month - 1, 1) - IST_OFFSET_MS,
      until: Date.UTC(year, month, 1) - IST_OFFSET_MS,
    }
  }

  m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (m) {
    const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])]
    const check = new Date(Date.UTC(year, month - 1, day))
    if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null
    return {
      precision: 'date',
      year,
      month,
      day,
      from: Date.UTC(year, month - 1, day) - IST_OFFSET_MS,
      until: Date.UTC(year, month - 1, day + 1) - IST_OFFSET_MS,
    }
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})$/.test(value)) {
    const ms = Date.parse(value)
    if (Number.isNaN(ms)) return null
    return { precision: 'datetime', from: ms, until: ms }
  }

  return null
}

// All events, nothing hidden, decided against `now` (call it at render time in the browser):
//   1. upcoming (not over yet), soonest start first
//   2. no start date, in file-name order
//   3. past, most recent first
// An event is over once the period of its end (or its start, if there's no end) has passed:
// the end of that month, the end of that day (India time), or the date-time itself.
export function getEvents(now = new Date()) {
  const nowMs = now.getTime()
  const upcoming = []
  const undated = []
  const past = []

  for (const event of EVENTS) {
    const start = parseEventDate(event.start)
    if (!start) {
      undated.push({ event })
      continue
    }
    const last = parseEventDate(event.end) ?? start
    const item = { event, from: start.from, until: last.until }
    if (nowMs < item.until) upcoming.push(item)
    else past.push(item)
  }

  upcoming.sort((a, b) => a.from - b.from)
  past.sort((a, b) => b.until - a.until || b.from - a.from)

  return [...upcoming, ...undated, ...past].map((item) => item.event)
}
