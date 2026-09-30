// One milestone: card + dashed connector + diamond on the axis + year label.
// `position` ("up" | "down") picks the side of the axis the card sits on (desktop).
export default function TimelineItem({ data, isRevealed, position }) {
  const { year, title, description, color } = data

  return (
    <li
      className={`journey__item journey__item--${position}${isRevealed ? ' is-revealed' : ''}`}
      style={{ '--card-color': color }}
    >
      <article className="journey__card">
        <p className="journey__card-year">{year} —</p>
        <h3 className="journey__card-title">{title}</h3>
        <p className="journey__card-text">{description}</p>
        {/* Swap for <img src=... alt="" /> when photos are ready */}
        <div className="journey__card-image" aria-hidden="true">Event image</div>
      </article>

      <span className="journey__node" aria-hidden="true">
        <span className="journey__stem" />
        <span className="journey__diamond" />
      </span>

      <span className="journey__year">{year}</span>

      {/* Axis segment reaching the next diamond. Hidden on the last item. */}
      <span className="journey__rail" aria-hidden="true" />
    </li>
  )
}
