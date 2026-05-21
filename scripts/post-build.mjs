#!/usr/bin/env node
/**
 * Post-Build-Skript:
 * - Berechnet SRI-Hashes (SHA-384) für alle Library-Bundles und schreibt
 *   eine `integrity.json` ins Demo-Verzeichnis.
 * - Spiegelt die Library-Bundles unter versionierten Pfaden:
 *     /booking-widget.umd.js          (latest, für Quick-Tests)
 *     /v1/booking-widget.umd.js       (pinned auf Major v1)
 *     /v{X.Y.Z}/booking-widget.umd.js (pinned auf exakte Version)
 *   So können Konsumenten ihre Snippet-Stabilität wählen.
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PKG = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'))
const VERSION = PKG.version
const MAJOR = `v${VERSION.split('.')[0]}`
const FULL = `v${VERSION}`

const DEMO_DIR = join(ROOT, 'dist-demo')

if (!existsSync(DEMO_DIR)) {
  console.error('[post-build] dist-demo missing — run `npm run build:demo` first.')
  process.exit(1)
}

const BUNDLES = ['booking-widget.umd.js', 'booking-widget.es.js']

function sriHash(filepath) {
  const buf = readFileSync(filepath)
  const hash = createHash('sha384').update(buf).digest('base64')
  return `sha384-${hash}`
}

const integrity = { version: VERSION, bundles: {} }

for (const bundle of BUNDLES) {
  const src = join(DEMO_DIR, bundle)
  if (!existsSync(src)) {
    console.warn(`[post-build] missing ${bundle} — skipping`)
    continue
  }
  const hash = sriHash(src)
  integrity.bundles[bundle] = hash

  // Versionierte Kopien anlegen
  for (const slug of [MAJOR, FULL]) {
    const targetDir = join(DEMO_DIR, slug)
    mkdirSync(targetDir, { recursive: true })
    const target = join(targetDir, bundle)
    copyFileSync(src, target)
  }
}

writeFileSync(
  join(DEMO_DIR, 'integrity.json'),
  JSON.stringify(integrity, null, 2),
)

console.log(`[post-build] published ${VERSION} → /${MAJOR}/ and /${FULL}/`)
console.log('[post-build] SRI hashes written to integrity.json')
for (const [name, hash] of Object.entries(integrity.bundles)) {
  console.log(`  ${name}: ${hash}`)
}
