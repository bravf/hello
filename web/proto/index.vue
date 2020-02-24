<style>
*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.proto-canvas{
  width: 10000px;
  height: 10000px;
  overflow: auto;
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
.proto-rect-rotater{
  position: absolute;
  border: 1px solid green;
  background: green;
  width: 10px;
  height: 10px;
  cursor: pointer;
}
.proto-guide{
  position: absolute;
  border-style: solid;
  border-color: red;
  border-width: 0;
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
/* test */
button{
  padding: 2px 4px;
}
</style>

<script>

import resizeMixin from './mixin/resize'
import rotateMixin from './mixin/rotate'
import moveMixin from './mixin/move'
import renderMixin from './mixin/render'
import dataMixin from  './mixin/data'
import guideMixin from './mixin/guide'
let doc = document.documentElement

export default {
  mixins: [
    resizeMixin,
    rotateMixin,
    moveMixin,
    renderMixin,
    dataMixin,
    guideMixin,
  ],
  methods: {
    _ready () {
      let a = this._createRect(100, 200, 100, 50, 270)
      let b = this._createRect(100, 500, 100, 50, 180)
      let c = this._createRect(300, 400, 100, 30, 90)
      let d = this._createRect(100, 400, 100, 30, 0)
      let e = this._createRect(400, 400, 100, 30, 30)
      let g = this._createGroupRect(0)
      this._bindParent(g, [a, b, c, d, e])
    },
    _windowMouseEvent () {
      let me = this
      let mouse = this.mouse

      let mousemove = (e) => {
        if (!mouse.ing){
          return
        }
        let left = mouse.currLeft = e.clientX + doc.scrollLeft
        let top = mouse.currTop = e.clientY + doc.scrollTop
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
      }
      let mouseup = (e) => {
        if (!mouse.ing){
          return
        }
        mouse.ing = false
        this._clearGuideShow()
      }
      window.addEventListener('mousemove', mousemove)
      window.addEventListener('mouseup', mouseup)
    },
  },
  created () {
    this._ready()
    this._windowMouseEvent()
  },
  render (h) {
    return this._renderMain()
  }
}
</script>