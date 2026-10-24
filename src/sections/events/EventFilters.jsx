import { EVENT_TAGS, tagLabel } from './eventTags.js'
import { pillClass } from './useEventFilters.js'

// Search, tag pills and the empty state, shared by the Events section and the All events page.
// The filter state (useEventFilters) and pillClass live in useEventFilters.js.

// Pills: All, then one per tag that has events ("Collaborated · 3"). Several can be on at once;
// All turns them all off. A pill's tooltip is the tag's description.
export function EventFilters({ query, setQuery, selectedTags, toggleTag, clearTags, tagCounts }) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
      <div className="relative w-full max-w-sm xl:flex-1 max-sm:max-w-none">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
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
          className="w-full rounded-full border-2 border-ink bg-surface py-2.5 pl-11 pr-4 font-body text-ink placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        />
      </div>

      <div className="flex flex-wrap gap-3" role="group" aria-label="Filter events by tag">
        <button type="button" aria-pressed={selectedTags.length === 0} onClick={clearTags} className={pillClass(selectedTags.length === 0)}>
          All
        </button>
        {EVENT_TAGS.filter(({ id }) => tagCounts[id] > 0).map(({ id, label, description }) => {
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
              {label} · {tagCounts[id]}
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
