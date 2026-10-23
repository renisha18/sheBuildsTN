import { GUIDE_URL, SUBMIT_BLOG_URL } from './blogsData.js'

const NewTab = () => <span className="blogs__sr-only"> (opens in a new tab)</span>

// "button": the black pill on its own. "strip": a cream card inviting contributions.
// GitHub guide when REPO_URL is set (blogsData.js), otherwise the email draft.
export default function WriteForUs({ variant = 'strip', headingLevel = 3 }) {
  const primaryHref = GUIDE_URL ?? SUBMIT_BLOG_URL

  if (variant === 'button') {
    return (
      <a href={primaryHref} target="_blank" rel="noopener noreferrer" className="blogs__pill blogs__pill--ink">
        Write for SheBuilds <span aria-hidden="true">→</span>
        <NewTab />
      </a>
    )
  }

  const Heading = `h${headingLevel}`

  return (
    <div className="blogs__write">
      <div className="blogs__write-text">
        <Heading className="blogs__write-heading">Have a story to share?</Heading>
        <p className="blogs__write-copy">Tech, careers, marketing, work-life balance: if it helps women build, we'd love to read it.</p>
      </div>
      <div className="blogs__write-actions">
        <a href={primaryHref} target="_blank" rel="noopener noreferrer" className="blogs__pill blogs__pill--ink">
          {GUIDE_URL ? 'Write on GitHub' : 'Write for SheBuilds'} <span aria-hidden="true">→</span>
          <NewTab />
        </a>
        {GUIDE_URL && (
          <a href={SUBMIT_BLOG_URL} target="_blank" rel="noopener noreferrer" className="blogs__text-link">
            Prefer email? Send us your draft
            <NewTab />
          </a>
        )}
      </div>
    </div>
  )
}
