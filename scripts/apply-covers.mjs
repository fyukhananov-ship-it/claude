#!/usr/bin/env node
/**
 * Apply generated category covers to mockData.ts
 * Reads covers/mapping.json and updates the image_url in makeOffer()
 *
 * Usage: node scripts/apply-covers.mjs
 */

import { readFile, writeFile } from 'fs/promises'

const MOCK_PATH = new URL('../frontend/src/api/mockData.ts', import.meta.url).pathname
const MAPPING_PATH = new URL('../frontend/public/assets/offers/covers/mapping.json', import.meta.url).pathname

async function main() {
  const mapping = JSON.parse(await readFile(MAPPING_PATH, 'utf-8'))
  let mockData = await readFile(MOCK_PATH, 'utf-8')

  // Build category → cover URL map
  const catCovers = {}
  for (const m of mapping) {
    if (m.image_url && !catCovers[m.category]) {
      catCovers[m.category] = m.image_url
    }
  }

  console.log('Category covers found:')
  for (const [cat, url] of Object.entries(catCovers)) {
    console.log(`  ${cat} → ${url}`)
  }

  // Replace the image_url line in makeOffer to use category-based covers
  const oldLine = `image_url: \`/claude/assets/offers/offer-\${idx + 1}.svg\``
  const newCode = `image_url: (${JSON.stringify(catCovers)} as Record<string, string>)[category] || \`/claude/assets/offers/offer-\${idx + 1}.svg\``

  if (mockData.includes(oldLine)) {
    mockData = mockData.replace(oldLine, newCode)
    await writeFile(MOCK_PATH, mockData)
    console.log('\n✅ mockData.ts updated — offers now use AI-generated category covers.')
  } else {
    console.log('\n⚠️  Could not find image_url pattern in mockData.ts. Manual update needed.')
    console.log('Replace image_url in makeOffer() with:')
    console.log(newCode)
  }
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
