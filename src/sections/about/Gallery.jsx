import './Gallery.css'

// Fill in a short description per photo, e.g. 'Attendees at the 2022 conference'.
// An empty string marks the image as decorative. Index-matched to the images sorted by file name.
const ALTS = ['', '', '', '', '', '', '', '', '', '']

// Every image in src/assets/gallery/, sorted by file name, at most 10. Upper-case
// extensions are listed too because the glob is case-sensitive (e.g. 03.JPG).
// HEIC is left out on purpose: most browsers can't display it.
const modules = import.meta.glob(
  '/src/assets/gallery/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true, import: 'default' },
)
const IMAGES = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, src]) => src)
  .slice(0, 10)

// The list is rendered twice so the track can loop from 0 to -50% without a jump.
// The second copy is hidden from screen readers and has empty alt text.
function Cards({ duplicate = false }) {
  return (
    <ul className="gallery__list" aria-hidden={duplicate ? 'true' : undefined}>
      {IMAGES.map((src, i) => (
        <li key={src} className="gallery__card">
          <img
            className="gallery__img"
            src={src}
            alt={duplicate ? '' : (ALTS[i] ?? '')}
            width="400"
            height="300"
            loading="lazy"
            decoding="async"
          />
        </li>
      ))}
    </ul>
  )
}

export default function Gallery() {
  if (IMAGES.length === 0) return null

  return (
    <section
      className="gallery"
      aria-label="Photo gallery"
      style={{ '--gallery-count': IMAGES.length }}
    >
      {/* Optional sub-heading: change the text or delete this block */}
      <div className="gallery__head">
        <h3 className="about__heading">Community moments</h3>
      </div>

      <div className="gallery__viewport">
        <div className="gallery__track">
          <Cards />
          <Cards duplicate />
        </div>
      </div>
    </section>
  )
}
