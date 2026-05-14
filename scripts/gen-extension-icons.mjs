// Generate extension icons at 16, 48, 96, 128px
// Pure Node.js -- no external image dependencies
// Same SDF-based approach as the original gen-icons-sdf.mjs used for public/icon-*.png

import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

function generateIcon(size, outPath) {
  const bgR = 0x55, bgG = 0x48, bgB = 0xc8

  const pixels = new Uint8Array(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    pixels[i*4+0] = bgR; pixels[i*4+1] = bgG; pixels[i*4+2] = bgB; pixels[i*4+3] = 255
  }

  // Rounded square clip: set alpha=0 outside
  const cornerR = size * 0.225
  const hc = size / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = Math.max(Math.abs(x + 0.5 - hc) - (hc - cornerR), 0)
      const dy = Math.max(Math.abs(y + 0.5 - hc) - (hc - cornerR), 0)
      if (Math.sqrt(dx*dx + dy*dy) > cornerR) {
        pixels[(y*size+x)*4+3] = 0
      }
    }
  }

  // "A" letterform parameters
  const capH  = size * 0.58
  const baseY = size * 0.80
  const topY  = baseY - capH

  const lw    = size * 0.52
  const leftX = (size - lw) / 2
  const rightX = leftX + lw
  const apexX = size / 2

  // Stroke width (ExtraBold weight)
  const sw    = capH * 0.175
  const sw2   = sw / 2

  // Crossbar position: ~58% down from top
  const crossY = topY + capH * 0.58

  function segDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay
    const len2 = dx*dx + dy*dy
    if (len2 < 1e-9) return Math.hypot(px - ax, py - ay)
    const t = Math.max(0, Math.min(1, ((px-ax)*dx + (py-ay)*dy) / len2))
    return Math.hypot(px - ax - t*dx, py - ay - t*dy)
  }

  const aa = 1.2
  function paint(x, y, dist) {
    if (x < 0 || y < 0 || x >= size || y >= size) return
    const alpha_mask = pixels[(y*size+x)*4+3]
    if (alpha_mask === 0) return
    const coverage = Math.max(0, Math.min(1, (sw2 - dist) / aa + 0.5))
    if (coverage <= 0) return
    const idx = (y*size+x)*4
    pixels[idx+0] = Math.round(pixels[idx+0] * (1-coverage) + 255 * coverage)
    pixels[idx+1] = Math.round(pixels[idx+1] * (1-coverage) + 255 * coverage)
    pixels[idx+2] = Math.round(pixels[idx+2] * (1-coverage) + 255 * coverage)
  }

  function stroke(ax, ay, bx, by) {
    const margin = Math.ceil(sw2 + aa + 1)
    const minX = Math.max(0, Math.floor(Math.min(ax,bx) - margin))
    const maxX = Math.min(size-1, Math.ceil(Math.max(ax,bx) + margin))
    const minY = Math.max(0, Math.floor(Math.min(ay,by) - margin))
    const maxY = Math.min(size-1, Math.ceil(Math.max(ay,by) + margin))
    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        paint(px, py, segDist(px+0.5, py+0.5, ax, ay, bx, by))
      }
    }
  }

  const tCross = (crossY - topY) / (baseY - topY)
  const leftLegCX  = apexX + tCross * (leftX  - apexX)
  const rightLegCX = apexX + tCross * (rightX - apexX)

  function perpIn(ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay
    const len = Math.hypot(dx, dy)
    return { nx: -dy/len, ny: dx/len }
  }

  const leftPerp  = perpIn(apexX, topY, leftX,  baseY)
  const rightPerp = perpIn(rightX, baseY, apexX, topY)

  const leftInnerCX  = leftLegCX  + leftPerp.nx  * sw2
  const rightInnerCX = rightLegCX + rightPerp.nx * sw2

  stroke(apexX, topY, leftX,  baseY)
  stroke(apexX, topY, rightX, baseY)
  stroke(leftInnerCX, crossY, rightInnerCX, crossY)

  // PNG encode
  function crc32(buf) {
    const table = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
      table[i] = c
    }
    let crc = 0xffffffff
    for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
    return (crc ^ 0xffffffff) >>> 0
  }

  function chunk(type, data) {
    const typeBytes = Buffer.from(type, 'ascii')
    const combined = Buffer.concat([typeBytes, data])
    const crc = crc32(combined)
    const out = Buffer.alloc(4 + 4 + data.length + 4)
    out.writeUInt32BE(data.length, 0)
    typeBytes.copy(out, 4)
    data.copy(out, 8)
    out.writeUInt32BE(crc, 8 + data.length)
    return out
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8]=8; ihdr[9]=6; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0  // RGBA

  const rawRows = []
  for (let y = 0; y < size; y++) {
    rawRows.push(0)  // filter byte
    for (let x = 0; x < size; x++) {
      const i = (y*size+x)*4
      rawRows.push(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3])
    }
  }
  const compressed = deflateSync(Buffer.from(rawRows))
  const png = Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))])
  writeFileSync(outPath, png)
  console.log(`Written: ${outPath} (${size}x${size})`)
}

// Create icon directories
mkdirSync(join(rootDir, 'extension-static', 'icons'), { recursive: true })
mkdirSync(join(rootDir, 'extension-firefox-static', 'icons'), { recursive: true })

// Chrome: 16, 48, 128
// Firefox: 16, 48, 96
// Generate all unique sizes and copy to both dirs
const chromeSizes = [16, 48, 128]
const firefoxSizes = [16, 48, 96]
const allSizes = [...new Set([...chromeSizes, ...firefoxSizes])]

// Generate into both dirs (each dir gets only its needed sizes)
for (const size of chromeSizes) {
  generateIcon(size, join(rootDir, 'extension-static', 'icons', `icon-${size}.png`))
}
for (const size of firefoxSizes) {
  generateIcon(size, join(rootDir, 'extension-firefox-static', 'icons', `icon-${size}.png`))
}

console.log('Done.')
