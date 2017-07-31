import Router from 'koa-router'
import koaBody from 'koa-body'

const api = new Router({
  prefix: '/api'
})

api.use(koaBody())

export default api
