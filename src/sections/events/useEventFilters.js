import { useMemo, useState } from 'react'
import { EVENT_TAGS, tagLabel } from './eventTags.js'
import { getChapters } from './loadEvents.js'
import { NO_LOCATION, matchesLocation, normalizeSelection, pickChapter, pickCity } from './locationFilter.js'

// Filter state shared by the Events section and the All events page (the components that use it
// are in EventFilters.jsx). The pill style lives in components/filterStyles.js, shared with Blogs.
export { pillClass } from '../../components/filterStyles.js'

// How several selected tags combine. Narrowing: an event must have ALL of them. To show events
// with ANY of them instead, change every() to some().
export function matchesTags(event, selectedTags) {
  return selectedTags.length === 0 || selectedTags.every((tag) => event.tags.includes(tag))
}

// /events?city=<cityId>&chapter=<id>&tag=<id>&tag=<id> -> { selection, tags }. Unknown values
// are ignored; with both city and chapter, the chapter wins (normalizeSelection).
export function filtersFromSearch(search, cities = getChapters()) {
  const params = new URLSearchParams(search)
  const selection = normalizeSelection({ city: params.get('city') ?? '', chapter: params.get('chapter') ?? '' }, cities)
  const asked = params.getAll('tag')
  const tags = EVENT_TAGS.map((t) => t.id).filter((id) => asked.includes(id))
  return { selection, tags }
}

// The other way round: "?chapter=rec-chennai&tag=community", "?city=chennai", or "" when no
// filter is on. A chosen chapter writes only `chapter`. The search text stays out of the address.
export function filtersToSearch({ selection, selectedTags }) {
  const params = new URLSearchParams()
  if (selection.chapter) params.set('chapter', selection.chapter)
  else if (selection.city) params.set('city', selection.city)
  for (const tag of selectedTags) params.append('tag', tag)
  const text = params.toString()
  return text ? `?${text}` : ''
}

// Search text + any number of selected tags ([] = all) + a city/chapter selection, applied to `events` without
// reordering them. availableTags: the tag ids (in EVENT_TAGS order) that at least one event has,
// over all events, so a tag with no events gets no pill.
// initial: { selection, tags } to start from (e.g. from the address), read on the first render only.
export function useEventFilters(events, initial) {
  const cities = useMemo(() => getChapters(), [])
  const [query, setQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState(() => initial?.tags ?? []) // [] = all
  const [saved, setSaved] = useState(() => initial?.selection ?? NO_LOCATION) // { city, chapter }

  // Normalised against the current chapters, so a city or chapter that no longer exists drops out
  const selection = useMemo(() => normalizeSelection(saved, cities), [saved, cities])
  const setCity = (value) => setSaved(pickCity(selection, value, cities))
  const setChapter = (value) => setSaved(pickChapter(selection, value, cities))

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
      return matchesQuery && matchesTags(event, activeTags) && matchesLocation(event, selection)
    })
  }, [events, query, activeTags, selection])

  // Turns one tag on or off; keeps the EVENT_TAGS order
  const toggleTag = (id) =>
    setSelectedTags((current) =>
      current.includes(id) ? current.filter((t) => t !== id) : EVENT_TAGS.map((t) => t.id).filter((t) => t === id || current.includes(t)),
    )
  const clearTags = () => setSelectedTags([])

  const clearAll = () => {
    setQuery('')
    setSelectedTags([])
    setSaved(NO_LOCATION)
  }

  return {
    query,
    setQuery,
    selectedTags: activeTags,
    toggleTag,
    clearTags,
    availableTags,
    cities,
    selection,
    setCity,
    setChapter,
    filtered,
    clearAll,
  }
}
