import './ContributeBox.css'
// The black pill and the plain text link come from the Blogs styles
import '../sections/blogs/Blogs.css'

const NewTab = () => <span className="blogs__sr-only"> (opens in a new tab)</span>

/**
 * The "contribute" box: coral card, ink border, hard shadow, a black pill link. Used at the end of
 * the All events timeline and as the Blogs "write for us" strip, so the two always match.
 * title          the box's first line
 * titleAs        its element: 'p' (default), 'h2', 'h3' ...
 * text           optional line under the title
 * linkLabel/href the pill (opens in a new tab)
 * secondaryLabel/secondaryHref  optional plain link next to the pill (opens in a new tab)
 * className      extra classes for placement
 */
export default function ContributeBox({ title, titleAs: Title = 'p', text, linkLabel, href, secondaryLabel, secondaryHref, className = '' }) {
  return (
    <div className={`contribute-box ${className}`.trim()}>
      <div className="contribute-box__text">
        <Title className="contribute-box__title">{title}</Title>
        {text && <p className="contribute-box__copy">{text}</p>}
      </div>
      <div className="contribute-box__actions">
        {/* Long label: allow it to wrap inside the pill on narrow phones instead of overflowing */}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="blogs__pill blogs__pill--ink"
          style={{ whiteSpace: 'normal', textAlign: 'center' }}
        >
          {linkLabel} <span aria-hidden="true">→</span>
          <NewTab />
        </a>
        {secondaryLabel && secondaryHref && (
          <a href={secondaryHref} target="_blank" rel="noopener noreferrer" className="blogs__text-link">
            {secondaryLabel}
            <NewTab />
          </a>
        )}
      </div>
    </div>
  )
}
