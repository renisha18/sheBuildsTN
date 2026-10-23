#!/usr/bin/env node
// Checks every blog post in src/content/blogs/*.md with the same rules the site uses
// (src/sections/blogs/blogSchema.js). Guide: CONTRIBUTING.md, "Writing a blog".
// Usage:  npm run check:blogs
//         node scripts/check-blogs.mjs [dir]     (default src/content/blogs)
// Exit code 1 = at least one error. Node built-ins only, so CI needs no npm install.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { parsePost } from '../src/sections/blogs/blogSchema.js'

const DIR = resolve(process.argv[2] || 'src/content/blogs')
const IMAGES_DIR = join(DIR, 'images')
const IMAGE_RE = /\.(jpe?g|png|webp|avif)$/i
const WARN_KB = 300
const MAX_KB = 1024

const errors = []
const warnings = []

if (!existsSync(DIR)) {
  console.error(`check-blogs: folder not found: ${DIR}`)
  process.exit(1)
}

// ---- Cover images ----
const imageFiles = existsSync(IMAGES_DIR) ? readdirSync(IMAGES_DIR).filter((f) => !f.startsWith('.')) : []
const coverNames = imageFiles.filter((f) => IMAGE_RE.test(f))
for (const file of imageFiles) {
  const label = `images/${file}`
  if (!IMAGE_RE.test(file)) {
    warnings.push(`${label}: not a .jpg, .jpeg, .png, .webp or .avif file, so the site ignores it`)
    continue
  }
  const kb = Math.round(statSync(join(IMAGES_DIR, file)).size / 1024)
  if (kb > MAX_KB) errors.push(`${label}: ${kb} KB is over the 1 MB limit; resize it to about 1200 px wide`)
  else if (kb > WARN_KB) warnings.push(`${label}: ${kb} KB; please keep covers under ${WARN_KB} KB (about 1200 px wide)`)
}

// ---- Posts ----
const postFiles = readdirSync(DIR).filter((f) => f.endsWith('.md') && !f.startsWith('_'))
const featured = []
for (const file of postFiles) {
  const result = parsePost(file, readFileSync(join(DIR, file), 'utf8'), { coverNames })
  errors.push(...result.errors)
  warnings.push(...result.warnings)
  if (result.post?.featured) featured.push(file)
}
if (featured.length > 1) {
  errors.push(`${featured.join(', ')}: only one post may have featured: true (maintainers choose it)`)
}

for (const msg of errors) console.error(`ERROR    ${msg}`)
for (const msg of warnings) console.warn(`WARNING  ${msg}`)

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
console.log(
  `check-blogs: ${plural(postFiles.length, 'post')} checked, ${plural(errors.length, 'error')}, ${plural(warnings.length, 'warning')}.`,
)
process.exitCode = errors.length ? 1 : 0
