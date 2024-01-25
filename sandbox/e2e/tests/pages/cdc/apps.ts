import type {App, AppByName, ApplicationPage, AppNames, Apps} from '../types';
import {IdentityAccessPage} from './apps.identity-access';
import {Page} from '@playwright/test';

const apps: Apps = {
  'identity-access': {
    route: 'dashboard/profiles/user-search',
    title: 'Identity Access',
    page: IdentityAccessPage,

  },

};
type ConsoleApps = typeof apps;

export class CDCApplications {
  constructor(public readonly page: Page) {

  }

  async goTo<TAppName extends AppNames<ConsoleApps>, TApp extends App = AppByName<ConsoleApps, TAppName>>(appName: TAppName): Promise<ApplicationPage<TApp>> {
    const app = apps[appName];
    await this.page.goto(app.route);
    // await expect(this.page.locator('[data-test="page-title"]')).toContainText(app.title);
    return new app.page(this.page);
  }


  async isActive(appName: AppNames<ConsoleApps>) {
    const app = apps[appName];
    return this.page.url().includes(app.route);
  }


}