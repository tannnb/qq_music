import {commonParams, options} from './config'
import axios from "axios/index";


export function getSingerList(options) {
  const url = 'http://localhost:3000/singer'

  const params = Object.assign({}, {
    "comm": {
      "ct": 24,
      "cv": 10000
    },
    "singerList": {
      "module": "Music.SingerListServer",
      "method": "get_singer_list",
      "param": {
        "index": options ? options.index : -100,
        "area": options ? options.area : -100,
        "sex": options ? options.sex : -100,
        "genre": options ? options.genre : -100,
        "sin": options ? options.sin : 0,
        "cur_page": options ? options.cur_page : 1
      }
    }
  })

  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    platform: 'yqq',
    loginUin: 0,
    hostUin: 0,
    needNewCode: 0,
    data: JSON.stringify(params)
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res)
  })
}

export function getSingerDesc(mid) {
  const url = 'http://localhost:3000/singerdesc'

  const data = Object.assign({}, commonParams, {
    platform: 'yqq',
    singermid: mid,
    order: 'listen',
    loginUin: 0,
    hostUin: 0,
    needNewCode: 0,
    begin: 0,
    num: 80,
    songstatus: 1,
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res)
  })
}

export function getSingerAlbum(mid) {
  const url = 'http://localhost:3000/getSingerAlbum'

  const data = Object.assign({}, commonParams, {
    platform: 'yqq',
    singermid: mid,
    order: 'time',
    loginUin: 0,
    hostUin: 0,
    needNewCode: 0,
    begin: 0,
    num: 5,
    songstatus: 1,
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res)
  })
}

export function getSingerMv(mid) {
  const url = 'http://localhost:3000/getSingerMv'

  const data = Object.assign({}, commonParams, {
    g_tk: 1194859437,
    cid: 205360581,
    platform: 'yqq',
    singermid: mid,
    order: 'listen',
    loginUin: 0,
    hostUin: 0,
    needNewCode: 0,
    begin: 0,
    num: 5
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res)
  })
}


export function gerSingerFan(mid) {
  const url = 'http://localhost:3000/gerSingerFan'

  const data = Object.assign({}, commonParams, {
    reqtype: 1,
    singermid: mid,
    g_tk: 1194859437,
    loginUin: 0,
    hostUin: 0,
    platform: 'yqq',
    format: 'jsonp',
    cid: 205361944,
    needNewCode: 0
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res)
  })
}








