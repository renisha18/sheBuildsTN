#!/usr/bin/env node
// Gallery photos -> small WebP files. Dev-only tool (sharp is a devDependency); the app never
// imports this file.
//
//   node scripts/optimize-gallery.mjs
//
// For every .jpg, .jpeg and .png in src/assets/gallery/ (any capitalisation): rotate it upright
// using its EXIF orientation, shrink it so the longest side is at most 1200px (never enlarged),
// and write <same name>.webp at quality 75 next to it. The original then moves to
// work/originals-gallery/ (work/ is gitignored), as do any .heic files, which browsers can't show.
// Prints each file's size before and after, and the totals.

import { mkdir, readdir, rename, stat } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const GALLERY = 'src/assets/gallery'
const ORIGINALS = 'work/originals-gallery'
const LONGEST_SIDE = 1200
const QUALITY = 75
const TARGET_KB = 200

const kb = (bytes) => Math.round(bytes / 1024)

await mkdir(ORIGINALS, { recursive: true })
const files = (await readdir(GALLERY)).filter((f) => !f.startsWith('.')).sort()

let before = 0
let after = 0
for (const file of files) {
  const ext = path.extname(file).toLowerCase()
  const from = path.join(GALLERY, file)

  if (ext === '.heic') {
    await rename(from, path.join(ORIGINALS, file))
    console.log(`moved     ${file} (HEIC, not shown on the site)`)
    continue
  }
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue

  const out = path.join(GALLERY, `${path.basename(file, path.extname(file))}.webp`)
  const size = (await stat(from)).size
  const info = await sharp(from)
    .rotate() // EXIF orientation
    .resize({ width: LONGEST_SIDE, height: LONGEST_SIDE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out)
  await rename(from, path.join(ORIGINALS, file))

  before += size
  after += info.size
  const flag = kb(info.size) > TARGET_KB ? `  over ${TARGET_KB} KB` : ''
  console.log(`converted ${file}: ${kb(size)} KB -> ${path.basename(out)} ${kb(info.size)} KB (${info.width}x${info.height})${flag}`)
}

console.log(`\ntotal (converted photos): ${kb(before)} KB -> ${kb(after)} KB`)
