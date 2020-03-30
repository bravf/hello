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
  else if (type === 'page'){
    height = 200
    children = renderWhenPage.call(this)
  }
  else if (type === 'canvas') {
    height = 200
    children = renderWhenCanvas.call(this)
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
// canvas
let renderWhenCanvas = function () {
  return [
    renderMenuItem.call(this, 'rect-粘贴'),
  ]
}
// page
let renderWhenPage = function () {
  return [
    renderMenuItem.call(this, 'page-重命名'),
    renderMenuItem.call(this, 'page-新建子页面'),
    renderMenuItem.call(this, 'page-删除'),
  ]
}
// rect
let renderWhenRect = function () {
  return [
    renderMenuItem.call(this, 'rect-剪切'),
    renderMenuItem.call(this, 'rect-复制'),
    renderMenuItem.call(this, 'rect-粘贴'),
    renderMenuItem.call(this, 'rect-删除'),
    renderDivider(),
    renderMenuItem.call(this, 'rect-锁定'),
    renderMenuItem.call(this, 'rect-解锁'),
    // renderMenuItem(this, 'rect-隐藏'),
    renderDivider(),
    renderMenuItem.call(this, 'rect-组合'),
    renderMenuItem.call(this, 'rect-打散'),
    renderDivider(),
    renderMenuItem.call(this, 'rect-置顶'),
    renderMenuItem.call(this, 'rect-置底'),
  ]
}
// rect-item
let renderWhenRectItem = function () {
  return [
    renderMenuItem.call(this, 'rect-重命名'),
    renderMenuItem.call(this, 'rect-剪切'),
    renderMenuItem.call(this, 'rect-复制'),
    renderMenuItem.call(this, 'rect-删除'),
    renderDivider(),
    renderMenuItem.call(this, 'rect-锁定'),
    renderMenuItem.call(this, 'rect-解锁'),
    renderDivider(),
    renderMenuItem.call(this, 'rect-置顶'),
    renderMenuItem.call(this, 'rect-置底'),
  ]
}
let renderMenuItem = function (type) {
  let me = this
  let {checkF, doF, text} = this._actionGet(type)
  let jsxProps = {}
  if (checkF.call(this)){
    jsxProps = {
      on_click () {
        doF.call(me)
      }
    }
  }
  else {
    jsxProps = {
      'class_proto-menu-item-disalbed': true,
    }
  }

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