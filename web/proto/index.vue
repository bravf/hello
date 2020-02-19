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
      test: {
        value: '',
      },
    }
  },
  methods: {
    _ready () {
      let a = this._createRect(200, 200, 100, 50, 30)
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
      let rect = this._getGroupSize(rects, angle)
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
    _getRectInfo (rectData) {
      let {left, top, width, height, angle} = rectData
      let center = {
        left: left + width / 2,
        top: top + height / 2,
      }
      let leftTop = {
        left,
        top,
      }
      let leftBottom = {
        left,
        top: top + height
      }
      let rightTop = {
        left: left + width,
        top,
      }
      let rightBottom = {
        left: left + width,
        top: top + height,
      }

      let rotateLeftTop = getRotatePointByCenter(center, leftTop, angle)
      let ra = rotateLeftTop

      let rotateLeftBottom = getRotatePointByCenter(center, leftBottom, angle)
      let rd = rotateLeftBottom

      let rotateRightTop = getRotatePointByCenter(center, rightTop, angle)
      let rb = rotateRightTop

      let rotateRightBottom = getRotatePointByCenter(center, rightBottom, angle)
      let rc = rotateRightBottom

      return {
        center,
        leftTop,
        leftBottom,
        rightTop,
        rightBottom,
        rotateRightTop,
        rotateLeftTop,
        rotateLeftBottom,
        rotateRightBottom,
        ra,
        rb,
        rc,
        rd,
        ...rectData,
      }
    },
    _getGroupSize (rects, angle) {
       // 得到所有矩形的点的真实坐标
      let points = []
      rects.forEach(rect => {
        let info = this._getRectInfo(rect.data)
        points = [
          ...points,

          info.rotateLeftTop,
          info.rotateRightTop,
          info.rotateLeftBottom,
          info.rotateRightBottom,
        ]
      })
      // 根据上面的点得到4个点
      let ab = getABByPointsAndAngle(points, angle)
      // 得到 group 左上角的点
      let rlt = getCByABAndAngle(
        ab.a,
        ab.b,
        angle
      )
      // 得到 group 右下角的点
      let rrb = getCByABAndAngle(
        ab.a2,
        ab.b2,
        angle,
      )
      // 计算中心点
      let center = {
        left: rlt.left + (rrb.left - rlt.left) / 2,
        top: rrb.top - (rrb.top - rlt.top) / 2,
      }
      // 根据角度判断 rlt,rrb 谁是 lt 的真实坐标
      // 得到 lt, lt是罗辑坐标点
      let lt = getRotatePointByCenter(
        center, 
        (angle > 90 && angle <= 270)
          ? rrb
          : rlt,
        angle,
        false,
      )
      let width = Math.abs(center.left - lt.left) * 2
      let height = Math.abs(center.top - lt.top) * 2

      return {
        left: lt.left,
        top: lt.top,
        width,
        height,
      }
    },
    // 已知a,b两点，a固定，b到a的距离放大 m 倍
    // 求等比放大后 b 点的位置
    _getScalePoint (a, b, m) {
      return {
        left: (b.left - a.left) * m + a.left,
        top: (b.top - a.top) * m + a.top,
      }
    },
    _getPointsCenter (a, b) {
      return {
        left: a.left + (b.left - a.left) / 2,
        top: a.top + (b.top - a.top) / 2,
      }
    },
    _getWH (a, c) {
      return {
        width: Math.abs(c.left - a.left) * 2,
        height: Math.abs(c.top - a.top) * 2,
      }
    },
    _rotateRect (rect, angle) {
      rect.data.angle = getEffectiveAngle(rect.data.angle + angle)
    },
    _rotateGroup (group, angle) {
      let groupData = group.data
      groupData.angle = getEffectiveAngle(groupData.angle + angle)
      let groupInfo = this._getRectInfo(groupData)
      let groupCenter = groupInfo.center

      group.children.forEach(rect => {
        let rectInfo = this._getRectInfo(rect.data)
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
      let gruopData = group.data
      let groupTempInfo = group.tempData
      let groupRadian = getRadian(groupTempInfo.angle)
      let groupTempWidth = groupTempInfo.width
      let groupTempHeight = groupTempInfo.height
      
      let groupFixPoint
      let scale

      if (dir === 'a'){
        let widthDiff = -Math.cos(groupRadian) * mx - Math.sin(groupRadian) * my
        // 检查 width 别小于 10
        if (widthDiff + groupTempWidth <= 20){
          return
        }
        scale = (widthDiff + groupTempWidth) / groupTempWidth
        let rlt = groupTempInfo.rotateLeftTop
        let rrb = groupTempInfo.rotateRightBottom
        let newRlt = this._getScalePoint(rrb, rlt, scale)
        // 新的中心点
        let newCenter = this._getPointsCenter(newRlt, rrb)
        // 求新的left, top
        let newLt = getRotatePointByCenter(newCenter, newRlt, groupTempInfo.angle, false)
        let wh = this._getWH(newLt, newCenter)

        gruopData.left = newLt.left
        gruopData.top = newLt.top
        gruopData.width = wh.width
        gruopData.height = wh.height
        groupFixPoint = rrb
      }
      else if (dir === 'b'){
        let widthDiff = Math.cos(groupRadian) * mx - Math.sin(groupRadian) * my
        // 检查 width 别小于 10
        if (widthDiff + groupTempWidth <= 20){
          return
        }
        scale = (widthDiff + groupTempWidth) / groupTempWidth
        let rrt = groupTempInfo.rotateRightTop
        let rlb = groupTempInfo.rotateLeftBottom
        let newRrt = this._getScalePoint(rlb, rrt, scale)
        // 新的中心点
        let newCenter = this._getPointsCenter(rlb, newRrt)
        // 求新的right, top
        let newRt = getRotatePointByCenter(newCenter, newRrt, groupTempInfo.angle, false)
        let wh = this._getWH(newRt, newCenter)
        let newLt = {
          left: newRt.left - wh.width,
          top: newRt.top
        }

        gruopData.left = newLt.left
        gruopData.top = newLt.top
        gruopData.width = wh.width
        gruopData.height = wh.height
        groupFixPoint = rlb
      }
      else if (dir === 'c'){
        let widthDiff = Math.cos(groupRadian) * mx + Math.sin(groupRadian) * my
        // 检查 width 别小于 10
        if (widthDiff + groupTempWidth <= 20){
          return
        }
        scale = (widthDiff + groupTempWidth) / groupTempWidth

        let rlt = groupTempInfo.rotateLeftTop
        let rrb = groupTempInfo.rotateRightBottom
        let newRrb = this._getScalePoint(rlt, rrb, scale)
        // 新的中心点
        let newCenter = this._getPointsCenter(rlt, newRrb)
        // 求新的left, top
        let newLt = getRotatePointByCenter(newCenter, rlt, groupTempInfo.angle, false)
        let wh = this._getWH(newLt, newCenter)

        gruopData.left = newLt.left
        gruopData.top = newLt.top
        gruopData.width = wh.width
        gruopData.height = wh.height
        groupFixPoint = rlt
      }
      else if (dir === 'd'){
        let widthDiff = -Math.cos(groupRadian) * mx + Math.sin(groupRadian) * my
        // 检查 width 别小于 10
        if (widthDiff + groupTempWidth <= 20){
          return
        }
        scale = (widthDiff + groupTempWidth) / groupTempWidth
        let rrt = groupTempInfo.rotateRightTop
        let rlb = groupTempInfo.rotateLeftBottom
        let newRlb = this._getScalePoint(rrt, rlb, scale)
        // 新的中心点
        let newCenter = this._getPointsCenter(rrt, newRlb)
        // 求新的right, top
        let newRt = getRotatePointByCenter(newCenter, rrt, groupTempInfo.angle, false)
        let wh = this._getWH(newRt, newCenter)
        let newLt = {
          left: newRt.left - wh.width,
          top: newRt.top
        }

        gruopData.left = newLt.left
        gruopData.top = newLt.top
        gruopData.width = wh.width
        gruopData.height = wh.height
        groupFixPoint = rrt
      }

      group.children.forEach(rect => {
        let rectData = rect.data
        let rectInfo = rect.tempData
        let rlt = rectInfo.rotateLeftTop
        let rrb = rectInfo.rotateRightBottom

        let newRlt = this._getScalePoint(groupFixPoint, rlt, scale)
        let newRrb = this._getScalePoint(groupFixPoint, rrb, scale)
        let newCenter = this._getPointsCenter(newRlt, newRrb)
        let lt = getRotatePointByCenter(newCenter, newRlt, rectData.angle, false)
        let wh = this._getWH(lt, newCenter)

        rectData.left = lt.left
        rectData.top = lt.top
        rectData.width = wh.width
        rectData.height = wh.height
      })
    },
    // a ---- b
    // d ---- c 
    _resizeRect (rect, dir = 'bc', mx, my) {
      let data = rect.data
      let tempInfo = rect.tempData //this._getRectInfo(data)
      let radian = getRadian(tempInfo.angle)

      if (dir === 'a'){
        let rlt = tempInfo.rotateLeftTop
        let rrb = tempInfo.rotateRightBottom
        // 求新的 rlt 坐标
        let newRlt = {
          left: rlt.left + mx,
          top: rlt.top + my,
        }
        // 新的中心点
        let newCenter = this._getPointsCenter(newRlt, rrb)
        // 求新的left, top
        let newLt = getRotatePointByCenter(newCenter, newRlt, tempInfo.angle, false)
        let wh = this._getWH(newLt, newCenter)
        data.left = newLt.left
        data.top = newLt.top
        data.width = wh.width
        data.height = wh.height
      }
      else if (dir === 'ab'){
        // 求变化的高度
        let heightDiff = Math.sin(radian) * mx - Math.cos(radian) * my
        let newHeight = tempInfo.height + heightDiff
        // 求新的 rlt 坐标
        let rlt = tempInfo.rotateLeftTop
        let rrb = tempInfo.rotateRightBottom
        let newRlt = {
          left: rlt.left + Math.sin(radian) * heightDiff,
          top: rlt.top - Math.cos(radian) * heightDiff,
        }
        // 新的中心点
        let newCenter = this._getPointsCenter(newRlt, rrb)
        // 求新的left, top
        let newLt = getRotatePointByCenter(newCenter, newRlt, tempInfo.angle, false)

        data.left = newLt.left
        data.top = newLt.top
        data.height = newHeight
      }
      if (dir === 'b'){
        let rlb = tempInfo.rotateLeftBottom
        let rrt = tempInfo.rotateRightTop
        // 求新的 rrt 坐标
        let newRrt = {
          left: rrt.left + mx,
          top: rrt.top + my,
        }
        // 新的中心点
        let newCenter = this._getPointsCenter(rlb, newRrt)
        // 求新的 rt
        let newRt = getRotatePointByCenter(newCenter, newRrt, tempInfo.angle, false)
        let wh = this._getWH(newRt, newCenter)
        data.left = newRt.left - wh.width
        data.top = newRt.top
        data.width = wh.width
        data.height = wh.height
      }
      else if (dir === 'bc'){
        // 求变化的宽度
        let widthDiff = Math.cos(radian) * mx + Math.sin(radian) * my
        let newWidth = tempInfo.width + widthDiff
        // 求新的 rrb 坐标
        let rlt = tempInfo.rotateLeftTop
        let rrb = tempInfo.rotateRightBottom
        let newRrb = {
          left: rrb.left + Math.cos(radian) * widthDiff,
          top: rrb.top + Math.sin(radian) * widthDiff,
        }
        // 新的中心点
        let newCenter = this._getPointsCenter(rlt, newRrb)
        // 求新的left, top
        let newLt = getRotatePointByCenter(newCenter, rlt, tempInfo.angle, false)

        data.left = newLt.left
        data.top = newLt.top
        data.width = newWidth
      }
      else if (dir === 'c'){
        let rlt = tempInfo.rotateLeftTop
        let rrb = tempInfo.rotateRightBottom
        // 求新的 rrb 坐标
        let newRrb = {
          left: rrb.left + mx,
          top: rrb.top + my,
        }
        // 新的中心点
        let newCenter = this._getPointsCenter(rlt, newRrb)
        // 求新的left, top
        let newLt = getRotatePointByCenter(newCenter, rlt, tempInfo.angle, false)
        let wh = this._getWH(newLt, newCenter)
        data.left = newLt.left
        data.top = newLt.top
        data.width = wh.width
        data.height = wh.height
      }
      else if (dir === 'cd'){
        // 求变化的高度
        let heightDiff = -Math.sin(radian) * mx + Math.cos(radian) * my
        let newHeight = tempInfo.height + heightDiff
        // 求新的 rlt 坐标
        let rrt = tempInfo.rotateRightTop
        let rlb = tempInfo.rotateLeftBottom
        let newRlb = {
          left: rlb.left - Math.sin(radian) * heightDiff,
          top: rlb.top + Math.cos(radian) * heightDiff,
        }
        // 新的中心点
        let newCenter = this._getPointsCenter(newRlb, rrt)
        // 求新的left, top
        let newRt = getRotatePointByCenter(newCenter, rrt, tempInfo.angle, false)

        data.left = newRt.left - tempInfo.width
        data.top = newRt.top
        data.height = newHeight
      }
      else if (dir === 'd'){
        let rlb = tempInfo.rotateLeftBottom
        let rrt = tempInfo.rotateRightTop
        // 求新的 rrt 坐标
        let newRlb = {
          left: rlb.left + mx,
          top: rlb.top + my,
        }
        // 新的中心点
        let newCenter = this._getPointsCenter(newRlb, rrt)
        // 求新的 rt
        let newRt = getRotatePointByCenter(newCenter, rrt, tempInfo.angle, false)
        let wh = this._getWH(newRt, newCenter)
        data.left = newRt.left - wh.width
        data.top = newRt.top
        data.width = wh.width
        data.height = wh.height
      }
      else if (dir === 'ad'){
        // 求变化的宽度
        let widthDiff = -Math.cos(radian) * mx - Math.sin(radian) * my
        let newWidth = tempInfo.width + widthDiff
        // 求新的 rrb 坐标
        let rlt = tempInfo.rotateLeftTop
        let rrb = tempInfo.rotateRightBottom
        let newRlt = {
          left: rlt.left - Math.cos(radian) * widthDiff,
          top: rlt.top - Math.sin(radian) * widthDiff,
        }
        // 新的中心点
        let newCenter = this._getPointsCenter(rrb, newRlt)
        // 求新的left, top
        let newLt = getRotatePointByCenter(newCenter, newRlt, tempInfo.angle, false)

        data.left = newLt.left
        data.top = newLt.top
        data.width = newWidth
      }
    },
    _checkWh (width = 20, height = 20) {
      var min = 20
      if (width < min || height < min){
        return false
      }
      return true
    },
    _renderTest () {
      let me = this
      return div(
        // input({
        //   vmodel: [this, 'test.value'],
        // }),
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
      let info = this._getRectInfo(data)
      let mouseDown = (e) => {
        mouse.ing = true
        mouse.left = e.clientX
        mouse.top = e.clientY
        rect.tempData = deepClone(info)
        if (rectType === 'group'){
          rect.children.forEach(r => {
            r.tempData = deepClone(this._getRectInfo(r.data))
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
      var resizer = [aResizer, bResizer, cResizer, dResizer]
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

        // me._resizeGroup(this.rects[0], 'c', mx, my)
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