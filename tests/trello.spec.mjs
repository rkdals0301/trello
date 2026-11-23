import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

test('signs in and opens board and card views from the production bundle', async ({ page }) => {
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error.message))

  const card = { id: 3, title: 'Review changes', description: 'Check the board', pos: 65535 }
  const board = {
    id: 1,
    title: 'Project board',
    bgColor: '#026aa7',
    lists: [
      { id: 2, title: 'To do', pos: 65535, cards: [card] },
      { id: 4, title: 'Done', pos: 131070, cards: [] }
    ]
  }
  const responses = {
    'POST /login': { accessToken: 'smoke-test-token' },
    'GET /boards': { list: [board] },
    'GET /boards/1': { item: board },
    'GET /cards/3': { item: card },
    'PUT /cards/3': { item: card }
  }
  await page.route('http://localhost:3000/**', async route => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const headers = {
      'access-control-allow-origin': 'http://127.0.0.1:4173',
      'access-control-allow-headers': 'authorization, content-type',
      'access-control-allow-methods': 'GET, POST, PUT, OPTIONS'
    }
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers })
      return
    }
    const response = responses[`${request.method()} ${path}`]
    expect(response).toBeDefined()
    if (path === '/login') {
      expect(request.postDataJSON()).toEqual({
        email: 'user@example.test',
        password: 'example-password'
      })
    } else {
      expect(request.headers().authorization).toBe('Bearer smoke-test-token')
    }
    if (request.method() === 'PUT') {
      expect(request.postDataJSON()).toEqual({ listId: 4, pos: 65535 })
      board.lists[0].cards = []
      board.lists[1].cards = [card]
    }
    await route.fulfill({ headers, json: response })
  })

  await page.goto('/trello/')
  await expect(page.getByRole('heading', { name: 'Log in to Trello' })).toBeVisible()
  await page.locator('input[name="email"]').fill('user@example.test')
  await page.locator('input[type="password"]').fill('example-password')
  await page.getByRole('button', { name: 'Log In' }).click()

  const boardLink = page.getByRole('link', { name: 'Project board' })
  await expect(boardLink).toHaveAttribute('href', '/trello/b/1')
  await page.getByText('Create new board...').click()
  await expect(page.getByRole('heading', { name: /Create new board/ })).toBeVisible()
  await expect(page.locator('#add-board-form input')).toBeFocused()
  await page.locator('.modal-default-button').click()

  await boardLink.click()
  await expect(page.getByText('To do', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: /Review changes/ }).click()
  await expect(page).toHaveURL(/\/trello\/b\/1\/c\/3$/)
  await expect(page.locator('.modal-card input')).toHaveValue('Review changes')
  await expect(page.locator('.modal-card textarea')).toHaveValue('Check the board')
  await page.locator('.modal-close-btn').click()
  await expect(page).toHaveURL(/\/trello\/b\/1$/)
  await expect(page.locator('.modal-card')).toBeHidden()

  const done = page.locator('.card-list[data-list-id="4"]')
  const cardLink = page.getByRole('link', { name: /Review changes/ })
  const saved = page.waitForResponse(response =>
    response.url() === 'http://localhost:3000/cards/3' && response.request().method() === 'PUT'
  )
  await cardLink.dragTo(done)
  expect((await saved).ok()).toBe(true)
  await expect(done.getByRole('link', { name: /Review changes/ })).toBeVisible()

  await page.getByRole('link', { name: 'Home' }).click()
  await expect(boardLink).toBeVisible()
  expect(pageErrors).toEqual([])
})

test('handles a GitHub Pages deep link with the built 404 fallback', async ({ page }) => {
  const deepLink = '/trello/b/1/c/3'
  const fallback = await readFile(new URL('../dist/404.html', import.meta.url))
  await page.route(`**${deepLink}`, route =>
    route.fulfill({ status: 404, contentType: 'text/html; charset=utf-8', body: fallback })
  )
  await page.goto(deepLink)
  await expect(page.getByRole('heading', { name: 'Log in to Trello' })).toBeVisible()
  const url = new URL(page.url())
  expect(url.pathname).toBe('/trello/login')
  expect(url.searchParams.get('rPath')).toBe('/b/1/c/3')
})
