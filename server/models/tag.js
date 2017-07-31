import object from '../lib/basement-object'
import _debug from 'debug'
const debug = _debug('app:server:model:tag')
import { getUserWithoutCiddles } from './user'
const Tag = object.class('Tag')
const Ciddle = object.class('Ciddle')
let CIDDLE_COUNT_CACHE

export function *create(tag) {
  const result = yield Tag.create(tag)
  debug(`create ${result.objectId}:`, result)
  return result
}

export function *remove(id) {
  debug(`remove ${id}`)
  const result = yield Tag.update(id, {
    deleted: true,
  })
  debug(`removed ${id} at ${result.deletedAt}:`)
  return {
    deletedAt: result.updatedAt,
  }
}

export function *update(tagId, tag) {
  const result = yield Tag.update(tagId, tag)
  debug(`update ${result.objectId}:`, result)
  return result
}

function *getCiddleCountFromTag(tagId, user) {
  const loginUser = yield getUserWithoutCiddles(user)
  const userObjectId = loginUser.objectId

  const result = yield Ciddle.count({
    where: {
      'tags.objectId': tagId,

      $or : [
        {isPrivate : true, 'creator.objectId' : userObjectId, isShowInHome : true},
        {isPrivate : false, isShowInHome : true}
      ]
    },
  })
  return result.count
}

export function *getAll() {
  let result = yield Tag.list()
  debug('get list', result.length)

  // remove deleted tag
  result = result.filter(tag => !tag.deleted)

  return result
}

export function *getAllWithCiddleCount(user) {
  const result = yield getAll()
  let newCache

  for (let i = 0; i < result.length; i++) {
    // fetch ciddle stat from cache, for perfermance
    if (CIDDLE_COUNT_CACHE) {
      result[i].ciddleCount = CIDDLE_COUNT_CACHE[result[i].objectId] || 0
    } else {
      result[i].ciddleCount = yield getCiddleCountFromTag(result[i].objectId, user)
      newCache = newCache || {}
      newCache[result[i].objectId] = result[i].ciddleCount || 0
    }
  }

  if (newCache) {
    CIDDLE_COUNT_CACHE = newCache
  }

  return result.sort((a, b) => b.ciddleCount - a.ciddleCount)
}

export function *count() {
  const result = yield Tag.count()
  return result.count
}

export function clearCiddleCountCache() {
  CIDDLE_COUNT_CACHE = null
}

