import { getInstagramId } from './stores';
import Axios from 'axios';
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

const getInstagramMediaPosts = (() => {
  let businessId;
  getInstagramId.subscribe(promise => promise.then(val => businessId = val));

  return async (profile, since, until) => {
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
          let timestamp = new Date(post.timestamp).getTime();
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
})()

const getInstagramPostFromUrl = async (postUrl, hidecaption) => {
  try {
    postUrl = new URL(postUrl).href;
    const response = await fetch(`https://api.instagram.com/oembed/\
      ?url=${postUrl}${hidecaption ? `&hidecaption=${hidecaption}` : ''}`).then(res=> {
        if(res.ok) return res.json();
        else if(res.status === 404 || res.status === 400) {
          return fetch(`https://cors-anywhere-0906.herokuapp.com/${postUrl}`, {method: 'head'}).then(headRes => {
            if(headRes.ok) {
              const mediaType = headRes.headers.get('content-type').toLowerCase();
              const post = {
                "media_url": postUrl,
                "non_instagram": true,
                "id": Math.random().toString(36).substring(7)
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
      "id": `${response['media_id']}_${Math.random().toString(36).substring(7)}`
    }
  } catch(error) {
    notify(error.message, 'error');
  }
}

const saveWordpressPost = async ({siteUrl, username, password, content, title}) => {
  const httpPost = (endpoint, data, token) => fetch(endpoint, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(data)
  }).then(res => res.json());

  try {
    const {message: authError, token} = await httpPost(`${siteUrl}/wp-json/jwt-auth/v1/token`, {username, password});
    if(authError) throw new Error(authError);

    let saveRequest;
    if(~~title == title) {
      const {message: readError, content: oldContent} = await fetch(`${siteUrl}/wp-json/wp/v2/posts/${title}?context=edit`, {
        headers: { 'Authorization': `Bearer ${token}`}
      }).then(res => res.json());
      if(readError) throw new Error(readError);
      content = oldContent.raw + content;
      saveRequest = httpPost(`${siteUrl}/wp-json/wp/v2/posts/${title}`, {content}, token);
    } else {
      saveRequest = httpPost(`${siteUrl}/wp-json/wp/v2/posts/`, {title, content}, token);
    }
    const {message: saveError, id} = await saveRequest;
    if(saveError) throw new Error(saveError);
    notify('Successfully saved on Wordpress', 'success');
    return id;
  } catch(error) {
    notify(error.message, 'error');
  }
}

const getHtmlFromPosts = (posts, embed) =>
  Promise.all(posts.map(async post => {
    if(post['non_instagram'] && embed) return null;
    if(embed) {
      post.body = !post['hidecaption'] && post['html']
        ? post['html'] : (await getInstagramPostFromUrl(post['permalink'], post['hidecaption']))['html'];
    } else {
      const media = post['media_type'] === 'VIDEO'
        ? `<video src=${post['media_url']} preload="metadata" style="max-height: 80vh; max-width: 100%;" controls>Instagram Video</video>`
        : `<img src=${post['media_url']} alt="Instagram Image" style="max-height: 80vh;" />`;

      post.body = `<figure style="margin-bottom: 1em;">${media}`;
      if(!post['non_instagram'])
        post.body += `<figcaption><a href="https://www.instagram.com/${post['username']}">@${post['username']}</a> `
        + (post['hidecaption'] || post['non_instagram'] ? '' : ` <em>${post['caption']}</em> `)
        + `<a href="${post['permalink']}" target="_blank">[View on Instagram]</a></figcaption>`;
      post.body += '</figure>';
    }
    return (post.header ? `<h2>${post.header}</h2>` : '')
      + post.body
      + (post.description ? `<p>${post.description}</p>` : '')
  })).then(htmlFragments => htmlFragments.join(""));

const uploadImageToGallery = image => {
  const imageSanitized = ['src', 'href', 'width', 'height', 'alt' , 'tags'].reduce((res, key) =>
    Object.assign(res, {[key]: image[key]}), {});
  return Axios.post('/api/upload', imageSanitized);
}

export {
  promisify,
  pluralize,
  paginate,
  fbLoop,
  getInstagramMediaPosts,
  getInstagramPostFromUrl,
  notify,
  getHtmlFromPosts,
  saveWordpressPost,
  uploadImageToGallery
}
