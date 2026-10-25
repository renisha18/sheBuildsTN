import { useState } from 'react'
import { ADD_EVENT_URL, INSTAGRAM_URL } from './eventsData.js'
import { countLabel, dateLabel, yearId } from './eventTimeline.js'
import { eventLink } from './eventDates.js'
import { tagLabel } from './eventTags.js'
import './EventsTimeline.css'

// Existing coral pill button (same look as the event card's View Event button)
const LINK_BUTTON_CLASS =
  'inline-flex items-center gap-2 rounded-full border-2 border-ink bg-accent px-5 py-1.5 font-body text-sm font-bold text-ink shadow-brutal-sm transition motion-reduce:transition-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'

// The date as a <time> (or plain "TBA" when there is no start date)
function EventDate({ event, className }) {
  const label = dateLabel(event)
  return event.start ? (
    <time dateTime={event.start} className={className}>
      {label}
    </time>
  ) : (
    <span className={className}>{label}</span>
  )
}

function TimelineItem({ event, upcoming }) {
  const { title, venue, format, chapter, tags, description, featured } = event
  // Register / View post / nothing, decided once in eventDates.js
  const link = eventLink(event)
  const hasLabels = Boolean(format || chapter || tags.length || featured === true)
  // The photo shows only when there is one and it loads; if it fails, the whole block goes and the
  // text takes the full width (no broken-image icon)
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = typeof event.image === 'string' && event.image.trim() !== '' && !imageFailed

  return (
    <li className={`tl__item ${upcoming ? 'tl__item--upcoming' : 'tl__item--past'}`}>
      {/* Date column (640px and up); on phones the date moves into the card */}
      <EventDate event={event} className="tl__date" />
      <span className="tl__marker" aria-hidden="true" />

      <article className={`tl__card${showImage ? ' tl__card--image' : ''}`}>
        {/* Text first in the HTML; the photo's place (right, or above on phones) is set in the CSS */}
        <div className="tl__body">
          <EventDate event={event} className="tl__card-date" />

          {hasLabels && (
            <div className="tl__labels">
              {format && <span className="tl__label">{format}</span>}
              {chapter && <span className="tl__pill">{chapter}</span>}
              {tags.map((tag) => (
                <span key={tag} className="tl__pill">
                  {tagLabel(tag)}
                </span>
              ))}
              {featured === true && <span className="tl__featured">FEATURED</span>}
            </div>
          )}

          <h3 className="tl__title">{title}</h3>
          {venue && <p className="tl__venue">{venue}</p>}
          {description && <p className="tl__description">{description}</p>}

          {/* No link, no button: never a dead control */}
          {link && (
            <a href={link.href} target="_blank" rel="noopener noreferrer" className={`${LINK_BUTTON_CLASS} tl__button`}>
              {link.label}
              <span className="sr-only">: {title} (opens in a new tab)</span>
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>

        {/* Not a link: the card's one button is enough */}
        {showImage && (
          <div className="tl__media">
            <img
              src={event.image}
              alt={`Photo from ${title}`}
              width="1200"
              height="600"
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
              className="tl__image"
            />
          </div>
        )}
      </article>
    </li>
  )
}

/**
 * upcoming  events that haven't ended (and undated ones), soonest first
 * past      [{ year, events }], newest year first, newest event first
 */
export default function EventsTimeline({ upcoming, past }) {
  return (
    <div className="tl">
      <section aria-labelledby="events-upcoming" className="tl__group">
        <h2 id="events-upcoming" className="tl__heading">
          Upcoming
        </h2>
        {upcoming.length > 0 ? (
          <ol className="tl__list">
            {upcoming.map((event) => (
              <TimelineItem key={event.id} event={event} upcoming />
            ))}
          </ol>
        ) : (
          <p className="tl__note">
            No upcoming events right now.{' '}
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="tl__link">
              Follow us on Instagram<span className="sr-only"> (opens in a new tab)</span>
            </a>{' '}
            to hear first.
          </p>
        )}
      </section>

      {past.map(({ year, events }) => (
        <section key={year} aria-labelledby={yearId(year)} className="tl__group">
          <h2 id={yearId(year)} tabIndex={-1} className="tl__heading tl__heading--year">
            {year} · {countLabel(events.length)}
          </h2>
          <ol className="tl__list">
            {events.map((event) => (
              <TimelineItem key={event.id} event={event} upcoming={false} />
            ))}
          </ol>
        </section>
      ))}

      <div className="tl__add">
        <p className="tl__add-text">Want to add your chapter’s event?</p>
        <a href={ADD_EVENT_URL} target="_blank" rel="noopener noreferrer" className="tl__link">
          Add it with a pull request <span aria-hidden="true">→</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </div>
  )
}
