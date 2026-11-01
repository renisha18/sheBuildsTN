#!/usr/bin/env node
// Validates every chapter file in src/data/chapters/*.json (one per chapter, each with a list of
// events). Files whose name starts with "_" are ignored, like the template.
// Run by hand:   npm run validate:events
// Runs automatically before `npm run build` (see "prebuild" in package.json),
// so a mistake in a chapter file fails the build instead of breaking the site.
// Exit code 1 = at least one error. Warnings are printed but don't fail the build.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
// Shared with the site, so the tag list, formats and the past/upcoming rule exist once
import { COLLABORATED_TAG, TAG_IDS } from '../src/sections/events/eventTags.js'
import { EVENT_FORMATS, eventId } from '../src/sections/events/eventsData.js'
import { isPastEvent } from '../src/sections/events/eventDates.js'

const ROOT = process.env.EVENTS_ROOT || '.'
const CHAPTERS_DIR = join(ROOT, 'src/data/chapters')
const OLD_EVENTS_DIR = join(ROOT, 'src/data/events')
const PUBLIC_DIR = join(ROOT, 'public')

const CHAPTER_KEYS = new Set(['id', 'name', 'college', 'city', 'events'])
const ALLOWED_KEYS = new Set([
  'title', 'description', 'tags', 'format', 'partners', 'attendees', 'start', 'end',
  'venue', 'featured', 'image', 'registerUrl', 'postUrl',
])
const REMOVED_TAG = 'tech-skills'
const ID_FORMAT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const REQUIRED_KEYS = ['title', 'description']
const NOW = new Date()

const isText = (v) => typeof v === 'string' && v.trim() !== ''
const isHttps = (v) => {
  try { return new URL(v).protocol === 'https:' } catch { return false }
}
const MAX_IMAGE_KB = 200

const errors = []
const warnings = []
// `where` is the file name, or the file and the event's title ("x.json › "Title"")
const fail = (where, msg) => errors.push(`${where}: ${msg}`)
const warn = (where, msg) => warnings.push(`${where}: ${msg}`)

// Accepts three forms (use the most exact one you know):
//   "2024-10"                    month only    -> shown as "Oct 2024"
//   "2026-11-15"                 a day         -> shown as "15 Nov 2026"
//   "2026-11-15T10:00:00+05:30"  day and time  (seconds optional, "Z" also ok)
// Impossible dates such as 2026-02-31 or hour 25 are rejected.
// Returns a number for comparing dates (month = its first day), or null.
function parseDate(value) {
  let m = /^(\d{4})-(\d{2})$/.exec(value)
  if (m) {
    const [y, mo] = [Number(m[1]), Number(m[2])]
    return mo >= 1 && mo <= 12 ? Date.UTC(y, mo - 1, 1) : null
  }
  m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (m) {
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
    const check = new Date(Date.UTC(y, mo - 1, d))
    const ok = check.getUTCFullYear() === y && check.getUTCMonth() === mo - 1 && check.getUTCDate() === d
    return ok ? check.getTime() : null
  }
  m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(Z|[+-]\d{2}:\d{2})$/.exec(value)
  if (!m) return null
  const [y, mo, d, h, mi] = [m[1], m[2], m[3], m[4], m[5]].map(Number)
  const s = Number(m[6] ?? 0)
  const tz = m[7]
  const check = new Date(Date.UTC(y, mo - 1, d, h, mi, s))
  const sameParts =
    check.getUTCFullYear() === y && check.getUTCMonth() === mo - 1 &&
    check.getUTCDate() === d && check.getUTCHours() === h &&
    check.getUTCMinutes() === mi && check.getUTCSeconds() === s
  if (!sameParts) return null
  if (tz !== 'Z') {
    const [th, tm] = tz.slice(1).split(':').map(Number)
    if (th > 14 || tm > 59) return null
  }
  const ms = Date.parse(value)
  return Number.isNaN(ms) ? null : ms
}

// One event in a chapter file: the same rules as when each event was its own file
function checkEvent(where, data, chapterId, seenIds) {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    fail(where, 'each event must be a { ... } block')
    return
  }

  for (const key of Object.keys(data)) {
    if (key === 'chapter') {
      fail(where, 'chapter is set by the file; remove it')
    } else if (key === 'category') {
      fail(where, '"category" is the old field: rename it to "format"')
    } else if (!ALLOWED_KEYS.has(key)) {
      fail(where, `unknown field "${key}" (typo?). Allowed: ${[...ALLOWED_KEYS].join(', ')}`)
    }
  }
  for (const key of REQUIRED_KEYS) {
    if (typeof data[key] !== 'string' || data[key].trim() === '') {
      fail(where, `"${key}" is required and must be non-empty text`)
    }
  }

  if (typeof data.title === 'string' && data.title.length > 80) {
    fail(where, `"title" is ${data.title.length} characters; keep it to 80 or fewer`)
  }
  if (typeof data.description === 'string') {
    if (data.description.length > 240) fail(where, `"description" is ${data.description.length} characters; keep it to 240 or fewer`)
    else if (data.description.length > 160) warn(where, `"description" is ${data.description.length} characters; the card may cut it off`)
  }

  // tags: optional (left out or []); every one a known id, listed once
  const tags = data.tags
  if (tags != null && !Array.isArray(tags)) {
    fail(where, `"tags" must be a list, e.g. ["community"], or [] (known tags: ${TAG_IDS.join(', ')})`)
  } else if (Array.isArray(tags)) {
    const seen = new Set()
    for (const tag of tags) {
      if (tag === REMOVED_TAG) fail(where, `${REMOVED_TAG} was removed; delete it from tags`)
      else if (!TAG_IDS.includes(tag)) fail(where, `unknown tag "${tag}". Use: ${TAG_IDS.join(', ')}`)
      else if (seen.has(tag)) fail(where, `tag "${tag}" is listed twice`)
      seen.add(tag)
    }
  }
  const collaborated = Array.isArray(tags) && tags.includes(COLLABORATED_TAG)

  // partners: optional list of names; at least one when tagged "collaborated"
  const partners = data.partners
  if (partners != null && (!Array.isArray(partners) || !partners.every(isText))) {
    fail(where, '"partners" must be a list of names, e.g. ["GDG Chennai"]')
  }
  const hasPartners = Array.isArray(partners) && partners.length > 0
  if (collaborated && !hasPartners) fail(where, `tagged "${COLLABORATED_TAG}" but "partners" lists no one (add at least one name)`)
  if (hasPartners && !collaborated) warn(where, `"partners" is set but the event isn't tagged "${COLLABORATED_TAG}"`)

  if (data.attendees != null && !(Number.isInteger(data.attendees) && data.attendees >= 0)) {
    fail(where, '"attendees" must be a whole number without quotes, or null')
  }

  if (data.format != null && !EVENT_FORMATS.includes(data.format)) {
    fail(where, `"format" must be exactly one of: ${EVENT_FORMATS.join(', ')} (got "${data.format}")`)
  }

  const dates = {}
  for (const key of ['start', 'end']) {
    const v = data[key]
    if (v === undefined || v === null) continue
    if (typeof v !== 'string') { fail(where, `"${key}" must be text like "2024-10", "2026-11-15" or "2026-11-15T10:00:00+05:30", or null`); continue }
    const ms = parseDate(v)
    if (ms === null) fail(where, `"${key}" is not a valid date: "${v}". Use 2024-10, 2026-11-15 or 2026-11-15T10:00:00+05:30`)
    else dates[key] = ms
  }
  if (data.end != null && data.start == null) fail(where, '"end" is set but "start" is null')
  if (dates.start !== undefined && dates.end !== undefined && dates.end < dates.start) {
    fail(where, '"end" is before "start"')
  }

  if (data.venue != null && (typeof data.venue !== 'string' || data.venue.trim() === '')) {
    fail(where, '"venue" must be text or null')
  }
  if (data.featured != null && typeof data.featured !== 'boolean') {
    fail(where, '"featured" must be true or false (no quotes)')
  }

  if (data.image != null) {
    if (typeof data.image !== 'string' || !/^\/events\/[A-Za-z0-9._-]+\.(webp|jpe?g|png)$/i.test(data.image)) {
      fail(where, '"image" must look like "/events/my-event.webp" (a .webp, .jpg or .png file in public/events/) or null')
    } else {
      const imagePath = join(PUBLIC_DIR, data.image)
      if (!existsSync(imagePath)) {
        fail(where, `image file not found: public${data.image}`)
      } else {
        const kb = Math.round(statSync(imagePath).size / 1024)
        if (kb > MAX_IMAGE_KB) warn(where, `image is ${kb} KB; try to keep event images under ${MAX_IMAGE_KB} KB`)
      }
    }
  }

  for (const key of ['registerUrl', 'postUrl']) {
    if (data[key] != null && !isHttps(data[key])) fail(where, `"${key}" must be a full https:// link or null`)
  }

  // Past events should link to the post about them, so they can be checked
  if (dates.start !== undefined && data.postUrl == null && isPastEvent({ start: data.start, end: data.end }, NOW)) {
    warn(where, 'past event with no "postUrl" (no source link)')
  }

  // The site's id for the event (chapter, start, title) must be unique
  if (typeof data.title === 'string') {
    const id = eventId(chapterId, data.start ?? null, data.title)
    if (seenIds.has(id)) fail(where, `same chapter, start and title as ${seenIds.get(id)}; change the title or the date`)
    else seenIds.set(id, where)
  }
}

if (!existsSync(CHAPTERS_DIR)) {
  console.error(`Folder not found: ${CHAPTERS_DIR}`)
  process.exit(1)
}

// Event files in the old place would be silently skipped by the site, so stop the build
if (existsSync(OLD_EVENTS_DIR)) {
  for (const file of readdirSync(OLD_EVENTS_DIR).filter((f) => f.endsWith('.json'))) {
    fail(`src/data/events/${file}`, 'events now go in your chapter\'s file in src/data/chapters/ (see docs/add-event.md)')
  }
}

const files = readdirSync(CHAPTERS_DIR).sort()
const seenIds = new Map()                // event id -> where it was first seen
const chapterNames = new Map()           // city key + name -> file
const citySpellings = new Map()          // city key -> Map(spelling -> [files])
// "Chennai", "chennai " and "Chen-nai" share a key
const cityKey = (city) => city.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]/gu, '')
let chapterCount = 0
let eventCount = 0

for (const file of files) {
  if (file.startsWith('_') || file.startsWith('.') || file.endsWith('.example') || file.endsWith('.md')) continue
  if (!file.endsWith('.json')) {
    warn(file, 'ignored (not a .json file)')
    continue
  }
  chapterCount += 1

  const fileId = file.slice(0, -'.json'.length)
  if (!ID_FORMAT.test(fileId)) {
    fail(file, 'file name must be lowercase letters, digits and hyphens, e.g. "rec-chennai.json"')
  }

  let data
  try {
    data = JSON.parse(readFileSync(join(CHAPTERS_DIR, file), 'utf8'))
  } catch (e) {
    fail(file, `not valid JSON (${e.message}). Check for a missing comma, quote or bracket.`)
    continue
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    fail(file, 'must contain a single JSON object { "id": ..., "city": ..., "events": [...] }')
    continue
  }

  for (const key of Object.keys(data)) {
    if (!CHAPTER_KEYS.has(key)) {
      fail(file, `unknown top-level field "${key}". Allowed: ${[...CHAPTER_KEYS].join(', ')} (event fields go inside "events")`)
    }
  }

  // id: same as the file name
  if (data.id === undefined) fail(file, `"id" is required: the file name without .json ("${fileId}")`)
  else if (typeof data.id !== 'string' || !ID_FORMAT.test(data.id)) fail(file, '"id" must be lowercase letters, digits and hyphens, e.g. "rec-chennai"')
  else if (data.id !== fileId) fail(file, `"id" is "${data.id}" but the file is ${file}; they must match`)

  if (data.city === undefined) fail(file, '"city" is required, e.g. "Chennai"')
  else if (!isText(data.city)) fail(file, '"city" must be non-empty text, e.g. "Chennai"')

  if (data.college != null && !isText(data.college)) fail(file, '"college" must be the college\'s name, or null')
  if (data.name != null && !isText(data.name)) fail(file, '"name" must be non-empty text or left out')
  if (data.college == null && !isText(data.name)) fail(file, '"college" is null, so "name" is required (the team\'s display name)')

  const displayName = isText(data.name) ? data.name : data.college
  if (isText(data.city)) {
    const key = cityKey(data.city)
    if (!citySpellings.has(key)) citySpellings.set(key, new Map())
    const spellings = citySpellings.get(key)
    spellings.set(data.city, [...(spellings.get(data.city) ?? []), file])

    if (isText(displayName)) {
      const nameKey = `${key}|${displayName.trim().toLowerCase()}`
      if (chapterNames.has(nameKey)) fail(file, `another chapter in ${data.city} is already called "${displayName}" (${chapterNames.get(nameKey)})`)
      else chapterNames.set(nameKey, file)
    }
  }

  if (data.events === undefined) {
    fail(file, '"events" is required: a list of events, or [] for none yet')
    continue
  }
  if (!Array.isArray(data.events)) {
    fail(file, '"events" must be a list [ ... ]')
    continue
  }
  if (data.events.length === 0) warn(file, '"events" is empty')

  data.events.forEach((event, i) => {
    eventCount += 1
    const title = event && typeof event.title === 'string' && event.title.trim() !== '' ? `"${event.title}"` : `event ${i + 1}`
    checkEvent(`${file} › ${title}`, event, isText(data.id) ? data.id : fileId, seenIds)
  })
}

// Two spellings of one city split the location list in two
for (const spellings of citySpellings.values()) {
  if (spellings.size < 2) continue
  const ranked = [...spellings].sort((a, b) => b[1].length - a[1].length)
  const list = ranked.map(([city, inFiles]) => `"${city}" (${inFiles.join(', ')})`).join(', ')
  warn('cities', `${list} look like the same city; use one spelling, e.g. "${ranked[0][0]}"`)
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
for (const w of warnings) console.warn(`warning  ${w}`)
if (errors.length) {
  console.error(`\n${plural(errors.length, 'problem')} in the events data:\n`)
  for (const e of errors) console.error(`  error  ${e}`)
  console.error('\nFix these and run "npm run validate:events" again.')
}
console.log(`\n${plural(chapterCount, 'chapter')}, ${plural(eventCount, 'event')}: ${plural(errors.length, 'error')}, ${plural(warnings.length, 'warning')}`)
if (errors.length) process.exit(1)
