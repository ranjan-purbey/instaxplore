import { wordpressUrl, corsProxyUrl } from './constants'
import sanitizeHtml from 'sanitize-html';

/**
 * Return a promisified variant of a callback based asynchronous function
 * @param {Function} f
 */
const promisify = f => (...args) => new Promise(res => f.apply(null, [...args, res]));

const pluralize = (count, word, plural, includeCount = true) =>
  `${includeCount ? count : ''} ${count === 1 ? word : plural}`

const notify = (message, type) => {
  window.dispatchEvent(new CustomEvent('notification', {detail: {message, type}}));
}

const randomString = (size = 5) => new Array(size).fill(null).map(() => Math.random().toString(36).slice(-1))
  .map(c => Math.random() > .5 ? c.toUpperCase() : c).join('')

const cookies = () => document.cookie.split("; ").reduce((res, item) => {
  if(item) {
    const [_, key, value] = /(.+?)=(.+)/.exec(item);
    res[key] = value;
  }
  return res;
}, {});

const paginate = (array, pageNum = 1, pageSize = 20) => {
  const res = [...array];
  res.pageCount = Math.ceil(array.length / pageSize);
  res.currentPage = res.slice((pageNum - 1) * pageSize, pageNum * pageSize);
  res.currentPage.pageNum = Math.min(pageNum, res.pageCount);
  return res;
}

const fbLoop = async (endpoint, limit = 70) => {
  let data = [];
  try {
    const api = promisify(window.FB.api);
    while(data.length < limit && endpoint) {
      const response = await api(endpoint);
      if(response.error) throw new Error(response.error['error_user_msg'] || response.error['message']);

      data = data.concat(response.data);
      endpoint = (response.paging || {}).next;
    }
  } catch(error) {
    notify(error.message, 'error');
  }
  return data;
}

const getInstagramMediaPosts = async (profile, since, until, businessId) => {
    let posts = [];
    since = new Date(since).getTime();
    until = new Date(until).getTime();
    try {
      const api = promisify(window.FB.api);
      let after;
      while(true) {
        const endpoint = `/${businessId}?fields=business_discovery.username(${profile})`
          + `{media${after ? `.after(${after})` : ''}{media_url,like_count,comments_count,timestamp,caption,media_type,permalink,username}}`
        const response = await api(endpoint);
        if(response.error) throw new Error(response.error['error_user_msg'] || response.error['message']);

        const {data, paging} = response['business_discovery']['media'];
        posts = posts.concat(data.filter(post => {
          const timestamp = new Date(post.timestamp).getTime();
          return timestamp >= since && timestamp <= until;
        }));
        after = paging && paging.cursors.after;

        if(!after || new Date(data[data.length - 1].timestamp).getTime() < since) break;
      }
      if(posts.length === 0) notify("No posts found for given profile and dates");
    } catch(error) {
      notify(error.message, 'error');
    }
    return posts;
  }

const getInstagramPostFromUrl = async (postUrl, hidecaption) => {
  try {
    postUrl = new URL(postUrl).href;
    const response = await fetch('https://api.instagram.com/oembed/?url='
      + `${postUrl}${hidecaption ? `&hidecaption=${hidecaption}` : ''}`).then(res=> {
        if(res.ok) return res.json();
        else if(res.status === 404 || res.status === 400) {
          return fetch(`https://cors-anywhere-0906.herokuapp.com/${postUrl}`, {method: 'head'}).then(headRes => {
            if(headRes.ok) {
              const mediaType = headRes.headers.get('content-type').toLowerCase();
              const post = {
                "media_url": postUrl,
                "non_instagram": true,
                "id": randomString()
              }
              if(mediaType.includes("image")) {
                return Object.assign({}, post, {'media_type': 'IMAGE'});
              } else if(mediaType.includes("video")) {
                return Object.assign({}, post, {'media_type': 'VIDEO'});
              } else throw new Error(`${postUrl} doesn't look like an IG post link or a media URL`);
            }
            else throw new Error(`${postUrl} couldn't be accessed: ${headRes.statusText}`);
          })
        }
        else throw new Error(`Error ocurred: ${res.statusText}`)
      });
    return response['non_instagram'] ? response : {
      "permalink": postUrl,
      "username": response['author_name'],
      "media_url": `${postUrl}media?size=l`,
      "caption": response['title'],
      "html": response['html'],
      "id": `${response['media_id']}_${randomString()}`
    }
  } catch(error) {
    notify(error.message, 'error');
  }
}

const saveWordpressPost = async ({content, title}) => {
  const request = (endpoint, data) => fetch(`${wordpressUrl}/wp-json/wp/v2/posts${endpoint}`, {
    method: data ? 'post': 'get',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cookies().wpToken}`
    },
    ...(data ? {body: JSON.stringify(data)} : {})
  }).then(res => res.json());

  try {
    let saveRequest;
    if(~~title == title) {
      const {message: readError, content: oldContent} = await request(`/${title}?context=edit`)
      if(readError) throw new Error(readError);
      content = oldContent.raw + content;
      saveRequest = request(`/${title}`, {content});
    } else {
      saveRequest = request('/', {title, content});
    }
    const {message: saveError, id} = await saveRequest;
    if(saveError) throw new Error(saveError);
    notify('Successfully saved on Wordpress', 'success');
    return id;
  } catch(error) {
    notify(error.message, 'error');
  }
}

const generateWordpressPostContent = (mediaItems, embed) =>
  Promise.all(mediaItems.map(async mediaItem => {
    if(mediaItem['non_instagram'] && embed) return null;
    let body;
    if(embed) {
      body = !mediaItem['hidecaption'] && mediaItem['html']
        ? mediaItem['html'] : (await getInstagramPostFromUrl(mediaItem['permalink'], mediaItem['hidecaption']))['html'];
    } else {
      const figure = mediaItem['media_type'] === 'VIDEO'
        ? `<video src=${mediaItem['media_url']} preload="metadata" style="max-height: 80vh; max-width: 100%;" controls>Instagram Video</video>`
        : `<img src=${mediaItem['media_url']} alt="Instagram Image" style="max-height: 80vh;" />`;

      body = `<figure style="margin-bottom: 1em;">${figure}`;
      if(!mediaItem['non_instagram']) body += '<figcaption>'
        + (mediaItem['username'] ? `<a href="https://www.instagram.com/${mediaItem['username']}">@${mediaItem['username']}</a> ` : '')
        + (mediaItem['hidecaption'] || mediaItem['non_instagram'] ? '' : ` <em>${mediaItem['caption']}</em> `)
        + `<a href="${mediaItem['permalink']}" target="_blank">(Source)</a></figcaption>`;
      body += '</figure>';
    }
    return (mediaItem.header ? `<h2>${mediaItem.header}</h2>` : '')
      + body
      + (mediaItem.description ? `<p>${mediaItem.description}</p>` : '');
  })).then(htmlFragments => htmlFragments.join(""));

const uploadImageToWordpress = async image => {
  const imageBlob = await fetch(`${corsProxyUrl}/${image.src}`).then(res =>
    res.ok ? res.blob() : Promise.reject(new Error(`Image inaccessible::${res.statusText}`)));
  const filename = new URL(image.src).pathname.split('/').pop().split('.').slice(0,-1).join('');
  const extension = (() => {
    switch(imageBlob.type) {
      case 'image/png': return 'png';
      case 'image/jpeg': return 'jpg';
      case 'image/gif': return 'gif';
    }
  })();

  if(extension) {
    const data = new FormData();
    data.append('file', imageBlob, `${filename}.${extension}`);
    data.append('alt_text', sanitizeHtml(image.alt));
    data.append('caption', sanitizeHtml(image.alt));
    data.append('description', sanitizeHtml(image.description));
    await fetch(`${wordpressUrl}/wp-json/wp/v2/media`, {
      method: 'post',
      headers: {
        authorization: `Bearer ${cookies().wpToken}`
      },
      body: data
    }).then(async res => !res.ok && Promise.reject(new Error(
      `Failed to upload image to Wordpress (${(await res.json()).message || res.statusText})`)))
  } else {
    throw new Error(`The image has invalid content-type ${imageBlob.type}`);
  }
}

export {
  promisify,
  pluralize,
  paginate,
  cookies,
  fbLoop,
  getInstagramMediaPosts,
  getInstagramPostFromUrl,
  notify,
  generateWordpressPostContent,
  saveWordpressPost,
  uploadImageToWordpress,
  randomString
}
