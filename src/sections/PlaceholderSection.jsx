// Stand-in for sections that don't have content yet (Join us, Events, Blogs).
// Deliberately reuses the About intro's classes (src/pages/About.css) so typography
// and spacing stay identical to About us rather than introducing new styles.
function PlaceholderSection({ id, title, text }) {
  const headingId = `${id}-heading`
  return (
    <div className="about">
      <section className="about__intro" aria-labelledby={headingId}>
        <h2 id={headingId} className="about__heading" data-reveal>
          {title}
        </h2>
        <p data-reveal>{text}</p>
      </section>
    </div>
  )
}

export default PlaceholderSection
