#!/usr/bin/env node
// Validates every event file in src/data/events/*.json.
// Run by hand:   npm run validate:events
// Runs automatically before `npm run build` (see "prebuild" in package.json),
// so a mistake in an event file fails the build instead of breaking the site.
// Exit code 1 = at least one error.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.env.EVENTS_ROOT || '.'
const EVENTS_DIR = join(ROOT, 'src/data/events')
const PUBLIC_DIR = join(ROOT, 'public')

const CATEGORIES = ['Conference', 'Workshop', 'Hackathon', 'Speaker Night', 'Meetup']
const ALLOWED_KEYS = new Set([
  'title', 'category', 'description', 'start', 'end',
  'venue', 'attendees', 'featured', 'image', 'registerUrl',
])
const REQUIRED_KEYS = ['title', 'category', 'description']
const MAX_IMAGE_KB = 200

const errors = []
const warnings = []
const fail = (file, msg) => errors.push(`${file}: ${msg}`)
const warn = (file, msg) => warnings.push(`${file}: ${msg}`)

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

if (!existsSync(EVENTS_DIR)) {
  console.error(`Folder not found: ${EVENTS_DIR}`)
  process.exit(1)
}

const files = readdirSync(EVENTS_DIR).sort()
let eventCount = 0

for (const file of files) {
  if (file.endsWith('.example') || file.startsWith('.')) continue
  if (!file.endsWith('.json')) {
    warn(file, 'ignored (not a .json file)')
    continue
  }
  eventCount += 1

  const slug = file.slice(0, -'.json'.length)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail(file, 'file name must be lowercase words joined by hyphens, e.g. "women-in-ai-meetup.json"')
  }

  let data
  try {
    data = JSON.parse(readFileSync(join(EVENTS_DIR, file), 'utf8'))
  } catch (e) {
    fail(file, `not valid JSON (${e.message}). Check for a missing comma, quote or bracket.`)
    continue
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    fail(file, 'must contain a single JSON object { ... }, not a list')
    continue
  }

  for (const key of Object.keys(data)) {
    if (!ALLOWED_KEYS.has(key)) {
      fail(file, `unknown field "${key}" (typo?). Allowed: ${[...ALLOWED_KEYS].join(', ')}`)
    }
  }
  for (const key of REQUIRED_KEYS) {
    if (typeof data[key] !== 'string' || data[key].trim() === '') {
      fail(file, `"${key}" is required and must be non-empty text`)
    }
  }

  if (typeof data.title === 'string' && data.title.length > 80) {
    fail(file, `"title" is ${data.title.length} characters; keep it to 80 or fewer`)
  }
  if (typeof data.description === 'string') {
    if (data.description.length > 240) fail(file, `"description" is ${data.description.length} characters; keep it to 240 or fewer`)
    else if (data.description.length > 160) warn(file, `"description" is ${data.description.length} characters; the card may cut it off`)
  }
  if (typeof data.category === 'string' && !CATEGORIES.includes(data.category)) {
    fail(file, `"category" must be exactly one of: ${CATEGORIES.join(', ')} (got "${data.category}")`)
  }

  const dates = {}
  for (const key of ['start', 'end']) {
    const v = data[key]
    if (v === undefined || v === null) continue
    if (typeof v !== 'string') { fail(file, `"${key}" must be text like "2024-10", "2026-11-15" or "2026-11-15T10:00:00+05:30", or null`); continue }
    const ms = parseDate(v)
    if (ms === null) fail(file, `"${key}" is not a valid date: "${v}". Use 2024-10, 2026-11-15 or 2026-11-15T10:00:00+05:30`)
    else dates[key] = ms
  }
  if (data.end != null && data.start == null) fail(file, '"end" is set but "start" is null')
  if (dates.start !== undefined && dates.end !== undefined && dates.end < dates.start) {
    fail(file, '"end" is before "start"')
  }

  if (data.venue != null && (typeof data.venue !== 'string' || data.venue.trim() === '')) {
    fail(file, '"venue" must be text or null')
  }
  if (data.attendees != null && !(Number.isInteger(data.attendees) && data.attendees >= 0)) {
    fail(file, '"attendees" must be a whole number (no quotes) or null')
  }
  if (data.featured != null && typeof data.featured !== 'boolean') {
    fail(file, '"featured" must be true or false (no quotes)')
  }

  if (data.image != null) {
    if (typeof data.image !== 'string' || !/^\/events\/[A-Za-z0-9._-]+\.(webp|jpe?g|png)$/i.test(data.image)) {
      fail(file, '"image" must look like "/events/my-event.webp" (a .webp, .jpg or .png file in public/events/) or null')
    } else {
      const imagePath = join(PUBLIC_DIR, data.image)
      if (!existsSync(imagePath)) {
        fail(file, `image file not found: public${data.image}`)
      } else {
        const kb = Math.round(statSync(imagePath).size / 1024)
        if (kb > MAX_IMAGE_KB) warn(file, `image is ${kb} KB; try to keep event images under ${MAX_IMAGE_KB} KB`)
      }
    }
  }

  if (data.registerUrl != null) {
    let ok = false
    try { ok = new URL(data.registerUrl).protocol === 'https:' } catch { /* invalid */ }
    if (!ok) fail(file, '"registerUrl" must be a full https:// link or null')
  }
}

for (const w of warnings) console.warn(`warning  ${w}`)
if (errors.length) {
  console.error(`\n${errors.length} problem${errors.length === 1 ? '' : 's'} in the events data:\n`)
  for (const e of errors) console.error(`  error  ${e}`)
  console.error('\nFix these and run "npm run validate:events" again.')
  process.exit(1)
}
console.log(`events: ${eventCount} file${eventCount === 1 ? '' : 's'} checked, all valid`)
