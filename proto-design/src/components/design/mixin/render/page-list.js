import jsx from 'vue-jsx'
// import event from '@/core/event'
import {
  isRightMouse,
} from '@/core/base'
let { div, input } = jsx
let _renderPageListItem = function (page, z) {
  let me = this
  let isHover = this.currPageId === page.id
  let paddingLeft = 16
  let isNameEdit = page.isNameEdit
  let jsxProps = {
    'class_proto-tree-item': true,
    'style_padding-left': paddingLeft * z + 'px',
    'class_proto-tree-item-hover': isHover,
  }
  let children = [page.name]
  if (isNameEdit){
    children = [
      input('.form-input input-sm', {
        domProps_value: page.name,
        ref: 'pageInput',
        key: 'pageInput',
        on_focus () {
          me.$refs.pageInput.select()
        },
        on_blur () {
          me._commandObjectPropUpdate(page, 'isNameEdit', false)
          me._historyPush()
        },
        on_change () {
          me.$refs.pageInput.blur()
        },
        on_input (e) {
          let value = e.target.value
          me._commandObjectPropUpdate(page, 'name', value)
        }
      })
    ]
    setTimeout (() => {
      if (me.$refs.pageInput){
        me.$refs.pageInput.focus()
      }
    })
  }
  else {
    jsxProps = {
      ...jsxProps,
      'on_mousedown' (e) {
        e.stopPropagation()
        me._updateCurrPage(page)
        if (isRightMouse(e)) {
          me.contextmenu.e = e
          me.contextmenu.eventType = 'page'
          me.contextmenu.show = true
        }
      },
    }
  }
  return div(jsxProps, ...children)
}
let _renderPageList = function () {
  let children = []
  this._linkedListWalk(this.objects[this.currProjectId], 'pages', (page, z) => {
    children.push(_renderPageListItem.call(this, page, z))
  })
  return div('.proto-page-list proto-tree card',
    div('.card-header',
      div('.card-title h6', '页面')
    ),
    div('.card-body',
      ...children,
    )
  )
}
export {
  _renderPageList,
}