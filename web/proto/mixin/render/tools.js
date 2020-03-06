import jsx from 'vue-jsx'
import iview from '../../core/iview'
let {div} = jsx
let  {iButton, ButtonGroup} = iview
let _renderTools = function () {
  let me = this
  let jsxProps = {
    props_type: 'primary',
  }
  let rect = this.rects[this.currRectId]
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
          let newGroup = me._create('group')
          // 绑定
          me._bindGroup(newGroup, rect.children.map(id => {
            let rect = me._getRectById(id)
            return rect
          }))
          me._unbindTempGroup()
          me._updateCurrRect(newGroup)
          me._historyPush()
        },
      }, '组合'),
      iButton({
        ...jsxProps,
        props_disabled: !isGroup,
        on_click () {
          let rect = me.rects[me.currRectId]
          if (rect && me._checkIsGroup(rect)){
            me._unbindGroup(rect)
            me._updateCurrRect()
            me._historyPush()
          }
        },
      }, '打散'),
      iButton({
        ...jsxProps,
        props_disabled: !rect,
        on_click () {
          let rect = me.rects[me.currRectId]
          if (rect){
            me._getRects(rect).forEach(rect2 => {
              me._removeRectById(rect2.id)
            })
            me._updateCurrRect()
            me._historyPush()
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
      iButton({
        ...jsxProps,
        props_disabled: !rect,
        on_click () {
          if (me._checkIsTempGroup(rect)) {
            me._commandPropUpdate('clipboard', 
              rect.children.map(rectId => {
                return me._clone(me._getRectById(rectId))
              })
            )
            // me.clipboard = rect.children.map(rectId => {
            //   return me._clone(me._getRectById(rectId))
            // })
          }
          else {
            // me.clipboard = [me._clone(rect)]
            me._commandPropUpdate('clipboard', [me._clone(rect)])
          }
        }
      }, '复制'),
      iButton({
        ...jsxProps,
        props_disabled: !me.clipboard.length,
        on_click () {
          // todo，粘贴的位置还得考虑
          let rects = me.clipboard.map(config => {
            let rect = me._create2(config)
            me._updateRectTempData(rect)
            me._move(rect, 20, 20)
            return rect
          })
          let currRect = rects[0]
          if (rects.length > 1){
            me._unbindTempGroup()
            currRect = me._bindTempGroup(rects)
          }
          me._updateRectZIndex(currRect)
          me._updateCurrRect(currRect)
          me._clearGuideShow()
          me._historyPush()
        }
      }, '粘贴'),
    )
  )
    
}
export {
  _renderTools,
}