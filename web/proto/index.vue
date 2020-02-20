<style>
*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.proto-rect{
  position: absolute;
  border: 1px solid #000;
}
.proto-rect-resizer {
  position: absolute;
  border: 1px solid blue;
  border-radius: 100%;
  width: 8px;
  height: 8px;
  cursor: pointer;
}
/* test */
button{
  padding: 2px 4px;
}
</style>

<script>
import jsx from 'vue-jsx'
import {
  getRotatePointByCenter,
  getCByABAndAngle,
  getABByPointsAndAngle,
  getAngleByTwoPoints,
  getEffectiveAngle,
  getRadian,
  deepClone,

} from '../base/index'

import {
  getRectInfo,
  getGruopSize,
  getScalePoint,
  getPointsCenter,
  getGroupSize,
  getWH,
} from './base'

import {
  resizeAR,
  resizeBR,
  resizeCR,
  resizeDR,
  resizeA,
  resizeAB,
  resizeB,
  resizeBC,
  resizeC,
  resizeCD,
  resizeD,
  resizeAD,
} from './resize'

let {div, input, button} = jsx

export default {
  data () {
    return {
      rects: [],
      mouse: {
        ing: false,
        left: 0,
        top: 0,
        // move, resize
        eventType: '',
        resizerDir: '',
      },
      currentRects: [],
    }
  },
  methods: {
    _ready () {
      let a = this._createRect(200, 200, 100, 50, 180)
      let b = this._createRect(300, 300, 100, 50, 0)
      let c = this._createRect(300, 300, 100, 30, 30)
      let d = this._createRect(100, 400, 100, 30, 140)
      let g = this._createGroupRect([a, b, d], 0)
      this.rects.push(g)
    },
    _warpRect (rect, type) {
      rect.color = 'black'
      if (type === 'group'){
        rect.color = 'red'
      }

      let model = {
        // 当前数据
        data: rect,
        // 类型
        type,
        // 临时数据，用来中间态计算
        tempData: null,
        // children，如果 group 才有用
        children: [],
      }
      return model
    },
    _createGroupRect (rects, angle = 0) {
      let rect = getGroupSize(rects, angle)
      rect.angle = angle

      let model = this._warpRect(rect, 'group')
      model.children = rects
      return model
    },
    _createRect (left, top, width, height, angle = 0, color = 'black') {
      let rect = {
        left,
        top,
        width,
        height,
        angle,
      }
      return this._warpRect(rect, 'default')
    },
    _rotateRect (rect, angle) {
      rect.data.angle = getEffectiveAngle(rect.data.angle + angle)
    },
    _rotateGroup (group, angle) {
      let groupData = group.data
      groupData.angle = getEffectiveAngle(groupData.angle + angle)
      let groupInfo = getRectInfo(groupData)
      let groupCenter = groupInfo.center

      group.children.forEach(rect => {
        let rectInfo = getRectInfo(rect.data)
        let center = getRotatePointByCenter(groupCenter, rectInfo.center, angle)
        let left = center.left - rectInfo.width / 2
        let top = center.top - rectInfo.height / 2

        rect.data.left = left
        rect.data.top = top

        rect.data.angle = getEffectiveAngle(rect.data.angle + angle)
      })
    },
    _moveRect (rect, x = 0, y = 0) {
      rect.data.left += x
      rect.data.top += x
    },
    _moveGroup (group, x = 0, y = 0) {
      let groupData = group.data
      groupData.left += x
      groupData.top += y

      group.children.forEach(rect => {
        let rectData = rect.data
        rectData.left += x
        rectData.top += y
      })
    },
    _resize (mx, my) {
      let rect = this.currentRects[0]
      let dir = this.mouse.resizerDir
      
      if (!rect || !dir){
        return
      }

      if (rect.type === 'group'){
        this._resizeGroup(rect, dir, mx, my)
      }
      else {
        this._resizeRect(rect, dir, mx, my)
      }
    },
    // a ---- b
    // d ---- c 
    _resizeGroup (group, dir = 'c', mx = 0, my = 0) {
      var resizeFn = {
        'a': resizeAR,
        'b': resizeBR,
        'c': resizeCR,
        'd': resizeDR,
      }[dir]
      var resizeRes = resizeFn(group, mx, my)
      if (resizeRes.available === false){
        return
      }
      let {scale, fixedPoint} = resizeRes

      group.children.forEach(rect => {
        let rectData = rect.data
        let rectInfo = rect.tempData
        let rlt = rectInfo.rotateLeftTop
        let rrb = rectInfo.rotateRightBottom

        let newRlt = getScalePoint(fixedPoint, rlt, scale)
        let newRrb = getScalePoint(fixedPoint, rrb, scale)
        let newCenter = getPointsCenter(newRlt, newRrb)
        let lt = getRotatePointByCenter(newCenter, newRlt, rectData.angle, false)
        let wh = getWH(lt, newCenter)

        rectData.left = lt.left
        rectData.top = lt.top
        rectData.width = wh.width
        rectData.height = wh.height
      })
    },
    // a ---- b
    // d ---- c 
    _resizeRect (rect, dir = 'bc', mx, my) {
      var resizeFn = {
        'a': resizeA,
        'b': resizeB,
        'c': resizeC,
        'd': resizeD,
        'ab': resizeAB,
        'bc': resizeBC,
        'cd': resizeCD,
        'ad': resizeAD,
      }[dir]
      resizeFn(rect, mx, my)
    },
    _renderTest () {
      let me = this
      return div(
        div(
          button({
            on_click () {
              me._testRotateGroup()
            }
          }, 'rotate group'),
          button({
            on_click () {
              me._testMoveGroup()
            }
          }, 'move group'),
          button({
            on_click () {
              me._testDrawGroup()
            }
          }, 'draw group'),
        ),
        div(
          button({
            on_click () {
              me._testRotateRect()
            }
          }, 'rotate rect'),
          button({
            on_click () {
              me._testDrawRect('bc')
            }
          }, 'draw rect bc'),
          button({
            on_click () {
              me._testDrawRect('c')
            }
          }, 'draw rect c')
        ),
        
      )
    },
    _renderRect (rect, idx) {
      let data = rect.data
      let rectType = rect.type
      let jsxProps = {
        'class_proto-rect': true,
        style_left: data.left + 'px',
        style_top: data.top + 'px',
        style_width: data.width + 'px',
        style_height: data.height + 'px',
        'style_border-color': data.color,
        style_color: data.color,
        style_transform: `rotate(${data.angle}deg)`,
      }
      let mouse = this.mouse
      let info = getRectInfo(data)
      let mouseDown = (e) => {
        mouse.ing = true
        mouse.left = e.clientX
        mouse.top = e.clientY
        rect.tempData = deepClone(info)
        if (rectType === 'group'){
          rect.children.forEach(r => {
            r.tempData = deepClone(getRectInfo(r.data))
          })
        }
        mouse.eventType = 'resize'
        this.currentRects = [rect]
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
          mouseDown(e)
        },
      })
      let resizer = [aResizer, bResizer, cResizer, dResizer]
      if (rectType !== 'group'){
        resizer = [...resizer, abResizer, bcResizer, cdResizer, adResizer]
      }

      return div(jsxProps, '#', ...resizer)
    },
    _renderRects () {
      let rects = []
      this.rects.forEach(rect => {
        rects.push(
          this._renderRect(rect)
        )
        if (rect.type === 'group'){
          rect.children.forEach(r => {
            rects.push(
              this._renderRect(r)
            )
          })
        }
      })
      return div({
        'class_proto-rects': true,
      },
        ...rects,
      )
    },
    _renderMain () {
      return div({
        class_proto: true,
      },
        this._renderRects(),
        this._renderTest(),
      )
    },
    _windowMouseEvent () {
      let me = this
      let mouse = this.mouse

      let mousemove = (e) => {
        if (!mouse.ing){
          return
        }
        let left = e.clientX
        let top = e.clientY
        let mx = left - mouse.left
        let my = top - mouse.top

        if (mouse.eventType === 'resize'){
          me._resize(mx, my)
        }
      }
      let mouseup = (e) => {
        if (!mouse.ing){
          return
        }
        mouse.ing = false
      }
      window.addEventListener('mousemove', mousemove)
      window.addEventListener('mouseup', mouseup)
    },
    _testRotateGroup () {
      // 测试旋转 group
      let angle = 40
      this._rotateGroup(this.rects[0], angle)
    },
    _testMoveGroup () {
      // 测试移动 group
      let x = 10
      let y = 2
      this._moveGroup(this.rects[0], x, y)
    },
    _testDrawGroup (dir) {
      // 测试拉伸 group
      let x = 10
      let y = 10
      this._resizeGroup(this.rects[0], dir)
    },
    _testRotateRect () {
      let angle = 10
      this._rotateRect(this.rects[0], angle)
    },
    _testDrawRect (dir) {
      let x = 10
      let y = 10
      this._resizeRect(this.rects[0], dir)
    },
  },
  created () {
    this._ready()
    this._windowMouseEvent()
  },
  render (h) {
    jsx.h = h
    return this._renderMain()
  }
}
</script>