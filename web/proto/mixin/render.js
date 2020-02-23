import jsx from 'vue-jsx'
import {
  getRectInfo,
  deepClone,
} from '../core/base'

let {div} = jsx
let doc = document.documentElement

export default {
  methods: {
    _renderRect (rect) {
      let data = rect.data
      let rectType = rect.type
      let mouse = this.mouse
      let info = getRectInfo(data)
      let mouseDown = (e) => {
        mouse.ing = true
        mouse.startLeft = mouse.currTop = e.clientX + doc.scrollLeft
        mouse.startTop = mouse.currTop = e.clientY + doc.scrollTop
        rect.tempData = deepClone(info)
        if (rectType === 'group'){
          rect.children.forEach(id => {
            let rect = this._getRectById(id)
            rect.tempData = deepClone(getRectInfo(rect.data))
          })
        }
        this.currentRects = [rect]
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
      // if (rectType !== 'group'){
      //   resizer = [...resizer, abResizer, bcResizer, cdResizer, adResizer]
      // }
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

      if (rectType !== 'group'){
        resizer = []
        rotater = null
      }

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
    _renderMain () {
      return div({
        class_proto: true,
      },
        this._renderRects(),
      )
    },
  }
}