import jsx from 'vue-jsx'
import {
  getRectInfo,
  getMousePoint,
} from '../core/base'

let {div, span} = jsx

export default {
  methods: {
    // 开始鼠标操作前进行一些准备
    _readyMouse (rect, e) {
      let mouse = this.mouse
      let mousePoint = getMousePoint(e)
      mouse.startLeft = mouse.currLeft = mousePoint.left
      mouse.startTop = mouse.currTop = mousePoint.top
      this.rects.forEach(_rect => {
        _rect.tempData = getRectInfo(_rect.data)
      })
      this.currRects = [rect]
      this._updateGuide()
    },
    _renderRect (rect) {
      let data = rect.data
      let rectType = rect.type
      let mouse = this.mouse
      let mouseDown = (e) => {
        mouse.ing = true
        this._readyMouse(rect, e)
        e.stopPropagation()
      }
      let resizerJsx = {
        'class_proto-rect-resizer': true,
      }
      // 左上角调整器 a
      let aResizer = div({
        ...resizerJsx,
        style_left: -4 + 'px',
        style_top: -4 + 'px',
        on_mousedown (e) {
          mouse.resizerDir = 'a'
          mouse.eventType = 'resize'
          mouseDown(e)
        },
      })
      // ab
      let abResizer = div({
        ...resizerJsx,
        style_left: '50%',
        style_top: -4 + 'px',
        on_mousedown (e) {
          mouse.resizerDir = 'ab'
          mouse.eventType = 'resize'
          mouseDown(e)
        },
      })
      // 右上角 b
      let bResizer = div({
        ...resizerJsx,
        style_right: -4 + 'px',
        style_top: -4 + 'px',
        on_mousedown (e) {
          mouse.resizerDir = 'b'
          mouse.eventType = 'resize'
          mouseDown(e)
        },
      })
      // bc
      let bcResizer = div({
        ...resizerJsx,
        style_right: -4 + 'px',
        style_top: '50%',
        on_mousedown (e) {
          mouse.resizerDir = 'bc'
          mouse.eventType = 'resize'
          mouseDown(e)
        },
      })
      // 右下角 c
      let cResizer = div({
        ...resizerJsx,
        style_right: -4 + 'px',
        style_bottom: -4 + 'px',
        on_mousedown (e) {
          mouse.resizerDir = 'c'
          mouse.eventType = 'resize'
          mouseDown(e)
        },
      })
      // cd
      let cdResizer = div({
        ...resizerJsx,
        style_left: '50%',
        style_bottom: -4 + 'px',
        on_mousedown (e) {
          mouse.resizerDir = 'cd'
          mouse.eventType = 'resize'
          mouseDown(e)
        },
      })
      // 左下角 d
      let dResizer = div({
        ...resizerJsx,
        style_left: -4 + 'px',
        style_bottom: -4 + 'px',
        on_mousedown (e) {
          mouse.resizerDir = 'd'
          mouse.eventType = 'resize'
          mouseDown(e)
        },
      })
      // ad
      let adResizer = div({
        ...resizerJsx,
        style_left: -4 + 'px',
        style_bottom:  '50%',
        on_mousedown (e) {
          mouse.resizerDir = 'ad'
          mouse.eventType = 'resize'
          mouseDown(e)
        },
      })
      let resizer = [aResizer, bResizer, cResizer, dResizer]
      resizer = [...resizer, abResizer, bcResizer, cdResizer, adResizer]

      // 旋转器
      let rotater = div({
        'class_proto-rect-rotater': true,
        style_left: '50%',
        style_top: '-15px',
        on_mousedown (e) {
          mouse.eventType = 'rotate'
          mouseDown(e)
        },
      })

      // 容器
      let jsxProps = {
        'class_proto-rect': true,
        style_left: data.left + 'px',
        style_top: data.top + 'px',
        style_width: data.width + 'px',
        style_height: data.height + 'px',
        'style_border-color': data.color,
        style_color: data.color,
        'style_z-index': data.zIndex,
        style_transform: `rotate(${data.angle}deg)`,
        on_mousedown (e) {
          mouse.eventType = 'move'
          mouseDown(e)
        },
      }
      return div(jsxProps, '#', ...resizer, rotater)
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
    _renderMain () {
      return div({
        class_proto: true,
      },
        this._renderRects(),
        this._renderGuideShow(),
        this._renderLeft(),
      )
    },
  }
}