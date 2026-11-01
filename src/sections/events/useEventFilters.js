import { useMemo, useState } from 'react'
import { EVENT_TAGS, tagLabel } from './eventTags.js'
import { getChapters } from './loadEvents.js'

// Filter state shared by the Events section and the All events page (the components that use it
// are in EventFilters.jsx). The pill style lives in components/filterStyles.js, shared with Blogs.
export { pillClass } from '../../components/filterStyles.js'

// How several selected tags combine. Narrowing: an event must have ALL of them. To show events
// with ANY of them instead, change every() to some().
export function matchesTags(event, selectedTags) {
  return selectedTags.length === 0 || selectedTags.every((tag) => event.tags.includes(tag))
}

// location: "" (all), "city:<cityId>" or "chapter:<chapter id>", the Location dropdown's values
export function matchesLocation(event, location) {
  if (location.startsWith('city:')) return event.cityId === location.slice('city:'.length)
  if (location.startsWith('chapter:')) return event.chapterId === location.slice('chapter:'.length)
  return true
}

// Every value the Location dropdown can have, from getChapters()
function locationValues(chapters) {
  const values = new Set([''])
  for (const { cityId, chapters: list } of chapters) {
    values.add(`city:${cityId}`)
    for (const { id } of list) values.add(`chapter:${id}`)
  }
  return values
}

// /events?city=<cityId>&chapter=<id>&tag=<id>&tag=<id> -> { location, tags }. Unknown values are
// ignored; with both city and chapter, chapter wins.
export function filtersFromSearch(search, chapters = getChapters()) {
  const params = new URLSearchParams(search)
  const values = locationValues(chapters)
  const chapter = `chapter:${params.get('chapter')}`
  const city = `city:${params.get('city')}`
  const location = params.has('chapter') && values.has(chapter) ? chapter : params.has('city') && values.has(city) ? city : ''
  const asked = params.getAll('tag')
  const tags = EVENT_TAGS.map((t) => t.id).filter((id) => asked.includes(id))
  return { location, tags }
}

// The other way round: "?city=chennai&tag=community", or "" when no filter is on. The search
// text stays out of the address.
export function filtersToSearch({ location, selectedTags }) {
  const params = new URLSearchParams()
  if (location.startsWith('city:')) params.set('city', location.slice('city:'.length))
  if (location.startsWith('chapter:')) params.set('chapter', location.slice('chapter:'.length))
  for (const tag of selectedTags) params.append('tag', tag)
  const text = params.toString()
  return text ? `?${text}` : ''
}

// Search text + any number of selected tags ([] = all) + a location, applied to `events` without
// reordering them. availableTags: the tag ids (in EVENT_TAGS order) that at least one event has,
// over all events, so a tag with no events gets no pill.
// initial: { location, tags } to start from (e.g. from the address), read on the first render only.
export function useEventFilters(events, initial) {
  const chapters = useMemo(() => getChapters(), [])
  const [query, setQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState(() => initial?.tags ?? []) // [] = all
  const [savedLocation, setLocation] = useState(() => initial?.location ?? '')

  // A location that no longer exists counts as "All locations"
  const location = locationValues(chapters).has(savedLocation) ? savedLocation : ''

  const availableTags = useMemo(
    () => EVENT_TAGS.map(({ id }) => id).filter((id) => events.some((event) => event.tags.includes(id))),
    [events],
  )
  // A tag with no events has no pill to turn it off, so it doesn't count
  const activeTags = useMemo(() => selectedTags.filter((id) => availableTags.includes(id)), [selectedTags, availableTags])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events.filter((event) => {
      const searchable = [event.title, event.description, event.format, event.venue, event.locationLabel, ...event.partners, ...event.tags.map(tagLabel)]
      const matchesQuery = q ? searchable.filter(Boolean).join(' ').toLowerCase().includes(q) : true
      return matchesQuery && matchesTags(event, activeTags) && matchesLocation(event, location)
    })
  }, [events, query, activeTags, location])

  // Turns one tag on or off; keeps the EVENT_TAGS order
  const toggleTag = (id) =>
    setSelectedTags((current) =>
      current.includes(id) ? current.filter((t) => t !== id) : EVENT_TAGS.map((t) => t.id).filter((t) => t === id || current.includes(t)),
    )
  const clearTags = () => setSelectedTags([])

  const clearAll = () => {
    setQuery('')
    setSelectedTags([])
    setLocation('')
  }

  return {
    query,
    setQuery,
    selectedTags: activeTags,
    toggleTag,
    clearTags,
    availableTags,
    chapters,
    location,
    setLocation,
    filtered,
    clearAll,
  }
}
