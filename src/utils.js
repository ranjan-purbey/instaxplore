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

const getInstagramMediaPosts = async (businessId, profile, since, until) => {
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

const getInstagramPostFromUrl = async (postUrl, hidecaption) => {
	try {
		const response = await fetch(`https://api.instagram.com/oembed/\
			?url=${postUrl}${hidecaption ? `&hidecaption=${hidecaption}` : ''}`).then(res=> {
				if(res.ok) return res.json();
				else if(res.status === 404 || res.status === 400)
					throw new Error(`Not a public Instagram post link:\n${postUrl}`);
				else throw new Error(`Error ocurred: ${res.statusText}`)
			});
		return {
			"permalink": postUrl,
			"username": response['author_name'],
			"media_url": response['thumbnail_url'],
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
			content = oldContent.raw + "\n" + content;
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
		if(embed) {
			post.body = !post['hidecaption'] && post['html']
				? post['html'] : (await getInstagramPostFromUrl(post['permalink'], post['hidecaption']))['html'];
		} else {
			const media = post['media_type'] === 'VIDEO'
				? `<video src=${post['media_url']} preload="metadata" height="450" width="450" controls>Instagram Video</video>`
				: `<img src=${post['media_url']} alt="Instagram Image" width="450" />`;

			post.body = `
					${media}<br/>
					<a href="https://www.instagram.com/${post['username']}">@${post['username']}</a> \
					<em>${post['hidecaption'] ? '' : post['caption']}</em> \
					<a href="${post['permalink']}" target="_blank">[View on Instagram]</a>
			`
		}
		return `
			<div style='margin-bottom: 5rem'>
				${post.header ? `<h2>${post.header}</h2>` : ''}
				<p>${post.body}</p>
				${post.description || ''}
			</div>
		`
	})).then(htmlFragments => htmlFragments.join(""));

export {
	promisify,
	pluralize,
	paginate,
	fbLoop,
	getInstagramMediaPosts,
	getInstagramPostFromUrl,
	notify,
	getHtmlFromPosts,
	saveWordpressPost
}
