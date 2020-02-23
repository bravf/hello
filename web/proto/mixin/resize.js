import {
  getScalePoint,
  getPointsCenter,
  getWH,
  getRotatePointByCenter,
  getRadian,
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
    // 同时缩放
    _scaleRectR (rect, fixedPoint, scale) {
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
    },
    // 同时缩放
    _scaleGroupR (group, fixedPoint, scale) {
      group.children.forEach(id => {
        let rect = this._getRectById(id)
        this._scaleRectR(rect, fixedPoint, scale)
      })
    },
    // 缩放 width
    _scaleGroupW (group, fixedPoint, scaleW, dir) {
      let groupData = group.data
      let groupTempInfo = group.tempData
      let groupAngle = groupData.angle
      group.children.forEach(id => {
        let rect = this._getRectById(id)
        let data = rect.data
        let tempInfo = rect.tempData
        let angle = data.angle
        let radian = getRadian(angle)
        // 如果角度不同，则同比缩放 rect
        if (angle !== groupAngle){
          this._scaleRectR(rect, fixedPoint, scaleW)
        }
        else {
          // group 的固定 left
          let fixedLeft
          if (dir == 'bc'){
            fixedLeft = groupTempInfo.left
          }
          else {
            fixedLeft = groupTempInfo.left + groupTempInfo.width
          }

          let rlt = tempInfo.rotateLeftTop
          // rect ad 距离 group ad 的距离
          let adDis = tempInfo.left - fixedLeft
          let adDisDiff = adDis * (scaleW - 1)
          let newRlt = {
            left: rlt.left + Math.cos(radian) * adDisDiff,
            top: rlt.top + Math.sin(radian) * adDisDiff,
          }
          
          let rrb = tempInfo.rotateRightBottom
          // rect bc 距离 group ad 的距离
          let bcDis = tempInfo.left + tempInfo.width - fixedLeft
          let bcDisDiff = bcDis * (scaleW - 1)
          let newRrb = {
            left: rrb.left + Math.cos(radian) * bcDisDiff,
            top: rrb.top + Math.sin(radian) * bcDisDiff,
          }
          let newCenter = getPointsCenter(newRlt, newRrb)
          let lt = getRotatePointByCenter(newCenter, newRlt, angle, false)
          let wh = getWH(lt, newCenter)
          data.left = lt.left
          data.top = lt.top
          data.width = wh.width
          data.height = wh.height
        }
      })
      this._updateGroupSize(group)
    },
    // 缩放 height
    _scaleGroupH (group, fixedPoint, scaleH, dir) {
      let groupData = group.data
      let groupTempInfo = group.tempData
      let groupAngle = groupData.angle
      group.children.forEach(id => {
        let rect = this._getRectById(id)
        let data = rect.data
        let tempInfo = rect.tempData
        let angle = data.angle
        let radian = getRadian(angle)
        // 如果角度不同，则同比缩放 rect
        if (angle !== groupAngle){
          this._scaleRectR(rect, fixedPoint, scaleH)
        }
        else {
          // group 的固定 top
          let fixedTop
          if (dir == 'cd'){
            fixedTop = groupTempInfo.top
          }
          else {
            fixedTop = groupTempInfo.top + groupTempInfo.height
          }

          let rlt = tempInfo.rotateLeftTop
          // rect ab 距离 group ab 的距离
          let abDis = tempInfo.top - fixedTop
          let abDisDiff = abDis * (scaleH - 1)
          let newRlt = {
            left: rlt.left + Math.sin(radian) * abDisDiff,
            top: rlt.top + Math.cos(radian) * abDisDiff,
          }
          
          let rrb = tempInfo.rotateRightBottom
          // rect cd 距离 group ad 的距离
          let cdDis = tempInfo.top + tempInfo.height - fixedTop
          let cdDisDiff = cdDis * (scaleH - 1)
          let newRrb = {
            left: rrb.left + Math.sin(radian) * cdDisDiff,
            top: rrb.top + Math.cos(radian) * cdDisDiff,
          }
          let newCenter = getPointsCenter(newRlt, newRrb)
          let lt = getRotatePointByCenter(newCenter, newRlt, angle, false)
          let wh = getWH(lt, newCenter)
          data.left = lt.left
          data.top = lt.top
          data.width = wh.width
          data.height = wh.height
        }
      })
      this._updateGroupSize(group)
    },
    // a ---- b
    // d ---- c 
    _resizeGroup (group, dir = 'c', mx = 0, my = 0) {
      let resizeFn = {
        'a': resizeAR,
        'b': resizeBR,
        'c': resizeCR,
        'd': resizeDR,
        'ab': resizeAB,
        'bc': resizeBC,
        'cd': resizeCD,
        'ad': resizeAD,
      }[dir]
      let resizeRes = resizeFn(group, mx, my)

      if (['a', 'b', 'c', 'd'].includes(dir)){
        let {scale, fixedPoint} = resizeRes
        this._scaleGroupR(group, fixedPoint, scale)
      }
      else if (['bc', 'ad'].includes(dir)){
        let {scaleW, fixedPoint} = resizeRes
        this._scaleGroupW(group, fixedPoint, scaleW, dir)
      }
      else if (['ab', 'cd'].includes(dir)){
        let {scaleH, fixedPoint} = resizeRes
        this._scaleGroupH(group, fixedPoint, scaleH, dir)
      }
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