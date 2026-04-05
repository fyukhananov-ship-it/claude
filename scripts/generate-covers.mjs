#!/usr/bin/env node
/**
 * Generate AI cover images for offer categories via fal.ai API.
 *
 * Usage:
 *   export FAL_KEY="your-key-here"
 *   node scripts/generate-covers.mjs
 *
 * Generates 1 cover per category (12 total), then assigns to all offers
 * in that category. Uses fal-ai/flux/dev for photorealistic fintech quality.
 */

import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'

const FAL_KEY = process.env.FAL_KEY
if (!FAL_KEY) {
  console.error('❌ Set FAL_KEY environment variable first:\n  export FAL_KEY="f24f4580-6de3-49a0-a579-a585542f665f:15008f22536a18fb9af5d375081f15dc"')
  process.exit(1)
}

const OUT_DIR = new URL('../frontend/public/assets/offers/covers', import.meta.url).pathname
const MODEL = 'fal-ai/flux/dev'

const CATEGORY_PROMPTS = {
  'Купить продукты': 'Fintech cashback app offer cover: fresh organic vegetables, fruits and groceries arranged in premium flat lay on dark marble surface, soft studio lighting, vibrant natural colors, shallow depth of field. Clean modern aesthetic. No text, no logos, no people.',
  'Обновить гардероб': 'Fintech cashback app offer cover: stylish fashion items - leather jacket, designer sneakers, sunglasses, watch arranged as premium flat lay on dark textured surface, warm studio lighting, luxury fashion editorial style. No text, no logos, no people.',
  'Позаботиться о себе': 'Fintech cashback app offer cover: luxury beauty and skincare products - cream jars, serum bottles, perfume with golden caps on dark marble surface, soft warm lighting, elegant reflections, premium cosmetics editorial. No text, no logos, no people.',
  'Поесть вне дома': 'Fintech cashback app offer cover: beautifully plated gourmet dish on dark restaurant table, warm ambient candlelight bokeh, premium food photography, shallow depth of field, appetizing colors. No text, no logos, no people.',
  'Заказать доставку': 'Fintech cashback app offer cover: stylish food delivery paper bags and takeaway containers with fresh food visible, smartphone nearby, dark modern kitchen counter, warm overhead lighting. No text, no logos, no people.',
  'Заняться спортом': 'Fintech cashback app offer cover: premium athletic gear - matte black dumbbells, resistance bands, water bottle, running shoes on dark gym floor, dramatic side lighting, fitness lifestyle aesthetic. No text, no logos, no people.',
  'Обустроить дом': 'Fintech cashback app offer cover: home renovation mood board - paint swatches, wood samples, small potted plants, design tools on dark workspace, warm natural lighting, interior design aesthetic. No text, no logos, no people.',
  'Купить технику': 'Fintech cashback app offer cover: modern tech gadgets - smartphone, wireless earbuds case, smartwatch on dark reflective surface, cool blue and purple ambient LED lighting, tech editorial style. No text, no logos, no people.',
  'Порадовать ребёнка': 'Fintech cashback app offer cover: high-quality colorful children toys - wooden blocks, soft plush animal, picture book on warm light wood surface, soft diffused window light, playful yet premium aesthetic. No text, no logos, no people.',
  'Заправить авто': 'Fintech cashback app offer cover: sleek car side profile at modern gas station at dusk, cinematic blue hour lighting, reflections on wet ground, premium automotive photography. No text, no logos, no people.',
  'Отдохнуть': 'Fintech cashback app offer cover: travel flatlay on dark surface - vintage passport, boarding pass, camera, sunglasses, small globe, golden hour warm lighting, wanderlust aesthetic. No text, no logos, no people.',
  'Подписаться': 'Fintech cashback app offer cover: modern digital lifestyle - over-ear headphones, tablet showing abstract colorful waveforms, ambient purple and blue neon glow on dark desk, streaming music aesthetic. No text, no logos, no people.',
}

// Offer → category mapping (matches mockData.ts order exactly)
const OFFER_CATEGORIES = [
  'Купить продукты','Купить продукты','Купить продукты','Купить продукты','Купить продукты','Купить продукты',
  'Обустроить дом','Обустроить дом','Обустроить дом','Обустроить дом','Обустроить дом',
  'Обновить гардероб','Обновить гардероб','Обновить гардероб','Обновить гардероб','Обновить гардероб','Обновить гардероб',
  'Позаботиться о себе','Позаботиться о себе','Позаботиться о себе','Позаботиться о себе','Позаботиться о себе',
  'Заняться спортом','Заняться спортом','Заняться спортом','Заняться спортом','Заняться спортом',
  'Поесть вне дома','Поесть вне дома','Поесть вне дома','Поесть вне дома','Поесть вне дома','Поесть вне дома',
  'Поесть вне дома','Поесть вне дома','Поесть вне дома','Поесть вне дома','Поесть вне дома',
  'Поесть вне дома','Поесть вне дома','Поесть вне дома','Поесть вне дома','Поесть вне дома',
  'Заказать доставку','Заказать доставку','Заказать доставку','Заказать доставку','Заказать доставку',
  'Купить технику','Купить технику','Купить технику','Купить технику','Купить технику',
  'Порадовать ребёнка','Порадовать ребёнка','Порадовать ребёнка','Порадовать ребёнка','Порадовать ребёнка',
  'Подписаться','Подписаться','Подписаться','Подписаться','Подписаться',
  'Заправить авто','Заправить авто','Заправить авто','Заправить авто','Заправить авто',
  'Отдохнуть','Отдохнуть','Отдохнуть','Отдохнуть','Отдохнуть',
  'Отдохнуть','Отдохнуть','Отдохнуть','Отдохнуть','Отдохнуть',
  'Купить продукты','Купить продукты','Купить продукты','Купить продукты','Купить продукты',
  'Заправить авто','Заправить авто','Заправить авто','Заправить авто','Заправить авто',
  'Подписаться','Подписаться','Подписаться','Подписаться','Подписаться','Подписаться',
]

async function generateImage(prompt) {
  const res = await fetch(`https://queue.fal.run/${MODEL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_size: 'landscape_4_3',
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: true,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`fal.ai API error ${res.status}: ${text}`)
  }

  const data = await res.json()

  // queue.fal.run returns request_id, need to poll for result
  if (data.request_id) {
    return pollResult(data.request_id)
  }

  return data.images[0].url
}

async function pollResult(requestId) {
  const maxAttempts = 60
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 2000))

    const res = await fetch(`https://queue.fal.run/${MODEL}/requests/${requestId}/status`, {
      headers: { 'Authorization': `Key ${FAL_KEY}` },
    })
    const status = await res.json()

    if (status.status === 'COMPLETED') {
      const resultRes = await fetch(`https://queue.fal.run/${MODEL}/requests/${requestId}`, {
        headers: { 'Authorization': `Key ${FAL_KEY}` },
      })
      const result = await resultRes.json()
      return result.images[0].url
    }

    if (status.status === 'FAILED') {
      throw new Error(`Generation failed: ${JSON.stringify(status)}`)
    }

    process.stdout.write('.')
  }
  throw new Error('Timeout waiting for generation')
}

async function downloadImage(url, path) {
  const res = await fetch(url)
  const buffer = Buffer.from(await res.arrayBuffer())
  await writeFile(path, buffer)
  return buffer.length
}

async function main() {
  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true })
  }

  console.log('🎨 Generating category covers via fal.ai (flux/dev)...\n')

  const categoryFiles = {}
  const categories = Object.entries(CATEGORY_PROMPTS)

  // Generate 3 at a time to avoid rate limits
  for (let i = 0; i < categories.length; i += 3) {
    const batch = categories.slice(i, i + 3)
    const results = await Promise.allSettled(
      batch.map(async ([cat, prompt]) => {
        const slug = cat.replace(/[^a-zа-яё0-9]/gi, '-').toLowerCase()
        const filePath = `${OUT_DIR}/${slug}.jpg`

        console.log(`⏳ ${cat}...`)
        const imageUrl = await generateImage(prompt)
        const size = await downloadImage(imageUrl, filePath)
        console.log(`✅ ${cat} → ${slug}.jpg (${(size / 1024).toFixed(0)} KB)`)

        categoryFiles[cat] = `/claude/assets/offers/covers/${slug}.jpg`
        return cat
      })
    )

    for (const r of results) {
      if (r.status === 'rejected') {
        console.error(`❌ Failed:`, r.reason.message)
      }
    }
  }

  // Now create symlinks / copies for each offer
  console.log('\n📋 Mapping covers to offers...\n')

  const mappings = OFFER_CATEGORIES.map((cat, i) => ({
    offer: `offer-${i + 1}`,
    category: cat,
    image_url: categoryFiles[cat] || null,
  }))

  // Write mapping JSON for reference
  await writeFile(
    `${OUT_DIR}/mapping.json`,
    JSON.stringify(mappings, null, 2)
  )

  const generated = Object.keys(categoryFiles).length
  console.log(`\n🎉 Done! Generated ${generated}/12 category covers.`)
  console.log(`📁 Saved to: frontend/public/assets/offers/covers/`)
  console.log(`📄 Mapping: covers/mapping.json`)
  console.log(`\n💡 Next: update mockData.ts image_url to use category covers.`)
  console.log(`   Run: node scripts/apply-covers.mjs`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
