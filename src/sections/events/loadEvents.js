// Events come from src/data/chapters/*.json: one file per chapter (one college, or a team such as
// the SheBuilds core team), holding { id, name, college, city, events: [...] }. Files whose name
// starts with "_" are ignored. scripts/validate-events.mjs checks those files before every build
// (npm run validate:events).
//
// Event fields: title, description, tags, format, partners, attendees, start, end, venue,
// featured, image, registerUrl, postUrl (see src/data/chapters/EVENTS-README.md). The chapter
// comes from the file, not the event.
// start/end are month-only "2024-10", date-only "2026-11-15" or a date-time
// "2026-11-15T10:00:00+05:30". Any optional field may be null. tags and partners are always
// arrays here (empty when missing).

import { parseEventDate } from './eventDates.js'
import { eventId, slugify } from './eventsData.js'

const modules = import.meta.glob('/src/data/chapters/*.json', { eager: true, import: 'default' })

const CHAPTERS = Object.keys(modules)
  .sort()
  .filter((path) => !path.slice(path.lastIndexOf('/') + 1).startsWith('_'))
  .map((path) => {
    const data = modules[path]
    const college = data.college ?? null
    return {
      id: path.slice(path.lastIndexOf('/') + 1, -'.json'.length),
      name: data.name ?? college,
      college,
      city: data.city,
      cityId: slugify(data.city),
      events: Array.isArray(data.events) ? data.events : [],
    }
  })

const EVENTS = CHAPTERS.flatMap((chapter) =>
  chapter.events.map((data) => ({
    id: eventId(chapter.id, data.start ?? null, data.title),
    title: data.title,
    description: data.description,
    tags: Array.isArray(data.tags) ? data.tags : [],
    format: data.format ?? null,
    partners: Array.isArray(data.partners) ? data.partners : [],
    attendees: data.attendees ?? null,
    start: data.start ?? null,
    end: data.end ?? null,
    venue: data.venue ?? null,
    featured: data.featured === true,
    image: data.image ?? null,
    registerUrl: data.registerUrl ?? null,
    postUrl: data.postUrl ?? null,
    chapterId: chapter.id,
    chapterName: chapter.name,
    college: chapter.college,
    city: chapter.city,
    cityId: chapter.cityId,
    locationLabel: chapter.college ? `${chapter.name} · ${chapter.city}` : chapter.name,
    // Kept for the components that still read it (the timeline pill, search)
    chapter: chapter.name,
  })),
)

// All events, nothing hidden, decided against `now` (call it at render time in the browser):
//   1. upcoming (not over yet), soonest start first
//   2. no start date, in file order (chapter files A to Z, then each file's list order)
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

const byText = (a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })

// The chapters grouped by city: [{ city, cityId, chapters: [{ id, name, college }] }].
// Cities A to Z; inside a city, teams that aren't a college (college null) first, then
// colleges A to Z.
export function getChapters() {
  const cities = new Map()
  for (const { id, name, college, city, cityId } of CHAPTERS) {
    if (!cities.has(cityId)) cities.set(cityId, { city, cityId, chapters: [] })
    cities.get(cityId).chapters.push({ id, name, college })
  }
  return [...cities.values()]
    .sort((a, b) => byText(a.city, b.city))
    .map((group) => ({
      ...group,
      chapters: group.chapters.sort((a, b) => {
        if ((a.college === null) !== (b.college === null)) return a.college === null ? -1 : 1
        return byText(a.college ?? a.name, b.college ?? b.name)
      }),
    }))
}
