import jsx from 'vue-jsx'
import {

} from '@/core/base'
let {div} = jsx

let _renderRectListItem = function (rect) {
  let me = this
  let isHover = (rect.id === this.hoverRectId) 
    || (rect.id === this.currRectId)
    || (rect.tempGroupId && (rect.tempGroupId === this.tempGroupId) )
  return div({
    'class_proto-rect-list-item': true,
    'class_proto-rect-list-item-child': rect.groupId !== '',
    'class_proto-rect-list-item-hover': isHover,
    'attrs_index': rect.index,
    'on_mouseover' () {
      me._updateHoverRect(rect)
    },
    'on_mouseout' () {
      me._updateHoverRect()
    },
    'on_click' () {
      let group = me._getGroupByRect(rect)
      if (group){
        me._commandRectDataPropUpdate(group, 'isOpen', true)
      }
      me._updateCurrRect(rect)
    },
  },
  rect.name)
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
    }, '元素'),
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