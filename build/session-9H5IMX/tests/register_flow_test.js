const { test, expect } = require('@playwright/test');

test('register flow', async ({ page }) => {
    await page.goto('https://gigya.login.dynidp.com/pages/register');
    const title = await page.title();
    expect(title).toBe('Registration Page');
    // Add more code here to interact with the webpage and perform the registration flow.
});