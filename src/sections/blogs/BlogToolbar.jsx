import { CATEGORIES } from './blogsData.js'
import { SEARCH_ICON_CLASS, SEARCH_INPUT_CLASS, pillClass } from '../../components/filterStyles.js'

// Search + category chips, shared by the home section and the All blogs page.
// category null = "All Posts". idPrefix keeps the input id unique per page.
// Styled exactly like the Events search box and filter pills (components/filterStyles.js).
export default function BlogToolbar({ query, onQueryChange, category, onCategoryChange, idPrefix = 'blogs' }) {
  const chip = (value, label) => {
    const isActive = category === value
    return (
      <button
        key={label}
        type="button"
        aria-pressed={isActive}
        onClick={() => onCategoryChange(value)}
        className={`${pillClass(isActive)} shrink-0 whitespace-nowrap`}
      >
        {label}
      </button>
    )
  }

  return (
    <div className="blogs__toolbar">
      <div className="blogs__search">
        <svg aria-hidden="true" viewBox="0 0 24 24" className={SEARCH_ICON_CLASS} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <label htmlFor={`${idPrefix}-search`} className="blogs__sr-only">
          Search stories
        </label>
        <input
          id={`${idPrefix}-search`}
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search stories"
          className={SEARCH_INPUT_CLASS}
        />
      </div>

      <div className="blogs__chips" role="group" aria-label="Filter stories by category">
        {chip(null, 'All Posts')}
        {CATEGORIES.map((c) => chip(c, c))}
      </div>
    </div>
  )
}
