const initials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

// Grid-pattern placeholder until the post has a real image
export function BlogMedia({ post, className = '' }) {
  return (
    <div className={`blogs__media ${className}`}>
      {post.image ? (
        <img src={post.image} alt={post.title} loading="lazy" className="blogs__media-img" />
      ) : (
        <span aria-hidden="true" className="blogs__media-pattern" />
      )}
    </div>
  )
}

export default function BlogCard({ post }) {
  const { title, excerpt, category, date, readTime, author, href } = post

  return (
    <a href={href} className="blogs__card">
      <div className="blogs__card-media">
        <BlogMedia post={post} />
        <span className="blogs__tag blogs__card-tag">{category}</span>
        <span className="blogs__readtime">{readTime} read</span>
      </div>

      <div className="blogs__card-body">
        <h3 className="blogs__card-title">{title}</h3>
        <p className="blogs__excerpt">{excerpt}</p>

        <div className="blogs__card-footer">
          <span aria-hidden="true" className="blogs__avatar">
            {initials(author)}
          </span>
          <span className="blogs__byline">
            <span className="blogs__author">{author}</span>
            <span className="blogs__date">{date}</span>
          </span>
          <span aria-hidden="true" className="blogs__arrow">
            →
          </span>
        </div>
      </div>
    </a>
  )
}
