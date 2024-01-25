import {expect, test } from '@playwright/test';
import {PaswordlessLoginPage} from './pages/passwordlessLoginPage';
import {CDCPage} from './pages/cdc/console';
import {IdentityAccessPage} from './pages/cdc/apps.identity-access';
import {expectOk} from './pages/gigya/api';
 

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

test.describe('console-login', () => {

  test('saml-login', async ({page}) => {
      
    const cdcPage = new CDCPage(page, {
        baseURL: 'https://pyzlo.my.console.gigya.com/#/999/4_qIcTAyHP_B9dqBgvCutZxA/dashboard/profiles/user-search',
        afterLoginUrl: 'https://pyzlo.my.console.gigya.com/#/999/4_qIcTAyHP_B9dqBgvCutZxA/dashboard/profiles/user-search',
      }); 
    
     const loginPage = new PaswordlessLoginPage(page, params.loginUrl);
    
     await cdcPage.init(); 
     await loginPage.passwordLogin(params.credentials);
     await cdcPage.afterLogin();
     
     await expectOk(await new IdentityAccessPage(page).search());
   
     await page.context().storageState({path: params.authFile});
  }) 
  
  

})

