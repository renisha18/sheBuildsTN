import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import BlogCarousel from './BlogCarousel.jsx'
import BlogToolbar from './BlogToolbar.jsx'
import WriteForUs from './WriteForUs.jsx'
import { POSTS, filterPosts } from './blogsData.js'
import './Blogs.css'

export default function Blogs() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(null) // null = all

  // POSTS is already newest first
  const matches = useMemo(() => filterPosts(POSTS, query, category), [query, category])

  const clearAll = () => {
    setQuery('')
    setCategory(null)
  }

  return (
    <section aria-labelledby="blogs-heading" className="blogs">
      <div className="blogs__hero">
        <div className="blogs__hero-text">
          <p className="blogs__eyebrow">
            <span aria-hidden="true" className="blogs__eyebrow-badge" />
            Blogs · She Builds · Tamilnadu
          </p>
          <h2 id="blogs-heading" className="blogs__heading">
            Stories from women who build
          </h2>
          <p className="blogs__subtext">Tech, careers, marketing, work-life balance: real stories from women across Tamil Nadu.</p>
        </div>
        <WriteForUs variant="button" />
      </div>

      <BlogToolbar query={query} onQueryChange={setQuery} category={category} onCategoryChange={setCategory} />

      <p aria-live="polite" className="blogs__sr-only">
        {matches.length === 1 ? '1 story' : `${matches.length} stories`}
      </p>

      {matches.length === 0 ? (
        <div className="blogs__empty">
          <p className="blogs__empty-text">No stories found. Try another search or category.</p>
          <button type="button" onClick={clearAll} className="blogs__pill">
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="blogs__latest-head">
            <h3 className="blogs__latest-heading">Latest Articles</h3>
            <Link to="/blogs/all" className="blogs__pill blogs__pill--small">
              View all blogs <span aria-hidden="true">→</span>
            </Link>
          </div>
          {/* New key on every filter/search change remounts the carousel, scrolling it back to the start */}
          <BlogCarousel key={`${category ?? 'all'}|${query.trim()}`} posts={matches} />
        </>
      )}

      <WriteForUs variant="strip" headingLevel={3} />
    </section>
  )
}
