// Event formats (the kind of event). An event's optional "format" (src/data/events/*.json) must be
// exactly one of these; scripts/validate-events.mjs checks that before each build. Shown as a
// small label on cards; the filters use the tags in eventTags.js instead.
// The events themselves are loaded by loadEvents.js.
export const EVENT_FORMATS = ['Conference', 'Workshop', 'Hackathon', 'Speaker Night', 'Meetup']

// Where "Add it with a pull request" on the All events page points: the Add an event guide.
// One place to change it.
export const ADD_EVENT_URL = 'https://github.com/renisha18/sheBuildsTN/blob/main/docs/add-event.md'

// Shown when there are no upcoming events
export const INSTAGRAM_URL = 'https://www.instagram.com/shebuilds_chennai/'
