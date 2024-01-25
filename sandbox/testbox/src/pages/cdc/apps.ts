 import {IdentityAccessPage} from './apps.identity-access';
import type {Apps} from '@pages/apps.ts';

export const apps: Apps = {
  'identity-access': {
    route: 'dashboard/profiles/user-search',
    title: 'Identity Access',
    page: IdentityAccessPage,

  },

};
export type ConsoleApps = typeof apps;
 
export default apps;

