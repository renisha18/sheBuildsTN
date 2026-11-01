#!/usr/bin/env node
// Favicons from the logo. Dev-only tool (sharp is a devDependency); the app never imports it.
//
//   node scripts/make-favicons.mjs
//
// The logo is wider than tall, so it is centred in a square:
//   public/favicon-32.png         32x32, transparent background
//   public/apple-touch-icon.png   180x180 on the cream page colour (iOS shows transparency as
//                                 black), with a little padding
// The cream comes from the --color-background token in src/index.css, so it stays in step.

import { readFile } from 'node:fs/promises'
import sharp from 'sharp'

const LOGO = 'public/logo.png'
const css = await readFile('src/index.css', 'utf8')
const cream = /--color-background:\s*([^;\s]+)/.exec(css)?.[1]
if (!cream) throw new Error('--color-background not found in src/index.css')

const transparent = { r: 0, g: 0, b: 0, alpha: 0 }

async function square(size, background, padding) {
  const inner = size - padding * 2
  const logo = await sharp(LOGO).trim().resize(inner, inner, { fit: 'contain', background: transparent }).toBuffer()
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: logo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
}

for (const [file, size, background, padding] of [
  ['public/favicon-32.png', 32, transparent, 0],
  ['public/apple-touch-icon.png', 180, cream, 14],
]) {
  const info = await (await square(size, background, padding)).toFile(file)
  console.log(`${file}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(1)} KB`)
}
