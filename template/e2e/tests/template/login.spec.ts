import {test as base} from 'playwright/test';
import {PaswordlessLoginPage} from '../pages/passwordlessLoginPage';
import {Page} from '@playwright/test';

export type LoginTest = {
  baseURL: string;
  redirectURL?: string;
  loginPage: PaswordlessLoginPage;
  loggedInPage: Page;
  credentials: {
    email: string;
    password: string;
  };
};

export const loginTest = base.extend<LoginTest>({
  page: async ({page, baseURL}, use, workerInfo) => {
    await page.goto(baseURL);
    await use(page);
  },
  loginPage: async ({page}, use) => {
    const loginPage = new PaswordlessLoginPage(page);
    await use(loginPage);
  },
  loggedInPage: async ({loginPage, baseURL, redirectURL, credentials}, use) => {
    await loginPage.passwordLogin(credentials);
    await page.waitForURL(redirectURL ?? baseURL);
    await use(page);
  }

});
export const test = loginTest.extend<LoginTest & {
  profilePage: Page;
}>({
  
  
  baseURL: 'https://pyzlo.my.console.gigya.com/#/999/4_qIcTAyHP_B9dqBgvCutZxA/dashboard/profiles/user-search',
  redirectURL: 'https://pyzlo.my.console.gigya.com/#/999/4_qIcTAyHP_B9dqBgvCutZxA/dashboard/profiles/user-search',
  credentials: {
    email: 'b2b.e2e.test@gmail.com',
    password: 'b2b.e2e.test@gmail.com'
  },
  profilePage: async ({loggedInPage}, use) => {
    const search = await loggedInPage.waitForResponse(new RegExp('.*/accounts.search'));
    expect(search.ok()).toBeTruthy();
    await use(loggedInPage);
  }
});

export { expect } from '@playwright/test';



