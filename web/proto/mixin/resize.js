import {
  getScalePoint,
  getPointsCenter,
  getWH,
  getRotatePointByCenter,
} from '../core/base'

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
} from '../core/resize'

export default {
  methods: {
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
      let resizeFn = {
        'a': resizeAR,
        'b': resizeBR,
        'c': resizeCR,
        'd': resizeDR,
      }[dir]
      let resizeRes = resizeFn(group, mx, my)
      let {scale, fixedPoint} = resizeRes

      group.children.forEach(id => {
        let rect = this._getRectById(id)
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
      let resizeFn = {
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

      // 同步 group
      if (rect.parent){
        let group = this._getRectById(rect.parent)
        this._updateGroupSize(group)
      }
    },
  }
}