// The City and Chapter dropdowns share one small bit of logic, kept here as plain
// functions (no React) so it is easy to test.
//
// cities is what getChapters() returns:
//   [{ city: 'Chennai', cityId: 'chennai', chapters: [{ id, name, college }] }]
// A selection is { city: '' | cityId, chapter: '' | chapterId }.

export const NO_LOCATION = { city: '', chapter: '' }

function findChapter(cities, chapterId) {
  for (const group of cities) {
    const chapter = group.chapters.find((c) => c.id === chapterId)
    if (chapter) return { chapter, group }
  }
  return null
}

/** Options for the City dropdown. */
export function cityChoices(cities) {
  return [{ value: '', label: 'All cities' }, ...cities.map((g) => ({ value: g.cityId, label: g.city }))]
}

/**
 * Options for the Chapter dropdown: the chapters of the chosen city, or of every
 * city (with the city shown as a small hint) when no city is chosen.
 */
export function chapterChoices(cities, cityId) {
  const groups = cityId ? cities.filter((g) => g.cityId === cityId) : cities
  const showCity = !cityId
  return [
    { value: '', label: 'All chapters' },
    ...groups.flatMap((g) =>
      g.chapters.map((c) => ({ value: c.id, label: c.name, ...(showCity ? { hint: g.city } : {}) })),
    ),
  ]
}

/**
 * The user picked a city. "All cities" clears both boxes. Otherwise a chosen chapter is
 * kept only if it belongs to that city.
 */
export function pickCity(selection, cityId, cities) {
  if (!cityId) return { city: '', chapter: '' }
  const found = selection.chapter ? findChapter(cities, selection.chapter) : null
  const keep = found && found.group.cityId === cityId
  return { city: cityId, chapter: keep ? selection.chapter : '' }
}

/** The user picked a chapter. The city follows the chapter, so the two always agree. */
export function pickChapter(selection, chapterId, cities) {
  if (!chapterId) return { city: selection.city, chapter: '' }
  const found = findChapter(cities, chapterId)
  return found ? { city: found.group.cityId, chapter: chapterId } : selection
}

/** Clean a selection that came from the address bar. Unknown values are dropped; a chapter wins over a city. */
export function normalizeSelection(selection, cities) {
  const chapter = selection.chapter ? findChapter(cities, selection.chapter) : null
  if (chapter) return { city: chapter.group.cityId, chapter: chapter.chapter.id }
  const city = cities.find((g) => g.cityId === selection.city)
  return { city: city ? city.cityId : '', chapter: '' }
}

/** Does this event pass the location filter? */
export function matchesLocation(event, selection) {
  if (selection.chapter) return event.chapterId === selection.chapter
  if (selection.city) return event.cityId === selection.city
  return true
}
