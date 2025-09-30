import { expect, test } from '@playwright/test';

test.describe('Password Security Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-up');
  });

  test('should reject weak passwords', async ({ page }) => {
    const weakPasswords = [
      '123', // muito curta
      '12345678', // só números
      'password', // muito comum
      'abcdefgh', // só letras minúsculas
      'ABCDEFGH', // só letras maiúsculas
      'Password', // sem números/símbolos
    ];

    for (const weakPassword of weakPasswords) {
      console.log(`Testing weak password: "${weakPassword}"`);

      // Clear and fill form
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
      await page.fill('input[name="password"]', '');
      await page.fill('input[name="password"]', weakPassword);
      await page.fill('input[name="confirmPassword"]', weakPassword);

      // Check for real-time validation (if exists)
      const passwordField = page.locator('input[name="password"]');
      await passwordField.blur(); // Trigger validation

      // ✅ CORREÇÃO: Locators mais específicos para evitar strict mode
      const hasWeakPasswordError =
        (await page
          .locator('.text-red-600, .text-destructive')
          .filter({ hasText: /weak|strong|must contain|at least/i })
          .isVisible()) ||
        (await page
          .locator('input[name="password"][aria-invalid="true"]')
          .isVisible()) ||
        (await passwordField.evaluate(el => el.validity && !el.validity.valid));

      if (hasWeakPasswordError) {
        console.log(`✓ Correctly rejected: "${weakPassword}"`);
        continue;
      }

      // If no real-time validation, try submit
      await page.check('input[name="acceptTerms"]');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);

      // Should show error or stay on page
      const submitError = await page
        .locator('.text-red-600, .text-destructive')
        .filter({ hasText: /weak|strong|password.*require/i })
        .isVisible();
      const staysOnPage = page.url().includes('sign-up');

      console.log(
        `Password "${weakPassword}": error=${submitError}, stays=${staysOnPage}`
      );
      expect(submitError || staysOnPage).toBeTruthy();

      // Reset for next iteration
      await page.reload();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should accept strong passwords', async ({ page }) => {
    const strongPasswords = [
      'MyStr0ng!Pass', // Mixed case + numbers + symbols
      'T3st!ng@2024', // Mixed case + numbers + symbols
      'S3cur3P@ssw0rd!', // Mixed case + numbers + symbols
      'Complex1ty!@#', // Mixed case + numbers + symbols
    ];

    for (const strongPassword of strongPasswords) {
      console.log(`Testing strong password: "${strongPassword}"`);

      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
      await page.fill('input[name="password"]', strongPassword);
      await page.fill('input[name="confirmPassword"]', strongPassword);

      // Check password field validity
      const passwordField = page.locator('input[name="password"]');
      await passwordField.blur();

      // Should not show weak password errors
      const hasError = await page
        .locator('.text-red-600, .text-destructive')
        .filter({ hasText: /weak|too simple|not strong/i })
        .isVisible();
      expect(hasError).toBeFalsy();

      // Check if field is marked as valid (if validation exists)
      const isValid = await passwordField.evaluate(
        el => !el.validity || el.validity.valid
      );
      expect(isValid).toBeTruthy();

      console.log(`✓ Strong password accepted: "${strongPassword}"`);

      // Reset for next test
      await page.reload();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should validate password confirmation matching', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'StrongPass123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPass123!');

    // Trigger validation
    await page.locator('input[name="confirmPassword"]').blur();

    // ✅ CORREÇÃO: Locators mais específicos para evitar strict mode
    const hasMismatchError =
      (await page
        .locator('.text-red-600, .text-destructive')
        .filter({ hasText: /not match|mismatch|different/i })
        .isVisible()) ||
      (await page
        .locator('input[name="confirmPassword"][aria-invalid="true"]')
        .isVisible());

    if (!hasMismatchError) {
      // Try submit to trigger validation
      await page.check('input[name="acceptTerms"]');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);

      const submitError = await page
        .locator('.text-red-600, .text-destructive')
        .filter({ hasText: /not match|mismatch|different/i })
        .isVisible();
      const staysOnPage = page.url().includes('sign-up');

      expect(submitError || staysOnPage).toBeTruthy();
    } else {
      expect(hasMismatchError).toBeTruthy();
    }
  });
});
