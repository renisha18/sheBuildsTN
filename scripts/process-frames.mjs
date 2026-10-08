#!/usr/bin/env node
// Character frame pipeline: green-screen PNGs -> transparent WebP at one size.
// Dev-only tool (sharp is a devDependency); the app never imports this file.
//
//   node scripts/process-frames.mjs <inputDir> <outDir> <size> [--quality 80] [--quality sit=70,rise=65]
//
// --quality sets the WebP quality for every file (default 80); name=value entries override it per
// file (name = the PNG's name without .png). Both can go in one list: --quality 75,sit=70.
//
// Keying is a difference matte against the background colour (top-left pixel of each file):
//   g_excess  = G - max(R, B)            for the pixel
//   bg_excess = bg.G - max(bg.R, bg.B)   for the background
//   alpha     = smoothstep(0.03, 0.95, 1 - clamp(g_excess / bg_excess, 0, 1))
// Colour is un-mixed from the background (fg = (pixel - (1 - alpha) * bg) / alpha) and pixels under
// alpha 0.05 are dropped. Despill: pixels still green-dominant after un-mixing (G >= max(R, B)) get
// G = (R + B) / 2. The matte overestimates alpha on navy/blue edges (it assumes the foreground has
// no green excess), so a plain max(R, B) clamp left dark hair and outlines murky teal; the average
// brings them back to navy. Pixels that weren't spilled keep their colour. Finally G is clamped to
// max(R, B) on every visible pixel, and that clamp is repeated after resizing. Because any green-dominant colour reads as background, the artwork
// itself must not contain greens (G > max(R, B)); teal, yellow, cream and navy are fine.
//
// No trim or recentre: every 2048x2048 frame is scaled by the same factor, so poses line up.
// Writes {name}-{size}.webp (alphaQuality 90), work/preview.png (all frames on cream)
// and work/hair-zoom.png (top 30% of each character at 4x, on cream and on magenta).

import { mkdir, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SOURCE_SIZE = 2048
const ALPHA_LOW = 0.03 // smoothstep start: raw alpha below this becomes 0
const ALPHA_HIGH = 0.95 // smoothstep end: raw alpha above this becomes 1
const ALPHA_DROP = 0.05 // after smoothing, anything below this is made fully transparent
const FRINGE_TOLERANCE = 6 // report pixels with G > max(R, B) + this as green fringe
const NEAR_BLACK = 120 // R+G+B at or below this counts as near-black in the fringe report
const DEFAULT_QUALITY = 80
const ALPHA_QUALITY = 90
const CREAM = '#F8F0E0' // --color-background
const MAGENTA = '#FF00FF'
const PREVIEW_THUMB = 360
const GAP = 24
const LABEL = 28
const ZOOM = 4
const ZOOM_TOP = 0.3

function usage(message) {
  if (message) console.error(`Error: ${message}\n`)
  console.error('Usage: node scripts/process-frames.mjs <inputDir> <outDir> <size> [--quality 80] [--quality sit=70,rise=65]')
  process.exit(1)
}

// Split argv into positionals and --quality values (accepts "--quality X" and "--quality=X", repeatable)
const positionals = []
const qualityArgs = []
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i]
  if (arg === '--quality') {
    if (i + 1 >= process.argv.length) usage('--quality needs a value, e.g. --quality 75 or --quality sit=70')
    qualityArgs.push(process.argv[++i])
  } else if (arg.startsWith('--quality=')) {
    qualityArgs.push(arg.slice('--quality='.length))
  } else if (arg.startsWith('--')) {
    usage(`unknown option ${arg}`)
  } else {
    positionals.push(arg)
  }
}

const parseQuality = (value, label) => {
  const q = Number(value)
  if (!Number.isInteger(q) || q < 1 || q > 100) usage(`${label} must be a whole number from 1 to 100`)
  return q
}
let defaultQuality = DEFAULT_QUALITY
const qualityOverrides = new Map() // file name (without .png) -> quality
for (const entry of qualityArgs.flatMap((a) => a.split(',')).map((e) => e.trim()).filter(Boolean)) {
  const eq = entry.indexOf('=')
  if (eq < 0) defaultQuality = parseQuality(entry, '--quality')
  else qualityOverrides.set(entry.slice(0, eq).trim(), parseQuality(entry.slice(eq + 1).trim(), `--quality ${entry.slice(0, eq).trim()}`))
}

const [inputDir, outDir, sizeArg] = positionals
if (!inputDir || !outDir || !sizeArg || positionals.length > 3) usage()
const size = Number(sizeArg)
if (!Number.isInteger(size) || size < 16 || size > SOURCE_SIZE) usage(`<size> must be a whole number from 16 to ${SOURCE_SIZE}`)
const budgetKB = size >= 1200 ? 120 : 60

const clamp255 = (v) => Math.round(Math.min(255, Math.max(0, v)))
const escapeXml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

// Clamp G to max(R, B) on every visible pixel of an RGBA buffer (in place)
function clampGreen(rgba) {
  for (let p = 0; p < rgba.length; p += 4) {
    if (rgba[p + 3] > 0) rgba[p + 1] = Math.min(rgba[p + 1], Math.max(rgba[p], rgba[p + 2]))
  }
}

async function keyFrame(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h, channels } = info
  if (w !== SOURCE_SIZE || h !== SOURCE_SIZE) {
    throw new Error(`${path.basename(file)} is ${w}x${h}; every frame must be ${SOURCE_SIZE}x${SOURCE_SIZE} so poses line up`)
  }
  const [bgR, bgG, bgB] = [data[0], data[1], data[2]]
  const bgExcess = bgG - Math.max(bgR, bgB)
  if (bgExcess < 64) {
    throw new Error(`${path.basename(file)}: top-left pixel rgb(${bgR}, ${bgG}, ${bgB}) isn't a strong green, so it can't be keyed`)
  }

  const n = w * h
  const out = Buffer.alloc(n * 4)
  for (let i = 0; i < n; i++) {
    const p = i * channels
    const r = data[p]
    const g = data[p + 1]
    const b = data[p + 2]

    const excess = g - Math.max(r, b)
    const raw = 1 - Math.min(1, Math.max(0, excess / bgExcess))
    const t = Math.min(1, Math.max(0, (raw - ALPHA_LOW) / (ALPHA_HIGH - ALPHA_LOW)))
    const alpha = t * t * (3 - 2 * t)
    if (alpha < ALPHA_DROP) continue // fully transparent, RGB stays 0

    // Un-mix from the background: pixel = alpha * fg + (1 - alpha) * bg
    const fr = clamp255((r - (1 - alpha) * bgR) / alpha)
    const fg = clamp255((g - (1 - alpha) * bgG) / alpha)
    const fb = clamp255((b - (1 - alpha) * bgB) / alpha)

    const o = i * 4
    out[o] = fr
    out[o + 1] = fg >= Math.max(fr, fb) ? Math.round((fr + fb) / 2) : fg // spilled -> average limit
    out[o + 2] = fb
    out[o + 3] = Math.round(alpha * 255)
  }
  return out
}

// Pixels that read as green: visible and G more than FRINGE_TOLERANCE above max(R, B).
// `visible` excludes near-black pixels (R+G+B <= NEAR_BLACK), where lossy WebP's colour noise of a
// few levels trips the test without producing a tint anyone can see.
function countFringe(rgba) {
  let count = 0
  let visible = 0
  for (let p = 0; p < rgba.length; p += 4) {
    if (rgba[p + 3] > 0 && rgba[p + 1] > Math.max(rgba[p], rgba[p + 2]) + FRINGE_TOLERANCE) {
      count++
      if (rgba[p] + rgba[p + 1] + rgba[p + 2] > NEAR_BLACK) visible++
    }
  }
  return { count, visible }
}

function boundingBox(rgba, w, h) {
  let minX = w
  let minY = h
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (rgba[(y * w + x) * 4 + 3] > 0) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  return maxX < 0 ? null : { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
}

function labelLayer(width, height, labels) {
  const text = labels
    .map(({ x, y, text: t }) => `<text x="${x}" y="${y}" font-family="sans-serif" font-size="16" fill="#14100E">${escapeXml(t)}</text>`)
    .join('')
  return { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${text}</svg>`), left: 0, top: 0 }
}

async function writePreview(frames, previewPath) {
  const cols = Math.ceil(Math.sqrt(frames.length))
  const rows = Math.ceil(frames.length / cols)
  const cell = PREVIEW_THUMB + GAP
  const width = cols * cell + GAP
  const height = rows * (cell + LABEL) + GAP
  const layers = []
  const labels = []
  for (const [i, frame] of frames.entries()) {
    const left = GAP + (i % cols) * cell
    const top = GAP + Math.floor(i / cols) * (cell + LABEL)
    layers.push({ input: await sharp(frame.file).resize(PREVIEW_THUMB, PREVIEW_THUMB).png().toBuffer(), left, top })
    labels.push({ x: left, y: top + PREVIEW_THUMB + 20, text: path.basename(frame.file) })
  }
  layers.push(labelLayer(width, height, labels))
  await sharp({ create: { width, height, channels: 4, background: CREAM } }).composite(layers).png().toFile(previewPath)
}

// One row per frame: the top 30% of the character's bounding box at 4x (nearest neighbour),
// on cream and on magenta side by side
async function writeHairZoom(frames, zoomPath) {
  const rows = []
  for (const frame of frames) {
    const box = boundingBox(frame.rgba, size, size)
    if (!box) continue
    const crop = { left: box.left, top: box.top, width: box.width, height: Math.max(1, Math.round(box.height * ZOOM_TOP)) }
    const zoomed = await sharp(frame.rgba, { raw: { width: size, height: size, channels: 4 } })
      .extract(crop)
      .resize(crop.width * ZOOM, crop.height * ZOOM, { kernel: 'nearest' })
      .png()
      .toBuffer()
    rows.push({ name: path.basename(frame.file), zoomed, w: crop.width * ZOOM, h: crop.height * ZOOM })
  }
  if (!rows.length) return

  const tileW = Math.max(...rows.map((r) => r.w))
  const width = GAP + 2 * (tileW + GAP)
  const height = GAP + rows.reduce((sum, r) => sum + LABEL + r.h + GAP, 0)
  const layers = []
  const labels = []
  let y = GAP
  for (const row of rows) {
    labels.push({ x: GAP, y: y + 18, text: `${row.name} — cream` }, { x: GAP * 2 + tileW, y: y + 18, text: `${row.name} — magenta` })
    y += LABEL
    for (const [col, bg] of [CREAM, MAGENTA].entries()) {
      const tile = await sharp({ create: { width: row.w, height: row.h, channels: 4, background: bg } })
        .composite([{ input: row.zoomed }])
        .png()
        .toBuffer()
      layers.push({ input: tile, left: GAP + col * (tileW + GAP), top: y })
    }
    y += row.h + GAP
  }
  layers.push(labelLayer(width, height, labels))
  await sharp({ create: { width, height, channels: 4, background: '#FFFFFF' } }).composite(layers).png().toFile(zoomPath)
}

async function main() {
  let entries
  try {
    entries = await readdir(inputDir)
  } catch {
    usage(`can't read input folder "${inputDir}"`)
  }
  const inputs = entries
    .filter((f) => f.toLowerCase().endsWith('.png'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => path.join(inputDir, f))
  if (!inputs.length) usage(`no .png files in "${inputDir}"`)

  await mkdir(outDir, { recursive: true })
  await mkdir('work', { recursive: true })
  const names = new Set(inputs.map((f) => path.basename(f, path.extname(f))))
  for (const name of qualityOverrides.keys()) {
    if (!names.has(name)) console.warn(`  ! --quality ${name}=...: no ${name}.png in ${inputDir}; ignored`)
  }
  console.log(
    `Keying ${inputs.length} frame(s) -> ${size}x${size} WebP in ${outDir} (quality ${defaultQuality}` +
      `${qualityOverrides.size ? `, overrides ${[...qualityOverrides].map(([n, q]) => `${n}=${q}`).join(', ')}` : ''}; budget ${budgetKB} KB each)`,
  )

  const frames = []
  let total = 0
  let overBudget = 0
  let fringeTotal = 0
  let fringeVisible = 0
  for (const file of inputs) {
    const keyed = await keyFrame(file)
    const name = path.basename(file, path.extname(file))
    const outFile = path.join(outDir, `${name}-${size}.webp`)
    const quality = qualityOverrides.get(name) ?? defaultQuality

    const resized = await sharp(keyed, { raw: { width: SOURCE_SIZE, height: SOURCE_SIZE, channels: 4 } })
      .resize(size, size, { kernel: 'lanczos3' })
      .raw()
      .toBuffer()
    clampGreen(resized) // resampling re-blends edge colours, so clamp again at the final size
    await sharp(resized, { raw: { width: size, height: size, channels: 4 } })
      .webp({ quality, alphaQuality: ALPHA_QUALITY, smartSubsample: true }) // sharper colour at edges
      .toFile(outFile)

    // Measure what actually ships: decode the written WebP
    const shipped = await sharp(outFile).ensureAlpha().raw().toBuffer()
    const fringe = countFringe(shipped)
    fringeTotal += fringe.count
    fringeVisible += fringe.visible

    const kb = (await stat(outFile)).size / 1024
    total += kb
    const over = kb > budgetKB
    if (over) overBudget++
    const notes = [over && `over ${budgetKB} KB budget`, fringe.visible && `${fringe.visible} green px not near-black`].filter(Boolean).join(', ')
    console.log(
      `  ${notes ? '!' : ' '} ${path.basename(outFile).padEnd(22)} q${String(quality).padEnd(3)} ${kb.toFixed(1).padStart(7)} KB   ` +
        `green px: ${String(fringe.count).padStart(5)} (${String(fringe.visible).padStart(3)} not near-black)${notes ? `   ${notes}` : ''}`,
    )
    frames.push({ file: outFile, rgba: shipped })
  }

  const previewPath = path.join('work', 'preview.png')
  const zoomPath = path.join('work', 'hair-zoom.png')
  await writePreview(frames, previewPath)
  await writeHairZoom(frames, zoomPath)
  console.log(
    `Total ${total.toFixed(1)} KB, ${fringeTotal} green px (${fringeVisible} not near-black)` +
      `${overBudget ? `, ${overBudget} file(s) over budget` : ''}. Preview: ${previewPath}  Hair zoom: ${zoomPath}`,
  )
}

main().catch((err) => {
  console.error(`Error: ${err.message}`)
  process.exit(1)
})
