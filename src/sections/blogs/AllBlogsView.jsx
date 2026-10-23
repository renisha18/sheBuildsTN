import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import BlogCard from './BlogCard.jsx'
import BlogToolbar from './BlogToolbar.jsx'
import WriteForUs from './WriteForUs.jsx'
import { POSTS, filterPosts, groupByMonth } from './blogsData.js'
import { prefersReducedMotion } from '../../siteSections.js'
import './Blogs.css'

const stories = (n) => (n === 1 ? '1 story' : `${n} stories`)

// /blogs/all: every post, grouped by month, newest first
export default function AllBlogsView() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(null) // null = all

  // Arriving from the home page leaves us scrolled down; start at the top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'auto' })
    const previous = document.title
    document.title = 'All blogs | SheBuilds Chennai'
    return () => {
      document.title = previous
    }
  }, [])

  const matches = useMemo(() => filterPosts(POSTS, query, category), [query, category])
  const months = useMemo(() => groupByMonth(matches), [matches])

  const clearAll = () => {
    setQuery('')
    setCategory(null)
  }

  return (
    <section aria-labelledby="all-blogs-heading" className="blogs blogs-page">
      <Link to={{ pathname: '/', hash: '#blogs' }} className="blogs__back">
        <span aria-hidden="true">←</span> Back to blogs
      </Link>

      <div className="blogs-page__head">
        <div>
          <h1 id="all-blogs-heading" className="blogs-page__title">
            All blogs
          </h1>
          <p className="blogs-page__subtext">{stories(POSTS.length)} from women across Tamil Nadu, newest first.</p>
        </div>
        <WriteForUs variant="button" />
      </div>

      <BlogToolbar idPrefix="all-blogs" query={query} onQueryChange={setQuery} category={category} onCategoryChange={setCategory} />

      <p aria-live="polite" className="blogs__sr-only">
        {stories(matches.length)}
      </p>

      {months.length === 0 ? (
        <div className="blogs__empty">
          <p className="blogs__empty-text">No stories found. Try another search or category.</p>
          <button type="button" onClick={clearAll} className="blogs__pill">
            Clear filters
          </button>
        </div>
      ) : (
        months.map((month) => (
          <section key={month.key} aria-labelledby={`month-${month.key}`} className="blogs-page__month">
            <div className="blogs-page__month-head">
              <h2 id={`month-${month.key}`} className="blogs-page__month-title">
                {month.label}
              </h2>
              <span className="blogs-page__month-count">{stories(month.posts.length)}</span>
            </div>
            <ul className="blogs__grid">
              {month.posts.map((post) => (
                <li key={post.slug}>
                  <BlogCard post={post} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </section>
  )
}
