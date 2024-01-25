import {expect, test, Response} from '@playwright/test';
import {CDPPage} from './pages/cdp/console';
import {CDCPage} from './pages/cdc/console';
import {IdentityAccessPage} from './pages/cdc/apps.identity-access';
import {expectOk} from './pages/gigya/api';

  

const authFile= 
  'playwright/.auth/sso/'



test.use({
  baseURL: 'https://pyzlocdp.my.universe.cdp.gigya.com/',
  storageState: 'playwright/.auth/cdc.json',
  testIdAttribute: 'cdc-login',
})

 

  test('cdp-cdc-sso', async ({page, context}) => {
  
    const cdcPage = new CDCPage(page, {
      baseURL: 'https://pyzlo.my.console.gigya.com/#/999/4_qIcTAyHP_B9dqBgvCutZxA/dashboard/profiles/user-search',
      afterLoginUrl: 'https://pyzlo.my.console.gigya.com/#/999/4_qIcTAyHP_B9dqBgvCutZxA/dashboard/profiles/user-search'
    });
    await cdcPage.init();
    await cdcPage.afterLogin();
    await expectOk(await new IdentityAccessPage(page).search());
    await page.context().storageState({path: `${authFile}01_cdc.json`});

    const cdpPage = new CDPPage(await context.newPage(), {
      baseURL: 'https://pyzlocdp.my.universe.cdp.gigya.com/',
      afterLoginUrl: 'https://pyzlocdp.my.universe.cdp.gigya.com/#/tenant/CdpTestTenant/workspace/41862150/business-unit/4_SXRL654TOPTxB_bovpZ2JA/dashboard'
    });
     await cdpPage.init();
     await cdpPage.afterLogin();
     await cdpPage.page.context().storageState({path: `${authFile}02_cdp.json`});

    await cdcPage.page.bringToFront();

    await expectOk(await new IdentityAccessPage(page).search());
    await cdcPage.page.context().storageState({path: `${authFile}03_cdc.json`});
    await cdcPage.page.reload();
    
    
    const storage=`${authFile}04_cdp`;
    await cdpPage.page.bringToFront();
    await cdpPage.goToCustomersSearch() 
    expect.soft(await cdpPage.permissionDenied()).toBeTruthy();
    // await cdpPage.page.screenshot({path: `${storage}.png`});
    await cdpPage.page.context().storageState({path: `${storage}.json`});
 
    await cdpPage.page.reload()

 


  })


  
  
  
  
  