import qs from 'qs'

export const get = (id) => {
    return fetch(`/ciddles/${id}`)
}

export const create = (ciddle) => {
    return fetch('/ciddles', {
        method: 'POST',
        body: ciddle
    })   
}

export const update = (ciddle) => {
   return fetch(`/ciddles/${ciddle.id}`, {
    method: 'PUT',
    body: ciddle
  }) 
}

export const getAll = (type, query) => {
   const params = {
    sort: '-staredCount',
    ...query,
  }

  if (type === 'mostStared') {
    params.sort = '-staredCount'
  } else if (type === 'recently') {
    // @TODO add page support
    params.sort = '-createdAt'
    params.pageSize = 9
    params.page = params.page || 1
  } else if (type === 'latestStared') {
    params.sort = '-staredAt'
  } else if (type === 'search') {
    const isCui = query.tag && /cui(社区)组件/i.test(query.tag)
    params.pageSize = isCui ? 9 : 12
    params.page = params.page || 1
  }
  return fetch(`/ciddles?${qs.stringify(params)}`) 
}

export const getCount = () => {
    return fetch('/ciddles/count')
}

export const star = (ciddleId, stared) => {
  return fetch(`/ciddles/${ciddleId}/star`, {
    method: 'PUT',
    body: { stared },
  })
}

export const search = (query) => {
    const params = {
        pageSize : 10,
        page : 1,
        ...query
    }

    return fetch(`/search?${qs.stringify(params)}`)
}
