const { test, expect } = require('@playwright/test');

test('TC_SETUP_01 - Snipe-IT accessible from Playwright', async ({ page }) => {
    const response = await page.goto('/');

    expect(response).not.toBeNull();
    expect(response.status()).toBeLessThan(500);
    await expect(page.locator('body')).not.toBeEmpty();

    console.log('Snipe-IT URL:', page.url());
    console.log('HTTP Status:', response.status());
});