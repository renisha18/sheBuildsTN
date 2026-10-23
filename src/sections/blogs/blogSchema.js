// Blog post format: parsing and validation for src/content/blogs/*.md.
// Pure JS with no Vite, React or DOM imports, so both the site (blogsData.js) and
// Node (scripts/check-blogs.mjs) use the exact same rules. Format guide: CONTRIBUTING.md.

export const CATEGORIES = [
  'Engineering',
  'AI & Data',
  'Design',
  'Marketing & Business',
  'Career Growth',
  'Work-Life Balance',
  'Community Stories',
]

// Slugs the routes already use (/blogs/all)
export const RESERVED_SLUGS = ['all']

export const MAX_TITLE = 90
export const MAX_AUTHOR = 60
export const MAX_EXCERPT = 180
export const MAX_COVER_ALT = 120
export const MIN_WORDS = 80
export const MAX_WORDS = 3000
export const WORDS_PER_MINUTE = 200

const REQUIRED_KEYS = ['title', 'author', 'date', 'category', 'excerpt']
const OPTIONAL_KEYS = ['authorLink', 'readTime', 'cover', 'coverAlt', 'featured', 'placeholder']
const ALLOWED_KEYS = new Set([...REQUIRED_KEYS, ...OPTIONAL_KEYS])

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const READ_TIME_RE = /^[1-9]\d{0,2} min$/
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:'])

// Only absolute http(s) and mailto links; anything else (javascript:, data:, relative) is refused
export function isSafeUrl(url) {
  if (typeof url !== 'string' || url.trim() === '') return false
  try {
    return SAFE_PROTOCOLS.has(new URL(url.trim()).protocol)
  } catch {
    return false
  }
}

const isRealDate = (value) => {
  const m = DATE_RE.exec(value)
  if (!m) return false
  const [, y, mo, d] = m.map(Number)
  const date = new Date(Date.UTC(y, mo - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d
}

const unquote = (value) => {
  const v = value.trim()
  if (v.length >= 2 && (v[0] === '"' || v[0] === "'") && v[v.length - 1] === v[0]) return v.slice(1, -1).trim()
  return v
}

const countWords = (text) => (text.match(/\S+/g) || []).length

// Body text -> blocks: paragraphs (blank-line separated), "## " h2, "### " h3, "- " list items
function toBlocks(body) {
  const blocks = []
  let paragraph = []
  let list = null

  const flush = () => {
    if (paragraph.length) blocks.push({ type: 'p', text: paragraph.join(' ') })
    if (list) blocks.push({ type: 'ul', items: list })
    paragraph = []
    list = null
  }

  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim()
    if (!line) {
      flush()
    } else if (line.startsWith('### ')) {
      flush()
      blocks.push({ type: 'h3', text: line.slice(4).trim() })
    } else if (line.startsWith('## ')) {
      flush()
      blocks.push({ type: 'h2', text: line.slice(3).trim() })
    } else if (line.startsWith('- ')) {
      if (paragraph.length) flush()
      list = list || []
      list.push(line.slice(2).trim())
    } else {
      if (list) flush()
      paragraph.push(line)
    }
  }
  flush()
  return blocks
}

/**
 * Parses one post file.
 * fileName: e.g. "my-post.md"; raw: the file's text.
 * Returns { post, errors, warnings }; post is null when there are errors.
 * Every message starts with the file name and names the field.
 */
export function parsePost(fileName, raw, { categories = CATEGORIES, coverNames = [] } = {}) {
  const errors = []
  const warnings = []
  const fail = (msg) => errors.push(`${fileName}: ${msg}`)
  const warn = (msg) => warnings.push(`${fileName}: ${msg}`)
  const done = (post) => ({ post: errors.length ? null : post, errors, warnings })

  // ---- File name -> slug ----
  const slug = fileName.endsWith('.md') ? fileName.slice(0, -3) : ''
  if (!fileName.endsWith('.md')) fail('file name must end in ".md"')
  else if (slug.startsWith('_')) fail('file names starting with "_" are ignored by the site; rename the file')
  else if (!SLUG_RE.test(slug)) fail(`file name "${slug}" must use only lowercase letters, numbers and single hyphens (e.g. "my-first-hackathon.md")`)
  else if (RESERVED_SLUGS.includes(slug)) fail(`file name "${slug}" is reserved; choose another name`)

  // ---- Frontmatter ----
  const text = String(raw ?? '').replace(/^﻿/, '').replace(/\r\n?/g, '\n')
  const lines = text.split('\n')
  if (lines[0]?.trim() !== '---') {
    fail('must start with a "---" line, followed by the fields (title, author, ...) and another "---" line')
    return done(null)
  }
  const end = lines.findIndex((line, i) => i > 0 && line.trim() === '---')
  if (end === -1) {
    fail('the fields block is never closed; add a "---" line after the last field')
    return done(null)
  }

  const fields = {}
  lines.slice(1, end).forEach((rawLine, i) => {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) return
    const m = /^([A-Za-z][A-Za-z0-9]*)\s*:(.*)$/.exec(line)
    if (!m) {
      fail(`line ${i + 2} "${line}" is not "key: value"`)
      return
    }
    const [, key, value] = m
    if (!ALLOWED_KEYS.has(key)) {
      fail(`unknown field "${key}" (allowed: ${[...ALLOWED_KEYS].join(', ')}); check the spelling`)
      return
    }
    if (key in fields) {
      fail(`field "${key}" appears more than once`)
      return
    }
    fields[key] = unquote(value)
  })

  for (const key of REQUIRED_KEYS) {
    if (!fields[key]) fail(`"${key}" is required`)
  }

  const maxLength = (key, max) => {
    if (fields[key] && fields[key].length > max) fail(`"${key}" is ${fields[key].length} characters; the limit is ${max}`)
  }
  maxLength('title', MAX_TITLE)
  maxLength('author', MAX_AUTHOR)
  maxLength('excerpt', MAX_EXCERPT)
  maxLength('coverAlt', MAX_COVER_ALT)

  if (fields.date && !isRealDate(fields.date)) fail(`date "${fields.date}" must be a real date written YYYY-MM-DD (e.g. 2026-10-26)`)

  if (fields.category && !categories.includes(fields.category)) {
    fail(`category '${fields.category}' is not one of: ${categories.join(', ')}`)
  }

  if (fields.authorLink) {
    let ok = false
    try {
      ok = new URL(fields.authorLink).protocol === 'https:'
    } catch {
      ok = false
    }
    if (!ok) fail(`authorLink "${fields.authorLink}" must be a full https:// link`)
  }

  if (fields.readTime && !READ_TIME_RE.test(fields.readTime)) fail(`readTime "${fields.readTime}" must look like "6 min"`)

  if (fields.cover) {
    if (!coverNames.includes(fields.cover)) {
      fail(`cover "${fields.cover}" was not found in src/content/blogs/images/ (use just the file name, e.g. "my-post.jpg")`)
    }
    if (!fields.coverAlt) warn('"cover" is set without "coverAlt"; describe the image for screen reader users')
  } else if (fields.coverAlt) {
    warn('"coverAlt" is set but there is no "cover"; it will be ignored')
  }

  const flag = (key) => {
    if (fields[key] === undefined) return false
    if (fields[key] !== 'true' && fields[key] !== 'false') fail(`"${key}" must be true or false`)
    return fields[key] === 'true'
  }
  const featured = flag('featured')
  const placeholder = flag('placeholder')

  // ---- Body ----
  const body = lines.slice(end + 1).join('\n').trim()
  const wordCount = countWords(body)
  if (wordCount < MIN_WORDS) fail(`the story has ${wordCount} words; the minimum is ${MIN_WORDS}`)
  if (wordCount > MAX_WORDS) fail(`the story has ${wordCount} words; the maximum is ${MAX_WORDS}`)
  if (/^\s*#\s/m.test(body)) warn('"# " headings are not supported in the story (the title is the main heading); use "## "')
  if (/^\s*```/m.test(body)) warn('code blocks are not supported yet and will show as plain text')
  if (/!\[[^\]]*\]\(/.test(body)) warn('images inside the story are not supported yet and will show as plain text')

  const readTime = fields.readTime || `${Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))} min`

  return done({
    slug,
    title: fields.title,
    author: fields.author,
    authorLink: fields.authorLink || null,
    date: fields.date,
    category: fields.category,
    excerpt: fields.excerpt,
    readTime,
    cover: fields.cover || null,
    coverAlt: fields.coverAlt || null,
    featured,
    placeholder,
    wordCount,
    blocks: toBlocks(body),
  })
}
