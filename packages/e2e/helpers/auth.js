import { expect } from '@playwright/test';

export class AuthHelper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Sign up a new user
   */
  async signUp(email, password, options = {}) {
    await this.page.goto('/auth/sign-up');

    // Fill basic fields
    await this.page.fill('input[name="email"], input[type="email"]', email);
    await this.page.fill(
      'input[name="password"], input[type="password"]',
      password
    );

    // Handle confirm password if it exists
    const confirmPasswordField = this.page.locator(
      'input[name="confirmPassword"], input[name="confirm-password"]'
    );
    if (await confirmPasswordField.isVisible()) {
      await confirmPasswordField.fill(password);
    }

    // Handle terms checkbox if required
    if (options.acceptTerms !== false) {
      const termsCheckbox = this.page.locator('input[type="checkbox"]').first();
      if (await termsCheckbox.isVisible()) {
        await termsCheckbox.check();
      }
    }

    // Submit
    await this.page.click('button[type="submit"]');

    if (options.waitForRedirect !== false) {
      await this.page.waitForURL(/onboarding|organization|dashboard/, {
        timeout: 10000,
      });
    }
  }

  /**
   * Sign in existing user
   */
  async signIn(email, password, options = {}) {
    await this.page.goto('/auth/sign-in');

    await this.page.fill('input[name="email"], input[type="email"]', email);
    await this.page.fill(
      'input[name="password"], input[type="password"]',
      password
    );

    // Handle remember me if specified
    if (options.rememberMe) {
      const rememberCheckbox = this.page.locator('input[type="checkbox"]');
      if (await rememberCheckbox.isVisible()) {
        await rememberCheckbox.check();
      }
    }

    await this.page.click('button[type="submit"]');

    if (options.waitForRedirect !== false) {
      await this.page.waitForURL(/dashboard|org|organizations/, {
        timeout: 10000,
      });
    }
  }

  /**
   * Create organization
   */
  async createOrganization(name, options = {}) {
    // Assuming we're on onboarding page
    await this.page.fill(
      'input[name="name"], input[placeholder*="organization"], input[placeholder*="company"]',
      name
    );

    // Handle optional fields
    if (options.description) {
      const descField = this.page.locator(
        'input[name="description"], textarea[name="description"]'
      );
      if (await descField.isVisible()) {
        await descField.fill(options.description);
      }
    }

    await this.page.click('button[type="submit"], button:has-text("create")');

    if (options.waitForRedirect !== false) {
      await this.page.waitForURL(/dashboard|org/, { timeout: 10000 });
    }
  }

  /**
   * Logout user
   */
  async logout() {
    const logoutSelectors = [
      'button:has-text("logout")',
      'button:has-text("sign out")',
      '[data-testid="logout"]',
      'a[href*="signout"]',
      'a[href*="logout"]',
    ];

    for (const selector of logoutSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible()) {
        await element.click();
        await this.page.waitForURL(/auth|login|home/, { timeout: 5000 });
        return;
      }
    }

    throw new Error('Logout button not found');
  }

  /**
   * Reset password
   */
  async resetPassword(email) {
    await this.page.goto('/auth/forgot-password');
    await this.page.fill('input[name="email"], input[type="email"]', email);
    await this.page.click('button[type="submit"]');

    // Wait for success message
    await expect(
      this.page.locator('text=/sent|email|check|success/i')
    ).toBeVisible({ timeout: 10000 });
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    try {
      // Try to access dashboard
      await this.page.goto('/dashboard', { waitUntil: 'networkidle' });

      // If we're still on dashboard URL, user is authenticated
      return (
        this.page.url().includes('/dashboard') ||
        this.page.url().includes('/org')
      );
    } catch {
      return false;
    }
  }

  /**
   * Generate test user data
   */
  generateTestUser(prefix = 'test') {
    const timestamp = Date.now();
    return {
      email: `${prefix}-${timestamp}@example.com`,
      password: 'TestPassword123!',
      organizationName: `${prefix} Company ${timestamp}`,
    };
  }
}
