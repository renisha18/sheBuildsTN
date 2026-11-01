import { Link } from 'react-router'
import usePageTitle from '../components/usePageTitle.js'
import { HOME_BUTTON_CLASS } from '../components/buttonStyles.js'

// Any address the site doesn't know (the catch-all route in App.jsx), inside Layout
export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <section aria-labelledby="not-found-heading" className="px-6 py-24 md:px-12 max-sm:px-4">
      <h1 id="not-found-heading" className="about__heading">
        Page not found
      </h1>
      <p className="mb-8 max-w-prose font-body text-lg text-ink">
        We couldn&rsquo;t find that page. It may have moved, or the address may have a typo.
      </p>
      <Link to="/" className={HOME_BUTTON_CLASS}>
        <span aria-hidden="true">←</span> Back to home
      </Link>
    </section>
  )
}
