// The event tags: the one list behind the filter pills, the tag pills on cards and the
// timeline, and the validator (scripts/validate-events.mjs). Plain module with no imports, so
// Node can load it too. Each event's "tags" (src/data/events/*.json) holds ids from here.
// Rule for adding a tag to an event: only if the event's post or page supports it. When unsure,
// leave it off.
export const EVENT_TAGS = [
  { id: 'women-only', label: 'Women-only', description: 'Attendance is limited to women.' },
  { id: 'entrepreneurship', label: 'Entrepreneurship', description: 'Startups, founders, pitching and business.' },
  { id: 'collaborated', label: 'Collaborated', description: 'Co-organised with another community, company or college.' },
  { id: 'tech-skills', label: 'Tech & skills', description: 'Hands-on learning, build sprints and hackathons.' },
  { id: 'community', label: 'Community', description: 'Meetups, conferences and networking.' },
]

export const TAG_IDS = EVENT_TAGS.map((tag) => tag.id)

// An event with this tag must list at least one partner (checked by the validator)
export const COLLABORATED_TAG = 'collaborated'

// "collaborated" -> "Collaborated"; an unknown id comes back as it is
export function tagLabel(id) {
  return EVENT_TAGS.find((tag) => tag.id === id)?.label ?? id
}
