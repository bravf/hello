import jsx from 'vue-jsx'
import event from '@/core/event'
import {
  isRightMouse,
} from '@/core/base'
let { div, input } = jsx

let _renderRectListItem = function (rect) {
  let me = this
  let isHover = (rect.id === this.hoverRectId) 
    || (rect.id === this.currRectId)
    || (rect.tempGroupId && (rect.tempGroupId === this.tempGroupId) )
  let isNameEdit = rect.data.isNameEdit
  let jsxProps = {
    'class_proto-rect-list-item': true,
    'class_proto-rect-list-item-child': rect.groupId !== '',
  }
  let children = [rect.name]
  if (isNameEdit){
    children = [
      input('.form-input input-sm', {
        domProps_value: rect.name,
        ref: 'rectItemInput',
        key: 'rectItemInput',
        on_focus () {
          me.$refs.rectItemInput.select()
        },
        on_blur () {
          me._commandRectDataPropUpdate(rect, 'isNameEdit', false)
          me._historyPush()
        },
        on_change () {
          me.$refs.rectItemInput.blur()
        },
        on_input (e) {
          let value = e.target.value
          me._commandRectPropUpdate(rect, 'name', value)
        }
      })
    ]
    setTimeout (() => {
      if (me.$refs.rectItemInput){
        me.$refs.rectItemInput.focus()
      }
    })
  }
  else {
    jsxProps = {
      ...jsxProps,
      'class_proto-rect-list-item-hover': isHover,
      'attrs_index': rect.index,
      'on_mouseover' () {
        me._updateHoverRect(rect)
      },
      'on_mouseout' () {
        me._updateHoverRect()
      },
      'on_mousedown' (e) {
        let group = me._getGroupByRect(rect)
        if (group){
          me._commandRectDataPropUpdate(group, 'isOpen', true)
        }
        me._updateCurrRect(rect)
        e.stopPropagation()
        event.$emit('windowMouseDown', e)

        // 右键判断
        if (isRightMouse(e)){
          me.contextmenu.e = e
          me.contextmenu.eventType = 'rect-item'
          me.contextmenu.show = true
        }
      },
    }
  }

  return div(jsxProps, ...children)
}
let _renderRectList = function () {
  let vdoms = []
  let temp = []
  this._getRectsByPage().reverse().forEach(rect => {
    if (this._checkIsTempGroup(rect)){
      return
    }
    let vdom = _renderRectListItem.call(this, rect)
    if (rect.groupId === ''){
      vdoms = [...vdoms, vdom, ...temp]
      temp = []
    }
    else {
      temp.push(vdom)
    }
  })
  vdoms = [...vdoms, ...temp]
  return div({
    'class_proto-rect-list': true,
    'class_card': true
  },
    div({
      'class_card-header': true
    },
      div({
        'class_card-title': true,
        'class_h6': true,
      }, '元素')
    ),
    div({
      'class_card-body': true,
    },
      ...vdoms,
    )
  )
}
export {
  _renderRectList,
}