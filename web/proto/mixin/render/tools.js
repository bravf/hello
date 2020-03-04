import jsx from 'vue-jsx'
import iview from '../../core/iview'
let {div} = jsx
let  {iButton, ButtonGroup} = iview
let _renderTools = function () {
  let me = this
  let jsxProps = {
  }
  let rect = this.currRects[0]
  let isTempGroup = rect && this._checkIsTempGroup(rect)
  let isGroup = rect && this._checkIsGroup(rect)
  return div({
    'class_proto-tools': true,
  },
    ButtonGroup(
      iButton({
        ...jsxProps,
        props_disabled: !isTempGroup,
        on_click () {
          me._historyGroup()
          // 删掉临时组
          me._removeRectById(rect.id)
          let newGroup = me._createGroup()
          // 绑定
          me._bindGroup(newGroup, rect.children.map(id => {
            let rect = me._getRectById(id)
            return rect
          }))
          me._updateCurrRect(newGroup)
        },
      }, '组合'),
      iButton({
        ...jsxProps,
        props_disabled: !isGroup,
        on_click () {
          let rect = me.currRects[0]
          if (rect && me._checkIsGroup(rect)){
            me._unbindGroup(rect)
            me._updateCurrRect()
          }
        },
      }, '打散'),
      iButton({
        ...jsxProps,
        props_disabled: !rect,
        on_click () {
          let rect = me.currRects[0] 
          if (rect){
            me._historyGroup()
            me._getRects(rect).forEach(rect2 => {
              me._removeRectById(rect2.id)
              // 忽略临时组
              if (me._checkIsTempGroup(rect2)){
                return
              }
              me._historyAdd(rect2.id, rect2, null)
            })
            me._historyGroupEnd()
            me._updateCurrRect()
          }
        }
      }, '删除'),
      iButton({
        ...jsxProps,
        props_disabled: !me._historyCanBack(),
        on_click () {
          me._historyBack()
        }
      }, '后退'),
      iButton({
        ...jsxProps,
        props_disabled: !me._historyCanGo(),
        on_click () {
          me._historyGo()
        }
      }, '前进'),
    )
  )
    
}
export {
  _renderTools,
}