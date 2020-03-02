import { writable, derived } from 'svelte/store';
import { fbLoop } from './utils';

const currentPath = writable(window.location.pathname, set => {
  const handlePopstate = () => set(window.location.pathname);
  window.addEventListener('popstate', handlePopstate);
  return () => window.removeEventListener('popstate', handlePopstate);
});

const loggedIn = writable(false);
const lastCache = writable();
const getInstagramId = derived(loggedIn, async loggedInVal =>
  loggedInVal && fbLoop('/me/accounts?fields=name,instagram_business_account')
  .then(pages => pages.find(page => page['instagram_business_account'])['instagram_business_account'].id));

const currentUser = derived(loggedIn, (loggedInVal, set) => {
  loggedInVal && window.FB.api('/me', set);
})

export {
  currentPath,
  loggedIn,
  lastCache,
  getInstagramId,
  currentUser
}
