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
			endpoint = response.paging.next;
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
				+ `{media${after ? `.after(${after})` : ''}{media_url,like_count,comments_count,timestamp,caption,media_type}}`
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

export {
	promisify,
	fbLoop,
	instaGetMediaPosts,
	notify
}