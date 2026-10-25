// Search box and filter pill styles shared by the Events filters (home section and /events) and
// the Blogs toolbar, so both look exactly the same.

// Same pill as the navbar links: teal when active, white otherwise; presses into its shadow
export const pillClass = (isActive) =>
  [
    'inline-flex items-center gap-2 rounded-full border-2 border-ink px-5 py-2 font-body font-medium text-ink shadow-brutal-sm',
    'transition motion-reduce:transition-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
    isActive ? 'bg-accent-alt' : 'bg-surface hover:bg-accent-alt/20',
  ].join(' ')

// White search box with an ink border; its parent must be `relative` for the icon
export const SEARCH_INPUT_CLASS =
  'w-full rounded-full border-2 border-ink bg-surface py-2.5 pl-11 pr-4 font-body text-ink placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'

export const SEARCH_ICON_CLASS = 'pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted'
