<style lang="scss">
@import './index.scss';
</style>
<script>
import Vue from 'vue'
import jsx from 'vue-jsx'
import antdConf from './antd-conf'
import nativeConf from './native-conf'
import antdJsx from './antd-jsx'
import { 
  comCase,
  getUuid,
  noop,
  getElementRect,
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
  AIcon,
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
let Event = new Vue()
export default {
  name: 'stage',
  data () {
    return {
      objects: {},
      activePage: null,
      activeCom: null,
      hoverCom: null,
      dragCom: null,
      dragComRect: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
      mouseEvent: {
        isDown: false,
        isDrag: false,
        type: 'move',
        xy: {
          clientX: 0,
          clientY: 0,
          moveX: 0,
          moveY: 0,
        }
      },
      hook: 0,
    }
  },
  methods: {
    _walkTree (
      bf = noop, 
      af = noop, 
      object = this.activePage,
      checkGroupOpen = false,
    ) {
      let _f = (
        _object, 
        z = 0
      ) => {
        _object = this._safeObject(_object)
        bf(_object, z)
        let isLoopChildren = !(checkGroupOpen && _object.cache.isGroupOpen === false)
        let childrenRes = isLoopChildren
          ? _object.childrenIds.map(child => {
            return _f(child, z + 1)
          })
          : []
        return af(_object, childrenRes, z)
      }
       return _f(object)
    },
    _createObject () {
      return {
        id: getUuid(),
        childrenIds: [],
        cache: {
          isGroupOpen: true,
        },
      }
    },
    _createPage () {
      return {
        ...this._createObject(),
        type: 'div',
      }
    },
    _createCom (type) {
      return {
        ...this._createObject(),
        type,
        parentId: '',
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
    _isSameObject (
      object, 
      object2
    ) {
      if (isNil(object) || isNil(object2)) {
        return false
      }
      object = this._safeObject(object)
      object2 = this._safeObject(object2)
      return object.id === object2.id
    },
    _isFirstChild (child) {
      child = this._safeObject(child)
      let parent = this._safeObject(child.parentId)
      return parent && (parent.childrenIds.indexOf(child.id) === 0)
    },
    _removeChild (child) {
      child = this._safeObject(child)
      if (child.parentId) {
        let parent = this._safeObject(child.parentId)
        child.parentId = ''
        remove(parent.childrenIds, value => value === child.id)
      }
    },
    _addChild (
      parent, 
      child
    ) {
      parent = this._safeObject(parent)
      child = this._safeObject(child)
      if (!(child.id in this.objects)) {
        this._addObject(child)
      }
      this._removeChild(child)
      child.parentId = parent.id
      parent.childrenIds.push(child.id)
    },
    _inserBeforeOrAfter (
      object,
      target,
      type = 'before',
    ) {
      object = this._safeObject(object)
      target = this._safeObject(target)
      if (!(object.id in this.objects)) {
        this._addObject(object)
      }
      if (!(object.id in this.objects)) {
        this._addObject(object)
      }
      this._removeChild(object)
      object.parentId = target.parentId
      let parent = this._safeObject(target.parentId)
      let targetIndex = parent.childrenIds.indexOf(target.id)
      if (type === 'after') {
        targetIndex ++
      }
      parent.childrenIds.splice(targetIndex, 0, object.id)
    },
    _inserBefore (
      object, target
    ) {
      this._inserBeforeOrAfter(object, target)
    },
    _insertAfter (
      object,
      target,
    ) {
      this._inserBeforeOrAfter(object, target, 'after')
    },
    _getComConf (object) {
      object = this._safeObject(object)
      return comConf[object.type] || {}
    },
    _renderHeader () {
      return h1('Antdv making~')
    },
    _renderLeftSide () {
      let me = this
      let mouseEvent = this.mouseEvent
      return div('.com-tree com-list',
        h3('组件列表'),
        ...Object.keys(antdConf).map(str => {
          let id = `cl-${str}`
          return div('.com-tree-item', {
            key: str,
            attrs_id: id,
            'on_mousedown' (e) {
              mouseEvent.isDown = true
              mouseEvent.xy.clientX = e.clientX
              mouseEvent.xy.clientY = e.clientY
              me.dragCom = me._createCom(str)
              me.dragComRect = getElementRect(document.getElementById(id))
            },
            'on_mousemove' () {
              if (!mouseEvent.isDown) {
                return
              }
              mouseEvent.isDrag = true
            },
          }, 
            div('.com-tree-text', comCase(str))
          )
        })
      )
    },
    _renderLeftSide2 () {
      let me = this
      let mouseEvent = this.mouseEvent
      let items = []
      let bf = (object, z) => items.push({ object, z })
      this._walkTree(bf, noop, this.activePage, true)
      return div('.com-tree', {
        'class_com-tree-drag': mouseEvent.isDrag,
      },
        h3('Dom 树'),
        ...items.map(o => {
          let { object, z } = o
          let isPage = this._isSameObject(object, this.activePage)
          let isHover = this._isSameObject(object, this.hoverCom)
          let isActive = this._isSameObject(object, this.activeCom)
          let isDragHover = isHover && mouseEvent.isDrag && !isActive
          let textChildren = [
            comCase(object.type),
          ]
          if (!isPage && !isActive) {
            let isFirstChild = this._isFirstChild(object)
            if (isFirstChild) {
              textChildren.push(
                div('.com-tree-drag-holder com-tree-drag-holder-top', {
                  'on_mouseup' (e) {
                    e.stopPropagation()
                    if (mouseEvent.isDrag) {
                      me._inserBefore(me.dragCom, object)
                    }
                    Event.$emit('g-mouseup', e)
                  }
                }),
              )
            }
            textChildren.push(
              div('.com-tree-drag-holder com-tree-drag-holder-bottom', {
                'on_mouseup' (e) {
                  e.stopPropagation()
                  if (mouseEvent.isDrag) { 
                    me._insertAfter(me.dragCom, object)
                  }
                  Event.$emit('g-mouseup', e)
                }
              })
            )
          }
          let children = [
            div('.com-tree-text', ...textChildren)
          ]
          if (object.childrenIds.length) {
            let cache = object.cache
            children = [
              AIcon('.com-tree-arrow', {
                props_type: cache.isGroupOpen 
                  ? 'caret-down' 
                  : 'caret-right',
                on_mousedown (e) {
                  e.stopPropagation()
                },
                on_click () {
                  cache.isGroupOpen = !cache.isGroupOpen
                }
              }),
              ...children
            ]
          }
          else {
            children = [
              div({
                style_width: '14px'
              }),
              ...children,
            ]
          }
          return div('.com-tree-item', {
            key: object.id,
            'attrs_id': `dt-${object.id}`,
            'style_padding-left': (z * 10) + 'px',
            'class_com-tree-hover': isHover && !isDragHover,
            'class_com-tree-drag-hover': isDragHover,
            'class_com-tree-active': isActive,
            'on_mouseover' (e) {
              e.stopPropagation()
              me.hoverCom = object
            },
            'on_mouseout' (e) {
              e.stopPropagation()
              me.hoverCom = null
            },
            'on_mousedown' (e) {
              mouseEvent.isDown = true
              me.activeCom = object
              mouseEvent.xy.clientX = e.clientX
              mouseEvent.xy.clientY = e.clientY
              me.dragCom = me.activeCom
              me.dragComRect = getElementRect(document.getElementById('dt-' + object.id))
            },
            'on_mousemove' () {
              if (!mouseEvent.isDown) {
                return
              }
              if (isActive) {
                object.cache.isGroupOpen = false
              }
              mouseEvent.isDrag = true
            },
            'on_mouseup' (e) {
              if (mouseEvent.isDrag && (me.dragCom !== object)) {
                me._addChild(object, me.dragCom)
                object.cache.isGroupOpen = true
              }
              Event.$emit('g-mouseup', e)
            }
          },
            ...children,
          )
        })
      )
    },
    _renderContent () {
      return this._walkTree(noop, (
        object, 
        childrenRes
      ) => {
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
    _renderDragCom () {
      let me = this
      let mouseEvent = this.mouseEvent
      let dragCom = me.dragCom
      let isDrag = mouseEvent.isDrag
      let dragComRect = me.dragComRect
      let xy = mouseEvent.xy

      if (isDrag) {
        return div('.com-tree-item com-drag', {
          'style_left': dragComRect.left + xy.moveX + 'px',
          'style_top': dragComRect.top + xy.moveY + 'px',
          'style_width': dragComRect.width + 'px',
          'style_height': dragComRect.height + 'px',
        },
          div('.com-tree-text', comCase(dragCom.type))
        )
      }
      else {
        return null
      }
    },
    _renderMain () {
      return div('.root', {
        'class_root-drag': this.mouseEvent.isDrag,
      },
        this._renderDragCom(),
        ALayout('.app',
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
      )
    },
  },
  created () {
    let page = this._createPage()
    this._addObject(page)
    this.activePage = page
    this.activeCom = page

    let form = this._createCom('a-form')
    this._addChild(page, form)

    let formItem = this._createCom('a-form-item')
    this._addChild(form, formItem)
    
    let input = this._createCom('a-input')
    this._addChild(formItem, input)
    this._addChild(formItem, this._createCom('a-button'))
    this._addChild(formItem, this._createCom('a-input'))

    let fromItem2 = this._createCom('a-form-item')
    this._addChild(form, fromItem2)

    let button = this._createCom('a-button')
    this._addChild(fromItem2, button)
  },
  mounted () {
    let mouseEvent = this.mouseEvent
    Event.$on('g-mouseup', () => {
      if (!mouseEvent.isDown) {
        return
      }
      mouseEvent.isDown = false
      mouseEvent.isDrag = false
    })
    window.addEventListener('mouseup', (e) => {
      Event.$emit('g-mouseup', e)
    })
    window.addEventListener('mousemove', (e) => {
      mouseEvent.xy.moveX = e.clientX - mouseEvent.xy.clientX
      mouseEvent.xy.moveY = e.clientY - mouseEvent.xy.clientY
      this.hook ++
    })
  },
  render (h) {
    jsx.h = h
    this.hook
    return this._renderMain()
  }
}
</script>