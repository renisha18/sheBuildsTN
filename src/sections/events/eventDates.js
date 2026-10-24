// Event dates and links, shared by the loader, the card, the carousel, the All events timeline
// and the validator (scripts/validate-events.mjs). Plain module with no imports, so Node can
// load it too.

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

// Past = its end (or its start, if there's no end) is over: the end of that month for a
// month-only date, the end of that day (India time) for a date, or the date-time itself.
// Events with no start date aren't past. This is the same rule getEvents() sorts by.
export function isPastEvent(event, now = new Date()) {
  const start = parseEventDate(event.start)
  if (!start) return false
  const last = parseEventDate(event.end) ?? start
  return now.getTime() >= last.until
}

// The one button an event may have, or null (then no button at all, never a dead one):
//   upcoming with registerUrl  -> Register
//   past with postUrl          -> View post (the recap)
//   upcoming with only postUrl -> View post
export function eventLink(event, now = new Date()) {
  const past = isPastEvent(event, now)
  if (!past && event.registerUrl) return { href: event.registerUrl, label: 'Register' }
  if (event.postUrl) return { href: event.postUrl, label: 'View post' }
  return null
}
