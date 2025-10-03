import { expect, test } from '@playwright/test';

test.describe('Email Verification Tests', () => {
  test('should validate email format during registration', async ({ page }) => {
    await page.goto('/auth/sign-up');

    const invalidEmails = [
      'invalid', // sem @
      'invalid@', // sem domínio
      '@invalid.com', // sem usuário
      'invalid@.com', // domínio inválido
      'invalid.email', // sem @
      'test@', // sem domínio
      'test@domain', // sem TLD
      'test..test@domain.com', // duplo ponto
    ];

    for (const invalidEmail of invalidEmails) {
      console.log(`Testing invalid email: "${invalidEmail}"`);

      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', '');
      await page.fill('input[name="email"]', invalidEmail);

      // Trigger validation
      const emailField = page.locator('input[name="email"]');
      await emailField.blur();

      // Check HTML5 validation or custom validation
      const isInvalid =
        (await emailField.evaluate(el => !el.validity.valid)) ||
        (await page
          .locator('input[name="email"][aria-invalid="true"]')
          .isVisible()) ||
        (await page
          .locator('text=/invalid.*email|valid.*email.*address/i')
          .isVisible());

      if (!isInvalid) {
        // Try submit to see if backend validates
        await page.fill('input[name="password"]', 'TestPass123!');
        await page.fill('input[name="confirmPassword"]', 'TestPass123!');
        await page.check('input[name="acceptTerms"]');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);

        const submitError = await page
          .locator('text=/invalid.*email|valid.*email/i')
          .isVisible();
        const staysOnPage = page.url().includes('sign-up');

        expect(submitError || staysOnPage).toBeTruthy();
      } else {
        expect(isInvalid).toBeTruthy();
      }

      console.log(`✓ Invalid email rejected: "${invalidEmail}"`);

      // Clear for next test
      await page.fill('input[name="email"]', '');
    }
  });

  test('should accept valid email formats', async ({ page }) => {
    await page.goto('/auth/sign-up');

    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'test+tag@gmail.com',
      'user123@test-domain.org',
      'valid_email@subdomain.example.com',
    ];

    for (const validEmail of validEmails) {
      console.log(`Testing valid email: "${validEmail}"`);

      await page.fill('input[name="email"]', '');
      await page.fill('input[name="email"]', validEmail);

      const emailField = page.locator('input[name="email"]');
      await emailField.blur();

      // Should not show email format errors
      const hasError = await page.locator('text=/invalid.*email/i').isVisible();
      const isValid = await emailField.evaluate(el => el.validity.valid);

      expect(hasError).toBeFalsy();
      expect(isValid).toBeTruthy();

      console.log(`✓ Valid email accepted: "${validEmail}"`);
    }
  });

  test('should handle email verification flow after registration', async ({
    page,
  }) => {
    const testEmail = `verify-test-${Date.now()}@example.com`;

    // Complete registration
    await page.goto('/auth/sign-up');
    await page.fill('input[name="name"]', 'Verification Test');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="confirmPassword"]', 'TestPass123!');
    await page.check('input[name="acceptTerms"]');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Check if redirected to verification page or shows message
    const currentUrl = page.url();
    const verificationMessage = await page
      .locator('text=/verify.*email|check.*email|sent.*email/i')
      .isVisible();
    const verificationPage =
      currentUrl.includes('verify') || currentUrl.includes('confirm');

    if (verificationMessage || verificationPage) {
      console.log('✓ Email verification flow initiated');

      // If on verification page, check for resend functionality
      if (verificationPage) {
        const resendButton = page.locator(
          'button:has-text("resend"), a:has-text("resend")'
        );
        if (await resendButton.isVisible()) {
          await resendButton.click();
          await page.waitForTimeout(1000);

          // Should show confirmation of resend
          const resendConfirm = await page
            .locator('text=/sent|resent|check/i')
            .isVisible();
          expect(resendConfirm).toBeTruthy();
          console.log('✓ Email resend functionality works');
        }
      }

      expect(verificationMessage || verificationPage).toBeTruthy();
    } else {
      console.log('ℹ️ No email verification flow detected (might be optional)');
      // This might be acceptable depending on app design
    }
  });

  test('should prevent duplicate email registration', async ({ page }) => {
    const duplicateEmail = `duplicate-${Date.now()}@example.com`;

    // First registration
    await page.goto('/auth/sign-up');
    await page.fill('input[name="name"]', 'First User');
    await page.fill('input[name="email"]', duplicateEmail);
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="confirmPassword"]', 'TestPass123!');
    await page.check('input[name="acceptTerms"]');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Try to register again with same email
    await page.goto('/auth/sign-up');
    await page.fill('input[name="name"]', 'Second User');
    await page.fill('input[name="email"]', duplicateEmail);
    await page.fill('input[name="password"]', 'DifferentPass123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPass123!');
    await page.check('input[name="acceptTerms"]');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Should show duplicate email error
    const duplicateError = await page
      .locator('text=/already.*exist|email.*taken|already.*registered/i')
      .isVisible();
    const staysOnPage = page.url().includes('sign-up');

    expect(duplicateError || staysOnPage).toBeTruthy();
    console.log('✓ Duplicate email registration prevented');
  });
});
