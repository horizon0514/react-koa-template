import Basement from '@alipay/basement'
import config from '../../config'
import logger from '../lib/logger'
import Agent, { HttpsAgent } from 'agentkeepalive'

const keepAliveOptions = {
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000,
  keepAliveTimeout: 30000
}

// 新建一个 urllib 的实例，传入 agent 和 httpsAgent 来支持 keepalive
const urllib = require('urllib').create({
  agent: new Agent(keepAliveOptions),
  httpsAgent: new HttpsAgent(keepAliveOptions)
})

// 打印 distlog，记录所有 basement sdk 发出的请求
urllib.on('response', info => {
  logger.info([info.res.statusCode, info.res.rt, info.res.requestUrls, info.res.size].join(','))
})

const basement = new Basement({
  ...config.basement,
  urllib, // chair 应用中请传递 app.urllib
  object: {
    timeout: '10s' // object 服务的全局超时时间
  }
})

export default basement.object

