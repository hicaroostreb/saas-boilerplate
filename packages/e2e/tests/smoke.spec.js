import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Basic Pages', () => {
  test('should load authentication pages without errors', async ({ page }) => {
    // Test sign-up page
    await page.goto('/auth/sign-up');
    await expect(page.locator('h3:has-text("Create your account")')).toBeVisible();
    
    // Test sign-in page
    await page.goto('/auth/sign-in');
    await expect(page.locator('h1, h2, h3, h4').first()).toBeVisible();
    
    // Test forgot password page
    await page.goto('/auth/forgot-password');
    await expect(page.locator('h1, h2, h3, h4').first()).toBeVisible();
  });

  test('should have working forms on auth pages', async ({ page }) => {
    // Sign-up form elements - USANDO OS CAMPOS REAIS
    await page.goto('/auth/sign-up');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('input[name="acceptTerms"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Sign-in form elements
    await page.goto('/auth/sign-in');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should not have critical console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/auth/sign-up');
    await page.waitForLoadState('networkidle');

    // Filter known issues
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('hydrated but some attributes') &&
      !error.includes('autoCapitalize')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
