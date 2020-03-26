import {
  middleLeft,
  middleTop,
  tNumber,
} from '@/core/base'
import event from '@/core/event'
export default {
  methods: {
  },
  created () {
    let me = this
    let mouse = this.mouse
    let mousedown = (e) => {
      event.$emit('windowMouseDown', e)
      mouse.eventType = 'circle'
    }
    let mousemove = (e) => {
      if (!mouse.ing){
        return
      }
      mouse.e = e
      let scale = this.scale
      let mousePoint = this._getMousePoint(e)
      let left = mouse.currLeft = mousePoint.left 
      let top = mouse.currTop = mousePoint.top
      let eventType = mouse.eventType
      let mx = (left - mouse.startLeft) / scale
      let my = (top - mouse.startTop) / scale
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
          let createType = mouse.createType
          let data = this.rectConfig[createType]
          let rect = this._createRect(createType)
          this._updateRectTempData(rect)
          this._moveTo(rect, 
            tNumber(left - data.width / 2),
            tNumber(top - data.height / 2)
          )
          mouse.eventType = 'move'
          mouse.startLeft = left
          mouse.startTop = top
          me._focusRect(rect, e)
        }
      }
    }
    let mouseup = () => {
      if (!mouse.ing){
        return
      }
      // circle 在结束时候判定，提高性能
      if (mouse.eventType === 'circle'){
        this._focusRectWhenCircle()
      }
      mouse.ing = false
      this._clearGuideShow()
      this._historyPush()
    }
    this.windowEventAdd('mousedown', mousedown)
    this.windowEventAdd('mousemove', mousemove)
    this.windowEventAdd('mouseup', mouseup)

    // 右键
    this.windowEventAdd('contextmenu', (e) => {
      e.preventDefault()
    })
    // event
    event.$on('windowMouseDown', (e) => {
      this.contextmenu.show = false
      let mousePoint = this._getMousePoint(e)
      mouse.ing = true
      mouse.startLeft = mouse.currLeft = mousePoint.left
      mouse.startTop = mouse.currTop = mousePoint.top
    })
  },
  mounted () {
    let $middle = this.$refs.middle
    $middle.addEventListener('scroll', () => {
      this._renderRule()
    })
  }
}