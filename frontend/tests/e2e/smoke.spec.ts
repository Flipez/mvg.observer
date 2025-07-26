import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if the main title is visible
    await expect(page.locator('text=MVG Observer')).toBeVisible();
    
    // Check if the main tabs are present
    await expect(page.locator('button:has-text("Matrix")')).toBeVisible();
    
    // Check if table tab exists (either German or English)
    const tableTabDE = page.locator('button:has-text("Tabelle")');
    const tableTabEN = page.locator('button:has-text("Table")');
    if (await tableTabDE.isVisible()) {
      await expect(tableTabDE).toBeVisible();
    } else {
      await expect(tableTabEN).toBeVisible();
    }
    
    // Check if map tab exists (either German or English)
    const mapTabDE = page.locator('button:has-text("Karte")');
    const mapTabEN = page.locator('button:has-text("Map")');
    if (await mapTabDE.isVisible()) {
      await expect(mapTabDE).toBeVisible();
    } else {
      await expect(mapTabEN).toBeVisible();
    }
  });

  test('insights page loads successfully', async ({ page }) => {
    await page.goto('/insights');
    
    // Check if insights title is visible (either German or English)
    const insightsTitleDE = page.locator('h1:has-text("Einblicke")');
    const insightsTitleEN = page.locator('h1:has-text("Insights")');
    if (await insightsTitleDE.isVisible()) {
      await expect(insightsTitleDE).toBeVisible();
    } else {
      await expect(insightsTitleEN).toBeVisible();
    }
    
    // Check if station dropdown is present
    await expect(page.locator('button[role="combobox"]')).toBeVisible();
    
    // Check if date picker buttons are present (they're Button components, not inputs)
    const datePickerButtons = page.locator('button:has([data-testid="calendar-icon"]), button:has(svg)').filter({ hasText: /Pick a date|Start Date|End Date/ });
    if (await datePickerButtons.count() > 0) {
      await expect(datePickerButtons.first()).toBeVisible();
    } else {
      // Fallback: check for any buttons that might be date pickers
      const anyDateButtons = page.locator('button').filter({ hasText: /\d{4}/ }); // Look for buttons with year
      await expect(anyDateButtons.first()).toBeVisible();
    }
  });

  test('about page loads successfully', async ({ page }) => {
    await page.goto('/about');
    
    // Should not show 404 error
    await expect(page.locator('text=404')).not.toBeVisible();
    
    // Should have some content
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('language switcher is present', async ({ page }) => {
    await page.goto('/');
    
    // Check if language switcher button exists
    await expect(page.locator('button[data-testid="language-switcher"]')).toBeVisible();
  });
});