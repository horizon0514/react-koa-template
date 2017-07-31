export function getLogin() {
  return fetch('/user')
}

export function get(id) {
  return fetch(`/users/${id}`)
}

