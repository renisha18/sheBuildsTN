import { Component } from 'react'
import { HOME_BUTTON_CLASS } from './buttonStyles.js'

// Catches a crash in the page area (Layout) so the navbar and footer stay and the visitor sees a
// message instead of a blank page. Layout gives it a new key on every route change, so moving to
// another page clears the error. "Back to home" is a plain link: a full reload starts clean.
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <section role="alert" className="px-6 py-24 md:px-12 max-sm:px-4">
        <h1 className="about__heading">Something went wrong</h1>
        <p className="mb-8 max-w-prose font-body text-lg text-ink">
          Sorry, this part of the site didn&rsquo;t load. Please try again, or go back to the home page.
        </p>
        <a href="/" className={HOME_BUTTON_CLASS}>
          <span aria-hidden="true">←</span> Back to home
        </a>
      </section>
    )
  }
}
