import { test, expect } from '@playwright/test'

const browserErrors = new WeakMap<object, string[]>()

test.beforeEach(async ({ page }) => {
  const errors: string[] = []
  browserErrors.set(page, errors)
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) errors.push(message.text())
  })
  const clockStart = new Date('2026-11-20T00:00:00Z')
  await page.clock.install({ time: clockStart })
  await page.clock.pauseAt(clockStart)
  await page.addInitScript(() => {
    let state = 42
    Math.random = () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0
      return state / 4294967296
    }
  })
  await page.goto('/')
  await expect(page.locator('vite-error-overlay')).toHaveCount(0)
})

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page)).toEqual([])
})

test('generates a meeting and completes six sequential rounds', async ({ page }) => {
  await expect(page).toHaveTitle(/Race/i)
  await expect(page.getByTestId('horse-row')).toHaveCount(20)
  await expect(page.getByRole('button', { name: 'Start races', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Generate schedule', exact: true }).click()
  await expect(page.getByTestId('schedule-round')).toHaveCount(6)
  await expect(page.getByTestId('race-lane')).toHaveCount(10)
  await expect(page.getByTestId('result-round')).toHaveCount(0)
  for (const [index, distance] of [1200, 1400, 1600, 1800, 2000, 2200].entries()) {
    await expect(page.getByTestId('schedule-round').nth(index)).toContainText(
      new RegExp(`${String(distance)[0]},?${String(distance).slice(1)}`),
    )
  }
  await page.getByLabel('Race speed').selectOption('4')
  await page.getByRole('button', { name: 'Start races', exact: true }).click()
  await page.clock.runFor(1000)
  await expect(page.getByTestId('result-round')).toHaveCount(0)
  for (let step = 0; step < 10 && (await page.getByTestId('result-round').count()) === 0; step++)
    await page.clock.runFor(250)
  await expect(page.getByTestId('result-round')).toHaveCount(1)
  await page.clock.runFor(30000)
  await expect(page.getByTestId('result-round')).toHaveCount(6)
  await expect(page.getByTestId('race-status')).toContainText(/complete|finished/i)
  await page.screenshot({
    path: '/tmp/insider-qa/completed.png',
    fullPage: true,
    animations: 'disabled',
  })
  for (const result of await page.getByTestId('result-round').all())
    await expect(result.locator('tbody tr')).toHaveCount(10)
})

test('pauses without advancing and resets a completed schedule', async ({ page }) => {
  await page.getByRole('button', { name: 'Generate schedule', exact: true }).press('Enter')
  await page.getByRole('button', { name: 'Start races', exact: true }).click()
  const initialPositions = await page
    .locator('.runner')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('style')))
  await page.clock.runFor(500)
  expect(
    await page
      .locator('.runner')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('style'))),
  ).not.toEqual(initialPositions)
  await page.getByRole('button', { name: 'Pause races', exact: true }).click()
  const pausedLanes = await page
    .locator('.runner')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('style')))
  await page.clock.runFor(30000)
  await expect(page.getByTestId('result-round')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Resume races', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Generate schedule', exact: true })).toBeDisabled()
  expect(
    await page
      .locator('.runner')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('style'))),
  ).toEqual(pausedLanes)
  await page.getByRole('button', { name: 'Resume races', exact: true }).click()
  await page.clock.runFor(90000)
  await expect(page.getByTestId('result-round')).toHaveCount(6)
  await page.getByRole('button', { name: 'Generate schedule', exact: true }).click()
  await expect(page.getByTestId('result-round')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Start races', exact: true })).toBeEnabled()
})

test('@visual renders desktop and mobile without horizontal page overflow', async ({ page }) => {
  await page.getByRole('button', { name: 'Generate schedule', exact: true }).click()
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    await expect(page.getByRole('button', { name: 'Generate schedule', exact: true })).toBeVisible()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
    await page.mouse.move(0, 0)
    await page.screenshot({
      path: `/tmp/insider-qa/${viewport.width === 390 ? 'mobile' : 'desktop'}.png`,
      fullPage: true,
      animations: 'disabled',
    })
    await expect(page).toHaveScreenshot(
      `${viewport.width === 390 ? 'mobile' : 'desktop'}-schedule.png`,
      { fullPage: true, animations: 'disabled' },
    )
  }
})

test('@visual preserves paused runners and completed results layout', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.getByRole('button', { name: 'Generate schedule', exact: true }).click()
  await page.getByLabel('Race speed').selectOption('4')
  await page.getByRole('button', { name: 'Start races', exact: true }).click()
  await page.clock.runFor(500)
  await page.getByRole('button', { name: 'Pause races', exact: true }).click()
  await expect(page.getByTestId('race-status')).toContainText('paused')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.mouse.move(0, 0)
  await expect(page).toHaveScreenshot('desktop-paused.png', {
    fullPage: true,
    animations: 'disabled',
  })
  await page.getByRole('button', { name: 'Resume races', exact: true }).click()
  await page.clock.runFor(30000)
  await expect(page.getByTestId('result-round')).toHaveCount(6)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.mouse.move(0, 0)
  await expect(page).toHaveScreenshot('desktop-completed.png', {
    fullPage: true,
    animations: 'disabled',
  })
  await page.screenshot({
    path: '/tmp/insider-qa/completed-desktop.png',
    fullPage: true,
    animations: 'disabled',
  })
})
