import type {Page} from '@playwright/test';

export interface PageInterface {}
export interface PageConstructor<TPage extends PageInterface> {
  new(page: Page): TPage;
}

 


