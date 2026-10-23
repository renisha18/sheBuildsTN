import { useEffect } from 'react'
import { Link } from 'react-router'
import BlogBody, { ExternalLink } from './BlogBody.jsx'
import BlogCard, { Avatar, BlogMedia } from './BlogCard.jsx'
import WriteForUs from './WriteForUs.jsx'
import { POSTS, formatDate } from './blogsData.js'
import { prefersReducedMotion } from '../../siteSections.js'
import './Blogs.css'

const BACK_TO_BLOGS = { pathname: '/', hash: '#blogs' }

// Up to 3 other posts: same category first, then the newest (POSTS is newest first)
function moreStories(post) {
  const others = POSTS.filter((p) => p.slug !== post.slug)
  return [...others.filter((p) => p.category === post.category), ...others.filter((p) => p.category !== post.category)].slice(0, 3)
}

// /blogs/:slug
export default function BlogPostView({ slug }) {
  const post = POSTS.find((p) => p.slug === slug)
  const title = post ? post.title : 'Story not found'

  // New post (including from "More stories"): start at the top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'auto' })
  }, [slug])

  useEffect(() => {
    const previous = document.title
    document.title = `${title} | SheBuilds Chennai`
    return () => {
      document.title = previous
    }
  }, [title])

  if (!post) {
    return (
      <div className="blogs blogs-page">
        <div className="blogs__empty">
          <h1 className="blogs__empty-text">We couldn't find that story.</h1>
          <p className="blogs__empty-copy">It may have moved or been removed.</p>
          <div className="blogs__empty-actions">
            <Link to="/blogs/all" className="blogs__pill">
              All blogs
            </Link>
            <Link to={BACK_TO_BLOGS} className="blogs__pill">
              Back to blogs
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const related = moreStories(post)

  return (
    <div className="blogs blogs-page">
      <article className="blog-post" aria-labelledby="blog-post-title">
        <Link to={BACK_TO_BLOGS} className="blogs__back">
          <span aria-hidden="true">←</span> Back to blogs
        </Link>

        <BlogMedia post={post} className="blog-post__cover" />

        <span className="blogs__tag blog-post__category">{post.category}</span>
        <h1 id="blog-post-title" className="blog-post__title">
          {post.title}
        </h1>

        <div className="blog-post__meta">
          <Avatar name={post.author} />
          <span className="blogs__author">
            {post.authorLink ? (
              <ExternalLink href={post.authorLink} className="blog-body__link">
                {post.author}
              </ExternalLink>
            ) : (
              post.author
            )}
          </span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readTime} read</span>
        </div>

        <BlogBody blocks={post.blocks} />

        <WriteForUs variant="strip" headingLevel={2} />
      </article>

      {related.length > 0 && (
        <section aria-labelledby="more-stories-heading" className="blog-post__more">
          <h2 id="more-stories-heading" className="blogs__latest-heading">
            More stories
          </h2>
          <ul className="blogs__grid">
            {related.map((p) => (
              <li key={p.slug}>
                <BlogCard post={p} />
              </li>
            ))}
          </ul>
          <Link to="/blogs/all" className="blogs__back">
            <span aria-hidden="true">←</span> All blogs
          </Link>
        </section>
      )}
    </div>
  )
}
