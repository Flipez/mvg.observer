import { Page, expect } from '@playwright/test';

/**
 * Helper functions for E2E tests
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for the app to fully load
   */
  async waitForAppLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for MVG Observer title to be visible
    await expect(this.page.locator('text=MVG Observer')).toBeVisible();
  }

  /**
   * Switch language using the language switcher
   */
  async switchLanguage(language: 'English' | 'Deutsch') {
    const languageSwitcher = this.page.locator('button[data-testid="language-switcher"]');
    await languageSwitcher.click();
    await this.page.locator(`[role="menuitem"]:has-text("${language}")`).click();
    await this.page.waitForTimeout(1000); // Wait for language change
  }

  /**
   * Navigate to a specific tab on the homepage
   */
  async navigateToTab(tab: 'Matrix' | 'Table' | 'Tabelle' | 'Map' | 'Karte') {
    const tabButton = this.page.locator(`button:has-text("${tab}")`);
    await tabButton.click();
    await expect(tabButton).toHaveAttribute('data-state', 'active');
  }

  /**
   * Select a station in the insights page dropdown
   */
  async selectStation(stationName: string) {
    // Open dropdown
    await this.page.locator('button[role="combobox"]').click();
    
    // Search for station
    const searchInput = this.page.locator('input[placeholder*="Search"]');
    await searchInput.fill(stationName);
    
    // Select station
    await this.page.locator(`button:has-text("${stationName}")`).click();
    
    // Verify selection
    await expect(this.page.locator(`button[role="combobox"]:has-text("${stationName}")`)).toBeVisible();
  }

  /**
   * Check if the current language is German by looking at language switcher
   */
  async isLanguageGerman(): Promise<boolean> {
    try {
      const languageSwitcherText = this.page.locator('button[data-testid="language-switcher"] span');
      const text = await languageSwitcherText.textContent();
      return text?.includes('de') || false;
    } catch {
      return false;
    }
  }

  /**
   * Check if the current language is English by looking at language switcher
   */
  async isLanguageEnglish(): Promise<boolean> {
    try {
      const languageSwitcherText = this.page.locator('button[data-testid="language-switcher"] span');
      const text = await languageSwitcherText.textContent();
      return text?.includes('en') || false;
    } catch {
      return false;
    }
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Wait for any loading states to complete
   */
  async waitForLoading() {
    // Wait for any loading spinners or skeleton elements to disappear
    await this.page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll('[data-testid="loading"], .animate-spin, .skeleton');
      return loadingElements.length === 0;
    }, { timeout: 10000 }).catch(() => {
      // Ignore timeout, continue with test
    });
  }

  /**
   * Check if mobile menu is visible (for responsive tests)
   */
  async isMobileMenuVisible(): Promise<boolean> {
    const mobileMenuButton = this.page.locator('button:has(svg)', { hasText: /menu/i });
    return await mobileMenuButton.isVisible();
  }

  /**
   * Verify page accessibility basics
   */
  async checkBasicAccessibility() {
    // Check that main content has proper heading structure
    const h1Elements = this.page.locator('h1');
    await expect(h1Elements.first()).toBeVisible();
    
    // Check that interactive elements are keyboard accessible
    await this.page.keyboard.press('Tab');
    const focusedElement = this.page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  }
}

/**
 * Common test data
 */
export const TEST_DATA = {
  stations: {
    marienplatz: 'Marienplatz',
    hauptbahnhof: 'Hauptbahnhof Bahnhofsplatz',
    karlsplatz: 'Karlsplatz (Stachus)',
    odeonsplatz: 'Odeonsplatz'
  },
  languages: {
    english: 'English',
    german: 'Deutsch'
  },
  tabs: {
    matrix: 'Matrix',
    table: 'Table',
    tableDE: 'Tabelle',
    map: 'Map',
    mapDE: 'Karte'
  }
};

/**
 * Custom assertions
 */
export class CustomAssertions {
  constructor(private page: Page) {}

  /**
   * Assert that a station is properly selected in the insights dropdown
   */
  async assertStationSelected(stationName: string) {
    await expect(this.page.locator(`button[role="combobox"]:has-text("${stationName}")`)).toBeVisible();
  }

  /**
   * Assert that the language has changed by checking the language switcher button
   */
  async assertLanguageIs(language: 'English' | 'Deutsch') {
    const languageSwitcherText = this.page.locator('button[data-testid="language-switcher"] span');
    if (language === 'English') {
      await expect(languageSwitcherText).toContainText('en');
      await expect(this.page.locator('button:has-text("Matrix")')).toBeVisible();
    } else {
      await expect(languageSwitcherText).toContainText('de');
      await expect(this.page.locator('button:has-text("Tabelle")')).toBeVisible();
    }
  }

  /**
   * Assert that a tab is currently active
   */
  async assertTabActive(tabName: string) {
    const tab = this.page.locator(`button:has-text("${tabName}")`);
    await expect(tab).toHaveAttribute('data-state', 'active');
  }
}