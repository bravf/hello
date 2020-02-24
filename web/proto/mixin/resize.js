import {
  getScalePoint,
  getPointsCenter,
  getWH,
  getRotatePointByCenter,
  getRadian,
  tNumber,
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
      ;[mx, my] = this._checkGuideOnResize(rect, dir, mx, my)
      if (rect.type === 'group'){
        this._resizeGroup(rect, dir, mx, my)
      }
      else {
        this._resizeRect(rect, dir, mx, my)
      }
    },
    // 同时缩放
    _scaleGroupRectR (rect, fixedPoint, scale) {
      let rectData = rect.data
      let rectInfo = rect.tempData
      let rlt = rectInfo.rotateLeftTop
      let rrb = rectInfo.rotateRightBottom

      let newRlt = getScalePoint(fixedPoint, rlt, scale)
      let newRrb = getScalePoint(fixedPoint, rrb, scale)
      let newCenter = getPointsCenter(newRlt, newRrb)
      let lt = getRotatePointByCenter(newCenter, newRlt, rectData.angle, false)
      let wh = getWH(lt, newCenter)

      rectData.left = tNumber(lt.left)
      rectData.top = tNumber(lt.top)
      rectData.width = tNumber(wh.width)
      rectData.height = tNumber(wh.height)
    },
    _scaleGroupRectWOrH (group, rect, scale, dir) {
      let groupData = group.data
      let groupTempInfo = group.tempData
      let groupAngle = groupData.angle
      let data = rect.data
      let tempInfo = rect.tempData
      let angle = data.angle
      let radian = getRadian(groupAngle)
      let fixed
      let type = 'left'

      if (dir === 'bc'){
        fixed = groupTempInfo.left 
      }
      else if (dir === 'ad'){
        fixed = groupTempInfo.left + groupTempInfo.width
      }
      else if (dir === 'cd'){
        fixed = groupTempInfo.top
        type = 'top'
      }
      else {
        fixed = groupTempInfo.top + groupTempInfo.height
        type = 'top'
      }

      let angleDiff = Math.abs(angle - groupAngle)
      let is180 = angleDiff === 180
      let is90 = angleDiff === 90
      let is270 = angleDiff === 270

      let rlt = tempInfo.rotateLeftTop
      let rrt = tempInfo.rotateRightTop
      let rrb = tempInfo.rotateRightBottom
      let rlb = tempInfo.rotateLeftBottom

      // 根据 rect 和 group 的角度差，重新选择左上角和右下角的点
      if (is90){
        [rlt, rrb] = [rlb, rrt]
      }
      else if (is180){
        [rlt, rrb] = [rrb, rlt]
      }
      else if (is270){
        [rlt, rrb] = [rrt, rlb]
      }

      let lt = getRotatePointByCenter(
        groupTempInfo.center,
        rlt,
        groupAngle,
        false,
      )
      let dis = lt[type] - fixed
      let disDiff = dis * (scale - 1)
      let newRlt = {
        left: rlt.left,
        top: rlt.top,
      }
      if (type === 'left'){
        newRlt.left += Math.cos(radian) * disDiff
        newRlt.top += Math.sin(radian) * disDiff
      }
      else {
        newRlt.left -= Math.sin(radian) * disDiff
        newRlt.top += Math.cos(radian) * disDiff
      }
      
      let rb = getRotatePointByCenter(
        groupTempInfo.center,
        rrb,
        groupAngle,
        false,
      )
      // rect cd 距离 group ad 的距离
      let dis2 = rb[type] - fixed
      let dis2Diff = dis2 * (scale - 1)
      let newRrb = {
        left: rrb.left,
        top: rrb.top,
      }
      if (type === 'left'){
        newRrb.left += Math.cos(radian) * dis2Diff
        newRrb.top += Math.sin(radian) * dis2Diff
      }
      else {
        newRrb.left -= Math.sin(radian) * dis2Diff
        newRrb.top += Math.cos(radian) * dis2Diff
      }

      let newCenter = getPointsCenter(newRlt, newRrb)
      let newLt = getRotatePointByCenter(
        newCenter, 
        newRlt, 
        angle, 
        false
      )
      let wh = getWH(newLt, newCenter)
      data.left = tNumber(newLt.left)
      data.top = tNumber(newLt.top)
      data.width = tNumber(wh.width)
      data.height = tNumber(wh.height)

      // 根据角度差进行弥补
      if (is180){
        data.left -= wh.width
        data.top -= wh.height
      }
      else if (is90){
        data.top -= wh.height
      }
      else if (is270){
        data.left -= wh.width
      }
    },
    // 同时缩放
    _scaleGroupR (group, fixedPoint, scale) {
      group.children.forEach(id => {
        let rect = this._getRectById(id)
        this._scaleGroupRectR(rect, fixedPoint, scale)
      })
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
      for (let key in resizeRes.size){
        resizeRes.size[key] = tNumber(resizeRes.size[key])
      }
      let groupSize = {}
      if (['a', 'b', 'c', 'd'].includes(dir)){
        let {scale, fixedPoint} = resizeRes
        this._scaleGroupR(group, fixedPoint, scale)
        groupSize = resizeRes.size
      }
      else {
        let {fixedPoint} = resizeRes
        let scale = resizeRes.scaleW || resizeRes.scaleH
        let groupData = group.data
        let groupAngle = groupData.angle
        group.children.forEach(id => {
          let rect = this._getRectById(id)
          let data = rect.data
          let angle = data.angle

          // 如果角度差不是 90 的倍数，则同比缩放 rect
          if ( (angle - groupAngle) % 90 !== 0 ){
            this._scaleGroupRectR(rect, fixedPoint, scale)
          }
          else {
            this._scaleGroupRectWOrH(group, rect, scale, dir)
          }
        })
        groupSize = this._updateGroupSize(group)
      }
      group.data = {...group.data, ...groupSize}
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
      let resizeRes = resizeFn(rect, mx, my)
      for (let key in resizeRes.size){
        resizeRes.size[key] = tNumber(resizeRes.size[key])
      }
      rect.data = {...rect.data, ...resizeRes.size}
      // 同步 group
      if (rect.parent){
        let group = this._getRectById(rect.parent)
        let groupSize = this._updateGroupSize(group)
        group.data = {...group.data, ...groupSize}
      }
    },
  }
}