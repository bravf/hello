<style lang="scss">
$blue: #2d8cf0;
$red: #ed4014;
$gray: #dcdee2;
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
.proto-button{
  display: inline-block;
  width: 40px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background-color: $gray;
  cursor: pointer;
  margin: 2px;
}
.proto-top{
  display: flex;
  align-items: center;
  height: 52px;
  box-shadow: rgba(100, 100, 100, 0.2) 0px 2px 3px 0px;
  background-color: #fff;
  padding:0 10px;
}
.proto-left{
  position: fixed;
  top: 54px;
  left: 0;
  width: 150px;
  height: 100%;
  background-color: $white;
  border-right: 1px solid $gray;
  z-index: 10000;
}
.proto-right{
  position: fixed;
  top: 54px;
  right: 0;
  width: 200px;
  height: 100%;
  background-color: $white;
  border-left: 1px solid $gray;
  z-index: 10000;

  // .proto-setting-box{
  //   padding: 10px;
  //   border-top: 1px solid $gray;
  // }
  .proto-setting-box-item{
    padding: 4px;
    display: flex;
    align-items: center;

    > span{
      display: inline-block;
      width: 80px;
      flex-shrink: 0;
    }
  }
}
.proto-middle{
  position: absolute;
  top: 54px;
  left: 150px;
  right: 200px;
  height: calc(100% - 54px);
  background-color: $white;
  overflow: scroll;

  .proto-canvas{
    position: absolute;
    top: 0;
    left: 0;
    width: 10000px;
    height: 10000px;
  }
}
.proto-rect{
  position: absolute;
}
.proto-rect-tempGroup{
  pointer-events: none;
}
.proto-rect-hover{
  outline: 1px solid $blue;
  cursor: move;
}
.proto-rect-focus{
  cursor: move;
}
.proto-rect-inner{
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
}
.proto-rect-inner-text{
  outline: none;
  width: 100%;
  text-align: center;
  word-break: break-all;
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

</style>

<script>
import resizeMixin from './mixin/resize'
import rotateMixin from './mixin/rotate'
import moveMixin from './mixin/move'
import renderMixin from './mixin/render'
import dataMixin from  './mixin/data'
import guideMixin from './mixin/guide'
import historyMixin from  './mixin/history'
import {
  getMousePoint,
  middleLeft,
  middleTop,
  tNumber,
} from './core/base'
import * as rectConfig from './core/rect-config'

export default {
  mixins: [
    resizeMixin,
    rotateMixin,
    moveMixin,
    renderMixin,
    dataMixin,
    guideMixin,
    historyMixin,
  ],
  methods: {
    _ready () {
      let a = this._create('rect')
      let b = this._create('rect')
      let c = this._create('rect')
      // let g = this._create('group')
      a.data.left = 100
      b.data.left = 100
      b.data.top = 120
      c.data.left = 200
      c.data.top = 300
      // this._bindGroup(g, [b,c])
      // // let d = this._createRect('rect', {
      // //   left: 400,
      // //   top: 400,
      // //   width: 100,
      // //   height: 30,
      // //   angle: 30,
      // // })
      // let e = this._createRect('text', {
      //   left: 200,
      //   top: 10,
      //   angle: 0,
      // })
      // // let g = this._createRect('line', {
      // //   left: 100,
      // //   top: 50,
      // // })
      // let f = this._createGroup()
      // this._bindGroup(f, [a,b])
      // // this._updateCurrRect(e)
      // this._focusRect(c)
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
        let rect = this.currRects[0]

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
          me._move(rect, mx, my)
        }
        else if (eventType === 'create'){
          if ( (e.clientX > middleLeft) && (e.clientY > middleTop) ){
            let mousePoint = getMousePoint(e)
            let createType = mouse.createType
            let data = rectConfig[createType]
            let rect = this._create(createType)
            this._updateRectTempData(rect)
            this._moveTo(rect, 
              tNumber(mousePoint.left - data.width / 2),
              tNumber(mousePoint.top - data.height / 2)
            )
            mouse.eventType = 'move'
            me._focusRect(rect, e)
            me._historyGroup()
            me._historyAdd(rect.id, null, rect)
          }
        }
      }
      let mouseup = (e) => {
        if (!mouse.ing){
          return
        }
        let rect = me.currRects[0]
        mouse.ing = false
        this._clearGuideShow()
        if (['resize', 'move', 'rotate'].includes(mouse.eventType)) {
          this._historyAddDataSizeChange(rect)
        }
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
    return this._renderMain(h)
  }
}
</script>