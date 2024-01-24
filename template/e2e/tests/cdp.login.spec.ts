import {expect, Page, test} from '@playwright/test';
import {PaswordlessLoginPage} from './pages/passwordlessLoginPage';
  

test.use({
  baseURL: 'https://pyzlocdp.my.universe.cdp.gigya.com/',
  headless: false,
  // storageState: 'playwright/.auth/cdc.json' ,
  testIdAttribute:'cdc-login',

})

const params={
  baseURL: 'https://pyzlocdp.my.universe.cdp.gigya.com/',
  redirectURL: 'https://pyzlocdp.my.universe.cdp.gigya.com/#/tenant/CdpTestTenant/workspace/41862150/business-unit/4_SXRL654TOPTxB_bovpZ2JA/dashboard',
  loginUrl: new RegExp('https://login.gid.admin.pyzlo.com/pages/gid-login.*'),
  credentials: {
    email: 'b2b.e2e.test@gmail.com',
    password: 'b2b.e2e.test@gmail.com'
  } ,
  authFile: 'playwright/.auth/cdp.json'
}

  

test.describe('login-2-cdp', () => {

  test('saml-login', async ({page}) => {
    await initLogin(page);
    await new PaswordlessLoginPage(page).passwordLogin(params.credentials);
    await afterLogin(page);
    await page.waitForURL(params.redirectURL); 
 
  })

  async function afterLogin(page: Page) {
    const authResponse = await page.waitForResponse(new RegExp('.*/admin.console.getAuthToken'));
    expect(authResponse.ok()).toBeTruthy();
    await page.reload();
    await page.goto(params.baseURL);
    await page.waitForURL(params.redirectURL);
    await page.context().storageState({path: params.authFile});
  }

  async function initLogin(page: Page) {
    await page.goto(params.baseURL);
    await page.waitForURL(params.loginUrl);
    return new PaswordlessLoginPage(page);
  }

})

