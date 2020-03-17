<style lang="scss">
@import './index.scss';
</style>
<script>
import resizeMixin from './mixin/resize'
import rotateMixin from './mixin/rotate'
import moveMixin from './mixin/move'
import renderMixin from './mixin/render'
import dataMixin from  './mixin/data'
import guideMixin from './mixin/guide'
import historyMixin from  './mixin/history'
import commandMixin from  './mixin/command'
import actionMixin from './mixin/action'
import lindedListMixin from '@/mixin/linked-list'
import {
  middleLeft,
  middleTop,
  tNumber,
} from '@/core/base'
import * as rectConfig from '@/core/rect-config'
export default {
  mixins: [
    resizeMixin,
    rotateMixin,
    moveMixin,
    renderMixin,
    dataMixin,
    guideMixin,
    historyMixin,
    commandMixin,
    actionMixin,
    lindedListMixin,
  ],
  methods: {
    _ready () {
      let page = this._createPage()
      this.currPageId = page.id
      
      let a = this._createRect('rect')
      this._updateRectTempData(a)
      this._moveTo(a, 150, 100)
      
      let b = this._createRect('text')
      this._updateRectTempData(b)
      this._moveTo(b, 50, 400)

      let c = this._createRect('circle')
      this._updateRectTempData(c)
      this._moveTo(c, 300, 500)

      // Array(300).fill('').forEach(a => {
      //   let x = this._createRect('text')
      //   let y = this._createRect('circle')
      //   let g = this._createRect('group')
      //   this._bindGroup(g, [x,y])
      // })

      let newGroup = this._createRect('group')
      this._bindGroup(newGroup, [a, c])
      this._historyPush()


      // a.data.left = 0
      // a.data.top = 120
      // let b = this._create('rect')
      // let c = this._create('rect')
      // b.data.left = 100
      // c.data.left = 200
      // c.data.top = 300
      // let g = this._create('group')
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
      let mousedown = () => {
        this._blurRect()
      }
      let mousemove = (e) => {
        if (!mouse.ing){
          return
        }
        let mousePoint = this._getMousePoint(e)
        let left = mouse.currLeft = mousePoint.left 
        let top = mouse.currTop = mousePoint.top
        let eventType = mouse.eventType
        let mx = left - mouse.startLeft
        let my = top - mouse.startTop
        let rect = this.objects[this.currRectId]

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
            let mousePoint = this._getMousePoint(e)
            let createType = mouse.createType
            let data = rectConfig[createType]
            let rect = this._createRect(createType)
            this._updateRectTempData(rect)
            this._moveTo(rect, 
              tNumber(mousePoint.left - data.width / 2),
              tNumber(mousePoint.top - data.height / 2)
            )
            mouse.eventType = 'move'
            me._focusRect(rect, e)
          }
        }
      }
      let mouseup = () => {
        if (!mouse.ing){
          return
        }
        mouse.ing = false
        this._clearGuideShow()
        this._historyPush()
      }
      window.addEventListener('mousedown', mousedown)
      window.addEventListener('mousemove', mousemove)
      window.addEventListener('mouseup', mouseup)
    },
    _domEvent () {
      let $middle = this.$refs.middle
      $middle.addEventListener('scroll', () => {
        this._renderRule()
      })
    },
  },
  created () {
    this._ready()
    this._windowMouseEvent()
  },
  mounted () {
    this._domEvent()
  },
  render (h) {
    this.renderHook
    return this._renderMain(h)
  }
}
</script>