import {expect, type Page} from '@playwright/test';
import consoleApps from './apps';
import {Applications} from '@pages/apps.ts';

export class ConsolePage {
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
  
  async apps() {
      return new Applications(this.page, consoleApps) 
  }
    
}





// const appByRoute:Record<string, App>=  apps.reduce((acc, app) => {
//   acc[app.route] = app;
//   return acc;
// }, {} as Record<string, App>);
// type AppRoutes = keyof typeof appByRoute;
// type AppByRoute<TRoute extends AppRoutes> = typeof appByRoute[TRoute];

// type AppPage<TApp extends AppNames =AppNames> = Apps[TApp]['page'];

   
