import type {Page} from '@playwright/test';
import type {PageConstructor, PageInterface} from '@pages/types.ts';

export type App<TPage extends PageInterface = PageInterface> = {
  route: string;
  title: string;
  page: PageConstructor<TPage>
};
export type Apps = Record<string, App>;
export type AppNames<TApps extends Apps> = keyof TApps;
export type AppByName<TApps extends Apps, TApp extends AppNames<TApps>> = TApps[TApp];
export type ApplicationPage<TApp extends App> = InstanceType<TApp['page']>;
export type InferPage<TApps extends Apps, TApp extends AppNames<TApps>> = InstanceType<TApps[TApp]['page']>;

export interface Applications<TApps extends Apps = Apps> {

  readonly apps: TApps;

  goTo<TAppName extends AppNames<TApps>>(appName: TAppName): Promise<InferPage<TApps, TAppName>>;

  isActive(appName: AppNames<TApps>): Promise<boolean>;

}

export class Applications<TApps> implements Applications<TApps> {
  constructor(public readonly page: Page,
              public readonly apps: TApps) {
  }


  async goTo<TAppName extends AppNames<TApps>>(appName: TAppName): Promise<PageInterface> {
    const app = this.apps[appName];
    await this.page.goto(app.route);
    // await expect(this.page.locator('[data-test="page-title"]')).toContainText(app.title);
    return new app.page(this.page);
  }

  async isActive(appName: AppNames<TApps>) {
    const app = this.apps[appName];
    return this.page.url().includes(app.route);
  }


}