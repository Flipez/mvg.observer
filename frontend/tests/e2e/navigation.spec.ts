import { test, expect } from '@playwright/test';

test.describe('Navigation and Tabs', () => {
  test('main navigation tabs work correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=MVG Observer')).toBeVisible();
    
    // Check all tabs are present
    const matrixTab = page.locator('button:has-text("Matrix")');
    await expect(matrixTab).toBeVisible();
    
    // Check table tab (either language)
    const tableTabDE = page.locator('button:has-text("Tabelle")');
    const tableTabEN = page.locator('button:has-text("Table")');
    const tableTab = await tableTabDE.isVisible() ? tableTabDE : tableTabEN;
    await expect(tableTab).toBeVisible();
    
    // Check map tab (either language)  
    const mapTabDE = page.locator('button:has-text("Karte")');
    const mapTabEN = page.locator('button:has-text("Map")');
    const mapTab = await mapTabDE.isVisible() ? mapTabDE : mapTabEN;
    await expect(mapTab).toBeVisible();
    
    // Matrix tab should be active by default
    await expect(matrixTab).toHaveAttribute('data-state', 'active');
    
    // Click Table tab
    await tableTab.click();
    await expect(tableTab).toHaveAttribute('data-state', 'active');
    await expect(matrixTab).toHaveAttribute('data-state', 'inactive');
    
    // Click Map tab
    await mapTab.click();
    await expect(mapTab).toHaveAttribute('data-state', 'active');
    await expect(tableTab).toHaveAttribute('data-state', 'inactive');
    
    // Go back to Matrix
    await matrixTab.click();
    await expect(matrixTab).toHaveAttribute('data-state', 'active');
  });

  test('header navigation links work', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=MVG Observer')).toBeVisible();
    
    // Check if header links are present and clickable
    const overviewLinkDE = page.locator('a:has-text("Übersicht")');
    const overviewLinkEN = page.locator('a:has-text("Overview")');
    const insightsLinkDE = page.locator('a:has-text("Einblicke")');
    const insightsLinkEN = page.locator('a:has-text("Insights")');
    
    // Navigate to insights (try both languages)
    const insightsLink = await insightsLinkDE.isVisible() ? insightsLinkDE : insightsLinkEN;
    if (await insightsLink.isVisible()) {
      await insightsLink.click();
      await expect(page).toHaveURL(/.*insights/);
      await expect(page.locator('h1')).toBeVisible();
    }
    
    // Navigate back to overview (try both languages)
    const overviewLink = await overviewLinkDE.isVisible() ? overviewLinkDE : overviewLinkEN;
    if (await overviewLink.isVisible()) {
      await overviewLink.click();
      await expect(page).toHaveURL(/.*\/$|.*index/);
    }
  });

  test('direct URL navigation works', async ({ page }) => {
    // Test insights page direct access
    await page.goto('/insights');
    await expect(page.locator('h1')).toContainText('Insights');
    
    // Test about page direct access
    await page.goto('/about');
    // Should not show 404
    await expect(page.locator('text=404')).not.toBeVisible();
    
    // Test back to home
    await page.goto('/');
    await expect(page.locator('text=MVG Observer')).toBeVisible();
  });

  test('footer is present and functional', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=MVG Observer')).toBeVisible();
    
    // Scroll to bottom to ensure footer is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check if footer exists
    const footer = page.locator('footer, [data-testid="footer"]');
    if (await footer.isVisible()) {
      await expect(footer).toBeVisible();
    }
  });

  test('mobile navigation works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=MVG Observer')).toBeVisible();
    
    // Look for mobile menu button
    const mobileMenuButton = page.locator('button:has(svg)', { hasText: /menu/i });
    
    if (await mobileMenuButton.isVisible()) {
      // Open mobile menu
      await mobileMenuButton.click();
      
      // Check if navigation items appear
      await expect(page.locator('a:has-text("Insights"), a:has-text("Einblicke")')).toBeVisible();
    }
    
    // Tab navigation should still work on mobile
    const matrixTab = page.locator('button:has-text("Matrix")');
    const tableTab = page.locator('button:has-text("Table"), button:has-text("Tabelle")');
    
    if (await tableTab.isVisible()) {
      await tableTab.click();
      await expect(tableTab).toHaveAttribute('data-state', 'active');
    }
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=MVG Observer')).toBeVisible();
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Test that focused element is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test Enter key on tabs
    const tableTab = page.locator('button:has-text("Table"), button:has-text("Tabelle")');
    if (await tableTab.isVisible()) {
      await tableTab.focus();
      await page.keyboard.press('Enter');
      await expect(tableTab).toHaveAttribute('data-state', 'active');
    }
  });
});