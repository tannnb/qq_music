<template>
  <div class="search-wrapper">

    <!-- 搜索区域 -->
    <div class="search-area">
      <div class="searchFn">
        <input class="oInput" @keyup.enter="handleSearchBtn" type="text" v-model="searchInputText">
        <i class="icon-search" @click="handleSearchBtn"></i>

        <div class="searchResultList" v-if=" responseShow.length !== 0">
          <div v-for="(items,index) in responseShow"
               class="resultListItem"
               v-if="items.itemlist.length !== 0"
               :key="items.type">
            <div class="typeName">{{items.name}}</div>
            <div class="typeList">
              <span
                v-for="(itemlist,index) in items.itemlist"
                :key="itemlist.id"
                @click="handleSelectItem(itemlist,items)"
                class="info">
                {{itemlist.name}} - {{itemlist.singer}}
              </span>
            </div>
          </div>
        </div>

      </div>

      <div class="hotSearch"> 热门搜索:
        <a v-for="(items,index) in hotKey"
           @click="handleSelectHotKey(items)"
           :key="items.n">{{items.k}}</a>
      </div>
    </div>

    <div class="search-Container">
      <div class="search-main">

        <!-- 歌手类型-->
        <div class="songer-type" v-if="zhida&&zhida.singermid">
          <div class="avatar" v-if="zhida.singermid">
            <img :src="avatar(zhida.singermid)" :alt="zhida.singername">
          </div>
          <div class="songer-info" v-if="zhida.singermid">
            <span class="singerName">{{zhida.singername}}</span>
            <span class="singerName">单曲:{{zhida.songnum}}</span>
            <span class="singerName">专辑:{{zhida.albumnum}}</span>
            <div class="play">
              <i class="icon-play" @click="handlePlayerAll">播放专辑</i>
            </div>
          </div>
        </div>

        <div>
          <List-view
            v-if="songs.length !== '' "
            :song="songs"
            @handlePlayer="handlePlayer"
            @appendPlayer="appendPlayer"
          ></List-view>
        </div>


      </div>
    </div>

    <vue-progress-bar></vue-progress-bar>

  </div>
</template>

<script>
  import {mapGetters, mapActions} from 'vuex'
  import {gethotkey} from "../../api/recommend";
  import {clientSearch, clientSmartBox} from "../../api/search";
  import ListView from '../../components/list-view/list-view'
  import {ERR_OK} from "../../api/config";
  import {processSongsUrl, isValidMusic, createSong} from "../../api/songList";
  import {debounce} from "../../utils/tool";
  import {LoadingMixin} from "../../utils/mixin";


  const PERPAGE = 30
  const TYPE_SINGER = 'singer'
  export default {
    mixins: [LoadingMixin],
    data() {
      return {
        hotKey: '',
        searchInputText: '',
        searchObjArr: [],
        defaultFirstSong: [],
        zhida: {},
        songs: [],
        page: 1,
        result: [],
        showSinger: true,
        responseShow: ''
      }
    },
    created() {
      this.$Progress.start()

      // 本地存在搜索历史
      if (this.searchHistory.length !== 0) {
        this.searchInputText = this.searchHistory[0]
        this._gethotkey()
        this._clientSearch()
        this.$Progress.finish()
        return
      }

      // 若是本地缓存也没有歌曲
      if (this.searchHistory.length === 0) {
        // 先请求热搜
        this._gethotkey().then(res => {
          this.$Progress.finish()
          this.searchInputText = res[0].k
          this._clientSearch()
        }).catch(e => {
          this.$Progress.finish()
        })
      }

    },
    components: {
      ListView
    },
    computed: {
      ...mapGetters(['searchHistory']),
    },
    mounted() {
      this.$watch('searchInputText', debounce((newQuery) => {
        if (newQuery.length === 0) {
          this.responseShow = ''
          return
        }
        this._clientSmartBox(newQuery)
      }, 200))

      document.addEventListener('click', () => {
        this.responseShow = ''
      }, false)

    },
    methods: {
      ...mapActions([
        'selectPlay',
        'insertSong',
        'saveSearcHistory'
      ]),

      _gethotkey() {
        return new Promise((resolve, reject) => {
          gethotkey().then(res => {
            if (res.code === ERR_OK) {
              this.defaultFirstSong = res.data.hotkey
              this.hotKey = (res.data.hotkey).slice(0, 5)
              resolve(res.data.hotkey)
            }
          })
            .catch(e => {
              reject(e)
            })
        })
      },

      _clientSearch() {
        clientSearch(this.searchInputText, this.page, this.showSinger, PERPAGE)
          .then(res => {
            if (res.data.code === ERR_OK) {
              this._genResult(res.data.data).then((result) => {
                this.zhida = {}
                // 是否存在歌手
                try {
                  if (result && result[0].singermid && result[0].singerid) {
                    this.zhida = result[0]
                    this.songs = result.slice(1)
                    return
                  }
                  this.songs = result
                } catch (e) {
                  var that = this
                  this.CreateDialog({
                    message: '该歌曲因版权原因，无法获取',
                    confirmBtnText: '取消',
                    cancelBtn: false,
                    confirmBtn() {
                      that.responseShow = ''
                    }
                  })
                }
              })
            }
          })
      },

      _genResult(data) {
        let ret = []
        if (data.zhida && data.zhida.singerid && this.page === 1) {
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        return processSongsUrl(this._normalizeSongs(data.song.list)).then((songs) => {
          ret = ret.concat(songs)
          return ret
        })
      },

      _normalizeSongs(list) {
        let ret = []
        list.forEach((musicData) => {
          if (isValidMusic(musicData)) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      },

      // 热门
      handleSelectHotKey(items) {
        this.searchInputText = items.k
        this.saveSearcHistory(items.k)
        this._clientSearch()
        this.$nextTick(() => {
          this.responseShow = ''
        })
      },

      // 搜索按钮
      handleSearchBtn() {
        if (this.searchInputText.length === 0) {
          this.CreateDialog({
            message: '请输入要搜索的歌手名称或者歌曲名称',
            confirmBtnText: '确定'
          })
          return
        }
        this.saveSearcHistory(this.searchInputText)
        this._clientSearch()
        this.$nextTick(() => {
          this.responseShow = ''
        })
      },

      // 搜索列表
      async _clientSmartBox(newQuery) {
        try {
          const response = await clientSmartBox(newQuery)
          if (response.data.code === ERR_OK) {
            this.responseShow = response.data.data
          }
        } catch (e) {
          var vm = this
          this.CreateDialog({
            message: '网络错误',
            confirmBtnText: '取消',
            cancelBtn: false,
            confirmBtn() {
              vm.$router.push('/music/search')
            }
          })
        }
      },

      // 点击选择
      handleSelectItem(list, item) {
        this.searchInputText = `${list.name} - ${list.singer}`
        this._clientSearch()
        this.$nextTick(() => {
          this.responseShow = ''
        })
      },

      // 播放当前
      handlePlayer(items, index) {
        this.selectPlay({
          list: this.songs,
          index: index
        })
      },
      // 播放全部
      handlePlayerAll() {
        this.selectPlay({
          list: this.songs,
          index: 0
        })
      },

      appendPlayer(items) {
        this.insertSong(items)
      },

      avatar(mid) {
        return `//y.gtimg.cn/music/photo_new/T001R150x150M000${mid}.jpg?max_age=2592000`
      }
    }
  }
</script>

<style lang="stylus" scoped>

  .search-wrapper {
    width 100%
    height 247px
  }

  .search-area {
    position: relative
    width 100%
    height 247px
    background url("./bg_search.jpg")
    background-size cover
    .searchFn {
      position absolute
      top: 85px
      left: 50%
      transform translateX(-50%)
      width 640px
      height: 50px
      z-index 20
      border-radius 3px
      background white
      .oInput {
        border: none
        line-height 50px
        width 90%
        padding 0 10px
        font-size 15px
        color: #000
        outline none
      }
      .icon-search {
        position: absolute
        right: 0
        top: 50%
        transform translateY(-50%)
        font-size 24px
        padding 12px
        color: #989898
        vertical-align middle
        cursor pointer
        &:hover {
          color: #31c27c
        }
      }
      .searchResultList {
        width 100%
        background white
        border 1px solid #ccc
        box-sizing border-box
        .resultListItem {
          display flex
          .typeName {
            display flex
            justify-content: center
            align-items center
            flex 0 0 100
            width 100px
            font-size 15px
            color #a7a1a1
          }
          .typeList {
            flex 1
            padding 10px 0
            border-left 1px solid #e2e2e2
            border-bottom 1px solid #eee
            .info {
              display block
              padding-left 40px
              line-height 38px
              font-size 15px
              cursor pointer
              color: #636262
              &:hover {
                color white
                background #31c27c
              }
            }
          }
        }
      }
    }
    .hotSearch {
      position absolute
      top: 155px
      left: 50%
      transform translateX(-50%)
      color: #fff
      a {
        display inline-block
        font-size 14px
        margin-left 16px
        color: #fff
        cursor pointer
        &:hover {
          text-decoration underline
        }
      }
    }
  }

  .search-Container {
    background: linear-gradient(#f3f3f3, #fff);
    .search-main {
      width 1200px
      padding-top 20px
      margin 0 auto
    }
  }

  .search-main {
    .songer-type {
      display flex
      margin-top 20px
      margin-bottom 20px
      .avatar {
        flex 0 0 100
        width 100px
        border-radius 50%
        overflow hidden
        img {
          width 100%
          vertical-align top
        }
      }
      .songer-info {
        flex 1
        padding-left 20px
        padding-top 12px
        .singerName {
          margin-right: 20px;
        }
        .play {
          padding-top 20px
          i {
            display inline-block
            color: #fff
            background: #2caf6f
            border-radius: 2px;
            font-size: 15px;
            margin-right: 6px;
            padding: 0 23px;
            height: 38px;
            line-height: 38px;
            white-space: nowrap;
            box-sizing: border-box;
            overflow: hidden;
            cursor pointer
            &:hover {
              background: #299154
            }
          }

        }
      }
    }
  }

</style>
