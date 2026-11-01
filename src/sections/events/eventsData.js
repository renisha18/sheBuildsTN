// Event formats (the kind of event). An event's optional "format" (src/data/chapters/*.json) must
// be exactly one of these; scripts/validate-events.mjs checks that before each build. Shown as a
// small label on cards; the filters use the tags in eventTags.js instead.
// The events themselves are loaded by loadEvents.js. Plain module with no imports, so Node can
// load it too.
export const EVENT_FORMATS = ['Conference', 'Workshop', 'Hackathon', 'Speaker Night', 'Meetup']

// Where "Add it with a pull request" on the All events page points: the Add an event guide.
// One place to change it.
export const ADD_EVENT_URL = 'https://github.com/renisha18/sheBuildsTN/blob/main/docs/add-event.md'

// Shown when there are no upcoming events
export const INSTAGRAM_URL = 'https://www.instagram.com/shebuilds_chennai/'

// "Code & Connect 3.0" -> "code-connect-30": lowercase, spaces to hyphens, then only letters,
// digits and hyphens (one at a time, none at either end). Used for cityId and event ids.
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{M}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// An event's stable id, from its chapter file, start and title (the validator rejects two the same)
export const eventId = (chapterId, start, title) => `${chapterId}-${start ?? 'tba'}-${slugify(title)}`
