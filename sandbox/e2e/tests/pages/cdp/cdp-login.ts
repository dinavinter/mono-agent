import {expect, Page} from '@playwright/test';
import {PaswordlessLoginPage} from '../../passwordlessLoginPage';

export interface LoginPageInterface {
  passwordLogin(credentials: {email: string; password: string}): Promise<void>;
}

export interface LoginPageConstructor<TLoginPage extends LoginPageInterface> {
  new(page: Page): TLoginPage;
}

export class CDPLoginPage<TLoginPage extends LoginPageInterface = PaswordlessLoginPage> {
  constructor(public readonly page: Page,
              public readonly options: {
                baseURL: string;
                loginUrl: RegExp;
                afterLoginUrl: string | RegExp,
                authFile: string;
              },
              private loginPage: LoginPageConstructor<TLoginPage>) {
  }

  async initLogin() {
    const {baseURL, loginUrl} = this.options;
    await this.page.goto(baseURL);
    // await this.page.waitForURL(loginUrl);
    // return new this.loginPage(this.page);
  }

  async afterLogin() {
    const {baseURL, afterLoginUrl, authFile} = this.options;

    const authResponse = await page.waitForResponse(new RegExp('.*/admin.console.getAuthToken'));
    expect(authResponse.ok()).toBeTruthy();
    await page.reload();
    await page.goto(baseURL);
    await page.context().storageState({path: authFile});
    await page.waitForURL(afterLoginUrl);
  }


}