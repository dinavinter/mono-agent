import { test,describe, expect, type Page } from '@playwright/test';

describe('login page', () => { 
    test('login test', async ({page}: { page: Page }) => {
        await page.goto('https://login.gigen.zon.cx/pages/login');
        await page.fill('input[name="username"]', 'testuser');
        await page.fill('input[name="password"]', 'testpassword');
        await page.click('button[type="submit"]');
        await page.waitForNavigation();
        const url = page.url();
        expect(url).toBe('https://login.gigen.zon.cx/pages/dashboard');
    })
})