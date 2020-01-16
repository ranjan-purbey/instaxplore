/**
 * Return a promisified variant of a callback based asynchronous function
 * @param {Function} f
 */
const promisify = f => (...args) => new Promise(res => f.apply(null, [...args, res]));

const notify = (message, type) => {
	window.dispatchEvent(new CustomEvent('notification', {detail: {message, type}}));
}

const fbLoop = async (endpoint, limit = 70) => {
	let data = [];
	try {
		const api = promisify(window.FB.api);
		while(data.length < limit && endpoint) {
			const response = await api(endpoint);
			if(response.error) throw new Error(response.error['error_user_msg']);

			data = data.concat(response.data);
			endpoint = (response.paging || {}).next;
		}
	} catch(error) {
		notify(error.message, 'error');
	}
	return data;
}

const instaGetMediaPosts = async (businessId, profile, since, until) => {
	let images = [];
	since = new Date(since).getTime();
	until = new Date(until).getTime();
	try {
		const api = promisify(window.FB.api);
		let after;
		while(true) {
			const endpoint = `/${businessId}?fields=business_discovery.username(${profile})`
				+ `{media${after ? `.after(${after})` : ''}{media_url,like_count,comments_count,timestamp,caption,media_type,permalink,username}}`
			const response = await api(endpoint);
			if(response.error) throw new Error(response.error['error_user_msg']);

			const {data, paging} = response['business_discovery']['media'];
			images = images.concat(data.filter(image => {
				let timestamp = new Date(image.timestamp).getTime();
				return timestamp >= since && timestamp <= until;
			}));
			after = paging && paging.cursors.after;

			if(!after || new Date(data[data.length - 1].timestamp).getTime() < since) break;
		}
		if(images.length === 0) notify("No posts found for given profile and dates");
	} catch(error) {
		notify(error.message, 'error');
	}
	return images;
}

const postRequest = (endpoint, data, token) => fetch(endpoint, {
	method: 'post',
	headers: {
		'Content-Type': 'application/json',
		'Authorization': token ? `Bearer ${token}` : ''
	},
	body: JSON.stringify(data)
}).then(res => res.json());

const saveWordpressPost = async ({siteUrl, username, password, content, title}) => {
	try {
		const {message: authError, token} = await postRequest(`${siteUrl}/wp-json/jwt-auth/v1/token`, {username, password});
		if(authError) throw new Error(authError);

		let saveRequest;
		if(~~title == title) {
			const {message: readError, content: oldContent} = await fetch(`${siteUrl}/wp-json/wp/v2/posts/${title}?context=edit`, {
				headers: { 'Authorization': `Bearer ${token}`}
			}).then(res => res.json());
			if(readError) throw new Error(readError);
			content = oldContent.raw + "\n" + content;
			saveRequest = postRequest(`${siteUrl}/wp-json/wp/v2/posts/${title}`, {content}, token);
		} else {
			saveRequest = postRequest(`${siteUrl}/wp-json/wp/v2/posts/`, {title, content}, token);
		}
		const {message: saveError, id} = await saveRequest;
		if(saveError) throw new Error(saveError);
		notify('Successfully saved on Wordpress', 'success');
		return id;
	} catch(error) {
		notify(error.message, 'error');
	}
}

const getHtmlFromPosts = (posts, embed) => {
	return posts.map(post => {
		if(embed) {
			return `
				<div>
					${post.header ? `<h2>${post.header}</h2>` : ''}
					<p>${post.permalink}</p>
					${post.description || ''}
				</div>
			`;
		} else {
			const media = post['media_type'] === 'VIDEO'
				? `<video src=${post['media_url']} preload="metadata" width="450" controls>Instagram Video</video>`
				: `<img src=${post['media_url']} alt="Instagram Image" width="450" />`;
			return `
				<div>
					${post.header ? `<h2>${post.header}</h2>` : ''}
					${media}
					<p>
						<a href="https://www.instagram.com/${post['username']}">@${post['username']}</a> ${post['caption']}<br/>
						[<a href="${post['permalink']}" target="_blank">View Original</a>]<br/>
						${post.description || ''}
					</p>
				</div>
			`
		}
	}).join("");
}

export {
	promisify,
	fbLoop,
	instaGetMediaPosts,
	notify,
	getHtmlFromPosts,
	saveWordpressPost
}