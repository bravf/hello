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
.proto-rect-rotater{
  position: absolute;
  border: 1px solid green;
  background: green;
  width: 10px;
  height: 10px;
  cursor: pointer;
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

export default {
  mixins: [
    resizeMixin,
    rotateMixin,
    moveMixin,
    renderMixin,
    dataMixin,
  ],
  methods: {
    _ready () {
      let a = this._createRect(200, 200, 100, 50, 180)
      let b = this._createRect(300, 300, 100, 50, 0)
      let c = this._createRect(300, 300, 100, 30, 30)
      let d = this._createRect(100, 400, 100, 30, 140)
      let g = this._createGroupRect(0)
      this._bindParent(g, [a,b,c,d])
    },
    _windowMouseEvent () {
      let me = this
      let mouse = this.mouse

      let mousemove = (e) => {
        if (!mouse.ing){
          return
        }
        let left = mouse.currLeft = e.clientX
        let top = mouse.currTop = e.clientY
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