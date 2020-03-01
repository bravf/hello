import jsx from 'vue-jsx'
let {div, span,  input} = jsx
let _renderTools = function () {
  let me = this
  let jsxProps = {
    'class_proto-button': true,
  }
  return div({
    'class_proto-tools': true,
  },
    span({
      ...jsxProps,
      on_click () {
        let rect = me.currRects[0]
        if (rect && me._checkIsTempGroup(rect)){
          // 删掉临时组
          me._removeRectById(rect.id)
          // 新建组
          let newGroup = me._createGroup()
          // 绑定
          me._bindGroup(newGroup, rect.children.map(id => {
            return me._getRectById(id)
          }))
          me._updateCurrRect(newGroup)
        }
      },
    }, '组合'),
    span({
      ...jsxProps,
      on_click () {
        let rect = me.currRects[0]
        if (rect && me._checkIsGroup(rect)){
          me._unbindGroup(rect)
          me._updateCurrRect()
        }
      },
    }, '打散'),
    span({
      ...jsxProps,
      on_click () {
        let rect = me.currRects[0] 
        if (rect){
          me._getRects(rect).forEach(rect2 => {
            me._removeRectById(rect2.id)
            me._updateCurrRect()
          })
        }
      }
    },
    '删除')
  )
}
export {
  _renderTools,
}