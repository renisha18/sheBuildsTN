import { EVENT_TAGS, tagLabel } from './eventTags.js'
import { chapterChoices, cityChoices } from './locationFilter.js'
import ThemedSelect from '../../components/ThemedSelect.jsx'
import { SEARCH_ICON_CLASS, SEARCH_INPUT_CLASS, pillClass } from '../../components/filterStyles.js'

// Search, tag pills and the empty state, shared by the Events section and the All events page.
// The filter state lives in useEventFilters.js; the pill and search styles in filterStyles.js.

// Search, City, Chapter, then the pills: All, then one per tag that has events ("Collaborated").
// Several pills can be on at once; All turns them all off. A pill's tooltip is the tag's
// description. Search, location and tags narrow together.
// 640px and up everything wraps onto as many rows as it needs; below that search, City and
// Chapter stack full width (ThemedSelect.css), then the pills. --tsel-height = the search box's
// height (py-2.5 + a 1.5rem line + 2px borders), so all the pills line up.
export function EventFilters({ query, setQuery, selectedTags, toggleTag, clearTags, availableTags, cities, selection, setCity, setChapter }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center" style={{ '--tsel-height': '3rem' }}>
      <div className="relative w-full max-w-sm sm:min-w-48 sm:flex-1 max-sm:max-w-none">
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

      <ThemedSelect label="City" value={selection.city} onChange={setCity} options={cityChoices(cities)} />
      <ThemedSelect label="Chapter" value={selection.chapter} onChange={setChapter} options={chapterChoices(cities, selection.city)} />

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
