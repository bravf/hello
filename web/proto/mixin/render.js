import jsx from 'vue-jsx'
import {
} from '../core/base'

let {div, span,  input} = jsx

export default {
  methods: {
    _renderHandler () {
      let rect = this.currRects[0]
      if (!rect){
        return
      }
      let mouse = this.mouse
      let mousedown = (e) => {
        this._focusRect(rect, e)
        e.stopPropagation()
      }
      let resizerJsx = {
        'class_proto-rect-resizer': true,
      }
      let b = 4
      let a = `calc(50% - ${b}px)`
      // 左上角调整器 a
      let aResizer = div({
        ...resizerJsx,
        style_left: -b + 'px',
        style_top: -b + 'px',
        on_mousedown (e) {
          mouse.resizerDir = 'a'
          mouse.eventType = 'resize'
          mousedown(e)
        },
      })
      // ab
      let abResizer = div({
        ...resizerJsx,
        style_left: a,
        style_top: -b + 'px',
        on_mousedown (e) {
          mouse.resizerDir = 'ab'
          mouse.eventType = 'resize'
          mousedown(e)
        },
      })
      // 右上角 b
      let bResizer = div({
        ...resizerJsx,
        style_right: -b + 'px',
        style_top: -b + 'px',
        on_mousedown (e) {
          mouse.resizerDir = 'b'
          mouse.eventType = 'resize'
          mousedown(e)
        },
      })
      // bc
      let bcResizer = div({
        ...resizerJsx,
        style_right: -b + 'px',
        style_top: a,
        on_mousedown (e) {
          mouse.resizerDir = 'bc'
          mouse.eventType = 'resize'
          mousedown(e)
        },
      })
      // 右下角 c
      let cResizer = div({
        ...resizerJsx,
        style_right: -b + 'px',
        style_bottom: -b + 'px',
        on_mousedown (e) {
          mouse.resizerDir = 'c'
          mouse.eventType = 'resize'
          mousedown(e)
        },
      })
      // cd
      let cdResizer = div({
        ...resizerJsx,
        style_left: a,
        style_bottom: -b + 'px',
        on_mousedown (e) {
          mouse.resizerDir = 'cd'
          mouse.eventType = 'resize'
          mousedown(e)
        },
      })
      // 左下角 d
      let dResizer = div({
        ...resizerJsx,
        style_left: -b + 'px',
        style_bottom: -b + 'px',
        on_mousedown (e) {
          mouse.resizerDir = 'd'
          mouse.eventType = 'resize'
          mousedown(e)
        },
      })
      // ad
      let adResizer = div({
        ...resizerJsx,
        style_left: -b + 'px',
        style_bottom: a,
        on_mousedown (e) {
          mouse.resizerDir = 'ad'
          mouse.eventType = 'resize'
          mousedown(e)
        },
      })
      let resizer = [aResizer, bResizer, cResizer, dResizer]
      resizer = [...resizer, abResizer, bcResizer, cdResizer, adResizer]

      // 旋转器
      let rotater = div({
        'class_proto-rect-rotater': true,
        style_left: a,
        style_top: '-15px',
        on_mousedown (e) {
          mouse.eventType = 'rotate'
          mousedown(e)
        },
      })
      // 拖动器
      let jsxProps = {
        ...this._getRectBaseJsxProps(rect),
        'class_proto-rect-handler': true,
        'style_z-index': this.zIndex + 1,
      }
      return div(jsxProps, [...resizer, rotater])
    },
    _renderRect (rect) {
      let me = this
      let isCurrRect = this.currRects[0] && (rect.id === this.currRects[0].id)
      let isHoverRect = this.hoverRects[0] && (rect.id === this.hoverRects[0].id)
      let innerData = rect.innerData
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
        [`class_proto-rect-${rectType}`]: true,
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

      if (!this._checkIsGroupLike(rect)){
        jsxProps['on_dblclick'] = (e) => {
          me._focusRect(rect, e)
          mouse.ing = false
        }
      }
      // 真实元素
      let innerJsxProps = {
        'class_proto-rect-inner': true,
        style_color: innerData.color,
        'style_background-color': innerData.backgroundColor,
        'style_border-radius': innerData.borderRadius + 'px',
      }
      let inner = div(innerJsxProps, innerData.text || null)
      let children = []
      if (!this._checkIsGroupLike(rect)){
        children = [inner]
      }
      if (isCurrRect){
        children = [...children]
      }
      return div(jsxProps,  ...children)
    },
    _renderRects () {
      let rects = []
      this.rects.forEach(rect => {
        rects.push(
          this._renderRect(rect)
        )
      })
      return div({
        'class_proto-canvas': true,
        ref: 'canvas',
      },
        ...rects,
      )
    },
    _renderGuideShow () {
      return [
        ...Array.from(this.guide.show.top).map(top => {
          return div({
            'class_proto-guide': true,
            'class_proto-guide-top': true,
            style_top: top + 'px',
          })
        }),
        ...Array.from(this.guide.show.left).map(left => {
          return div({
            'class_proto-guide': true,
            'class_proto-guide-left': true,
            style_left: left + 'px',
          })
        }),
      ]
    },
    _renderLeft () {
      let me = this
      let rectButtons = ['rect'].map(type => {
        return span({
          on_mousedown () {
            me.mouse.eventType = 'create'
            me.mouse.createType = 'rect'
            me.mouse.ing = true
          },
        },type)
      })
      return div({
        'class_proto-left': true,
      },
        div({
          'class_proto-buttons': true,
        },
        ...rectButtons,
        )
      )
    },
    _renderSetting () {
      let me = this
      let jsxProps = {
        'class_proto-setting': true,
        on_mousedown (e) {
          e.stopPropagation()
        }
      }
      let rect = this.currRects[0]
      let children = []
      let setting = this.setting

      if (rect){
        let data = rect.data
        let innerData = rect.innerData
        // size box
        let sizeBox = div({'class_proto-setting-box': true,},
          ...[
            {
              prop: 'left',
              emitF: '_moveLeftTo',
            },
            {
              prop: 'top',
              emitF: '_moveTopTo',
            },
            {
              prop: 'width',
              emitF: '_resizeWidthTo',
              checkValueF (value) {
                return Math.max(value, 0)
              },
            },
            {
              prop: 'height',
              emitF: '_resizeHeightTo',
              checkValueF (value) {
                return Math.max(value, 0)
              },
            },
            {
              prop: 'angle',
              emitF: '_rotateTo',
              checkValueF (value) {
                value = value % 360
                if (value < 0){
                  return 360 + value
                }
                return value
              },
            }
          ].map(o => {
            let prop = o.prop
            let inputJsxProps = {
              domProps_value: (prop === setting.prop) ? setting.value : data[prop],
              domProps_type: 'number',
              domProps_min: o['min'],
              on_focus (e) {
                me._updateRectTempData(rect)
                setting.prop = prop
                setting.value = data[prop]
              },
              on_change (e) {
                let value = e.target.value
                if ('checkValueF' in o){
                  value = o.checkValueF(value)
                }
                setting['value'] = value
                me[o['emitF']].call(me, value)
              },
            }
            return div({'class_proto-setting-box-item': true},
              span(prop),
              input(inputJsxProps)
            )
          })
        )
        children = [...children, sizeBox]
      }
      return div(jsxProps, ...children)
    },
    _renderMain () {
      return div({
        class_proto: true,
      },
        this._renderRects(),
        this._renderGuideShow(),
        this._renderHandler(),
        this._renderLeft(),
        this._renderSetting(),
      )
    },
  }
}