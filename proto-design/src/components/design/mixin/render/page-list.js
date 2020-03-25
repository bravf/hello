import jsx from 'vue-jsx'
// import event from '@/core/event'
import {
  isRightMouse,
} from '@/core/base'
let { div, input } = jsx
let _renderPageListItem = function (page, z) {
  let me = this
  let currPage = this.objects[this.currPageId]
  let currPageIsParent = this._linkedListCheckIsParent(currPage, page)
  let isHover = currPage === page
  let paddingLeft = 16
  let isNameEdit = page.isNameEdit
  let isDrag = this.mouse.ing && (this.mouse.eventType === 'movePage') && !isHover && !currPageIsParent
  let jsxProps = {
    'class_proto-tree-item': true,
    'class_proto-tree-item-drag': isDrag,
  }
  let innerJsxProps = {
    'class_proto-tree-item-inner': true,
    'class_proto-tree-item-hover': isHover,
    'style_padding-left': paddingLeft * z + 'px',
  }
  let children = []
  if (isNameEdit){
    children = [
      div(innerJsxProps,
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
      ),
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
        else {
          me.mouse.ing = true
          me.mouse.eventType = 'movePage'
        }
      },
    }
    innerJsxProps = {
      ...innerJsxProps,
      'class_proto-tree-item-emit-hover': !this.mouse.ing,
    }
    if (isDrag) {
      let f = () => {
        me._linkedListRemove(me.objects[currPage.parentId], currPage, 'pages')
      }
      children = [
        div('.proto-tree-item-drag-handler proto-tree-item-drag-handler-bottom', {
          'on_mouseup' () {
            f()
            currPage.parentId = page.parentId
            me._linkedListInsertAfter(me.objects[page.parentId], page, currPage, 'pages')
          }
        }),
      ]
      if (!page.prevId){
        children = [
          ...children,
          div('.proto-tree-item-drag-handler proto-tree-item-drag-handler-top', {
            'on_mouseup' () {
              f()
              currPage.parentId = page.parentId
              me._linkedListInsertBefore(me.objects[page.parentId],page, currPage, 'pages')
            }
          }),
        ]
      }
      innerJsxProps = {
        ...innerJsxProps,
        'on_mouseup' () {
          f()
          currPage.parentId = page.id
          me._linkedListAppend(page, currPage, 'pages')
        }
      }
    }
    children = [
      ...children,
      div(innerJsxProps, page.name)
    ]
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