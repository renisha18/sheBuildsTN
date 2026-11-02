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
// action (optional): one more element, e.g. the home page's "View all events" link, shown at the
// right-hand end of the pills' row. Without it the pills render exactly as before (All events page).
// Below 640px everything is compact so the cards come first: a 40px search box, City and Chapter
// side by side, then the pills (and action) on one line that scrolls sideways if it doesn't fit.

// Phone-only sizing for the pills (36px tall); 640px and up they keep pillClass's size
export const PHONE_PILL_CLASS = 'max-sm:shrink-0 max-sm:whitespace-nowrap max-sm:px-3 max-sm:py-1.5 max-sm:text-sm'

// Phone-only: one line that scrolls sideways (scrollbar hidden). p-1/-m-1 keep shadows and focus
// outlines visible inside the scroll box without shifting the row.
const PHONE_ROW_CLASS = 'max-sm:flex-nowrap max-sm:gap-2 max-sm:overflow-x-auto max-sm:scrollbar-none max-sm:-m-1 max-sm:p-1'

export function EventFilters({ query, setQuery, selectedTags, toggleTag, clearTags, availableTags, cities, selection, setCity, setChapter, action }) {
  const chips = (
    <>
      <button type="button" aria-pressed={selectedTags.length === 0} onClick={clearTags} className={`${pillClass(selectedTags.length === 0)} ${PHONE_PILL_CLASS}`}>
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
            className={`${pillClass(isActive)} ${PHONE_PILL_CLASS}`}
          >
            {label}
          </button>
        )
      })}
    </>
  )

  return (
    <div className="flex flex-col gap-2 sm:gap-4 sm:flex-row sm:flex-wrap sm:items-center" style={{ '--tsel-height': '3rem' }}>
      <div className="relative w-full max-w-sm sm:min-w-48 sm:flex-1 max-sm:max-w-none">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`${SEARCH_ICON_CLASS} max-sm:left-3.5 max-sm:h-4 max-sm:w-4`}
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
          className={`${SEARCH_INPUT_CLASS} max-sm:h-10 max-sm:py-0 max-sm:pl-9 max-sm:text-sm`}
        />
      </div>

      {/* Phones: two equal columns. 640px and up the wrapper is display: contents, so the dropdowns
          are items of the main row exactly as before. Chapter's list opens from its right edge. */}
      <div className="grid grid-cols-2 gap-2 sm:contents">
        <ThemedSelect label="City" value={selection.city} onChange={setCity} options={cityChoices(cities)} className="max-sm:text-sm" />
        <ThemedSelect label="Chapter" value={selection.chapter} onChange={setChapter} options={chapterChoices(cities, selection.city)} className="tsel--end max-sm:text-sm" />
      </div>

      {action ? (
        // One wrapping row for the pills and the action. The pill group is display: contents so
        // its pills are items of this row: the action then follows the last pill line, pushed
        // right by ml-auto (on phones it takes a line of its own, left-aligned). flex-auto, not
        // flex-1: the row keeps its natural width, so when it doesn't fit beside the dropdowns it
        // moves to a line of its own (and fills it) instead of squeezing the link onto a second line.
        <div className={`flex flex-wrap items-center gap-3 sm:flex-auto ${PHONE_ROW_CLASS}`}>
          <div className="contents" role="group" aria-label="Filter events by tag">
            {chips}
          </div>
          <div className="ml-auto max-sm:shrink-0">{action}</div>
        </div>
      ) : (
        <div className={`flex flex-wrap gap-3 ${PHONE_ROW_CLASS}`} role="group" aria-label="Filter events by tag">
          {chips}
        </div>
      )}
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
