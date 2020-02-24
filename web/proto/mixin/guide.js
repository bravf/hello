import {
  getUuid,
  getGroupSize,
  getRectInfo,
} from '../core/base'

export default {
  methods: {
    // 更新辅助线
    _updateGuide () {
      let currRect = this.currentRects[0]
      let currRectId = currRect.id
      this.guide.left = new Set()
      this.guide.top = new Set()
      this.rects.forEach(rect => {
        let rectId = rect.id
        // 排除 currentRect 本身
        if (rectId === currRectId){
          return
        }
        // 排除 currentRect 的子元素
        if (rect.parent === currRectId){
          return
        }
        // 排除父元素
        if (currRect.parent === rectId){
          return
        }
        let tempInfo = rect.tempData
        this.guide.left
          .add(tempInfo.rotateLeftTop.left)
          .add(tempInfo.rotateRightTop.left)
          .add(tempInfo.rotateRightBottom.left)
          .add(tempInfo.rotateLeftBottom.left)
        
        this.guide.top
          .add(tempInfo.rotateLeftTop.top)
          .add(tempInfo.rotateRightTop.top)
          .add(tempInfo.rotateRightBottom.top)
          .add(tempInfo.rotateLeftBottom.top)
      })
    },
    _checkRectPointGuide (rect, pointInfo, mx, my) {
      let min = 10
      let guideLeft = this.guide.left
      let guideTop = this.guide.top
      let guideShowLeft = this.guideShow.left
      let guideShowTop = this.guideShow.top
      let tempInfo = rect.tempData
      let nowInfo = getRectInfo(rect.data)
      let nowPoint = nowInfo[pointInfo.name]
      let oldPoint = tempInfo[pointInfo.name]
      let newPoint = {
        left: oldPoint.left + mx,
        top: oldPoint.top + my,
      }
      if (pointInfo.left && guideLeft.has(nowPoint.left)){
        if (Math.abs(newPoint.left - nowPoint.left) <= min){
          mx = nowPoint.left - oldPoint.left
        }
      }
      if (pointInfo.top && guideTop.has(nowPoint.top)){
        if (Math.abs(newPoint.top - nowPoint.top) <= min){
          my = nowPoint.top - oldPoint.top
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
      ]
    },
    _checkGuideOnMove (rect, mx, my) {
      // 检查辅助线
      this._clearGuideShow()
      ;['rotateLeftTop', 'rotateRightTop', 'rotateRightBottom', 'rotateLeftBottom'].forEach(name => {
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
      // 只处理角度为 0 时候
      if (tempInfo.angle === 0){
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
        ;[mx, my] = this._checkRectPointGuide(rect, pointInfo, mx, my)
      }
      return [mx, my]
    },
    _clearGuideShow () {
      this.guideShow.left = new Set()
      this.guideShow.top = new Set()
    },
  }
}