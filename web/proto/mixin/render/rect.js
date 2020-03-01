import jsx from 'vue-jsx'
import {
  getTextSize,
  selectText,
  percentPx,
  tNumber,
} from '../../core/base'
let {div} = jsx
let _renderRect = function (rect) {
  let me = this
  let isCurrRect = this.currRects[0] && (rect.id === this.currRects[0].id)
  let isHoverRect = this.hoverRects[0] && (rect.id === this.hoverRects[0].id)
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
    [`class_proto-rect-${rectType}`]: true,
    'attrs_id': rect.id,
    on_mousedown (e) {
      if (rectType === 'tempGroup'){
        return
      }
      mouse.eventType = 'move'
      mousedown(e)
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
  let isLine = rect.type === 'line'
  let jsxProps = {
    'class_proto-rect-inner': true,
    style_color: data.color,
    
  }
  let children = []
  if (isLine) {
    jsxProps = {
      ...jsxProps,
      'style_border-top-width': data.borderWidth + 'px',
      'style_border-top-style': data.borderStyle,
      'style_border-top-color': data.backgroundColor,
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
      'domProps_innerHTML': data.text,
    }
    if (isEdit) {
      textJsxProps = {
        ...textJsxProps,
        ref: 'defaultText',
        attrs_contenteditable: true,
        style_transform: `rotate(-${data.angle}deg)`,
        on_blur (e) {
          data.text = e.target.innerHTML
        },
        on_focus () {
          selectText(me.$refs.defaultText)
          me._updateRectTempData(rect)
        },
        on_input (e) {
          let text = e.target.innerHTML
          if (data.isAutoSize){
            let size = getTextSize(text)
            let newWidth = tNumber(size.width) + 4
            me._resizeWidthTo(rect, newWidth)
            let newHeight = tNumber(size.height) + 4
            me._resizeHeightTo(rect, newHeight)
          }
        }
      }
      this.$nextTick( () => {
        this.$refs.defaultText.focus()
      })
      children = [div(textJsxProps)]
    }
  }
  
  return div(jsxProps, ...children)
}
let _renderRects = function () {
  let rects = []
  this.rects.forEach(rect => {
    rects.push(
      this._renderRect(rect)
    )
  })
  return div({
    'class_proto-canvas': true,
  },
    ...rects,
  )
}
export {
  _renderRects,
  _renderRect,
  _renderRectInner,
}