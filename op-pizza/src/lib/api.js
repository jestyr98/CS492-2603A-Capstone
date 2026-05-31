export async function fetchCsrfToken() {
  const csrfResponse = await fetch('/api/csrf-token', {
    credentials: 'include',
  })

  if (!csrfResponse.ok) {
    throw new Error('Unable to initialize secure sign in. Please refresh and try again.')
  }

  const csrfData = await csrfResponse.json()
  return csrfData.csrfToken
}

export async function fetchWithCsrf(url, options = {}) {
  const csrfToken = await fetchCsrfToken()
  const headers = new Headers(options.headers || {})
  headers.set('x-csrf-token', csrfToken)

  return fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  })
}
