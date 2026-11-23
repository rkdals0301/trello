import axios from 'axios'
import router from '../router'

const DOMAIN = 'http://localhost:3000'
const UNAUTHORIZED = 401
const onUnauthorized = () => {
  const { path, fullPath } = router.currentRoute.value
  if (path !== '/login') {
    router.push({ path: '/login', query: { rPath: fullPath } })
  }
}

const request = (method, url, data) => {
  return axios({
    method, 
    url: DOMAIN + url, 
    data
  }).then(result => result.data)
    .catch(error => {
      if (error.response?.status === UNAUTHORIZED) onUnauthorized()
      throw error.response ?? error
    })
}

export const setAuthInHeader = token => {
  axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : null;
}

export const board = {
  fetch(id) {
    return id ? request('get', `/boards/${id}`) : request('get', '/boards') 
  },
  create(title) {
    return request('post', '/boards', {title})
  },
  update(id, payload) {
    return request('put', `/boards/${id}`, payload)
  },
  destroy(id) {
    return request('delete', `/boards/${id}`)
  }
}

export const list = {
  create(payload) {
    return request('post', '/lists', payload)
  },
  update(id, payload) {
    return request('put', `/lists/${id}`, payload)
  },
  destroy(id) {
    return request('delete', `/lists/${id}`)
  },
}

export const card = {
  fetch(id) {
    return request('get', `/cards/${id}`)
  },
  create(title, listId, pos) {
    return request('post', '/cards', {title, listId, pos})
  },
  update(id, payload) {
    return request('put', `/cards/${id}`, payload)
  },
  destroy(id) {
    return request('delete', `/cards/${id}`)
  }
}

export const auth = {
  login(email, password) {
    return request('post', '/login', {email, password}) 
  }
}
