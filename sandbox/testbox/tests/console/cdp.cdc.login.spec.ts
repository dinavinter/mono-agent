import {expect, test} from '@playwright/test';
import {cdc, cdp} from '@pages/index';
import {IdentityAccessPage} from '@pages/cdc/apps.identity-access';
import {expectOk, statusCode} from '@pages/gigya/api';


const authFile =
  'store/.auth/sso/';


test.use({
  baseURL: 'https://pyzlocdp.my.universe.cdp.gigya.com/',
  storageState: 'store/.auth/cdc.json',
  testIdAttribute: 'cdp-cdc-sso',
  video:'on',
  defaultBrowserType: 'chromium'
});


test('cdp-cdc-sso', async ({page, context}) => {

  const cdcPage = new cdc.ConsolePage(page, {
    baseURL: 'https://pyzlo.my.console.gigya.com/#/999/4_qIcTAyHP_B9dqBgvCutZxA/dashboard/profiles/user-search',
    afterLoginUrl: 'https://pyzlo.my.console.gigya.com/#/999/4_qIcTAyHP_B9dqBgvCutZxA/dashboard/profiles/user-search',
  });
  
  //cdc initiation first : ok
  await cdcPage.init();
  await cdcPage.afterLogin();
  const cdcIdaPage = new IdentityAccessPage(cdcPage.page);

  expect(await 
    statusCode(
      await cdcIdaPage.search()
    )).toBe(200);
  
  await context.storageState({path: `${authFile}01_cdc.json`});
 
  
  //cdp first initiation in a new page  : ok
  const cdpPage = new cdp.ConsolePage(await context.newPage(), {
    baseURL: 'https://pyzlocdp.my.universe.cdp.gigya.com/',
    afterLoginUrl: 'https://pyzlocdp.my.universe.cdp.gigya.com/#/tenant/CdpTestTenant/workspace/41862150/business-unit/4_SXRL654TOPTxB_bovpZ2JA/dashboard',
  });
  await cdpPage.init();
  await cdpPage.afterLogin();
  await context.storageState({path: `${authFile}02_cdp.json`});

  //activate cdc page and try search : permission denied

  await context.tracing.startChunk({
    name:'cdc-search:after-cdp-init',
  })

  await cdcPage.page.bringToFront();

  expect.soft(await
    statusCode(
      await cdcIdaPage.search()
    )).toBe(200);


  await cdcPage.page.context()
    .storageState({
      path: `${authFile}03_error_cdc.json`
    });
  await context.tracing.stopChunk();


  await context.tracing.startChunk({
    name:'cdc-search:after-reload',
  })

  //reload cdc page and try search : ok
  await cdcPage.page.reload();
  expect(await
    statusCode(
      await cdcIdaPage.search()
    )).toBe(200);
  
  await cdcPage.page.context()
    .storageState({
      path: `${authFile}03_ok_cdc.json`
    })
  
  //activate cdp page and try search : permission denied
 await context.tracing.startChunk({
   name:'cdp-search:after-cdc-reload'
 })
  
  await cdpPage.page.bringToFront();
  await cdpPage.goToCustomersSearch();
  // await cdpPage.page.waitForLoadState('domcontentloaded');
  await cdpPage.page.waitForSelector("error")
  // await cdcPage.page.waitForResponse(url=> {
  //   return url.indexOf('customers') && url.indexOf('api');
  // })
  expect.soft(await cdpPage.permissionDenied()).not.toBeVisible();
  await context.storageState({path: `${authFile}04_error_cdp`});
  
  await context.tracing.stopChunk();
   /*
  //cdp page reload and try search : ok
  await cdpPage.page.reload();
  await cdpPage.page.waitForLoadState('domcontentloaded');
  expect.soft(await cdpPage.permissionDenied()).not.toBeVisible();
  await context.storageState({path: `${authFile}04_ok_cdp`});

  //cdc page reload and try search : permission denied

  await cdcPage.page.bringToFront();
  expect.soft(await
    statusCode(
      await cdcIdaPage.search()
    )).toBe(200);
    */
  

});


  
  
  
  
  