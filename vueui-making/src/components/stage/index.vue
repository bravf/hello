<style lang="scss">
@import './index.scss';
</style>
<script>
import Vue from 'vue'
import jsx from 'vue-jsx'
import antdConf from './antd-conf/index.js'
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
  ATabs,
  ATabPane,
  AForm,
  AFormItem,
  AInput,
  ATooltip,
  ARadioGroup,
  ARadioButton,
  // ARow,
  // ACol
} = antdJsx
let comConf = {
  ...nativeConf,
  ...antdConf,
}
// let colors = {
//   gray: '#f0f2f5',
//   white: '#fff',
//   blue: '#1890ff',
//   green: '#87d068',
//   red: '#ff4d4f',
// }
let Event = new Vue()
let Data = {
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
}
let Common = {
  data () {
    return Data
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
  },
}
let ComList = {
  name: 'ComList',
  mixins: [
    Common,
  ],
  render () {
    console.log('ComList render')
    let me = this
    let mouseEvent = this.mouseEvent
    return div('.com-tree com-list',
      h3('组件列表'),
      ...Object.keys(comConf).map(str => {
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
  }
}
let DomTree = {
  name: 'DomTree',
  mixins: [
    Common,
  ],
  render () {
    console.log('DomTree render')
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
        let isDrag = this._isSameObject(object, this.dragCom)
        let isDragHover = isHover && !isDrag
        let textChildren = [
          `<${comCase(object.type)}>`,
        ]
        if (!isPage && !isDrag) {
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
            if (mouseEvent.isDrag) {
              me.hoverCom = object
            }
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
            if (me.dragCom === object) {
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
  }
}
let DomView = {
  name: 'DomView',
  mixins: [
    Common,
  ],
  render () {
    console.log('DomView render')
    return this._walkTree(noop, (
      object, 
      childrenRes
    ) => {
      let { type, props } = object
      if (type === 'text') {
        return props.value
      }
      let me = this
      let isPage = object === this.activePage
      let conf = this._getComConf(object)
      let isNative = conf.native
      let eventPrefix = isNative ? 'on' : 'nativeOn'
      let jsxProps = {
        key: object.id,
        'class_com-wrapper': true,
        'class_page': isPage,  
        'class_com-active': this._isSameObject(object, this.activeCom),
        [`${eventPrefix}_click`] (e) {
          e.stopPropagation()
          me.activeCom = object
        },
      }
      for (let key in props) {
        let val = props[key]
        if (key === 'key') {
          jsxProps[key] = val
        }
        jsxProps['props_' + key] = val
      }
      return create(
        object.type,
        jsxProps,
        ...childrenRes,
      )
    })
  }
}
let Setting = {
  name: 'Setting',
  mixins: [
    Common,
  ],
  methods: {
    _renderProp () {
      let me = this
      let com = this.activeCom
      let props = comConf[com.type].props || {}
      let comProps = com.props
      return AForm(
        ...Object.keys(props).map(key => {
          let { type, desc } = props[key]
          let inputChildren = []
          let isArrayType = Array.isArray(type)
          let isBooleanType = type === 'boolean'

          if (isArrayType || isBooleanType) {
            let enums = isArrayType ? type : [true, false]

            inputChildren = [
              ARadioGroup({
                props_buttonStyle: 'solid',
                props_value: comProps[key],
                on_input (val) {
                  if (val !== '-') {
                    me.$set(comProps, key, val)
                  }
                }
              },
                ARadioButton({
                  props_value: '-',
                  nativeOn_click () {
                    me.$set(comProps, key ,'')
                    delete comProps[key]
                  }
                }, '-'),
                ...enums.map(val => {
                  return ARadioButton({
                    props_value: val
                  }, val + '')
                })
              )
            ]
          }
          else {
            inputChildren = [
              AInput({
                props_allowClear: true,
                props_value: comProps[key],
                on_change (e) {
                  me.$set(comProps, key, e.target.value)
                }
              })
            ]
          }
          return AFormItem({
            key,
            props_colon: false,
          },
            ATooltip({
              slot: 'label',
            }, 
              div({
                slot: 'title'
              },
                desc,
              ),
              key,
              AIcon({
                props_type: 'exclamation-circle',
                'style_padding-left': '4px'
              })
            ),
            ...inputChildren,
          )
        })
      )
    }
  },
  render () {
    console.log('Setting render')
    return ATabs({
      props_defaultActiveKey: '1',
    },
      ATabPane({
        props_tab: '属性设置',
        key: '1',
      },
        this._renderProp(),
      ),
      ATabPane({
        props_tab: '样式设置',
        key: '2',
      })
    )
  }
}
let DragCom = {
  name: 'DragCom',
  mixins: [
    Common,
  ],
  render () {
    console.log('DragCom render')
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
  }
}
export default {
  name: 'Stage',
  mixins: [
    Common,
  ],
  components: {
    ComList,
    DomTree,
    DomView,
    Setting,
    DragCom,
  },
  methods: {
    _renderHeader () {
      return h1('Antdv making~')
    },
    _renderLeftSide () {
      return create('com-list')
    },
    _renderLeftSide2 () {
      return create('dom-tree')
    },
    _renderContent () {
      return create('dom-view')
    },
    _renderDragCom () {
      return create('drag-com')
    },
    _renderRight () {
      ATabPane, ATabs
      return create('setting')
      
    },
    _renderMain () {
      return div('.root',
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
            ALayoutSider('.side-right',
              this._renderRight()
            ),
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

    this.activeCom = formItem
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
      if (!mouseEvent.isDrag) {
        return
      }
      mouseEvent.xy.moveX = e.clientX - mouseEvent.xy.clientX
      mouseEvent.xy.moveY = e.clientY - mouseEvent.xy.clientY
    })
  },
  render (h) {
    jsx.h = h
    console.log('Stage render')
    return this._renderMain()
  }
}
</script>