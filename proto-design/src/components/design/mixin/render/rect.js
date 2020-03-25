import jsx from 'vue-jsx'
import {
  selectText,
  percentPx,
  isRightMouse,
} from "@/core/base"
import event from '@/core/event'
let {div} = jsx
let _renderRect = function (rect) {
  let me = this
  let isCurrRect = rect.id === this.currRectId
  let isHoverRect = rect.id === this.hoverRectId
  isHoverRect = isHoverRect || rect.tempGroupId
  let rectType = rect.type
  let mouse = this.mouse
  let mousedown = (e) => {
    this._focusRect(rect, e)
    e.stopPropagation()
  }
  // 容器
  let jsxProps = {
    ...this._getRectBaseJsxProps(rect),
    'class_proto-rect': true,
    'class_proto-rect-hover': isHoverRect && !isCurrRect,
    'class_proto-rect-focus': isCurrRect,
    [`class_proto-${rectType}`]: true,
    'attrs_id': rect.id,
    'attrs_index': rect.index,
    on_mousedown (e) {
      if (me._checkIsTempGroup(rect)){
        return
      }
      mouse.eventType = 'move'
      if (rect.data.isEdit) {
        mouse.eventType = ''
      }
      mousedown(e)
      // 右键判断
      if (isRightMouse(e)){
        me.contextmenu.e = e
        me.contextmenu.eventType = 'rect'
        me.contextmenu.show = true
      }
      else {
        event.$emit('windowMouseDown', e)
      }
    },
    on_mousemove () {
      me._hoverRect(rect)
    },
    on_mouseout () {
      me._hoverOffRect()
    },
  }
  let children = []
  if (!this._checkIsGroupLike(rect)){
    jsxProps['on_dblclick'] = (e) => {
      me._focusRect(rect, e)
      mouse.ing = false
    }
    children = [this._renderRectInner(rect)]
  }
  return div(jsxProps,  ...children)
}
// 普通矩形
let _renderRectInner = function (rect) {
  let me = this
  let isEdit = rect.data.isEdit
  let data = rect.data
  let isLine = rect.type === 'rect-line'
  let jsxProps = {
    'class_proto-rect-inner': true,
  }
  let children = []
  if (isLine) {
    jsxProps = {
      ...jsxProps,
      'style_border-top-width': data.borderWidth + 'px',
      'style_border-top-style': data.borderStyle,
      'style_border-top-color': data.borderColor,
    }
  }
  else {
    jsxProps = {
      ...jsxProps,
      'style_border-width': data.borderWidth + 'px',
      'style_border-style': data.borderStyle,
      'style_border-color': data.borderColor,
      'style_background-color': data.backgroundColor,
      'style_border-radius': percentPx(data.borderRadius),
    }
    let textJsxProps = {
      'class_proto-rect-inner-text': true,
      'attrs_contenteditable': false,
      'style_color': data.color,
      'style_font-size': data.fontSize + 'px',
      'style_font-family': data.fontFamily,
    }
    if (isEdit) {
      textJsxProps = {
        ...textJsxProps,
        style_cursor: 'text',
        ref: 'defaultText',
        attrs_contenteditable: true,
        style_transform: `rotate(-${data.angle}deg)`,
        on_blur () {
          me._commandRectDataPropUpdate(rect, 'isEdit', false)
        },
        on_focus () {
          me.$refs.defaultText.innerHTML = data.text
          selectText(me.$refs.defaultText)
          me._updateRectTempData(rect)
        },
        on_input (e) {
          let text = e.target.innerHTML
          if (data.isAutoSize){
            me._resizeText(rect, text)
          }
          me._commandRectDataPropUpdate(rect, 'text', text)
          me._historyPush()
        }
      }
      setTimeout( () => {
        if (this.$refs.defaultText){
          this.$refs.defaultText.focus()
        }
      })
    }
    else {
      textJsxProps = {
        ...textJsxProps,
        'domProps_innerHTML': data.text,
      }
    }
    children = [div(textJsxProps)]
  }
  
  return div(jsxProps, ...children)
}
let _renderRects = function () {
  let rects = []
  this._getRectsByPage().forEach(rect => {
    if (!this._checkIsRectLike(rect)){
      return
    }
    rects.push(
      this._renderRect(rect)
    )
  })
  return div({
    'class_proto-canvas': true,
  },
    div({
      'class_proto-zoom': true,
      'style_transform': `scale(${this.scale})`,
    },
      ...rects,
    )
  )
}
export {
  _renderRects,
  _renderRect,
  _renderRectInner,
}