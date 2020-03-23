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
          let data = this.rectConfig[createType]
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
    this.windowEventAdd('mousedown', mousedown)
    this.windowEventAdd('mousemove', mousemove)
    this.windowEventAdd('mouseup', mouseup)

    // 右键
    this.windowEventAdd('contextmenu', (e) => {
      e.preventDefault()
    })

    // event
    event.$on('windowMouseDown', () => {
      this.contextmenu.show = false
    })
  },
  mounted () {
    let $middle = this.$refs.middle
    $middle.addEventListener('scroll', () => {
      this._renderRule()
    })
  }
}