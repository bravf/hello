import jsx from 'vue-jsx'
let { div, li, a} = jsx
let _renderContextMenu = function () {
  let contextmenu = this.contextmenu
  if (!contextmenu.show){
    return null
  }
  let type = contextmenu.eventType
  let e = contextmenu.e
  let children = []
  // 窗体宽高
  let windowWidth = window.innerWidth
  let windowHeight = window.innerHeight
  // contextmenu 的宽高
  let width = 180
  let height = 0
  if (type === 'rect-item') {
    height = 310
    children = renderWhenRectItem.call(this)
  }
  else if (type === 'rect') {
    height = 340
    children = renderWhenRect.call(this)
  }
  // 计算位置
  let mouseLeft = e.clientX
  let mouseTop = e.clientY
  mouseLeft = Math.min(mouseLeft, windowWidth - width - 10)
  mouseTop = Math.min(mouseTop, windowHeight - height - 10)
  return div('.proto-contextmenu menu', {
    style_left: mouseLeft + 'px',
    style_top: mouseTop + 'px',
    key: 'contextmenu',
    on_mousedown (e) {
      e.stopPropagation()
    },
    on_click () {
      contextmenu.show = false
    },
  },
    ...children,
  )
}
// rect
let renderWhenRect = function () {
  let me = this
  return [
    renderMenuItem({}, '剪切'),
    renderMenuItem({
      on_click () {
        me._actionRectCopy()
      }
    }, '复制'),
    (() => {
      let can = this._actionCanRectPaste()
      let jsxProps = {}
      if (!can){
        jsxProps = {
          ...jsxProps,
          'class_proto-menu-item-disalbed': true,
        }
      }
      else {
        jsxProps = {
          ...jsxProps,
          on_click () {
            me._actionRectPaste()
          }
        }
      }
      return renderMenuItem(jsxProps, '粘贴')
    })(),
    renderMenuItem({
      on_click () {
        me._actionRectDelete()
      }
    }, '删除'),
    renderDivider(),
    renderMenuItem({}, '锁定'),
    renderMenuItem({}, '隐藏'),
    renderDivider(),
    renderMenuItem({}, '组合'),
    renderMenuItem({}, '打散'),
    renderDivider(),
    renderMenuItem({
      on_click () {
        me._actionRectMoveTop()
      }
    }, '置顶'),
    renderMenuItem({
      on_click () {
        me._actionRectMoveBottom()
      }
    }, '置底'),
  ]
}
// rect-item
let renderWhenRectItem = function () {
  let rectInfo = this._actionGetInfo()
  let me = this
  return [
    renderMenuItem({
      on_click () {
        me._commandRectDataPropUpdate(rectInfo.rect, 'isNameEdit', true)   
      },
    }, '重命名'),
    renderMenuItem({}, '剪切'),
    renderMenuItem({
      on_click () {
        me._actionRectCopy()
      }
    }, '复制'),
    renderMenuItem({
      on_click () {
        me._actionRectDelete()
      }
    }, '删除'),
    renderDivider(),
    renderMenuItem({}, '锁定'),
    renderMenuItem({}, '隐藏'),
    renderDivider(),
    renderMenuItem({
      on_click () {
        me._actionRectMoveTop()
      }
    }, '置顶'),
    renderMenuItem({
      on_click () {
        me._actionRectMoveBottom()
      }
    }, '置底'),
  ]
}
let renderMenuItem = function (jsxProps, text) {
  return li('.menu-item', 
    jsxProps,
    a({
      attrs_href: 'javascript:;'
    }, text)
  )
}
let renderDivider = function () {
  return li('.divider')
}
export {
  _renderContextMenu,
}