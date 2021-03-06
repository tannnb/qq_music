import {commonParams} from './config'
import axios from 'axios'

const debug = process.env.NODE_ENV !== 'production'

export function getAlbum(options) {
  const url = debug ? 'http://localhost:3000/getAlbum' : '/pc/getAlbum'
  const data = Object.assign({}, commonParams, {
    g_tk: 1194859437,
    hostUin: 0,
    loginUin: 0,
    platform: 'yqq',
    needNewCode: 0,
    data: {
      "albumlib": {
        "method": "get_album_by_tags",
        "param": {
          "area": options.area ? options.area : 7,
          "company": options.company ? options.company : -1,
          "genre": options.genre ? options.genre : -1,
          "type": options.type ? options.type : -1,
          "year": options.year ? options.year : -1,
          "sort": 5,
          "get_tags": 1,
          "sin": options.sin ? options.sin : 0,
          "num": 19,
          "click_albumid": 0
        },
        "module": "music.web_album_library"
      }
    }
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res)
  })
}


export function getAlbumDesc(mid) {
  const url = debug ? 'http://localhost:3000/getAlbumDesc' : '/pc/getAlbumDesc'
  const data = Object.assign({}, commonParams, {
    albummid: mid,
    g_tk: '1194859437',
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



