import { Page} from '@playwright/test';
 
export class PaswordlessLoginPage {
 
  public readonly page: Page;

  constructor(page: Page,
              public readonly baseURL?: string | RegExp) {
    this.page = page;
    
  }
  
  async waitForPage() {
    this.baseURL && await this.page.waitForURL(this.baseURL);
  }
   
  async passwordLogin({email, password}: {email: string, password: string}) {
    await this.waitForPage();
    const page = this.page;
    await page.getByPlaceholder('Email *').click();
    await page.getByPlaceholder('Email *').fill(email);
    await page.getByRole('button', {name: 'Submit'}).click();
    await page.getByRole('button', {name: 'Password', exact: true}).click();
    await page.getByPlaceholder('Password *').click();
    await page.getByPlaceholder('Password *').fill(password);
    await page.getByPlaceholder('Password *').click();
    await page.getByRole('button', {name: 'Submit'}).click();
  }


}


