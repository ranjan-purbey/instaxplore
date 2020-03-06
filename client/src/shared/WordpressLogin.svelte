<script>
  import { createEventDispatcher } from 'svelte';
  import Waiter from './Waiter.svelte';
  import Icon from './Icon.svelte';
  import { notify } from '../utils';
  import { wordpressUrl } from '../constants';

  const dispatch = createEventDispatcher();
  let username, password, loginRequest;

  const handleSubmit = async () => {
    try {
      loginRequest = fetch(`${wordpressUrl}/wp-json/jwt-auth/v1/token`, {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({username, password})
      }).then(res => res.json());

      const res = await loginRequest;
      if(res.token) {
        const expiration = new Date(JSON.parse(atob(res.token.split(".")[1])).exp * 1e3);
        document.cookie = `wpToken=${res.token}; expires=${expiration.toUTCString()}`;
        dispatch('login');
      } else throw new Error(res.message);
    } catch(error) {
      notify(error.message, 'error');
    }
  }
</script>

<style>
  form {
    padding: .5rem;
  }
  input {
    width: 100%;
  }
  .actions {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
  }
  .actions button {
    margin-left: .3rem;
    flex-grow: 1;
  }
</style>

{#await loginRequest}
  <Waiter>
    <Icon icon="spinner" size="2em" spin><span slot="text-right">Logging in...</span></Icon>
  </Waiter>
{/await}
<form on:submit|preventDefault={handleSubmit}>
  <label>
    Site
    <input type="url" value={wordpressUrl} disabled />
  </label>
  <label>
    Username<br/>
    <input bind:value={username} autocomplete="username" required />
  </label>
  <label>
    Password<br/>
    <input bind:value={password} type="password" autocomplete="current-password" required />
  </label>
  <div class="actions">
    <button type="submit">Login</button>
  </div>
</form>
