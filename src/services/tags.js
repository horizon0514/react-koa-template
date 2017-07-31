import qs from 'qs'

export function create(tag) {
  return fetch('/tags', {
    method: 'POST',
    body: tag,
  })
}

export function remove(tag) {
  return fetch(`/tags/${tag.objectId}`, {
    method: 'DELETE',
  })
}

export function update(tag) {
  return fetch(`/tags/${tag.objectId}`, {
    method: 'PUT',
    body: tag,
  })
}

export function getAll(query = {}) {
  return fetch(`/tags?${qs.stringify(query)}`)
}

