import Router from 'koa-router'
import koaBody from 'koa-body'
import * as User from '../models/user'
import * as Ciddle from '../models/ciddle'
import * as Tag from '../models/tag'
import * as Star from '../models/star'

import eslintFix from '../lib/eslint-fix'
import { transform } from 'weex-transformer'
// import weexLoader from 'weex-loader'
import webpack from 'webpack'
import fs from 'fs-extra'

import config from '../../config'


const api = new Router({
  prefix: '/api'
})

api.use(koaBody())


// ------------------------------------
// User Login 
// ------------------------------------

api.get('/user', function *() {
  const { user } = this.session

  if (user) {
    yield User.create(user)
  }
  this.body = user
})

api.get('/users/:userid', function *() {
  const userid = this.params.userid === '$'
    ? this.session.user.userid
    : this.params.userid
  const user = yield User.getUser({
    userid,
    loginUserid : this.session.user.userid
  }, {
    //withStars: this.params.userid === '$'
      withStars : true
  })
  this.body = user
})


// ------------------------------------
// Tags
// ------------------------------------
api.get('/tags', function *() {
  let result
  if (this.query.withCiddleCount) {
    result = yield Tag.getAllWithCiddleCount(this.session.user)
  } else {
    result = yield Tag.getAll()
  }
  const count = yield Tag.count()
  this.body = {
    count,
    list: result,
  }
})

api.post('/tags', function *() {
  const newTag = yield Tag.create(JSON.parse(this.request.body))
  this.body = newTag
})

api.delete('/tags/:tagId', function *() {
  const result = yield Tag.remove(this.params.tagId)
  this.body = {
    id: this.params.tagId,
    ...result,
  }
})

api.put('/tags/:tagId', function *() {
  const result = yield Tag.update(this.params.tagId, JSON.parse(this.request.body))
  this.body = {
    id: this.params.tagId,
    ...result,
  }
})


// ------------------------------------
// Ciddle 
// ------------------------------------
api.get('/ciddles', function *() {
  const result = yield Ciddle.getAll(this.query, this.session.user)
  this.body = result
})

api.get('/ciddles/count', function *() {
  const count = yield Ciddle.count()
  this.body = { count }
})

api.post('/ciddles', function *() {
  const newCiddle = yield Ciddle.create(JSON.parse(this.request.body), this.session.user)
  this.body = newCiddle
})

api.get('/ciddles/:ciddleId', function *() {
  const ciddle = yield Ciddle.get(this.params.ciddleId, this.session.user)
  if (ciddle) {
    this.body = ciddle
  } else {
    this.status = 404
  }
})

api.put('/ciddles/:ciddleId', function *() {
  const result = yield Ciddle.update(this.params.ciddleId, JSON.parse(this.request.body), this.session.user)
  this.body = {
    id: this.params.ciddleId,
    objectId: result.objectId,
  }
})

api.put('/ciddles/:ciddleId/star', function *() {
  const stared = JSON.parse(this.request.body).stared
  const { ciddleId } = this.params
  const userId = this.session.user.userid
  const result = stared
    ? yield Star.star(userId, ciddleId)
    : yield Star.unstar(userId, ciddleId)
  this.body = result
})


api.post('/beautify', function *(){
    const { code, mode } = JSON.parse(this.request.body)
    this.body = {
        mode,
        code: eslintFix(code)
    }
})

api.get('/search', function *(){
    const result = yield Ciddle.getSearchInfos(this.query, this.session.user)
    this.body = result
})


// ------------------------------------
// CUI版本更新API
// ------------------------------------

const fileName = config.env === 'production' ? './dist' : './src/utils'

api.post('/cuiversion', function *(){
    const version = JSON.parse(this.request.body)
    const result = yield Ciddle.updateCuiVersion(version, this.session.user)

    if(result.success){
        fs.outputJson(`${fileName}/cui-version.json`, version, function(err){
            console.log(err)
        })
    }

    this.body = {
        result,
        version
    }
})

api.get('/cuiversion', function *(){
    const version = fs.readJsonSync(`${fileName}/cui-version.json`)

    this.body = version
})


// ------------------------------------
// Jsonp对外开放的数据
// ------------------------------------
api.get('/ciddleinfo', function *(){
    const list = yield Ciddle.getCiddles4Cui(this.query)
    const callback = this.query.callback || 'callback'
    
    this.type = 'text/javascript'
    this.body = `;${callback}(${JSON.stringify({ items : list })})`
})

api.get('/ciddleinfonew', function *(){
    const list = yield Ciddle.getCiddles(this.query)
    const callback = this.query.callback || 'callback'
    
    this.type = 'text/javascript'
    this.body = `;${callback}(${JSON.stringify({ items : list })})`
})


// ------------------------------------
// Weex
// ------------------------------------

const dir = config.env === 'production' ? './dist' : './weex'

const webpackConfig = {
    entry: './weex/demo.we?entry=true',
    output: {
        path: dir,
        filename: 'demo.js'
    },
    module: {
        loaders: [{
            test: /\.we(\?[^?]+)?$/,
            loader: 'weex'
        }]
    }
}

const webpackFn = () => {
    return new Promise((resolve, reject) => {
        webpack(webpackConfig, err => {
            if(err){
                reject()
            }else{
                resolve()
            }
        })
    })
}

api.post('/weex', function *(){
    const sourceCode = this.request.body;

    fs.outputFileSync('./weex/demo.we', sourceCode) 

    yield webpackFn()

    //this.body = transform('weex', sourceCode);
    const file = fs.readFileSync(`${dir}/demo.js`, 'utf8')
    this.body = { result : file }
})

export default api
