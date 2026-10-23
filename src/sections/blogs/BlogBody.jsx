import { Fragment } from 'react'
import { isSafeUrl } from './blogSchema.js'

// Link rules for anything a contributor wrote: safe protocols only, new tab, no SEO credit
export function ExternalLink({ href, children, className }) {
  if (!isSafeUrl(href)) return children
  return (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow ugc" className={className}>
      {children}
      <span className="blogs__sr-only"> (opens in a new tab)</span>
    </a>
  )
}

// **bold**, *italic* and [text](url) -> React nodes. Never builds HTML strings, so raw HTML stays plain text.
const INLINE_RE = /\*\*(.+?)\*\*|\*(?!\s)([^*]+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g

function renderInline(text, keyPrefix = 'i') {
  const nodes = []
  let last = 0
  let n = 0
  for (const m of text.matchAll(INLINE_RE)) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    const key = `${keyPrefix}-${n++}`
    if (m[1] !== undefined) {
      nodes.push(<strong key={key}>{renderInline(m[1], key)}</strong>)
    } else if (m[2] !== undefined) {
      nodes.push(<em key={key}>{renderInline(m[2], key)}</em>)
    } else {
      nodes.push(
        <Fragment key={key}>
          <ExternalLink href={m[4]} className="blog-body__link">
            {m[3]}
          </ExternalLink>
        </Fragment>,
      )
    }
    last = m.index + m[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export default function BlogBody({ blocks }) {
  return (
    <div className="blog-body">
      {blocks.map((block, i) => {
        if (block.type === 'h2') return <h2 key={i}>{renderInline(block.text, `b${i}`)}</h2>
        if (block.type === 'h3') return <h3 key={i}>{renderInline(block.text, `b${i}`)}</h3>
        if (block.type === 'ul') {
          return (
            <ul key={i}>
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item, `b${i}-${j}`)}</li>
              ))}
            </ul>
          )
        }
        return <p key={i}>{renderInline(block.text, `b${i}`)}</p>
      })}
    </div>
  )
}
