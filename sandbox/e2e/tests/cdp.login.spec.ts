import {expect, Page, test} from '@playwright/test';
import {PaswordlessLoginPage} from './pages/passwordlessLoginPage';
import {CDPPage} from './pages/cdp/console';
  

test.use({
   headless: false,
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

  

test.describe('universe-login', () => {

  test('saml-login', async ({page}) => {
    const cdpPage = new CDPPage(page, {
      baseURL: 'https://pyzlocdp.my.universe.cdp.gigya.com/',
      afterLoginUrl: 'https://pyzlocdp.my.universe.cdp.gigya.com/#/tenant/CdpTestTenant/workspace/41862150/business-unit/4_SXRL654TOPTxB_bovpZ2JA/dashboard'
    });
    await cdpPage.init();
    await new PaswordlessLoginPage(page)
      .passwordLogin(params.credentials);
    await cdpPage.afterLogin();
    await page.context().storageState({path: params.authFile}); 
  })
 

})

