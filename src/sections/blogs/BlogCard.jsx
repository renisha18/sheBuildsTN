import { Link } from 'react-router'
import { formatDate } from './blogsData.js'

const initials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export function Avatar({ name }) {
  return (
    <span aria-hidden="true" className="blogs__avatar">
      {initials(name)}
    </span>
  )
}

// Cover image if the post has one, otherwise the grid-pattern placeholder
export function BlogMedia({ post, className = '' }) {
  return (
    <div className={`blogs__media ${className}`}>
      {post.image ? (
        <img src={post.image} alt={post.imageAlt} loading="lazy" className="blogs__media-img" />
      ) : (
        <span aria-hidden="true" className="blogs__media-pattern" />
      )}
    </div>
  )
}

// Width comes from the wrapper: .blogs__slide in the carousel, .blogs__grid in the grids
export default function BlogCard({ post }) {
  const { slug, title, excerpt, category, date, readTime, author } = post

  return (
    <Link to={`/blogs/${slug}`} className="blogs__card">
      <div className="blogs__card-media">
        <BlogMedia post={post} />
        <span className="blogs__tag blogs__card-tag">{category}</span>
        <span className="blogs__readtime">{readTime} read</span>
      </div>

      <div className="blogs__card-body">
        <h3 className="blogs__card-title">{title}</h3>
        <p className="blogs__excerpt">{excerpt}</p>

        <div className="blogs__card-footer">
          <Avatar name={author} />
          <span className="blogs__byline">
            <span className="blogs__author">{author}</span>
            <span className="blogs__date">{formatDate(date)}</span>
          </span>
          <span aria-hidden="true" className="blogs__arrow">
            →
          </span>
        </div>
      </div>
    </Link>
  )
}
