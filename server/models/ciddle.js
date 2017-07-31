import object from '../lib/basement-object'
import { getCiddleStared } from './star'
import { getUserPointer, getUserWithoutCiddles } from './user'
import { clearCiddleCountCache } from './tag'
import shortHash from 'short-hash'
import _debug from 'debug'
const debug = _debug('app:server:model:ciddle')
const Ciddle = object.class('Ciddle')
const ShortIds = object.class('ShortIds')
const Tag = object.class('Tag')
const User = object.class('User')

// 由于我们把 objectId 转化成了 hash短id
// 这里根据hashId 返回真正的objectId
function *getObjectIdFromShortId(id) {
  const result = yield ShortIds.findOne({
    where: { id },
  })
  return (result || {}).ciddleObjectId
}

function filterValidCiddle(ciddleList) {
  return ciddleList.filter(
    ciddle => ciddle.id && ciddle.revisions && ciddle.revisions.length > 0
  ).map(ciddle => ({
    ...ciddle,
    revisions: ciddle.revisions.reverse().slice(0, 1),
  }))
}

export function *get(id, user) {
  const objectId = yield getObjectIdFromShortId(id)
  if (!objectId) {
    return null
  }

  const result = yield Ciddle.get(objectId, {
    include: 'creator',
  })

  if (!result) {
    return null
  }

  //@TODO update ciddle read number
  const read = result.read
  yield Ciddle.update(objectId, {read : ('undefined' === typeof read ? 0 : read) + 1})

  // @TODO userid目前因为private开放出来，部分人可能通过直接访问url/ciddleid 访问他人private信息
  // if(!!result.isPrivate && user && result.creator.userid !== user.userid){
  //   return null
  // }

  // expand tags pointer
  result.tags = result.tags || []
  const tags = []
  for (let i = 0; i < result.tags.length; i++) {
    const item = yield Tag.get(result.tags[i].objectId)
    if (item && !item.deleted) {
      tags.push(item)
    }
  }
  result.tags = tags

  const stared = user ? yield getCiddleStared(user.userid, id) : null

  // 获取modifier详细信息
  const revisions = result.revisions.reverse().slice(0, 30)
  for (let i = 0; i < revisions.length; i++) {
    if (revisions[i].modifier) {
      const modifier = yield User.get(revisions[i].modifier.objectId)
      revisions[i].modifier = modifier
    }
  }

  debug(`get ciddle ${id}`)
  return {
    ...result,
    revisions,
    id,
    stared
  }
}

export function *create(ciddle, user = {}) {
  const creator = yield getUserPointer(user)
  const newRevision = {
    code: ciddle.code,
    createdAt: new Date(),
    creator,
  }
  const newCiddle = {
    ...ciddle,
    tags: (ciddle.tags || []).map(tag => Tag.pointer(tag)),
    creator,
    revisions: [
      newRevision,
    ],
    read : 0
  }
  const result = yield Ciddle.create(newCiddle)

  // 生成和记录短 ID
  const id = shortHash(result.objectId)
  yield Ciddle.update(result.objectId, { id })
  yield ShortIds.create({
    id,
    ciddleObjectId: result.objectId,
  })

  debug(`create ${id}:`, newCiddle)
  return {
    ...result,
    id,
  }
}

export function *update(id, ciddle, user = {}) {
  const updateCiddle = { ...ciddle }
  if ('tags' in ciddle) {
    updateCiddle.tags = (ciddle.tags || []).map(tag => Tag.pointer(tag))
    // 只有在tag更新时，才情空tag count with ciddle, 以便重新计算count
    clearCiddleCountCache()
  }
  if ('code' in ciddle) {
    const modifier = yield getUserPointer(user)
    const newRevision = {
      code: ciddle.code,
      modifiedAt: new Date(),
      modifier,
    }
    updateCiddle.revisions = {
      __op: 'add',
      value: [newRevision],
    }
  }
  const objectId = yield getObjectIdFromShortId(id)
  const result = yield Ciddle.update(objectId, updateCiddle)
  debug(`update ${id}`, ciddle)
  return {
    ...result,
    id,
  }
}


export function *getAll(params = {}, user) {
  const ciddleQuery = {
    ...params,
    sort: params.sort ? `${params.sort},-updatedAt` : '-updatedAt',
    include: 'creator',
    limit: params.limit || 9,
  }

  const loginUser = yield getUserWithoutCiddles(user)
  const userObjectId = loginUser.objectId

  ciddleQuery.where = {
    $or : [
        {isPrivate : true, 'creator.objectId' : userObjectId, isShowInHome : true},
        {isPrivate : false, isShowInHome : true}
        //{'creator.objectId' : {$ne : userObjectId}}
    ]
  }

  if ('tag' in params) {
    const searchTag = yield Tag.findOne({
      where: {
        name: params.tag,
      },
    })
    if (searchTag && searchTag.objectId) {
      ciddleQuery.where = {
        ...ciddleQuery.where,
        'tags.objectId': searchTag.objectId,
      }
    }
  }

  if (ciddleQuery.pageSize) {
    ciddleQuery.limit = ciddleQuery.pageSize
    delete ciddleQuery.pageSize
  }

  if (ciddleQuery.page) {
    ciddleQuery.skip = (ciddleQuery.page - 1) * (ciddleQuery.limit || 12)
    delete ciddleQuery.page
  }

  let result = yield Ciddle.list(ciddleQuery)
  let countResult

  for(let j = 0; j < result.length; j++){
    let ciddle = result[j]
    let tags = []

    for (let i = 0; i < ciddle.tags.length; i++) {
        const item = yield Tag.get(ciddle.tags[i].objectId)
        if (item && !item.deleted) {
          tags.push(item)
        }
    }

    ciddle.tags = tags

  }

  // paging data need total count
  if (params.pageSize && params.page) {
    countResult = yield Ciddle.count({
      ...ciddleQuery,
      skip: null,
      limit: null,
    })
  }

  debug('get list', ciddleQuery, result.length)

  if (params.sort === '-staredAt') {
    result = result.filter(ciddle => ciddle.staredAt)
  }

  return {
    list: filterValidCiddle(result),
    ...countResult,
  }
}

export function *getCiddles4Cui(params = {}){
    let query = {
        where : { ctype : 'cui', isPrivate : false, isShowInHome : true },
        include: 'creator'
    }

    if(params.pageSize){
        query.limit = +params.pageSize || 10
    }

    if(params.page){
        query.skip = (params.page - 1) * query.limit    
    }

    const searchTag = yield Tag.findOne({
      where: {
        name: 'CUI社区组件'
      }
    })

    if (searchTag && searchTag.objectId) {
      query.where = {
        ...query.where,
        'tags.objectId': searchTag.objectId,
      }
    }
    
    let result = yield Ciddle.list(query)

    return filterValidCiddle(result)
}

export function *getCiddles(params = {}){
    const toBool = (v, f) => {
        if(v === 'false') return false   
        if(v === 'true') return true
        if(!v){
            if(!f){
                return false
            }else{
                return true
            }
        }
    }

    let query = {
        where : {
            // isPrivate : toBool(params.isPrivate, false),
            // isShowInHome : toBool(params.isShowInHome, true)
        },
        include: 'creator'
    }

    if('isPrivate' in params){
        query.where = {
            ...query.where,
            isPrivate : toBool(params.isPrivate, false)
        }
    }

    if('isShowInHome' in params){
        query.where = {
            ...query.where,
            isShowInHome : toBool(params.isShowInHome, true)
        }
    }

    if(params.ctype){
        query.where = {
            ...query.where,
            ctype : params.ctype
        }
    }

    if(params.pageSize){
        query.limit = +params.pageSize || 10
    }

    if(params.page){
        query.skip = (params.page - 1) * query.limit    
    }

    if( 'tag' in params ){
        const searchTag = yield Tag.findOne({
          where: {
            name: params.tag
          }
        })

        if (searchTag && searchTag.objectId) {
          query.where = {
            ...query.where,
            'tags.objectId': searchTag.objectId,
          }
        }
    }

    let result = yield Ciddle.list(query)

    return filterValidCiddle(result)
}

export function *count(){
    const resp = yield Ciddle.count()

    return resp.count
}

export function *getUserCreatedCiddles(user, isSame) {
  const query = isSame ? {'creator.objectId': user.objectId} :
                    {isPrivate : false, 'creator.objectId' : user.objectId}

  const result = yield Ciddle.list({
    // where: {
    //   'creator.objectId': user.objectId,
    // },
    where : query,
    sort: '-createdAt',
  })

  for(let i = 0; i < result.length; i++){
    let creator = yield User.get(result[i].creator.objectId) 
    result[i].creator = creator

    let tags = []
    for(let j = 0; j < result[i].tags.length; j++){
        let item = yield Tag.get(result[i].tags[j].objectId)
        if (item && !item.deleted) {
          tags.push(item)
        }
    }

    result[i].tags = tags
  }
  debug('get list', result.length)
  return filterValidCiddle(result)
}


/**
 *@本意是可以吐出 ciddles & tags相关数据
 *@目前先只考虑 ciddles, 但结构先写好
 */
export function *getSearchInfos(params = {}, user){
    const query = {
        ...params
    }

    const loginUser = yield getUserWithoutCiddles(user)
    const userObjectId = loginUser.objectId

    query.where = {
        $or : [
            {isPrivate : true, 'creator.objectId' : userObjectId},
            {isPrivate : false}
        ]
    }

    if(query.pageSize){
        query.limit = query.pageSize
        delete query.pageSize
    }

    if(query.key){
        query.where = {
            ...query.where,
            'title' : new RegExp(query.key, 'i')
        }

        delete query.key
    }

    const ciddles = yield Ciddle.list(query)

    return {
        ciddles : filterValidCiddle(ciddles)
        //tags : []
    }
}


/**
 *@CUI 版本升级
 */
function replaceCodeVersion(code, version){
    const { html } = code
    const map = {
       'platform-base' : 'platform' 
    }

    let newHtml = html.replace(/([a-zA-Z\-]+)\/(\d\.\d.\d+)\//g, function(a, b, c){
        const ver = version[map[b] || b]
        return ver ? `${b}/${ver}/` : a
    })

    return {
        ...code,
        html : newHtml
    }
}

export function *updateCuiVersion(version, user){
    const reg = /^\d\.\d\.\d{1,2}$/

    for (let i in version){
        let v = version[i]
        if(v.trim() === '' || !reg.test(v)){
            return {success : false, message : 'format error'}
        }
    }

    let list = yield Ciddle.list({
        where : { ctype : 'cui'}
    })

    
    const modifier = yield getUserPointer(user)

    for(let i = 0; i < list.length; i++){
        let ciddle = list[i]
        let code = replaceCodeVersion(ciddle.code, version)

        const objectId = ciddle.objectId

        const newRevision = {
            code : code,
            modifiedAt: new Date(),
            modifier,
        }

        const updateCiddle = {
            code : code,
            revisions : {
                __op : 'add',
                value : [newRevision]
            }
        }


        if(ciddle.code.html !== code.html){
            yield Ciddle.update(objectId, updateCiddle)
        }
    }

    return {
        success : true
    }
}
