import { writable, derived } from 'svelte/store';
import { fbLoop } from './utils';

const currentPath = writable(window.location.pathname, set => {
  const handlePopstate = () => set(window.location.pathname);
  window.addEventListener('popstate', handlePopstate);
  return () => window.removeEventListener('popstate', handlePopstate);
});

const loggedIn = writable(false);
const lastCache = writable();
const getInstagramId = derived(loggedIn, (() => {
  let _instagramId;
  return async loggedInVal => {
    if(loggedInVal) {
      if(!_instagramId) {
        const instagramPages = await fbLoop('/me/accounts?fields=name,instagram_business_account');
        _instagramId = instagramPages.map(page => page['instagram_business_account']).find(o => o).id;
      }
      return _instagramId;
    } else {
      _instagramId = null;
    }
  }
})())

const addedMedia = (() => {
  const {set, update, subscribe} = writable([], set => {
    try {
      const cachedMedia = JSON.parse(window.localStorage.getItem('addedMedia'));
      if(cachedMedia instanceof Array) set(cachedMedia);
    } catch(_) {console.log('Invalid cache', _)}
  });
  const cache = media => window.localStorage.setItem('addedMedia', JSON.stringify(media));

  return {
    subscribe,
    set: val => {
      cache(val);
      return set(val);
    },
    update: cb => update(lastVal => {
      const newVal = cb(lastVal);
      cache(newVal);
      return newVal;
    })
  }
})()

export {
  currentPath,
  loggedIn,
  lastCache,
  addedMedia,
  getInstagramId
}
