<style lang="scss">
@import './index.scss';
</style>
<script>
import jsx from 'vue-jsx'
import antdConf from './antd-conf'
import nativeConf from './native-conf'
import antdJsx from './antd-jsx'
import { 
  comCase,
  getUuid,
  noop,
} from '@/base'
import {
  isString,
  remove,
  isNil,
} from 'lodash'
let {
  create,
  h1,
  h3,
  div,
} = jsx
let { 
  ALayout, 
  ALayoutHeader, 
  ALayoutContent, 
  ALayoutSider, 
} = antdJsx
let comConf = {
  ...antdConf,
  ...nativeConf,
}
// let colors = {
//   gray: '#f0f2f5',
//   white: '#fff',
//   blue: '#1890ff',
//   green: '#87d068',
//   red: '#ff4d4f',
// }

export default {
  name: 'stage',
  data () {
    return {
      objects: {},
      activePage: null,
      activeCom: null,
      hoverCom: null,
    }
  },
  methods: {
    _walkTree (bf = noop, af = noop, object = this.activePage) {
      let _f = (_object, z = 0) => {
        _object = this._safeObject(_object)
        bf(_object, z)
        let childrenRes = _object.childrenIds.map(child => {
          return _f(child, z + 1)
        })
        return af(_object, childrenRes, z)
      }
       return _f(object)
    },
    _createPage () {
      return {
        id: getUuid(),
        data: {},
        type: 'div',
        childrenIds: [],
      }
    },
    _createCom (type) {
      return {
        id: getUuid(),
        type,
        parentId: '',
        childrenIds: [],
        props: {},
        styles: {},
      }
    },
    _addObject (object) {
      this.objects[object.id] = object
    },
    _safeObject (object) {
      return isString(object)
        ? this.objects[object]
        : object
    },
    _isSameObject (object, object2) {
      if (isNil(object) || isNil(object2)) {
        return false
      }
      object = this._safeObject(object)
      object2 = this._safeObject(object2)
      return object.id === object2.id
    },
    _removeChild (child) {
      child = this._safeObject(child)
      if (child.parent) {
        let parent = this._safeObject(child.parent)
        remove(parent.childrenIds, value => value === child.id)
      }
    },
    _addChild (parent, child) {
      parent = this._safeObject(parent)
      child = this._safeObject(child)
      if (!(child.id in this.objects)) {
        this._addObject(child)
      }
      if (child.parent) {
        this._removeChild(parent, child)
      }
      parent.childrenIds.push(child.id)
    },
    _getComConf (object) {
      object = this._safeObject(object)
      return comConf[object.type] || {}
    },
    _renderHeader () {
      return h1('Antdv making~')
    },
    _renderLeftSide () {
      return div('.com-tree com-list',
        h3('组件列表'),
        ...Object.keys(antdConf).map(str => {
          return div({key: str}, comCase(str))
        })
      )
    },
    _renderLeftSide2 () {
      let me = this
      let items = []
      this._walkTree((object, z) => {
        items.push({
          object,
          z,
        })
      })
      return div('.com-tree',
        h3('Dom 树'),
        ...items.map(o => {
          let { object, z } = o
          return div({
            key: object.id,
            'style_padding-left': (z * 10) + 'px',
            'class_com-tree-hover': this._isSameObject(object, this.hoverCom),
            'class_com-tree-active': this._isSameObject(object, this.activeCom),
            'on_click' (e) {
              e.stopPropagation()
              me.activeCom = object
            },
            'on_mouseover' (e) {
              e.stopPropagation()
              me.hoverCom = object
            },
            'on_mouseout' (e) {
              e.stopPropagation()
              me.hoverCom = null
            }
          },
            comCase(object.type)
          )
        })
      )
    },
    _renderContent () {
      return this._walkTree(noop, (object, childrenRes) => {
        let me = this
        let isPage = object === this.activePage
        let conf = this._getComConf(object)
        let isNative = conf.native
        let eventPrefix = isNative ? 'on' : 'nativeOn'
        let jsxProps = {
          key: object.id,
          'class_com-wrapper': true,
          'class_page': isPage,  
          'class_com-hover': this._isSameObject(object, this.hoverCom),
          'class_com-active': this._isSameObject(object, this.activeCom),
          [`${eventPrefix}_click`] (e) {
            e.stopPropagation()
            me.activeCom = object
          },
          [`${eventPrefix}_mouseover`] (e) {
            e.stopPropagation()
            me.hoverCom = object
          },
          [`${eventPrefix}_mouseout`] (e) {
            e.stopPropagation()
            me.hoverCom = null
          },
        }
        return create(
          object.type,
          jsxProps,
          ...childrenRes,
        )
      })
    },
    _renderMain () {
      return ALayout('.app',
        ALayoutHeader('.header', 
          this._renderHeader(),
        ),
        ALayout(
          ALayoutSider('.side-left',
            this._renderLeftSide(),
          ),
          ALayoutSider('.side-left side-left2',
            this._renderLeftSide2(),
          ),
          ALayoutContent('.content', 
            this._renderContent(),
          ),
          ALayoutSider('.side-right','sider-right'),
        ),
      )
    },
  },
  created () {
    let page = this._createPage()
    this._addObject(page)
    this.activePage = page

    let form = this._createCom('a-form')
    this._addChild(page, form)

    let fromItem = this._createCom('a-form-item')
    this._addChild(form, fromItem)
    
    let input = this._createCom('a-input')
    this._addChild(fromItem, input)

    let fromItem2 = this._createCom('a-form-item')
    this._addChild(form, fromItem2)

    let button = this._createCom('a-button')
    this._addChild(fromItem2, button)
  },
  render (h) {
    jsx.h = h
    return this._renderMain()
  }
}
</script>