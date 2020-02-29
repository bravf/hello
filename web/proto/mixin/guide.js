import {
  getRectInfo,
  tNumber,
} from '../core/base'

export default {
  methods: {
    // 更新辅助线
    _updateGuide () {
      let currRect = this.currRects[0]
      let currRectId = currRect.id
      this._clearGuideLine()
      this.rects.forEach(rect => {
        let rectId = rect.id
        let groupId = rect.groupId
        let tempGroupId = rect.tempGroupId
        // 排除本身
        if (rectId === currRectId){
          return
        }
        // 排除的子元素
        if ( (groupId === currRectId) || (tempGroupId === currRectId)){
          return
        }
        // 如果父元素在 tempGroup 也排除
        if (groupId){
          if (this._getRectById(groupId).tempGroupId === currRectId){
            return
          }
        }
        let tempInfo = rect.tempData
        this.guide.line.left
          .add(tempInfo.rotateLeftTop.left)
          .add(tempInfo.rotateRightTop.left)
          .add(tempInfo.rotateRightBottom.left)
          .add(tempInfo.rotateLeftBottom.left)
          .add(tempInfo.center.left)
        
        this.guide.line.top
          .add(tempInfo.rotateLeftTop.top)
          .add(tempInfo.rotateRightTop.top)
          .add(tempInfo.rotateRightBottom.top)
          .add(tempInfo.rotateLeftBottom.top)
          .add(tempInfo.center.top)
      })
    },
    _checkRectPointGuide (rect, pointInfo, mx, my) {
      let min = 10
      let guideLeft = this.guide.line.left
      let guideTop = this.guide.line.top
      let guideShowLeft = this.guide.show.left
      let guideShowTop = this.guide.show.top
      let tempInfo = rect.tempData
      let nowInfo = getRectInfo(rect.data)
      let nowPoint = nowInfo[pointInfo.name]
      let oldPoint = tempInfo[pointInfo.name]
      let isStop = false
      let newPoint = {
        left: tNumber(oldPoint.left + mx),
        top: tNumber(oldPoint.top + my),
      }
      if (pointInfo.left && guideLeft.has(nowPoint.left)){
        if (Math.abs(newPoint.left - nowPoint.left) <= min){
          mx = nowPoint.left - oldPoint.left
          isStop = true
        }
      }
      if (pointInfo.top && guideTop.has(nowPoint.top)){
        if (Math.abs(newPoint.top - nowPoint.top) <= min){
          my = nowPoint.top - oldPoint.top
          isStop = true
        }
      }
      if (pointInfo.left && guideLeft.has(nowPoint.left)){
        guideShowLeft.add(nowPoint.left)
      }
      if (pointInfo.top && guideTop.has(nowPoint.top)){
        guideShowTop.add(nowPoint.top)
      }
      return [
        mx,
        my,
        isStop,
      ]
    },
    _checkGuideOnMove (rect, mx, my) {
      // 检查辅助线
      this._clearGuideShow()
      ;['rotateLeftTop', 'rotateRightTop', 'rotateRightBottom', 'rotateLeftBottom', 'center'].forEach(name => {
        let pointInfo = {
          name,
          top: true,
          left: true,
        }
        ;[mx, my] = this._checkRectPointGuide(rect, pointInfo, mx, my)
      })
      return [mx, my]
    },
    _checkGuideOnResize (rect, dir, mx, my) {
      this._clearGuideShow()
      let tempInfo = rect.tempData
      let isLine = rect.type === 'line'
      // 只处理角度为 0 或者类型是 line 的时候
      if ( (tempInfo.angle === 0) || isLine){
        let pointInfo = {
          'a': {
            name: 'rotateLeftTop',
            left: true,
            top: true,
          },
          'b': {
            name: 'rotateRightTop',
            left: true,
            top: true,
          },
          'c': {
            name: 'rotateRightBottom',
            left: true,
            top: true,
          },
          'd': {
            name: 'rotateLeftBottom',
            left: true,
            top: true,
          },
          'ab': {
            name: 'rotateLeftTop',
            left: false,
            top: true,
          },
          'bc': {
            name: 'rotateRightTop',
            left: true,
            top: false, 
          },
          'cd': {
            name: 'rotateRightBottom',
            left: false,
            top: true,
          },
          'ad': {
            name: 'rotateLeftBottom',
            left: true,
            top: false, 
          },
        }[dir]
        if (isLine){
          pointInfo = {
            'ad': {
              name: 'rad',
              left: true,
              top: true,
            },
            'bc': {
              name: 'rbc',
              left: true,
              top: true,
            }
          }[dir]
        }
        let isStop = false
        ;[mx, my, isStop] = this._checkRectPointGuide(rect, pointInfo, mx, my)
        // 检查 center
        let centerCheckRes = this._checkRectPointGuide(rect, {
          name: 'center',
          left: pointInfo.left,
          top: pointInfo.top,
        }, mx, my)
        if (!isStop){
          [mx, my, isStop] = centerCheckRes
        }
      }
      return [mx, my]
    },
    _checkGuideOnRotate (oldAngle, nowAngle, newAngle, angleDiff) {
      let min = 10
      if (nowAngle % 90 === 0){
        if (Math.abs(newAngle - nowAngle) <= min){
          angleDiff = nowAngle - oldAngle
        }
        // 如果 nowAngle 0，则需要再用 360 计算一下
        if (nowAngle === 0){
          if (Math.abs(newAngle - 360) <= min){
            angleDiff = nowAngle - oldAngle
          }
        }
      }
      return angleDiff
    },
    _clearGuideLine () {
      this.guide.line.left = new Set()
      this.guide.line.top = new Set()
    },
    _clearGuideShow () {
      this.guide.show.left = new Set()
      this.guide.show.top = new Set()
    },
  }
}