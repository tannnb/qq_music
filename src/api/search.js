import {commonParams,options} from './config'
import axios from 'axios'

const debug = process.env.NODE_ENV !== 'production'

export function clientSearch(query, page, zhida, perpage) {
  const url = debug ? 'http://localhost:3000/clientSearch' : '/pc/clientSearch'
  const data = Object.assign({}, commonParams, {
    w: query,
    p: page,
    perpage,
    n: perpage,
    catZhida: zhida ? 1 : 0,
    zhidaqu: 1,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    remoteplace: 'txt.mqq.all',
    uin: 0,
    needNewCode: 1,
    platform: 'h5',
    format: 'json'
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res)
  })
}

export function clientSmartBox(key) {
  const url = debug ? 'http://localhost:3000/clientSmartBox' : '/pc/clientSmartBox'
  const data = Object.assign({}, commonParams,options, {
    is_xml: 0,
    key,
    loginUin: 0,
    hostUin: 0,
    platform: 'yqq',
    needNewCode: 0
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res)
  })
}

