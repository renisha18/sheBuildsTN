// Posts live in src/content/blogs/*.md. To add a blog, copy _TEMPLATE.md (see CONTRIBUTING.md). 'all' is a reserved slug.
import { CATEGORIES, parsePost } from './blogSchema.js'

export { CATEGORIES }

// Swap for a Google Form link if you prefer.
export const SUBMIT_BLOG_URL =
  'https://mail.google.com/mail/?view=cm&fs=1&to=team@shebuildschennai.in&su=Blog%20Submission%20-%20SheBuilds%20Chennai&body=Hello%20SheBuilds%20Team,%0A%0AI%20would%20like%20to%20contribute%20a%20blog.%0A%0AName:%20%0ATitle:%20%0ACategory:%20%0AShort%20summary:%20%0ALink%20to%20draft:%20%0A%0ABest%20regards,%0A'

// Set to your public GitHub repo URL, no trailing slash, e.g. https://github.com/<org>/<repo>. Leave empty until then.
export const REPO_URL = ''
export const GUIDE_URL = REPO_URL ? `${REPO_URL}/blob/HEAD/CONTRIBUTING.md` : null

const files = import.meta.glob(['/src/content/blogs/*.md', '!/src/content/blogs/_*.md'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

// file name -> bundled URL
const coverFiles = import.meta.glob('/src/content/blogs/images/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' })
const COVERS = Object.fromEntries(Object.entries(coverFiles).map(([path, url]) => [path.split('/').pop(), url]))

const devWarn = (msg) => {
  if (import.meta.env.DEV) console.warn(`[blogs] ${msg}`)
}

export function sortNewest(posts) {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))
}

// Invalid files are skipped (never crash the page); details only in the dev console
function loadPosts() {
  const posts = []
  for (const [path, raw] of Object.entries(files)) {
    const { post, errors, warnings } = parsePost(path.split('/').pop(), raw, { coverNames: Object.keys(COVERS) })
    errors.forEach((msg) => devWarn(`skipped: ${msg}`))
    warnings.forEach(devWarn)
    if (!post) continue
    posts.push({
      ...post,
      id: post.slug,
      image: post.cover ? (COVERS[post.cover] ?? null) : null,
      imageAlt: post.coverAlt ?? '',
    })
  }

  // At most one featured post: the newest wins
  let hasFeatured = false
  return sortNewest(posts).map((post) => {
    if (!post.featured) return post
    if (!hasFeatured) {
      hasFeatured = true
      return post
    }
    devWarn(`${post.slug}.md: more than one post has featured: true; only the newest is featured`)
    return { ...post, featured: false }
  })
}

export const POSTS = loadPosts()

const dayFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const monthFormat = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const toDate = (iso) => new Date(`${iso}T00:00:00Z`)

// "2026-10-26" -> "26 Oct 2026"
export const formatDate = (iso) => dayFormat.format(toDate(iso))

// [{ key: '2026-10', label: 'October 2026', posts }], newest month first, posts newest first
export function groupByMonth(posts) {
  const groups = new Map()
  for (const post of sortNewest(posts)) {
    const key = post.date.slice(0, 7)
    if (!groups.has(key)) groups.set(key, { key, label: monthFormat.format(toDate(post.date)), posts: [] })
    groups.get(key).posts.push(post)
  }
  return [...groups.values()]
}

// Shared by the home section and the All blogs page; category null = all posts
export function filterPosts(posts, query, category) {
  const q = query.trim().toLowerCase()
  return posts.filter((post) => {
    const matchesQuery = q ? `${post.title} ${post.excerpt} ${post.author} ${post.category}`.toLowerCase().includes(q) : true
    return matchesQuery && (!category || post.category === category)
  })
}
