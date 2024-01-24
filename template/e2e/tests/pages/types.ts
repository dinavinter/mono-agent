import {Page} from '@playwright/test';
import {PageInterface} from './cdc-console';

export interface PageConstructor<TPage extends PageInterface> {
  new(page: Page): TPage;
}

export interface PageInterface {
}


export type App<TPage extends PageInterface =PageInterface>={
  route: string;
  title: string;
  page: PageConstructor<TPage>
};

export type Apps = Record<string, App>;

export type AppNames<TApps extends Apps> = keyof TApps;
export type AppByName<TApps extends Apps,TApp extends AppNames<TApps>> = TApps[TApp]; 
type PageConstructorByApp<TApp extends App> = TApp['page'];
export type ApplicationPage<TApp extends App> = InstanceType<PageConstructorByApp<TApp>>;
