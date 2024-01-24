import { Page} from '@playwright/test';
 
export class PaswordlessLoginPage {
 
  public readonly page: Page;

  constructor(page: Page){
    this.page = page;
 
  }
 
  async passwordLogin({email, password}: {email: string, password: string}) {
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


