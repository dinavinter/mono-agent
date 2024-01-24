import {expect, Page} from '@playwright/test';
  
export class CDPPage {
  constructor(public readonly page: Page,
              public readonly options: {
                baseURL: string; 
                afterLoginUrl: string | RegExp 
              }){
    
  }
   

  async init() {
    const {baseURL} = this.options;
    await this.page.goto(baseURL);
 }

  async afterLogin() {
    const {baseURL, afterLoginUrl} = this.options;
     const page = this.page;
    const authResponse = await page.waitForResponse(new RegExp('.*/admin.console.getAuthToken'));
    expect(authResponse.ok()).toBeTruthy();
    await page.reload();
    await page.goto(baseURL);
    await page.waitForURL(afterLoginUrl);
  }

  async goToCustomersSearch() {
    await this.page.getByText('CustomersSearchSegmentsIndicators').hover();
    await this.page.getByText('Search').click();
    await expect(this.page.locator('[data-test="page-title"]')).toContainText('Customers');

    }
    
    async permissionDenied() {
       return this.page.getByText('Permission denied');
    }
  }