// Event categories, in filter-pill order. Every event's "category" (src/data/events/*.json) must be
// exactly one of these; scripts/validate-events.mjs checks that before each build.
// The events themselves are loaded by loadEvents.js.
export const CATEGORIES = ['Conference', 'Workshop', 'Hackathon', 'Speaker Night', 'Meetup']
