import { GUIDE_URL, SUBMIT_BLOG_URL } from './blogsData.js'
import ContributeBox from '../../components/ContributeBox.jsx'

const NewTab = () => <span className="blogs__sr-only"> (opens in a new tab)</span>

// The site only links to the written guide (CONTRIBUTING.md), never straight into GitHub's editor.
// Falls back to the email draft if REPO_URL is ever cleared (blogsData.js).
// "button": the black pill on its own. "strip": the shared contribute box (ContributeBox).
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

  return (
    <ContributeBox
      title="Have a story to share?"
      titleAs={`h${headingLevel}`}
      text="Tech, careers, marketing, work-life balance: if it helps women build, we'd love to read it."
      linkLabel={GUIDE_URL ? 'Read the guide & write for us' : 'Write for SheBuilds'}
      href={primaryHref}
      secondaryLabel={GUIDE_URL ? 'Prefer email? Send us your draft' : null}
      secondaryHref={GUIDE_URL ? SUBMIT_BLOG_URL : null}
    />
  )
}
