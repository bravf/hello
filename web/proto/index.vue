<style lang="scss">
$blue: #2486ff;
$red: #f4615c;
$gray: #ddd;
$white: #fff;
*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  user-select: none;
}
html, body {
  font-family: -apple-system, "SF UI Text", "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Zen Hei", sans-serif;
  font-weight: normal;
}
.proto-canvas{
  width: 10000px;
  height: 10000px;
  overflow: auto;
}
.proto-rect{
  position: absolute;
}
.proto-rect-tempGroup{
  pointer-events: none;
}
.proto-rect-hover{
  outline: 1px solid $blue;
}
.proto-rect-inner{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 1px solid $gray;
}
.proto-rect-handler{
  position: absolute;
  border: 1px dashed $blue;
  pointer-events: none;
}
.proto-rect-resizer {
  position: absolute;
  border: 1px solid $blue;
  background-color: $blue;
  border-radius: 100%;
  width: 8px;
  height: 8px;
  cursor: pointer;
  pointer-events:fill;
}
.proto-rect-rotater{
  position: absolute;
  border: 1px solid $blue;
  width: 8px;
  height: 8px;
  cursor: pointer;
  pointer-events:fill;
}
.proto-guide{
  position: absolute;
  border-style: solid;
  border-color: $red;
  border-width: 0;
  z-index: 10000;
}
.proto-guide-top{
  left: 0;
  width: 10000px;
  height: 0;
  border-top-width: 1px;
}
.proto-guide-left{
  top: 0;
  height: 10000px;
  width: 0;
  border-left-width: 1px;
}
.proto-left{
  position: fixed;
  top: 0;
  left: 0;
  width: 150px;
  height: 100%;
  background-color: $white;
  border-right: 1px solid $gray;
  z-index: 10000;
}
.proto-buttons span{
  display: inline-block;
  width: 40px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background-color: $gray;
  cursor: pointer;
}
.proto-setting{
  position: fixed;
  top: 0;
  right: 0;
  width: 200px;
  height: 100%;
  background-color: $white;
  border-left: 1px solid $gray;
  z-index: 10000;

  .proto-setting-box{
    padding: 10px;
    border-top: 1px solid $gray;
  }
  .proto-setting-box-item{
    padding: 4px 0;

    span{
      display: inline-block;
      width: 40px;
    }
  }
}

</style>

<script>
import resizeMixin from './mixin/resize'
import rotateMixin from './mixin/rotate'
import moveMixin from './mixin/move'
import renderMixin from './mixin/render'
import dataMixin from  './mixin/data'
import guideMixin from './mixin/guide'
import {
  getMousePoint
} from './core/base'

export default {
  mixins: [
    resizeMixin,
    rotateMixin,
    moveMixin,
    renderMixin,
    dataMixin,
    guideMixin,
  ],
  watch: {
    currRects () {

    },
  },
  methods: {
    _ready () {
      // this._createRect(600, 200, 100, 50, 270)
      let a = this._createRect(200, 200, 100, 50, 270)
      let b = this._createRect(200, 500, 100, 50, 180)
      let c = this._createRect(300, 400, 100, 30, 90)
      let d = this._createRect(200, 400, 100, 30, 0)
      let e = this._createRect(400, 400, 100, 30, 30)
      let g = this._createGroup()
      this._bindGroup(g, [a, b, c, d, e])

      let h = this._createRect(300, 600, 100, 30, 120)
      // let i = this._createRect(300, 800, 100, 30, 30)
    },
    _windowMouseEvent () {
      let me = this
      let mouse = this.mouse

      let mousedown = (e) => {
        this._blurRect()
      }
      let mousemove = (e) => {
        if (!mouse.ing){
          return
        }
        let mousePoint = getMousePoint(e)
        let left = mouse.currLeft = mousePoint.left 
        let top = mouse.currTop = mousePoint.top
        let eventType = mouse.eventType
        let mx = left - mouse.startLeft
        let my = top - mouse.startTop

        if (eventType === 'resize'){
          me._resize(mx, my)
        }
        else if (eventType === 'rotate'){
          let mousePoint = {
            left: mouse.currLeft,
            top: mouse.currTop,
          }
          me._rotate(mousePoint)
        }
        else if (eventType === 'move'){
          me._move(mx, my)
        }
        else if (eventType === 'create'){
          // 150 是左侧栏的宽度
          if (e.clientX > 150){
            let mousePoint = getMousePoint(e)
            let rect = this._createRect(mousePoint.left - 100, mousePoint.top - 50)
            mouse.eventType = 'move'
            me._focusRect(rect, e)
          }
        }
        me._updateSetting()
      }
      let mouseup = (e) => {
        if (!mouse.ing){
          return
        }
        mouse.ing = false
        this._clearGuideShow()
      }
      window.addEventListener('mousedown', mousedown)
      window.addEventListener('mousemove', mousemove)
      window.addEventListener('mouseup', mouseup)
    },
  },
  created () {
    this._ready()
    this._windowMouseEvent()
  },
  render (h) {
    this.renderHook
    return this._renderMain()
  }
}
</script>