<script>
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();
	const formatDate = date => date.toISOString().split('T')[0]
	const today = formatDate(new Date());
	const tomorrow = formatDate(new Date(Date.now() + 864e5));
	let profile, since = today, until = tomorrow, sinceElem, untilElem;

	const validateDates = event => {
		[sinceElem, untilElem].forEach(elem => 
			elem.setCustomValidity(new Date(since).getTime() >= new Date(until).getTime()
				? "Since date must be less than until date" : ""))
	}

	const handleProfileChange = event => {
		try {
			const profileURL = new URL(profile);
			if(profileURL.hostname === "www.instagram.com") {
				profile = profileURL.pathname.split("/")[1];
				event.target.setCustomValidity("")
			} else {
				event.target.setCustomValidity("Invalid Instagram profile link");
			}
		} catch(error){
			event.target.setCustomValidity("")
		}
	}

	const handleSubmit = event => {
		dispatch('search', {profile, since, until});
	}
</script>

<style>
	form {
		font-size: .9rem;
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
	}
	label {
		display: inline;
		margin: 0 .5rem;
	}
</style>

<form on:submit|preventDefault={handleSubmit}>
	<input type="text" placeholder="Instagram Username / Profile Link" bind:value={profile} required on:change={handleProfileChange}/>
	<label>
		Since <input type="date" max={today} bind:this={sinceElem} bind:value={since} required on:input={validateDates} />
	</label>
	<label>
		Until <input type="date" max={tomorrow} bind:this={untilElem} bind:value={until} required on:input={validateDates} />
	</label>
	<button>GET</button>
</form>