// Event formats (the kind of event). An event's optional "format" (src/data/events/*.json) must be
// exactly one of these; scripts/validate-events.mjs checks that before each build. Shown as a
// small label on cards; the filters use the tags in eventTags.js instead.
// The events themselves are loaded by loadEvents.js.
export const EVENT_FORMATS = ['Conference', 'Workshop', 'Hackathon', 'Speaker Night', 'Meetup']

// Where "Add it with a pull request" on the All events page points. One place to change it
// (it will move to the CONTRIBUTING guide later).
export const ADD_EVENT_URL = 'https://github.com/renisha18/sheBuildsTN'

// Shown when there are no upcoming events
export const INSTAGRAM_URL = 'https://www.instagram.com/shebuilds_chennai/'
