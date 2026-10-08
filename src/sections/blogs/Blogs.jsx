import { useMemo, useState } from 'react'
import { BlogMedia } from './BlogCard.jsx'
import BlogCarousel from './BlogCarousel.jsx'
import { ALL, CATEGORIES, POSTS } from './blogsData.js'
import './Blogs.css'

export default function Blogs() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(ALL)

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    return POSTS.filter((post) => {
      const matchesQuery = q ? `${post.title} ${post.excerpt}`.toLowerCase().includes(q) : true
      const matchesCategory = activeCategory === ALL || post.category === activeCategory
      return matchesQuery && matchesCategory
    })
  }, [query, activeCategory])

  const featured = matches.find((post) => post.featured)
  const latest = matches.filter((post) => !post.featured)

  const clearAll = () => {
    setQuery('')
    setActiveCategory(ALL)
  }

  return (
    <section aria-labelledby="blogs-heading" className="blogs">
      <div className="blogs__hero">
        <p className="blogs__eyebrow">
          <span aria-hidden="true" className="blogs__eyebrow-badge" />
          Blogs · She Builds · Tamilnadu
        </p>
        <h2 id="blogs-heading" className="blogs__heading">
          Ideas Worth Building
        </h2>
        <p className="blogs__subtext">Stories, tutorials and insights from women in tech across Tamilnadu.</p>
      </div>

      <div className="blogs__toolbar">
        <div className="blogs__search">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="blogs__search-icon" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <label htmlFor="blogs-search" className="blogs__sr-only">
            Search articles
          </label>
          <input
            id="blogs-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles"
            className="blogs__search-input"
          />
        </div>

        <div className="blogs__chips" role="group" aria-label="Filter articles by category">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category
            return (
              <button
                key={category}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(category)}
                className={`blogs__pill blogs__chip${isActive ? (category === ALL ? ' is-active-all' : ' is-active') : ''}`}
              >
                {category}
              </button>
            )
          })}
        </div>
      </div>

      <p aria-live="polite" className="blogs__sr-only">
        {matches.length === 1 ? '1 article' : `${matches.length} articles`}
      </p>

      {matches.length === 0 ? (
        <div className="blogs__empty">
          <p className="blogs__empty-text">No articles found. Try another search or category.</p>
          <button type="button" onClick={clearAll} className="blogs__pill">
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {featured && (
            <a href={featured.href} className="blogs__featured">
              <BlogMedia post={featured} className="blogs__featured-media" />
              <div className="blogs__featured-body">
                <div className="blogs__featured-tags">
                  <span className="blogs__badge">Featured</span>
                  <span className="blogs__tag">{featured.category}</span>
                </div>
                <h3 className="blogs__featured-title">{featured.title}</h3>
                <p className="blogs__excerpt">{featured.excerpt}</p>
                <p className="blogs__featured-meta">
                  {featured.author} · {featured.date} · {featured.readTime} read
                  <span aria-hidden="true" className="blogs__arrow">
                    →
                  </span>
                </p>
              </div>
            </a>
          )}

          {latest.length > 0 && (
            <>
              <div className="blogs__latest-head">
                <h3 className="blogs__latest-heading">Latest Articles</h3>
                <button type="button" onClick={clearAll} className="blogs__pill blogs__pill--small">
                  View all
                </button>
              </div>
              {/* New key on every filter/search change remounts the carousel, scrolling it back to the start */}
              <BlogCarousel key={`${activeCategory}|${query.trim()}`} posts={latest} />
            </>
          )}
        </>
      )}
    </section>
  )
}
