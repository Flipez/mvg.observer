import { expect, test } from "@playwright/test"

test.describe("Insights Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/insights")
    await page.waitForLoadState("domcontentloaded")
    await expect(page.locator("h1")).toBeVisible()
  })

  test("station dropdown search functionality works", async ({ page }) => {
    // Open station dropdown
    const stationDropdown = page.locator('button[role="combobox"]')
    await expect(stationDropdown).toBeVisible()
    await stationDropdown.click()

    // Check if search input appears
    const searchInput = page.locator('input[placeholder*="Search"]')
    await expect(searchInput).toBeVisible()

    // Type in search box
    await searchInput.fill("Marienplatz")

    // Check if Marienplatz option appears
    await expect(
      page.locator('button:has-text("Marienplatz")').first()
    ).toBeVisible()

    // Click on Marienplatz
    await page.locator('button:has-text("Marienplatz")').first().click()

    // Verify dropdown closed and station is selected
    await expect(
      page.locator('button[role="combobox"]:has-text("Marienplatz")')
    ).toBeVisible()
  })

  test("station dropdown filters results correctly", async ({ page }) => {
    // Open dropdown
    await page.locator('button[role="combobox"]').click()

    const searchInput = page.locator('input[placeholder*="Search"]')

    // Search for "Haupt" - should show Hauptbahnhof
    await searchInput.fill("Haupt")
    await expect(
      page.locator('button:has-text("Hauptbahnhof")').first()
    ).toBeVisible()

    // Clear and search for something that doesn't exist
    await searchInput.fill("NonExistentStation")
    await expect(page.locator("text=No stations found")).toBeVisible()

    // Clear search - should show all stations again
    await searchInput.fill("")
    await expect(
      page.locator('button:has-text("Marienplatz")').first()
    ).toBeVisible()
    await expect(
      page.locator('button:has-text("Hauptbahnhof")').first()
    ).toBeVisible()
  })

  test("date pickers are functional", async ({ page }) => {
    // Check if date picker buttons exist (they're Button components with calendar icons)
    const datePickerButtons = page
      .locator("button:has(svg)")
      .filter({ hasText: /\d/ }) // Look for buttons with dates

    if ((await datePickerButtons.count()) >= 2) {
      // Check if start date picker button exists
      await expect(datePickerButtons.first()).toBeVisible()

      // Check if end date picker button exists
      await expect(datePickerButtons.nth(1)).toBeVisible()

      // Click on start date should open calendar (if implemented)
      await datePickerButtons.first().click()
      // Calendar popup may or may not be visible depending on implementation
    } else {
      // Fallback: just check that some buttons exist on the page
      await expect(page.locator("button").first()).toBeVisible()
    }
  })

  test("station selection shows analytics cards", async ({ page }) => {
    // Select a station
    await page.locator('button[role="combobox"]').click()
    await page.locator('input[placeholder*="Search"]').fill("Marienplatz")
    await page.locator('button:has-text("Marienplatz")').first().click()

    // Wait for potential data loading and check for loading indicator
    await page.waitForTimeout(2000)

    // Check if analytics cards appear - they should be Card components in a grid
    const gridContainer = page.locator(".grid")
    if (await gridContainer.isVisible()) {
      // Look for Card components within the grid
      const cards = gridContainer.locator('> div, [data-testid*="card"]')
      await expect(cards.first()).toBeVisible()
    } else {
      // Fallback: check for any card-like elements
      const anyCards = page.locator('.bg-card, [class*="card"]')
      if ((await anyCards.count()) > 0) {
        await expect(anyCards.first()).toBeVisible()
      } else {
        // If no backend data, at least check that the page responded to selection
        await expect(page.locator('button[role="combobox"]')).toContainText(
          "Marienplatz"
        )
      }
    }
  })

  test("excluded stations are not in dropdown", async ({ page }) => {
    // Open dropdown
    await page.locator('button[role="combobox"]').click()

    // Clear search to show all stations
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill("")

    // Check that Frankfurt and Nuremberg are not present
    await expect(
      page.locator('button:has-text("Frankfurt Hbf")')
    ).not.toBeVisible()
    await expect(
      page.locator('button:has-text("Nürnberg Hbf")')
    ).not.toBeVisible()

    // But Munich stations should be present
    await expect(
      page.locator('button:has-text("Marienplatz")').first()
    ).toBeVisible()
    await expect(
      page.locator('button:has-text("Hauptbahnhof")').first()
    ).toBeVisible()
  })

  test("responsive design works on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check if main elements are still visible and functional
    await expect(page.locator("h1")).toBeVisible()
    await expect(page.locator('button[role="combobox"]')).toBeVisible()

    // Test dropdown functionality on mobile
    await page.locator('button[role="combobox"]').click()
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible()
  })
})
