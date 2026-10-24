import { parseEventDate } from './loadEvents.js'

// Helpers for the All events timeline. They only read events; the order always comes from
// getEvents() (upcoming soonest first, then undated, then past newest first), so nothing is
// re-sorted here.

const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

// The calendar parts of a parsed date. A date-time is read in India time, like the loader does.
function parts(when) {
  if (when.precision !== 'datetime') return { year: when.year, month: when.month, day: when.day }
  const d = new Date(when.from + IST_OFFSET_MS)
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() }
}

// Same rule as getEvents(): not over yet, or no start date at all
export function isUpcoming(event, now = new Date()) {
  const start = parseEventDate(event.start)
  if (!start) return true
  const last = parseEventDate(event.end) ?? start
  return now.getTime() < last.until
}

// The year an event is filed under (its start)
export function eventYear(event) {
  const start = parseEventDate(event.start)
  return start ? parts(start).year : null
}

// The one link an event card may show: a post about it, or else its registration page
export function eventLink(event) {
  return event.postUrl ?? event.registerUrl ?? null
}

// "1 event" / "9 events"
export const countLabel = (n) => (n === 1 ? '1 event' : `${n} events`)

// id of a year's heading (jump-link target)
export const yearId = (year) => `events-year-${year}`

const pad = (n) => String(n).padStart(2, '0')

// Short uppercase label: "AUG" (month only, never a made-up day), "10 OCT", "01–02 AUG",
// "30 SEP–02 OCT", "AUG–SEP", or "TBA" when there is no start date.
export function dateLabel(event) {
  const start = parseEventDate(event.start)
  if (!start) return 'TBA'
  const a = parts(start)
  const endWhen = parseEventDate(event.end)
  const b = endWhen ? parts(endWhen) : null

  if (start.precision === 'month') {
    const label = MONTHS[a.month - 1]
    return b && (b.month !== a.month || b.year !== a.year) ? `${label}–${MONTHS[b.month - 1]}` : label
  }

  const single = `${pad(a.day)} ${MONTHS[a.month - 1]}`
  if (!b || endWhen.precision === 'month' || (b.day === a.day && b.month === a.month && b.year === a.year)) return single
  if (b.month === a.month && b.year === a.year) return `${pad(a.day)}–${pad(b.day)} ${MONTHS[a.month - 1]}`
  return `${single}–${pad(b.day)} ${MONTHS[b.month - 1]}`
}

// Upcoming events (in getEvents() order), then past events grouped by start year, newest year
// first, each year keeping getEvents() order (newest first).
export function splitTimeline(events, now = new Date()) {
  const upcoming = []
  const years = new Map()
  for (const event of events) {
    if (isUpcoming(event, now)) {
      upcoming.push(event)
      continue
    }
    const year = eventYear(event)
    if (!years.has(year)) years.set(year, [])
    years.get(year).push(event)
  }
  const past = [...years.entries()].sort(([a], [b]) => b - a).map(([year, list]) => ({ year, events: list }))
  return { upcoming, past }
}
