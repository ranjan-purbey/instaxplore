import { writable, derived } from 'svelte/store';
import { fbLoop } from './utils';

const currentPath = writable(window.location.pathname);
const loggedIn = writable(false);
const lastCache = writable();
const getInstagramId = derived(loggedIn, async loggedInVal =>
  loggedInVal && fbLoop('/me/accounts?fields=name,instagram_business_account')
  .then(pages => pages.find(page => page['instagram_business_account'])['instagram_business_account'].id));

export {
  currentPath,
  loggedIn,
  lastCache,
  getInstagramId
}
