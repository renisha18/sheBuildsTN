import { useId } from 'react'
import { EVENT_TAGS, tagLabel } from './eventTags.js'
import { SEARCH_ICON_CLASS, SEARCH_INPUT_CLASS, SELECT_ARROW_CLASS, SELECT_CLASS, pillClass } from '../../components/filterStyles.js'

// Search, tag pills and the empty state, shared by the Events section and the All events page.
// The filter state lives in useEventFilters.js; the pill and search styles in filterStyles.js.

// Location: "All locations", then per city "All of <city>" and its chapters (from getChapters()).
// Shown even with a single chapter. The visible label is for phones; elsewhere the aria-label
// names it.
function LocationSelect({ chapters, location, setLocation }) {
  const id = useId()
  return (
    <div className="flex w-full max-w-sm flex-col gap-1 xl:w-64 xl:shrink-0 max-sm:max-w-none">
      <label htmlFor={id} className="font-body text-sm font-bold text-ink sm:sr-only">
        Location
      </label>
      <div className="relative">
        <select
          id={id}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          aria-label="Filter by location"
          className={SELECT_CLASS}
        >
          <option value="">All locations</option>
          {chapters.map(({ city, cityId, chapters: list }) => (
            <optgroup key={cityId} label={city}>
              <option value={`city:${cityId}`}>All of {city}</option>
              {list.map(({ id: chapterId, name }) => (
                <option key={chapterId} value={`chapter:${chapterId}`}>
                  {name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <svg aria-hidden="true" viewBox="0 0 24 24" className={SELECT_ARROW_CLASS} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

// Search, then Location, then the pills: All, then one per tag that has events ("Collaborated").
// Several pills can be on at once; All turns them all off. A pill's tooltip is the tag's
// description. Search, location and tags narrow together.
export function EventFilters({ query, setQuery, selectedTags, toggleTag, clearTags, availableTags, chapters, location, setLocation }) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
      <div className="relative w-full max-w-sm xl:flex-1 max-sm:max-w-none">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={SEARCH_ICON_CLASS}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search events, topics, or hosts"
          aria-label="Search events, topics, or hosts"
          className={SEARCH_INPUT_CLASS}
        />
      </div>

      <LocationSelect chapters={chapters} location={location} setLocation={setLocation} />

      <div className="flex flex-wrap gap-3" role="group" aria-label="Filter events by tag">
        <button type="button" aria-pressed={selectedTags.length === 0} onClick={clearTags} className={pillClass(selectedTags.length === 0)}>
          All
        </button>
        {EVENT_TAGS.filter(({ id }) => availableTags.includes(id)).map(({ id, label, description }) => {
          const isActive = selectedTags.includes(id)
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isActive}
              title={description}
              onClick={() => toggleTag(id)}
              className={pillClass(isActive)}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// totalCount: how many events exist before filtering (0 = none at all)
export function EventsEmpty({ totalCount, selectedTags, clearAll }) {
  const inTags = selectedTags.length ? ` in ${selectedTags.map(tagLabel).join(' + ')}` : ''
  return (
    <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4 rounded-xs border-4 border-ink bg-surface p-8 text-center shadow-brutal-lg">
      <p className="font-display text-xl font-bold text-ink">No events found</p>
      <p className="font-body text-sm text-muted">
        {totalCount === 0
          ? 'There are no events to show yet.'
          : `Nothing matches that search${inTags}. Try a different term or clear the filters.`}
      </p>
      <button type="button" onClick={clearAll} className={pillClass(false)}>
        Clear filters
      </button>
    </div>
  )
}
