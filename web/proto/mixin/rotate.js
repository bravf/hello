import {
  getRotatePointByCenter,
  getAngleByTwoPoints,
  getEffectiveAngle,
  getRectInfo,
} from '../core/base'

export default {
  methods: {
    _rotate (mousePoint) {
      let rect = this.currentRects[0]
      let rectType = rect.type
      let info = getRectInfo(rect.data)
      let tempInfo = rect.tempData
      
      let angle =  parseInt(getAngleByTwoPoints(mousePoint, info.center))
      let angleDiff = angle - tempInfo.angle

      if (rectType === 'group'){
        this._rotateGroup(rect, angleDiff)
      }
      else {
        this._rotateRect(rect, angleDiff)
      }
    },
    _rotateRect (rect, angleDiff) {
      rect.data.angle = getEffectiveAngle(rect.tempData.angle + angleDiff)
      // 同步 group
      if (rect.parent){
        let group = this._getRectById(rect.parent)
        this._updateGroupSize(group)
      }
    },
    _rotateGroup (group, angleDiff) {
      let groupData = group.data
      let groupTempInfo = group.tempData
      let groupCenter = groupTempInfo.center
      groupData.angle = getEffectiveAngle(groupTempInfo.angle + angleDiff)

      group.children.forEach(id => {
        let rect = this._getRectById(id)
        let data = rect.data
        let tempInfo = rect.tempData
        let center = getRotatePointByCenter(groupCenter, tempInfo.center, angleDiff)
        let left = center.left - tempInfo.width / 2
        let top = center.top - tempInfo.height / 2

        data.left = left
        data.top = top

        data.angle = getEffectiveAngle(tempInfo.angle + angleDiff)
      })
    },
  }
}