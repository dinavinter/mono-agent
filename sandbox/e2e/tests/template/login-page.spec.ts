import {loginTest} from './login.spec';
import {test} from '@playwright/test';

loginTest.use({
  baseURL: 'https://pyzlo.my.console.gigya.com/#/999/4_qIcTAyHP_B9dqBgvCutZxA/dashboard/profiles/user-search',
  redirectURL: 'https://pyzlo.my.console.gigya.com/#/999/4_qIcTAyHP_B9dqBgvCutZxA/dashboard/profiles/user-search',
  credentials: {
    email: 'b2b.e2e.test@gmail.com',
    password: 'b2b.e2e.test@gmail.com'
  }
})

test.describe('cdc-console', () => {
  loginTest('profile-page', async ({loggedInPage}) => {
    const search = await loggedInPage.waitForResponse(new RegExp('.*/accounts.search'));
    expect(search.ok()).toBeTruthy();
  })
})