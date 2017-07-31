import 'isomorphic-fetch'
import fetchIntercept from 'fetch-intercept'

fetchIntercept.register({
  request(url, config) {
    // Modify the url or config here
    const newConfig = {
      credentials: 'same-origin',
      ...config,
    }
    const newUrl = url.indexOf('/api') < 0 ? `/api${url}` : url
    if (newConfig.body && typeof newConfig.body === 'object') {
      newConfig.body = JSON.stringify(newConfig.body)
    }
    return [newUrl, newConfig]
  },
  response(res) {
    if (res.ok && res.status >= 200 && res.status < 300) {
      return res.json()
    }
    const e = new Error(res.statusText)
    e.response = res
    return Promise.reject(e)
  },
})
