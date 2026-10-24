// Events come from src/data/events/*.json (one file per event; the file name is the event id).
// scripts/validate-events.mjs checks those files before every build (npm run validate:events).
//
// Fields: title, description, tags, format, partners, chapter, start, end, venue, attendees,
// featured, image, registerUrl, postUrl (see src/data/events/EVENTS-README.md).
// start/end are month-only "2024-10", date-only "2026-11-15" or a date-time
// "2026-11-15T10:00:00+05:30". Any optional field may be null. tags and partners are always
// arrays here (empty when missing).

import { parseEventDate } from './eventDates.js'

const modules = import.meta.glob('/src/data/events/*.json', { eager: true, import: 'default' })

const EVENTS = Object.entries(modules).map(([path, data]) => ({
  id: path.slice(path.lastIndexOf('/') + 1, -'.json'.length),
  title: data.title,
  description: data.description,
  tags: Array.isArray(data.tags) ? data.tags : [],
  format: data.format ?? null,
  partners: Array.isArray(data.partners) ? data.partners : [],
  chapter: data.chapter ?? null,
  start: data.start ?? null,
  end: data.end ?? null,
  venue: data.venue ?? null,
  attendees: data.attendees ?? null,
  featured: data.featured === true,
  image: data.image ?? null,
  registerUrl: data.registerUrl ?? null,
  postUrl: data.postUrl ?? null,
}))

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
