import {expect, Locator, Page} from '@playwright/test';

export class IdentityAccessPage {
  private searchButton: Locator;
  constructor(public readonly page: Page) {
    this.searchButton = page.getByRole('button', { name: 'Search', exact: true })

  }
 
  async search() {
    const page = this.page;
     await this.searchButton.focus();
     await this.searchButton.hover();
     await this.searchButton.click(); 
    return await page.waitForResponse(new RegExp('.*/accounts.search'));
    
  }
    
   public route= 'dashboard/profiles/user-search'
   
  async isActive() {
    return this.page.url().includes(this.route);
  }
  
  async goTo() {
    if(!await this.isActive()) {
       await this.page.goto(this.route);
    }
  }
}