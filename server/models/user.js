import object from '../lib/basement-object'
import _debug from 'debug'
import pick from 'object.pick'
import { getUserStaredCiddles } from './star'
import { getUserCreatedCiddles } from './ciddle'
const debug = _debug('app:server:model:user')
const User = object.class('User')

export function *getUser(user, options = {}) {
  const target = yield User.findOne({
    where: {
      userid: user.userid
    }
  })

  const isSame = user.userid === user.loginUserid

  // Get created ciddles
  if (target) {
    target.createdCiddles = yield getUserCreatedCiddles(target, isSame)
  }

  // Get stared ciddles
  if (target && options.withStars) {
    target.staredCiddles = yield getUserStaredCiddles(target)
  }

  return target
}

export function *getUserWithoutCiddles(user){
   const target = yield User.findOne({
    where: {
      userid: user.userid
    }
  }) 

   return target
}


export function *create(user) {
  const target = yield getUser(user)
  let result
  if (!target) {
    result = yield User.create(pick(
      user,
      ['cname', 'userid', 'workid', 'email', 'html_url', 'avatar_url', 'lastName', 'login', 'im_url']
    ))
    debug(`saved ${user.userid}`, result)
  }
  return result
}

export function *getLoginUser(user) {
  const target = yield getUser(user)
  return target
}

export function *getUserPointer(user) {
  const target = yield getUser(user)
  if (target && target.objectId) {
    return User.pointer(target.objectId)
  }
  return null
}
