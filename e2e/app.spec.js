import { expect, test } from '@playwright/test'

const SCAM =
  'مبارک ہو! آپ کی بینظیر انکم سپورٹ کی 25000 روپے کی قسط آ گئی ہے۔ وصول کرنے کے لیے bit.ly/abc12 پر جائیں'
const SAFE = 'امی جان شام کو خالہ کے گھر جانا ہے، تیار رہیے گا۔'

const messageBox = (page) => page.getByRole('textbox', { name: 'مشکوک میسج یہاں ڈالیں' })
const checkButton = (page) => page.getByRole('button', { name: 'میسج چیک کریں' })

async function expectNoSidewaysScroll(page) {
  const fits = await page.evaluate(
    () => document.documentElement.scrollWidth === document.documentElement.clientWidth,
  )
  expect(fits).toBe(true)
}

test('asks for a message before checking', async ({ page }) => {
  await page.goto('/')
  await checkButton(page).click()
  await expect(page.getByRole('alert')).toHaveText('پہلے میسج اس خانے میں ڈالیں، پھر بٹن دبائیں۔')
  await expect(messageBox(page)).toHaveAttribute('aria-invalid', 'true')
  await expect(messageBox(page)).toBeFocused()
  await expect(page).toHaveURL(/#\/$|\/$/)
})

test('a scam turns the screen red, explains why and prepares a WhatsApp alert', async ({ page }) => {
  await page.goto('/')
  await messageBox(page).fill(SCAM)
  await checkButton(page).click()

  const verdict = page.getByRole('heading', { level: 1 })
  await expect(verdict).toHaveText('🚨 یہ جھوٹا اور فراڈ میسج ہے!')
  await expect(verdict).toBeFocused()
  await expect(page.locator('main')).toHaveCSS('background-color', 'rgb(231, 76, 60)')
  await expect(page.locator('.reasons li')).not.toHaveCount(0)

  const alert = page.getByRole('link', { name: 'فیملی کو واٹس ایپ پر الرٹ کریں' })
  const text = new URL(await alert.getAttribute('href')).searchParams.get('text')
  expect(text).toContain('سب ہوشیار رہیں! مجھے یہ فراڈ میسج آیا ہے، آپ سب بھی بچ کر رہیں۔')
  expect(text).toContain('bit[.]ly/abc12')
  expect(text).not.toContain('bit.ly')
  await expectNoSidewaysScroll(page)

  await page.getByRole('button', { name: 'دوسرا میسج چیک کریں' }).click()
  await expect(messageBox(page)).toHaveValue('')
})

test('a normal message turns the screen green with no alert button', async ({ page }) => {
  await page.goto('/')
  await messageBox(page).fill(SAFE)
  await checkButton(page).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('✅ یہ میسج محفوظ لگتا ہے۔')
  await expect(page.locator('main')).toHaveCSS('background-color', 'rgb(46, 204, 113)')
  await expect(page.getByRole('link', { name: /واٹس ایپ/ })).toHaveCount(0)
  await expectNoSidewaysScroll(page)
})

test('the 8171 rule uses the sender number', async ({ page }) => {
  const bisp = 'BISP: Aap ki Benazir Kafaalat ki qist ke liye apne qareebi campsite tashreef layen.'
  await page.goto('/')
  await messageBox(page).fill(bisp)
  await page.getByRole('textbox', { name: /کس نمبر سے آیا/ }).fill('8171')
  await checkButton(page).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('✅ یہ میسج محفوظ لگتا ہے۔')

  await page.goBack()
  await page.getByRole('textbox', { name: /کس نمبر سے آیا/ }).fill('0301 2345678')
  await checkButton(page).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('🚨 یہ جھوٹا اور فراڈ میسج ہے!')
  await expect(page.locator('.reasons')).toContainText('8171')
})

test('the verdict appears within half a second', async ({ page }) => {
  await page.goto('/')
  await messageBox(page).fill(SCAM)
  const started = Date.now()
  await checkButton(page).click()
  await expect(page.locator('main.result-scam')).toBeVisible()
  expect(Date.now() - started).toBeLessThan(500)
})

test('sample messages on the help page load into the checker', async ({ page }) => {
  await page.goto('/#/help')
  await page.getByRole('button', { name: 'انعام کا لالچ' }).click()
  await expect(messageBox(page)).toHaveValue(/جیتو پاکستان/)
})

test('no screen scrolls sideways', async ({ page }) => {
  for (const route of ['/', '/#/help', '/#/privacy', '/#/missing']) {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expectNoSidewaysScroll(page)
  }
})

test('keeps working offline after the first visit', async ({ page, context }) => {
  await page.goto('/')
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload()
  await context.setOffline(true)
  await expect(page.getByRole('status')).toContainText('انٹرنیٹ بند ہے')
  await page.reload()
  await messageBox(page).fill(SCAM)
  await checkButton(page).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('🚨 یہ جھوٹا اور فراڈ میسج ہے!')
  await expect(page.getByText('انٹرنیٹ آنے پر واٹس ایپ پیغام چلا جائے گا۔')).toBeVisible()
})
