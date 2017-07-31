import object from '../lib/basement-object'
import _debug from 'debug'
import { get as getCiddle, update as updateCiddle } from './ciddle'
const debug = _debug('app:server:model:star')
const Star = object.class('Star')

function *syncStarToCiddleObject(ciddleId, stared) {
  let staredList = yield Star.list({
    where: {
      ciddleId,
    },
    sort: '-createdAt',
  })
  staredList = staredList || []
  const staredObject = {}
  if (stared) {
    staredObject.staredAt = new Date()
  } else {
    staredObject.staredAt = staredList[0] ? staredList[0].createdAt : ''
  }
  staredObject.staredCount = staredList.length
  if (staredObject.staredCount <= 0) {
    staredObject.staredCount = 0
  }
  const result = yield updateCiddle(ciddleId, staredObject)
  return result
}

export function *star(userId, ciddleId) {
  const target = yield Star.findOne({
    where: {
      userId,
      ciddleId,
    },
  })
  // 不重复加星
  if (target) {
    return null
  }
  const result = yield Star.create({
    userId,
    ciddleId,
  })
  yield syncStarToCiddleObject(ciddleId, true)
  debug(`${userId} stared ${ciddleId}:`, result)
  return result
}

export function *unstar(userId, ciddleId) {
  const target = yield Star.findOne({
    where: {
      userId,
      ciddleId,
    },
  })
  const result = yield Star.remove(target.objectId)
  yield syncStarToCiddleObject(ciddleId, false)
  debug(`${userId} unstared ${ciddleId}:`, result)
  return result
}

export function *getCiddleStared(userId, ciddleId) {
  const result = yield Star.findOne({
    where: {
      userId,
      ciddleId,
    },
  })
  return !!result
}

export function *getUserStaredCiddles(user) {
  const result = yield Star.list({
    where: {
      userId: user.userid,
    },
  })

  // Get ciddles
  let ciddles = []
  for (let i = 0; i < result.length; i++) {
    const ciddle = yield getCiddle(result[i].ciddleId)
    if (ciddle) {
      ciddles.push(ciddle)
    }
  }

  ciddles = ciddles
    .filter(item => item.staredAt && item.staredCount > 0)
    .sort((a, b) => new Date(b.staredAt).getTime() - new Date(a.staredAt).getTime())

  return ciddles
}

