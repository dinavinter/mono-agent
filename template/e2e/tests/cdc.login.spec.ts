import {expect, test } from '@playwright/test';
import {PaswordlessLoginPage} from './pages/passwordlessLoginPage';



// // Request context is reused by all tests in the file.
// let apiContext;
//
// test.beforeAll(async ({ playwright }) => {
//   apiContext = await playwright.request.newContext({
//     // All requests we send go to this API endpoint.
//     baseURL: 'https://api.github.com',
//     // extraHTTPHeaders: {
//     //   // We set this header per GitHub guidelines.
//     //   'Accept': 'application/vnd.github.v3+json',
//     //   // Add authorization token to all requests.
//     //   // Assuming personal access token available in the environment.
//     //   'Authorization': `token ${process.env.API_TOKEN}`,
//     // },
//   });

  test.use({
    baseURL: 'https://pyzlo.my.console.gigya.com/#/999/4_qIcTAyHP_B9dqBgvCutZxA/dashboard/profiles/user-search',
    headless: false,
    // storageState: 'playwright/.auth/cdc.json' ,
    testIdAttribute:'cdc-login',
     
})

const params={
  baseURL: 'https://pyzlo.my.console.gigya.com/#/999/4_qIcTAyHP_B9dqBgvCutZxA/dashboard/profiles/user-search',
  redirectURL: 'https://pyzlo.my.console.gigya.com/#/999/4_qIcTAyHP_B9dqBgvCutZxA/dashboard/profiles/user-search',
  loginUrl: new RegExp('https://login.gid.admin.pyzlo.com/pages/gid-login.*'),
  credentials: {
    email: 'b2b.e2e.test@gmail.com',
    password: 'b2b.e2e.test@gmail.com'
  } ,
  authFile: 'playwright/.auth/cdc.json'
}

test.describe('login-2-cdc', () => {

  test('saml-login', async ({page}) => {
     await page.goto(params.baseURL);
     await page.waitForURL(params.loginUrl);
     await new PaswordlessLoginPage(page).passwordLogin(params.credentials);
     await page.waitForURL(params.redirectURL);
     await page.context().storageState({path: params.authFile});
     const search = await page.waitForResponse(new RegExp('.*/accounts.search'));
     expect(search.ok()).toBeTruthy();

  }) 

})

