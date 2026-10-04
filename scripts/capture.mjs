// Renders the PNG icons from public/favicon.svg and captures the social
// preview image and README screenshots from a running build:
//   npm run build && npm run preview -- --port 4173
//   BASE_URL=http://localhost:4173/ npm run capture
import { chromium } from '@playwright/test'
import fs from 'node:fs'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173/'
const SCAM_EXAMPLE = 'BISP کے نام پر فراڈ'
const SAFE_EXAMPLE = 'عام سچا میسج'

const browser = await chromium.launch()

async function renderIcons() {
  const svg = fs.readFileSync('public/favicon.svg', 'utf8')
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  const page = await browser.newPage()
  // Full-bleed background so iOS and maskable icons have no transparent corners.
  for (const [file, size, inset] of [
    ['public/apple-touch-icon.png', 180, 0],
    ['public/icon-192.png', 192, 0],
    ['public/icon-512.png', 512, 0.1],
  ]) {
    const pad = Math.round(size * inset)
    await page.setViewportSize({ width: size, height: size })
    await page.setContent(
      `<body style="margin:0;background:#1745a8"><img src="${src}" style="display:block;margin:${pad}px;width:${size - 2 * pad}px;height:${size - 2 * pad}px"></body>`,
    )
    await page.screenshot({ path: file })
  }
  await page.close()
}

async function openApp(viewport, deviceScaleFactor) {
  const context = await browser.newContext({ viewport, deviceScaleFactor, reducedMotion: 'reduce', locale: 'ur-PK' })
  const page = await context.newPage()
  await page.goto(BASE_URL)
  await page.evaluate(() => document.fonts.ready)
  return { context, page }
}

async function loadExample(page, label) {
  await page.goto(`${BASE_URL}#/help`)
  await page.getByRole('button', { name: label }).click()
  await page.getByRole('textbox', { name: 'مشکوک میسج یہاں ڈالیں' }).waitFor()
  await page.mouse.move(0, 0)
}

async function check(page) {
  await page.getByRole('button', { name: 'میسج چیک کریں' }).click()
  await page.locator('.verdict').waitFor()
  await page.mouse.move(0, 0)
  await page.evaluate(() => document.fonts.ready)
}

async function captureScreenshots() {
  fs.mkdirSync('docs/screenshots', { recursive: true })
  const { context, page } = await openApp({ width: 390, height: 844 }, 2)

  await loadExample(page, SCAM_EXAMPLE)
  await page.screenshot({ path: 'docs/screenshots/check.png' })
  await check(page)
  await page.screenshot({ path: 'docs/screenshots/scam.png' })
  await page.screenshot({ path: 'docs/screenshots/scam-full.png', fullPage: true })

  await loadExample(page, SAFE_EXAMPLE)
  await check(page)
  await page.screenshot({ path: 'docs/screenshots/safe.png' })
  await context.close()

  const og = await openApp({ width: 1200, height: 630 }, 1)
  await loadExample(og.page, SCAM_EXAMPLE)
  await check(og.page)
  await og.page.screenshot({ path: 'public/og-image.png' })
  await og.context.close()
}

await renderIcons()
await captureScreenshots()
await browser.close()
console.log('Icons, social image and screenshots written.')
