import {test } from '@playwright/test';
import {PasswordlessLoginPage} from '@pages/gigya';
import {expectOk} from '@pages/gigya/api';
import {ConsolePage, IdentityAccessPage} from '@pages/cdc';


  test.use({
    baseURL: 'https://pyzlo.my.console.gigya.com/#/999/4_qIcTAyHP_B9dqBgvCutZxA/dashboard/profiles/user-search',
    // storageState: 'store/.auth/cdc.json' ,
    testIdAttribute:'cdc-login',
    screenshot:'only-on-failure'
     
})

const params={
  baseURL: 'https://pyzlo.my.console.gigya.com/#/999/4_qIcTAyHP_B9dqBgvCutZxA/dashboard/profiles/user-search',
  redirectURL: 'https://pyzlo.my.console.gigya.com/#/999/4_qIcTAyHP_B9dqBgvCutZxA/dashboard/profiles/user-search',
  loginUrl: new RegExp('https://login.gid.admin.pyzlo.com/pages/gid-login.*'),
  credentials: {
    email: 'b2b.e2e.test@gmail.com',
    password: 'b2b.e2e.test@gmail.com'
  } ,
  authFile: 'store/.auth/cdc.json'
}

test.describe('console-login', () => {

  test('saml-login', async ({page}) => {
      
    const cdcPage = new ConsolePage(page, {
        baseURL: 'https://pyzlo.my.console.gigya.com/#/999/4_qIcTAyHP_B9dqBgvCutZxA/dashboard/profiles/user-search',
        afterLoginUrl: 'https://pyzlo.my.console.gigya.com/#/999/4_qIcTAyHP_B9dqBgvCutZxA/dashboard/profiles/user-search',
      }); 
    
     const loginPage = new PasswordlessLoginPage(page, params.loginUrl);
    
     await cdcPage.init(); 
     await loginPage.passwordLogin(params.credentials);
     await cdcPage.afterLogin();
     
     await expectOk(await new IdentityAccessPage(page).search());
   
     await page.context().storageState({path: params.authFile});
  }) 
  
  

})

